// STAGE-007 machine-parity contract — the durable regression guard (SPEC-043).
// The four frozen seeds (DEC-002) run through the REGISTRY-resolved default machine
// (getActiveMachine, SPEC-042) and pin the full outcome. Any future machine/engine change
// must keep this green. Consolidates SPEC-039's spin-parity.test.ts + adds balance, the
// exact grid, and registry resolution. Test-only; no production code.
// SPEC-046 (DEC-016) RE-BASELINES the pinned seeds/outcomes to the tuned machine (one per
// tier: seed 1 small, seed 6 big, seed 68357 jackpot, seed 2 loss) and adds a metrics-sanity
// assertion so the tuning can't silently drift undetected.
import { describe, it, expect } from 'vitest';
import { spin, WILD_AND_WHIMSICAL_MATH } from '../engine/index';
import { simulateMachine } from '../engine/metrics';
import { getActiveMachine } from './registry';

const activeMath = getActiveMachine().math;
const run = (seed: number) =>
  spin({ seed, balance: 1000, bet: 10, machine: activeMath });

describe('STAGE-007 machine-parity contract — frozen seeds through the active machine', () => {
  it('the registry resolves the default machine', () => {
    expect(getActiveMachine().math).toBe(WILD_AND_WHIMSICAL_MATH);
    expect(getActiveMachine().id).toBe('wild-and-whimsical');
  });

  it('seed 1 → small (10, 1 line, balance 1000)', () => {
    const r = run(1);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalWin).toBe(10);
    expect(r.tier).toBe('small');
    expect(r.balance).toBe(1000);
    expect(r.lineWins).toHaveLength(1);
    expect(r.grid).toHaveLength(5);
    for (const reel of r.grid) expect(reel).toHaveLength(3);
  });

  it('seed 6 → big (70, 1 line, balance 1060)', () => {
    const r = run(6);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalWin).toBe(70);
    expect(r.tier).toBe('big');
    expect(r.balance).toBe(1060);
    expect(r.lineWins).toHaveLength(1);
  });

  it('seed 68357 → jackpot (2500, five WOLF, balance 3490)', () => {
    const r = run(68357);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalWin).toBe(2500);
    expect(r.tier).toBe('jackpot');
    expect(r.balance).toBe(3490);
    expect(r.lineWins.some((w) => w.symbol === 'WOLF' && w.count === 5)).toBe(true);
  });

  it('seed 2 → losing (0 / none, balance 990)', () => {
    const r = run(2);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.totalWin).toBe(0);
    expect(r.tier).toBe('none');
    expect(r.balance).toBe(990);
    expect(r.lineWins).toEqual([]);
  });

  it('registry-resolved machine equals the explicit default for every frozen seed', () => {
    for (const seed of [1, 6, 68357, 2]) {
      const viaRegistry = spin({ seed, balance: 1000, bet: 10, machine: getActiveMachine().math });
      const viaExplicit = spin({ seed, balance: 1000, bet: 10, machine: WILD_AND_WHIMSICAL_MATH });
      expect(viaRegistry).toEqual(viaExplicit);
    }
  });

  it('metrics sanity: the active machine\'s RTP stays in the tuned generous band', () => {
    // Guards against the tuning silently drifting away from the DEC-016 target.
    const m = simulateMachine(getActiveMachine().math, { spins: 20000, seed: 1 });
    expect(m.rtp).toBeGreaterThanOrEqual(0.85);
    expect(m.rtp).toBeLessThanOrEqual(1.05);
  });
});
