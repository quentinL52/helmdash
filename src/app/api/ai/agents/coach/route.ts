import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeAgent } from '@/lib/ai/agent-orchestrator';
import { withAuth } from '@/lib/security/with-auth';
import { withValidation } from '@/lib/security/with-validation';
import type { ProviderName } from '@/lib/ai/provider-interface';

// Ensure the agent is registered by importing it
import '@/lib/ai/agents/founder-coach';

const schema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  context: z.object({
    hypotheses: z.object({
      total: z.number(),
      tested: z.number(),
      validated: z.number(),
    }),
    finance: z.object({
      cash: z.number(),
      runway: z.number(),
      burnRate: z.number(),
    }),
    streak: z.number(),
    okrProgress: z.number(),
    journalMoods: z.array(z.string()),
    canvasCompleteness: z.number(),
    contactsCount: z.number(),
  }),
  locale: z.enum(['fr', 'en']).optional(),
});

export const POST = withAuth(
  withValidation(schema)(async (req: NextRequest, { userId, body }) => {
    try {
      const result = await executeAgent(
        'founder-coach',
        {
          storeData: body.context as Record<string, unknown>,
          locale: body.locale || 'fr',
        },
        {
          provider: body.provider as ProviderName,
          model: body.model,
        },
      );

      if (result.status === 'error') {
        return NextResponse.json(result, { status: 500 });
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error('[Coach API Route] Error:', error);
      return NextResponse.json(
        { error: 'Internal server error while executing founder coach.' },
        { status: 500 },
      );
    }
  }),
);
