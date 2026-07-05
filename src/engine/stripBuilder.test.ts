// Tests for the deterministic reel-strip builder (SPEC-045).
// Proves count-exactness, determinism, adjacency-freedom, and degenerate handling
// BEFORE SPEC-046 wires buildStrip into a machine's live strips.
import { describe, expect, it } from 'vitest';
import { buildStrip } from './stripBuilder';
import { SYMBOLS, type SymbolId } from './strips';

/** Tally symbol occurrences in a strip. */
function counts(strip: readonly SymbolId[]): Partial<Record<SymbolId, number>> {
  const c: Partial<Record<SymbolId, number>> = {};
  for (const s of strip) c[s] = (c[s] ?? 0) + 1;
  return c;
}

describe('buildStrip', () => {
  it('count-exact: output has exactly weights[s] copies of each symbol', () => {
    const weights: Partial<Record<SymbolId, number>> = {
      DEER: 9,
      FOX: 8,
      SQUIRREL: 7,
      BEAR: 5,
      EAGLE: 4,
      OWL: 3,
      BISON: 3,
      WOLF: 3,
    };
    const strip = buildStrip(SYMBOLS, weights);
    expect(counts(strip)).toEqual(weights);
    expect(strip.length).toBe(42);
  });

  it('count-exact across several weight profiles', () => {
    const profiles: Partial<Record<SymbolId, number>>[] = [
      // all-equal
      {
        DEER: 4,
        FOX: 4,
        SQUIRREL: 4,
        BEAR: 4,
        EAGLE: 4,
        OWL: 4,
        BISON: 4,
        WOLF: 4,
      },
      // low-heavy
      {
        DEER: 12,
        FOX: 10,
        SQUIRREL: 9,
        BEAR: 2,
        EAGLE: 2,
        OWL: 1,
        BISON: 1,
        WOLF: 1,
      },
      // sparse
      {
        DEER: 5,
        WOLF: 1,
      },
    ];

    for (const weights of profiles) {
      const strip = buildStrip(SYMBOLS, weights);
      expect(counts(strip)).toEqual(weights);
      const total = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0);
      expect(strip.length).toBe(total);
    }
  });

  it('deterministic: same inputs yield a deep-equal strip', () => {
    const weights: Partial<Record<SymbolId, number>> = {
      DEER: 9,
      FOX: 8,
      SQUIRREL: 7,
      BEAR: 5,
      EAGLE: 4,
      OWL: 3,
      BISON: 3,
      WOLF: 3,
    };
    expect(buildStrip(SYMBOLS, weights)).toEqual(buildStrip(SYMBOLS, weights));
  });

  it('pinned example (locks the algorithm output)', () => {
    expect(buildStrip(SYMBOLS, { DEER: 3, FOX: 2, WOLF: 1 })).toEqual([
      'DEER',
      'FOX',
      'DEER',
      'WOLF',
      'FOX',
      'DEER',
    ]);
  });

  it('no linear adjacent duplicates on realistic weights', () => {
    const tuned: Partial<Record<SymbolId, number>> = {
      DEER: 9,
      FOX: 8,
      SQUIRREL: 7,
      BEAR: 5,
      EAGLE: 4,
      OWL: 3,
      BISON: 3,
      WOLF: 3,
    };
    for (const strip of [
      buildStrip(SYMBOLS, tuned),
      buildStrip(SYMBOLS, { DEER: 3, FOX: 2, WOLF: 1 }),
    ]) {
      for (let i = 0; i < strip.length - 1; i++) {
        expect(strip[i]).not.toBe(strip[i + 1]);
      }
    }
  });

  it('zero / absent-weight symbols never appear', () => {
    const strip = buildStrip(SYMBOLS, { DEER: 2, WOLF: 1 });
    expect(strip).not.toContain('FOX');
    expect(counts(strip)).toEqual({ DEER: 2, WOLF: 1 });
  });

  it('degenerate single-symbol weights repeat that symbol', () => {
    expect(buildStrip(['DEER'], { DEER: 4 })).toEqual(['DEER', 'DEER', 'DEER', 'DEER']);
  });
});
