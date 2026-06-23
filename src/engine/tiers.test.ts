// Tests for win-tier classification (SPEC-010).
// All cases from the spec's "Failing Tests" section.

import { describe, expect, it } from 'vitest';
import type { LineWin } from './paylines';
import { classifyWin, isJackpot } from './tiers';

/** Shorthand: build a LineWin-shaped object from symbol, count, and amount. */
function lw(symbol: LineWin['symbol'], count: LineWin['count'], amount: number): LineWin {
  return { line: 'L1', symbol, count, multiplier: 0, amount };
}

describe('classifyWin', () => {
  it('classifies no win as none', () => {
    expect(classifyWin(0, 10, [])).toBe('none');
  });

  it('classifies a sub-5x win as small', () => {
    expect(classifyWin(10, 10, [lw('BEAR', 3, 10)])).toBe('small');
    // just under the 5× boundary (50): still small
    expect(classifyWin(49, 10, [lw('BEAR', 3, 49)])).toBe('small');
  });

  it('classifies a >=5x win as big', () => {
    // boundary is big
    expect(classifyWin(50, 10, [lw('DEER', 5, 50)])).toBe('big');
    expect(classifyWin(100, 10, [lw('BISON', 4, 100)])).toBe('big');
  });

  it('classifies five Wolves as jackpot', () => {
    expect(classifyWin(2000, 10, [lw('WOLF', 5, 2000)])).toBe('jackpot');
  });

  it('jackpot takes precedence over big', () => {
    // A five-Wolf line mixed with other lines still classifies as jackpot.
    expect(
      classifyWin(2050, 10, [lw('WOLF', 5, 2000), lw('BISON', 4, 50)]),
    ).toBe('jackpot');
  });

  it('a large non-Wolf win is big, not jackpot', () => {
    // Five Bison is a large win but not the jackpot (DEC-003: jackpot = WOLF only).
    expect(classifyWin(400, 10, [lw('BISON', 5, 400)])).toBe('big');
  });
});

describe('isJackpot', () => {
  it('detects a five-Wolf line', () => {
    expect(isJackpot([lw('WOLF', 5, 2000)])).toBe(true);
  });

  it('returns false for a three-Wolf line', () => {
    expect(isJackpot([lw('WOLF', 3, 80)])).toBe(false);
  });

  it('returns false for five non-Wolf', () => {
    expect(isJackpot([lw('BISON', 5, 400)])).toBe(false);
  });

  it('returns false for empty line wins', () => {
    expect(isJackpot([])).toBe(false);
  });
});
