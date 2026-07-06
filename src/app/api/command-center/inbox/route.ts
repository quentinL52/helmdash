import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';
import { z } from 'zod';

const inboxSchema = z.object({
  content: z.string().min(1),
  classifiedAs: z.string().optional(),
});

async function postHandler(req: NextRequest, { userId }: { userId: string }) {
  try {
    const body = await req.json();
    const { content, classifiedAs } = inboxSchema.parse(body);

    const item = await prisma.inboxItem.create({
      data: {
        userId,
        content,
        classifiedAs,
        classifiedAt: classifiedAs ? new Date() : null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

async function getHandler(req: NextRequest, { userId }: { userId: string }) {
  const url = new URL(req.url);
  const unclassifiedOnly = url.searchParams.get('unclassified') === 'true';

  const items = await prisma.inboxItem.findMany({
    where: {
      userId,
      ...(unclassifiedOnly ? { classifiedAs: null } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(items);
}

export const POST = withAuth(postHandler);
export const GET = withAuth(getHandler);
