// Public engine interface (DEC-001).
// The UI imports ONLY from this file — never engine internals.
// Composition order: debit → resolveGrid → evaluatePaylines → credit → classifyWin.

import { createRng } from './rng';
import { resolveGrid } from './spin';
import { evaluatePaylines } from './paylines';
import { debit, credit, type BetLevel } from './balance';
import { classifyWin } from './tiers';
import type { Grid } from './spin';
import type { LineWin } from './paylines';
import type { WinTier } from './tiers';

// ── Re-exports: types ────────────────────────────────────────────────────────
export type { SymbolId, Tier } from './strips';
export type { Grid } from './spin';
export type { LineId, Payline, LineWin } from './paylines';
export type { WinTier } from './tiers';
export type { BetLevel } from './balance';
export type { MachineMath, JackpotRule, TierBoundaries } from './machine';

// ── Re-exports: values ───────────────────────────────────────────────────────
export { SYMBOLS, SYMBOL_TIER } from './strips';
export { PAYLINES, PAYTABLE } from './paylines';
export { BET_LEVELS, DEFAULT_BET, STARTING_BALANCE, nextBet, prevBet, canAfford } from './balance';
export { WILD_AND_WHIMSICAL_MATH } from './machine';

// ── SpinResult / SpinOutcome ─────────────────────────────────────────────────

/** The plain-data result of a successful spin. */
export interface SpinResult {
  grid: Grid;
  lineWins: LineWin[];
  totalWin: number;
  /** New balance: (balance − bet) + totalWin. */
  balance: number;
  tier: WinTier;
  bet: BetLevel;
}

/**
 * The typed outcome of calling `spin`.
 * When ok is false, balance is the original (unchanged) balance and there is
 * no grid — the spin was not performed (DEC-005).
 */
export type SpinOutcome =
  | ({ ok: true } & SpinResult)
  | { ok: false; reason: 'insufficient-balance'; balance: number };

// ── spin ─────────────────────────────────────────────────────────────────────

/**
 * Run one spin.
 *
 * Compose order (spec §Notes for the Implementer):
 *   1. debit — if insufficient balance, return typed failure with original balance.
 *   2. resolveGrid(createRng(seed)) — deterministic grid from seed.
 *   3. evaluatePaylines(grid, bet) — lineWins + totalWin.
 *   4. credit(d.balance, totalWin) — new balance.
 *   5. classifyWin — win tier.
 *
 * Never throws on unaffordable bet (DEC-005).
 * All randomness flows through createRng(seed) — no Math.random() (DEC-002).
 */
export function spin(args: {
  seed: number;
  balance: number;
  bet: BetLevel;
}): SpinOutcome {
  const { seed, balance, bet } = args;

  // 1. Debit
  const d = debit(balance, bet);
  if (!d.ok) {
    return { ok: false, reason: 'insufficient-balance', balance };
  }

  // 2. Resolve grid
  const grid = resolveGrid(createRng(seed));

  // 3. Evaluate paylines
  const { lineWins, totalWin } = evaluatePaylines(grid, bet);

  // 4. Credit win
  const newBalance = credit(d.balance, totalWin);

  // 5. Classify win tier
  const tier = classifyWin(totalWin, bet, lineWins);

  return { ok: true, grid, lineWins, totalWin, balance: newBalance, tier, bet };
}
