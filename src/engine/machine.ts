// The engine-consumed MATH slice of a machine (DEC-015; DEC-001: plain data, no DOM).
// SPEC-038 pins the shape and extracts today's game as WILD_AND_WHIMSICAL_MATH by
// *referencing* the current engine constants byte-identically. No engine function
// signature changes here — SPEC-039/040 wire the engine to consume this.
import type { SymbolId, Tier } from './strips';
import { SYMBOLS, SYMBOL_TIER, REEL_WEIGHTS, REEL_COUNT, STRIPS } from './strips';
import type { Payline } from './paylines';
import { PAYLINES, PAYTABLE } from './paylines';
import type { BetLevel } from './balance';
import { BET_LEVELS, DEFAULT_BET, STARTING_BALANCE } from './balance';

/** The jackpot rule: `count` of `symbol` on a payline. Today: five WOLF (DEC-003). */
export interface JackpotRule {
  symbol: SymbolId;
  count: number;
}

/** Amount-based win-tier boundaries. big = totalWin >= bigMultiple × totalBet. */
export interface TierBoundaries {
  bigMultiple: number;
}

/** The MATH slice the engine consumes. A machine = this + a presentation slice. */
export interface MachineMath {
  symbols: readonly SymbolId[];
  symbolTier: Record<SymbolId, Tier>;
  reelWeights: Record<SymbolId, number>;
  reelCount: number;
  /** Visible rows per reel (today: 3, implicit in visibleCells' 3-tuple). */
  rows: number;
  strips: readonly (readonly SymbolId[])[];
  paylines: readonly Payline[];
  paytable: Record<Tier, readonly [number, number, number]>;
  jackpot: JackpotRule;
  tiers: TierBoundaries;
  betLevels: readonly BetLevel[];
  defaultBet: BetLevel;
  startingBalance: number;
}

/** The default machine's math slice — today's constants, byte-identical (DEC-015). */
export const WILD_AND_WHIMSICAL_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: REEL_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: STRIPS,
  paylines: PAYLINES,
  paytable: PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};
