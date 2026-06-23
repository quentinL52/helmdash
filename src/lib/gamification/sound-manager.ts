/**
 * Sound Manager
 * ─────────────
 * Lightweight 8-bit sound effect manager using the Web Audio API (`HTMLAudioElement`).
 * Handles preloading, volume control, and graceful degradation when sounds are disabled.
 *
 * Sound files are expected at: `/sounds/<effect>.mp3`
 * These files should be placed in `public/sounds/` by the developer.
 */

// ── Types ──────────────────────────────────────────────────────────────

export type SoundEffect =
  | 'xp_gain'
  | 'level_up'
  | 'achievement'
  | 'quest_complete'
  | 'streak'
  | 'click';

// ── File Mapping ───────────────────────────────────────────────────────

/** Map each effect to its audio file path under `/sounds/`. */
const SOUND_FILES: Record<SoundEffect, string> = {
  xp_gain:        '/sounds/xp_gain.mp3',
  level_up:       '/sounds/level_up.mp3',
  achievement:    '/sounds/achievement.mp3',
  quest_complete: '/sounds/quest_complete.mp3',
  streak:         '/sounds/streak.mp3',
  click:          '/sounds/click.mp3',
};

// ── Manager ────────────────────────────────────────────────────────────

/**
 * Singleton-friendly sound manager.
 * Create one instance and share it across the app via a hook.
 */
export class SoundManager {
  private enabled: boolean;
  private volume: number;
  private audioCache: Map<SoundEffect, HTMLAudioElement>;

  constructor(enabled = true, volume = 0.5) {
    this.enabled = enabled;
    this.volume = Math.min(1, Math.max(0, volume));
    this.audioCache = new Map();
  }

  /** Toggle sound on/off. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /** Check if sound is currently enabled. */
  isEnabled(): boolean {
    return this.enabled;
  }

  /** Set master volume (clamped to 0-1). */
  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    // Update volume on any already-cached elements
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  /** Get current volume. */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Play a sound effect.
   * No-op if sounds are disabled or if running in a non-browser environment.
   */
  play(effect: SoundEffect): void {
    if (!this.enabled) return;
    if (typeof window === 'undefined') return;

    try {
      let audio = this.audioCache.get(effect);

      if (!audio) {
        audio = new Audio(SOUND_FILES[effect]);
        this.audioCache.set(effect, audio);
      }

      audio.volume = this.volume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silently swallow play errors (e.g., autoplay policy, missing file)
      });
    } catch {
      // Non-critical — never crash the app over a missing sound
    }
  }

  /**
   * Preload all sound files into the cache.
   * Call once on app mount for snappier playback.
   */
  preload(): void {
    if (typeof window === 'undefined') return;

    for (const [effect, path] of Object.entries(SOUND_FILES)) {
      if (!this.audioCache.has(effect as SoundEffect)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = this.volume;
        this.audioCache.set(effect as SoundEffect, audio);
      }
    }
  }

  /** Release all cached audio elements. */
  dispose(): void {
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();
  }
}

// ── Singleton Instance ─────────────────────────────────────────────────

let _instance: SoundManager | null = null;

/** Get (or create) the global SoundManager singleton. */
export function getSoundManager(): SoundManager {
  if (!_instance) {
    _instance = new SoundManager();
  }
  return _instance;
}
