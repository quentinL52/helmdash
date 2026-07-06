import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  if (req.method === 'GET') {
    try {
      const decisions = await prisma.decision.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });
      return NextResponse.json({ decisions });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { title, context } = body;
      
      if (!title) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      const decision = await prisma.decision.create({
        data: {
          userId,
          title,
          context,
          status: 'pending'
        }
      });
      return NextResponse.json({ decision });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
