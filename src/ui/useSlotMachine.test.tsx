// Hook tests for useSlotMachine (SPEC-013, extended SPEC-014, SPEC-015, SPEC-016).
// Uses renderHook + act. Outcomes are pinned via injected nextSeed (DEC-002).
// Fixtures from SPEC-011: seed 276 → big win, balance 1045, 3 line wins;
//                          seed 12345 → no win, balance 990 at bet 10;
//                                       balance 975 at bet 25.
//
// SPEC-016: spin is now timed. All tests that assert on the post-spin state
// must advance fake timers by SPIN_DURATION_MS inside act() so the reveal
// callback fires before the assertion.
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine, SPIN_DURATION_MS } from './useSlotMachine';
import { INITIAL_GRID } from './reels/symbols';
import { writeBalance, readBalance } from './storage';

describe('useSlotMachine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts idle at 1000 with default bet and the initial grid', () => {
    const { result } = renderHook(() => useSlotMachine());
    expect(result.current.balance).toBe(1000);
    expect(result.current.bet).toBe(10);
    expect(result.current.status).toBe('idle');
    expect(result.current.tier).toBe('none');
    expect(result.current.lineWins).toHaveLength(0);
    expect(result.current.canSpin).toBe(true);
    expect(result.current.grid).toEqual(INITIAL_GRID);
  });

  it('a winning spin applies the engine outcome', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 276 }),
    );
    act(() => {
      result.current.spin();
    });
    // Advance the timer so the reveal fires.
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.balance).toBe(1045);
    expect(result.current.tier).toBe('big');
    expect(result.current.lineWins).toHaveLength(3);
    expect(result.current.status).toBe('resolved');
    expect(result.current.grid).not.toEqual(INITIAL_GRID);
  });

  it('a losing spin still debits the bet', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => {
      result.current.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.balance).toBe(990);
    expect(result.current.tier).toBe('none');
  });

  it('cannot spin when the balance cannot cover the bet', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ initialBalance: 5 }),
    );
    expect(result.current.canSpin).toBe(false);
    act(() => {
      result.current.spin();
    });
    expect(result.current.balance).toBe(5);
    expect(result.current.status).toBe('idle');
  });

  // ── SPEC-014: bet stepping ──────────────────────────────────────────────────

  it('increaseBet steps up and clamps at 50', () => {
    const { result } = renderHook(() => useSlotMachine());
    // default bet = 10
    expect(result.current.bet).toBe(10);
    expect(result.current.canIncreaseBet).toBe(true);

    act(() => { result.current.increaseBet(); });
    expect(result.current.bet).toBe(25);

    act(() => { result.current.increaseBet(); });
    expect(result.current.bet).toBe(50);

    // clamped at 50 — further calls are no-ops
    act(() => { result.current.increaseBet(); });
    expect(result.current.bet).toBe(50);
    expect(result.current.canIncreaseBet).toBe(false);
  });

  it('decreaseBet steps down and clamps at 10', () => {
    const { result } = renderHook(() => useSlotMachine());
    // step up to 50 first
    act(() => { result.current.increaseBet(); }); // 25
    act(() => { result.current.increaseBet(); }); // 50

    expect(result.current.bet).toBe(50);

    act(() => { result.current.decreaseBet(); });
    expect(result.current.bet).toBe(25);

    act(() => { result.current.decreaseBet(); });
    expect(result.current.bet).toBe(10);

    // clamped at 10 — further calls are no-ops
    act(() => { result.current.decreaseBet(); });
    expect(result.current.bet).toBe(10);
    expect(result.current.canDecreaseBet).toBe(false);
  });

  it('cannot raise the bet beyond the affordable balance', () => {
    // initialBalance 20: can afford 10 but not 25
    const { result } = renderHook(() =>
      useSlotMachine({ initialBalance: 20 }),
    );
    expect(result.current.bet).toBe(10);
    expect(result.current.canIncreaseBet).toBe(false);

    // increaseBet must be a no-op
    act(() => { result.current.increaseBet(); });
    expect(result.current.bet).toBe(10);
  });

  it('spin uses the chosen bet', () => {
    // seed 12345 with bet 25 → 1000 − 25 + 0 = 975
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => { result.current.increaseBet(); }); // bet → 25
    expect(result.current.bet).toBe(25);

    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.balance).toBe(975);
  });

  // ── SPEC-015: balance persistence ──────────────────────────────────────────

  it('rehydrates the balance from localStorage', () => {
    writeBalance(777);
    const { result } = renderHook(() => useSlotMachine());
    expect(result.current.balance).toBe(777);
  });

  it('falls back to STARTING_BALANCE when storage is empty', () => {
    // localStorage already cleared by beforeEach
    const { result } = renderHook(() => useSlotMachine());
    expect(result.current.balance).toBe(1000);
  });

  it('persists the balance after a spin', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.balance).toBe(990);
    expect(readBalance()).toBe(990);
  });

  it('reset restores 1000 and persists', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => { result.current.spin(); }); // spinning
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); }); // balance → 990
    act(() => { result.current.reset(); }); // balance → 1000
    expect(result.current.balance).toBe(1000);
    expect(readBalance()).toBe(1000);
  });

  // ── SPEC-016: timed spin flow ───────────────────────────────────────────────

  it('spin enters the spinning state without revealing yet', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 276 }),
    );
    act(() => {
      result.current.spin();
    });
    // Status is 'spinning' immediately; grid and balance are unchanged.
    expect(result.current.status).toBe('spinning');
    expect(result.current.isSpinning).toBe(true);
    expect(result.current.canSpin).toBe(false);
    expect(result.current.grid).toEqual(INITIAL_GRID);
    expect(result.current.balance).toBe(1000);
  });

  it('after SPIN_DURATION_MS the outcome is revealed', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 276 }),
    );
    act(() => {
      result.current.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    expect(result.current.status).toBe('resolved');
    expect(result.current.isSpinning).toBe(false);
    expect(result.current.balance).toBe(1045);
    expect(result.current.tier).toBe('big');
    expect(result.current.grid).not.toEqual(INITIAL_GRID);
  });

  it('a second spin mid-spin is ignored', () => {
    // seed 12345 → balance 990 (one spin). If a second spin fired it would
    // apply another outcome from the same seed, landing at 980.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => {
      result.current.spin();
    });
    // Try a second spin before the timer fires — should be a no-op.
    act(() => {
      result.current.spin();
    });
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    // Exactly one spin's debit: 1000 − 10 = 990.
    expect(result.current.balance).toBe(990);
  });

  it('the resolve timer is cleaned up on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => {
      result.current.spin();
    });
    // Unmount before the timer fires — should not throw or produce an act warning.
    unmount();
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    // No error / no act warning — test passes by not throwing.
  });
});
