// Ocean — the fourth and final themed machine (SPEC-053, DEC-019). Pure data (DEC-015):
// same 8-symbol vocabulary as Wild & Whimsical, distinguished by a teal/deep-blue ocean
// theme (runtime CSS-var overrides), flowing spacious audio (per-machine params — DEC-013),
// and its own steady, low-variance tuned math (weights → buildStrip; measured avg RTP ~94%,
// hit ~37% — the HIGHEST hit-frequency of the four — jackpot ~1/26.3k; SPEC-046/051/052
// measure-then-pin discipline). The engine never sees theme/audio (DEC-001).
import {
  SYMBOLS,
  SYMBOL_TIER,
  REEL_COUNT,
  PAYLINES,
  BET_LEVELS,
  DEFAULT_BET,
  STARTING_BALANCE,
  buildStrip,
} from '../engine/index';
import type { MachineMath, SymbolId, Tier } from '../engine/index';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';
import type { Machine } from './types';

/** Ocean's tuned reel weights (sum 42) — steeper low-end than W&W/Arctic/Desert (most frequent hits). */
const OCEAN_WEIGHTS: Record<SymbolId, number> = {
  DEER: 10,
  FOX: 9,
  SQUIRREL: 7,
  BEAR: 4,
  EAGLE: 3,
  OWL: 3,
  BISON: 3,
  WOLF: 3,
};

/** Ocean's paytable — the gentlest highs of the four (steady, low-variance "flowing" feel). */
const OCEAN_PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low: [1, 2, 6],
  mid: [2, 4, 12],
  high: [3, 9, 32],
  jackpot: [6, 30, 150],
};

/** One strip, generated from the tuned weights (0 linear adjacent dups; length 42). */
const OCEAN_STRIP = buildStrip(SYMBOLS, OCEAN_WEIGHTS);

const OCEAN_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: OCEAN_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: Array.from({ length: REEL_COUNT }, () => OCEAN_STRIP),
  paylines: PAYLINES,
  paytable: OCEAN_PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};

export const OCEAN: Machine = {
  id: 'ocean',
  name: 'Ocean',
  math: OCEAN_MATH,
  presentation: {
    symbolDisplay: SYMBOL_DISPLAY, // same 8-animal vocabulary; theme conveys "Ocean", not new symbols
    // Teal/deep-blue ocean palette (runtime overrides of tokens.css). Text-on-bg 16.14:1 (WCAG AA);
    // every foreground pair ≥ 7.29:1. Applied on the .device-stage root by useMachineTheme (SPEC-048).
    theme: {
      '--color-bg': '#041a26',
      '--color-surface': '#0a2f42',
      '--color-frame': '#1c6f80',
      '--color-text': '#e6f7fb',
      '--color-text-muted': '#9ec9d6',
      '--color-accent': '#25c7c9',
      '--color-coin': '#7fe3d8',
      '--color-win-small': '#2fb9a6',
      '--color-win-big': '#33c9d6',
      '--color-jackpot': '#bdf1ec',
      '--color-jackpot-sky': '#02121b',
    },
    // Flowing, spacious audio: gentle bed, slow swells, a shimmering open A-major chord on long whole
    // notes over a wide loop.
    audio: {
      channelGains: { bed: 0.28, sfx: 0.6, jingle: 0.82 },
      mix: { duckLevel: 0.05, swellLevel: 0.45, rampS: 0.3, restoreS: 0.8, holdMs: 3200 },
      music: { chord: ['A2', 'E3', 'C#4', 'E4'], noteDuration: '1n', loopInterval: '3m' },
    },
  },
};
