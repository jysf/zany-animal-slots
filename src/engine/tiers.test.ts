// Tests for win-tier classification (SPEC-010).
// All cases from the spec's "Failing Tests" section.

import { describe, expect, it } from 'vitest';
import type { LineWin } from './paylines';
import { classifyWin, isJackpot } from './tiers';
import { WILD_AND_WHIMSICAL_MATH } from './machine';

/** Shorthand: build a LineWin-shaped object from symbol, count, and amount. */
function lw(symbol: LineWin['symbol'], count: LineWin['count'], amount: number): LineWin {
  return { line: 'L1', symbol, count, multiplier: 0, amount };
}

describe('classifyWin', () => {
  it('classifies no win as none', () => {
    expect(classifyWin(0, 10, [], WILD_AND_WHIMSICAL_MATH)).toBe('none');
  });

  it('classifies a sub-5x win as small', () => {
    expect(classifyWin(10, 10, [lw('BEAR', 3, 10)], WILD_AND_WHIMSICAL_MATH)).toBe('small');
    // just under the 5× boundary (50): still small
    expect(classifyWin(49, 10, [lw('BEAR', 3, 49)], WILD_AND_WHIMSICAL_MATH)).toBe('small');
  });

  it('classifies a >=5x win as big', () => {
    // boundary is big
    expect(classifyWin(50, 10, [lw('DEER', 5, 50)], WILD_AND_WHIMSICAL_MATH)).toBe('big');
    expect(classifyWin(100, 10, [lw('BISON', 4, 100)], WILD_AND_WHIMSICAL_MATH)).toBe('big');
  });

  it('classifies five Wolves as jackpot', () => {
    expect(classifyWin(2000, 10, [lw('WOLF', 5, 2000)], WILD_AND_WHIMSICAL_MATH)).toBe('jackpot');
  });

  it('jackpot takes precedence over big', () => {
    // A five-Wolf line mixed with other lines still classifies as jackpot.
    expect(
      classifyWin(2050, 10, [lw('WOLF', 5, 2000), lw('BISON', 4, 50)], WILD_AND_WHIMSICAL_MATH),
    ).toBe('jackpot');
  });

  it('a large non-Wolf win is big, not jackpot', () => {
    // Five Bison is a large win but not the jackpot (DEC-003: jackpot = WOLF only).
    expect(classifyWin(400, 10, [lw('BISON', 5, 400)], WILD_AND_WHIMSICAL_MATH)).toBe('big');
  });
});

describe('isJackpot', () => {
  it('detects a five-Wolf line', () => {
    expect(isJackpot([lw('WOLF', 5, 2000)], WILD_AND_WHIMSICAL_MATH.jackpot)).toBe(true);
  });

  it('returns false for a three-Wolf line', () => {
    expect(isJackpot([lw('WOLF', 3, 80)], WILD_AND_WHIMSICAL_MATH.jackpot)).toBe(false);
  });

  it('returns false for five non-Wolf', () => {
    expect(isJackpot([lw('BISON', 5, 400)], WILD_AND_WHIMSICAL_MATH.jackpot)).toBe(false);
  });

  it('returns false for empty line wins', () => {
    expect(isJackpot([], WILD_AND_WHIMSICAL_MATH.jackpot)).toBe(false);
  });
});

describe('reads the rule from the machine (SPEC-040)', () => {
  it('jackpot symbol/count come from the machine', () => {
    const variant = { ...WILD_AND_WHIMSICAL_MATH, jackpot: { symbol: 'BISON' as const, count: 5 } };

    expect(isJackpot([lw('BISON', 5, 400)], variant.jackpot)).toBe(true);
    expect(isJackpot([lw('BISON', 5, 400)], WILD_AND_WHIMSICAL_MATH.jackpot)).toBe(false);

    expect(classifyWin(400, 10, [lw('BISON', 5, 400)], variant)).toBe('jackpot');
    expect(classifyWin(400, 10, [lw('BISON', 5, 400)], WILD_AND_WHIMSICAL_MATH)).toBe('big');
  });

  it('the big-win boundary comes from the machine', () => {
    const variant = { ...WILD_AND_WHIMSICAL_MATH, tiers: { bigMultiple: 3 } };

    // 30 >= 3×10 under the variant: big
    expect(classifyWin(30, 10, [lw('DEER', 3, 30)], variant)).toBe('big');
    // 30 < 5×10 under the default: small
    expect(classifyWin(30, 10, [lw('DEER', 3, 30)], WILD_AND_WHIMSICAL_MATH)).toBe('small');
  });
});
