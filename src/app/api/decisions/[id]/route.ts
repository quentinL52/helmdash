import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';

async function handler(
  req: NextRequest, 
  context: { userId: string; params: { id: string } }
) {
  const { userId, params } = context;
  const decisionId = params.id;

  if (req.method === 'DELETE') {
    try {
      const decision = await prisma.decision.findUnique({
        where: { id: decisionId }
      });

      if (!decision || decision.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      await prisma.decision.delete({
        where: { id: decisionId }
      });

      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const decision = await prisma.decision.findUnique({
        where: { id: decisionId }
      });

      if (!decision || decision.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const body = await req.json();
      
      const updatedDecision = await prisma.decision.update({
        where: { id: decisionId },
        data: {
          title: body.title !== undefined ? body.title : undefined,
          context: body.context !== undefined ? body.context : undefined,
          status: body.status !== undefined ? body.status : undefined,
          options: body.options !== undefined ? body.options : undefined
        }
      });

      return NextResponse.json({ decision: updatedDecision });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const DELETE = withAuth(handler);
export const PATCH = withAuth(handler);
