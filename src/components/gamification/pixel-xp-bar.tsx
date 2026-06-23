'use client';

/**
 * PixelXPBar — Barre de progression XP style RPG.
 *
 * Affiche la progression XP courante vers le prochain niveau avec un rendu
 * pixelisé. Segments discrets, gradient violet→vert, label de niveau et XP,
 * glow subtil quand on approche du level-up (>80%).
 *
 * Purement visuel — reçoit toutes les données via props.
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PixelXPBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  title: string;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { barHeight: 12, fontSize: 'text-[10px]', segments: 16, gap: 1 },
  md: { barHeight: 20, fontSize: 'text-xs', segments: 20, gap: 1 },
  lg: { barHeight: 28, fontSize: 'text-sm', segments: 24, gap: 2 },
} as const;

export function PixelXPBar({
  currentXP,
  requiredXP,
  level,
  title,
  className,
  showLabel = true,
  size = 'md',
}: PixelXPBarProps) {
  const config = SIZE_CONFIG[size];
  const progress = Math.min(Math.max(currentXP / requiredXP, 0), 1);
  const filledSegments = Math.round(progress * config.segments);
  const isNearLevelUp = progress > 0.8;

  /** Generate interpolated color from violet (#7c5cfc) to emerald (#00b874) */
  const getSegmentColor = useMemo(() => {
    return (index: number, total: number): string => {
      const t = index / Math.max(total - 1, 1);
      // Violet primary: rgb(124, 92, 252) → Success green: rgb(0, 184, 116)
      const r = Math.round(124 + (0 - 124) * t);
      const g = Math.round(92 + (184 - 92) * t);
      const b = Math.round(252 + (116 - 252) * t);
      return `rgb(${r},${g},${b})`;
    };
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {/* Labels row */}
      <div className={cn('flex items-center justify-between mb-1', config.fontSize)}>
        <span className="font-pixel text-primary tracking-wide">
          LVL {level}
          <span className="ml-1.5 text-muted-foreground">{title}</span>
        </span>
        {showLabel && (
          <span className="font-pixel text-muted-foreground">
            {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
          </span>
        )}
      </div>

      {/* Bar container — pixel border */}
      <div
        className={cn(
          'relative w-full rounded-none border-2 border-primary/40 bg-background/80',
          isNearLevelUp && 'border-primary shadow-[0_0_12px_2px_hsl(var(--primary)/0.35)]'
        )}
        style={{
          height: config.barHeight,
          imageRendering: 'pixelated',
          transition: 'box-shadow 0.6s ease',
        }}
      >
        {/* Pixel segments SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${config.segments} 1`}
          style={{ shapeRendering: 'crispEdges' }}
        >
          {/* Background segments (dark) */}
          {Array.from({ length: config.segments }).map((_, i) => (
            <rect
              key={`bg-${i}`}
              x={i}
              y={0}
              width={1 - config.gap / config.segments}
              height={1}
              fill="hsl(224 71% 8%)"
            />
          ))}

          {/* Filled segments */}
          {Array.from({ length: filledSegments }).map((_, i) => (
            <rect
              key={`fill-${i}`}
              x={i}
              y={0}
              width={1 - config.gap / config.segments}
              height={1}
              fill={getSegmentColor(i, filledSegments)}
              style={{
                opacity: 1,
                transition: `opacity 0.3s ease ${i * 30}ms`,
              }}
            />
          ))}
        </svg>

        {/* Glow overlay when near level-up */}
        {isNearLevelUp && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background:
                'linear-gradient(90deg, transparent 60%, hsl(var(--primary) / 0.15) 100%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
