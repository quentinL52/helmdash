import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { extractAndSaveGraphData } from '@/lib/ai/memory/knowledge-graph';
import { prisma } from '@/lib/prisma';
import { VectorStore } from '@/lib/ai/memory/vector-store';

const vectorStore = new VectorStore();

// Use UPSTASH_REDIS_URL which is the Redis URI (rediss://...) 
// Note: BullMQ requires a standard Redis connection (ioredis), not the HTTP REST client.
const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const memoryQueue = new Queue('memory-extract-entities', {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export interface ExtractEntitiesJob {
  noteId: string;
  userId: string;
  content: string;
  type: string;
}

// Worker function (can be run in a custom server or standalone process)
export function startMemoryWorker() {
  const worker = new Worker('memory-extract-entities', async (job: Job<ExtractEntitiesJob>) => {
    const { noteId, userId, content, type } = job.data;
    
    try {
      // 1. Appel LLM pour extraction (seul endroit où c'est acceptable d'attendre)
      const graphData = await extractAndSaveGraphData(userId, content);
      
      // 2. MAJ DB avec entités
      await updateNoteEntities(noteId, graphData.nodes);
      
      // 3. Mettre à jour l'embedding
      await vectorStore.updateNoteEmbedding(noteId, content);
      
      return { success: true, entitiesCount: graphData.nodes.length };
    } catch (error) {
      console.error(`Failed to process job ${job.id} for note ${noteId}:`, error);
      throw error;
    }
  }, { 
    connection: connection as any, 
    concurrency: 2 
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}

// Helpers 

async function updateNoteEntities(noteId: string, entities: any[]) {
  return prisma.memoryNote.update({
    where: { id: noteId },
    data: { 
      entities: entities as any
    }
  });
}
