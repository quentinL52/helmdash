import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';
import { generateText } from 'ai';
import { mistral } from '@ai-sdk/mistral';

async function handler(
  req: NextRequest, 
  context: { userId: string; params: { id: string } }
) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { userId, params } = context;
  const decisionId = params.id;

  try {
    const decision = await prisma.decision.findUnique({
      where: { id: decisionId }
    });

    if (!decision || decision.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let aiFeedback = '';
    
    // Check if API key is provided
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      aiFeedback = "⚠️ Mode dégradé : Aucune clé API Mistral détectée. Le sparring partner est indisponible, mais vous pouvez toujours analyser vous-même votre décision.";
    } else {
      try {
        const prompt = `En tant qu'AI co-fondateur (sparring partner), challenge la décision suivante.
Sois direct, pragmatique et incisif. Identifie les risques cachés, les biais cognitifs possibles, et propose une alternative si pertinent.

Titre de la décision : ${decision.title}
Contexte : ${decision.context || 'Aucun contexte fourni.'}
Options : ${decision.options ? JSON.stringify(decision.options) : 'Non définies.'}

Ta réponse doit être courte (2-3 paragraphes max).`;

        const { text } = await generateText({
          model: mistral('mistral-small-latest'),
          system: "You are Helmdash, a pragmatic and critical AI co-founder. Challenge decisions sharply and constructivly.",
          prompt,
          temperature: 0.7,
        });

        aiFeedback = text;
      } catch (err) {
        console.error('[Decision Challenge] LLM Error:', err);
        aiFeedback = "⚠️ Erreur de l'IA lors de l'analyse. Mode dégradé activé. Essayez plus tard.";
      }
    }

    const updatedDecision = await prisma.decision.update({
      where: { id: decisionId },
      data: {
        aiFeedback,
        status: 'challenged'
      }
    });

    return NextResponse.json({ decision: updatedDecision });

  } catch (e: any) {
    console.error('[Decision Challenge] Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export const POST = withAuth(handler);
