import { describe, expect, test } from 'vitest';
import { COHORT_CONFIG, getAvailablePeriods } from '@/lib/billing/cohort-config';

describe('COHORT_CONFIG', () => {
  test('founders max is 100', () => {
    expect(COHORT_CONFIG.founders.max).toBe(100);
  });

  test('early max is 100', () => {
    expect(COHORT_CONFIG.early.max).toBe(100);
  });

  test('full max is Infinity', () => {
    expect(COHORT_CONFIG.full.max).toBe(Infinity);
  });

  test('founders lockMonths is null (lifetime)', () => {
    expect(COHORT_CONFIG.founders.lockMonths).toBeNull();
  });

  test('early lockMonths is 12', () => {
    expect(COHORT_CONFIG.early.lockMonths).toBe(12);
  });

  test('founders only has semi_annual period', () => {
    expect(getAvailablePeriods('founders')).toEqual(['semi_annual']);
  });

  test('early has semi_annual and yearly', () => {
    const periods = getAvailablePeriods('early');
    expect(periods).toContain('semi_annual');
    expect(periods).toContain('yearly');
    expect(periods).not.toContain('monthly');
  });

  test('full has all three periods', () => {
    const periods = getAvailablePeriods('full');
    expect(periods).toContain('monthly');
    expect(periods).toContain('semi_annual');
    expect(periods).toContain('yearly');
  });

  test('prices match spec exactly (in cents EUR)', () => {
    expect(COHORT_CONFIG.founders.prices.semi_annual?.amount).toBe(2500);
    expect(COHORT_CONFIG.early.prices.semi_annual?.amount).toBe(4500);
    expect(COHORT_CONFIG.early.prices.yearly?.amount).toBe(7900);
    expect(COHORT_CONFIG.full.prices.monthly?.amount).toBe(1200);
    expect(COHORT_CONFIG.full.prices.semi_annual?.amount).toBe(5900);
    expect(COHORT_CONFIG.full.prices.yearly?.amount).toBe(9900);
  });
});

describe('no "general" term', () => {
  test('config keys do not contain "general"', () => {
    const keys = Object.keys(COHORT_CONFIG);
    expect(keys).not.toContain('general');
    expect(keys).toContain('full');
  });
});

describe('getAvailablePeriods validates invalid combos', () => {
  test('founders cannot have monthly', () => {
    expect(getAvailablePeriods('founders')).not.toContain('monthly');
  });

  test('founders cannot have yearly', () => {
    expect(getAvailablePeriods('founders')).not.toContain('yearly');
  });

  test('early cannot have monthly', () => {
    expect(getAvailablePeriods('early')).not.toContain('monthly');
  });
});
