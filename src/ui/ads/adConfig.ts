// adConfig.ts — the ad-probe configuration model (PROJ-004).
//
// The COMMITTED DEFAULT_AD_CONFIG is what every visitor sees (the game is a static site with no
// backend — DEC-005 — so "what everyone sees" lives in the deploy, not a server). The control
// panel edits a per-browser OVERRIDE for previewing; "Copy as default" exports a config to paste
// here + redeploy, which is how a change reaches everyone.
import { FAKE_ADS, type FakeAd } from './fakeAds';

export interface AdConfig {
  /** Master switch. When false, no ads render for anyone. */
  enabled: boolean;
  /** Which placements are active. */
  placements: {
    interstitial: boolean; // on-load modal
    popup: boolean; // fires every popupEveryNSpins
    banner: boolean; // persistent, on-machine
  };
  /** Popup cadence in spins (clamped to a sane range on read). */
  popupEveryNSpins: number;
  /** Which built-in ads (by id) are in rotation. */
  activeAdIds: string[];
}

/** Frequency guard rails (a config from an old/corrupt blob is clamped to these). */
export const POPUP_MIN = 3;
export const POPUP_MAX = 50;

/**
 * The committed default — what every visitor gets. Deliberately OFF and calm so merging this
 * changes nothing for anyone until the owner flips `enabled` and redeploys. When enabled, it's
 * "smaller numbers": a banner + an occasional popup, no on-load interstitial.
 */
export const DEFAULT_AD_CONFIG: AdConfig = {
  enabled: false,
  placements: { interstitial: false, popup: true, banner: true },
  popupEveryNSpins: 10,
  activeAdIds: FAKE_ADS.map((a) => a.id),
};

/** The ads currently in rotation for a config (preserves FAKE_ADS order). */
export function activeAds(config: AdConfig): FakeAd[] {
  const on = new Set(config.activeAdIds);
  return FAKE_ADS.filter((a) => on.has(a.id));
}
