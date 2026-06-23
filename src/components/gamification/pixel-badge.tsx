'use client';

/**
 * PixelBadge — Badge d'achievement en pixel art.
 *
 * Affiche un badge avec un emoji central, bordure colorée selon la rareté,
 * état verrouillé/déverrouillé, et animations (shimmer legendary, bounce).
 *
 * Purement visuel — reçoit toutes les données via props.
 */

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PixelBadgeProps {
  emoji: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  onClick?: () => void;
  className?: string;
}

const RARITY_CONFIG = {
  common: {
    border: '#6b7280',
    bg: 'rgba(107,114,128,0.12)',
    glow: 'none',
    label: 'Common',
  },
  rare: {
    border: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    glow: '0 0 8px rgba(59,130,246,0.3)',
    label: 'Rare',
  },
  epic: {
    border: 'hsl(247 68% 63%)',
    bg: 'rgba(124,92,252,0.12)',
    glow: '0 0 10px rgba(124,92,252,0.35)',
    label: 'Epic',
  },
  legendary: {
    border: '#fbbf24',
    bg: 'rgba(251,191,36,0.15)',
    glow: '0 0 14px rgba(251,191,36,0.4)',
    label: 'Legendary',
  },
} as const;

const SIZE_MAP = {
  sm: { container: 32, emoji: 'text-sm', text: 'text-[9px]' },
  md: { container: 48, emoji: 'text-xl', text: 'text-[10px]' },
  lg: { container: 64, emoji: 'text-3xl', text: 'text-xs' },
} as const;

export function PixelBadge({
  emoji,
  name,
  rarity,
  unlocked,
  size = 'md',
  showTooltip = true,
  onClick,
  className,
}: PixelBadgeProps) {
  const [hovered, setHovered] = useState(false);
  const rarityConf = RARITY_CONFIG[rarity];
  const sizeConf = SIZE_MAP[size];

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  return (
    <div
      className={cn('relative inline-flex flex-col items-center gap-1', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge container */}
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'relative flex items-center justify-center transition-transform duration-200',
          'border-2 rounded-none',
          onClick && 'cursor-pointer hover:scale-110 active:scale-95',
          !onClick && 'cursor-default',
          unlocked && rarity === 'legendary' && 'animate-pulse'
        )}
        style={{
          width: sizeConf.container,
          height: sizeConf.container,
          borderColor: unlocked ? rarityConf.border : '#3f3f46',
          backgroundColor: unlocked ? rarityConf.bg : 'rgba(63,63,70,0.1)',
          boxShadow: unlocked ? rarityConf.glow : 'none',
          imageRendering: 'pixelated',
          opacity: unlocked ? 1 : 0.3,
        }}
        aria-label={`${name} — ${rarityConf.label}${unlocked ? '' : ' (locked)'}`}
      >
        {/* Emoji or lock */}
        <span
          className={cn(sizeConf.emoji, 'select-none', !unlocked && 'blur-[2px]')}
          style={{ lineHeight: 1 }}
        >
          {emoji}
        </span>

        {/* Lock overlay */}
        {!unlocked && (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <svg
              viewBox="0 0 8 8"
              className="w-3/5 h-3/5 opacity-60"
              style={{ shapeRendering: 'crispEdges' }}
            >
              {/* Pixel lock icon 8x8 */}
              <rect x={2} y={0} width={4} height={1} fill="currentColor" />
              <rect x={1} y={1} width={1} height={1} fill="currentColor" />
              <rect x={6} y={1} width={1} height={1} fill="currentColor" />
              <rect x={1} y={2} width={1} height={1} fill="currentColor" />
              <rect x={6} y={2} width={1} height={1} fill="currentColor" />
              <rect x={0} y={3} width={8} height={1} fill="currentColor" />
              <rect x={0} y={4} width={8} height={1} fill="currentColor" />
              <rect x={0} y={5} width={8} height={1} fill="currentColor" />
              <rect x={3} y={5} width={2} height={1} fill="#1a1a2e" />
              <rect x={0} y={6} width={8} height={1} fill="currentColor" />
              <rect x={0} y={7} width={8} height={1} fill="currentColor" />
            </svg>
          </span>
        )}

        {/* Legendary shimmer overlay */}
        {unlocked && rarity === 'legendary' && (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ mixBlendMode: 'overlay' }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(251,191,36,0.35) 50%, transparent 60%)',
                animation: 'shimmer 2.5s ease-in-out infinite',
              }}
            />
          </div>
        )}
      </button>

      {/* Tooltip on hover */}
      {showTooltip && hovered && (
        <div
          className={cn(
            'absolute z-50 px-2 py-1 rounded-none border border-border/50',
            'bg-card/95 backdrop-blur-sm shadow-lg',
            'font-pixel whitespace-nowrap pointer-events-none',
            sizeConf.text
          )}
          style={{
            bottom: '100%',
            marginBottom: 6,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <span style={{ color: rarityConf.border }}>{rarityConf.label}</span>
          {' · '}
          <span className="text-foreground">{name}</span>
        </div>
      )}

      {/* Inline shimmer keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
      `}} />
    </div>
  );
}
