// statsStorage unit tests (SPEC-054, DEC-020). Plain Vitest, no DOM/JSX — jsdom
// provides localStorage.
import { STATS_KEY, readStats, writeStats } from './statsStorage';
import { emptyStats, recordSpin, recordCashIn } from './sessionStats';

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
});
