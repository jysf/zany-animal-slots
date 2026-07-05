// Hook tests for useSlotMachine (SPEC-013, extended SPEC-014, SPEC-015, SPEC-016, SPEC-017, SPEC-021).
// Uses renderHook + act. Outcomes are pinned via injected nextSeed (DEC-002).
// Fixtures from SPEC-011: seed 276 → big win, balance 1045, 3 line wins;
//                          seed 12345 → no win, balance 990 at bet 10;
//                                       balance 975 at bet 25.
//
// SPEC-016: spin is now timed. All tests that assert on the post-spin state
// must advance fake timers by SPIN_DURATION_MS inside act() so the reveal
// callback fires before the assertion.
//
// SPEC-017: auto-spin. Seeds: 12345 → losing (−bet each spin);
//           407947 → jackpot (five Wolves on L5; at bet 10: totalWin 2000,
//           balance 2990, tier 'jackpot').
//           One auto iteration = SPIN_DURATION_MS + AUTO_SPIN_DELAY_MS.
//
// SPEC-021: celebration tests. celebration starts null; set on a win; null after a loss;
//           jackpot seed 407947 → tier 'jackpot'; id strictly increases across wins;
//           reset() clears it.
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine, SPIN_DURATION_MS, AUTO_SPIN_COUNT, AUTO_SPIN_DELAY_MS } from './useSlotMachine';
import { INITIAL_GRID } from './reels/symbols';
import { writeBalance, readBalance } from './storage';
import { WILD_AND_WHIMSICAL } from '../machines/wildAndWhimsical';

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

  // ── SPEC-042: machine registry threading ────────────────────────────────────

  it('is machine-driven: a supplied machine sets the starting balance', () => {
    localStorage.clear();
    const variant = {
      ...WILD_AND_WHIMSICAL,
      math: { ...WILD_AND_WHIMSICAL.math, startingBalance: 5000 },
    };
    const { result } = renderHook(() => useSlotMachine({ machine: variant }));
    expect(result.current.balance).toBe(5000);
    expect(result.current.machine).toBe(variant);
  });

  it('defaults to the active machine and preserves the frozen seeds', () => {
    // No `machine` opt — the hook falls back to getActiveMachine(). Re-confirms the
    // 407947 jackpot seed still resolves through the default machine (SPEC-042 parity).
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 407947 }),
    );
    expect(result.current.machine).toBe(WILD_AND_WHIMSICAL);
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.lastWin).toBe(2000);
    expect(result.current.tier).toBe('jackpot');
    expect(result.current.balance).toBe(2990);
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

  // ── SPEC-017: auto-spin ─────────────────────────────────────────────────────

  it('toggleAutoSpin starts and reports remaining', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => {
      result.current.toggleAutoSpin();
    });
    expect(result.current.autoSpinning).toBe(true);
    expect(result.current.autoRemaining).toBe(AUTO_SPIN_COUNT);
    // The first spin should already be underway.
    expect(result.current.isSpinning).toBe(true);
  });

  it('auto-spin stops after AUTO_SPIN_COUNT spins', () => {
    // seed 12345 → losing every spin (−10 each). Starting balance 1000.
    // After 10 spins: balance = 1000 − (10 × 10) = 900.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => {
      result.current.toggleAutoSpin();
    });

    // Drive each spin cycle in two separate acts so React re-renders between
    // the reveal timer and the inter-spin delay timer, preventing stale-status
    // from triggering the re-entrant guard in spin().
    for (let i = 0; i < AUTO_SPIN_COUNT; i++) {
      // 1) Fire the reveal (SPIN_DURATION_MS).
      act(() => {
        vi.advanceTimersByTime(SPIN_DURATION_MS);
      });
      // 2) Fire the inter-spin delay (AUTO_SPIN_DELAY_MS) — starts the next spin.
      act(() => {
        vi.advanceTimersByTime(AUTO_SPIN_DELAY_MS);
      });
    }

    expect(result.current.autoSpinning).toBe(false);
    expect(result.current.autoRemaining).toBe(0);
    expect(result.current.balance).toBe(900);
  });

  it('auto-spin stops immediately on a jackpot', () => {
    // seed 407947 → jackpot (five Wolves on L5; at bet 10: totalWin 2000, balance 2990).
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 407947 }),
    );
    act(() => {
      result.current.toggleAutoSpin();
    });

    // Advance through the reveal only — the jackpot stop prevents any inter-spin delay.
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });

    expect(result.current.autoSpinning).toBe(false);
    expect(result.current.tier).toBe('jackpot');
    expect(result.current.balance).toBe(2990);

    // Capture balance after the jackpot stop; further timer advances must not
    // trigger more spins.
    const balanceAfterStop = result.current.balance;
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS + AUTO_SPIN_DELAY_MS);
    });
    expect(result.current.balance).toBe(balanceAfterStop);
  });

  it('auto-spin stops when the balance cannot cover the bet', () => {
    // seed 12345 → losing. initialBalance 25, bet 10.
    // Spin 1: 25 − 10 = 15. Spin 2: 15 − 10 = 5. 5 < 10 → stop.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345, initialBalance: 25 }),
    );
    act(() => {
      result.current.toggleAutoSpin();
    });

    // Spin 1: reveal, then delay → starts spin 2.
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    act(() => { vi.advanceTimersByTime(AUTO_SPIN_DELAY_MS); });
    // Spin 2: reveal → balance is 5, which is < 10 → stop (no inter-spin delay scheduled).
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });

    expect(result.current.autoSpinning).toBe(false);
    expect(result.current.balance).toBe(5);
  });

  it('toggling auto off stops further spins', () => {
    // Start auto, let one spin complete, then toggle off.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => {
      result.current.toggleAutoSpin();
    });

    // Let one spin complete (reveal fires) but don't advance through the delay yet.
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS);
    });
    // At this point autoSpinning is still true (delay timer is running).
    // Now toggle off.
    act(() => {
      result.current.toggleAutoSpin();
    });
    expect(result.current.autoSpinning).toBe(false);

    const balanceAfterStop = result.current.balance;

    // Advancing more timers must not change the balance further.
    act(() => {
      vi.advanceTimersByTime(AUTO_SPIN_DELAY_MS + SPIN_DURATION_MS + AUTO_SPIN_DELAY_MS);
    });
    expect(result.current.balance).toBe(balanceAfterStop);
  });

  it('clears timers on unmount during auto-spin', () => {
    // Start auto-spin then unmount before any timer fires.
    const { result, unmount } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => {
      result.current.toggleAutoSpin();
    });
    // Unmount while the first spin is in progress.
    unmount();
    // Advancing timers must not throw or produce act warnings.
    act(() => {
      vi.advanceTimersByTime(SPIN_DURATION_MS + AUTO_SPIN_DELAY_MS);
    });
    // No error — test passes by not throwing.
  });

  // ── SPEC-019: lastWin ───────────────────────────────────────────────────────

  it('lastWin starts at 0', () => {
    const { result } = renderHook(() => useSlotMachine());
    expect(result.current.lastWin).toBe(0);
  });

  it('lastWin reflects a winning spin', () => {
    // seed 276 → big win, totalWin 55 (balance 1000 − 10 + 55 = 1045).
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 276 }),
    );
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.lastWin).toBe(55);
  });

  it('lastWin is 0 after a losing spin', () => {
    // seed 12345 → no win.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.lastWin).toBe(0);
  });

  it('reset clears lastWin', () => {
    // Win first, then reset.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 276 }),
    );
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.lastWin).toBe(55);

    act(() => { result.current.reset(); });
    expect(result.current.lastWin).toBe(0);
  });

  // ── SPEC-021: celebration ───────────────────────────────────────────────────

  it('celebration starts null', () => {
    const { result } = renderHook(() => useSlotMachine());
    expect(result.current.celebration).toBeNull();
  });

  it('celebration is set on a winning spin', () => {
    // seed 276 → big win, totalWin 55, 3 line wins.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 276 }),
    );
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.celebration).not.toBeNull();
    expect(result.current.celebration?.tier).toBe('big');
    expect(result.current.celebration?.totalWin).toBe(55);
    expect(result.current.celebration?.lineWins).toHaveLength(3);
  });

  it('celebration is null after a losing spin', () => {
    // seed 12345 → no win.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.celebration).toBeNull();
  });

  it('celebration carries the jackpot tier', () => {
    // seed 407947 → jackpot; at bet 10: totalWin 2000.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 407947 }),
    );
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.celebration?.tier).toBe('jackpot');
    expect(result.current.celebration?.totalWin).toBe(2000);
  });

  it('celebration id strictly increases across wins', () => {
    // Two seed-276 wins; second id must be greater than first.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 276 }),
    );
    // First win.
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    const id1 = result.current.celebration?.id;
    expect(id1).toBeDefined();

    // Second win (status is 'resolved' so we need to advance to allow next spin).
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    const id2 = result.current.celebration?.id;
    expect(id2).toBeDefined();
    expect(id2!).toBeGreaterThan(id1!);
  });

  it('reset clears celebration', () => {
    // Win first, then reset.
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 276 }),
    );
    act(() => { result.current.spin(); });
    act(() => { vi.advanceTimersByTime(SPIN_DURATION_MS); });
    expect(result.current.celebration).not.toBeNull();

    act(() => { result.current.reset(); });
    expect(result.current.celebration).toBeNull();
  });
});
