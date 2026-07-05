import { describe, it, expect } from 'vitest';
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import {
  SYMBOLS,
  SYMBOL_TIER,
  REEL_WEIGHTS,
  REEL_COUNT,
  REEL_STRIP,
  STRIPS,
} from '../engine/strips';
import { PAYLINES, PAYTABLE } from '../engine/paylines';
import { BET_LEVELS, DEFAULT_BET, STARTING_BALANCE } from '../engine/balance';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';

const { math, presentation } = WILD_AND_WHIMSICAL;

describe('SPEC-038 default machine parity — extracted data == current constants', () => {
  it('identity', () => {
    expect(WILD_AND_WHIMSICAL.id).toBe('wild-and-whimsical');
    expect(WILD_AND_WHIMSICAL.name).toBe('Wild & Whimsical');
  });

  it('symbols + tiers + weights', () => {
    expect(math.symbols).toEqual(SYMBOLS);
    expect(math.symbolTier).toEqual(SYMBOL_TIER);
    expect(math.reelWeights).toEqual(REEL_WEIGHTS);
  });

  it('reel geometry + strips', () => {
    expect(math.reelCount).toBe(REEL_COUNT);
    expect(math.reelCount).toBe(5);
    expect(math.rows).toBe(3);
    expect(math.strips).toEqual(STRIPS);
    expect(math.strips).toHaveLength(5);
    for (const strip of math.strips) {
      expect(strip).toEqual(REEL_STRIP);
      expect(strip).toHaveLength(35);
    }
  });

  it('paylines + paytable', () => {
    expect(math.paylines).toEqual(PAYLINES);
    expect(math.paytable).toEqual(PAYTABLE);
  });

  it('jackpot rule + tier boundary', () => {
    expect(math.jackpot).toEqual({ symbol: 'WOLF', count: 5 });
    expect(math.tiers).toEqual({ bigMultiple: 5 });
  });

  it('bet levels + starting balance', () => {
    expect(math.betLevels).toEqual(BET_LEVELS);
    expect(math.defaultBet).toBe(DEFAULT_BET);
    expect(math.startingBalance).toBe(STARTING_BALANCE);
    expect(math.startingBalance).toBe(1000);
  });

  it('presentation symbolDisplay', () => {
    expect(presentation.symbolDisplay).toEqual(SYMBOL_DISPLAY);
  });

  it('structural completeness — every symbol has a tier, weight, and display', () => {
    for (const s of math.symbols) {
      expect(math.symbolTier[s]).toBeDefined();
      expect(math.reelWeights[s]).toBeGreaterThan(0);
      expect(presentation.symbolDisplay[s]).toBeDefined();
    }
    const sum = Object.values(math.reelWeights).reduce((a, b) => a + b, 0);
    expect(sum).toBe(35);
    expect(sum).toBe(REEL_STRIP.length);
  });
});
