// StatsProvider / useStats tests (SPEC-055). renderHook + act, no
// @testing-library/user-event in this repo's toolchain — a `wrapper` supplies
// the provider where needed. Mirrors MachineProvider.test.tsx.
import { renderHook, act } from '@testing-library/react';
import { StatsProvider, useStats } from './StatsProvider';
import { emptyStats, recordSpin } from '../../stats/sessionStats';
import { readStats, writeStats } from '../../stats/statsStorage';
import type { Grid, LineWin } from '../../engine';

// A minimal, valid-shaped 5x3 grid + line win, used only as opaque payload data for
// recordSpin calls in this file (SPEC-074: grid/lineWins are now required).
const G: Grid = [
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
  ['DEER', 'FOX', 'SQUIRREL'],
];
const LW: LineWin[] = [{ line: 'L1', symbol: 'DEER', count: 5, multiplier: 10, amount: 50 }];

describe('StatsProvider / useStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('useStats without a provider returns emptyStats and no-op recorders', () => {
    const { result } = renderHook(() => useStats());
    expect(result.current.stats).toEqual(emptyStats());
    act(() => {
      result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'wild-and-whimsical');
      result.current.recordCashIn();
      result.current.resetStats();
    });
    // No provider => no state to change; the calls are safe no-ops.
    expect(result.current.stats).toEqual(emptyStats());
  });

  it('provider hydrates stats from localStorage', () => {
    const seeded = recordSpin(emptyStats(), { totalWin: 40, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'wild-and-whimsical');
    writeStats(seeded);
    const { result } = renderHook(() => useStats(), { wrapper: StatsProvider });
    expect(result.current.stats).toEqual(seeded);
  });

  it('recordSpin updates the reactive stats and persists', () => {
    const { result } = renderHook(() => useStats(), { wrapper: StatsProvider });
    act(() => {
      result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'wild-and-whimsical');
    });
    expect(result.current.stats).toMatchObject({
      spins: 1,
      winningSpins: 1,
      totalWagered: 10,
      totalWon: 40,
      biggestWin: { amount: 40, machineId: 'wild-and-whimsical', tier: 'small' },
      series: [30],
    });
    expect(readStats()).toEqual(result.current.stats);
  });

  it('recordCashIn increments only cashIns and persists', () => {
    const { result } = renderHook(() => useStats(), { wrapper: StatsProvider });
    act(() => {
      result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'wild-and-whimsical');
    });
    act(() => {
      result.current.recordCashIn();
    });
    expect(result.current.stats.cashIns).toBe(1);
    expect(result.current.stats.spins).toBe(1);
    expect(result.current.stats.series).toEqual([30]);
    expect(readStats().cashIns).toBe(1);
  });

  it('resetStats zeroes the record and persists emptyStats', () => {
    const { result } = renderHook(() => useStats(), { wrapper: StatsProvider });
    act(() => {
      result.current.recordSpin({ totalWin: 40, bet: 10, tier: 'small', grid: G, lineWins: LW }, 'wild-and-whimsical');
    });
    act(() => {
      result.current.resetStats();
    });
    expect(result.current.stats).toEqual(emptyStats());
    expect(readStats()).toEqual(emptyStats());
  });
});
