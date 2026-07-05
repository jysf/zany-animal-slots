// Win-tier classification for the slot engine.
// DEC-015: the jackpot rule + big-win boundary are read from the machine's math slice.
// DEC-001: pure engine — imports only types (LineWin + the machine math types).
import type { LineWin } from './paylines';
import type { MachineMath, JackpotRule } from './machine';

export type WinTier = 'none' | 'small' | 'big' | 'jackpot';

/** True iff some line win matches the machine's jackpot rule (symbol × count). */
export function isJackpot(lineWins: LineWin[], jackpot: JackpotRule): boolean {
  return lineWins.some(
    (w) => w.symbol === jackpot.symbol && w.count === jackpot.count,
  );
}

/**
 * Classify a resolved spin into a WinTier, using the machine's jackpot rule and
 * big-win boundary. Precedence: jackpot → none → small → big.
 *   1. jackpot — isJackpot(lineWins, math.jackpot)
 *   2. none    — totalWin <= 0
 *   3. small   — 0 < totalWin < math.tiers.bigMultiple × totalBet
 *   4. big     — totalWin >= math.tiers.bigMultiple × totalBet
 */
export function classifyWin(
  totalWin: number,
  totalBet: number,
  lineWins: LineWin[],
  math: MachineMath,
): WinTier {
  if (isJackpot(lineWins, math.jackpot)) return 'jackpot';
  if (totalWin <= 0) return 'none';
  if (totalWin < math.tiers.bigMultiple * totalBet) return 'small';
  return 'big';
}
