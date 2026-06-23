import { NextResponse } from 'next/server';
import { executeAgent } from '@/lib/ai/agent-orchestrator';
import type { ProviderName } from '@/lib/ai/provider-interface';

// Ensure the agent is registered by importing it
import '@/lib/ai/agents/founder-coach';

interface CoachRequest {
  provider: ProviderName;
  model: string;
  apiKey: string;
  context: {
    hypotheses: { total: number; tested: number; validated: number };
    finance: { cash: number; runway: number; burnRate: number };
    streak: number;
    okrProgress: number;
    journalMoods: string[];
    canvasCompleteness: number;
    contactsCount: number;
  };
  locale?: 'fr' | 'en';
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<CoachRequest>;

    if (!body.provider || !body.model || !body.apiKey || !body.context) {
      return NextResponse.json(
        { error: 'Missing required fields (provider, model, apiKey, context)' },
        { status: 400 }
      );
    }

    const result = await executeAgent(
      'founder-coach',
      {
        storeData: body.context as Record<string, unknown>,
        locale: body.locale || 'fr',
      },
      {
        provider: body.provider,
        model: body.model,
        apiKey: body.apiKey,
      }
    );

    if (result.status === 'error') {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Coach API Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while executing founder coach.' },
      { status: 500 }
    );
  }
}
