export type PlanType = 'core' | 'complete';
export type Period = 'monthly' | 'yearly';
export type PlanStatus = 'trialing' | 'active' | 'readonly';

export type StripePriceKey =
  | 'founder_monthly'
  | 'core_monthly'
  | 'complete_monthly'
  | 'core_yearly'
  | 'complete_yearly';

export interface PlanLimitConfig {
  aiActions: number; // 0 or Infinity for unlimited
}

export const PRICING_CONFIG = {
  founderDeal: {
    maxUsers: 100,
    price: { key: 'founder_monthly', amount: 1500, interval: 'month' },
    planProvided: 'complete' as PlanType, // Founder deal unlocks complete features
  },
  plans: {
    core: {
      name: 'BYOK (Core)',
      prices: {
        monthly: { key: 'core_monthly', amount: 2500 },
        yearly: { key: 'core_yearly', amount: 25000 }, // Equivalent to 10 months
      },
      features: [
        'Bring your own key',
        'No AI usage limit from our side'
      ],
      aiModel: null,
      limits: {
        aiActions: Infinity
      }
    },
    complete: {
      name: 'Complete',
      prices: {
        monthly: { key: 'complete_monthly', amount: 3500 },
        yearly: { key: 'complete_yearly', amount: 35000 },
      },
      features: [
        'Mistral Small included',
        'Up to 500 actions/month'
      ],
      aiModel: 'mistral-small',
      limits: {
        aiActions: 500
      }
    }
  }
};

export function getAvailablePeriods(plan: PlanType): Period[] {
  return Object.keys(PRICING_CONFIG.plans[plan].prices) as Period[];
}
