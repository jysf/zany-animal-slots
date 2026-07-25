// AdSettingsSheet.tsx — the owner's ad control panel (PROJ-004). Reached via ?ads=1 (useAdAdmin);
// visitors never see it. Edits a per-browser OVERRIDE (live preview); "Copy as default" exports
// the config to paste into DEFAULT_AD_CONFIG + redeploy (the no-backend way to change what
// everyone sees — DEC-005). Mirrors StatsSheet's sheet/backdrop/Esc/focus idiom.
// DEC-010: tokens only, prefixed classes. Toggle-the-6-built-ins-on/off (no copy editing).
import { useState, useEffect, useRef } from 'react';
import { useAdConfig } from './AdConfigProvider';
import { POPUP_MIN, POPUP_MAX, REWARD_MIN, REWARD_MAX } from './adConfig';
import { FAKE_ADS } from './fakeAds';
import './ads.css';

export default function AdSettingsSheet() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { config, update, resetToDefault } = useAdConfig();

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function toggleAd(id: string) {
    const on = new Set(config.activeAdIds);
    if (on.has(id)) on.delete(id);
    else on.add(id);
    update({ activeAdIds: FAKE_ADS.map((a) => a.id).filter((x) => on.has(x)) });
  }

  function copyAsDefault() {
    // The exact literal to paste into DEFAULT_AD_CONFIG in src/ui/ads/adConfig.ts, then redeploy.
    // `version` references AD_CONFIG_VERSION; bump that constant too to override testers who
    // already saved an override (see the note below).
    const snippet = `export const DEFAULT_AD_CONFIG: AdConfig = {
  version: AD_CONFIG_VERSION,
  enabled: ${config.enabled},
  placements: ${JSON.stringify(config.placements)},
  popupEveryNSpins: ${config.popupEveryNSpins},
  rewardCoins: ${config.rewardCoins},
  activeAdIds: ${JSON.stringify(config.activeAdIds)},
};`;
    try {
      void navigator.clipboard?.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — no-op; the owner can still read the config off-screen if needed
    }
  }

  const freq = config.popupEveryNSpins;

  return (
    <>
      <button
        className="ad-settings__trigger"
        aria-label="Ad settings"
        title="Ad settings"
        onClick={() => setOpen(true)}
      >
        ⚙️
      </button>

      {open && (
        <>
          <div className="ad-settings__backdrop" onClick={() => setOpen(false)} data-testid="ad-settings-backdrop" />
          <div role="dialog" aria-modal="true" aria-label="Ad settings" className="ad-settings__sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ad-settings__header">
              <h2 className="ad-settings__title">Ad settings</h2>
              <button ref={closeRef} className="ad-settings__close" aria-label="Close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Master */}
            <label className="ad-settings__row">
              <span>Ads</span>
              <input type="checkbox" checked={config.enabled} onChange={(e) => update({ enabled: e.target.checked })} aria-label="Enable ads" />
            </label>

            <h3 className="ad-settings__group">Placements</h3>
            <label className="ad-settings__row">
              <span>On-load ad</span>
              <input type="checkbox" checked={config.placements.interstitial} onChange={(e) => update({ placements: { ...config.placements, interstitial: e.target.checked } })} aria-label="Enable on-load ad" />
            </label>
            <label className="ad-settings__row">
              <span>Popup</span>
              <input type="checkbox" checked={config.placements.popup} onChange={(e) => update({ placements: { ...config.placements, popup: e.target.checked } })} aria-label="Enable popup ad" />
            </label>
            <label className="ad-settings__row">
              <span>On-machine banner</span>
              <input type="checkbox" checked={config.placements.banner} onChange={(e) => update({ placements: { ...config.placements, banner: e.target.checked } })} aria-label="Enable banner ad" />
            </label>
            <label className="ad-settings__row">
              <span>Rewarded ad (free coins)</span>
              <input type="checkbox" checked={config.placements.rewarded} onChange={(e) => update({ placements: { ...config.placements, rewarded: e.target.checked } })} aria-label="Enable rewarded ad" />
            </label>

            <label className="ad-settings__row">
              <span>Reward</span>
              <span className="ad-settings__freq">
                <input
                  type="number"
                  min={REWARD_MIN}
                  max={REWARD_MAX}
                  step={50}
                  value={config.rewardCoins}
                  onChange={(e) => update({ rewardCoins: Math.min(REWARD_MAX, Math.max(REWARD_MIN, Number(e.target.value) || REWARD_MIN)) })}
                  aria-label="Rewarded-ad coins"
                />{' '}
                coins
              </span>
            </label>

            <label className="ad-settings__row">
              <span>Popup every</span>
              <span className="ad-settings__freq">
                <input
                  type="number"
                  min={POPUP_MIN}
                  max={POPUP_MAX}
                  value={freq}
                  onChange={(e) => update({ popupEveryNSpins: Math.min(POPUP_MAX, Math.max(POPUP_MIN, Number(e.target.value) || POPUP_MIN)) })}
                  aria-label="Popup frequency in spins"
                />{' '}
                spins
              </span>
            </label>

            <h3 className="ad-settings__group">Ad content</h3>
            <ul className="ad-settings__ads">
              {FAKE_ADS.map((ad) => (
                <li key={ad.id} className="ad-settings__ad">
                  <label className="ad-settings__row">
                    <span><span aria-hidden="true">{ad.emoji}</span> {ad.brand}</span>
                    <input type="checkbox" checked={config.activeAdIds.includes(ad.id)} onChange={() => toggleAd(ad.id)} aria-label={`Show ${ad.brand}`} />
                  </label>
                </li>
              ))}
            </ul>

            <div className="ad-settings__actions">
              <button className="ad-settings__action" onClick={copyAsDefault}>
                {copied ? 'Copied ✓' : 'Copy as default'}
              </button>
              <button className="ad-settings__action ad-settings__action--muted" onClick={resetToDefault}>
                Reset to default
              </button>
            </div>
            <p className="ad-settings__note">
              Changes preview in <em>this browser</em> only. To change what everyone sees, use
              <strong> Copy as default</strong>, paste it into <code>adConfig.ts</code>, and redeploy.
              To also override testers who already opened this panel, bump <code>AD_CONFIG_VERSION</code>.
            </p>
          </div>
        </>
      )}
    </>
  );
}
