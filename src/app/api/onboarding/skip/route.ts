import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  if (req.method === 'POST') {
    try {
      const updatedSession = await prisma.onboardingSession.update({
        where: { userId },
        data: {
          status: 'skipped'
        }
      });
      return NextResponse.json({ ok: true, session: updatedSession });
    } catch (e: any) {
      console.error('[API Onboarding Skip] Error:', e);
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = withAuth(handler);
