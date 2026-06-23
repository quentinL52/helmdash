/**
 * Streak Tracker
 * ──────────────
 * Tracks consecutive daily activity with a freeze mechanic (1 per week).
 * All functions are pure — they accept a state snapshot and return a new one.
 *
 * Streak milestones: 7, 30, 90 days → trigger corresponding XP milestone actions.
 */

// ── Types ──────────────────────────────────────────────────────────────

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  /** ISO date string YYYY-MM-DD of the last recorded activity day */
  lastActivityDate: string | null;
  /** Number of streak freezes remaining (max 1, resets weekly) */
  freezesRemaining: number;
  /** Whether a freeze has been consumed this ISO week */
  freezeUsedThisWeek: boolean;
}

export type StreakStatus = 'active' | 'at-risk' | 'broken';

/** Streak thresholds that trigger milestone XP rewards. */
export const STREAK_MILESTONES = [7, 30, 90] as const;

// ── Helpers ────────────────────────────────────────────────────────────

/** Get today's date as YYYY-MM-DD in local timezone. */
export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

/** Calculate the difference in calendar days between two YYYY-MM-DD strings. */
function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00');
  const b = new Date(dateB + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Get ISO week number for a given YYYY-MM-DD date. */
function getISOWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  const temp = new Date(date.valueOf());
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

/** Check if two dates fall in different ISO weeks. */
function isDifferentWeek(dateA: string | null, dateB: string): boolean {
  if (!dateA) return true;
  const yearA = new Date(dateA + 'T00:00:00').getFullYear();
  const yearB = new Date(dateB + 'T00:00:00').getFullYear();
  return yearA !== yearB || getISOWeek(dateA) !== getISOWeek(dateB);
}

// ── Default State ──────────────────────────────────────────────────────

export function createDefaultStreakState(): StreakState {
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastActivityDate: null,
    freezesRemaining: 1,
    freezeUsedThisWeek: false,
  };
}

// ── Core Logic ─────────────────────────────────────────────────────────

/**
 * Record today's activity and update the streak.
 *
 * Rules:
 *  - Same day as last activity → no change (idempotent)
 *  - Next calendar day → increment streak
 *  - Gap of 1 day + freeze available → consume freeze, increment streak
 *  - Gap > 1 day (or no freeze) → reset streak to 1
 *
 * @returns Updated streak state (new object, original untouched)
 */
export function recordActivity(state: StreakState): StreakState {
  const today = getTodayDate();
  const newState = { ...state };

  // Reset freeze allowance if we've crossed into a new ISO week
  if (isDifferentWeek(state.lastActivityDate, today)) {
    newState.freezesRemaining = 1;
    newState.freezeUsedThisWeek = false;
  }

  // Already recorded today — no-op
  if (state.lastActivityDate === today) {
    return newState;
  }

  if (state.lastActivityDate === null) {
    // First ever activity
    newState.currentStreak = 1;
  } else {
    const gap = daysBetween(state.lastActivityDate, today);

    if (gap === 1) {
      // Consecutive day
      newState.currentStreak = state.currentStreak + 1;
    } else if (gap === 2 && state.freezesRemaining > 0) {
      // 1-day gap covered by a freeze
      newState.currentStreak = state.currentStreak + 1;
      newState.freezesRemaining = state.freezesRemaining - 1;
      newState.freezeUsedThisWeek = true;
    } else {
      // Streak broken
      newState.currentStreak = 1;
    }
  }

  newState.lastActivityDate = today;
  newState.bestStreak = Math.max(newState.bestStreak, newState.currentStreak);

  return newState;
}

/**
 * Manually consume a streak freeze (if available).
 * Freezes prevent streak resets on missed days.
 */
export function useFreeze(state: StreakState): StreakState {
  if (state.freezesRemaining <= 0 || state.freezeUsedThisWeek) {
    return state;
  }
  return {
    ...state,
    freezesRemaining: state.freezesRemaining - 1,
    freezeUsedThisWeek: true,
  };
}

/**
 * Determine the current streak health.
 *
 * - `active`  — activity recorded today
 * - `at-risk` — no activity today, but streak not yet broken
 * - `broken`  — gap too large, streak has been reset
 */
export function getStreakStatus(state: StreakState): StreakStatus {
  if (state.lastActivityDate === null || state.currentStreak === 0) {
    return 'broken';
  }

  const today = getTodayDate();
  const gap = daysBetween(state.lastActivityDate, today);

  if (gap === 0) return 'active';
  if (gap === 1) return 'at-risk';
  return 'broken';
}

/**
 * Check if the current streak has just hit a milestone threshold.
 *
 * @returns The milestone value (7, 30, or 90) if exactly reached, or `null`.
 */
export function getStreakMilestone(streak: number): number | null {
  if (STREAK_MILESTONES.includes(streak as typeof STREAK_MILESTONES[number])) {
    return streak;
  }
  return null;
}
