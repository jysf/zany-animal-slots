import { describe, expect, it } from 'vitest';
import {
  REEL_COUNT,
  REEL_STRIP,
  REEL_WEIGHTS,
  STRIPS,
  SYMBOL_TIER,
  SYMBOLS,
  visibleCells,
} from './strips';

describe('strips', () => {
  it('has the eight DEC-006 symbols', () => {
    expect(SYMBOLS).toEqual([
      'DEER',
      'FOX',
      'SQUIRREL',
      'BEAR',
      'EAGLE',
      'OWL',
      'BISON',
      'WOLF',
    ]);
  });

  it('maps each symbol to its DEC-006 tier', () => {
    expect(SYMBOL_TIER).toEqual({
      DEER: 'low',
      FOX: 'low',
      SQUIRREL: 'low',
      BEAR: 'mid',
      EAGLE: 'mid',
      OWL: 'mid',
      BISON: 'high',
      WOLF: 'jackpot',
    });
  });

  it('weights match DEC-011 and sum to 35', () => {
    expect(REEL_WEIGHTS).toEqual({
      DEER: 7,
      FOX: 7,
      SQUIRREL: 6,
      BEAR: 4,
      EAGLE: 4,
      OWL: 4,
      BISON: 2,
      WOLF: 1,
    });
    const total = Object.values(REEL_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBe(35);
  });

  it('the reel strip honors the weights', () => {
    expect(REEL_STRIP.length).toBe(35);

    // Count each symbol in the strip and compare to REEL_WEIGHTS.
    const counts: Record<string, number> = {};
    for (const symbol of REEL_STRIP) {
      counts[symbol] = (counts[symbol] ?? 0) + 1;
    }
    expect(counts).toEqual(REEL_WEIGHTS);
  });

  it('all five reels share the canonical composition', () => {
    expect(STRIPS.length).toBe(REEL_COUNT);
    for (const strip of STRIPS) {
      expect(strip.length).toBe(35);
      const counts: Record<string, number> = {};
      for (const symbol of strip) {
        counts[symbol] = (counts[symbol] ?? 0) + 1;
      }
      expect(counts).toEqual(REEL_WEIGHTS);
    }
  });

  it('the canonical strip order is pinned', () => {
    expect(REEL_STRIP).toEqual([
      'DEER', 'FOX', 'SQUIRREL', 'BEAR', 'EAGLE', 'OWL', 'DEER', 'FOX', 'SQUIRREL', 'BISON',
      'DEER', 'FOX', 'BEAR', 'EAGLE', 'OWL', 'SQUIRREL', 'DEER', 'FOX', 'WOLF', 'SQUIRREL',
      'BEAR', 'EAGLE', 'OWL', 'DEER', 'FOX', 'SQUIRREL', 'BISON', 'DEER', 'FOX', 'BEAR',
      'EAGLE', 'OWL', 'SQUIRREL', 'DEER', 'FOX',
    ]);
  });

  it('visibleCells returns three consecutive symbols', () => {
    const [a, b, c] = visibleCells(REEL_STRIP, 0);
    expect(a).toBe(REEL_STRIP[0]);
    expect(b).toBe(REEL_STRIP[1]);
    expect(c).toBe(REEL_STRIP[2]);
  });

  it('visibleCells wraps at the end of the strip', () => {
    // Stop at index 34 (last): should wrap to indices 34, 0, 1.
    expect(visibleCells(REEL_STRIP, 34)).toEqual([
      REEL_STRIP[34],
      REEL_STRIP[0],
      REEL_STRIP[1],
    ]);

    // Stop at index 33: should wrap to indices 33, 34, 0.
    expect(visibleCells(REEL_STRIP, 33)).toEqual([
      REEL_STRIP[33],
      REEL_STRIP[34],
      REEL_STRIP[0],
    ]);
  });
});
