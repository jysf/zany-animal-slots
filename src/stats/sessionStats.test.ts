// sessionStats unit tests (SPEC-054, DEC-020, SPEC-073, DEC-024). Plain Vitest, no DOM/JSX.
import {
  STATS_VERSION,
  SERIES_CAP,
  TOP_WINS_CAP,
  emptyStats,
  recordSpin,
  recordCashIn,
  deriveMetrics,
  trophyRank,
  insertTopWin,
} from './sessionStats';
import type { TopWin } from './sessionStats';
import type { Grid, LineWin } from '../engine';

// A minimal, valid-shaped 5x3 grid + line win, used only as opaque payload data for the
// trophy tests below (SPEC-073 does not care about paytable correctness, only pass-through).
const G: Grid = [
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
];
const LW: LineWin[] = [{ line: 'L1', symbol: 'DEER', count: 5, multiplier: 10, amount: 50 }];

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
      topWins: [],
    });
  });

  it('emptyStats seeds topWins to an empty array', () => {
    expect(emptyStats().topWins).toEqual([]);
  });

  it('recordSpin accumulates counters and appends the cumulative-net series point', () => {
    const s1 = recordSpin(emptyStats(), { totalWin: 0, bet: 10, tier: 'none', grid: G, lineWins: [] }, 'ocean');
    expect(s1.spins).toBe(1);
    expect(s1.winningSpins).toBe(0);
    expect(s1.totalWagered).toBe(10);
    expect(s1.totalWon).toBe(0);
    expect(s1.series).toEqual([-10]);

    const s2 = recordSpin(s1, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
    expect(s2.spins).toBe(2);
    expect(s2.winningSpins).toBe(1);
    expect(s2.totalWagered).toBe(20);
    expect(s2.totalWon).toBe(50);
    expect(s2.series).toEqual([-10, 30]);
  });

  it('recordSpin is immutable (does not mutate its input)', () => {
    const before = emptyStats();
    const after = recordSpin(before, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
    expect(before).toEqual(emptyStats());
    expect(after).not.toBe(before);
  });

  it('recordSpin updates biggestWin only on a strictly larger win, with machineId + tier', () => {
    let s = emptyStats();
    s = recordSpin(s, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
    expect(s.biggestWin).toEqual({ amount: 50, machineId: 'ocean', tier: 'big' });

    s = recordSpin(s, { totalWin: 500, bet: 10, tier: 'jackpot', grid: G, lineWins: LW }, 'arctic');
    expect(s.biggestWin).toEqual({ amount: 500, machineId: 'arctic', tier: 'jackpot' });

    s = recordSpin(s, { totalWin: 500, bet: 10, tier: 'jackpot', grid: G, lineWins: LW }, 'desert');
    expect(s.biggestWin).toEqual({ amount: 500, machineId: 'arctic', tier: 'jackpot' });

    s = recordSpin(s, { totalWin: 0, bet: 10, tier: 'none', grid: G, lineWins: [] }, 'desert');
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
      s = recordSpin(s, { totalWin: 0, bet: 10, tier: 'none', grid: G, lineWins: [] }, 'ocean');
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
    s = recordSpin(s, { totalWin: 0, bet: 10, tier: 'none', grid: G, lineWins: [] }, 'ocean');
    s = recordSpin(s, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
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
    before = recordSpin(before, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
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

  it('recordSpin records a TopWin for a winning spin with the full grid, lineWins, and 1-based spinIndex', () => {
    const s = recordSpin(
      emptyStats(),
      { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW },
      'ocean',
    );
    expect(s.topWins.length).toBe(1);
    expect(s.topWins[0]).toEqual({
      amount: 50,
      machineId: 'ocean',
      tier: 'big',
      bet: 10,
      grid: G,
      lineWins: LW,
      spinIndex: 1,
    });
  });

  it('recordSpin records no TopWin for a losing spin', () => {
    let s = recordSpin(emptyStats(), { totalWin: 0, bet: 10, tier: 'none', grid: G, lineWins: [] }, 'ocean');
    expect(s.topWins).toEqual([]);
    expect(s.spins).toBe(1);

    s = recordSpin(s, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
    expect(s.topWins[0].spinIndex).toBe(2);
  });

  it('topWins is sorted by amount descending', () => {
    let s = emptyStats();
    s = recordSpin(s, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
    s = recordSpin(s, { totalWin: 500, bet: 10, tier: 'jackpot', grid: G, lineWins: LW }, 'ocean');
    s = recordSpin(s, { totalWin: 200, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'ocean');
    expect(s.topWins.map((w) => w.amount)).toEqual([500, 200, 50]);
  });

  it('topWins is capped at TOP_WINS_CAP, keeping the largest', () => {
    let s = emptyStats();
    for (let i = 1; i <= 12; i++) {
      s = recordSpin(s, { totalWin: i * 10, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
    }
    expect(s.topWins.length).toBe(TOP_WINS_CAP);
    expect(s.topWins[s.topWins.length - 1].amount).toBe(30);
  });

  it('a tie does not displace an existing entry once full', () => {
    let s = emptyStats();
    // Fill with 10 distinct wins: 10, 20, ..., 100 (smallest kept is 10, at spinIndex 1).
    for (let i = 1; i <= 10; i++) {
      s = recordSpin(s, { totalWin: i * 10, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
    }
    expect(s.topWins.length).toBe(10);
    const originalSmallest = s.topWins.find((w) => w.amount === 10)!;
    expect(originalSmallest.spinIndex).toBe(1);

    // A newcomer tying the smallest (10) must not displace it.
    s = recordSpin(s, { totalWin: 10, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'arctic');
    expect(s.topWins.length).toBe(10);
    const smallestAfter = s.topWins.find((w) => w.amount === 10)!;
    expect(smallestAfter.spinIndex).toBe(originalSmallest.spinIndex);
    expect(smallestAfter.machineId).toBe('ocean');
  });

  it('topWins[0] agrees with biggestWin', () => {
    let s = emptyStats();
    s = recordSpin(s, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');
    s = recordSpin(s, { totalWin: 500, bet: 10, tier: 'jackpot', grid: G, lineWins: LW }, 'arctic');
    s = recordSpin(s, { totalWin: 200, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'desert');
    expect(s.topWins[0].amount).toBe(s.biggestWin!.amount);
    expect(s.topWins[0].machineId).toBe(s.biggestWin!.machineId);
    expect(s.topWins[0].tier).toBe(s.biggestWin!.tier);
  });

  it('recordSpin does not mutate the input\'s topWins array', () => {
    const before = emptyStats();
    const beforeTopWinsLength = before.topWins.length;
    const beforeTopWinsRef = before.topWins;

    const after = recordSpin(before, { totalWin: 50, bet: 10, tier: 'big', grid: G, lineWins: LW }, 'ocean');

    expect(before.topWins.length).toBe(beforeTopWinsLength);
    expect(before.topWins).toBe(beforeTopWinsRef);
    expect(after.topWins).not.toBe(before.topWins);
  });

  // ─── trophyRank (SPEC-077, DEC-024) ────────────────────────────────────────────
  // trophyRank must never disagree with what insertTopWin actually stores — see
  // Notes for the Implementer in SPEC-077 for why it is built on the real reducer
  // (an identity-tracked probe) rather than a second copy of the comparison rules.

  describe('trophyRank', () => {
    it('returns null for a losing spin', () => {
      expect(trophyRank([], 0)).toBeNull();
    });

    it('returns a rank while the case is not full', () => {
      let s = emptyStats();
      s = recordSpin(s, { totalWin: 10, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'ocean');
      s = recordSpin(s, { totalWin: 20, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'ocean');
      s = recordSpin(s, { totalWin: 30, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'ocean');
      expect(s.topWins.length).toBe(3);
      expect(trophyRank(s.topWins, 5)).not.toBeNull();
    });

    it('returns 1 for a new best', () => {
      let s = emptyStats();
      for (let i = 1; i <= 5; i++) {
        s = recordSpin(s, { totalWin: i * 10, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'ocean');
      }
      expect(trophyRank(s.topWins, 1000)).toBe(1);
    });

    it('returns null for a tie once the case is full', () => {
      let s = emptyStats();
      for (let i = 1; i <= TOP_WINS_CAP; i++) {
        s = recordSpin(s, { totalWin: i * 10, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'ocean');
      }
      expect(s.topWins.length).toBe(TOP_WINS_CAP);
      const smallest = Math.min(...s.topWins.map((w) => w.amount));
      expect(trophyRank(s.topWins, smallest)).toBeNull();
    });

    it('trophyRank AGREES with insertTopWin across a sequence', () => {
      // Fixed literal amounts (no RNG) — deliberately includes exact ties with entries
      // already in the case (e.g. repeated 10s/90s) and values that fall just below
      // the cut once the case is full (e.g. 5, 1), alongside new-best values (200, 300).
      const amounts = [
        50, 30, 80, 10, 60, 20, 90, 40, 70, 25, 100, 15, 65, 10, 5, 35, 95, 45, 10, 85, 55, 10,
        200, 5, 90, 10, 60, 1, 300, 90,
      ];

      let before: TopWin[] = [];
      amounts.forEach((amount, i) => {
        const win: TopWin = {
          amount,
          machineId: 'ocean',
          tier: 'small',
          bet: 10,
          grid: G,
          lineWins: LW,
          spinIndex: i + 1,
        };

        const rank = trophyRank(before, amount);
        const after = insertTopWin(before, win);
        // Object-identity check: did THIS win actually survive into the stored array?
        // (Content-equal ties are indistinguishable by value, but identity pins down
        // exactly the question trophyRank answers — the same trick trophyRank itself
        // uses internally.)
        const changed = after.includes(win);

        expect(rank !== null).toBe(changed);
        if (rank !== null) {
          expect(after[rank - 1]).toBe(win);
        }

        before = after;
      });
    });
  });
});
