// Unit tests for paytableRows() — SPEC-020 failing tests (written at design).
// DEC-016 (re-baselined by SPEC-046) multiplier values are the source of truth
// for the assertions below — supersedes DEC-011's original numbers for W&W.
// SPEC-041: paytableRows() now takes the symbolDisplay map as a param, sourced
// from the default machine's presentation slice; call sites supply it.
// SPEC-047: paytableRows() now also takes the machine's MachineMath (symbols/tiers/
// multipliers/paylines come from `math`, not engine module constants); paylineCount(math)
// replaces the PAYLINE_COUNT const.

import { describe, it, expect } from 'vitest';
import { paytableRows, paylineCount } from './paytable';
import { WILD_AND_WHIMSICAL } from '../machines/wildAndWhimsical';

/** The default machine's math + symbolDisplay map — parity anchor (SPEC-041/047). */
const DEFAULT_MATH = WILD_AND_WHIMSICAL.math;
const DEFAULT_DISPLAY = WILD_AND_WHIMSICAL.presentation.symbolDisplay;

describe('paytableRows()', () => {
  it('returns the four tiers in descending value order', () => {
    expect(paytableRows(DEFAULT_MATH, DEFAULT_DISPLAY).map((r) => r.tier)).toEqual([
      'jackpot',
      'high',
      'mid',
      'low',
    ]);
  });

  it('each tier has its DEC-016 multipliers', () => {
    const rows = paytableRows(DEFAULT_MATH, DEFAULT_DISPLAY);
    const byTier = Object.fromEntries(rows.map((r) => [r.tier, r.multipliers]));

    expect(byTier['jackpot']).toEqual([10, 50, 250]);
    expect(byTier['high']).toEqual([4, 14, 55]);
    expect(byTier['mid']).toEqual([2, 6, 18]);
    expect(byTier['low']).toEqual([1, 3, 7]);
  });

  it("each tier lists its symbols' emoji", () => {
    const rows = paytableRows(DEFAULT_MATH, DEFAULT_DISPLAY);
    const byTier = Object.fromEntries(rows.map((r) => [r.tier, r.emoji]));

    // SPEC-065: Wild & Whimsical's whimsical menagerie.
    expect(byTier['jackpot']).toContain('🦄'); // WOLF slot — Unicorn
    expect(byTier['high']).toContain('🦚'); // BISON — Peacock
    expect(byTier['mid']).toContain('🦋'); // BEAR — Butterfly
    expect(byTier['mid']).toContain('🦜'); // EAGLE — Parrot
    expect(byTier['mid']).toContain('🦩'); // OWL — Flamingo
    expect(byTier['low']).toContain('🐸'); // DEER — Frog
    expect(byTier['low']).toContain('🐝'); // FOX — Bee
    expect(byTier['low']).toContain('🐞'); // SQUIRREL — Ladybug
  });

  it('multipliers come from the machine paytable', () => {
    const rows = paytableRows(DEFAULT_MATH, DEFAULT_DISPLAY);
    for (const row of rows) {
      // Deep equality against the machine's math.paytable — no UI-side constants.
      expect(row.multipliers).toEqual(DEFAULT_MATH.paytable[row.tier]);
    }
  });

  it('uses the supplied symbolDisplay', () => {
    // Override WOLF's emoji (jackpot tier) to prove paytableRows renders the
    // supplied map, not a hard-coded import.
    const stubDisplay = {
      ...DEFAULT_DISPLAY,
      WOLF: { emoji: '🎰', label: 'Slot' },
    };
    const rows = paytableRows(DEFAULT_MATH, stubDisplay);
    const byTier = Object.fromEntries(rows.map((r) => [r.tier, r.emoji]));

    expect(byTier['jackpot']).toContain('🎰');
    expect(byTier['jackpot']).not.toContain('🦄'); // SPEC-065: the stub overrides the default (unicorn)
  });

  it("paylineCount reads the machine's payline count", () => {
    expect(paylineCount(DEFAULT_MATH)).toBe(20);
  });

  it('paytableRows is machine-driven: multipliers and line-count come from the supplied math', () => {
    const stubMath = {
      ...DEFAULT_MATH,
      paytable: {
        low: [9, 9, 9] as const,
        mid: [9, 9, 9] as const,
        high: [9, 9, 9] as const,
        jackpot: [9, 9, 9] as const,
      },
      paylines: DEFAULT_MATH.paylines.slice(0, 3),
    };
    const rows = paytableRows(stubMath, DEFAULT_DISPLAY);
    for (const row of rows) {
      // Not the engine PAYTABLE numbers — the stub's [9,9,9] for every tier.
      expect(row.multipliers).toEqual([9, 9, 9]);
    }
    expect(paylineCount(stubMath)).toBe(3);
  });
});
