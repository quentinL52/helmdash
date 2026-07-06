import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security';
import AdmZip from 'adm-zip';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        aiUsage: true,
        planConfig: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const decisions = await prisma.decision.findMany({ where: { userId } });
    const hypotheses = await prisma.hypothesis.findMany({ where: { userId } });
    const contacts = await prisma.contact.findMany({ where: { userId } });
    const tasks = await prisma.task.findMany({ where: { userId } });
    const financialEntries = await prisma.financialEntry.findMany({ where: { userId } });
    const interactions = await prisma.interaction.findMany({ where: { userId } });
    const dailyPlans = await prisma.dailyPlan.findMany({ where: { userId } });
    const inboxItems = await prisma.inboxItem.findMany({ where: { userId } });
    const sweepResults = await prisma.sweepResult.findMany({ where: { userId } });
    const journals = await prisma.journalEntry.findMany({ where: { userId } });

    const zip = new AdmZip();

    // Export as JSON
    zip.addFile('user_profile.json', Buffer.from(JSON.stringify(user, null, 2)));
    zip.addFile('decisions.json', Buffer.from(JSON.stringify(decisions, null, 2)));
    zip.addFile('hypotheses.json', Buffer.from(JSON.stringify(hypotheses, null, 2)));
    zip.addFile('contacts.json', Buffer.from(JSON.stringify(contacts, null, 2)));
    zip.addFile('tasks_roadmap.json', Buffer.from(JSON.stringify(tasks, null, 2)));
    zip.addFile('financial_entries.json', Buffer.from(JSON.stringify(financialEntries, null, 2)));
    zip.addFile('interactions.json', Buffer.from(JSON.stringify(interactions, null, 2)));
    zip.addFile('daily_plans.json', Buffer.from(JSON.stringify(dailyPlans, null, 2)));
    zip.addFile('inbox_items.json', Buffer.from(JSON.stringify(inboxItems, null, 2)));
    zip.addFile('sweep_results.json', Buffer.from(JSON.stringify(sweepResults, null, 2)));
    zip.addFile('journals.json', Buffer.from(JSON.stringify(journals, null, 2)));

    // Generate buffer
    const zipBuffer = zip.toBuffer();

    const response = new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="helmdash-export-${new Date().toISOString().split('T')[0]}.zip"`
      }
    });

    return response;
  } catch (e: any) {
    console.error('[Export Error]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export const GET = withAuth(handler);
