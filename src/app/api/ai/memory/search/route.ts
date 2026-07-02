import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, withValidation } from '@/lib/security';
import { memory } from '@/lib/ai/memory/obsidian-memory';

const searchSchema = z.object({
  query: z.string().min(1).describe('Recherche textuelle ou question'),
  limit: z.number().min(1).max(50).optional().default(5),
  threshold: z.number().min(0).max(1).optional().default(0.5),
});

/**
 * POST /api/ai/memory/search
 *
 * Recherche sémantique dans la mémoire vectorielle de l'utilisateur.
 * Retourne les notes les plus pertinentes avec leur score de similarité.
 */
const handler = withAuth(
  withValidation(searchSchema)(
    async (
      req: NextRequest,
      { userId, body }: { userId: string; body: z.infer<typeof searchSchema> },
    ) => {
      try {
        const results = await memory.search(userId, body.query, {
          limit: body.limit,
          threshold: body.threshold,
        });

        return NextResponse.json({ results });
      } catch (error) {
        console.error('[Memory Search API] Error:', error);
        return NextResponse.json(
          { error: 'Failed to search memory' },
          { status: 500 },
        );
      }
    },
  ),
);

export const POST = handler;