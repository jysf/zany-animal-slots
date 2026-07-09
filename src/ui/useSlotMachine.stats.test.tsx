// Integration: driving useSlotMachine inside a StatsProvider records spins +
// cash-ins with the engine's REAL outcomes (SPEC-055). Seeds measured against
// the engine: 276 => win 40 / small; 12345 => loss. Fake timers advance the
// spin-resolve reveal (SPEC-016 pattern).
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine, SPIN_DURATION_MS } from './useSlotMachine';
import { StatsProvider, useStats } from './stats/StatsProvider';
import type { UseSlotMachineOpts } from './useSlotMachine';

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
