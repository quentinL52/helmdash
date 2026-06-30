import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { isValidUUID } from '@/lib/encryption';

const prisma = new PrismaClient();
const openai = new OpenAI();

export interface VectorSearchResult {
  id: string;
  content: string;
  type: string;
  tags: string[];
  distance: number;
}

export class VectorStore {
  /**
   * Génère un embedding pour un texte donné en utilisant OpenAI.
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 3072,
    });
    return response.data[0].embedding;
  }

  /**
   * Valide et sanitise un userId pour éviter l'injection SQL
   */
  private validateUserId(userId: string): string {
    if (!isValidUUID(userId)) {
      throw new Error('Invalid userId format');
    }
    return userId.toLowerCase();
  }

  /**
   * Recherche les notes similaires dans la base de données.
   * Sécurisé contre l'injection SQL via validation UUID stricte.
   */
  async searchSimilarNotes(
    userId: string,
    query: string,
    limit: number = 5,
    threshold: number = 0.5
  ): Promise<VectorSearchResult[]> {
    const safeUserId = this.validateUserId(userId);
    const embedding = await this.generateEmbedding(query);
    
    const vectorString = `[${embedding.join(',')}]`;

    // Requête paramétrée avec userId validé - SÉCURISÉ
    const results = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        content,
        type,
        tags,
        1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM memory_notes
      WHERE user_id = ${safeUserId}::uuid
        AND 1 - (embedding <=> ${vectorString}::vector) > ${threshold}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit};
    `;

    return results.map((r) => ({
      id: r.id,
      content: r.content,
      type: r.type,
      tags: r.tags,
      distance: r.similarity,
    }));
  }

  /**
   * Met à jour ou insère l'embedding d'une note.
   * Sécurisé via validation UUID.
   */
  async updateNoteEmbedding(noteId: string, text: string): Promise<void> {
    const safeNoteId = this.validateUserId(noteId);
    const embedding = await this.generateEmbedding(text);
    const vectorString = `[${embedding.join(',')}]`;

    await prisma.$executeRaw`
      UPDATE memory_notes
      SET embedding = ${vectorString}::vector
      WHERE id = ${safeNoteId}::uuid;
    `;
  }
}