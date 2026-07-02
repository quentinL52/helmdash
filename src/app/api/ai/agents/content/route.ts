import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeAgent } from '@/lib/ai/agent-orchestrator';
import { withAuth } from '@/lib/security/with-auth';
import { withValidation } from '@/lib/security/with-validation';
import type { ProviderName } from '@/lib/ai/provider-interface';

// Ensure the agent is registered
import '@/lib/ai/agents/content-creator';

const schema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  context: z.object({
    leanCanvas: z.record(z.string()),
    goToMarket: z.object({
      sbHero: z.string().optional(),
      sbProblem: z.string().optional(),
      ompTarget: z.string().optional(),
      ompMessage: z.string().optional(),
    }),
    existingContent: z.array(
      z.object({
        title: z.string(),
        type: z.string(),
      }),
    ),
    founderProfile: z
      .object({
        linkedinUrl: z.string(),
        writingStyleContext: z.string(),
        displayName: z.string(),
        niche: z.string(),
      })
      .optional(),
    userInstruction: z.string().optional(),
  }),
  locale: z.enum(['fr', 'en']).optional(),
});

export const POST = withAuth(
  withValidation(schema)(async (req: NextRequest, { userId, body }) => {
    try {
      const result = await executeAgent(
        'content-creator',
        {
          storeData: body.context as Record<string, unknown>,
          userInstruction: body.context.userInstruction,
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
      console.error('[Content API Route] Error:', error);
      return NextResponse.json(
        { error: 'Internal server error while executing content creator.' },
        { status: 500 },
      );
    }
  }),
);
