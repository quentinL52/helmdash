import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
  appInfo: {
    name: 'AirH Founder OS',
    version: '0.1.0',
  },
});

export const STRIPE_PRODUCTS = {
  starter: { priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_yearly', amount: 4900, currency: 'eur', interval: 'year' },
  growth: { priceId: process.env.STRIPE_PRICE_GROWTH || 'price_growth_yearly', amount: 19900, currency: 'eur', interval: 'year' },
  scale: { priceId: process.env.STRIPE_PRICE_SCALE || 'price_scale_yearly', amount: 59900, currency: 'eur', interval: 'year' },
};

export async function createOrRetrieveCustomer({ email, userId }: { email: string; userId: string }) {
  const existingCustomers = await stripe.customers.list({ email });
  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer;
}
