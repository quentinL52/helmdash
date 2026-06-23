/**
 * Gamification Store
 * ──────────────────
 * Dedicated Zustand store for all gamification state, persisted to localStorage.
 * Fully independent from `founder-store.ts` — no cross-store mutations.
 *
 * Persistence key: 'ignitehq-gamification-store'
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { XPAction } from '@/lib/gamification/xp-table';
import type { FounderLevel, LevelProgress } from '@/lib/gamification/level-system';
import type { AchievementId } from '@/lib/gamification/achievement-registry';
import type { Quest } from '@/lib/gamification/quest-engine';
import type { StreakState } from '@/lib/gamification/streak-tracker';

import { XP_TABLE, isCooldownReady } from '@/lib/gamification/xp-table';
import { getLevelForXP, getXPForNextLevel } from '@/lib/gamification/level-system';
import { ACHIEVEMENT_REGISTRY } from '@/lib/gamification/achievement-registry';
import {
  createDefaultStreakState,
  recordActivity as pureRecordActivity,
  useFreeze as pureUseFreeze,
  getStreakMilestone,
} from '@/lib/gamification/streak-tracker';
import {
  createOnboardingQuest,
  createEpicQuests,
  updateQuestProgress as pureUpdateQuestProgress,
  getActiveQuests,
} from '@/lib/gamification/quest-engine';

// ── Types ──────────────────────────────────────────────────────────────

export interface UnlockedAchievement {
  id: AchievementId;
  unlockedAt: string; // ISO datetime
}

export interface XPEvent {
  action: XPAction;
  xp: number;
  timestamp: number; // epoch ms
}

export interface GamificationState {
  // ── XP & Level ───────────────────────────────────
  totalXP: number;
  xpHistory: XPEvent[];
  /** Tracks last award time per action (epoch ms) for cooldown enforcement */
  lastAwardedAt: Record<string, number>;

  // ── Streak ───────────────────────────────────────
  streak: StreakState;

  // ── Achievements ─────────────────────────────────
  unlockedAchievements: UnlockedAchievement[];

  // ── Quests ───────────────────────────────────────
  quests: Quest[];

  // ── Sound Preferences ────────────────────────────
  soundEnabled: boolean;
  soundVolume: number;
}

export interface GamificationActions {
  /**
   * Award XP for an action. Enforces cooldown and repeatability rules.
   * @returns The XP actually awarded (0 if blocked by cooldown/non-repeatable).
   */
  awardXP: (action: XPAction) => number;

  /** Record daily activity to update the streak. */
  recordActivity: () => void;

  /** Use a streak freeze (1 per week). */
  useStreakFreeze: () => void;

  /** Manually unlock an achievement. */
  unlockAchievement: (id: AchievementId) => void;

  /** Mark a quest step as completed. */
  updateQuestProgress: (questId: string, stepId: string) => void;

  /** Regenerate weekly quests (called by the hook periodically). */
  setQuests: (quests: Quest[]) => void;

  /** Sound settings */
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;

  /** Reset all gamification data (dev/debug). */
  resetGamification: () => void;
}

export type GamificationStore = GamificationState & GamificationActions;

// ── Initial State ──────────────────────────────────────────────────────

function createInitialState(): GamificationState {
  return {
    totalXP: 0,
    xpHistory: [],
    lastAwardedAt: {},
    streak: createDefaultStreakState(),
    unlockedAchievements: [],
    quests: [createOnboardingQuest(), ...createEpicQuests()],
    soundEnabled: true,
    soundVolume: 0.5,
  };
}

