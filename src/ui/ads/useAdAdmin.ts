// useAdAdmin.ts — the ADMIN gate for the ad control panel (PROJ-004).
// `?ads=1` (or ?ads=true) reveals the owner's control panel; visitors never see admin chrome.
// Whether ADS themselves render is driven by the persisted ad config (adConfig), NOT this gate.
export function useAdAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const v = new URLSearchParams(window.location.search).get('ads');
    return v === '1' || v === 'true';
  } catch {
    return false;
  }
}
