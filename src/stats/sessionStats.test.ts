// sessionStats unit tests (SPEC-054, DEC-020). Plain Vitest, no DOM/JSX.
import {
  STATS_VERSION,
  SERIES_CAP,
  emptyStats,
  recordSpin,
  recordCashIn,
  deriveMetrics,
} from './sessionStats';

describe('sessionStats', () => {
  it('emptyStats returns a zeroed, versioned record', () => {
    expect(emptyStats()).toEqual({
      version: STATS_VERSION,
      spins: 0,
      winningSpins: 0,
      totalWagered: 0,
      totalWon: 0,
      biggestWin: null,
      cashIns: 0,
      series: [],
    });
  });

  it('recordSpin accumulates counters and appends the cumulative-net series point', () => {
    const s1 = recordSpin(emptyStats(), { totalWin: 0, bet: 10, tier: 'none' }, 'ocean');
    expect(s1.spins).toBe(1);
    expect(s1.winningSpins).toBe(0);
    expect(s1.totalWagered).toBe(10);
    expect(s1.totalWon).toBe(0);
    expect(s1.series).toEqual([-10]);

    const s2 = recordSpin(s1, { totalWin: 50, bet: 10, tier: 'big' }, 'ocean');
    expect(s2.spins).toBe(2);
    expect(s2.winningSpins).toBe(1);
    expect(s2.totalWagered).toBe(20);
    expect(s2.totalWon).toBe(50);
    expect(s2.series).toEqual([-10, 30]);
  });

  it('recordSpin is immutable (does not mutate its input)', () => {
    const before = emptyStats();
    const after = recordSpin(before, { totalWin: 50, bet: 10, tier: 'big' }, 'ocean');
    expect(before).toEqual(emptyStats());
    expect(after).not.toBe(before);
  });

  it('recordSpin updates biggestWin only on a strictly larger win, with machineId + tier', () => {
    let s = emptyStats();
    s = recordSpin(s, { totalWin: 50, bet: 10, tier: 'big' }, 'ocean');
    expect(s.biggestWin).toEqual({ amount: 50, machineId: 'ocean', tier: 'big' });

    s = recordSpin(s, { totalWin: 500, bet: 10, tier: 'jackpot' }, 'arctic');
    expect(s.biggestWin).toEqual({ amount: 500, machineId: 'arctic', tier: 'jackpot' });

    s = recordSpin(s, { totalWin: 500, bet: 10, tier: 'jackpot' }, 'desert');
    expect(s.biggestWin).toEqual({ amount: 500, machineId: 'arctic', tier: 'jackpot' });

    s = recordSpin(s, { totalWin: 0, bet: 10, tier: 'none' }, 'desert');
    expect(s.biggestWin).toEqual({ amount: 500, machineId: 'arctic', tier: 'jackpot' });
  });

  it('series is FIFO-bounded to SERIES_CAP', () => {
    // Spec's Failing Tests text pins bet: 1, but SpinRecordInput's `bet` is BetLevel (10 | 25 | 50)
    // per src/engine/balance.ts — bet: 1 fails typecheck. Using bet: 10 (the smallest valid
    // BetLevel) preserves the same FIFO/cap behavior; expected values scale by that factor
    // (documented as a build deviation).
    let s = emptyStats();
    const totalSpins = SERIES_CAP + 5;
    for (let i = 0; i < totalSpins; i++) {
      s = recordSpin(s, { totalWin: 0, bet: 10, tier: 'none' }, 'ocean');
    }
    expect(s.series.length).toBe(SERIES_CAP);
    expect(s.series[SERIES_CAP - 1]).toBe(-10 * totalSpins);
    expect(s.series[0]).toBe(-60);
  });

  it('deriveMetrics computes net and win rate, guarding spins === 0', () => {
    expect(deriveMetrics(emptyStats())).toEqual({
      spins: 0,
      winRate: 0,
      net: 0,
      biggestWin: null,
      cashIns: 0,
    });

    let s = emptyStats();
    s = recordSpin(s, { totalWin: 0, bet: 10, tier: 'none' }, 'ocean');
    s = recordSpin(s, { totalWin: 50, bet: 10, tier: 'big' }, 'ocean');
    expect(s.spins).toBe(2);
    expect(s.winningSpins).toBe(1);
    expect(s.totalWon).toBe(50);
    expect(s.totalWagered).toBe(20);

    const metrics = deriveMetrics(s);
    expect(metrics.winRate).toBe(0.5);
    expect(metrics.net).toBe(30);
  });

  it('recordCashIn increments only cashIns and is immutable', () => {
    let before = emptyStats();
    before = recordSpin(before, { totalWin: 50, bet: 10, tier: 'big' }, 'ocean');
    const snapshot = { ...before };

    const after = recordCashIn(before);

    expect(after.cashIns).toBe(before.cashIns + 1);
    expect(after.spins).toBe(before.spins);
    expect(after.totalWon).toBe(before.totalWon);
    expect(after.totalWagered).toBe(before.totalWagered);
    expect(after.biggestWin).toEqual(before.biggestWin);
    expect(after.series).toEqual(before.series);

    expect(before).toEqual(snapshot);
    expect(after).not.toBe(before);
  });
});
