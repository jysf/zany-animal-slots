// Tests for the machine-metrics simulator (STAGE-008 / SPEC-044).
// Determinism + exact-RTP on synthetic degenerate machines + the pinned W&W baseline
// (SPEC-046 / DEC-016 intentionally re-baselines this fixture to the tuned "after" numbers —
// RTP 93.8% / hit 34.4%, versus the old measured 13% / 10%).
import { describe, it, expect } from 'vitest';
import { simulateMachine } from './metrics';
import { WILD_AND_WHIMSICAL_MATH } from './machine';

// Spread-and-override synthetic machines (spec Notes): a single-symbol strip means
// every payline resolves to five-of-a-kind on 'DEER', so RTP is exactly computable.
const oneReel = ['DEER'] as const;
const allWin = {
  ...WILD_AND_WHIMSICAL_MATH,
  symbols: ['DEER'] as const,
  strips: Array.from({ length: WILD_AND_WHIMSICAL_MATH.reelCount }, () => oneReel),
  paylines: [{ id: 'L1' as const, rows: [0, 0, 0, 0, 0] }],
  paytable: { ...WILD_AND_WHIMSICAL_MATH.paytable, low: [0.5, 2, 5] as const },
  symbolTier: { ...WILD_AND_WHIMSICAL_MATH.symbolTier, DEER: 'low' as const },
  jackpot: { symbol: 'WOLF' as const, count: 5 }, // never matches five DEER
  tiers: { bigMultiple: 1_000_000 }, // keep the tier 'small', never 'big'
};
const coldWin = { ...allWin, paytable: { ...allWin.paytable, low: [0, 0, 0] as const } };

describe('simulateMachine', () => {
  it('is deterministic — same math + opts yield deep-equal metrics', () => {
    const a = simulateMachine(WILD_AND_WHIMSICAL_MATH, { spins: 2000, seed: 7 });
    const b = simulateMachine(WILD_AND_WHIMSICAL_MATH, { spins: 2000, seed: 7 });
    expect(a).toEqual(b);
  });

  it('the seed changes the outcome', () => {
    const a = simulateMachine(WILD_AND_WHIMSICAL_MATH, { spins: 2000, seed: 1 });
    const b = simulateMachine(WILD_AND_WHIMSICAL_MATH, { spins: 2000, seed: 2 });
    expect(a).not.toEqual(b);
  });

  it('RTP is exact on an all-win machine', () => {
    const m = simulateMachine(allWin, { spins: 500, bet: 10 });
    expect(m.rtp).toBe(5);
    expect(m.hitFrequency).toBe(1);
    expect(m.tierCounts.none).toBe(0);
    expect(m.jackpots).toBe(0);
    expect(m.maxWin).toBe(50);
  });

  it('RTP is zero on a never-win machine', () => {
    const m = simulateMachine(coldWin, { spins: 500, bet: 10 });
    expect(m.rtp).toBe(0);
    expect(m.hits).toBe(0);
    expect(m.hitFrequency).toBe(0);
    expect(m.tierCounts.none).toBe(m.spins);
  });

  it('tier counts sum to spins and frequencies sum to ~1', () => {
    const m = simulateMachine(WILD_AND_WHIMSICAL_MATH, { spins: 3000, seed: 42 });
    const tierSum = Object.values(m.tierCounts).reduce((a, b) => a + b, 0);
    expect(tierSum).toBe(3000);
    const freqSum = Object.values(m.tierFrequency).reduce((a, b) => a + b, 0);
    expect(freqSum).toBeCloseTo(1, 10);
    expect(m.hitFrequency).toBeCloseTo(m.hits / m.spins);
  });

  it('reproduces the pinned Wild & Whimsical baseline (DEC-016 retuned target)', () => {
    const m = simulateMachine(WILD_AND_WHIMSICAL_MATH, { spins: 50000, seed: 20260705, bet: 10 });
    expect(m.rtp).toBeCloseTo(0.9379, 4);
    expect(m.hitFrequency).toBeCloseTo(0.3443, 4);
    expect(m.tierCounts).toEqual({ none: 32787, small: 14975, big: 2237, jackpot: 1 });
    expect(m.jackpots).toBe(1);
    expect(m.maxWin).toBe(3150);
    expect(m.totalWagered).toBe(500000);
    expect(m.totalReturned).toBe(468950);
  });
});
