import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/billing/stripe-client';
import { sendTrialEndingEmail } from '@/lib/email/email-service';

export async function handleTrialEnding(subscriptionId: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = sub.metadata.userId;
  if (!userId) return;
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  
  // Si trial se termine ET qu'il a une méthode de paiement → passer en Starter payant
  const hasPaymentMethod = sub.default_payment_method != null;

  if (hasPaymentMethod) {
    // Downgrade vers Starter (€49/an)
    const starterPrice = process.env.STRIPE_PRICE_STARTER_YEARLY;
    if (starterPrice) {
      await stripe.subscriptions.update(subscriptionId, {
        items: [{ id: sub.items.data[0].id, price: starterPrice }],
        proration_behavior: 'none',
      });
      await prisma.user.update({
        where: { id: userId },
        data: { planTier: 'starter' },
      });
    }
  } else {
    // Pas de CB → annuler l'abonnement, passer en Free
    await stripe.subscriptions.cancel(subscriptionId);
    await prisma.user.update({
      where: { id: userId },
      data: { planTier: 'free', stripeSubscriptionId: null },
    });
  }
}

// Cron job quotidien : vérifier les trials qui expirent dans 3 jours
export async function notifyTrialExpiringSoon() {
  const subscriptions = await stripe.subscriptions.list({
    status: 'trialing',
    limit: 100,
  });
  
  for (const sub of subscriptions.data) {
    if (!sub.trial_end) continue;
    const daysLeft = Math.ceil((sub.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft === 3) {
      if (sub.metadata.userId) {
        const user = await prisma.user.findUnique({
          where: { id: sub.metadata.userId },
          select: { email: true, name: true },
        });
        if (user?.email) {
          await sendTrialEndingEmail(user.email, user.name || 'Fondateur', daysLeft);
        }
      }
    }
  }
}
