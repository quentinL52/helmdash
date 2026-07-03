'use client';

/**
 * PixelAchievementToast — Toast de notification d'achievement débloqué.
 *
 * Popup style jeu vidéo avec bordure pixel, animation d'entrée bounce+scale,
 * sparkle pixel, couleur selon rareté, auto-dismiss 5s.
 *
 * Purement visuel — reçoit toutes les données via props.
 */

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PixelAchievementToastProps {
  achievement: {
    name: string;
    emoji: string;
    xpReward: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  isVisible: boolean;
  onClose: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#7c5cfc',
  legendary: '#fbbf24',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'COMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
};

/** Simple pixel sparkle positions (relative %, x, y) for decorative particles */
const SPARKLE_POSITIONS = [
  { x: 10, y: 15, delay: 0 },
  { x: 85, y: 20, delay: 200 },
  { x: 20, y: 75, delay: 400 },
  { x: 75, y: 80, delay: 100 },
  { x: 50, y: 10, delay: 300 },
];

export function PixelAchievementToast({
  achievement,
  isVisible,
  onClose,
}: PixelAchievementToastProps) {
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const borderColor = RARITY_COLORS[achievement.rarity] ?? RARITY_COLORS.common;
  const rarityLabel = RARITY_LABELS[achievement.rarity] ?? 'COMMON';

  // Mount animation & auto-dismiss
  useEffect(() => {
    if (isVisible) {
      // Slight delay for CSS transition trigger
      const mountTimer = setTimeout(() => setMounted(true), 30);
      timerRef.current = setTimeout(onClose, 5000);
      return () => {
        clearTimeout(mountTimer);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    } else {
      setMounted(false);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999] pointer-events-auto"
      role="alert"
      aria-live="assertive"
    >
      <div
        className={cn(
          'relative min-w-[280px] max-w-[360px] px-5 py-4',
          'bg-card/95 backdrop-blur-md',
          'border-[3px] rounded-none shadow-2xl',
          'transition-all duration-500 ease-out',
          mounted
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-6 scale-90'
        )}
        style={{
          borderColor,
          boxShadow: `0 0 20px ${borderColor}33, 0 8px 32px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Sparkle particles */}
        {SPARKLE_POSITIONS.map((sp, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-none animate-ping"
            style={{
              left: `${sp.x}%`,
              top: `${sp.y}%`,
              backgroundColor: borderColor,
              animationDelay: `${sp.delay}ms`,
              animationDuration: '1.5s',
              opacity: 0.7,
            }}
          />
        ))}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-1 right-1.5 font-pixel text-xs',
            'text-muted-foreground hover:text-foreground transition-colors',
            'w-5 h-5 flex items-center justify-center'
          )}
          aria-label="Fermer"
        >
          ×
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center gap-2">
          {/* Emoji */}
          <span className="text-4xl select-none animate-bounce" style={{ animationDuration: '0.8s' }}>
            {achievement.emoji}
          </span>

          {/* Title */}
          <p
            className="font-pixel text-xs tracking-widest uppercase"
            style={{ color: borderColor }}
          >
            ACHIEVEMENT UNLOCKED!
          </p>

          {/* Name */}
          <p className="font-pixel text-sm text-foreground">{achievement.name}</p>

          {/* Rarity + XP */}
          <div className="flex items-center gap-3 font-pixel text-[10px]">
            <span
              className="px-1.5 py-0.5 border rounded-none"
              style={{ borderColor, color: borderColor }}
            >
              {rarityLabel}
            </span>
            <span className="text-success">+{achievement.xpReward} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
