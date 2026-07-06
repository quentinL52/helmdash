import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const contactsToFollowUp = await prisma.contact.findMany({
    where: {
      userId,
      status: { notIn: ['client', 'perdu'] },
      dormant: false,
      OR: [
        { nextActionDate: { lte: todayDate } },
        { nextActionDate: null }
      ]
    },
    orderBy: { nextActionDate: 'asc' },
    take: 10
  });

  return NextResponse.json(contactsToFollowUp);
}

export const GET = withAuth(handler);
