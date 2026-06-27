// Paytable display rows — pure builder that reads engine data + UI emoji (SPEC-020).
// DEC-001: UI reads engine only via src/engine/index.ts.
// DEC-011: multipliers come from PAYTABLE, never hard-coded here.
// DEC-006: emoji come from SYMBOL_DISPLAY (UI layer).

import { SYMBOLS, SYMBOL_TIER, PAYTABLE } from '../engine/index';
import type { Tier } from '../engine/index';
import { SYMBOL_DISPLAY } from './reels/symbols';

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
 * Build the paytable display rows from engine data + UI emoji map.
 * Returns one row per tier in descending value order (jackpot → high → mid → low).
 * Multipliers are read straight from PAYTABLE so they can never drift from the evaluator.
 */
export function paytableRows(): PaytableRow[] {
  return TIER_ORDER.map((tier) => ({
    tier,
    label: TIER_LABELS[tier],
    // Filter SYMBOLS (in declaration order) to those belonging to this tier,
    // then map to the UI emoji. SYMBOLS is the single source of symbol ordering.
    emoji: SYMBOLS.filter((s) => SYMBOL_TIER[s] === tier).map(
      (s) => SYMBOL_DISPLAY[s].emoji,
    ),
    multipliers: PAYTABLE[tier],
  }));
}
