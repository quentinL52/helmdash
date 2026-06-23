/**
 * Level System
 * ────────────
 * Progressive levelling with a power-curve formula:
 *   xpForLevel(n) = floor(100 × n^1.5)
 *
 * Levels map to mascot evolution stages reflecting the founder journey:
 *   1-2   Dreamer  →  3-5  Builder  →  6-10 Tester
 *   11-15 Launcher →  16-25 Scaler  →  26+  Unicorn
 */

// ── Types ──────────────────────────────────────────────────────────────

export type MascotStage = 'dreamer' | 'builder' | 'tester' | 'launcher' | 'scaler' | 'unicorn';

export interface FounderLevel {
  level: number;
  title: string;
  titleFr: string;
  emoji: string;
  xpRequired: number;
  mascotStage: MascotStage;
}

export interface LevelProgress {
  /** XP accumulated within the current level band */
  current: number;
  /** Total XP needed to go from current level to next */
  required: number;
  /** Progress fraction 0-1 */
  progress: number;
}

// ── XP Curve ───────────────────────────────────────────────────────────

/** Calculate cumulative XP required to reach a given level (1-indexed). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

// ── Stage Mapping ──────────────────────────────────────────────────────

interface StageDefinition {
  minLevel: number;
  maxLevel: number;
  title: string;
  titleFr: string;
  emoji: string;
  mascotStage: MascotStage;
}

const STAGE_DEFINITIONS: StageDefinition[] = [
  { minLevel: 1,  maxLevel: 2,  title: 'Dreamer',  titleFr: 'Rêveur',          emoji: '💭', mascotStage: 'dreamer'  },
  { minLevel: 3,  maxLevel: 5,  title: 'Builder',  titleFr: 'Bâtisseur',       emoji: '🔨', mascotStage: 'builder'  },
  { minLevel: 6,  maxLevel: 10, title: 'Tester',   titleFr: 'Expérimentateur', emoji: '🧪', mascotStage: 'tester'   },
  { minLevel: 11, maxLevel: 15, title: 'Launcher', titleFr: 'Lanceur',         emoji: '🚀', mascotStage: 'launcher' },
  { minLevel: 16, maxLevel: 25, title: 'Scaler',   titleFr: 'Stratège',        emoji: '📈', mascotStage: 'scaler'   },
  { minLevel: 26, maxLevel: Infinity, title: 'Unicorn', titleFr: 'Licorne',    emoji: '🦄', mascotStage: 'unicorn'  },
];

function getStageForLevel(level: number): StageDefinition {
  return STAGE_DEFINITIONS.find(s => level >= s.minLevel && level <= s.maxLevel) ?? STAGE_DEFINITIONS[0];
}

// ── Level Table ────────────────────────────────────────────────────────

/** Max pre-computed level (levels beyond this are computed on the fly). */
const MAX_PRECOMPUTED_LEVEL = 50;

/**
 * Pre-computed level table (levels 1 through MAX_PRECOMPUTED_LEVEL).
 * Avoids recalculating for common lookups.
 */
export const ALL_LEVELS: FounderLevel[] = Array.from({ length: MAX_PRECOMPUTED_LEVEL }, (_, i) => {
  const level = i + 1;
  const stage = getStageForLevel(level);
  return {
    level,
    title: stage.title,
    titleFr: stage.titleFr,
    emoji: stage.emoji,
    xpRequired: xpForLevel(level),
    mascotStage: stage.mascotStage,
  };
});

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Determine the current level for a given total XP.
 * Scans from highest pre-computed level downward; falls back to binary search for extreme values.
 */
export function getLevelForXP(xp: number): FounderLevel {
  // Fast path: scan pre-computed table in reverse
  for (let i = ALL_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= ALL_LEVELS[i].xpRequired) {
      return ALL_LEVELS[i];
    }
  }
  return ALL_LEVELS[0];
}

/**
 * Get progress toward the next level.
 *
 * @returns `current` = XP earned within this level band,
 *          `required` = total XP width of the band,
 *          `progress` = 0-1 fraction.
 */
export function getXPForNextLevel(currentXP: number): LevelProgress {
  const currentLevel = getLevelForXP(currentXP);
  const currentThreshold = currentLevel.xpRequired;
  const nextThreshold = xpForLevel(currentLevel.level + 1);
  const bandWidth = nextThreshold - currentThreshold;

  // Guard against division by zero at max pre-computed level
  if (bandWidth <= 0) {
    return { current: 0, required: 1, progress: 1 };
  }

  const earned = currentXP - currentThreshold;
  return {
    current: earned,
    required: bandWidth,
    progress: Math.min(earned / bandWidth, 1),
  };
}
