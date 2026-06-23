/**
 * XP Rewards Table
 * ────────────────
 * Defines every action that earns XP in the gamification system.
 * Pure data module — no side effects, fully testable.
 *
 * Categories map to the founder journey:
 *   discipline  → Daily habits (login, journal, routine)
 *   validation  → Hypothesis-driven experiments
 *   strategy    → Canvas, roadmap, GTM planning
 *   growth      → Outreach, content, CRM
 *   objectives  → OKR completion
 *   intelligence → Competitive analysis, AI agents
 *   milestone   → One-time achievements (first revenue, streaks)
 */

// ── Types ──────────────────────────────────────────────────────────────

export type XPAction =
  | 'daily_login'
  | 'journal_entry'
  | 'routine_complete'
  | 'hypothesis_created'
  | 'hypothesis_tested'
  | 'hypothesis_validated'
  | 'lean_canvas_updated'
  | 'contact_added'
  | 'content_published'
  | 'okr_key_result_achieved'
  | 'competitor_analyzed'
  | 'agent_used'
  | 'first_revenue'
  | 'roadmap_task_completed'
  | 'gtm_milestone'
  | 'routine_streak_7'
  | 'routine_streak_30'
  | 'routine_streak_90';

export type XPCategory =
  | 'discipline'
  | 'validation'
  | 'strategy'
  | 'growth'
  | 'objectives'
  | 'intelligence'
  | 'milestone';

export interface XPReward {
  action: XPAction;
  xp: number;
  label: string;
  labelFr: string;
  category: XPCategory;
  repeatable: boolean;
  /** Minimum milliseconds between repeated XP awards (undefined = no cooldown) */
  cooldownMs?: number;
}

// ── Time Constants ─────────────────────────────────────────────────────

const MINUTES = (n: number) => n * 60 * 1_000;
const HOURS = (n: number) => n * 60 * 60 * 1_000;

// ── XP Table ───────────────────────────────────────────────────────────

export const XP_TABLE: Record<XPAction, XPReward> = {
  // ── Discipline ─────────────────────────────────────
  daily_login: {
    action: 'daily_login',
    xp: 5,
    label: 'Daily login',
    labelFr: 'Connexion quotidienne',
    category: 'discipline',
    repeatable: true,
    cooldownMs: HOURS(24),
  },
  journal_entry: {
    action: 'journal_entry',
    xp: 25,
    label: 'Journal entry',
    labelFr: 'Entrée journal',
    category: 'discipline',
    repeatable: true,
    cooldownMs: HOURS(12),
  },
  routine_complete: {
    action: 'routine_complete',
    xp: 30,
    label: 'Routine completed (100%)',
    labelFr: 'Routine complétée (100%)',
    category: 'discipline',
    repeatable: true,
    cooldownMs: HOURS(24),
  },

  // ── Validation ─────────────────────────────────────
  hypothesis_created: {
    action: 'hypothesis_created',
    xp: 15,
    label: 'Hypothesis created',
    labelFr: 'Hypothèse créée',
    category: 'validation',
    repeatable: true,
  },
  hypothesis_tested: {
    action: 'hypothesis_tested',
    xp: 50,
    label: 'Hypothesis tested',
    labelFr: 'Hypothèse testée',
    category: 'validation',
    repeatable: true,
  },
  hypothesis_validated: {
    action: 'hypothesis_validated',
    xp: 100,
    label: 'Hypothesis validated',
    labelFr: 'Hypothèse validée',
    category: 'validation',
    repeatable: true,
  },

  // ── Strategy ───────────────────────────────────────
  lean_canvas_updated: {
    action: 'lean_canvas_updated',
    xp: 20,
    label: 'Lean Canvas updated',
    labelFr: 'Lean Canvas mis à jour',
    category: 'strategy',
    repeatable: true,
    cooldownMs: HOURS(1),
  },
  roadmap_task_completed: {
    action: 'roadmap_task_completed',
    xp: 20,
    label: 'Roadmap task completed',
    labelFr: 'Tâche roadmap terminée',
    category: 'strategy',
    repeatable: true,
  },
  gtm_milestone: {
    action: 'gtm_milestone',
    xp: 50,
    label: 'GTM milestone reached',
    labelFr: 'Jalon GTM atteint',
    category: 'strategy',
    repeatable: true,
  },

  // ── Growth ─────────────────────────────────────────
  contact_added: {
    action: 'contact_added',
    xp: 10,
    label: 'Contact added',
    labelFr: 'Contact ajouté',
    category: 'growth',
    repeatable: true,
  },
  content_published: {
    action: 'content_published',
    xp: 40,
    label: 'Content published',
    labelFr: 'Contenu publié',
    category: 'growth',
    repeatable: true,
  },

  // ── Objectives ─────────────────────────────────────
  okr_key_result_achieved: {
    action: 'okr_key_result_achieved',
    xp: 75,
    label: 'Key Result achieved',
    labelFr: 'Résultat clé atteint',
    category: 'objectives',
    repeatable: true,
  },

  // ── Intelligence ───────────────────────────────────
  competitor_analyzed: {
    action: 'competitor_analyzed',
    xp: 35,
    label: 'Competitor analyzed',
    labelFr: 'Concurrent analysé',
    category: 'intelligence',
    repeatable: true,
  },
  agent_used: {
    action: 'agent_used',
    xp: 10,
    label: 'AI agent used',
    labelFr: 'Agent IA utilisé',
    category: 'intelligence',
    repeatable: true,
    cooldownMs: MINUTES(5),
  },

  // ── Milestones (non-repeatable) ────────────────────
  first_revenue: {
    action: 'first_revenue',
    xp: 500,
    label: 'First revenue!',
    labelFr: 'Premier revenu !',
    category: 'milestone',
    repeatable: false,
  },
  routine_streak_7: {
    action: 'routine_streak_7',
    xp: 100,
    label: '7-day streak',
    labelFr: 'Série de 7 jours',
    category: 'milestone',
    repeatable: false,
  },
  routine_streak_30: {
    action: 'routine_streak_30',
    xp: 300,
    label: '30-day streak',
    labelFr: 'Série de 30 jours',
    category: 'milestone',
    repeatable: false,
  },
  routine_streak_90: {
    action: 'routine_streak_90',
    xp: 1000,
    label: '90-day streak',
    labelFr: 'Série de 90 jours',
    category: 'milestone',
    repeatable: false,
  },
} as const;

// ── Helpers ────────────────────────────────────────────────────────────

/** Retrieve the XP reward definition for a given action. */
export function getXPReward(action: XPAction): XPReward {
  return XP_TABLE[action];
}

/**
 * Check whether enough time has passed since the last award for a cooldown-gated action.
 * Returns `true` if the action can be awarded now.
 */
export function isCooldownReady(action: XPAction, lastAwardedAt: number | null): boolean {
  const reward = XP_TABLE[action];
  if (!reward.cooldownMs || lastAwardedAt === null) return true;
  return Date.now() - lastAwardedAt >= reward.cooldownMs;
}
