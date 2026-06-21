// Payline + paytable evaluation tests (SPEC-008).
// Tests written during design (TDD); implementation makes them pass.

import { describe, it, expect } from 'vitest';
import type { Grid } from './spin';
import {
  PAYLINES,
  PAYTABLE,
  lineSymbols,
  evaluatePaylines,
} from './paylines';

describe('PAYLINES', () => {
  it('PAYLINES matches DEC-003', () => {
    expect(PAYLINES).toHaveLength(5);
    expect(PAYLINES[0]).toEqual({ id: 'L1', rows: [1, 1, 1, 1, 1] });
    expect(PAYLINES[1]).toEqual({ id: 'L2', rows: [0, 0, 0, 0, 0] });
    expect(PAYLINES[2]).toEqual({ id: 'L3', rows: [2, 2, 2, 2, 2] });
    expect(PAYLINES[3]).toEqual({ id: 'L4', rows: [0, 1, 2, 1, 0] });
    expect(PAYLINES[4]).toEqual({ id: 'L5', rows: [2, 1, 0, 1, 2] });
  });
});

describe('PAYTABLE', () => {
  it('PAYTABLE matches DEC-011', () => {
    expect(PAYTABLE).toEqual({
      low:     [0.5, 2,   5],
      mid:     [1,   4,  12],
      high:    [3,  10,  40],
      jackpot: [8,  40, 200],
    });
  });
});

describe('lineSymbols', () => {
  it('lineSymbols reads cells along a line', () => {
    // grid[reel][row]
    const G: Grid = [
      ['DEER',     'FOX',    'SQUIRREL'],  // reel 0
      ['SQUIRREL', 'BEAR',   'DEER'],      // reel 1
      ['EAGLE',    'BEAR',   'FOX'],       // reel 2
      ['OWL',      'BEAR',   'BISON'],     // reel 3
      ['DEER',     'EAGLE',  'OWL'],       // reel 4
    ];
    // L4 rows = [0, 1, 2, 1, 0] → reel0 row0, reel1 row1, reel2 row2, reel3 row1, reel4 row0
    const L4 = PAYLINES.find((p) => p.id === 'L4')!;
    expect(lineSymbols(G, L4)).toEqual(['DEER', 'BEAR', 'FOX', 'BEAR', 'DEER']);
  });
});

