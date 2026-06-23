// storage.ts — safe localStorage helpers for the balance key (SPEC-015).
// UI concern only (DEC-001). Ignores quota errors, unavailable storage, and
// non-finite stored values — always returns null rather than throwing (DEC-005).

export const BALANCE_KEY = 'zany-animal-slots.balance';

/**
 * Read the persisted balance.
 * Returns null when the key is absent, the value is not a finite number, or
 * localStorage is unavailable — never throws.
 */
export function readBalance(): number | null {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * Persist the balance.
 * Silently ignores quota errors and unavailable storage — never throws.
 */
export function writeBalance(n: number): void {
  try {
    localStorage.setItem(BALANCE_KEY, String(n));
  } catch {
    // Ignore quota / unavailable
  }
}
