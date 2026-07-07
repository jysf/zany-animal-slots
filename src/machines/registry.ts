// The machine registry — the single source of the ACTIVE machine.
// STAGE-007 registers the default machine only (no selector). STAGE-008 makes the active
// machine selectable + persisted; getActiveMachine() is the seam it plugs into.
import { WILD_AND_WHIMSICAL } from './wildAndWhimsical';
import { readActiveMachineId } from './activeMachineStorage';
import type { Machine } from './types';

export const DEFAULT_MACHINE_ID = WILD_AND_WHIMSICAL.id;

/** All registered machines, keyed by id. Default only in STAGE-007. */
export const MACHINES: Record<string, Machine> = {
  [WILD_AND_WHIMSICAL.id]: WILD_AND_WHIMSICAL,
};

/** Look up a machine by id; falls back to the default for an unknown id. */
export function getMachine(id: string): Machine {
  return MACHINES[id] ?? WILD_AND_WHIMSICAL;
}

/** The active machine — resolves the persisted selection (SPEC-049), default when absent/unknown. */
export function getActiveMachine(): Machine {
  return getMachine(readActiveMachineId() ?? DEFAULT_MACHINE_ID);
}
