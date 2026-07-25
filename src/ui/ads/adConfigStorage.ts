// adConfigStorage.ts — safe localStorage for the per-browser ad-config OVERRIDE (PROJ-004).
// Namespaced zany:* key, guarded, never throws (DEC-005). Absent/corrupt ⇒ DEFAULT_AD_CONFIG.
// A stored override is normalized against the current shape so an old blob can't break rendering.
import {
  DEFAULT_AD_CONFIG,
  AD_CONFIG_VERSION,
  POPUP_MIN,
  POPUP_MAX,
  REWARD_MIN,
  REWARD_MAX,
  type AdConfig,
} from './adConfig';
import { FAKE_ADS } from './fakeAds';

export const AD_CONFIG_KEY = 'zany:ad-config';

const VALID_IDS = new Set(FAKE_ADS.map((a) => a.id));

function clampFreq(n: unknown): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : DEFAULT_AD_CONFIG.popupEveryNSpins;
  return Math.min(POPUP_MAX, Math.max(POPUP_MIN, v));
}

function clampReward(n: unknown): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : DEFAULT_AD_CONFIG.rewardCoins;
  return Math.min(REWARD_MAX, Math.max(REWARD_MIN, v));
}

/** Coerce an unknown parse result into a well-formed AdConfig, filling gaps from the default. */
function normalize(v: unknown): AdConfig {
  const o = (typeof v === 'object' && v !== null ? v : {}) as Record<string, unknown>;
  const p = (typeof o.placements === 'object' && o.placements !== null ? o.placements : {}) as Record<string, unknown>;
  const ids = Array.isArray(o.activeAdIds)
    ? o.activeAdIds.filter((id): id is string => typeof id === 'string' && VALID_IDS.has(id))
    : DEFAULT_AD_CONFIG.activeAdIds;
  return {
    version: AD_CONFIG_VERSION,
    enabled: typeof o.enabled === 'boolean' ? o.enabled : DEFAULT_AD_CONFIG.enabled,
    placements: {
      interstitial: typeof p.interstitial === 'boolean' ? p.interstitial : DEFAULT_AD_CONFIG.placements.interstitial,
      popup: typeof p.popup === 'boolean' ? p.popup : DEFAULT_AD_CONFIG.placements.popup,
      banner: typeof p.banner === 'boolean' ? p.banner : DEFAULT_AD_CONFIG.placements.banner,
      rewarded: typeof p.rewarded === 'boolean' ? p.rewarded : DEFAULT_AD_CONFIG.placements.rewarded,
    },
    popupEveryNSpins: clampFreq(o.popupEveryNSpins),
    rewardCoins: clampReward(o.rewardCoins),
    activeAdIds: ids,
  };
}

/**
 * The per-browser override, or DEFAULT_AD_CONFIG when absent/corrupt/stale. Never throws.
 * A stored override whose `version` doesn't match AD_CONFIG_VERSION is discarded so a redeployed
 * default wins again (SPEC-087) — bump the version to override testers who touched the panel.
 */
export function readAdConfig(): AdConfig {
  try {
    const raw = localStorage.getItem(AD_CONFIG_KEY);
    if (raw === null) return DEFAULT_AD_CONFIG;
    const parsed = JSON.parse(raw) as { version?: unknown };
    if (typeof parsed?.version !== 'number' || parsed.version !== AD_CONFIG_VERSION) {
      clearAdConfig(); // stale/unversioned override — drop it so the committed default takes over
      return DEFAULT_AD_CONFIG;
    }
    return normalize(parsed);
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
