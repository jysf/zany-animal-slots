// A machine = pure config: a MATH slice (engine) + a PRESENTATION slice (UI).
// SPEC-038 pinned symbolDisplay in the presentation slice; SPEC-041 threads it into
// ReelGrid/paytable via props/params (theme tokens + audio params deferred to STAGE-008).
import type { SymbolId, MachineMath } from '../engine/index';

/** Per-symbol emoji + accessible label — the UI presentation map (DEC-006). */
export type SymbolDisplay = Record<SymbolId, { emoji: string; label: string }>;

export interface MachinePresentation {
  symbolDisplay: SymbolDisplay;
}

export interface Machine {
  id: string;
  name: string;
  math: MachineMath;
  presentation: MachinePresentation;
}
