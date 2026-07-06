import { prisma } from '@/lib/prisma';
import { PRICING_CONFIG, type PlanType } from '@/lib/billing/pricing-config';

export async function checkAiLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, founderDeal: true }
  });

  if (!user || !user.plan) {
    return { allowed: false, remaining: 0 };
  }

  // Founder deal or complete plan have their own limits
  const isComplete = user.plan === 'complete' || user.founderDeal;
  const isCore = user.plan === 'core' && !user.founderDeal;

  if (isCore) {
    // Core plan uses BYOK, no limit from our side
    return { allowed: true, remaining: Infinity };
  }

  if (!isComplete) {
    return { allowed: false, remaining: 0 };
  }

  const limit = PRICING_CONFIG.plans.complete.limits.aiActions;
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const usage = await prisma.aiUsage.findUnique({
    where: {
      userId_month: {
        userId,
        month: currentMonth
      }
    }
  });

  const count = usage?.count || 0;
  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count)
  };
}

export async function incrementAiUsage(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, founderDeal: true }
  });

  if (!user || (!user.founderDeal && user.plan !== 'complete')) {
    // Core users BYOK don't need tracking of our AI quota
    return;
  }

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const limit = PRICING_CONFIG.plans.complete.limits.aiActions;

  await prisma.aiUsage.upsert({
    where: {
      userId_month: {
        userId,
        month: currentMonth
      }
    },
    update: {
      count: { increment: 1 }
    },
    create: {
      userId,
      month: currentMonth,
      count: 1,
      limit
    }
  });
}
