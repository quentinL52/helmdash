import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

async function handler(req: NextRequest, { userId }: { userId: string }) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (req.method === 'POST' && action === 'run') {
    return await runSweep(userId);
  }

  // GET: just return today's sweep
  const dateStr = url.searchParams.get('date') || getTodayString();
  const date = new Date(dateStr);

  const sweep = await prisma.sweepResult.findFirst({
    where: { userId, date },
    orderBy: { id: 'desc' }
  });

  return NextResponse.json(sweep || { allClear: true, issues: [] });
}

async function runSweep(userId: string) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const issues: any[] = [];

  // 1. Unclassified Inbox items
  const inboxItems = await prisma.inboxItem.findMany({
    where: { userId, classifiedAs: null }
  });
  if (inboxItems.length > 0) {
    issues.push({
      type: 'inbox_unclassified',
      count: inboxItems.length,
      message: `${inboxItems.length} élément(s) non classé(s) dans l'Inbox.`
    });
  }

  // 2. Overdue or Today's follow-ups (Contacts) OR missing nextActionDate
  const contactsToFollowUp = await prisma.contact.findMany({
    where: {
      userId,
      status: { notIn: ['client', 'perdu'] },
      dormant: false,
      OR: [
        { nextActionDate: { lte: todayDate } },
        { nextActionDate: null }
      ]
    }
  });
  if (contactsToFollowUp.length > 0) {
    issues.push({
      type: 'contact_followup',
      count: contactsToFollowUp.length,
      message: `${contactsToFollowUp.length} contact(s) à relancer ou sans action définie.`
    });
  }

  // 3. Overdue roadmap items
  const overdueRoadmap = await prisma.roadmapItem.findMany({
    where: {
      userId,
      status: { notIn: ['done'] },
      dueDate: { lt: todayDate }
    }
  });
  if (overdueRoadmap.length > 0) {
    issues.push({
      type: 'roadmap_overdue',
      count: overdueRoadmap.length,
      message: `${overdueRoadmap.length} ticket(s) en retard.`
    });
  }

  // 4. Decisions to review
  const decisionsToReview = await prisma.decision.findMany({
    where: {
      userId,
      reviewAt: { lte: todayDate },
      status: 'decided'
    }
  });
  if (decisionsToReview.length > 0) {
    issues.push({
      type: 'decision_review',
      count: decisionsToReview.length,
      message: `${decisionsToReview.length} décision(s) à réévaluer.`
    });
  }

  const allClear = issues.length === 0;

  const sweep = await prisma.sweepResult.create({
    data: {
      userId,
      date: todayDate,
      issues,
      allClear
    }
  });

  return NextResponse.json(sweep);
}

export const GET = withAuth(handler);
export const POST = withAuth(handler);
