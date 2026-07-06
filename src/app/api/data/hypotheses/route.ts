import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';
import { z } from 'zod';
import { HypothesisCategory, HypothesisRisk, HypothesisStatus } from '@prisma/client';

const actionSchema = z.object({
  action: z.enum(['add', 'update', 'delete']),
  payload: z.any(),
});

async function handler(req: NextRequest, { userId }: { userId: string }) {
  try {
    if (req.method === 'GET') {
      const hypotheses = await prisma.hypothesis.findMany({ 
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ hypotheses });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { action, payload } = actionSchema.parse(body);

      switch (action) {
        case 'add':
          await prisma.hypothesis.create({
            data: {
              id: payload.id,
              userId,
              statement: payload.statement,
              category: payload.category as HypothesisCategory,
              riskLevel: payload.riskLevel as HypothesisRisk,
              testMethod: payload.testMethod,
              successCriteria: payload.successCriteria,
              deadline: payload.deadline ? new Date(payload.deadline) : null,
              cost: payload.cost,
              status: payload.status as HypothesisStatus || 'draft',
            }
          });
          break;

        case 'update':
          await prisma.hypothesis.update({
            where: { id: payload.id, userId },
            data: {
              statement: payload.statement,
              category: payload.category as HypothesisCategory,
              riskLevel: payload.riskLevel as HypothesisRisk,
              testMethod: payload.testMethod,
              successCriteria: payload.successCriteria,
              deadline: payload.deadline ? new Date(payload.deadline) : null,
              cost: payload.cost,
              measureNotes: payload.measureNotes,
              status: payload.status as HypothesisStatus,
              actualResult: payload.actualResult,
              learnings: payload.learnings,
              nextAction: payload.nextAction,
              updatedAt: new Date()
            }
          });
          break;

        case 'delete':
          await prisma.hypothesis.delete({
            where: { id: payload.id, userId }
          });
          break;

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error: any) {
    console.error('[API Data Hypotheses] Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
