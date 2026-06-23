'use client';

/**
 * PixelQuestCard — Carte de quête affichant les étapes d'une mission.
 *
 * Style "parchemin de quête" pixel avec header typé (onboarding/weekly/epic),
 * steps ☑/☐, barre de progression, récompense XP, et countdown optionnel.
 *
 * Purement visuel — reçoit toutes les données via props.
 */

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PixelQuestCardProps {
  quest: {
    title: string;
    emoji: string;
    type: 'onboarding' | 'weekly' | 'epic';
    steps: { label: string; completed: boolean; xpReward: number }[];
    completionBonus: number;
    expiresAt?: string;
  };
  className?: string;
}

const TYPE_CONFIG = {
  onboarding: {
    label: 'ONBOARDING',
    border: '#10b981',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  weekly: {
    label: 'WEEKLY',
    border: '#3b82f6',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  epic: {
    label: 'EPIC',
    border: '#fbbf24',
    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
} as const;

/** Format remaining time from ISO date */
function formatTimeLeft(expiresAt: string): string {
  const now = Date.now();
  const target = new Date(expiresAt).getTime();
  const diff = target - now;

  if (diff <= 0) return 'Expiré';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `Expire dans ${days}j ${hours}h`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `Expire dans ${hours}h ${minutes}m`;
}

export function PixelQuestCard({ quest, className }: PixelQuestCardProps) {
  const typeConf = TYPE_CONFIG[quest.type];
  const completedCount = quest.steps.filter(s => s.completed).length;
  const totalSteps = quest.steps.length;
  const progress = totalSteps > 0 ? completedCount / totalSteps : 0;
  const isComplete = completedCount === totalSteps;

  const totalXP = useMemo(
    () => quest.steps.reduce((sum, s) => sum + s.xpReward, 0) + quest.completionBonus,
    [quest.steps, quest.completionBonus]
  );

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden',
        'bg-card/60 backdrop-blur-sm',
        'border-2 rounded-none',
        isComplete && 'opacity-70',
        className
      )}
      style={{
        borderColor: typeConf.border,
        imageRendering: 'pixelated',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: `${typeConf.border}33` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{quest.emoji}</span>
          <h3 className="font-pixel text-sm text-foreground truncate">{quest.title}</h3>
        </div>
        <span
          className={cn(
            'flex-shrink-0 font-pixel text-[9px] px-1.5 py-0.5 border rounded-none uppercase tracking-wider',
            typeConf.badge
          )}
        >
          {typeConf.label}
        </span>
      </div>

      {/* Steps list */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {quest.steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center justify-between gap-2 text-xs',
              step.completed && 'opacity-50'
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* Pixel checkbox */}
              <span className="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center">
                <svg
                  viewBox="0 0 5 5"
                  className="w-full h-full"
                  style={{ shapeRendering: 'crispEdges' }}
                >
                  {/* Border */}
                  <rect x={0} y={0} width={5} height={5} fill="none" stroke={typeConf.border} strokeWidth={0.6} />
                  {/* Fill if completed */}
                  {step.completed && (
                    <>
                      <rect x={1} y={2} width={1} height={1} fill={typeConf.border} />
                      <rect x={2} y={3} width={1} height={1} fill={typeConf.border} />
                      <rect x={3} y={1} width={1} height={1} fill={typeConf.border} />
                      <rect x={3} y={2} width={1} height={1} fill={typeConf.border} />
                    </>
                  )}
                </svg>
              </span>
              <span
                className={cn(
                  'truncate',
                  step.completed ? 'line-through text-muted-foreground' : 'text-foreground/80'
                )}
              >
                {step.label}
              </span>
            </div>
            <span className="flex-shrink-0 font-pixel text-[10px] text-emerald-400/70">
              +{step.xpReward}
            </span>
          </div>
        ))}
      </div>

      {/* Footer: progress + reward + expiry */}
      <div
        className="mt-auto px-4 py-2.5 border-t flex flex-col gap-2"
        style={{ borderColor: `${typeConf.border}22` }}
      >
        {/* Mini progress bar */}
        <div className="w-full h-1.5 bg-background/60 rounded-none overflow-hidden">
          <div
            className="h-full rounded-none transition-all duration-500 ease-out"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: typeConf.border,
            }}
          />
        </div>

        <div className="flex items-center justify-between font-pixel text-[10px]">
          <span className="text-muted-foreground">
            {completedCount}/{totalSteps} · Bonus : +{quest.completionBonus} XP
          </span>
          {quest.expiresAt && (
            <span className="text-warning">{formatTimeLeft(quest.expiresAt)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
