// Farm — a fifth machine (PROJ-005, DEC-026). Pure data (DEC-015): the same 8-symbol engine
// vocabulary, given a barnyard identity, a green/earthy theme, and its own HIGH-VARIANCE tuned
// math — fewer, bigger hits and a rarer, fatter jackpot (the swingy counterpoint to Ocean's steady
// low-variance feel).
//
// MEASURED (measure-then-pin, `just simulate farm`, 200k spins): RTP ~94% (93.9–95.6% across seeds
// — the wide band is the high-variance signature), hit-frequency ~23.2% (vs Ocean's 37% — far fewer
// hits), big-tier ~6.6% (vs Ocean's 4.6% — bigger wins), jackpot ~1-in-200k (WOLF weight 2). The
// engine never sees theme/audio (DEC-001).
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

/** Farm's reel creatures — a barnyard over the shared 8 engine symbols (DEC-021). */
const FARM_SYMBOLS: SymbolDisplay = {
  DEER: { emoji: '🐔', label: 'Chicken' },
  FOX: { emoji: '🐷', label: 'Pig' },
  SQUIRREL: { emoji: '🐑', label: 'Sheep' },
  BEAR: { emoji: '🐮', label: 'Cow' },
  EAGLE: { emoji: '🦆', label: 'Duck' },
  OWL: { emoji: '🐐', label: 'Goat' },
  BISON: { emoji: '🐴', label: 'Horse' },
  WOLF: { emoji: '🚜', label: 'Tractor' },
};

/** Farm's tuned reel weights (sum 42) — flatter low-end than Ocean (fewer cheap hits) and a rarer
 *  WOLF (weight 2) for a scarcer jackpot: the levers that make it swingy. */
const FARM_WEIGHTS: Record<SymbolId, number> = {
  DEER: 7,
  FOX: 7,
  SQUIRREL: 6,
  BEAR: 5,
  EAGLE: 5,
  OWL: 5,
  BISON: 5,
  WOLF: 2,
};

/** Farm's paytable — modest lows, fat highs and jackpot (high-variance spread). */
const FARM_PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low: [1, 4, 10],
  mid: [2, 6, 20],
  high: [5, 17, 68],
  jackpot: [11, 75, 480],
};

const FARM_STRIP = buildStrip(SYMBOLS, FARM_WEIGHTS);

const FARM_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: FARM_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: Array.from({ length: REEL_COUNT }, () => FARM_STRIP),
  paylines: PAYLINES,
  paytable: FARM_PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};

export const FARM: Machine = {
  id: 'farm',
  name: 'Farm',
  math: FARM_MATH,
  presentation: {
    pattern: true,   // SPEC-104: rolled out to every machine
    symbolDisplay: FARM_SYMBOLS,
    // Green/earthy barnyard palette (runtime overrides of tokens.css). Applied on the
    // .device-stage root by useMachineTheme (SPEC-048). Contrast verified (see DEC-026).
    theme: {
      '--color-bg': '#0f1a0b',
      '--color-surface': '#1d2c12',
      '--color-frame': '#4a6b2e',
      '--color-text': '#eef6e2',
      '--color-text-muted': '#b7cb98',
      '--color-accent': '#8fc84a',
      '--color-coin': '#ecd884',
      '--color-win-small': '#9ac653',
      '--color-win-big': '#cfe85a',
      '--color-jackpot': '#eaf7b0',
      '--color-jackpot-sky': '#0a1406',
    },
    // Earthy, open audio (params only; playback is quiet-by-default per DEC-025).
    audio: {
      channelGains: { bed: 0.28, sfx: 0.66, jingle: 0.8 },
      mix: { duckLevel: 0.06, swellLevel: 0.5, rampS: 0.2, restoreS: 0.6, holdMs: 2500 },
      music: { chord: ['C3', 'E3', 'G3', 'D4'], noteDuration: '2n', loopInterval: '2m' },
    },
  },
};
