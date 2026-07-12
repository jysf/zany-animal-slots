import { renderHook, act } from '@testing-library/react';
import { MachineProvider, useActiveMachine } from './MachineProvider';
import { setSink, resetSink } from '../../analytics';
import type { TrackedEvent } from '../../analytics';

describe('MachineProvider analytics tap', () => {
  let events: TrackedEvent[];
  beforeEach(() => {
    localStorage.clear();
    events = [];
    setSink({ track: (t) => events.push(t), flush: () => {} });
  });
  afterEach(() => resetSink());

  it('switching to a different machine emits machine_switch from→to', () => {
    const { result } = renderHook(() => useActiveMachine(), { wrapper: MachineProvider });
    act(() => result.current.setActiveMachineId('arctic'));
    const sw = events.find((e) => e.event.type === 'machine_switch');
    expect(sw?.event).toEqual({ type: 'machine_switch', from: 'wild-and-whimsical', to: 'arctic' });
  });

  it('re-selecting the current machine emits nothing', () => {
    const { result } = renderHook(() => useActiveMachine(), { wrapper: MachineProvider });
    act(() => result.current.setActiveMachineId('wild-and-whimsical'));
    expect(events.some((e) => e.event.type === 'machine_switch')).toBe(false);
  });
});
