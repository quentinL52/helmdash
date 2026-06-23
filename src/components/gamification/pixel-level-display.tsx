'use client';

/**
 * PixelLevelDisplay — Affichage compact du niveau et titre du fondateur.
 *
 * Deux variantes :
 * - `compact` : badge inline "LVL 7 🔨 Builder" en font-pixel
 * - `full` : bloc avec niveau en gros, titre, emoji et décorations pixel
 *
 * Purement visuel — reçoit toutes les données via props.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface PixelLevelDisplayProps {
  level: number;
  title: string;
  emoji: string;
  className?: string;
  variant?: 'compact' | 'full';
}

export function PixelLevelDisplay({
  level,
  title,
  emoji,
  className,
  variant = 'compact',
}: PixelLevelDisplayProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1',
          'bg-primary/10 border border-primary/20 rounded-none',
          'font-pixel text-xs',
          className
        )}
      >
        <span className="text-primary font-bold">LVL {level}</span>
        <span className="text-base leading-none">{emoji}</span>
        <span className="text-foreground/80">{title}</span>
      </div>
    );
  }

  // variant === 'full'
  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-2 px-6 py-4',
        'bg-card/50 backdrop-blur-sm border-2 border-primary/30 rounded-none',
        className
      )}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Pixel corner decorations */}
      <PixelCorner position="top-left" />
      <PixelCorner position="top-right" />
      <PixelCorner position="bottom-left" />
      <PixelCorner position="bottom-right" />

      {/* Level number */}
      <div className="font-pixel text-4xl text-primary font-bold tracking-wider">
        LVL {level}
      </div>

      {/* Emoji */}
      <span className="text-3xl select-none">{emoji}</span>

      {/* Title */}
      <p className="font-pixel text-sm text-foreground/80 tracking-wide uppercase">
        {title}
      </p>

      {/* Subtle background glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 blur-2xl"
        style={{ backgroundColor: 'hsl(var(--primary))' }}
      />
    </div>
  );
}

/** Small 3×3 pixel corner decoration */
function PixelCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const posClasses: Record<string, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  };

  return (
    <svg
      viewBox="0 0 3 3"
      className={cn('absolute w-3 h-3 text-primary/40', posClasses[position])}
      style={{ shapeRendering: 'crispEdges' }}
    >
      <rect x={0} y={0} width={1} height={1} fill="currentColor" />
      <rect x={1} y={0} width={1} height={1} fill="currentColor" />
      <rect x={0} y={1} width={1} height={1} fill="currentColor" />
    </svg>
  );
}
