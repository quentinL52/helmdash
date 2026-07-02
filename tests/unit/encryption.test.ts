import { expect, test } from 'vitest';
import { isValidUUID } from '@/lib/encryption';

test('isValidUUID returns true for valid UUID v4', () => {
  const valid = '550e8400-e29b-41d4-a716-446655440000';
  expect(isValidUUID(valid)).toBe(true);
});

test('isValidUUID returns false for invalid UUID', () => {
  expect(isValidUUID('not-a-uuid')).toBe(false);
  expect(isValidUUID('')).toBe(false);
  expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000z')).toBe(false);
});
