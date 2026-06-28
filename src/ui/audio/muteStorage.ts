// muteStorage.ts — safe localStorage helpers for the mute key (SPEC-026).
// UI concern only (DEC-001). Mirrors storage.ts; never throws.
// DEC-007: mute is the persisted half of the audio gate.

export const MUTE_KEY = 'mute';

/**
 * Read the persisted mute state.
 * Returns false when the key is absent, storage is unavailable, or the stored
 * value is anything other than 'true' — never throws.
 */
export function readMute(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
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
