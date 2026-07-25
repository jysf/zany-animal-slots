// adConfigStorage.ts — safe localStorage for the per-browser ad-config OVERRIDE (PROJ-004).
// Namespaced zany:* key, guarded, never throws (DEC-005). Absent/corrupt ⇒ DEFAULT_AD_CONFIG.
// A stored override is normalized against the current shape so an old blob can't break rendering.
import {
  DEFAULT_AD_CONFIG,
  POPUP_MIN,
  POPUP_MAX,
  type AdConfig,
} from './adConfig';
import { FAKE_ADS } from './fakeAds';

export const AD_CONFIG_KEY = 'zany:ad-config';

const VALID_IDS = new Set(FAKE_ADS.map((a) => a.id));

function clampFreq(n: unknown): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : DEFAULT_AD_CONFIG.popupEveryNSpins;
  return Math.min(POPUP_MAX, Math.max(POPUP_MIN, v));
}

/** Coerce an unknown parse result into a well-formed AdConfig, filling gaps from the default. */
function normalize(v: unknown): AdConfig {
  const o = (typeof v === 'object' && v !== null ? v : {}) as Record<string, unknown>;
  const p = (typeof o.placements === 'object' && o.placements !== null ? o.placements : {}) as Record<string, unknown>;
  const ids = Array.isArray(o.activeAdIds)
    ? o.activeAdIds.filter((id): id is string => typeof id === 'string' && VALID_IDS.has(id))
    : DEFAULT_AD_CONFIG.activeAdIds;
  return {
    enabled: typeof o.enabled === 'boolean' ? o.enabled : DEFAULT_AD_CONFIG.enabled,
    placements: {
      interstitial: typeof p.interstitial === 'boolean' ? p.interstitial : DEFAULT_AD_CONFIG.placements.interstitial,
      popup: typeof p.popup === 'boolean' ? p.popup : DEFAULT_AD_CONFIG.placements.popup,
      banner: typeof p.banner === 'boolean' ? p.banner : DEFAULT_AD_CONFIG.placements.banner,
    },
    popupEveryNSpins: clampFreq(o.popupEveryNSpins),
    activeAdIds: ids,
  };
}

/** The per-browser override, or DEFAULT_AD_CONFIG when absent/corrupt. Never throws. */
export function readAdConfig(): AdConfig {
  try {
    const raw = localStorage.getItem(AD_CONFIG_KEY);
    if (raw === null) return DEFAULT_AD_CONFIG;
    return normalize(JSON.parse(raw) as unknown);
  } catch {
    return DEFAULT_AD_CONFIG;
  }
}

/** Persist the per-browser override. Silently ignores quota/unavailable storage. Never throws. */
export function writeAdConfig(config: AdConfig): void {
  try {
    localStorage.setItem(AD_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/** Clear the override so this browser reverts to the committed DEFAULT_AD_CONFIG. */
export function clearAdConfig(): void {
  try {
    localStorage.removeItem(AD_CONFIG_KEY);
  } catch {
    // ignore
  }
}
