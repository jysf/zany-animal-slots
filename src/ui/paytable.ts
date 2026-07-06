// Paytable display rows — pure builder that reads engine data + UI emoji (SPEC-020).
// DEC-001: UI reads engine only via src/engine/index.ts.
// DEC-011: multipliers come from PAYTABLE, never hard-coded here.
// DEC-006: emoji come from the supplied symbolDisplay map (SPEC-041 threads it from
// the machine's presentation slice instead of importing the emoji/label map directly).
// SPEC-047: symbols/tiers/multipliers/line-count now come from the supplied MachineMath
// (the active machine) instead of engine module constants, closing the last STAGE-007
// residual engine read.

import type { MachineMath, Tier } from '../engine/index';
import type { SymbolDisplay } from '../machines/types';

/** Number of fixed paylines for a machine's math slice (was the PAYLINE_COUNT const). */
export function paylineCount(math: MachineMath): number {
  return math.paylines.length;
}

/** Display row for one symbol tier in the paytable sheet. */
export interface PaytableRow {
  tier: Tier;
  /** Human-readable tier label. */
  label: string;
  /** Emoji glyphs for every symbol in this tier, in SYMBOLS order. */
  emoji: string[];
  /** [3-of-a-kind, 4-of-a-kind, 5-of-a-kind] multipliers × total bet (from PAYTABLE). */
  multipliers: readonly [number, number, number];
}

/** Descending value order for display — jackpot first, low last. */
const TIER_ORDER: Tier[] = ['jackpot', 'high', 'mid', 'low'];

const TIER_LABELS: Record<Tier, string> = {
  jackpot: 'Jackpot',
  high: 'High',
  mid: 'Mid',
  low: 'Low',
};

/**
 * Build the paytable display rows from the machine's math + the supplied symbol display map.
 * Symbols/tiers/multipliers come from `math` so the sheet reflects the ACTIVE machine
 * (DEC-011: multipliers still come from the machine's paytable, never hard-coded here).
 */
export function paytableRows(math: MachineMath, symbolDisplay: SymbolDisplay): PaytableRow[] {
  return TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    emoji: math.symbols.filter((s) => math.symbolTier[s] === tier).map(
      (s) => symbolDisplay[s].emoji,
    ),
    multipliers: math.paytable[tier],
  }));
}
