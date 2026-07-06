import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';
import { z } from 'zod';
import { generateOnboardingAck, checkBudget } from '@/lib/ai/onboarding-agent';

const answerSchema = z.object({
  step: z.number().int().min(1).max(6),
  answer: z.string()
});

async function handler(req: NextRequest, { userId }: { userId: string }) {
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { step, answer } = answerSchema.parse(body);

      const session = await prisma.onboardingSession.findUnique({ where: { userId } });
      if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

      const answers = (session.answers as Record<string, string>) || {};
      answers[`q${step}`] = answer;

      let ack = "Got it. Let's move on.";
      const useLlmAck = process.env.ONBOARDING_ACKS === 'llm';

      if (useLlmAck && answer.trim().length > 0) {
        const budgetOk = await checkBudget(userId);
        if (budgetOk) {
          try {
            ack = await generateOnboardingAck(step, answer, userId);
          } catch (e) {
            console.error("[API Onboarding Answer] LLM ACK failed", e);
          }
        }
      } else if (!useLlmAck) {
          const templates = [
              "Interesting. Let's dig deeper.",
              "That's clear. Next question.",
              "Got it. Moving on.",
              "Understood.",
              "Great vision.",
              "Thanks for sharing. Let's wrap this up."
          ];
          ack = templates[step - 1] || "Got it.";
      }

      // If re-answering a previous question, don't advance the global step
      const nextStep = step === session.currentStep ? step + 1 : session.currentStep;
      const status = nextStep > 6 ? 'recap' : 'in_progress';

      const updatedSession = await prisma.onboardingSession.update({
        where: { userId },
        data: {
          answers,
          currentStep: nextStep,
          status
        }
      });

      return NextResponse.json({ ack, nextStep: updatedSession.currentStep, session: updatedSession });
    } catch (e: any) {
      console.error('[API Onboarding Answer] Error:', e);
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = withAuth(handler);
