import { NextResponse } from 'next/server';
import { syncStripeToFinances } from '@/lib/billing/stripe-sync';
import { prisma } from '@/lib/prisma';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  if (!CRON_SECRET) return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  // Vérification sécurité cron
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Récupérer tous les utilisateurs avec Stripe configuré
    const users = await prisma.user.findMany({
      where: {
        stripeCustomerId: { not: null },
      },
      select: { id: true, stripeCustomerId: true },
    });

    const results: PromiseSettledResult<{ userId: string; status: string }>[] = await Promise.allSettled(
      users.map(async (user: { id: string; stripeCustomerId: string | null }) => {
        // Appeler la fonction de sync existante
        const stripeCustomerRef = { customer: user.stripeCustomerId };
        await syncStripeToFinances(stripeCustomerRef, 'cron.sync');
        return { userId: user.id, status: 'synced' as const };
      })
    );

    const successful = results.filter((r: PromiseSettledResult<{ userId: string; status: string }>) => r.status === 'fulfilled').length;
    const failed = results.filter((r: PromiseSettledResult<{ userId: string; status: string }>) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: `Stripe sync completed: ${successful} succeeded, ${failed} failed`,
      results,
    });
  } catch (error) {
    console.error('[Cron Stripe Sync] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}