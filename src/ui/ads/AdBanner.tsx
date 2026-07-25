// AdBanner.tsx — an on-machine banner ad (PROJ-004). Persistent until dismissed. Renders one of
// the active ads (config-driven); nothing if none are active. Fake, parody, first-party/offline.
import { useState } from 'react';
import type { FakeAd } from './fakeAds';
import './ads.css';

export default function AdBanner({ ads, index = 0 }: { ads: FakeAd[]; index?: number }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || ads.length === 0) return null;
  const ad = ads[((index % ads.length) + ads.length) % ads.length];

  return (
    <aside className={`ad ad--banner ad--${ad.accent}`} role="complementary" aria-label="Advertisement">
      <span className="ad__sponsored">Ad</span>
      <span className="ad__emoji" aria-hidden="true">{ad.emoji}</span>
      <span className="ad__banner-copy">
        <span className="ad__brand">{ad.brand}</span>
        <span className="ad__tagline">{ad.tagline}</span>
      </span>
      <button type="button" className="ad__cta ad__cta--compact">{ad.cta}</button>
      <button
        type="button"
        className="ad__close"
        aria-label="Dismiss advertisement"
        onClick={() => setDismissed(true)}
      >
        ✕
      </button>
    </aside>
  );
}
