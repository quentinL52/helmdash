import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
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
    const { messages, conversationId } = await req.json();

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
    
    // Retrieve dynamic API key configuration (BYOK or fallback)
    const providerConfig = await agent.getProviderConfig();
    const customOpenai = createOpenAI({ apiKey: providerConfig.apiKey });
    const modelName = providerConfig.modelsConfig?.defaultModel || 'gpt-4o';

    // Stream with AI SDK
    const result = await streamText({
      model: customOpenai(modelName as string),
      system: systemPrompt,
      messages,
      tools,
      onError: (error) => {
        console.error('[Chat Stream] Error:', error);
      },
      onFinish: async ({ text }) => {
        try {
          const { incrementAiUsage } = await import('@/lib/ai/metering');
          await incrementAiUsage(userId);

          const { prisma } = await import('@/lib/prisma');
          const lastUserMessage = messages[messages.length - 1];
          
          if (conversationId && lastUserMessage) {
            // Upsert conversation to ensure it exists
            const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conv) {
              await prisma.conversation.create({
                data: {
                  id: conversationId,
                  userId,
                  title: lastUserMessage.content.substring(0, 50) + '...',
                }
              });
            }

            // Save the user message (unless we already saved it before streaming, but here we save it in onFinish)
            // To avoid duplicating user messages if they retry, we should check or just save the latest pair
            // Actually, we can just save both. A robust way is to just create both.
            await prisma.message.createMany({
              data: [
                { conversationId, role: lastUserMessage.role, content: lastUserMessage.content },
                { conversationId, role: 'assistant', content: text }
              ]
            });
          }
        } catch (err) {
          console.error('[Chat Stream onFinish] Error:', err);
        }
      }
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