// ── Store ──────────────────────────────────────────────────────────────

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      // ── XP ───────────────────────────────────────
      awardXP: (action: XPAction): number => {
        const state = get();
        const reward = XP_TABLE[action];

        // Non-repeatable: check if already awarded
        if (!reward.repeatable) {
          const alreadyAwarded = state.xpHistory.some(e => e.action === action);
          if (alreadyAwarded) return 0;
        }

        // Cooldown check
        const lastTime = state.lastAwardedAt[action] ?? null;
        if (!isCooldownReady(action, lastTime)) return 0;

        const now = Date.now();
        const event: XPEvent = { action, xp: reward.xp, timestamp: now };

        set({
          totalXP: state.totalXP + reward.xp,
          xpHistory: [...state.xpHistory, event],
          lastAwardedAt: { ...state.lastAwardedAt, [action]: now },
        });

        return reward.xp;
      },

      // ── Streak ───────────────────────────────────
      recordActivity: () => {
        const state = get();
        const newStreak = pureRecordActivity(state.streak);

        // Check for streak milestone XP
        const milestone = getStreakMilestone(newStreak.currentStreak);
        let bonusXP = 0;
        const bonusEvents: XPEvent[] = [];

        if (milestone) {
          const milestoneAction = `routine_streak_${milestone}` as XPAction;
          if (milestoneAction in XP_TABLE) {
            const alreadyAwarded = state.xpHistory.some(e => e.action === milestoneAction);
            if (!alreadyAwarded) {
              const reward = XP_TABLE[milestoneAction];
              bonusXP = reward.xp;
              bonusEvents.push({ action: milestoneAction, xp: reward.xp, timestamp: Date.now() });
            }
          }
        }

        set({
          streak: newStreak,
          totalXP: state.totalXP + bonusXP,
          xpHistory: [...state.xpHistory, ...bonusEvents],
        });
      },

      useStreakFreeze: () => {
        set({ streak: pureUseFreeze(get().streak) });
      },

      // ── Achievements ─────────────────────────────
      unlockAchievement: (id: AchievementId) => {
        const state = get();
        const alreadyUnlocked = state.unlockedAchievements.some(a => a.id === id);
        if (alreadyUnlocked) return;

        const achievement = ACHIEVEMENT_REGISTRY[id];
        const unlock: UnlockedAchievement = { id, unlockedAt: new Date().toISOString() };

        set({
          unlockedAchievements: [...state.unlockedAchievements, unlock],
          totalXP: state.totalXP + achievement.xpReward,
          xpHistory: [
            ...state.xpHistory,
            { action: 'daily_login' as XPAction, xp: achievement.xpReward, timestamp: Date.now() },
          ],
        });
      },

      // ── Quests ───────────────────────────────────
      updateQuestProgress: (questId: string, stepId: string) => {
        const state = get();
        const updatedQuests = state.quests.map(quest => {
          if (quest.id !== questId) return quest;
          const updated = pureUpdateQuestProgress(quest, stepId);

          // If quest just completed, award the completion bonus
          if (updated.status === 'completed' && quest.status !== 'completed') {
            const bonus = updated.completionBonus;
            // Defer XP addition — we'll handle it after the map
            (updated as Quest & { _pendingBonus?: number })._pendingBonus = bonus;
          }

          return updated;
        });

        // Collect pending bonuses
        let bonusXP = 0;
        const cleanQuests = updatedQuests.map(q => {
          const cast = q as Quest & { _pendingBonus?: number };
          if (cast._pendingBonus) {
            bonusXP += cast._pendingBonus;
            delete cast._pendingBonus;
          }
          return cast as Quest;
        });

        set({
          quests: cleanQuests,
          totalXP: state.totalXP + bonusXP,
        });
      },

      setQuests: (quests: Quest[]) => {
        set({ quests });
      },

      // ── Sound ────────────────────────────────────
      setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume: number) => set({ soundVolume: Math.min(1, Math.max(0, volume)) }),

      // ── Reset ────────────────────────────────────
      resetGamification: () => set(createInitialState()),
    }),
    {
      name: 'ignitehq-gamification-store',
    },
  ),
);

// ── Derived Selectors (pure, no hooks) ─────────────────────────────────

/** Get the current founder level from total XP. */
export function selectLevel(state: GamificationState): FounderLevel {
  return getLevelForXP(state.totalXP);
}

/** Get progress toward the next level. */
export function selectLevelProgress(state: GamificationState): LevelProgress {
  return getXPForNextLevel(state.totalXP);
}

/** Get only active (non-expired, non-completed) quests. */
export function selectActiveQuests(state: GamificationState): Quest[] {
  return getActiveQuests(state.quests);
}

/**
 * Compute a 0-100 "Founder Score" — a composite metric blending
 * XP progress, streak health, achievement count, and quest completion.
 */
export function selectFounderScore(state: GamificationState): number {
  const maxXPWeight = 40;     // 40 points from XP
  const maxStreakWeight = 25;  // 25 points from streak
  const maxAchWeight = 20;    // 20 points from achievements
  const maxQuestWeight = 15;  // 15 points from quest completion

  // XP: logarithmic scale, plateaus around 10000 XP
  const xpScore = Math.min(maxXPWeight, (Math.log10(state.totalXP + 1) / 4) * maxXPWeight);

  // Streak: linear, caps at 30 days
  const streakScore = Math.min(maxStreakWeight, (state.streak.currentStreak / 30) * maxStreakWeight);

  // Achievements: fraction of total unlocked
  const totalAchievements = Object.keys(ACHIEVEMENT_REGISTRY).length;
  const achScore = (state.unlockedAchievements.length / totalAchievements) * maxAchWeight;

  // Quests: fraction of quest steps completed
  const allSteps = state.quests.flatMap(q => q.steps);
  const completedSteps = allSteps.filter(s => s.completed).length;
  const questScore = allSteps.length > 0
    ? (completedSteps / allSteps.length) * maxQuestWeight
    : 0;

  return Math.round(xpScore + streakScore + achScore + questScore);
}
