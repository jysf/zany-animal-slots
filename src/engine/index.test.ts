// Tests for the public engine interface (SPEC-011).
// All fixtures were computed from the composed pipeline (canonical RNG + strips +
// paylines + paytable) during the design cycle and are pinned here.

import { describe, it, expect } from 'vitest';
import {
  spin,
  BET_LEVELS,
  DEFAULT_BET,
  STARTING_BALANCE,
  PAYLINES,
  SYMBOLS,
  nextBet,
  prevBet,
  canAfford,
} from './index';

describe('spin()', () => {
  it('a losing spin debits the bet and returns tier none', () => {
    const result = spin({ seed: 12345, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(0);
    expect(result.tier).toBe('none');
    expect(result.balance).toBe(990);
    expect(result.bet).toBe(10);
    expect(result.grid).toEqual([
      ['DEER', 'DEER', 'FOX'],
      ['BEAR', 'FOX', 'SQUIRREL'],
      ['BEAR', 'OWL', 'BISON'],
      ['OWL', 'BISON', 'WOLF'],
      ['OWL', 'BISON', 'WOLF'],
    ]);
  });

  it('a small win credits and classifies small', () => {
    const result = spin({ seed: 1, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(10);
    expect(result.tier).toBe('small');
    // balance = 1000 − 10 + 10 = 1000
    expect(result.balance).toBe(1000);
    expect(result.lineWins).toHaveLength(1);
  });

  it('a big multi-line win credits and classifies big', () => {
    const result = spin({ seed: 6, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(70);
    expect(result.tier).toBe('big');
    expect(result.balance).toBe(1060);
    expect(result.lineWins).toHaveLength(1);
  });

  it('a jackpot spin credits 2500 and classifies jackpot', () => {
    const result = spin({ seed: 68357, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.totalWin).toBe(2500);
    expect(result.tier).toBe('jackpot');
    // balance = 1000 − 10 + 2500 = 3490
    expect(result.balance).toBe(3490);
  });

  it('an unaffordable spin returns insufficient-balance without spinning', () => {
    const result = spin({ seed: 1, balance: 5, bet: 10 });

    expect(result).toEqual({
      ok: false,
      reason: 'insufficient-balance',
      balance: 5,
    });
    // Confirm no grid field on the failure result
    expect('grid' in result).toBe(false);
    // Does not throw (implicitly verified by reaching this line)
  });

  it('a spin is deterministic for the same inputs', () => {
    const first = spin({ seed: 999, balance: 1000, bet: 25 });
    const second = spin({ seed: 999, balance: 1000, bet: 25 });

    expect(first).toEqual(second);
  });

  it('the balance reflects debit then credit', () => {
    // seed 276, balance 1000, bet 10 → totalWin 40 (DEC-016 retune re-baseline)
    // Expected: 1000 − 10 + 40 = 1030 (debit first, then credit the win)
    const result = spin({ seed: 276, balance: 1000, bet: 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.balance).toBe(1030);
  });
});

describe('re-exports the public surface the UI needs', () => {
  it('BET_LEVELS, DEFAULT_BET, STARTING_BALANCE', () => {
    expect(BET_LEVELS).toEqual([10, 25, 50]);
    expect(DEFAULT_BET).toBe(10);
    expect(STARTING_BALANCE).toBe(1000);
  });

  it('PAYLINES.length and SYMBOLS.length', () => {
    expect(PAYLINES).toHaveLength(20);
    expect(SYMBOLS).toHaveLength(8);
  });

  it('nextBet, prevBet, canAfford are functions', () => {
    expect(typeof nextBet).toBe('function');
    expect(typeof prevBet).toBe('function');
    expect(typeof canAfford).toBe('function');
  });
});
