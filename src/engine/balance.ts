/**
 * balance.ts — wallet primitives for the slot engine.
 *
 * All functions are pure and total: they take and return plain numbers,
 * never mutate, and never throw. Invalid game states (insufficient balance)
 * are returned as typed results (DEC-005, AGENTS §11).
 */

export const STARTING_BALANCE = 1000;

export const BET_LEVELS = [10, 25, 50] as const;

/** The three allowed total-bet values: x1=10, x2=25, x3=50 coins. */
export type BetLevel = (typeof BET_LEVELS)[number];

export const DEFAULT_BET: BetLevel = 10;

/**
 * Step the bet level up by one step.
 * Clamped at the top (50) — no wraparound.
 */
export function nextBet(bet: BetLevel): BetLevel {
  const idx = BET_LEVELS.indexOf(bet);
  const nextIdx = Math.min(idx + 1, BET_LEVELS.length - 1);
  return BET_LEVELS[nextIdx];
}

/**
 * Step the bet level down by one step.
 * Clamped at the bottom (10) — no wraparound.
 */
export function prevBet(bet: BetLevel): BetLevel {
  const idx = BET_LEVELS.indexOf(bet);
  const prevIdx = Math.max(idx - 1, 0);
  return BET_LEVELS[prevIdx];
}

/**
 * Return true iff the player can afford a spin at `bet` coins.
 * A zero bet is never affordable (the engine requires a positive wager).
 */
export function canAfford(balance: number, bet: number): boolean {
  return bet > 0 && balance >= bet;
}

/** Successful debit: balance has been reduced. */
type DebitSuccess = { ok: true; balance: number };

/** Failed debit: balance is unchanged; the reason is carried as data. */
type DebitFailure = { ok: false; reason: "insufficient-balance"; balance: number };

/** Typed result of a debit attempt — never throws. */
export type DebitResult = DebitSuccess | DebitFailure;

/**
 * Attempt to deduct `bet` from `balance`.
 *
 * Returns `{ ok: true, balance: balance - bet }` on success, or
 * `{ ok: false, reason: 'insufficient-balance', balance }` (unchanged)
 * when the player cannot afford the bet.
 *
 * Never throws — an unaffordable bet is data, not an exception (AGENTS §11).
 */
export function debit(balance: number, bet: number): DebitResult {
  if (!canAfford(balance, bet)) {
    return { ok: false, reason: "insufficient-balance", balance };
  }
  return { ok: true, balance: balance - bet };
}

/**
 * Add a win `amount` to `balance`.
 * Pure — does not mutate either argument.
 */
export function credit(balance: number, amount: number): number {
  return balance + amount;
}
