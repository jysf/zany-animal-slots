// muteStorage.ts — safe localStorage helpers for the mute key (SPEC-026).
// UI concern only (DEC-001). Mirrors storage.ts; never throws.
// DEC-007: mute is the persisted half of the audio gate.

export const MUTE_KEY = 'mute';

/**
 * Read the persisted mute state.
 * Quiet by default (DEC-025): muted unless a stored preference explicitly says 'false'.
 * Absent key, unavailable storage, or any non-'false' value ⇒ muted. Never throws.
 */
export function readMute(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) !== 'false';
  } catch {
    return true; // storage unavailable ⇒ stay quiet
  }
}

/**
 * Persist the mute state.
 * Silently ignores quota errors and unavailable storage — never throws.
 */
export function writeMute(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
  } catch {
    // ignore quota / unavailable
  }
}
