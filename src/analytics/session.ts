// session.ts — ephemeral per-load session identity + Do-Not-Track check (SPEC-062, DEC-023).
// The session id is generated once per page load, kept ONLY in memory, and never persisted (no cookie,
// no localStorage), so it cannot correlate across loads. Do-Not-Track, when set, forces analytics off.

let sessionId: string | null = null;

/** A random, opaque, in-memory-only id for this page load. Lazily created; never stored. */
export function getSessionId(): string {
  if (sessionId === null) sessionId = createId();
  return sessionId;
}

/** Drop the in-memory session id (tests only; a load boundary otherwise creates a fresh one). */
export function resetSessionId(): void {
  sessionId = null;
}

function createId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  // Fallback (older engines): not a security primitive (DEC-005 ethos) — just needs to be unique-ish.
  return `sid-${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * True when the user has expressed Do-Not-Track (the legacy but still-honored signal). When true,
 * analytics is forced off regardless of build config (DEC-023). `nav` is injectable for tests.
 */
export function isDoNotTrack(
  nav: Navigator | undefined = typeof navigator !== 'undefined' ? navigator : undefined,
): boolean {
  if (!nav) return false;
  const n = nav as unknown as { doNotTrack?: string | null; msDoNotTrack?: string | null };
  const w =
    typeof window !== 'undefined' ? (window as unknown as { doNotTrack?: string | null }) : undefined;
  const signals: Array<string | null | undefined> = [n.doNotTrack, n.msDoNotTrack, w?.doNotTrack];
  return signals.some((s) => s === '1' || s === 'yes');
}
