// MachineProvider / useActiveMachine tests (SPEC-049). renderHook + act, no
// @testing-library/user-event in this repo's toolchain — a `wrapper` supplies
// the provider where needed.
import { renderHook, act } from '@testing-library/react';
import { MachineProvider, useActiveMachine } from './MachineProvider';
import { readActiveMachineId, writeActiveMachineId } from '../../machines/activeMachineStorage';
import { DEFAULT_MACHINE_ID } from '../../machines/registry';
import { WILD_AND_WHIMSICAL } from '../../machines/wildAndWhimsical';

describe('MachineProvider / useActiveMachine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('useActiveMachine without a provider returns the default machine', () => {
    const { result } = renderHook(() => useActiveMachine());
    expect(result.current.machine).toBe(WILD_AND_WHIMSICAL);
    expect(result.current.activeMachineId).toBe(DEFAULT_MACHINE_ID);
  });

  it('provider initializes activeMachineId from localStorage', () => {
    writeActiveMachineId('wild-and-whimsical');
    const { result } = renderHook(() => useActiveMachine(), { wrapper: MachineProvider });
    expect(result.current.activeMachineId).toBe('wild-and-whimsical');
  });

  it('provider normalizes an unknown persisted id to the default', () => {
    writeActiveMachineId('nope');
    const { result } = renderHook(() => useActiveMachine(), { wrapper: MachineProvider });
    expect(result.current.activeMachineId).toBe(DEFAULT_MACHINE_ID);
    expect(result.current.machine).toBe(WILD_AND_WHIMSICAL);
  });

  it('setActiveMachineId persists and updates the context', () => {
    const { result } = renderHook(() => useActiveMachine(), { wrapper: MachineProvider });

    act(() => {
      result.current.setActiveMachineId('wild-and-whimsical');
    });

    expect(readActiveMachineId()).toBe('wild-and-whimsical');
    expect(result.current.activeMachineId).toBe('wild-and-whimsical');
  });
});
