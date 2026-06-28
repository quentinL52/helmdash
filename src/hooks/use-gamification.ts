/**
 * useGamification Hook
 * ────────────────────
 * Main entry point for gamification in React components.
 * Reads from the Zustand gamification store and orchestrates side effects:
 *   - XP awards trigger achievement checks, quest progress, streak updates, and sounds.
 *   - Exposes a clean, stable API surface for UI components.
 *
 * Usage:
 *   const { xp, level, awardXP, streak } = useGamification();
 *   awardXP('hypothesis_tested'); // one call does everything
 */

'use client';

import { useCallback, useMemo } from 'react';

import { useGamificationStore, selectLevel, selectLevelProgress, selectActiveQuests, selectFounderScore } from '@/store/gamification-store';
import type { UnlockedAchievement } from '@/store/gamification-store';

import type { XPAction } from '@/lib/gamification/xp-table';
import type { AchievementId, GameState } from '@/lib/gamification/achievement-registry';
import { getNewlyUnlockableAchievements } from '@/lib/gamification/achievement-registry';
import type { FounderLevel, LevelProgress } from '@/lib/gamification/level-system';
import { getLevelForXP } from '@/lib/gamification/level-system';
import type { Quest } from '@/lib/gamification/quest-engine';
import type { StreakState } from '@/lib/gamification/streak-tracker';

import { useSound } from './use-sound';

// ── Hook Return Type ───────────────────────────────────────────────────

export interface UseGamificationReturn {
  // State
  xp: number;
  level: FounderLevel;
  nextLevel: LevelProgress;
  streak: StreakState;
  achievements: UnlockedAchievement[];
  activeQuests: Quest[];

  // Actions
  /** Award XP for an action. Automatically checks achievements, updates quests, and plays sounds. */
  awardXP: (action: XPAction) => void;
  /** Record today's activity for streak tracking. */
  recordActivity: () => void;
  /** Manually unlock an achievement (used by external checkers). */
  unlockAchievement: (id: AchievementId) => void;
  /** Mark a quest step as completed. */
  updateQuestProgress: (questId: string, stepId: string) => void;

  // Computed
  /** Composite 0-100 founder score. */
  founderScore: number;
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useGamification(): UseGamificationReturn {
  const store = useGamificationStore();
  const { play } = useSound();

  // ── Derived state (memoised) ───────────────────────
  const level = useMemo(() => selectLevel(store), [store.totalXP]);
  const nextLevel = useMemo(() => selectLevelProgress(store), [store.totalXP]);
  const activeQuests = useMemo(() => selectActiveQuests(store), [store.quests]);
  const founderScore = useMemo(() => selectFounderScore(store), [
    store.totalXP,
    store.streak.currentStreak,
    store.unlockedAchievements.length,
    store.quests,
  ]);

  // ── Build GameState snapshot for achievement checker ─
  const buildGameState = useCallback((): GameState => {
    const history = store.xpHistory;
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      counts: {
        hypotheses_tested: history.filter(e => e.action === 'hypothesis_tested').length,
        hypotheses_validated_7d: history.filter(
          e => e.action === 'hypothesis_validated' && e.timestamp >= sevenDaysAgo,
        ).length,
        unique_agents_used: new Set(
          history.filter(e => e.action === 'agent_used').map(e => e.timestamp),
        ).size, // approximate — in production, track distinct agent IDs
        contacts_added: history.filter(e => e.action === 'contact_added').length,
        competitors_analyzed: history.filter(e => e.action === 'competitor_analyzed').length,
        journal_entries: history.filter(e => e.action === 'journal_entry').length,
        finance_weeks_updated: history.filter(e => e.action === 'lean_canvas_updated').length,
      },
      currentStreak: store.streak.currentStreak,
      milestones: {
        first_revenue: history.some(e => e.action === 'first_revenue'),
        onboarding_complete: store.quests.some(
          q => q.id === 'onboarding_genesis' && q.status === 'completed',
        ),
        lean_canvas_complete: history.filter(e => e.action === 'lean_canvas_updated').length >= 9,
        okr_100_percent: history.some(e => e.action === 'okr_key_result_achieved'),
        launch_checklist_complete: false, // Wired when launch module exists
      },
    };
  }, [store.xpHistory, store.streak.currentStreak, store.quests]);

  // ── Actions ────────────────────────────────────────

  const awardXP = useCallback(
    (action: XPAction) => {
      const prevXP = store.totalXP;
      const awarded = store.awardXP(action);

      if (awarded === 0) return;

      // Sound: XP gain
      play('xp_gain');

      // Check for level-up
      const prevLevel = getLevelForXP(prevXP);
      const newLevel = getLevelForXP(prevXP + awarded);
      if (newLevel.level > prevLevel.level) {
        play('level_up');
      }

      // Record activity for streak
      store.recordActivity();

      // Auto-progress quests whose steps match this action
      const currentQuests = store.quests;
      for (let i = 0; i < currentQuests.length; i++) {
        const quest = currentQuests[i];
        if (quest.status === 'completed') continue;
        for (const step of quest.steps) {
          if (!step.completed && step.action === action) {
            store.updateQuestProgress(quest.id, step.id);
            // Check if quest just completed
            const updatedQuest = store.quests[i];
            if (updatedQuest?.status === 'completed') {
              play('quest_complete');
            }
            break; // Only complete one step per quest per action
          }
        }
      }

      // Check for newly unlockable achievements
      const gameState = buildGameState();
      const unlockedIds = new Set(store.unlockedAchievements.map(a => a.id));
      const newAchievements = getNewlyUnlockableAchievements(gameState, unlockedIds);
      for (const achId of newAchievements) {
        store.unlockAchievement(achId);
        play('achievement');
      }
    },
    [store, play, buildGameState],
  );

  const recordActivityAction = useCallback(() => {
    store.recordActivity();
    const milestone = store.streak.currentStreak;
    if ([7, 30, 90].includes(milestone)) {
      play('streak');
    }
  }, [store, play]);

  const unlockAchievement = useCallback(
    (id: AchievementId) => {
      store.unlockAchievement(id);
      play('achievement');
    },
    [store, play],
  );

  const updateQuestProgressAction = useCallback(
    (questId: string, stepId: string) => {
      store.updateQuestProgress(questId, stepId);
    },
    [store],
  );

  // ── Return ─────────────────────────────────────────

  return {
    xp: store.totalXP,
    level,
    nextLevel,
    streak: store.streak,
    achievements: store.unlockedAchievements,
    activeQuests,
    awardXP,
    recordActivity: recordActivityAction,
    unlockAchievement,
    updateQuestProgress: updateQuestProgressAction,
    founderScore,
  };
}
