import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { priceId } = await req.json(); // price_..._starter / growth / scale
    
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    // Créer customer Stripe si besoin
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Session Checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/settings/billing?success=true`,
      cancel_url: `${baseUrl}/settings/billing?canceled=true`,
      subscription_data: {
        trial_period_days: 14, // Reverse Trial : 14j gratuit
        metadata: { userId: user.id },
      },
      metadata: { userId: user.id, priceId },
    });
    
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
