// The default machine — today's game expressed as pure config (DEC-015).
// Behavior-preserving: its data IS the current constants (the math slice references
// WILD_AND_WHIMSICAL_MATH; the presentation slice references the UI's SYMBOL_DISPLAY).
// The migration re-homes data, it does not re-tune (STAGE-007; STAGE-008 retunes).
// SPEC-048: theme + audio reference the current UI constants by import, so the default
// machine's presentation is provably today's — not a re-typed copy (no drift risk).
import { WILD_AND_WHIMSICAL_MATH } from '../engine/index';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';
import { CHANNEL_GAINS } from '../ui/audio/audioEngine';
import { MIX } from '../ui/audio/mixer';
import { DEFAULT_BED_MUSIC } from '../ui/audio/ambientBed';
import type { Machine } from './types';

export const WILD_AND_WHIMSICAL: Machine = {
  id: 'wild-and-whimsical',
  name: 'Wild & Whimsical',
  math: WILD_AND_WHIMSICAL_MATH,
  presentation: {
    symbolDisplay: SYMBOL_DISPLAY,
    // SPEC-068 facelift: Wild & Whimsical was on the dull default campfire palette (theme: {}).
    // Give it its own bright, whimsical identity — a magical plum night with bubblegum-pink accents
    // and gold coins — to match the colourful reel menagerie (frog…unicorn). Own theme like the
    // other machines (DEC-021); text-on-bg stays ≥ AA (checked in the parity test).
    theme: {
      '--color-bg': '#1b0f33',
      '--color-surface': '#2a1a52',
      '--color-frame': '#7a3fd0',
      '--color-text': '#f7ecff',
      '--color-text-muted': '#c4a9ec',
      '--color-accent': '#ff4fa3',
      '--color-coin': '#ffd447',
      '--color-win-small': '#4fe0b0',
      '--color-win-big': '#ff79c6',
      '--color-jackpot': '#ffe680',
      '--color-jackpot-sky': '#0f0722',
    },
    audio: { channelGains: CHANNEL_GAINS, mix: MIX, music: DEFAULT_BED_MUSIC },
  },
};
