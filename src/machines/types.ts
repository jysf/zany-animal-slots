// A machine = pure config: a MATH slice (engine) + a PRESENTATION slice (UI).
// SPEC-038 pins symbolDisplay in the presentation slice; SPEC-041 extends it with
// theme tokens + audio params and wires the UI to read the active machine.
import type { SymbolId, MachineMath } from '../engine/index';

export interface MachinePresentation {
  symbolDisplay: Record<SymbolId, { emoji: string; label: string }>;
}

export interface Machine {
  id: string;
  name: string;
  math: MachineMath;
  presentation: MachinePresentation;
}
