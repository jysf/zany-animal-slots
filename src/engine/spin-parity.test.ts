// SPEC-039 frozen-seed parity guard.
// STAGE-007 deliberately unfreezes the engine to make it config-driven; every
// change is gated by these four frozen seeds (the parity contract, DEC-002) —
// behavior through the default machine must stay byte-identical, and spin()
// with no `machine` arg must be identical to passing WILD_AND_WHIMSICAL_MATH
// explicitly.
// SPEC-046 (DEC-016) deliberately RE-BASELINES the expected outcomes for the tuned
// representative seeds (68357/12345/6/1) — the seeds still guard determinism, but
// their expected values now reflect the retuned machine, not the old one.

import { describe, it, expect } from 'vitest';
import { spin } from './index';
import { WILD_AND_WHIMSICAL_MATH } from './machine';

describe('spin-parity (frozen seeds)', () => {
  it('seed 68357 → jackpot 2500 through the default machine', () => {
    const result = spin({ seed: 68357, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(2500);
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

  it('seed 6 → big, 70', () => {
    const result = spin({ seed: 6, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(70);
    expect(result.tier).toBe('big');
    expect(result.lineWins).toHaveLength(1);
  });

  it('seed 1 → small, 10', () => {
    const result = spin({ seed: 1, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(10);
    expect(result.tier).toBe('small');
  });

  it('explicit machine equals the default for every frozen seed', () => {
    for (const seed of [68357, 12345, 6, 1]) {
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
