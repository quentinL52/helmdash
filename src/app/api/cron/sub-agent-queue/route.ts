import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processSubAgentQueue } from '@/lib/queue/sub-agent-queue';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  // Vérification sécurité cron
  const authHeader = req.headers.get('Authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Traiter la queue des sous-agents
    const results = await processSubAgentQueue();

    return NextResponse.json({
      success: true,
      message: `Sub-agent queue processed: ${results.processed} jobs, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    console.error('[Cron Sub-Agent Queue] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}