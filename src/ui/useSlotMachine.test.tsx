// Hook tests for useSlotMachine (SPEC-013, extended SPEC-014, SPEC-015).
// Uses renderHook + act. Outcomes are pinned via injected nextSeed (DEC-002).
// Fixtures from SPEC-011: seed 276 → big win, balance 1045, 3 line wins;
//                          seed 12345 → no win, balance 990 at bet 10;
//                                       balance 975 at bet 25.
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine } from './useSlotMachine';
import { INITIAL_GRID } from './reels/symbols';
import { writeBalance, readBalance } from './storage';

describe('useSlotMachine', () => {
  beforeEach(() => {
    localStorage.clear();
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
    expect(result.current.balance).toBe(990);
    expect(readBalance()).toBe(990);
  });

  it('reset restores 1000 and persists', () => {
    const { result } = renderHook(() =>
      useSlotMachine({ nextSeed: () => 12345 }),
    );
    act(() => { result.current.spin(); }); // balance → 990
    act(() => { result.current.reset(); }); // balance → 1000
    expect(result.current.balance).toBe(1000);
    expect(readBalance()).toBe(1000);
  });
});
