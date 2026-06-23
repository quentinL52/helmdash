/**
 * useSound Hook
 * ─────────────
 * Thin React wrapper around SoundManager.
 * Syncs with the gamification store's sound preferences.
 *
 * Usage:
 *   const { play, enabled, setEnabled } = useSound();
 *   play('level_up');
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useGamificationStore } from '@/store/gamification-store';
import { SoundManager } from '@/lib/gamification/sound-manager';
import type { SoundEffect } from '@/lib/gamification/sound-manager';

// ── Hook Return Type ───────────────────────────────────────────────────

export interface UseSoundReturn {
  /** Play a sound effect. No-op if sounds are disabled. */
  play: (effect: SoundEffect) => void;
  /** Whether sounds are currently enabled. */
  enabled: boolean;
  /** Toggle sounds on/off (persisted). */
  setEnabled: (v: boolean) => void;
  /** Current volume (0-1). */
  volume: number;
  /** Set volume (0-1, persisted). */
  setVolume: (v: number) => void;
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useSound(): UseSoundReturn {
  const soundEnabled = useGamificationStore(s => s.soundEnabled);
  const soundVolume = useGamificationStore(s => s.soundVolume);
  const setSoundEnabled = useGamificationStore(s => s.setSoundEnabled);
  const setSoundVolume = useGamificationStore(s => s.setSoundVolume);

  // Single manager instance per component tree
  const managerRef = useRef<SoundManager | null>(null);

  if (!managerRef.current && typeof window !== 'undefined') {
    managerRef.current = new SoundManager(soundEnabled, soundVolume);
    managerRef.current.preload();
  }

  // Sync store prefs → manager
  useEffect(() => {
    managerRef.current?.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    managerRef.current?.setVolume(soundVolume);
  }, [soundVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      managerRef.current?.dispose();
      managerRef.current = null;
    };
  }, []);

  const play = useCallback((effect: SoundEffect) => {
    managerRef.current?.play(effect);
  }, []);

  const setEnabled = useCallback(
    (v: boolean) => {
      setSoundEnabled(v);
      managerRef.current?.setEnabled(v);
    },
    [setSoundEnabled],
  );

  const setVolume = useCallback(
    (v: number) => {
      setSoundVolume(v);
      managerRef.current?.setVolume(v);
    },
    [setSoundVolume],
  );

  return {
    play,
    enabled: soundEnabled,
    setEnabled,
    volume: soundVolume,
    setVolume,
  };
}
