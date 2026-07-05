// STAGE-007 machine-parity contract — the durable regression guard (SPEC-043).
// The four frozen seeds (DEC-002) run through the REGISTRY-resolved default machine
// (getActiveMachine, SPEC-042) and pin the full outcome. Any future machine/engine change
// must keep this green. Consolidates SPEC-039's spin-parity.test.ts + adds balance, the
// exact grid, and registry resolution. Test-only; no production code.
import { describe, it, expect } from 'vitest';
import { spin, WILD_AND_WHIMSICAL_MATH } from '../engine/index';
import { getActiveMachine } from './registry';

const activeMath = getActiveMachine().math;
const run = (seed: number) =>
  spin({ seed, balance: 1000, bet: 10, machine: activeMath });

describe('STAGE-007 machine-parity contract — frozen seeds through the active machine', () => {
  it('the registry resolves the default machine', () => {
    expect(getActiveMachine().math).toBe(WILD_AND_WHIMSICAL_MATH);
    expect(getActiveMachine().id).toBe('wild-and-whimsical');
  });

  it('seed 407947 → jackpot (2000, five WOLF, balance 2990)', () => {
    const r = run(407947);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalWin).toBe(2000);
    expect(r.tier).toBe('jackpot');
    expect(r.balance).toBe(2990);
    expect(r.lineWins.some((w) => w.symbol === 'WOLF' && w.count === 5)).toBe(true);
    expect(r.grid).toHaveLength(5);
    for (const reel of r.grid) expect(reel).toHaveLength(3);
  });

  it('seed 12345 → losing (0 / none, balance 990, exact grid)', () => {
    const r = run(12345);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalWin).toBe(0);
    expect(r.tier).toBe('none');
    expect(r.balance).toBe(990);
    expect(r.lineWins).toEqual([]);
    expect(r.grid).toEqual([
      ['FOX', 'DEER', 'FOX'],
      ['DEER', 'FOX', 'BEAR'],
      ['DEER', 'FOX', 'WOLF'],
      ['FOX', 'BEAR', 'EAGLE'],
      ['FOX', 'WOLF', 'SQUIRREL'],
    ]);
  });

  it('seed 276 → big (55, 3 lines, balance 1045)', () => {
    const r = run(276);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalWin).toBe(55);
    expect(r.tier).toBe('big');
    expect(r.balance).toBe(1045);
    expect(r.lineWins).toHaveLength(3);
  });

  it('seed 12 → small (10, 1 line, balance 1000)', () => {
    const r = run(12);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalWin).toBe(10);
    expect(r.tier).toBe('small');
    expect(r.balance).toBe(1000);
    expect(r.lineWins).toHaveLength(1);
  });

  it('registry-resolved machine equals the explicit default for every frozen seed', () => {
    for (const seed of [407947, 12345, 276, 12]) {
      const viaRegistry = spin({ seed, balance: 1000, bet: 10, machine: getActiveMachine().math });
      const viaExplicit = spin({ seed, balance: 1000, bet: 10, machine: WILD_AND_WHIMSICAL_MATH });
      expect(viaRegistry).toEqual(viaExplicit);
    }
  });
});
