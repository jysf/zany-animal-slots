// ambientBed.ts — generative ambient music bed on the 'bed' channel (SPEC-028).
// DEC-013: uses Tone.Transport + Loop for correct musical timing.
// DEC-007: synthesized only, no asset files; gated by caller (useAmbientBed).
// SPEC-048: DEFAULT_BED_MUSIC is the baseline/default; a mutable `activeMusic` layer
// lets a machine override the chord + timings. Applies on the NEXT startBed — no
// mid-loop hot-swap (a machine switch re-gates the bed anyway via SPEC-049/050).
import { getTransport, Loop, PolySynth, Synth } from 'tone';
import { ensureAudio, getChannel } from './audioEngine';

let loop: Loop | null = null;
let pad: PolySynth | null = null;

export const DEFAULT_BED_MUSIC = { chord: ['C3', 'G3', 'C4', 'E4'], noteDuration: '2n', loopInterval: '2m' };

let activeMusic = { ...DEFAULT_BED_MUSIC };

/** Set the active per-machine bed music; applies on the next startBed. */
export function setBedMusic(music: typeof DEFAULT_BED_MUSIC): void {
  activeMusic = { ...music };
}

/** Test/inspection helper: the current active bed music. */
export function getActiveBedMusic(): typeof DEFAULT_BED_MUSIC {
  return activeMusic;
}

export function startBed(): void {
  if (loop) return; // already running — no double loop
  try {
    ensureAudio();
    pad = new PolySynth(Synth).connect(getChannel('bed'));
    loop = new Loop(
      (time) => pad?.triggerAttackRelease(activeMusic.chord, activeMusic.noteDuration, time),
      activeMusic.loopInterval,
    ).start(0);
    getTransport().start();
  } catch {
    // best-effort — audio must never break the app
  }
}

export function stopBed(): void {
  try {
    loop?.stop().dispose();
    pad?.dispose();
  } catch {
    // ignore
  }
  loop = null;
  pad = null;
}
