// audioEngine.ts — shared singleton audio graph (SPEC-028, DEC-013).
// Lazily creates a master Gain → destination and named channel Gains.
// All creation is guarded so a missing AudioContext (jsdom / SSR) never throws.
// SPEC-048: CHANNEL_GAINS stays the baseline/default; a mutable `activeGains` layer
// lets a machine override the per-channel levels (DEC-013 graph itself is unchanged).
import { start, Gain } from 'tone';

export const CHANNEL_GAINS: Record<'bed' | 'sfx' | 'jingle', number> = {
  bed: 0.25,
  sfx: 0.6,
  jingle: 0.8,
};

let activeGains: Record<'bed' | 'sfx' | 'jingle', number> = { ...CHANNEL_GAINS };

let master: Gain | null = null;
const channels = new Map<string, Gain>();

export function ensureAudio(): void {
  try {
    void start();
  } catch {
    // best-effort — missing AudioContext must never throw into the app
  }
}

export function getMaster(): Gain {
  if (!master) {
    master = new Gain(1).toDestination();
  }
  return master;
}

/** The current (possibly machine-overridden) gain for a channel. */
export function getActiveChannelGain(name: keyof typeof CHANNEL_GAINS): number {
  return activeGains[name];
}

/** Set the active per-machine channel gains; ramps any already-created channel to the new value. */
export function setChannelGains(gains: Record<'bed' | 'sfx' | 'jingle', number>): void {
  activeGains = { ...gains };
  for (const [name, ch] of channels) {
    try {
      ch.gain.value = activeGains[name as keyof typeof CHANNEL_GAINS];
    } catch {
      /* best-effort */
    }
  }
}

export function getChannel(name: keyof typeof CHANNEL_GAINS): Gain {
  let ch = channels.get(name);
  if (!ch) {
    ch = new Gain(activeGains[name]).connect(getMaster());
    channels.set(name, ch);
  }
  return ch;
}
