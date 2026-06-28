// ambientBed.ts — generative ambient music bed on the 'bed' channel (SPEC-028).
// DEC-013: uses Tone.Transport + Loop for correct musical timing.
// DEC-007: synthesized only, no asset files; gated by caller (useAmbientBed).
import { getTransport, Loop, PolySynth, Synth } from 'tone';
import { ensureAudio, getChannel } from './audioEngine';

let loop: Loop | null = null;
let pad: PolySynth | null = null;

const CHORD = ['C3', 'G3', 'C4', 'E4'];

export function startBed(): void {
  if (loop) return; // already running — no double loop
  try {
    ensureAudio();
    pad = new PolySynth(Synth).connect(getChannel('bed'));
    loop = new Loop((time) => pad?.triggerAttackRelease(CHORD, '2n', time), '2m').start(0);
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
