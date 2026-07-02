import { NextResponse } from 'next/server';

/**
 * Plans et leurs limites.
 */
export const PLAN_LIMITS = {
  free: {
    agents: 1,
    subAgents: 0,
    memoryMb: 10,
    apiCallsPerMonth: 1000,
    integrations: 3,
    teamSeats: 1,
    stripeSync: false,
    exportEnabled: false,
    webhooks: false,
  },
  starter: {
    agents: 3,
    subAgents: 3,
    memoryMb: 100,
    apiCallsPerMonth: 50000,
    integrations: 10,
    teamSeats: 1,
    stripeSync: true,
    exportEnabled: true,
    webhooks: false,
  },
  growth: {
    agents: 10,
    subAgents: 10,
    memoryMb: 1000,
    apiCallsPerMonth: 500000,
    integrations: 50,
    teamSeats: 3,
    stripeSync: true,
    exportEnabled: true,
    webhooks: true,
  },
  scale: {
    agents: -1, // Unlimited
    subAgents: -1,
    memoryMb: -1,
    apiCallsPerMonth: -1,
    integrations: -1,
    teamSeats: 10,
    stripeSync: true,
    exportEnabled: true,
    webhooks: true,
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;
export type PlanLimitKey = keyof typeof PLAN_LIMITS['free'];

/**
 * Vérifie si l'utilisateur a accès à une fonctionnalité selon son plan.
 * Utilisé côté API pour le plan enforcement.
 */
export function checkPlanLimit(
  planTier: string,
  limitKey: PlanLimitKey,
  currentUsage?: number,
): { allowed: boolean; limit: number | boolean; upgradeUrl: string } {
  const normalizedTier = (Object.keys(PLAN_LIMITS).includes(planTier) ? planTier : 'free') as PlanName;
  const limit = PLAN_LIMITS[normalizedTier][limitKey];

  let allowed: boolean;
  if (typeof limit === 'number') {
    allowed = limit === -1 || (currentUsage !== undefined ? currentUsage < limit : true);
  } else {
    allowed = limit === true;
  }

  return {
    allowed,
    limit,
    upgradeUrl: '/pricing',
  };
}

/**
 * Middleware pour vérifier les limites de plan dans les routes API.
 * Retourne une réponse 403 si la limite est dépassée.
 */
export function enforcePlan(
  planTier: string,
  limitKey: PlanLimitKey,
  currentUsage?: number,
): NextResponse | null {
  const result = checkPlanLimit(planTier, limitKey, currentUsage);

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: 'Plan limit reached',
        message: `Cette fonctionnalité nécessite un plan supérieur. Limite actuelle: ${result.limit}`,
        limit: result.limit,
        upgradeUrl: result.upgradeUrl,
      },
      { status: 403 },
    );
  }

  return null; // OK, pas de blocage
}

/**
 * Niveaux pour la comparaison de plans
 */
export const TIER_LEVELS: Record<string, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  scale: 3,
};

/**
 * Vérifie si un plan est suffisant pour une fonctionnalité
 */
export function hasRequiredTier(currentTier: string, requiredTier: PlanName): boolean {
  const current = TIER_LEVELS[currentTier] ?? 0;
  const required = TIER_LEVELS[requiredTier];
  return current >= required;
}