import { renderHook, act } from '@testing-library/react';
import { useSlotMachine, SPIN_DURATION_MS } from './useSlotMachine';
import { setSink, resetSink } from '../analytics';
import type { TrackedEvent } from '../analytics';
import type { UseSlotMachineOpts } from './useSlotMachine';

describe('useSlotMachine analytics taps', () => {
  let events: TrackedEvent[];
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    events = [];
    setSink({ track: (t) => events.push(t), flush: () => {} });
  });
  afterEach(() => {
    resetSink();
    vi.useRealTimers();
  });

  const render = (opts?: UseSlotMachineOpts) => renderHook(() => useSlotMachine(opts));

  it('a resolved spin emits a spin event with the engine outcome', () => {
    const { result } = render({ nextSeed: () => 276 });
    act(() => result.current.spin());
    act(() => vi.advanceTimersByTime(SPIN_DURATION_MS));
    const spin = events.find((e) => e.event.type === 'spin');
    expect(spin?.event).toEqual({
      type: 'spin',
      machineId: 'wild-and-whimsical',
      bet: 10,
      totalWin: 40,
      tier: 'small',
    });
  });

  it('reset emits a cash_in event', () => {
    const { result } = render({ nextSeed: () => 276 });
    act(() => result.current.reset());
    const cash = events.find((e) => e.event.type === 'cash_in');
    expect(cash?.event).toEqual({ type: 'cash_in', machineId: 'wild-and-whimsical' });
  });
});
