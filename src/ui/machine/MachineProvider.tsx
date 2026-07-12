// MachineProvider — reactive, persisted active-machine context (SPEC-049).
// Lifts getActiveMachine() from a module const into a React Context backed by
// localStorage (activeMachineStorage.ts) so a machine switch re-renders every
// subscriber (useSlotMachine, PaytableSheet, Game). The default context value
// IS the default machine, so consumers rendered without a provider (every
// existing test) keep working unchanged — a provable no-op today since only
// one machine is registered (DEC-015). The engine never sees this seam
// (DEC-001); persistence is localStorage only, guarded, never throws (DEC-005).
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Machine } from '../../machines/types';
import { getMachine, MACHINES, DEFAULT_MACHINE_ID } from '../../machines/registry';
import { readActiveMachineId, writeActiveMachineId } from '../../machines/activeMachineStorage';
import { track } from '../../analytics';

export interface ActiveMachineContextValue {
  machine: Machine;
  activeMachineId: string;
  setActiveMachineId: (id: string) => void;
}

/** Normalize a candidate id to a KNOWN machine id (unknown/absent → default). */
function normalizeId(id: string | null): string {
  return id && MACHINES[id] ? id : DEFAULT_MACHINE_ID;
}

const ActiveMachineContext = createContext<ActiveMachineContextValue>({
  machine: getMachine(DEFAULT_MACHINE_ID),
  activeMachineId: DEFAULT_MACHINE_ID,
  setActiveMachineId: () => {}, // no-op default — real behavior comes from the provider
});

export function MachineProvider({ children }: { children: ReactNode }) {
  const [activeMachineId, setId] = useState<string>(() => normalizeId(readActiveMachineId()));
  const idRef = useRef(activeMachineId);
  idRef.current = activeMachineId;

  const setActiveMachineId = useCallback((id: string) => {
    const next = normalizeId(id);
    if (next !== idRef.current) {
      track({ type: 'machine_switch', from: idRef.current, to: next }); // SPEC-062 (default off)
    }
    setId(next);
    writeActiveMachineId(next);
  }, []);

  const machine = getMachine(activeMachineId);
  const value = useMemo<ActiveMachineContextValue>(
    () => ({ machine, activeMachineId, setActiveMachineId }),
    [machine, activeMachineId, setActiveMachineId],
  );

  return <ActiveMachineContext.Provider value={value}>{children}</ActiveMachineContext.Provider>;
}

/** Subscribe to the active machine. Returns the default (no-op setter) when used without a provider. */
export function useActiveMachine(): ActiveMachineContextValue {
  return useContext(ActiveMachineContext);
}
