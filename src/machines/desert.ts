// Desert — the second themed machine (SPEC-052, DEC-018). Pure data (DEC-015):
// same 8-symbol vocabulary as Wild & Whimsical, distinguished by a warm sand/amber
// desert theme (runtime CSS-var overrides), warm dry audio (per-machine params — DEC-013),
// and its own sparse, higher-variance tuned math (weights → buildStrip; measured avg RTP
// ~90%, hit ~28%, jackpot ~1/21.7k — SPEC-046/051 measure-then-pin discipline). The engine
// never sees theme/audio (DEC-001).
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

/** Desert's own reel creatures — arid identity over the shared 8 engine symbols (DEC-021). */
const DESERT_SYMBOLS: SymbolDisplay = {
  DEER: { emoji: '🐪', label: 'Camel' },
  FOX: { emoji: '🌵', label: 'Cactus' },
  SQUIRREL: { emoji: '🦎', label: 'Gecko' },
  BEAR: { emoji: '🐢', label: 'Tortoise' },
  EAGLE: { emoji: '🦂', label: 'Scorpion' },
  OWL: { emoji: '🦇', label: 'Bat' },
  BISON: { emoji: '🐏', label: 'Bighorn Ram' },
  WOLF: { emoji: '🐍', label: 'Sidewinder' },
};

/** Desert's tuned reel weights (sum 42) — flatter/sparser than W&W and Arctic (fewer hits). */
const DESERT_WEIGHTS: Record<SymbolId, number> = {
  DEER: 8,
  FOX: 7,
  SQUIRREL: 6,
  BEAR: 5,
  EAGLE: 5,
  OWL: 4,
  BISON: 4,
  WOLF: 3,
};

/** Desert's paytable — stingy small wins, juicy high/jackpot (warm, high-variance feel). */
const DESERT_PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low: [1, 2, 8],
  mid: [2, 8, 21],
  high: [7, 18, 60],
  jackpot: [12, 58, 280],
};

/** One strip, generated from the tuned weights (0 linear adjacent dups; length 42). */
const DESERT_STRIP = buildStrip(SYMBOLS, DESERT_WEIGHTS);

const DESERT_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: DESERT_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: Array.from({ length: REEL_COUNT }, () => DESERT_STRIP),
  paylines: PAYLINES,
  paytable: DESERT_PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};

export const DESERT: Machine = {
  id: 'desert',
  name: 'Desert',
  math: DESERT_MATH,
  presentation: {
    symbolDisplay: DESERT_SYMBOLS, // per-machine arid identity (DEC-021; supersedes DEC-018 symbol clause)
    // Warm sand/amber palette (runtime overrides of tokens.css). All pairs pass WCAG AA
    // (text-on-bg 15.76:1). Applied on the .device-stage root by useMachineTheme (SPEC-048).
    theme: {
      '--color-bg': '#1c1206',
      '--color-surface': '#33240f',
      '--color-frame': '#7a5a2e',
      '--color-text': '#f7ecd8',
      '--color-text-muted': '#cbb391',
      '--color-accent': '#e0a53a',
      '--color-coin': '#f2d489',
      '--color-win-small': '#d9a441',
      '--color-win-big': '#f0b429',
      '--color-jackpot': '#ffe6a0',
      '--color-jackpot-sky': '#2b1a08',
    },
    // Warm, dry audio: fuller warm bed, a bright open major chord on dry half notes.
    audio: {
      channelGains: { bed: 0.3, sfx: 0.66, jingle: 0.8 },
      mix: { duckLevel: 0.06, swellLevel: 0.5, rampS: 0.2, restoreS: 0.6, holdMs: 2500 },
      music: { chord: ['G3', 'B3', 'D4', 'A4'], noteDuration: '2n', loopInterval: '2m' },
    },
  },
};
