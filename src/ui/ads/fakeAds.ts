// fakeAds.ts — parody, obviously-invented house ads for the PROJ-004 probe.
// FIRST-PARTY + OFFLINE ONLY (DEC-005): pure local data, no network, no tracking, no real brands.
// no-real-money: any "prize" is parody with a disclaimer; nothing is winnable or purchasable.
// Colors come from design tokens via CSS classes (DEC-010) — no raw hex here.

export interface FakeAd {
  /** Stable id for keys. */
  id: string;
  /** Big emoji "logo". */
  emoji: string;
  /** Invented brand name — never a real company. */
  brand: string;
  /** The pitch. Playful, animal/slots-themed, clearly not serious. */
  tagline: string;
  /** Fake call-to-action label (does nothing but dismiss/no-op). */
  cta: string;
  /** Optional parody fine print (e.g. for a "prize" ad). */
  disclaimer?: string;
  /** Tier token used to tint the ad card, reusing existing win-tier colors. */
  accent: 'small' | 'big' | 'jackpot';
}

/** The creative pool. All fake, all parody. */
export const FAKE_ADS: FakeAd[] = [
  {
    id: 'beaver-insurance',
    emoji: '🦫',
    brand: "Beaver's Dam Insurance",
    tagline: 'Because your logs deserve protection.™',
    cta: 'Get a Quote',
    accent: 'small',
  },
  {
    id: 'otter-energy',
    emoji: '🦦',
    brand: 'Otter Energy',
    tagline: 'Stay slippery. Stay winning.',
    cta: 'Crack One Open',
    accent: 'big',
  },
  {
    id: 'owl-accounting',
    emoji: '🦉',
    brand: "Owl's All-Night Accounting",
    tagline: 'Whooo does your taxes at 3am? We do.',
    cta: 'Book a Hoot',
    accent: 'small',
  },
  {
    id: 'wolf-mobile',
    emoji: '🐺',
    brand: 'Wolf Pack Mobile',
    tagline: 'Howl unlimited. No roaming, ever.',
    cta: 'Join the Pack',
    accent: 'big',
  },
  {
    id: 'fake-yacht',
    emoji: '🛥️',
    brand: 'MegaWin Sweepstakes',
    tagline: 'WIN A REAL FAKE YACHT!*',
    cta: 'Claim Now',
    disclaimer: '*Not real. Not a yacht. Not winnable. This is a pretend ad in a play-money game.',
    accent: 'jackpot',
  },
  {
    id: 'deer-timeshare',
    emoji: '🦌',
    brand: 'Deer Park Timeshares',
    tagline: 'A meadow to call your own. 4,000 easy payments of nothing.',
    cta: 'Tour a Meadow',
    disclaimer: '*No meadow exists. No payments are real. Play money only.',
    accent: 'small',
  },
];

/** Pick an ad by index with wraparound — deterministic, no RNG (keeps it test-safe). */
export function adAt(index: number): FakeAd {
  return FAKE_ADS[((index % FAKE_ADS.length) + FAKE_ADS.length) % FAKE_ADS.length];
}
