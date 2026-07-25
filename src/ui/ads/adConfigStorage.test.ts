// adConfigStorage tests (PROJ-004). jsdom provides localStorage.
import { AD_CONFIG_KEY, readAdConfig, writeAdConfig, clearAdConfig } from './adConfigStorage';
import { DEFAULT_AD_CONFIG, POPUP_MIN, POPUP_MAX, type AdConfig } from './adConfig';

describe('adConfigStorage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('returns the committed default when absent', () => {
    expect(readAdConfig()).toEqual(DEFAULT_AD_CONFIG);
  });

  it('the committed default is OFF (safe to ship — no ads until the owner flips it)', () => {
    expect(DEFAULT_AD_CONFIG.enabled).toBe(false);
  });

  it('round-trips a written override', () => {
    const cfg: AdConfig = {
      enabled: true,
      placements: { interstitial: false, popup: true, banner: false },
      popupEveryNSpins: 7,
      activeAdIds: ['wolf-mobile', 'owl-accounting'],
    };
    writeAdConfig(cfg);
    expect(readAdConfig()).toEqual(cfg);
  });

  it('clamps an out-of-range popup frequency', () => {
    writeAdConfig({ ...DEFAULT_AD_CONFIG, popupEveryNSpins: 9999 });
    expect(readAdConfig().popupEveryNSpins).toBe(POPUP_MAX);
    writeAdConfig({ ...DEFAULT_AD_CONFIG, popupEveryNSpins: 0 });
    expect(readAdConfig().popupEveryNSpins).toBe(POPUP_MIN);
  });

  it('drops unknown ad ids and keeps known ones', () => {
    localStorage.setItem(
      AD_CONFIG_KEY,
      JSON.stringify({ ...DEFAULT_AD_CONFIG, activeAdIds: ['wolf-mobile', 'no-such-ad', 'owl-accounting'] }),
    );
    expect(readAdConfig().activeAdIds).toEqual(['wolf-mobile', 'owl-accounting']);
  });

  it('fills missing fields from the default (partial/old blob)', () => {
    localStorage.setItem(AD_CONFIG_KEY, JSON.stringify({ enabled: true }));
    const cfg = readAdConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.placements).toEqual(DEFAULT_AD_CONFIG.placements);
    expect(cfg.popupEveryNSpins).toBe(DEFAULT_AD_CONFIG.popupEveryNSpins);
  });

  it('returns the default on a corrupt blob (never throws)', () => {
    localStorage.setItem(AD_CONFIG_KEY, 'not json{');
    expect(readAdConfig()).toEqual(DEFAULT_AD_CONFIG);
  });

  it('clearAdConfig reverts this browser to the committed default', () => {
    writeAdConfig({ ...DEFAULT_AD_CONFIG, enabled: true });
    clearAdConfig();
    expect(readAdConfig()).toEqual(DEFAULT_AD_CONFIG);
  });
});
