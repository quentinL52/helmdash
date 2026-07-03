import Stripe from 'stripe';
import type { Cohort, Period, StripePriceKey } from './cohort-config';
import { COHORT_CONFIG } from './cohort-config';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
  appInfo: {
    name: 'Helmdash',
    version: '0.2.0',
  },
});

export const STRIPE_PRICES: Record<StripePriceKey, string> = {
  founders_6m: process.env.STRIPE_PRICE_FOUNDERS_6M ?? '',
  early_6m: process.env.STRIPE_PRICE_EARLY_6M ?? '',
  early_yearly: process.env.STRIPE_PRICE_EARLY_YEARLY ?? '',
  full_monthly: process.env.STRIPE_PRICE_FULL_MONTHLY ?? '',
  full_6m: process.env.STRIPE_PRICE_FULL_6M ?? '',
  full_yearly: process.env.STRIPE_PRICE_FULL_YEARLY ?? '',
};

export function resolvePrice(
  cohort: Cohort,
  period: Period,
): { priceId: string; amount: number; key: StripePriceKey } {
  const config = COHORT_CONFIG[cohort];
  const priceEntry = config.prices[period];

  if (!priceEntry) {
    const valid = Object.keys(config.prices).join(', ');
    throw new Error(
      `Invalid period "${period}" for cohort "${cohort}". Valid: ${valid}`,
    );
  }

  const priceId = STRIPE_PRICES[priceEntry.key];
  if (!priceId) {
    throw new Error(
      `Stripe price ID not configured for ${priceEntry.key}. Set STRIPE_PRICE_${priceEntry.key.toUpperCase()} env var.`,
    );
  }

  return { priceId, amount: priceEntry.amount, key: priceEntry.key };
}
