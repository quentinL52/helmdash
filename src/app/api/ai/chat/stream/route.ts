import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { CoreAgent } from '@/lib/ai/core-agent';

// Autoriser jusqu'à 60 secondes pour la réponse
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    // Vérification de sécurité de base
    if (!userId) {
      return new Response('Unauthorized - Missing userId', { status: 401 });
    }

    // Instanciation de l'agent central avec l'ID utilisateur
    const agent = new CoreAgent(userId);
    
    // Récupération des outils et du prompt système
    const tools = agent.getTools();
    const systemPrompt = await agent.buildSystemPrompt();

    // Streaming de la réponse avec l'AI SDK et appel des outils (function calling)
    const result = await streamText({
      model: openai('gpt-4o'), // ou gpt-4o-mini pour tester
      system: systemPrompt,
      messages,
      tools,
      // maxSteps: 5, // Not available in all versions, removed for compatibility
    });

    return result.toTextStreamResponse ? result.toTextStreamResponse() : (result as any).toDataStreamResponse();
  } catch (error) {
    console.error('Erreur dans la route API chat:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
