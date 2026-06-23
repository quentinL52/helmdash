'use client';

/**
 * PixelMascot — Mascotte évolutive en pixel art (slime).
 *
 * 6 stades d'évolution rendus via des matrices SVG 12×12 avec
 * shapeRendering: 'crispEdges'. Moods (happy/neutral/thinking/celebrating),
 * bulle de dialogue, animations idle (breathing, bounce, shimmer).
 *
 * Purement visuel — reçoit toutes les données via props.
 */

import React from 'react';
import { cn } from '@/lib/utils';

type MascotStage = 'dreamer' | 'builder' | 'tester' | 'launcher' | 'scaler' | 'unicorn';

interface PixelMascotProps {
  stage: MascotStage;
  mood?: 'happy' | 'neutral' | 'thinking' | 'celebrating';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showBubble?: boolean;
  bubbleText?: string;
  className?: string;
}

/**
 * Color palette indices:
 * 0 = transparent
 * 1 = body
 * 2 = eye
 * 3 = mouth
 * 4 = accessory primary
 * 5 = accessory detail / secondary
 */
interface StageConfig {
  body: string;
  eye: string;
  mouth: string;
  acc: string;
  accDetail: string;
  matrix: number[][];
  anim: string;
}

const STAGES: Record<MascotStage, StageConfig> = {
  dreamer: {
    body: '#64748b',     // slate
    eye: '#94a3b8',
    mouth: '#94a3b8',
    acc: '#64748b',
    accDetail: '#475569',
    matrix: [
      // zzz above head
      [0,0,0,0,0,0,0,0,5,5,0,0],
      [0,0,0,0,0,0,0,0,0,5,0,0],
      [0,0,0,0,0,0,0,5,5,0,0,0],
      [0,0,0,0,1,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,2,1,1,2,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,3,3,3,3,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
    ],
    anim: 'animate-pulse',
  },
  builder: {
    body: '#3b82f6',     // blue
    eye: '#ffffff',
    mouth: '#ffffff',
    acc: '#f97316',      // orange helmet
    accDetail: '#ea580c',
    matrix: [
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,4,4,4,4,4,4,0,0,0],
      [0,0,4,4,4,4,4,4,4,4,0,0],
      [0,0,4,5,4,5,5,4,5,4,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,2,1,1,2,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,3,3,1,1,3,3,1,1,0],
      [0,1,1,1,3,3,3,3,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
    ],
    anim: 'animate-bounce',
  },
  tester: {
    body: '#10b981',     // emerald
    eye: '#ffffff',
    mouth: '#ffffff',
    acc: '#6ee7b7',      // goggles/fiole
    accDetail: '#34d399',
    matrix: [
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,0,0,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,4,4,1,1,4,4,1,1,0],
      [0,1,1,4,2,4,4,2,4,1,1,0],
      [0,1,1,4,4,1,1,4,4,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,3,3,3,3,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
    ],
    anim: '',
  },
  launcher: {
    body: '#7c5cfc',     // primary violet
    eye: '#ffffff',
    mouth: '#ffffff',
    acc: '#a78bfa',      // cape/rocket
    accDetail: '#c4b5fd',
    matrix: [
      [0,0,0,0,0,0,0,0,0,4,0,0],
      [0,0,0,0,0,0,0,0,4,5,0,0],
      [0,0,0,0,1,1,1,4,5,0,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,2,1,1,2,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,3,3,1,1,3,3,1,1,0],
      [0,1,1,1,3,3,3,3,1,1,1,0],
      [0,4,1,1,1,1,1,1,1,1,4,0],
      [0,0,4,1,1,1,1,1,1,4,0,0],
      [0,0,0,4,1,1,1,1,4,0,0,0],
    ],
    anim: 'animate-bounce',
  },
  scaler: {
    body: '#eab308',     // yellow/gold
    eye: '#ffffff',
    mouth: '#ffffff',
    acc: '#fbbf24',      // crown
    accDetail: '#f59e0b',
    matrix: [
      [0,0,4,0,4,0,4,0,4,0,0,0],
      [0,0,4,4,4,4,4,4,4,0,0,0],
      [0,0,5,5,5,5,5,5,5,0,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,2,1,1,2,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,1,1,1,1,1,1,1,1,0],
      [0,1,1,3,3,1,1,3,3,1,1,0],
      [0,1,1,1,3,3,3,3,1,1,1,0],
      [0,0,1,1,1,1,1,1,1,1,0,0],
      [0,0,0,1,1,1,1,1,1,0,0,0],
    ],
    anim: '',
  },
  unicorn: {
    body: '#fbbf24',     // gold
    eye: '#ffffff',
    mouth: '#ffffff',
    acc: '#ec4899',      // rainbow horn pink
    accDetail: '#8b5cf6', // rainbow detail violet
    matrix: [
      [0,0,0,0,0,4,0,0,0,0,0,0],
      [0,0,0,0,4,5,4,0,0,0,0,0],
      [0,0,0,0,5,4,5,0,0,0,0,0],
      [0,0,0,1,1,1,1,1,0,0,0,0],
      [0,0,1,1,1,1,1,1,1,0,0,0],
      [0,1,1,1,2,1,1,2,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,1,1,1,1,1,1,1,0,0],
      [0,1,1,3,3,1,1,3,3,1,0,0],
      [0,1,1,1,3,3,3,3,1,1,0,0],
      [0,0,1,1,1,1,1,1,1,0,0,0],
      [0,0,0,1,1,1,1,1,0,0,0,0],
    ],
    anim: '',
  },
};

const SIZE_MAP = {
  sm: { px: 48, viewBox: 12 },
  md: { px: 72, viewBox: 12 },
  lg: { px: 96, viewBox: 12 },
} as const;

export function PixelMascot({
  stage,
  mood = 'neutral',
  size = 'md',
  animated = true,
  showBubble = false,
  bubbleText,
  className,
}: PixelMascotProps) {
  const config = STAGES[stage];
  const sizeConf = SIZE_MAP[size];

  const resolvedBubbleText =
    bubbleText ?? (mood === 'thinking' ? '...' : mood === 'celebrating' ? '!!!' : undefined);

  const resolvedAnim = animated ? config.anim : '';
  const celebrateAnim = mood === 'celebrating' && animated ? 'animate-bounce' : '';

  const colorMap: Record<number, string> = {
    1: config.body,
    2: config.eye,
    3: config.mouth,
    4: config.acc,
    5: config.accDetail,
  };

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      {/* Speech bubble */}
      {showBubble && resolvedBubbleText && (
        <div
          className={cn(
            'mb-1 px-2 py-0.5 font-pixel text-[10px] text-foreground',
            'bg-card/90 border border-border/50 rounded-none',
            'relative whitespace-nowrap'
          )}
        >
          {resolvedBubbleText}
          {/* Triangle pointer */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-1 border-l border-r border-t border-border/50"
            style={{ backgroundColor: 'hsl(var(--card))' }}
          />
        </div>
      )}

      {/* Mascot SVG */}
      <div
        className={cn(resolvedAnim, celebrateAnim)}
        style={{
          width: sizeConf.px,
          height: sizeConf.px,
          // Breathing idle animation
          ...(animated && mood === 'neutral'
            ? { animation: 'mascotBreathe 3s ease-in-out infinite' }
            : {}),
        }}
      >
        <svg
          viewBox={`0 0 ${sizeConf.viewBox} ${sizeConf.viewBox}`}
          className="w-full h-full drop-shadow-md"
          style={{ shapeRendering: 'crispEdges' }}
        >
          {config.matrix.map((row, y) =>
            row.map((val, x) => {
              if (val === 0) return null;
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width={1}
                  height={1}
                  fill={colorMap[val] ?? config.body}
                />
              );
            })
          )}
        </svg>

        {/* Glow for scaler/unicorn */}
        {(stage === 'scaler' || stage === 'unicorn') && (
          <div
            className="absolute inset-0 rounded-full blur-xl pointer-events-none animate-pulse"
            style={{
              backgroundColor: stage === 'unicorn' ? '#fbbf2433' : '#eab30822',
            }}
          />
        )}
      </div>

      {/* Inline keyframes for breathing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mascotBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}} />
    </div>
  );
}
