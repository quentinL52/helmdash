import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';
import { PRICING_CONFIG } from '@/lib/billing/pricing-config';

async function handler(req: NextRequest, { userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, founderDeal: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isComplete = user.plan === 'complete' || user.founderDeal;
  if (!isComplete) {
    // If not complete, they either have unlimited BYOK or no access. 
    // We just return no usage tracking for UI.
    return NextResponse.json({
      tracked: false
    });
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const limit = PRICING_CONFIG.plans.complete.limits.aiActions;

  const usages = await prisma.aiUsage.findMany({
    where: {
      userId,
      month: currentMonth
    }
  });

  const count = usages.reduce((acc, u) => acc + (u.actions || 0), 0);
  
  return NextResponse.json({
    tracked: true,
    count,
    limit,
    percentage: Math.round((count / limit) * 100),
    remaining: Math.max(0, limit - count)
  });
}

export const GET = withAuth(handler);
