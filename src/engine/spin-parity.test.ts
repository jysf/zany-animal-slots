// SPEC-039 frozen-seed parity guard.
// STAGE-007 deliberately unfreezes the engine to make it config-driven; every
// change is gated by these four frozen seeds (the parity contract, DEC-002) —
// behavior through the default machine must stay byte-identical, and spin()
// with no `machine` arg must be identical to passing WILD_AND_WHIMSICAL_MATH
// explicitly.

import { describe, it, expect } from 'vitest';
import { spin } from './index';
import { WILD_AND_WHIMSICAL_MATH } from './machine';

describe('spin-parity (frozen seeds)', () => {
  it('seed 407947 → jackpot 2000 through the default machine', () => {
    const result = spin({ seed: 407947, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(2000);
    expect(result.tier).toBe('jackpot');
    expect(
      result.lineWins.some((w) => w.symbol === 'WOLF' && w.count === 5),
    ).toBe(true);
  });

  it('seed 12345 → losing (0 / none)', () => {
    const result = spin({ seed: 12345, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(0);
    expect(result.tier).toBe('none');
  });

  it('seed 276 → big, 55, 3 lines', () => {
    const result = spin({ seed: 276, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(55);
    expect(result.tier).toBe('big');
    expect(result.lineWins).toHaveLength(3);
  });

  it('seed 12 → small, 10', () => {
    const result = spin({ seed: 12, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(10);
    expect(result.tier).toBe('small');
  });

  it('explicit machine equals the default for every frozen seed', () => {
    for (const seed of [407947, 12345, 276, 12]) {
      const viaDefault = spin({ seed, balance: 1000, bet: 10 });
      const viaExplicit = spin({
        seed,
        balance: 1000,
        bet: 10,
        machine: WILD_AND_WHIMSICAL_MATH,
      });
      expect(viaDefault).toEqual(viaExplicit);
    }
  });
});
