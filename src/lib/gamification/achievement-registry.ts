/**
 * Achievement Registry
 * ────────────────────
 * 13 achievements with condition-based unlock logic.
 * Pure module — `checkAchievement` evaluates conditions against a GameState snapshot.
 *
 * Rarity tiers:
 *   common    → Early wins to hook the founder
 *   rare      → Sustained effort over time
 *   epic      → Major milestones
 *   legendary → Exceptional performance
 */

// ── Types ──────────────────────────────────────────────────────────────

export type AchievementId =
  | 'first_steps'
  | 'first_canvas'
  | 'mad_scientist'
  | 'first_dollar'
  | 'iron_discipline'
  | 'bullseye'
  | 'intel_master'
  | 'launch_ready'
  | 'data_driven'
  | 'mindful_founder'
  | 'speed_runner'
  | 'social_butterfly'
  | 'financial_wizard';

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 'validation' | 'discipline' | 'growth' | 'strategy' | 'intelligence' | 'milestone';

/** Condition tree — supports count, streak, milestone, and composite (AND). */
export type AchievementCondition =
  | { type: 'count'; target: string; count: number }
  | { type: 'streak'; days: number }
  | { type: 'milestone'; key: string }
  | { type: 'composite'; conditions: AchievementCondition[] };

export interface Achievement {
  id: AchievementId;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  emoji: string;
  xpReward: number;
  category: AchievementCategory;
  condition: AchievementCondition;
  rarity: AchievementRarity;
}

/**
 * Minimal game state snapshot passed to the checker.
 * Keys in `counts` match the `target` field in count conditions.
 * Keys in `milestones` match the `key` field in milestone conditions.
 */
export interface GameState {
  counts: Record<string, number>;
  currentStreak: number;
  milestones: Record<string, boolean>;
}

// ── Registry ───────────────────────────────────────────────────────────

