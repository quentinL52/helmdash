import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PRICING_CONFIG } from '@/lib/billing/pricing-config';

let cached: { data: any; ts: number } | null = null;
const CACHE_TTL = 60_000;

export async function GET() {
  const now = Date.now();
  if (cached && now - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  const counter = await prisma.founderDealCounter.findUnique({
    where: { id: 'singleton' },
  });

  const sold = counter?.sold ?? 0;
  const isAvailable = sold < PRICING_CONFIG.founderDeal.maxUsers;
  const seatsLeft = Math.max(0, PRICING_CONFIG.founderDeal.maxUsers - sold);

  const data = {
    founderDeal: {
      isAvailable,
      seatsLeft,
      taken: sold,
      max: PRICING_CONFIG.founderDeal.maxUsers,
    },
    plans: PRICING_CONFIG.plans,
  };

  cached = { data, ts: now };

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}
