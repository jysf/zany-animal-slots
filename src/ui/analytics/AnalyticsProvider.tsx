// AnalyticsProvider — mounts the analytics lifecycle (SPEC-062, DEC-023).
// On mount: applies the Do-Not-Track / build policy + emits session_start (once per load), and flushes on
// pagehide. Renders nothing of its own. The recording TAPS live at the existing game seams
// (useSlotMachine spin/cash-in, MachineProvider switch, HelpSeenProvider help-seen) which call the
// module-level track(); this provider only owns lifecycle. Default build: the sink is the no-op, so this
// is fully inert (DEC-005 intact).
import { useEffect, type ReactNode } from 'react';
import { startSession, flush } from '../../analytics';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    startSession();
    const onHide = () => flush();
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  return <>{children}</>;
}
