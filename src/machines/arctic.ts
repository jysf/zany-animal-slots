// Arctic — the first themed machine (SPEC-051, DEC-017). Pure data (DEC-015):
// same 8-symbol vocabulary as Wild & Whimsical, distinguished by an icy cool-blue
// theme (runtime CSS-var overrides), colder audio (per-machine params — DEC-013),
// and its own tuned math (weights → buildStrip; measured RTP ~91%, hit ~30%,
// jackpot ~1/31k — SPEC-046 measure-then-pin discipline). The engine never sees
// theme/audio (DEC-001).
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

/** Arctic's tuned reel weights (sum 42) — flatter than W&W, more mid-tier (icy, steadier hits). */
const ARCTIC_WEIGHTS: Record<SymbolId, number> = {
  DEER: 8,
  FOX: 8,
  SQUIRREL: 7,
  BEAR: 5,
  EAGLE: 4,
  OWL: 4,
  BISON: 3,
  WOLF: 3,
};

/** Arctic's paytable — bigger 5-of-a-kind payouts than W&W (colder, higher-variance feel). */
const ARCTIC_PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low: [1, 3, 9],
  mid: [2, 7, 21],
  high: [5, 15, 56],
  jackpot: [10, 52, 258],
};

/** One strip, generated from the tuned weights (0 linear adjacent dups; length 42). */
const ARCTIC_STRIP = buildStrip(SYMBOLS, ARCTIC_WEIGHTS);

const ARCTIC_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: ARCTIC_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: Array.from({ length: REEL_COUNT }, () => ARCTIC_STRIP),
  paylines: PAYLINES,
  paytable: ARCTIC_PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};

export const ARCTIC: Machine = {
  id: 'arctic',
  name: 'Arctic',
  math: ARCTIC_MATH,
  presentation: {
    symbolDisplay: SYMBOL_DISPLAY, // same 8-animal vocabulary; theme conveys "Arctic", not new symbols
    // Cool-blue icy palette (runtime overrides of tokens.css). All pairs pass WCAG AA
    // (text-on-bg 16.4:1). Applied on the .device-stage root by useMachineTheme (SPEC-048).
    theme: {
      '--color-bg': '#0a1622',
      '--color-surface': '#14293b',
      '--color-frame': '#2b5170',
      '--color-text': '#eaf4fb',
      '--color-text-muted': '#9fbdd0',
      '--color-accent': '#3fc4ec',
      '--color-coin': '#cfe8f5',
      '--color-win-small': '#38b2a3',
      '--color-win-big': '#4fc3f7',
      '--color-jackpot': '#c9f0ff',
      '--color-jackpot-sky': '#06263f',
    },
    // Colder audio: quieter bed, crisper jingle, a hollow stacked-fifths pad on slow whole notes.
    audio: {
      channelGains: { bed: 0.22, sfx: 0.62, jingle: 0.85 },
      mix: { duckLevel: 0.04, swellLevel: 0.4, rampS: 0.25, restoreS: 0.7, holdMs: 3000 },
      music: { chord: ['D3', 'A3', 'E4', 'B4'], noteDuration: '1n', loopInterval: '2m' },
    },
  },
};
