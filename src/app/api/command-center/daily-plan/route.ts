import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';
import { z } from 'zod';

const dailyPlanSchema = z.object({
  top3: z.array(z.string()),
  snoozed: z.array(z.string()).optional(),
  shutdownAt: z.string().optional().nullable(),
});

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

async function getHandler(req: NextRequest, { userId }: { userId: string }) {
  const url = new URL(req.url);
  const dateStr = url.searchParams.get('date') || getTodayString();
  const date = new Date(dateStr);

  let plan = await prisma.dailyPlan.findUnique({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
  });

  if (!plan) {
    plan = await prisma.dailyPlan.create({
      data: {
        userId,
        date,
        top3: ['', '', ''],
      },
    });
  }

  return NextResponse.json(plan);
}

async function putHandler(req: NextRequest, { userId }: { userId: string }) {
  try {
    const body = await req.json();
    const { top3, snoozed, shutdownAt } = dailyPlanSchema.parse(body);

    const url = new URL(req.url);
    const dateStr = url.searchParams.get('date') || getTodayString();
    const date = new Date(dateStr);

    const plan = await prisma.dailyPlan.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        top3,
        snoozed: snoozed || [],
        shutdownAt: shutdownAt ? new Date(shutdownAt) : null,
      },
      create: {
        userId,
        date,
        top3,
        snoozed: snoozed || [],
        shutdownAt: shutdownAt ? new Date(shutdownAt) : null,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export const GET = withAuth(getHandler);
export const PUT = withAuth(putHandler);
