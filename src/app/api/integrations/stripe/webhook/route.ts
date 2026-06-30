import { NextResponse } from 'next/server';
import { stripe } from '@/lib/billing/stripe-client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        // Retrieve customer to get userId from metadata
        const customer = await stripe.customers.retrieve(customerId) as any;
        
        if (customer.deleted) {
          break;
        }

        const userId = customer.metadata.userId;
        
        if (!userId) {
          console.warn(`No userId found in customer metadata for customer ${customerId}`);
          break;
        }

        // Calculate MRR/ARR based on subscription
        const planAmount = subscription.items?.data[0]?.price?.unit_amount || 0;
        const interval = subscription.items?.data[0]?.price?.recurring?.interval || 'month';
        
        let mrr = 0;
        let arr = 0;
        
        if (interval === 'month') {
          mrr = planAmount / 100;
          arr = mrr * 12;
        } else if (interval === 'year') {
          arr = planAmount / 100;
          mrr = arr / 12;
        }

        let planTier = 'starter';
        const priceId = subscription.items?.data[0]?.price?.id;
        if (priceId === process.env.STRIPE_PRICE_GROWTH || priceId === 'price_growth_yearly') {
          planTier = 'growth';
        } else if (priceId === process.env.STRIPE_PRICE_SCALE || priceId === 'price_scale_yearly') {
          planTier = 'scale';
        } else if (priceId === process.env.STRIPE_PRICE_STARTER || priceId === 'price_starter_yearly') {
          planTier = 'starter';
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            mrr,
            arr,
            planTier,
          },
        });

        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;
        
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId }
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              mrr: 0,
              arr: 0,
              planTier: 'free',
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook handling error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
