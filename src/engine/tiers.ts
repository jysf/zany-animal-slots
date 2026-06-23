// Win-tier classification for the slot engine.
// DEC-003: jackpot = five Wolves on a payline (outranks amount-based tiers).
// DEC-001: pure engine — imports only paylines (LineWin) and strips (WOLF symbol name).

import type { LineWin } from './paylines';

/** The celebration class of a resolved spin, as pure data (AGENTS §14). */
export type WinTier = 'none' | 'small' | 'big' | 'jackpot';

/**
 * True iff at least one line win is five Wolves — the jackpot condition (DEC-003).
 * A 3- or 4-Wolf line, or any non-Wolf line, is not a jackpot.
 */
export function isJackpot(lineWins: LineWin[]): boolean {
  return lineWins.some(w => w.symbol === 'WOLF' && w.count === 5);
}

/**
 * Classify a resolved spin into a WinTier.
 *
 * Order of precedence (jackpot checked first):
 *   1. jackpot — isJackpot is true (outranks amount tiers even when win is large)
 *   2. none    — totalWin <= 0
 *   3. small   — 0 < totalWin < 5 × totalBet
 *   4. big     — totalWin >= 5 × totalBet (the 5× boundary is 'big')
 */
export function classifyWin(
  totalWin: number,
  totalBet: number,
  lineWins: LineWin[],
): WinTier {
  if (isJackpot(lineWins)) return 'jackpot';
  if (totalWin <= 0) return 'none';
  if (totalWin < 5 * totalBet) return 'small';
  return 'big';
}
