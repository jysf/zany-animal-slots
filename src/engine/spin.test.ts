import { describe, it, expect } from 'vitest';
import { createRng } from './rng';
import { STRIPS, visibleCells } from './strips';
import { resolveStops, resolveGrid } from './spin';
import { WILD_AND_WHIMSICAL_MATH } from './machine';

describe('resolveStops', () => {
  it('returns five in-range stops', () => {
    const rng = createRng(7);
    const stops = resolveStops(rng, WILD_AND_WHIMSICAL_MATH.strips);
    expect(stops).toHaveLength(5);
    for (const stop of stops) {
      expect(Number.isInteger(stop)).toBe(true);
      expect(stop).toBeGreaterThanOrEqual(0);
      expect(stop).toBeLessThan(42);
    }
  });

  it('consumes exactly one draw per reel, in order', () => {
    // After resolveStops(a) consumes 5 draws, the next draw from a must equal
    // the 6th draw from b (which we advance manually by 5).
    const a = createRng(5);
    const b = createRng(5);
    resolveStops(a, WILD_AND_WHIMSICAL_MATH.strips);
    // Advance b by the same 5 draws
    b(); b(); b(); b(); b();
    expect(a()).toBe(b());
  });

  it('is deterministic and matches the pinned seed', () => {
    // Re-baselined (SPEC-046 / DEC-016): the strip is now 42-long (was 35), so the
    // same RNG draws land on different (still in-range) stop indices.
    const rng = createRng(12345);
    const stops = resolveStops(rng, WILD_AND_WHIMSICAL_MATH.strips);
    expect(stops).toEqual([41, 12, 20, 34, 21]);
  });
});

describe('resolveGrid', () => {
  it('is 5 reels × 3 rows', () => {
    const grid = resolveGrid(createRng(7), WILD_AND_WHIMSICAL_MATH);
    expect(grid).toHaveLength(5);
    for (const reel of grid) {
      expect(reel).toHaveLength(3);
    }
  });

  it('each grid column equals visibleCells at the drawn stop', () => {
    // Use the same seed for both calls — resolveStops and resolveGrid must be
    // consistent since they start from the same PRNG state.
    const stops = resolveStops(createRng(5), WILD_AND_WHIMSICAL_MATH.strips);
    const grid = resolveGrid(createRng(5), WILD_AND_WHIMSICAL_MATH);
    for (let reel = 0; reel < 5; reel++) {
      expect(grid[reel]).toEqual(visibleCells(STRIPS[reel], stops[reel]));
    }
  });

  it('matches the pinned grid for seed 12345', () => {
    // Re-baselined (SPEC-046 / DEC-016): same seed, new (tuned) strip → new grid.
    const grid = resolveGrid(createRng(12345), WILD_AND_WHIMSICAL_MATH);
    expect(grid).toEqual([
      ['DEER', 'DEER', 'FOX'],
      ['BEAR', 'FOX', 'SQUIRREL'],
      ['BEAR', 'OWL', 'BISON'],
      ['OWL', 'BISON', 'WOLF'],
      ['OWL', 'BISON', 'WOLF'],
    ]);
  });

  it('is deterministic', () => {
    const grid1 = resolveGrid(createRng(99), WILD_AND_WHIMSICAL_MATH);
    const grid2 = resolveGrid(createRng(99), WILD_AND_WHIMSICAL_MATH);
    expect(grid1).toEqual(grid2);
  });
});
