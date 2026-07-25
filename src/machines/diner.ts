// Diner — a sixth machine (PROJ-005, DEC-027). Pure data (DEC-015): the same 8-symbol engine
// vocabulary, given a food-and-drink identity, a warm amber/red palette, and its own GENEROUS
// tuned math — wins land constantly but land small (the friendly counterpoint to Farm's swingy
// feast-or-famine, and a step beyond Ocean's already-steady feel).
//
// MEASURED (measure-then-pin, `just simulate diner`, 200k spins, 6 seeds): RTP ~95.0%
// (94.77–95.19% — a 0.42-point spread, the TIGHTEST of the roster; low variance is quiet to
// measure), hit-frequency ~44.9% (vs Ocean's 37.6% — the roster's highest), big-tier ~4.5%,
// jackpot ~1-in-30k (WOLF weight 3 — the roster's friendliest). The engine never sees
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
import type { Machine, SymbolDisplay } from './types';

/** Diner's reel fare — a food-and-drink identity over the shared 8 engine symbols (DEC-021). */
const DINER_SYMBOLS: SymbolDisplay = {
  DEER: { emoji: '🍕', label: 'Pizza' },
  FOX: { emoji: '🍔', label: 'Burger' },
  SQUIRREL: { emoji: '🌮', label: 'Taco' },
  BEAR: { emoji: '🍩', label: 'Donut' },
  EAGLE: { emoji: '🍜', label: 'Ramen' },
  OWL: { emoji: '🥤', label: 'Soda' },
  BISON: { emoji: '🍣', label: 'Sushi' },
  WOLF: { emoji: '🎂', label: 'Birthday Cake' },
};

/** Diner's tuned reel weights (sum 42) — the steepest low-end of the roster (the most cheap
 *  3-of-a-kind hits) and the friendliest WOLF: the levers that make it generous. */
const DINER_WEIGHTS: Record<SymbolId, number> = {
  DEER: 10,
  FOX: 9,
  SQUIRREL: 8,
  BEAR: 4,
  EAGLE: 3,
  OWL: 3,
  BISON: 2,
  WOLF: 3,
};

/** Diner's paytable — deliberately shallow. With hits landing ~45% of spins, a low 3-of-a-kind
 *  pays 1× (a push): the generous feel comes from FREQUENCY, not size. The 4-of-a-kind rung is
 *  the dominant RTP lever (DEC-026 found the same on Farm) — low 4ok 2→3 alone moves RTP ~+10pts. */
const DINER_PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low: [1, 2, 5],
  mid: [2, 5, 12],
  high: [3, 8, 22],
  jackpot: [5, 18, 90],
};

const DINER_STRIP = buildStrip(SYMBOLS, DINER_WEIGHTS);

const DINER_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: DINER_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: Array.from({ length: REEL_COUNT }, () => DINER_STRIP),
  paylines: PAYLINES,
  paytable: DINER_PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};

export const DINER: Machine = {
  id: 'diner',
  name: 'Diner',
  math: DINER_MATH,
  presentation: {
    symbolDisplay: DINER_SYMBOLS,
    // Warm amber/red diner palette (runtime overrides of tokens.css). Applied on the
    // .device-stage root by useMachineTheme (SPEC-048). Text-on-bg 16.78:1 (WCAG AAA); every
    // foreground pair ≥ 9.21:1 (see DEC-027).
    theme: {
      '--color-bg': '#1d0b06',
      '--color-surface': '#33150c',
      '--color-frame': '#8a3a1c',
      '--color-text': '#fdeee2',
      '--color-text-muted': '#d9ab8e',
      '--color-accent': '#ff9f43',
      '--color-coin': '#ffd479',
      '--color-win-small': '#f4a259',
      '--color-win-big': '#ffc857',
      '--color-jackpot': '#ffe9b0',
      '--color-jackpot-sky': '#140603',
    },
    // Bright, bouncy audio (params only; playback is quiet-by-default per DEC-025).
    audio: {
      channelGains: { bed: 0.26, sfx: 0.68, jingle: 0.84 },
      mix: { duckLevel: 0.07, swellLevel: 0.52, rampS: 0.15, restoreS: 0.5, holdMs: 2000 },
      music: { chord: ['F3', 'A3', 'C4', 'E4'], noteDuration: '4n', loopInterval: '1m' },
    },
  },
};
