// AdPopup.tsx — a popup ad that appears after a few spins (PROJ-004 probe). A smaller
// corner card that slides in, dismissible, re-armed after another burst of spins.
// Fake parody creative; first-party, offline, no tracking. Reduced-motion: no slide.
import { useState, useEffect, useRef } from 'react';
import { adAt } from './fakeAds';
import './ads.css';

/** Show the popup every SPINS_PER_POPUP spins (probe pacing). */
const SPINS_PER_POPUP = 5;

export default function AdPopup({ spins }: { spins: number }) {
  const [showing, setShowing] = useState(false);
  const [adIndex, setAdIndex] = useState(1);
  const lastFiredAt = useRef(0);

  useEffect(() => {
    if (spins > 0 && spins % SPINS_PER_POPUP === 0 && spins !== lastFiredAt.current) {
      lastFiredAt.current = spins;
      setAdIndex((i) => i + 1);
      setShowing(true);
    }
  }, [spins]);

  if (!showing) return null;
  const ad = adAt(adIndex);

  return (
    <div className={`ad ad--popup ad--${ad.accent}`} role="dialog" aria-label="Advertisement">
      <button
        type="button"
        className="ad__close ad__close--corner"
        aria-label="Close advertisement"
        onClick={() => setShowing(false)}
      >
        ✕
      </button>
      <span className="ad__sponsored">Ad</span>
      <div className="ad__popup-body">
        <span className="ad__emoji" aria-hidden="true">{ad.emoji}</span>
        <div className="ad__popup-copy">
          <span className="ad__brand">{ad.brand}</span>
          <span className="ad__tagline">{ad.tagline}</span>
        </div>
      </div>
      <button type="button" className="ad__cta ad__cta--compact">{ad.cta}</button>
      {ad.disclaimer && <p className="ad__disclaimer">{ad.disclaimer}</p>}
    </div>
  );
}
