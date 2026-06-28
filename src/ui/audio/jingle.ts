// jingle.ts — tier-scaled win jingle synthesis via Tone.js (SPEC-027).
// DEC-007: synthesized audio, win-jingle only, gated by caller (useWinJingle).
// Named imports keep the bundle as tree-shakeable as possible.
import { start, now, Synth } from 'tone';
import type { WinTier } from '../../engine/index';

export const JINGLE_NOTES: Record<'small' | 'big' | 'jackpot', string[]> = {
  small:   ['C5', 'E5', 'G5'],
  big:     ['C5', 'E5', 'G5', 'C6', 'E6'],
  jackpot: ['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'],
};

export function playJingle(tier: WinTier): void {
  if (tier === 'none') return;
  try {
    // After the 'none' guard, tier is 'small' | 'big' | 'jackpot' — safe to index.
    const notes = JINGLE_NOTES[tier as keyof typeof JINGLE_NOTES];
    void start();                       // resume the AudioContext (gesture has occurred)
    const synth = new Synth().toDestination();
    const t0 = now();
    notes.forEach((note, i) => synth.triggerAttackRelease(note, '8n', t0 + i * 0.12));
  } catch {
    // Audio is best-effort — a missing AudioContext must never break the app.
  }
}
