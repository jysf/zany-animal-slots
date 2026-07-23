// statsStorage unit tests (SPEC-054, DEC-020). Plain Vitest, no DOM/JSX — jsdom
// provides localStorage.
import { STATS_KEY, readStats, writeStats } from './statsStorage';
import { emptyStats, recordSpin, recordCashIn } from './sessionStats';
import type { Grid, LineWin } from '../engine';

describe('statsStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('STATS_KEY is the namespaced key', () => {
    expect(STATS_KEY).toBe('zany:stats');
  });

  it('readStats returns emptyStats when absent', () => {
    expect(readStats()).toEqual(emptyStats());
  });

  it('writeStats then readStats round-trips', () => {
    let stats = emptyStats();
    stats = recordSpin(stats, { totalWin: 50, bet: 10, tier: 'big' }, 'ocean');
    stats = recordCashIn(stats);

    writeStats(stats);

    expect(readStats()).toEqual(stats);
  });

  it('readStats returns emptyStats on an unparseable blob (never throws)', () => {
    localStorage.setItem(STATS_KEY, 'not json{');
    expect(readStats()).toEqual(emptyStats());
  });

  it('readStats returns emptyStats on a version mismatch', () => {
    localStorage.setItem(STATS_KEY, JSON.stringify({ ...emptyStats(), version: 999 }));
    expect(readStats()).toEqual(emptyStats());
  });

  it('writeStats never throws when setItem throws', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => writeStats(emptyStats())).not.toThrow();

    setItemSpy.mockRestore();
  });

  it('readStats preserves a pre-topWins blob and defaults topWins to []', () => {
    // A literal blob of the OLD shape (pre-SPEC-073) — no `topWins` key at all. Written
    // directly (not via a re-serialized emptyStats()) so this proves an actual prior-build
    // blob survives the read path intact.
    const oldBlob = {
      version: 1,
      spins: 3,
      winningSpins: 1,
      totalWagered: 30,
      totalWon: 50,
      biggestWin: { amount: 50, machineId: 'ocean', tier: 'big' },
      cashIns: 1,
      series: [-10, -20, 30],
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(oldBlob));

    expect(readStats()).toEqual({ ...oldBlob, topWins: [] });
  });

  it('readStats normalizes a non-array topWins to [] without resetting the record', () => {
    // The surrounding fields carry NON-DEFAULT values on purpose: with emptyStats()'s
    // zeroes here, a readStats() that wrongly reset the whole record would still satisfy
    // the spins/series assertions and the test would pass while the record was destroyed.
    const blob = {
      ...emptyStats(),
      spins: 42,
      winningSpins: 7,
      totalWagered: 420,
      totalWon: 310,
      cashIns: 3,
      series: [-10, 25, -5],
      topWins: 'nope',
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(blob));

    const result = readStats();
    expect(result.topWins).toEqual([]);
    expect(result.spins).toBe(42);
    expect(result.winningSpins).toBe(7);
    expect(result.totalWagered).toBe(420);
    expect(result.totalWon).toBe(310);
    expect(result.cashIns).toBe(3);
    expect(result.series).toEqual([-10, 25, -5]);
  });

  it('writeStats round-trips a record carrying trophies', () => {
    const grid: Grid = [
      ['DEER', 'FOX', 'SQUIRREL'],
      ['DEER', 'FOX', 'SQUIRREL'],
      ['DEER', 'FOX', 'SQUIRREL'],
      ['DEER', 'FOX', 'SQUIRREL'],
      ['DEER', 'FOX', 'SQUIRREL'],
    ];
    const lineWins: LineWin[] = [{ line: 'L1', symbol: 'DEER', count: 5, multiplier: 10, amount: 50 }];

    let stats = emptyStats();
    stats = recordSpin(stats, { totalWin: 50, bet: 10, tier: 'big', grid, lineWins }, 'ocean');
    stats = recordSpin(stats, { totalWin: 200, bet: 25, tier: 'small', grid, lineWins }, 'arctic');

    writeStats(stats);

    expect(readStats()).toEqual(stats);
  });

  it('a version mismatch still discards (unchanged behavior)', () => {
    localStorage.setItem(STATS_KEY, JSON.stringify({ ...emptyStats(), version: 999 }));
    expect(readStats()).toEqual(emptyStats());
  });
});
