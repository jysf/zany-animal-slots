// audioEngine.ts — shared singleton audio graph (SPEC-028, DEC-013).
// Lazily creates a master Gain → destination and named channel Gains.
// All creation is guarded so a missing AudioContext (jsdom / SSR) never throws.
import { start, Gain } from 'tone';

export const CHANNEL_GAINS: Record<'bed' | 'sfx' | 'jingle', number> = {
  bed: 0.25,
  sfx: 0.6,
  jingle: 0.8,
};

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

export function getChannel(name: keyof typeof CHANNEL_GAINS): Gain {
  let ch = channels.get(name);
  if (!ch) {
    ch = new Gain(CHANNEL_GAINS[name]).connect(getMaster());
    channels.set(name, ch);
  }
  return ch;
}
