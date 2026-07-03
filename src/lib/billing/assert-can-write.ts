import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function assertCanWrite(
  userId: string,
): Promise<NextResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planStatus: true },
  });

  if (!user || user.planStatus === 'readonly') {
    return NextResponse.json(
      { error: 'subscription_required' },
      { status: 403 },
    );
  }

  return null;
}
