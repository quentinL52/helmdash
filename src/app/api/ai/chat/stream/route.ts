import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { CoreAgent } from '@/lib/ai/core-agent';
import { withAuth, withRateLimit } from '@/lib/security';
import { assertQuota, recordAiAction } from '@/lib/billing/metering';

export const maxDuration = 60;

/**
 * POST /api/ai/chat/stream
 *
 * Streams AI responses with full tool access.
 * Authenticated via Supabase session — userId is NEVER read from the client body.
 * Rate-limited to 30 req/min/user.
 */
async function handler(
  req: NextRequest,
  { userId }: { userId: string },
) {
  try {
        try {
            await assertQuota(userId);
        } catch (e: any) {
            if (e.code === 'quota_reached') {
                return NextResponse.json({ code: 'quota_reached', error: 'AI actions limit reached for this month.' }, { status: 403 });
            }
            throw e;
        }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 },
      );
    }

    // Instantiate the core agent with the authenticated userId
    const agent = new CoreAgent(userId);
    const tools = agent.getTools();
    const systemPrompt = await agent.buildSystemPrompt();

    // Stream with AI SDK
    const result = await streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      tools,
      onFinish: async ({ usage }) => {
        await recordAiAction(userId, 'chat-stream', usage?.totalTokens || 0, 'gpt-4o').catch(console.error);
      },
      onError: (error) => {
        console.error('[Chat Stream] Error:', error);
      },
    });

    return result.toTextStreamResponse() as unknown as NextResponse;
  } catch (error) {
    console.error('Error in chat stream route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

// Wrap with auth + rate limit (30 req/min per user, scope "chat-stream")
export const POST = withAuth(withRateLimit(handler, { rpm: 30, scope: 'chat-stream' }));