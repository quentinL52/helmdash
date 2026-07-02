import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { CoreAgent } from '@/lib/ai/core-agent';
import { withAuth, withRateLimit } from '@/lib/security';

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
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
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
      onError: (error) => {
        console.error('[Chat Stream] Error:', error);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in chat stream route:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

// Wrap with auth + rate limit (30 req/min per user, scope "chat-stream")
export const POST = withAuth(withRateLimit(handler, { rpm: 30, scope: 'chat-stream' }));