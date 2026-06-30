import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId, forceFullSync } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe et a un customer Stripe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, planTier: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ 
        message: 'No Stripe customer linked', 
        synced: { customers: 0, subscriptions: 0, invoices: 0 } 
      });
    }

    // Import stripe pour récupérer les données
    const { stripe } = await import('@/lib/stripe/server');

    // 1. Récupérer les abonnements actifs
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
    });

    // 2. Calculer MRR
    let mrr = 0;
    for (const sub of subscriptions.data) {
      for (const item of sub.items.data) {
        const price = item.price;
        if (price.recurring?.interval === 'month') {
          mrr += (price.unit_amount || 0) / 100 * (item.quantity || 1);
        } else if (price.recurring?.interval === 'year') {
          mrr += ((price.unit_amount || 0) / 100 * (item.quantity || 1)) / 12;
        }
      }
    }

    // 3. Récupérer factures payées du mois courant
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      status: 'paid',
      created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
      limit: 100,
    });
    
    const monthlyRevenue = invoices.data.reduce((sum: number, inv: { amount_paid?: number }) => sum + (inv.amount_paid || 0) / 100, 0);

    // 4. Mettre à jour MonthlyFinance (upsert)
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await prisma.monthlyFinance.upsert({
      where: { userId_month: { userId, month: monthKey } },
      create: {
        userId,
        month: monthKey,
        revenue: monthlyRevenue,
        notes: forceFullSync ? 'Full sync from Stripe' : 'Monthly sync from Stripe',
      },
      update: {
        revenue: monthlyRevenue,
        notes: forceFullSync ? 'Full sync from Stripe' : 'Monthly sync from Stripe',
        updatedAt: new Date(),
      },
    });

    // 5. Mettre à jour user MRR/ARR
    await prisma.user.update({
      where: { id: userId },
      data: { mrr, arr: mrr * 12 },
    });

    // 6. Recalculer runway
    const { recalculateRunway } = await import('@/lib/billing/runway-calculator');
    await recalculateRunway(userId);

    return NextResponse.json({
      success: true,
      message: 'Sync Stripe terminé avec succès',
      synced: {
        customers: 1,
        subscriptions: subscriptions.data.length,
        invoices: invoices.data.length,
        mrr,
        monthlyRevenue,
      },
    });
  } catch (error) {
    console.error('[API /billing/stripe/sync] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}