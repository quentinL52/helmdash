import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!sig || !webhookSecret) return new NextResponse('Webhook secret not found.', { status: 400 });
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = await createClient();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;
                const userId = session.client_reference_id || session.metadata?.userId;
                const planTier = session.metadata?.planTier || 'starter';

                if (userId) {
                    const { error } = await supabase.from('users').update({
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        plan_tier: planTier
                    }).eq('id', userId);
                    if (error) throw error;
                    console.log(`Successfully provisioned subscription for user ${userId}`);
                }
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                const customerId = subscription.customer as string;

                // You could map the new price ID to a specific tier, or status
                const isCanceled = subscription.status === 'canceled';

                const { error } = await supabase.from('users').update({
                    stripe_subscription_id: isCanceled ? null : subscription.id,
                    plan_tier: isCanceled ? 'free' : undefined // In real app, compute tier from price ID
                }).eq('stripe_customer_id', customerId);

                if (error) throw error;
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error: any) {
        console.error("Error processing webhook event", error);
        return new NextResponse("Webhook handler failed", { status: 500 });
    }

    return NextResponse.json({ received: true });
}
