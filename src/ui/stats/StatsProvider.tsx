// StatsProvider — reactive, persisted session-stats context (SPEC-055).
// Lifts SPEC-054's pure sessionStats reducers into a React Context backed by
// localStorage (statsStorage.ts), mirroring SPEC-049's MachineProvider exactly:
// a no-op default so provider-less consumers (every existing useSlotMachine/App
// test) keep working, useState(() => readStats()) hydration, and persist-on-change.
// The engine never sees this seam (DEC-001); persistence is localStorage only,
// guarded, never throws (DEC-005). No display surface — that is SPEC-056/057.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  emptyStats,
  recordSpin as recordSpinReducer,
  recordCashIn as recordCashInReducer,
  type SessionStats,
  type SpinRecordInput,
} from '../../stats/sessionStats';
import { readStats, writeStats } from '../../stats/statsStorage';

export interface StatsContextValue {
  stats: SessionStats;
  recordSpin: (input: SpinRecordInput, machineId: string) => void;
  recordCashIn: () => void;
  resetStats: () => void;
}

const StatsContext = createContext<StatsContextValue>({
  stats: emptyStats(),
  recordSpin: () => {}, // no-op default — real behavior comes from the provider
  recordCashIn: () => {},
  resetStats: () => {},
});

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<SessionStats>(() => readStats());

  // Persist on every change (guarded, never throws — DEC-005). Mirrors the
  // writeBalance-on-change effect in useSlotMachine; the mount write is a
  // harmless round-trip of the just-read value.
  useEffect(() => {
    writeStats(stats);
  }, [stats]);

  const recordSpin = useCallback((input: SpinRecordInput, machineId: string) => {
    setStats((prev) => recordSpinReducer(prev, input, machineId));
  }, []);

  const recordCashIn = useCallback(() => {
    setStats((prev) => recordCashInReducer(prev));
  }, []);

  const resetStats = useCallback(() => {
    setStats(emptyStats());
  }, []);

  const value = useMemo<StatsContextValue>(
    () => ({ stats, recordSpin, recordCashIn, resetStats }),
    [stats, recordSpin, recordCashIn, resetStats],
  );

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

/** Subscribe to session stats. Returns empty stats + no-op recorders when used without a provider. */
export function useStats(): StatsContextValue {
  return useContext(StatsContext);
}
