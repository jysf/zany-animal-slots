// Payline definitions and paytable evaluation for the slot engine.
// DEC-003: fixed paylines, left-anchored run ≥3 from reel 0 (mechanics unchanged).
// DEC-016: 20 fixed paylines + retuned paytable (supersedes DEC-003/011 specifics for W&W).
// DEC-001: pure engine — imports only spin and strips, no React/DOM.

import type { Grid } from './spin';
import { type SymbolId, type Tier } from './strips';
import type { MachineMath } from './machine';

/** A fixed payline identifier (DEC-016: widened from the original 'L1'..'L5' to support 20 lines). */
export type LineId = `L${number}`;

/** A payline: an id and one row index per reel (5 reels). */
export interface Payline {
  id: LineId;
  /** Row index per reel: rows[reel] gives the row this line crosses at that reel. */
  rows: readonly number[];
}

/**
 * The 20 fixed paylines (DEC-016 — supersedes DEC-003's 5 lines for W&W; the
 * structural lever for hit-frequency). The first five (L1-L5) are the original
 * lines unchanged: L1 middle row, L2 top row, L3 bottom row, L4 V-shape, L5 ^-shape.
 */
export const PAYLINES: readonly Payline[] = [
  { id: 'L1',  rows: [1, 1, 1, 1, 1] },
  { id: 'L2',  rows: [0, 0, 0, 0, 0] },
  { id: 'L3',  rows: [2, 2, 2, 2, 2] },
  { id: 'L4',  rows: [0, 1, 2, 1, 0] },
  { id: 'L5',  rows: [2, 1, 0, 1, 2] },
  { id: 'L6',  rows: [1, 0, 0, 0, 1] },
  { id: 'L7',  rows: [1, 2, 2, 2, 1] },
  { id: 'L8',  rows: [0, 0, 1, 2, 2] },
  { id: 'L9',  rows: [2, 2, 1, 0, 0] },
  { id: 'L10', rows: [1, 2, 1, 0, 1] },
  { id: 'L11', rows: [1, 0, 1, 2, 1] },
  { id: 'L12', rows: [0, 1, 1, 1, 0] },
  { id: 'L13', rows: [2, 1, 1, 1, 2] },
  { id: 'L14', rows: [0, 1, 0, 1, 0] },
  { id: 'L15', rows: [2, 1, 2, 1, 2] },
  { id: 'L16', rows: [1, 1, 0, 1, 1] },
  { id: 'L17', rows: [1, 1, 2, 1, 1] },
  { id: 'L18', rows: [0, 0, 1, 0, 0] },
  { id: 'L19', rows: [2, 2, 1, 2, 2] },
  { id: 'L20', rows: [0, 2, 0, 2, 0] },
];

/**
 * Payout multipliers (× total bet) per tier, for 3 / 4 / 5 of a kind (DEC-016
 * retune — supersedes DEC-011's paytable for W&W).
 * lineWin = Math.floor(multiplier × totalBet).
 */
export const PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low:     [1,  3,   7],
  mid:     [2,  6,  18],
  high:    [4, 14,  55],
  jackpot: [10, 50, 250],
};

/** A single hitting payline win. */
export interface LineWin {
  line: LineId;
  symbol: SymbolId;
  count: 3 | 4 | 5;
  multiplier: number;
  amount: number;
}

/** The result of evaluating all paylines on a grid. */
export interface PaylineResult {
  lineWins: LineWin[];
  totalWin: number;
}

/**
 * Return the five symbols that appear along a payline on a given grid.
 * grid[reel][row]; line.rows[reel] gives the row for that reel.
 */
export function lineSymbols(grid: Grid, line: Payline): SymbolId[] {
  return line.rows.map((row, reel) => grid[reel][row]);
}

/**
 * Evaluate all five paylines against a grid and total bet.
 *
 * Each line is scored as a left-anchored run: starting from reel 0, count how
 * many consecutive symbols match the reel-0 symbol. If the run is ≥3, emit a
 * LineWin with amount = floor(multiplier × totalBet). Returns the list of
 * winning lines and their sum.
 */
export function evaluatePaylines(
  grid: Grid,
  totalBet: number,
  math: MachineMath,
): PaylineResult {
  const lineWins: LineWin[] = [];
  let totalWin = 0;

  for (const line of math.paylines) {
    const symbols = lineSymbols(grid, line);
    const s0 = symbols[0];

    // Count left-anchored run of s0.
    let run = 1;
    for (let reel = 1; reel < symbols.length; reel++) {
      if (symbols[reel] === s0) {
        run++;
      } else {
        break;
      }
    }

    if (run >= 3) {
      // run is in [3,4,5] on a 5-reel game — cast is safe.
      const count = run as 3 | 4 | 5;
      const tier: Tier = math.symbolTier[s0];
      const multiplier = math.paytable[tier][count - 3];
      const amount = Math.floor(multiplier * totalBet);

      lineWins.push({ line: line.id, symbol: s0, count, multiplier, amount });
      totalWin += amount;
    }
  }

  return { lineWins, totalWin };
}
