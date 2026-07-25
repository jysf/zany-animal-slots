// useAdProbe.ts — the opt-in gate for the fake-ad probe (PROJ-004).
// OFF by default: the ads only render when the URL carries ?ads=1 (or ?ads=true).
// This keeps the deployed game unchanged — the probe is a look, not a shipped feature.
// No persistence, no network: reading the query string is the whole gate.
export function useAdProbe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const v = new URLSearchParams(window.location.search).get('ads');
    return v === '1' || v === 'true';
  } catch {
    return false;
  }
}
