// sessionStats.ts — pure, engine-independent session-stats model (SPEC-054, DEC-020).
// No React, no storage, no engine mutation: reducers read the SpinResult fields the engine
// already returns (DEC-001). Every reducer is immutable — it returns a new record.

import type { SpinResult, WinTier, BetLevel } from '../engine';

/** Bumped only on a breaking change to the persisted blob shape (statsStorage degrades on mismatch). */
export const STATS_VERSION = 1;

/** Winnings-over-time series cap: keep the last N cumulative-net points, FIFO drop-oldest (DEC-020). */
export const SERIES_CAP = 200;

/** The largest single-spin win, with the machine + tier that produced it (DEC-020). */
export interface BiggestWin {
  amount: number;
  machineId: string;
  tier: WinTier;
}

/** The persisted, aggregate-across-machines session record (DEC-020). */
export interface SessionStats {
  version: number;
  spins: number;
  winningSpins: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: BiggestWin | null;
  cashIns: number;
  /** Cumulative net (totalWon − totalWagered) after each spin, capped to the last SERIES_CAP (FIFO). */
  series: number[];
}

/** The subset of a resolved spin the model records (DEC-001: read-only view of SpinResult). */
export type SpinRecordInput = Pick<SpinResult, 'totalWin' | 'bet' | 'tier'>;

/** Derived, display-ready metrics — computed, never stored. */
export interface SessionMetrics {
  spins: number;
  winRate: number; // winningSpins / spins, 0 when spins === 0
  net: number; // totalWon − totalWagered
  biggestWin: BiggestWin | null;
  cashIns: number;
}

/** A fresh, zeroed record. The single source of the empty/default shape. */
export function emptyStats(): SessionStats {
  return {
    version: STATS_VERSION,
    spins: 0,
    winningSpins: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: null,
    cashIns: 0,
    series: [],
  };
}

/**
 * Record one resolved spin. Immutable — returns a new record.
 * A "winning spin" is totalWin > 0; biggestWin updates only on a STRICTLY larger win (keeps the
 * earliest machine/tier on ties); the series appends the new cumulative net, FIFO-capped.
 */
export function recordSpin(
  stats: SessionStats,
  input: SpinRecordInput,
  machineId: string,
): SessionStats {
  const totalWagered = stats.totalWagered + input.bet;
  const totalWon = stats.totalWon + input.totalWin;
  const isWin = input.totalWin > 0;
  const biggestWin =
    input.totalWin > (stats.biggestWin?.amount ?? 0)
      ? { amount: input.totalWin, machineId, tier: input.tier }
      : stats.biggestWin;
  const series = [...stats.series, totalWon - totalWagered].slice(-SERIES_CAP);
  return {
    ...stats,
    spins: stats.spins + 1,
    winningSpins: stats.winningSpins + (isWin ? 1 : 0),
    totalWagered,
    totalWon,
    biggestWin,
    series,
  };
}

/**
 * Record one cash-in (a wallet Reset press — DEC-020). Immutable.
 * Counts only: net winnings and the series are play outcomes and must NOT move on a top-up.
 */
export function recordCashIn(stats: SessionStats): SessionStats {
  return { ...stats, cashIns: stats.cashIns + 1 };
}

/** Compute display-ready metrics. Pure; guards spins === 0 (no divide-by-zero). */
export function deriveMetrics(stats: SessionStats): SessionMetrics {
  return {
    spins: stats.spins,
    winRate: stats.spins === 0 ? 0 : stats.winningSpins / stats.spins,
    net: stats.totalWon - stats.totalWagered,
    biggestWin: stats.biggestWin,
    cashIns: stats.cashIns,
  };
}

// BetLevel is re-exported for callers (SPEC-055) that type spin inputs; kept here to co-locate the
// model's engine-type surface.
export type { BetLevel };
