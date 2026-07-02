import { expect, test } from 'vitest';
import { checkPlanLimit, hasRequiredTier, PLAN_LIMITS } from '@/lib/billing/plan-limits';

test('free plan has correct limits', () => {
  const limits = PLAN_LIMITS.free;
  expect(limits.agents).toBe(1);
  expect(limits.subAgents).toBe(0);
  expect(limits.memoryMb).toBe(10);
  expect(limits.stripeSync).toBe(false);
  expect(limits.apiCallsPerMonth).toBe(1000);
});

test('starter plan has correct limits', () => {
  const limits = PLAN_LIMITS.starter;
  expect(limits.agents).toBe(3);
  expect(limits.subAgents).toBe(3);
  expect(limits.stripeSync).toBe(true);
});

test('growth plan allows up to 10 agents', () => {
  const limits = PLAN_LIMITS.growth;
  expect(limits.agents).toBe(10);
  expect(limits.subAgents).toBe(10);
  expect(limits.integrations).toBe(50);
});

test('scale plan has unlimited limits', () => {
  const limits = PLAN_LIMITS.scale;
  expect(limits.agents).toBe(-1);
  expect(limits.memoryMb).toBe(-1);
  expect(limits.apiCallsPerMonth).toBe(-1);
});

test('checkPlanLimit allows access within limits', () => {
  const result = checkPlanLimit('starter', 'subAgents', 2);
  expect(result.allowed).toBe(true);
});

test('checkPlanLimit blocks when over limit', () => {
  const result = checkPlanLimit('starter', 'subAgents', 3);
  expect(result.allowed).toBe(false);
  expect(result.limit).toBe(3);
});

test('checkPlanLimit allows unlimited access for -1 limits', () => {
  const result = checkPlanLimit('scale', 'agents', 9999);
  expect(result.allowed).toBe(true);
});

test('checkPlanLimit falls back to free for unknown plans', () => {
  const result = checkPlanLimit('unknown', 'subAgents', 0);
  expect(result.allowed).toBe(false); // free = 0 subAgents allowed
});

test('checkPlanLimit blocks subAgents on free plan', () => {
  const result = checkPlanLimit('free', 'subAgents', 0);
  expect(result.allowed).toBe(false); // free subAgents limit is 0
  expect(result.limit).toBe(0);
});

test('checkPlanLimit handles boolean limits (stripeSync)', () => {
  const free = checkPlanLimit('free', 'stripeSync');
  expect(free.allowed).toBe(false);

  const starter = checkPlanLimit('starter', 'stripeSync');
  expect(starter.allowed).toBe(true);
});

test('hasRequiredTier returns true for same tier', () => {
  expect(hasRequiredTier('starter', 'starter')).toBe(true);
});

test('hasRequiredTier returns false for insufficient tier', () => {
  expect(hasRequiredTier('free', 'starter')).toBe(false);
});

test('hasRequiredTier returns true for higher tier', () => {
  expect(hasRequiredTier('growth', 'starter')).toBe(true);
});

test('hasRequiredTier returns false for unknown tier', () => {
  expect(hasRequiredTier('unknown', 'starter')).toBe(false);
});
