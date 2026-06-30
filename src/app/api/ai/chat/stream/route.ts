import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { CoreAgent } from '@/lib/ai/core-agent';

// Rate limiter: 10 requêtes par minute par utilisateur
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ratelimit:chat',
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    // Validation basique
    if (!userId) {
      return new Response('Unauthorized - Missing userId', { status: 401 });
    }

    // Rate limiting
    const { success, limit, remaining, reset } = await ratelimit.limit(userId);
    
    if (!success) {
      return new Response(
        JSON.stringify({ 
          error: 'Too Many Requests', 
          message: 'Rate limit exceeded. Please wait before sending more messages.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        }),
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // Instanciation de l'agent central
    const agent = new CoreAgent(userId);
    const tools = agent.getTools();
    const systemPrompt = await agent.buildSystemPrompt();

    // Streaming avec l'AI SDK
    const result = await streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      tools,
      // maxSteps: 5, // Temporairement désactivé pour compatibilité types
      onError: (error) => {
        console.error('[Chat Stream] Error:', error);
      },
    });

    // Réponse avec headers de rate limit
    const response = result.toTextStreamResponse();
    
    // Ajouter headers rate limit à la réponse
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());

    return response;
    
  } catch (error) {
    console.error('Erreur dans la route API chat:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}