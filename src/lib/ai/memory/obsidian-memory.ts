import { PrismaClient } from '@prisma/client';
import { VectorStore } from './vector-store';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI();
const vectorStore = new VectorStore();

export interface Entity {
  name: string;
  type: string;
  description: string;
}

export interface SearchOpts {
  limit?: number;
  threshold?: number;
}

export class ObsidianMemory {
  /**
   * Extrait des entités à partir d'un texte.
   */
  async extractEntities(text: string): Promise<Entity[]> {
    const prompt = `Extrait les entités principales (Concept, Personne, Projet, Décision, Insight) de ce texte. 
Format JSON strict sous la forme: {"entities": [{"name": "...", "type": "...", "description": "..."}]}.
Texte: ${text}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    try {
      const parsed = JSON.parse(completion.choices[0].message.content || '{"entities": []}');
      return parsed.entities || [];
    } catch (e) {
      console.error("Erreur d'extraction d'entités", e);
      return [];
    }
  }

  /**
   * Crée ou met à jour une note dans la mémoire et génère son embedding.
   */
  async upsertNote(data: {
    id?: string;
    userId: string;
    content: string;
    type: 'journal' | 'decision' | 'insight' | 'meeting' | 'research' | 'template';
    tags?: string[];
    links?: string[];
    source?: 'user' | 'agent' | 'import' | 'webhook';
  }): Promise<void> {
    const entities = await this.extractEntities(data.content);

    const note = await prisma.memoryNote.upsert({
      where: { id: data.id || 'new-uuid-that-doesnt-exist' }, // Will always create if no id
      create: {
        ...(data.id && { id: data.id }),
        userId: data.userId,
        content: data.content,
        type: data.type,
        tags: data.tags || [],
        links: data.links || [],
        entities: entities as any,
        source: data.source || 'agent',
      },
      update: {
        content: data.content,
        type: data.type,
        tags: data.tags,
        links: data.links,
        entities: entities as any,
        updatedAt: new Date(),
      },
    });

    // Mettre à jour l'embedding dans un processus asynchrone (ou synchrone selon le besoin)
    await vectorStore.updateNoteEmbedding(note.id, data.content);
  }

  /**
   * Recherche sémantique dans la mémoire.
   */
  async search(userId: string, query: string, opts?: SearchOpts): Promise<any[]> {
    return await vectorStore.searchSimilarNotes(
      userId, 
      query, 
      opts?.limit, 
      opts?.threshold
    );
  }

  /**
   * Construit une fenêtre de contexte optimisée à partir d'un topic.
   */
  async buildContextWindow(userId: string, topic: string, maxTokens: number = 4000): Promise<string> {
    const notes = await this.search(userId, topic, { limit: 10, threshold: 0.5 });
    
    // Simplification : on concatène le contenu jusqu'à atteindre une limite approximative
    let context = `Contexte pour "${topic}":\n\n`;
    let estimatedTokens = 0;

    for (const note of notes) {
      const noteTokens = note.content.length / 4; // Approximation très basique
      if (estimatedTokens + noteTokens > maxTokens) {
        break;
      }
      context += `--- Note (Type: ${note.type}) ---\n${note.content}\n\n`;
      estimatedTokens += noteTokens;
    }

    return context;
  }
}

export const memory = new ObsidianMemory();
