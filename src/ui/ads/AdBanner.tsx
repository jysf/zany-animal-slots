// AdBanner.tsx — an on-machine banner ad (PROJ-004 probe). Sits in the cabinet, persistent
// until dismissed. Fake, parody creative (fakeAds.ts); first-party, offline, no tracking.
import { useState } from 'react';
import { adAt } from './fakeAds';
import './ads.css';

export default function AdBanner({ index = 0 }: { index?: number }) {
  const [dismissed, setDismissed] = useState(false);
  const ad = adAt(index);
  if (dismissed) return null;

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
