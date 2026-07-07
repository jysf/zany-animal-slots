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
    theme: {}, // no overrides — defers to the static tokens.css campfire palette
    audio: { channelGains: CHANNEL_GAINS, mix: MIX, music: DEFAULT_BED_MUSIC },
  },
};
