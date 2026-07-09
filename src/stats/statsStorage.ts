// statsStorage.ts — safe versioned localStorage for the session-stats blob (SPEC-054, DEC-020).
// Mirrors src/machines/activeMachineStorage.ts (SPEC-049): namespaced zany:* key, guarded,
// never throws (DEC-005). A single JSON blob; absent/corrupt/wrong-version ⇒ emptyStats().

import { emptyStats, STATS_VERSION, type SessionStats } from './sessionStats';

export const STATS_KEY = 'zany:stats';

/** Narrow an unknown parse result to a well-formed, current-version SessionStats. */
function isValid(v: unknown): v is SessionStats {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    s.version === STATS_VERSION &&
    typeof s.spins === 'number' &&
    typeof s.winningSpins === 'number' &&
    typeof s.totalWagered === 'number' &&
    typeof s.totalWon === 'number' &&
    typeof s.cashIns === 'number' &&
    Array.isArray(s.series) &&
    (s.biggestWin === null || typeof s.biggestWin === 'object')
  );
}

/** The persisted stats, or emptyStats() when absent / corrupt / wrong-version. Never throws. */
export function readStats(): SessionStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw === null) return emptyStats();
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : emptyStats();
  } catch {
    return emptyStats();
  }
}

/** Persist the stats blob. Silently ignores quota / unavailable storage. Never throws. */
export function writeStats(stats: SessionStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore quota / unavailable
  }
}
