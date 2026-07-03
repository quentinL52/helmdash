import { PrismaClient } from '@prisma/client';
import type { Cohort } from './cohort-config';
import { COHORT_CONFIG } from './cohort-config';

type PrismaTx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export async function reserveSeat(
  tx: PrismaTx,
  cohort: 'founders' | 'early',
): Promise<boolean> {
  const max = COHORT_CONFIG[cohort].max;
  // Atomic conditional increment — no read-then-write
  const updated: number = cohort === 'founders'
    ? await tx.$executeRawUnsafe(
        `UPDATE cohort_counter SET founders = founders + 1, updated_at = NOW() WHERE id = 'singleton' AND founders < $1`,
        max,
      )
    : await tx.$executeRawUnsafe(
        `UPDATE cohort_counter SET early = early + 1, updated_at = NOW() WHERE id = 'singleton' AND early < $1`,
        max,
      );
  return updated === 1;
}

export async function releaseSeat(
  tx: PrismaTx,
  cohort: 'founders' | 'early',
): Promise<void> {
  if (cohort === 'founders') {
    await tx.$executeRawUnsafe(
      `UPDATE cohort_counter SET founders = GREATEST(founders - 1, 0), updated_at = NOW() WHERE id = 'singleton'`,
    );
  } else {
    await tx.$executeRawUnsafe(
      `UPDATE cohort_counter SET early = GREATEST(early - 1, 0), updated_at = NOW() WHERE id = 'singleton'`,
    );
  }
}

export async function incrementTotal(tx: PrismaTx): Promise<number> {
  const rows: { total: number }[] = await tx.$queryRawUnsafe(
    `UPDATE cohort_counter SET total = total + 1, updated_at = NOW() WHERE id = 'singleton' RETURNING total`,
  );
  return rows[0].total;
}

export async function determineCohort(
  tx: PrismaTx,
): Promise<Cohort> {
  if (await reserveSeat(tx, 'founders')) return 'founders';
  if (await reserveSeat(tx, 'early')) return 'early';
  return 'full';
}

export function computeLockedUntil(cohort: Cohort): Date | null {
  const lockMonths = COHORT_CONFIG[cohort].lockMonths;
  if (lockMonths === null) return null;
  const d = new Date();
  d.setMonth(d.getMonth() + lockMonths);
  return d;
}
