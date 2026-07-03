import { NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe-client';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 },
    );
  }

  try {
    // Idempotence
    try {
      await prisma.stripeEventLog.create({
        data: { eventId: event.id, type: event.type },
      });
    } catch {
      return NextResponse.json({ received: true });
    }

    switch (event.type) {
      case 'invoice.payment_succeeded':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        const customer = (await stripe.customers.retrieve(
          customerId,
        )) as any;

        if (customer.deleted) break;

        const userId = customer.metadata.userId;
        if (!userId) break;

        const planAmount =
          subscription.items?.data[0]?.price?.unit_amount || 0;
        const interval =
          subscription.items?.data[0]?.price?.recurring?.interval || 'month';

        let mrr = 0;
        let arr = 0;

        if (interval === 'month') {
          mrr = planAmount / 100;
          arr = mrr * 12;
        } else if (interval === 'year') {
          arr = planAmount / 100;
          mrr = arr / 12;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            mrr,
            arr,
            planStatus: 'active',
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              mrr: 0,
              arr: 0,
              planStatus: 'readonly',
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook handling error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}
