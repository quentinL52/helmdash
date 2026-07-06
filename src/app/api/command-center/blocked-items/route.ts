import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  const blockedItems = await prisma.roadmapItem.findMany({
    where: {
      userId,
      status: { notIn: ['done'] },
      waitingOn: { not: null, not: '' }
    },
    orderBy: { createdAt: 'asc' }
  });

  return NextResponse.json(blockedItems);
}

export const GET = withAuth(handler);
