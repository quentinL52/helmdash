import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe, resolvePrice } from '@/lib/billing/stripe-client';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/security/with-auth';
import { determineCohort } from '@/lib/billing/cohort-service';
import { getAvailablePeriods, type Period } from '@/lib/billing/cohort-config';

const bodySchema = z.object({
  period: z.enum(['monthly', 'semi_annual', 'yearly']),
});

async function handler(req: NextRequest, { userId }: { userId: string }) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid period', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { period } = parsed.data;

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
    const cohort = await determineCohort(tx);
    const availablePeriods = getAvailablePeriods(cohort);

    if (!availablePeriods.includes(period as Period)) {
      return {
        error: `Period "${period}" is not available for cohort "${cohort}". Valid: ${availablePeriods.join(', ')}`,
        status: 400 as const,
      };
    }

    const { priceId, key } = resolvePrice(cohort, period as Period);

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
      metadata: { userId: user.id, cohort, priceKey: key },
    });

    if (cohort !== 'full') {
      await tx.seatReservation.create({
        data: {
          userId: user.id,
          cohort,
          sessionId: checkoutSession.id,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
    }

    return { url: checkoutSession.url, cohort };
  });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ url: result.url, cohort: result.cohort });
}

export const POST = withAuth(handler);
