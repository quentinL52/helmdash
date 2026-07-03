export type Cohort = 'founders' | 'early' | 'full';
export type Period = 'monthly' | 'semi_annual' | 'yearly';

export type StripePriceKey =
  | 'founders_6m'
  | 'early_6m'
  | 'early_yearly'
  | 'full_monthly'
  | 'full_6m'
  | 'full_yearly';

export type PlanStatus = 'trialing' | 'active' | 'readonly';

export const COHORT_CONFIG: Record<
  Cohort,
  {
    max: number;
    label: string;
    lockMonths: number | null;
    prices: Partial<Record<Period, { key: StripePriceKey; amount: number }>>;
  }
> = {
  founders: {
    max: 100,
    label: 'cohort.founders',
    lockMonths: null,
    prices: {
      semi_annual: { key: 'founders_6m', amount: 2500 },
    },
  },
  early: {
    max: 100,
    label: 'cohort.early',
    lockMonths: 12,
    prices: {
      semi_annual: { key: 'early_6m', amount: 4500 },
      yearly: { key: 'early_yearly', amount: 7900 },
    },
  },
  full: {
    max: Infinity,
    label: 'cohort.full',
    lockMonths: 12,
    prices: {
      monthly: { key: 'full_monthly', amount: 1200 },
      semi_annual: { key: 'full_6m', amount: 5900 },
      yearly: { key: 'full_yearly', amount: 9900 },
    },
  },
};

export const COHORT_ORDER: Cohort[] = ['founders', 'early', 'full'];

export function getAvailablePeriods(cohort: Cohort): Period[] {
  return Object.keys(COHORT_CONFIG[cohort].prices) as Period[];
}
