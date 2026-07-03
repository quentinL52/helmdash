import { NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe-client';
import { prisma } from '@/lib/prisma';
import {
  incrementTotal,
  releaseSeat,
} from '@/lib/billing/cohort-service';
import { computeLockedUntil } from '@/lib/billing/cohort-service';
import type { Cohort } from '@/lib/billing/cohort-config';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 401 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 },
    );
  }

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[Stripe Webhook] Invalid signature:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotence
  try {
    await prisma.stripeEventLog.create({
      data: { eventId: event.id, type: event.type },
    });
  } catch {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId as string | undefined;
        const cohort = session.metadata?.cohort as Cohort | undefined;
        const subscriptionId = session.subscription as string | undefined;

        if (!userId || !cohort || !subscriptionId) break;

        await prisma.$transaction(async (tx: any) => {
          // Delete the seat reservation
          await tx.seatReservation
            .deleteMany({ where: { sessionId: session.id } });

          const cohortRank = await incrementTotal(tx);
          const cohortLockedUntil = computeLockedUntil(cohort);

          await tx.user.update({
            where: { id: userId },
            data: {
              planStatus: 'active',
              cohort,
              cohortRank,
              cohortLockedUntil,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: session.customer as string,
            },
          });
        });
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as any;
        const sessionId = session.id as string;

        const reservation = await prisma.seatReservation.findUnique({
          where: { sessionId },
        });

        if (reservation) {
          await prisma.$transaction(async (tx: any) => {
            await tx.seatReservation.delete({ where: { sessionId } });
            if (
              reservation.cohort === 'founders' ||
              reservation.cohort === 'early'
            ) {
              await releaseSeat(tx, reservation.cohort);
            }
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId as string | undefined;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { planStatus: 'readonly' },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const userId =
          (invoice.metadata?.userId as string | undefined) ||
          (invoice.subscription_details?.metadata?.userId as
            | string
            | undefined);

        if (userId) {
          console.warn(
            `[Stripe Webhook] Payment failed for user ${userId}, invoice ${invoice.id}`,
          );
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
