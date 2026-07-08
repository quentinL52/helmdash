import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth, withValidation } from '@/lib/security';
import { executeAgent } from '@/lib/ai/agent-orchestrator';
import type { ProviderName } from '@/lib/ai/provider-interface';
import { assertQuota, recordAiAction } from '@/lib/billing/metering';

// Ensure the agent is registered by importing it
import '@/lib/ai/agents/founder-coach';

const coachSchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'gemini', 'mistral']),
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

const handler = withAuth(
  withValidation(coachSchema)(
    async (
      req: NextRequest,
      { userId, body }: { userId: string; body: z.infer<typeof coachSchema> },
    ) => {
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
    },
  ),
);

export const POST = handler;