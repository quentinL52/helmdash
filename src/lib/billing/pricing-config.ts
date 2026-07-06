export type PlanType = 'core' | 'complete';
export type Period = 'monthly';
export type PlanStatus = 'trialing' | 'active' | 'readonly';

export type StripePriceKey =
  | 'founder_monthly'
  | 'core_monthly'
  | 'complete_monthly';

export interface PlanLimitConfig {
  aiActions: number; // 0 or Infinity for unlimited
}

export const PRICING_CONFIG = {
  founderDeal: {
    maxUsers: 100,
    price: { key: 'founder_monthly', amount: 1500, interval: 'month' },
    priceLockedForever: true,
    planProvided: 'complete' as PlanType, // Founder deal unlocks complete features
  },
  plans: {
    core: {
      name: 'BYOK (Core)',
      prices: {
        monthly: { key: 'core_monthly', amount: 2500 },
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
        monthly: { key: 'complete_monthly', amount: 3500 }, // Promo: 35€ instead of 45€ for 6 months
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