export const ACHIEVEMENT_REGISTRY: Record<AchievementId, Achievement> = {
  // ── Common ─────────────────────────────────────────
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    nameFr: 'Premiers Pas',
    description: 'Complete the onboarding quest',
    descriptionFr: "Compléter la quête d'onboarding",
    emoji: '👣',
    xpReward: 100,
    category: 'milestone',
    condition: { type: 'milestone', key: 'onboarding_complete' },
    rarity: 'common',
  },
  first_canvas: {
    id: 'first_canvas',
    name: 'First Canvas',
    nameFr: 'Premier Canvas',
    description: 'Fill all 9 blocks of the Lean Canvas',
    descriptionFr: 'Remplir les 9 blocs du Lean Canvas',
    emoji: '🎨',
    xpReward: 50,
    category: 'strategy',
    condition: { type: 'milestone', key: 'lean_canvas_complete' },
    rarity: 'common',
  },
  data_driven: {
    id: 'data_driven',
    name: 'Data Driven',
    nameFr: 'Piloté par la Data',
    description: 'Use 5 different AI agents',
    descriptionFr: '5 agents IA différents utilisés',
    emoji: '🤖',
    xpReward: 100,
    category: 'intelligence',
    condition: { type: 'count', target: 'unique_agents_used', count: 5 },
    rarity: 'common',
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    nameFr: 'Papillon Social',
    description: 'Add 20 contacts to CRM',
    descriptionFr: '20 contacts ajoutés au CRM',
    emoji: '🦋',
    xpReward: 100,
    category: 'growth',
    condition: { type: 'count', target: 'contacts_added', count: 20 },
    rarity: 'common',
  },

  // ── Rare ───────────────────────────────────────────
  mad_scientist: {
    id: 'mad_scientist',
    name: 'Mad Scientist',
    nameFr: 'Savant Fou',
    description: 'Test 10 hypotheses',
    descriptionFr: '10 hypothèses testées',
    emoji: '🔬',
    xpReward: 200,
    category: 'validation',
    condition: { type: 'count', target: 'hypotheses_tested', count: 10 },
    rarity: 'rare',
  },
  iron_discipline: {
    id: 'iron_discipline',
    name: 'Iron Discipline',
    nameFr: 'Discipline de Fer',
    description: '30-day activity streak',
    descriptionFr: 'Série de 30 jours consécutifs',
    emoji: '⚔️',
    xpReward: 300,
    category: 'discipline',
    condition: { type: 'streak', days: 30 },
    rarity: 'rare',
  },
  bullseye: {
    id: 'bullseye',
    name: 'Bullseye',
    nameFr: 'Dans le Mille',
    description: 'Complete an OKR at 100%',
    descriptionFr: 'OKR complété à 100%',
    emoji: '🎯',
    xpReward: 150,
    category: 'milestone',
    condition: { type: 'milestone', key: 'okr_100_percent' },
    rarity: 'rare',
  },
  intel_master: {
    id: 'intel_master',
    name: 'Intel Master',
    nameFr: "Maître du Renseignement",
    description: 'Fully analyze 5 competitors',
    descriptionFr: '5 concurrents analysés complètement',
    emoji: '🕵️',
    xpReward: 175,
    category: 'intelligence',
    condition: { type: 'count', target: 'competitors_analyzed', count: 5 },
    rarity: 'rare',
  },
  mindful_founder: {
    id: 'mindful_founder',
    name: 'Mindful Founder',
    nameFr: 'Fondateur Éclairé',
    description: 'Write 30 journal entries',
    descriptionFr: '30 entrées de journal',
    emoji: '🧘',
    xpReward: 250,
    category: 'discipline',
    condition: { type: 'count', target: 'journal_entries', count: 30 },
    rarity: 'rare',
  },
  financial_wizard: {
    id: 'financial_wizard',
    name: 'Financial Wizard',
    nameFr: 'Magicien des Finances',
    description: 'Keep runway tracker updated for 4 consecutive weeks',
    descriptionFr: 'Maintenir le runway tracker à jour 4 semaines consécutives',
    emoji: '💰',
    xpReward: 200,
    category: 'strategy',
    condition: { type: 'count', target: 'finance_weeks_updated', count: 4 },
    rarity: 'rare',
  },

  // ── Epic ───────────────────────────────────────────
  first_dollar: {
    id: 'first_dollar',
    name: 'First Dollar',
    nameFr: 'Premier Dollar',
    description: 'Record your first revenue',
    descriptionFr: 'Premier revenu enregistré',
    emoji: '💵',
    xpReward: 500,
    category: 'milestone',
    condition: { type: 'milestone', key: 'first_revenue' },
    rarity: 'epic',
  },
  launch_ready: {
    id: 'launch_ready',
    name: 'Launch Ready',
    nameFr: 'Prêt au Lancement',
    description: 'Complete the launch checklist',
    descriptionFr: 'Checklist de lancement complétée',
    emoji: '🚀',
    xpReward: 400,
    category: 'strategy',
    condition: { type: 'milestone', key: 'launch_checklist_complete' },
    rarity: 'epic',
  },

  // ── Legendary ──────────────────────────────────────
  speed_runner: {
    id: 'speed_runner',
    name: 'Speed Runner',
    nameFr: 'Speed Runner',
    description: 'Validate 3 hypotheses in 7 days',
    descriptionFr: '3 hypothèses validées en 7 jours',
    emoji: '⚡',
    xpReward: 500,
    category: 'validation',
    condition: {
      type: 'composite',
      conditions: [
        { type: 'count', target: 'hypotheses_validated_7d', count: 3 },
      ],
    },
    rarity: 'legendary',
  },
};

// ── Checker ────────────────────────────────────────────────────────────

/**
 * Evaluate whether a single condition is satisfied.
 * Pure function — no side effects.
 */
function evaluateCondition(condition: AchievementCondition, state: GameState): boolean {
  switch (condition.type) {
    case 'count':
      return (state.counts[condition.target] ?? 0) >= condition.count;

    case 'streak':
      return state.currentStreak >= condition.days;

    case 'milestone':
      return state.milestones[condition.key] === true;

    case 'composite':
      return condition.conditions.every(c => evaluateCondition(c, state));
  }
}

/**
 * Check whether a specific achievement's conditions are met.
 *
 * @param id - The achievement to check
 * @param state - Current game state snapshot
 * @returns `true` if all conditions are satisfied
 */
export function checkAchievement(id: AchievementId, state: GameState): boolean {
  const achievement = ACHIEVEMENT_REGISTRY[id];
  return evaluateCondition(achievement.condition, state);
}

/**
 * Scan all achievements and return the IDs of newly unlockable ones.
 * Filters out achievements already present in `unlockedIds`.
 */
export function getNewlyUnlockableAchievements(
  state: GameState,
  unlockedIds: Set<AchievementId>,
): AchievementId[] {
  return (Object.keys(ACHIEVEMENT_REGISTRY) as AchievementId[]).filter(
    id => !unlockedIds.has(id) && checkAchievement(id, state),
  );
}
