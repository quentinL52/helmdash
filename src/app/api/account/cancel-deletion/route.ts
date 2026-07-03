import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { deletionRequestedAt: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.deletionRequestedAt) {
      return NextResponse.json({ ok: true, message: 'Deletion not requested' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletionRequestedAt: null,
        planStatus: 'trialing' // ou logic métier appropriée
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[CANCEL_DELETION_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withAuth(handler);
