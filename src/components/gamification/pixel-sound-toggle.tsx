'use client';

/**
 * PixelSoundToggle — Toggle pour activer/désactiver les sons 8-bit.
 *
 * Icône haut-parleur en pixel art SVG 8×8, label "SFX: ON/OFF" en font-pixel,
 * slider de volume optionnel pixelisé.
 *
 * Purement visuel — reçoit toutes les données via props.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface PixelSoundToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  className?: string;
}

/** 8×8 speaker ON icon — 0=transparent, 1=speaker body, 2=sound wave */
const SPEAKER_ON: number[][] = [
  [0,0,0,1,0,0,0,0],
  [0,0,1,1,0,2,0,0],
  [1,1,1,1,0,0,2,0],
  [1,1,1,1,0,2,0,2],
  [1,1,1,1,0,2,0,2],
  [1,1,1,1,0,0,2,0],
  [0,0,1,1,0,2,0,0],
  [0,0,0,1,0,0,0,0],
];

/** 8×8 speaker OFF icon — 0=transparent, 1=speaker body, 3=cross */
const SPEAKER_OFF: number[][] = [
  [0,0,0,1,0,0,0,0],
  [0,0,1,1,0,0,0,0],
  [1,1,1,1,0,3,0,3],
  [1,1,1,1,0,0,3,0],
  [1,1,1,1,0,0,3,0],
  [1,1,1,1,0,3,0,3],
  [0,0,1,1,0,0,0,0],
  [0,0,0,1,0,0,0,0],
];

export function PixelSoundToggle({
  enabled,
  onToggle,
  volume,
  onVolumeChange,
  className,
}: PixelSoundToggleProps) {
  const matrix = enabled ? SPEAKER_ON : SPEAKER_OFF;
  const showVolume = volume !== undefined && onVolumeChange !== undefined && enabled;

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1',
          'border border-border/40 rounded-none',
          'bg-card/50 hover:bg-card/80 transition-colors',
          'cursor-pointer select-none'
        )}
        aria-label={enabled ? 'Désactiver les sons' : 'Activer les sons'}
      >
        {/* Pixel speaker icon */}
        <svg
          viewBox="0 0 8 8"
          className="w-4 h-4"
          style={{ shapeRendering: 'crispEdges' }}
        >
          {matrix.map((row, y) =>
            row.map((val, x) => {
              if (val === 0) return null;
              let fill = 'hsl(var(--foreground))';
              if (val === 2) fill = 'hsl(var(--primary))';
              if (val === 3) fill = '#ef4444';
              return (
                <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />
              );
            })
          )}
        </svg>

        {/* Label */}
        <span className="font-pixel text-[10px] text-foreground/80">
          SFX: {enabled ? 'ON' : 'OFF'}
        </span>
      </button>

      {/* Optional volume slider */}
      {showVolume && (
        <div className="flex items-center gap-1.5">
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={e => onVolumeChange(Number(e.target.value))}
            className="w-16 h-1 appearance-none bg-border/40 cursor-pointer"
            style={{
              imageRendering: 'pixelated',
              accentColor: 'hsl(var(--primary))',
            }}
            aria-label="Volume"
          />
          <span className="font-pixel text-[9px] text-muted-foreground w-6 text-right">
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
}
