// sfx.ts — mechanical sound layer synthesis through the sfx channel (SPEC-029).
// DEC-013: all synths connect to getChannel('sfx'), never toDestination().
// DEC-007: synthesized only; no audio assets.
// Best-effort: playSfx never throws — the catch guards against missing AudioContext.
import { now, MembraneSynth, NoiseSynth, MetalSynth } from 'tone';
import { ensureAudio, getChannel } from './audioEngine';

export type SfxName = 'spin' | 'reelStop' | 'win';

/** Number of staggered membrane hits fired when the reels land. */
export const REEL_STOP_CLUNKS = 5;

export function playSfx(name: SfxName): void {
  try {
    ensureAudio();
    const ch = getChannel('sfx');
    const t0 = now();
    if (name === 'spin') {
      const whoosh = new NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.25, sustain: 0 } }).connect(ch);
      whoosh.triggerAttackRelease('8n', t0);
    } else if (name === 'reelStop') {
      const drum = new MembraneSynth().connect(ch);
      for (let i = 0; i < REEL_STOP_CLUNKS; i++) {
        drum.triggerAttackRelease('C2', '16n', t0 + i * 0.09);
      }
    } else {
      // 'win' — a brief percussive coin ting that layers under the melodic jingle
      const ting = new MetalSynth().connect(ch);
      ting.triggerAttackRelease('C6', '16n', t0);
    }
  } catch {
    // Audio is best-effort — a missing AudioContext must never break the app.
  }
}
