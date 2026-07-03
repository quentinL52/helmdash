import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Cohort } from '@/lib/billing/cohort-config';
import { COHORT_CONFIG } from '@/lib/billing/cohort-config';

let cached: { data: any; ts: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  const counter = await prisma.cohortCounter.findUnique({
    where: { id: 'singleton' },
  });

  const founders = counter?.founders ?? 0;
  const early = counter?.early ?? 0;

  let current: Cohort = 'full';
  if (founders < COHORT_CONFIG.founders.max) {
    current = 'founders';
  } else if (early < COHORT_CONFIG.early.max) {
    current = 'early';
  }

  const seatsLeft =
    current === 'founders'
      ? COHORT_CONFIG.founders.max - founders
      : current === 'early'
        ? COHORT_CONFIG.early.max - early
        : null;

  const data = {
    current,
    seatsLeft,
    cohorts: {
      founders: { taken: founders, max: COHORT_CONFIG.founders.max },
      early: { taken: early, max: COHORT_CONFIG.early.max },
    },
  };

  cached = { data, ts: now };

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}
