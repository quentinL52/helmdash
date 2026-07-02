import { NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe-client';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/billing/webhook
 *
 * Reçoit les webhooks Stripe en temps réel.
 * Endpoint public (signé par Stripe, pas d'auth standard).
 *
 * Événements gérés :
 * - checkout.session.completed → activation abonnement
 * - customer.subscription.updated → changement de plan
 * - customer.subscription.deleted → downgrade free
 * - invoice.payment_succeeded → sync MRR/ARR
 * - invoice.payment_failed → alerte utilisateur
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 401 });
    }

    let event: ReturnType<typeof stripe.webhooks.constructEvent>;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err) {
      console.error('[Stripe Webhook] Invalid signature:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Traiter l'événement
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription;
        const priceId = session.metadata?.priceId;

        if (userId && subscriptionId) {
          // Activer l'abonnement
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: subscriptionId,
              planTier: getTierFromPriceId(priceId || ''),
            },
          });

          // Sync MRR immédiatement
          await triggerSync(userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const subUserId = subscription.metadata?.userId;

        if (subUserId) {
          const status = subscription.status;
          const items = subscription.items?.data || [];
          const price = items[0]?.price;

          if (status === 'active' || status === 'trialing') {
            await prisma.user.update({
              where: { id: subUserId },
              data: {
                planTier: getTierFromPriceId(price?.id || ''),
                stripeSubscriptionId: subscription.id,
              },
            });
          } else if (status === 'past_due' || status === 'canceled' || status === 'unpaid') {
            await prisma.user.update({
              where: { id: subUserId },
              data: { planTier: 'free', stripeSubscriptionId: null },
            });
          }

          await triggerSync(subUserId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object as any;
        const deletedUserId = deletedSub.metadata?.userId;

        if (deletedUserId) {
          await prisma.user.update({
            where: { id: deletedUserId },
            data: { planTier: 'free', stripeSubscriptionId: null },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const invUserId = invoice.metadata?.userId || invoice.subscription_details?.metadata?.userId;

        if (invUserId) {
          await triggerSync(invUserId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as any;
        const failUserId = failedInvoice.metadata?.userId || failedInvoice.subscription_details?.metadata?.userId;

        if (failUserId) {
          // Logger dans la mémoire pour alerte agent
          const { memory } = await import('@/lib/ai/memory/obsidian-memory');
          await memory.upsertNote({
            userId: failUserId,
            content: `🔴 Paiement Stripe échoué: ${failedInvoice.amount_due / 100}€ — Facture ${failedInvoice.id}`,
            type: 'insight',
            tags: ['stripe', 'payment_failed', 'alert'],
            source: 'webhook',
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}

/** Convertir un Stripe priceId en tier */
function getTierFromPriceId(priceId: string): string {
  if (priceId.includes('starter')) return 'starter';
  if (priceId.includes('growth')) return 'growth';
  if (priceId.includes('scale')) return 'scale';
  return 'free';
}

/** Déclencher une sync MRR/ARR */
async function triggerSync(userId: string) {
  try {
    const { recalculateRunway } = await import('@/lib/billing/runway-calculator');
    await recalculateRunway(userId);

    // Logger discrètement
    const { memory } = await import('@/lib/ai/memory/obsidian-memory');
    await memory.upsertNote({
      userId,
      content: `Sync Stripe automatique déclenchée suite à événement webhook (${new Date().toISOString()}).`,
      type: 'decision',
      tags: ['stripe', 'sync', 'automatic'],
      source: 'webhook',
    });
  } catch (err) {
    console.error(`[Stripe Webhook] Sync failed for ${userId}:`, err);
  }
}

export const config = {
  api: {
    bodyParser: false, // Stripe nécessite le body brut pour la vérification de signature
  },
};
