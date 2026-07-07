// activeMachineStorage.ts — safe localStorage for the active-machine selection (SPEC-049).
// Namespaced key (zany:*) so STAGE-009's stats keys can't collide. Never throws (DEC-005).

export const ACTIVE_MACHINE_KEY = 'zany:active-machine';

/** The persisted active-machine id, or null when absent / storage unavailable. Never throws. */
export function readActiveMachineId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_MACHINE_KEY);
  } catch {
    return null;
  }
}

/** Persist the active-machine id. Silently ignores quota / unavailable storage. Never throws. */
export function writeActiveMachineId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_MACHINE_KEY, id);
  } catch {
    // ignore quota / unavailable
  }
}
