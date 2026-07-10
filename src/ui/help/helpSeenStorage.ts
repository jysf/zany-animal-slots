// helpSeenStorage.ts — safe versioned localStorage for the "help seen" first-run flag (SPEC-059, DEC-022).
// Mirrors src/stats/statsStorage.ts: namespaced zany:* key, single versioned JSON blob, guarded,
// never throws (DEC-005). Absent / corrupt / wrong-version ⇒ "not seen" (false) so the explainer shows.

export const HELP_SEEN_KEY = 'zany:help-seen';

/** Bumped only on a breaking change to the persisted blob shape. */
export const HELP_SEEN_VERSION = 1;

interface HelpSeenBlob {
  version: number;
  seen: boolean;
}

/** Narrow an unknown parse result to a well-formed, current-version blob. */
function isValid(v: unknown): v is HelpSeenBlob {
  if (typeof v !== 'object' || v === null) return false;
  const b = v as Record<string, unknown>;
  return b.version === HELP_SEEN_VERSION && typeof b.seen === 'boolean';
}

/**
 * Whether the how-to-play explainer has been seen. Returns false when absent / corrupt /
 * wrong-version so a first-timer (or a broken store) is shown the explainer. Never throws.
 */
export function readHelpSeen(): boolean {
  try {
    const raw = localStorage.getItem(HELP_SEEN_KEY);
    if (raw === null) return false;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed.seen : false;
  } catch {
    return false;
  }
}

/** Persist the seen flag as a versioned blob. Silently ignores quota / unavailable storage. Never throws. */
export function writeHelpSeen(seen: boolean): void {
  try {
    localStorage.setItem(HELP_SEEN_KEY, JSON.stringify({ version: HELP_SEEN_VERSION, seen }));
  } catch {
    // ignore quota / unavailable
  }
}
