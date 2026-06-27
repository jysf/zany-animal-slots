// Unit tests for paytableRows() — SPEC-020 failing tests (written at design).
// DEC-011 multiplier values are the source of truth for the assertions below.

import { describe, it, expect } from 'vitest';
import { paytableRows } from './paytable';
import { PAYTABLE } from '../engine/index';

describe('paytableRows()', () => {
  it('returns the four tiers in descending value order', () => {
    expect(paytableRows().map((r) => r.tier)).toEqual([
      'jackpot',
      'high',
      'mid',
      'low',
    ]);
  });

  it('each tier has its DEC-011 multipliers', () => {
    const rows = paytableRows();
    const byTier = Object.fromEntries(rows.map((r) => [r.tier, r.multipliers]));

    expect(byTier['jackpot']).toEqual([8, 40, 200]);
    expect(byTier['high']).toEqual([3, 10, 40]);
    expect(byTier['mid']).toEqual([1, 4, 12]);
    expect(byTier['low']).toEqual([0.5, 2, 5]);
  });

  it("each tier lists its symbols' emoji", () => {
    const rows = paytableRows();
    const byTier = Object.fromEntries(rows.map((r) => [r.tier, r.emoji]));

    expect(byTier['jackpot']).toContain('🐺');
    expect(byTier['high']).toContain('🦬');
    expect(byTier['mid']).toContain('🐻');
    expect(byTier['mid']).toContain('🦅');
    expect(byTier['mid']).toContain('🦉');
    expect(byTier['low']).toContain('🦌');
    expect(byTier['low']).toContain('🦊');
    expect(byTier['low']).toContain('🐿️');
  });

  it('multipliers come from the engine PAYTABLE', () => {
    const rows = paytableRows();
    for (const row of rows) {
      // Deep equality against PAYTABLE — no UI-side constants.
      expect(row.multipliers).toEqual(PAYTABLE[row.tier]);
    }
  });
});
