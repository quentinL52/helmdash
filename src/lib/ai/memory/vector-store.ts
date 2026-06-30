import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

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
      dimensions: 3072, // Configuré dans schema.prisma
    });
    return response.data[0].embedding;
  }

  /**
   * Recherche les notes similaires dans la base de données.
   */
  async searchSimilarNotes(
    userId: string,
    query: string,
    limit: number = 5,
    threshold: number = 0.5
  ): Promise<VectorSearchResult[]> {
    const embedding = await this.generateEmbedding(query);
    
    // Convert embedding array to string formatted for pgvector
    const vectorString = `[${embedding.join(',')}]`;

    // Utilisation d'une requête brute (Raw Query) Prisma pour interroger pgvector
    // On utilise l'opérateur de distance cosinus (<=>)
    const results = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        content,
        type,
        tags,
        1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM memory_notes
      WHERE user_id = ${userId}::uuid
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
   */
  async updateNoteEmbedding(noteId: string, text: string): Promise<void> {
    const embedding = await this.generateEmbedding(text);
    const vectorString = `[${embedding.join(',')}]`;

    await prisma.$executeRaw`
      UPDATE memory_notes
      SET embedding = ${vectorString}::vector
      WHERE id = ${noteId}::uuid;
    `;
  }
}
