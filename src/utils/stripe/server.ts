import Stripe from 'stripe';

export const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY ?? '',
    {
        // https://github.com/stripe/stripe-node#configuration
        apiVersion: '2026-01-28.clover', // using latest or specified stable logic
        appInfo: {
            name: 'Founder Dashboard',
            version: '0.1.0',
        }
    }
);
