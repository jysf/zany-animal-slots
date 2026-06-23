// Hook tests for useSlotMachine (SPEC-013).
// Uses renderHook + act. Outcomes are pinned via injected nextSeed (DEC-002).
// Fixtures from SPEC-011: seed 276 → big win, balance 1045, 3 line wins;
//                          seed 12345 → no win, balance 990.
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine } from './useSlotMachine';
import { INITIAL_GRID } from './reels/symbols';

describe('useSlotMachine', () => {
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
});
