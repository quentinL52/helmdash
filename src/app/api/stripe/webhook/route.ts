import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { syncStripeToFinances } from '@/lib/billing/stripe-sync';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }
  
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
  
  // Traiter les événements critiques
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncStripeToFinances(event.data.object, event.type);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Error processing webhook ${event.type}:`, err);
    // Return 200 to prevent Stripe from retrying endlessly for logical errors we can't fix here
  }
  
  return NextResponse.json({ received: true });
}
