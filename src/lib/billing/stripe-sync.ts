import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe-client';
import { recalculateRunway } from './runway-calculator';

export async function syncStripeToFinances(stripeObject: any, eventType: string) {
  const customerId = stripeObject.customer as string;

  // Trouver user via stripeCustomerId
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.error(`User not found for Stripe customer ${customerId}`);
    return;
  }

  // 1. Récupérer les abonnements actifs
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
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

  // 3. Récupérer factures payées du mois courant pour cash flow
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const invoices = await stripe.invoices.list({
    customer: customerId,
    status: 'paid',
    created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
    limit: 100,
  });
  
  const monthlyRevenue = invoices.data.reduce((sum, inv) => sum + (inv.amount_paid || 0) / 100, 0);

  // 4. Mettre à jour MonthlyFinance (upsert)
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  await prisma.monthlyFinance.upsert({
    where: { userId_month: { userId: user.id, month: monthKey } },
    create: { userId: user.id, month: monthKey, revenue: monthlyRevenue },
    update: { revenue: monthlyRevenue },
  });

  // 5. Mettre à jour FinanceSettings (MRR, ARR, cashAvailable)
  const arr = mrr * 12;

  await prisma.user.update({
    where: { id: user.id },
    data: { mrr, arr }
  });

  await prisma.financeSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, cashAvailable: monthlyRevenue }, 
    update: { updatedAt: new Date() },
  });

  // 6. Recalculer Runway
  await recalculateRunway(user.id);
}
