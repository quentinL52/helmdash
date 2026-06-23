import { NextResponse } from 'next/server';
import { executeAgent } from '@/lib/ai/agent-orchestrator';
import type { ProviderName } from '@/lib/ai/provider-interface';

// Ensure the agent is registered
import '@/lib/ai/agents/relationship-manager';

interface CrmRequest {
  provider: ProviderName;
  model: string;
  apiKey: string;
  context: {
    contacts: any[];
    projectPhase: string;
    goToMarket: { ompTarget?: string };
    userInstruction?: string;
  };
  locale?: 'fr' | 'en';
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as Partial<CrmRequest>;

    if (!body.provider || !body.model || !body.apiKey || !body.context) {
      return NextResponse.json(
        { error: 'Missing required fields (provider, model, apiKey, context)' },
        { status: 400 }
      );
    }

    const result = await executeAgent(
      'relationship-manager',
      {
        storeData: body.context as Record<string, unknown>,
        userInstruction: body.context.userInstruction,
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
    console.error('[CRM API Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while executing relationship manager.' },
      { status: 500 }
    );
  }
}
