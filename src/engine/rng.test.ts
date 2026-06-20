import { describe, it, expect } from 'vitest';
import { createRng, randomInt } from './rng';

describe('createRng', () => {
  it('yields floats in [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic — same seed yields the same sequence', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());
    expect(seq1).toEqual(seq2);
  });

  it('different seeds yield different sequences', () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
    const seq1 = Array.from({ length: 10 }, createRng(1));
    const seq2 = Array.from({ length: 10 }, createRng(2));
    expect(seq1).not.toEqual(seq2);
  });

  it('matches the canonical mulberry32 sequence for seed 12345', () => {
    const rng = createRng(12345);
    const expected = [
      0.979728267760947,
      0.306752264499664,
      0.484205421525985,
      0.817934412509203,
      0.509428369347006,
    ];
    for (const val of expected) {
      expect(rng()).toBeCloseTo(val, 10);
    }
  });
});

describe('randomInt', () => {
  it('returns integers within [0, maxExclusive)', () => {
    const rng = createRng(99);
    for (let i = 0; i < 1000; i++) {
      const r = randomInt(rng, 35);
      expect(Number.isInteger(r)).toBe(true);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(35);
    }
  });

  it('is deterministic for a pinned seed', () => {
    const rng = createRng(12345);
    const results = Array.from({ length: 10 }, () => randomInt(rng, 35));
    expect(results).toEqual([34, 10, 16, 28, 17, 12, 2, 26, 34, 28]);
  });

  it('throws on a non-positive bound', () => {
    expect(() => randomInt(createRng(1), 0)).toThrow(RangeError);
    expect(() => randomInt(createRng(1), -3)).toThrow(RangeError);
  });
});
