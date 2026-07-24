// Integration: driving useSlotMachine inside a StatsProvider records spins +
// cash-ins with the engine's REAL outcomes (SPEC-055). Seeds measured against
// the engine: 276 => win 40 / small; 12345 => loss. Fake timers advance the
// spin-resolve reveal (SPEC-016 pattern).
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine, SPIN_DURATION_MS } from './useSlotMachine';
import { StatsProvider, useStats } from './stats/StatsProvider';
import type { UseSlotMachineOpts } from './useSlotMachine';
import { emptyStats, TOP_WINS_CAP } from '../stats/sessionStats';
import type { TopWin } from '../stats/sessionStats';
import { writeStats } from '../stats/statsStorage';
import type { Grid, LineWin } from '../engine';

const render = (opts?: UseSlotMachineOpts) =>
  renderHook(() => ({ slot: useSlotMachine(opts), stats: useStats() }), { wrapper: StatsProvider });

describe('useSlotMachine × StatsProvider recording seam', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a resolved winning spin is recorded with the engine real outcome', () => {
    const { result } = render({ nextSeed: () => 276 });
    act(() => {
      result.current.slot.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.stats.stats).toMatchObject({
      spins: 1,
      totalWagered: 10,
      totalWon: 40,
      winningSpins: 1,
      biggestWin: { amount: 40, machineId: 'wild-and-whimsical', tier: 'small' },
      series: [30],
    });
  });

  it('a losing spin is still recorded (counted, no win)', () => {
    const { result } = render({ nextSeed: () => 12345 });
    act(() => {
      result.current.slot.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.stats.stats).toMatchObject({
      spins: 1,
      totalWagered: 10,
      totalWon: 0,
      winningSpins: 0,
      biggestWin: null,
      series: [-10],
    });
  });

  it('reset() records a cash-in and does NOT clear recorded spins', () => {
    const { result } = render({ nextSeed: () => 276 });
    act(() => {
      result.current.slot.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.stats.stats.spins).toBe(1);

    act(() => {
      result.current.slot.reset();
    });
    expect(result.current.stats.stats.cashIns).toBe(1);
    expect(result.current.stats.stats.spins).toBe(1); // NOT cleared — wallet Reset ≠ Clear stats
    expect(result.current.stats.stats.biggestWin).toMatchObject({ amount: 40 });
    expect(result.current.slot.balance).toBe(1000); // wallet still restored
  });
});

// ─── SPEC-077: celebration.trophyRank, computed from the PRE-spin case ──────────

const G: Grid = [
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
];
const LW: LineWin[] = [{ line: 'L1', symbol: 'DEER', count: 5, multiplier: 10, amount: 50 }];

const mkTopWin = (amount: number, spinIndex: number): TopWin => ({
  amount,
  machineId: 'ocean',
  tier: 'small',
  bet: 10,
  grid: G,
  lineWins: LW,
  spinIndex,
});

describe('useSlotMachine × trophyRank seam (SPEC-077)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('a winning spin that enters the case sets celebration.trophyRank', () => {
    // Empty case: any win takes rank 1 (it's the only, and therefore best, entry).
    const { result } = render({ nextSeed: () => 276 }); // real engine outcome: win 40 / small
    act(() => {
      result.current.slot.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.slot.celebration?.trophyRank).toBe(1);
  });

  it('rank is computed against the PRE-spin case', () => {
    // Seed a full (10-entry) trophy case whose smallest is exactly 40 — the amount
    // seed 276's real engine outcome produces (win 40 / small, bet 10). A tying win
    // must not earn a trophy (strictly-greater semantics), and — the off-by-one this
    // test guards — that must hold whether rank is read before or after recordSpin,
    // so a wrong (post-record) implementation is caught by celebration.trophyRank too.
    const topWins: TopWin[] = [
      mkTopWin(150, 1),
      mkTopWin(140, 2),
      mkTopWin(130, 3),
      mkTopWin(120, 4),
      mkTopWin(110, 5),
      mkTopWin(100, 6),
      mkTopWin(90, 7),
      mkTopWin(80, 8),
      mkTopWin(70, 9),
      mkTopWin(40, 10), // the smallest kept entry
    ];
    writeStats({ ...emptyStats(), spins: 10, topWins });

    const { result } = render({ nextSeed: () => 276 }); // win 40 / small — ties the smallest
    act(() => {
      result.current.slot.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });

    expect(result.current.slot.celebration?.trophyRank).toBeNull();
    // The case's content did not change — the tie did not displace the original entry.
    expect(result.current.stats.stats.topWins.length).toBe(TOP_WINS_CAP);
    expect(result.current.stats.stats.topWins.map((w) => w.amount)).toEqual(
      topWins.map((w) => w.amount),
    );
    expect(result.current.stats.stats.topWins[TOP_WINS_CAP - 1].spinIndex).toBe(10);
  });
});
