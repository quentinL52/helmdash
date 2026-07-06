import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, resolvePrice } from '@/lib/billing/stripe-client';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';
import { reserveFounderSeat } from '@/lib/billing/pricing-service';
import { PRICING_CONFIG, type Period, type PlanType } from '@/lib/billing/pricing-config';

const bodySchema = z.object({
  plan: z.enum(['core', 'complete', 'founder']),
  period: z.enum(['monthly']),
});

async function handler(req: NextRequest, { userId }: { userId: string }) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid period', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { plan, period } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.planStatus === 'active') {
    return NextResponse.json(
      { error: 'Already subscribed. Use the Stripe portal to manage.' },
      { status: 409 },
    );
  }

  const result = await prisma.$transaction(async (tx: any) => {
    let priceId = '';
    let key = '';

    if (plan === 'founder') {
      const reserved = await reserveFounderSeat(tx);
      if (!reserved) {
        return { error: 'Founder deal is sold out.', status: 400 as const };
      }
      // Assuming you have a helper to get stripe price ID like `resolvePrice` but we removed it? Let's just use the key.
      key = PRICING_CONFIG.founderDeal.price.key;
      priceId = process.env.STRIPE_PRICE_FOUNDER_MONTHLY || '';
    } else {
      const planConfig = PRICING_CONFIG.plans[plan as PlanType];
      if (!planConfig) return { error: 'Invalid plan', status: 400 as const };
      
      const priceConfig = planConfig.prices[period as Period];
      if (!priceConfig) {
        return { error: `Period ${period} not available for ${plan}`, status: 400 as const };
      }
      key = priceConfig.key;
      // We will look up price ID from env or stripe client mapping
      const { resolvePrice } = await import('@/lib/billing/stripe-client');
      priceId = resolvePrice(key as any);
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await tx.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/settings?billing=success`,
      cancel_url: `${baseUrl}/settings?billing=canceled`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: { userId: user.id, plan, period, priceKey: key },
    });

    if (plan === 'founder') {
      await tx.seatReservation.create({
        data: {
          userId: user.id,
          cohort: 'founder', // Reuse cohort string or change schema
          sessionId: checkoutSession.id,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
    }

    return { url: checkoutSession.url, plan };
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ url: result.url, plan: result.plan });
}

export const POST = withAuth(handler);
