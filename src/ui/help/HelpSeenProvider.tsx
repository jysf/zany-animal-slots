// HelpSeenProvider — reactive, persisted "help seen" first-run context (SPEC-059, DEC-022).
// Lifts the helpSeenStorage flag into a React Context backed by localStorage, mirroring SPEC-055's
// StatsProvider: a no-op default (seen: true) so provider-less consumers (App.test) never auto-open,
// useState(() => readHelpSeen()) hydration, and persist-on-change. Client-only; never throws (DEC-005).
// No display surface — the HelpSheet that consumes this seam is SPEC-060.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readHelpSeen, writeHelpSeen } from './helpSeenStorage';

export interface HelpSeenContextValue {
  seen: boolean;
  markSeen: () => void;
}

// No-op default: provider-less consumers behave as "already seen" so nothing auto-opens
// (keeps App.test green without wrapping it — the rail StatsProvider/MachineProvider follow).
const HelpSeenContext = createContext<HelpSeenContextValue>({
  seen: true,
  markSeen: () => {},
});

export function HelpSeenProvider({ children }: { children: ReactNode }) {
  const [seen, setSeen] = useState<boolean>(() => readHelpSeen());

  // Persist on change (guarded, never throws — DEC-005). The mount write is a harmless
  // round-trip of the just-read value (mirrors StatsProvider's persist-on-change effect).
  useEffect(() => {
    writeHelpSeen(seen);
  }, [seen]);

  const markSeen = useCallback(() => setSeen(true), []);

  const value = useMemo<HelpSeenContextValue>(() => ({ seen, markSeen }), [seen, markSeen]);

  return <HelpSeenContext.Provider value={value}>{children}</HelpSeenContext.Provider>;
}

/** Subscribe to the first-run "help seen" flag. Returns seen=true + a no-op markSeen without a provider. */
export function useHelpSeen(): HelpSeenContextValue {
  return useContext(HelpSeenContext);
}
