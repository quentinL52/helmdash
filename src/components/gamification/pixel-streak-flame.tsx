'use client';

/**
 * PixelStreakFlame — Flamme animée représentant le streak de connexion.
 *
 * SVG pixel art avec 3 frames d'animation alternées pour un effet "flicker".
 * Taille et intensité augmentent avec le streak. 4 statuts visuels :
 * active (flamme vive), at-risk (clignotante), broken (cendres).
 *
 * Purement visuel — reçoit toutes les données via props.
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PixelStreakFlameProps {
  streak: number;
  status: 'active' | 'at-risk' | 'broken';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { px: 24, label: 'text-[10px]' },
  md: { px: 36, label: 'text-xs' },
  lg: { px: 48, label: 'text-sm' },
} as const;

/** Get flame tier based on streak count */
function getFlameTier(streak: number): 'small' | 'medium' | 'large' | 'golden' {
  if (streak >= 90) return 'golden';
  if (streak >= 30) return 'large';
  if (streak >= 7) return 'medium';
  return 'small';
}

const FLAME_COLORS = {
  small: { core: '#f97316', mid: '#fb923c', tip: '#fbbf24' },
  medium: { core: '#ea580c', mid: '#f97316', tip: '#fbbf24' },
  large: { core: '#dc2626', mid: '#f97316', tip: '#fde047' },
  golden: { core: '#f59e0b', mid: '#fbbf24', tip: '#fef08a' },
};

/**
 * 3 flame animation frames (8×12 grid).
 * Values: 0=transparent, 1=core, 2=mid, 3=tip
 */
const FLAME_FRAMES_SMALL: number[][][] = [
  // Frame 0
  [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,3,0,0,0,0],
    [0,0,0,3,3,0,0,0],
    [0,0,3,2,3,0,0,0],
    [0,0,2,1,2,0,0,0],
    [0,0,2,1,2,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  // Frame 1
  [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,3,0,0,0],
    [0,0,0,3,3,0,0,0],
    [0,0,0,2,3,0,0,0],
    [0,0,2,1,2,0,0,0],
    [0,0,2,1,2,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
];

const FLAME_FRAMES_MEDIUM: number[][][] = [
  [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,3,0,0,0,0],
    [0,0,0,3,3,0,0,0],
    [0,0,3,3,3,0,0,0],
    [0,0,3,2,3,0,0,0],
    [0,0,2,2,2,3,0,0],
    [0,2,2,1,2,2,0,0],
    [0,0,2,1,1,2,0,0],
    [0,0,2,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
  ],
  [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,3,0,0,0],
    [0,0,0,3,3,0,0,0],
    [0,0,0,3,3,3,0,0],
    [0,0,3,2,3,0,0,0],
    [0,0,2,2,2,0,0,0],
    [0,0,2,1,2,2,0,0],
    [0,2,1,1,2,0,0,0],
    [0,0,2,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
  ],
];

const FLAME_FRAMES_LARGE: number[][][] = [
  [
    [0,0,0,0,0,0,0,0],
    [0,0,0,3,0,0,0,0],
    [0,0,0,3,3,0,0,0],
    [0,0,3,3,3,0,0,0],
    [0,0,3,3,3,3,0,0],
    [0,3,3,2,3,3,0,0],
    [0,3,2,2,2,3,0,0],
    [0,2,2,1,2,2,0,0],
    [0,2,1,1,1,2,0,0],
    [0,2,1,1,1,2,0,0],
    [0,0,2,1,1,0,0,0],
    [0,0,0,1,0,0,0,0],
  ],
  [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,3,0,0,0],
    [0,0,0,3,3,0,0,0],
    [0,0,0,3,3,3,0,0],
    [0,0,3,3,3,3,0,0],
    [0,0,3,2,3,3,0,0],
    [0,3,2,2,2,3,3,0],
    [0,2,2,1,2,2,0,0],
    [0,2,1,1,1,2,0,0],
    [0,2,1,1,1,2,0,0],
    [0,0,1,1,2,0,0,0],
    [0,0,0,1,0,0,0,0],
  ],
];

/** Ashes/smoke frame for broken status */
const ASH_FRAME: number[][] = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,1,0,0,0,0],
  [0,0,0,0,1,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,1,0,1,0,0,0],
  [0,0,1,1,1,1,0,0],
];

function getFramesForTier(tier: 'small' | 'medium' | 'large' | 'golden'): number[][][] {
  switch (tier) {
    case 'small': return FLAME_FRAMES_SMALL;
    case 'medium': return FLAME_FRAMES_MEDIUM;
    case 'large':
    case 'golden':
      return FLAME_FRAMES_LARGE;
  }
}

export function PixelStreakFlame({
  streak,
  status,
  size = 'md',
  className,
}: PixelStreakFlameProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const sizeConf = SIZE_MAP[size];
  const tier = getFlameTier(streak);
  const colors = FLAME_COLORS[tier];
  const frames = getFramesForTier(tier);

  // Alternate flame frames for flicker animation
  useEffect(() => {
    if (status === 'broken') return;
    const interval = setInterval(
      () => setFrameIndex(prev => (prev + 1) % frames.length),
      status === 'at-risk' ? 200 : 350
    );
    return () => clearInterval(interval);
  }, [status, frames.length]);

  const currentFrame = status === 'broken' ? ASH_FRAME : frames[frameIndex];

  const colorMap: Record<number, string> = status === 'broken'
    ? { 1: '#6b7280' }
    : { 1: colors.core, 2: colors.mid, 3: colors.tip };

  return (
    <div className={cn('inline-flex flex-col items-center gap-0.5', className)}>
      {/* Flame SVG */}
      <div
        className={cn(
          status === 'at-risk' && 'animate-pulse',
          status === 'broken' && 'opacity-40'
        )}
        style={{
          width: sizeConf.px,
          height: sizeConf.px * 1.5,
        }}
      >
        <svg
          viewBox="0 0 8 12"
          className="w-full h-full"
          style={{ shapeRendering: 'crispEdges' }}
        >
          {currentFrame.map((row, y) =>
            row.map((val, x) => {
              if (val === 0) return null;
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill={colorMap[val] ?? colors.core}
                />
              );
            })
          )}
        </svg>

        {/* Glow for golden tier */}
        {tier === 'golden' && status === 'active' && (
          <div
            className="absolute inset-0 blur-lg pointer-events-none animate-pulse"
            style={{ backgroundColor: '#fbbf2433' }}
          />
        )}
      </div>

      {/* Streak number */}
      <span
        className={cn(
          'font-pixel font-bold',
          sizeConf.label,
          status === 'broken' ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {streak}
      </span>
    </div>
  );
}