describe('evaluatePaylines', () => {
  it('a non-winning grid pays nothing', () => {
    const grid: Grid = [
      ['DEER',  'FOX',   'SQUIRREL'],
      ['BEAR',  'EAGLE', 'OWL'],
      ['DEER',  'BISON', 'FOX'],
      ['EAGLE', 'DEER',  'SQUIRREL'],
      ['FOX',   'OWL',   'BEAR'],
    ];
    const result = evaluatePaylines(grid, 10);
    expect(result.totalWin).toBe(0);
    expect(result.lineWins).toEqual([]);
  });

  it('a run must start at reel 0', () => {
    // Grid G from lineSymbols test — L1 middle row is FOX, BEAR, BEAR, BEAR, EAGLE
    // Three BEARs appear but NOT starting at reel 0, so no win.
    const G: Grid = [
      ['DEER',     'FOX',    'SQUIRREL'],  // reel 0
      ['SQUIRREL', 'BEAR',   'DEER'],      // reel 1
      ['EAGLE',    'BEAR',   'FOX'],       // reel 2
      ['OWL',      'BEAR',   'BISON'],     // reel 3
      ['DEER',     'EAGLE',  'OWL'],       // reel 4
    ];
    const result = evaluatePaylines(G, 10);
    expect(result.totalWin).toBe(0);
    expect(result.lineWins).toEqual([]);
  });

  it('scores a single 3-of-a-kind mid on L1', () => {
    // L1 = middle row [1,1,1,1,1] → reels 0..4 row 1 = BEAR, BEAR, BEAR, DEER, FOX
    const grid: Grid = [
      ['DEER',     'BEAR', 'SQUIRREL'],  // reel 0
      ['FOX',      'BEAR', 'DEER'],      // reel 1
      ['SQUIRREL', 'BEAR', 'FOX'],       // reel 2
      ['BEAR',     'DEER', 'EAGLE'],     // reel 3
      ['EAGLE',    'FOX',  'OWL'],       // reel 4
    ];
    const result = evaluatePaylines(grid, 10);
    expect(result.totalWin).toBe(10);
    expect(result.lineWins).toHaveLength(1);
    expect(result.lineWins[0]).toEqual({
      line: 'L1',
      symbol: 'BEAR',
      count: 3,
      multiplier: 1,
      amount: 10,
    });
  });

  it('scores a 5-of-a-kind low on L2', () => {
    // L2 = top row [0,0,0,0,0] → all row 0 = DEER, DEER, DEER, DEER, DEER
    const grid: Grid = [
      ['DEER', 'FOX',    'SQUIRREL'],
      ['DEER', 'BEAR',   'OWL'],
      ['DEER', 'EAGLE',  'FOX'],
      ['DEER', 'OWL',    'BISON'],
      ['DEER', 'BEAR',   'SQUIRREL'],
    ];
    const result = evaluatePaylines(grid, 10);
    expect(result.totalWin).toBe(50);
    expect(result.lineWins).toHaveLength(1);
    expect(result.lineWins[0]).toEqual({
      line: 'L2',
      symbol: 'DEER',
      count: 5,
      multiplier: 5,
      amount: 50,
    });
  });

  it('scores a 4-of-a-kind high on L1', () => {
    // L1 = middle row [1,1,1,1,1] → row 1 = BISON, BISON, BISON, BISON, DEER
    const grid: Grid = [
      ['BISON',    'BISON', 'DEER'],   // reel 0 row1 = BISON
      ['FOX',      'BISON', 'OWL'],    // reel 1 row1 = BISON
      ['SQUIRREL', 'BISON', 'FOX'],    // reel 2 row1 = BISON
      ['BEAR',     'BISON', 'EAGLE'],  // reel 3 row1 = BISON
      ['EAGLE',    'DEER',  'OWL'],    // reel 4 row1 = DEER  (run stops at 4)
    ];
    const result = evaluatePaylines(grid, 10);
    expect(result.totalWin).toBe(100);
    expect(result.lineWins).toHaveLength(1);
    expect(result.lineWins[0]).toEqual({
      line: 'L1',
      symbol: 'BISON',
      count: 4,
      multiplier: 10,
      amount: 100,
    });
  });

  it('five Wolves pays the jackpot amount on every line', () => {
    // All-WOLF 5×3 grid — every payline hits 5-of-a-kind jackpot.
    const grid: Grid = [
      ['WOLF', 'WOLF', 'WOLF'],
      ['WOLF', 'WOLF', 'WOLF'],
      ['WOLF', 'WOLF', 'WOLF'],
      ['WOLF', 'WOLF', 'WOLF'],
      ['WOLF', 'WOLF', 'WOLF'],
    ];
    const result = evaluatePaylines(grid, 10);
    // 5 lines × floor(200 × 10) = 5 × 2000 = 10000
    expect(result.totalWin).toBe(10000);
    expect(result.lineWins).toHaveLength(5);
    for (const win of result.lineWins) {
      expect(win).toMatchObject({
        symbol: 'WOLF',
        count: 5,
        multiplier: 200,
        amount: 2000,
      });
    }
  });

  it('sums multiple hitting lines', () => {
    // L1 row 1 = BEAR, BEAR, BEAR, FOX, EAGLE  → 3-of-a-kind mid
    // L3 row 2 = DEER, DEER, DEER, BISON, SQUIRREL → 3-of-a-kind low
    const grid: Grid = [
      ['FOX',      'BEAR', 'DEER'],      // reel 0
      ['SQUIRREL', 'BEAR', 'DEER'],      // reel 1
      ['EAGLE',    'BEAR', 'DEER'],      // reel 2
      ['OWL',      'FOX',  'BISON'],     // reel 3
      ['DEER',     'EAGLE','SQUIRREL'],  // reel 4
    ];
    // totalBet 10: L1 mid 3 = floor(1 × 10) = 10; L3 low 3 = floor(0.5 × 10) = 5; total = 15
    const r10 = evaluatePaylines(grid, 10);
    expect(r10.totalWin).toBe(15);

    // totalBet 25: L1 mid 3 = floor(1 × 25) = 25; L3 low 3 = floor(0.5 × 25) = 12; total = 37
    const r25 = evaluatePaylines(grid, 25);
    expect(r25.totalWin).toBe(37);
  });

  it('floors fractional payouts', () => {
    // L2 top row [0,0,0,0,0] = DEER, DEER, DEER, FOX, EAGLE → 3-of-a-kind low
    // floor(0.5 × 25) = floor(12.5) = 12
    const grid: Grid = [
      ['DEER',   'BEAR',  'SQUIRREL'],
      ['DEER',   'EAGLE', 'FOX'],
      ['DEER',   'OWL',   'BISON'],
      ['FOX',    'DEER',  'EAGLE'],
      ['EAGLE',  'FOX',   'OWL'],
    ];
    const result = evaluatePaylines(grid, 25);
    expect(result.lineWins).toHaveLength(1);
    expect(result.lineWins[0].amount).toBe(12);
    expect(result.totalWin).toBe(12);
  });
});
