import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { subAgentRegistry } from '@/lib/ai/sub-agents/registry';
import { SubAgentContext } from '@/lib/ai/sub-agents/base-agent';

// Use UPSTASH_REDIS_URL which is the Redis URI (rediss://...)
// Note: BullMQ requires a standard Redis connection (ioredis), not the HTTP REST client.
const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const subAgentQueue = new Queue('sub-agent-tasks', {
  connection: connection as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
});

export interface SubAgentJobData {
  taskId: string;
  userId: string;
  agentRole: string;
  taskObjective: string;
  context?: Record<string, any>;
  constraints?: {
    budget?: number;
    deadline?: string;
    allowedTools?: string[];
  };
  successCriteria: string[];
}

// Worker function (can be run in a custom server or standalone process)
export function startSubAgentWorker() {
  const worker = new Worker('sub-agent-tasks', async (job: Job<SubAgentJobData>) => {
    const { taskId, userId, agentRole, taskObjective, context, constraints, successCriteria } = job.data;
    
    try {
      // Mettre à jour le statut en cours
      await updateTaskStatus(taskId, 'running');
      
      // Construire le contexte pour le sous-agent
      const agentContext: SubAgentContext = {
        userId,
        taskObjective,
        context,
        constraints,
        successCriteria,
      };
      
      // Exécuter le sous-agent via le registry
      const result = await subAgentRegistry.spawn(agentRole as any, agentContext);
      
      // Sauvegarder le résultat
      await saveTaskResult(taskId, result);
      await updateTaskStatus(taskId, result.status);
      
      return { success: true, taskId, status: result.status, deliverables: result.deliverables.length };
    } catch (error) {
      console.error(`Sub-agent job ${job.id} failed:`, error);
      await updateTaskStatus(taskId, 'failed');
      await saveTaskError(taskId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, { 
    connection: connection as any, 
    concurrency: 2 
  });

  worker.on('failed', (job, err) => {
    console.error(`Sub-agent job ${job?.id} failed with error:`, err?.message);
  });

  return worker;
}

// Fonction pour traiter la queue depuis un cron job
export async function processSubAgentQueue() {
  const maxJobs = 10;
  const processed: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < maxJobs; i++) {
    const job = await subAgentQueue.getNextJob();
    if (!job) break;

    try {
      await job.process();
      processed.push(job.id || 'unknown');
    } catch (error) {
      failed.push(job.id || 'unknown');
      console.error(`Failed to process job ${job.id}:`, error);
    }
  }

  return { processed: processed.length, failed: failed.length, processedIds: processed, failedIds: failed };
}

// Helpers pour persistence (à implémenter avec Prisma model Task ou table dédiée)

async function updateTaskStatus(taskId: string, status: string) {
  // TODO: Implémenter avec Prisma model AgentTask
  console.log(`[SubAgentQueue] Task ${taskId} status: ${status}`);
}

async function saveTaskResult(taskId: string, result: any) {
  // TODO: Implémenter avec Prisma model AgentTask
  console.log(`[SubAgentQueue] Task ${taskId} result:`, result.status);
}

async function saveTaskError(taskId: string, error: string) {
  // TODO: Implémenter avec Prisma model AgentTask
  console.log(`[SubAgentQueue] Task ${taskId} error:`, error);
}