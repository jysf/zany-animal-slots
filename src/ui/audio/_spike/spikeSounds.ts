// spikeSounds.ts — AUDIO SPIKE prototype (NOT production). Investigation only.
//
// A/B pairs: the CURRENT synthesis (as shipped in src/ui/audio/**) vs a RETUNED
// synthesis that stays 100% synth-only (no asset files — DEC-007 unchanged) but
// adds the things the current graph is missing entirely:
//   • a shared effects chain (Reverb + a gentle low-pass) — the current graph has
//     ZERO effects nodes, so every sound is bone-dry, which is the main "cheap" tell;
//   • warmer voices + real ADSR envelopes instead of bare default synths;
//   • a bed that BREATHES (slow swell + slow filter movement) instead of re-attacking
//     the same chord every 2 measures (the repeating "bing").
//
// Loaded only by the audio-spike demo page. Never imported by the app.
import {
  now,
  getTransport,
  Gain,
  Reverb,
  Filter,
  AutoFilter,
  Synth,
  PolySynth,
  NoiseSynth,
  MembraneSynth,
  Loop,
} from 'tone';

// ---- shared retuned effects bus (built lazily, once) ------------------------
let fxIn: Gain | null = null;
function fxBus(): Gain {
  if (fxIn) return fxIn;
  const master = new Gain(0.9).toDestination();
  // Reverb gives space; a gentle low-pass rolls off the brittle synth top end.
  const reverb = new Reverb({ decay: 3, wet: 0.3 }).connect(master);
  const tone = new Filter({ type: 'lowpass', frequency: 3200, Q: 0.4 }).connect(reverb);
  fxIn = new Gain(1).connect(tone);
  return fxIn;
}

// ============================ AMBIENT BED ====================================
// CURRENT: PolySynth(Synth) re-triggers the SAME 4-note chord every 2 measures,
// half-note duration, dry, straight to destination-ish. Reads as a repeating bing.
const CURRENT_CHORD = ['C3', 'G3', 'C4', 'E4'];
let curBedSynth: PolySynth | null = null;
let curBedLoop: Loop | null = null;

export function startCurrentBed(): void {
  stopCurrentBed();
  curBedSynth = new PolySynth(Synth).toDestination();
  curBedSynth.volume.value = -12;
  curBedLoop = new Loop((t) => curBedSynth?.triggerAttackRelease(CURRENT_CHORD, '2n', t), '2m').start(0);
  getTransport().start();
}
export function stopCurrentBed(): void {
  curBedLoop?.stop().dispose();
  curBedSynth?.dispose();
  curBedLoop = null;
  curBedSynth = null;
}

// RETUNED: a warm pad with a long attack/release so it SWELLS rather than re-attacks,
// through an AutoFilter (slow breathing movement) into the reverb bus. Chord notes are
// staggered slightly and the loop is longer so it never lands on a hard downbeat "bing".
let newBedSynth: PolySynth | null = null;
let newBedLoop: Loop | null = null;
let newBedAF: AutoFilter | null = null;

export function startRetunedBed(): void {
  stopRetunedBed();
  newBedAF = new AutoFilter({ frequency: 0.05, depth: 0.6, baseFrequency: 400 }).connect(fxBus()).start();
  newBedSynth = new PolySynth(Synth).connect(newBedAF);
  newBedSynth.set({ oscillator: { type: 'sine' }, envelope: { attack: 2.5, decay: 1, sustain: 0.8, release: 4 } });
  newBedSynth.volume.value = -14;
  // Slightly wider, warmer voicing; staggered onsets so it drifts in, not a block hit.
  const chord = ['C3', 'G3', 'D4', 'E4', 'A4'];
  newBedLoop = new Loop((t) => {
    chord.forEach((note, i) => newBedSynth?.triggerAttackRelease(note, '1m', t + i * 0.18));
  }, '4m').start(0);
  getTransport().start();
}
export function stopRetunedBed(): void {
  newBedLoop?.stop().dispose();
  newBedSynth?.dispose();
  newBedAF?.dispose();
  newBedLoop = null;
  newBedSynth = null;
  newBedAF = null;
}

// ============================ WIN JINGLE =====================================
const JINGLE_NOTES = ['C5', 'E5', 'G5', 'C6', 'E6']; // 'big' tier, as shipped
export function playCurrentJingle(): void {
  const s = new Synth().toDestination();
  const t0 = now();
  JINGLE_NOTES.forEach((n, i) => s.triggerAttackRelease(n, '8n', t0 + i * 0.12));
}

// RETUNED: a rounder triangle voice with a proper envelope, a supporting root an octave
// down for body, a held resolving chord at the end, all through the reverb bus.
export function playRetunedJingle(): void {
  const lead = new Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 } }).connect(fxBus());
  const bass = new Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.2 } }).connect(fxBus());
  bass.volume.value = -8;
  const t0 = now();
  JINGLE_NOTES.forEach((n, i) => lead.triggerAttackRelease(n, '8n', t0 + i * 0.11));
  // resolve on a held major chord instead of stopping dead on the last arp note
  const end = t0 + JINGLE_NOTES.length * 0.11;
  const chord = new PolySynth(Synth).connect(fxBus());
  chord.set({ oscillator: { type: 'triangle' }, envelope: { attack: 0.02, decay: 0.4, sustain: 0.5, release: 1.6 } });
  chord.volume.value = -10;
  chord.triggerAttackRelease(['C5', 'E5', 'G5', 'C6'], '2n', end);
  bass.triggerAttackRelease('C3', '2n', end);
}

// ============================ REEL-STOP SFX ==================================
export function playCurrentReelStop(): void {
  const drum = new MembraneSynth().toDestination();
  const t0 = now();
  for (let i = 0; i < 5; i++) drum.triggerAttackRelease('C2', '16n', t0 + i * 0.09);
}

// RETUNED: descending pitched thunks with a touch of the reverb bus + a soft noise
// "grit" transient on each — reads as a physical reel latch, not a flat drum machine.
export function playRetunedReelStop(): void {
  const drum = new MembraneSynth({ pitchDecay: 0.03, octaves: 4, envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.1 } }).connect(fxBus());
  const grit = new NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.001, decay: 0.04, sustain: 0 } }).connect(fxBus());
  grit.volume.value = -20;
  const t0 = now();
  const pitches = ['E2', 'D2', 'C2', 'A1', 'G1'];
  pitches.forEach((p, i) => {
    const t = t0 + i * 0.1;
    drum.triggerAttackRelease(p, '16n', t);
    grit.triggerAttackRelease('32n', t);
  });
}
