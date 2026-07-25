// AdPopup.tsx — a popup ad fired every `everyNSpins` spins (PROJ-004). Rotates through the active
// ads (config-driven); nothing if none are active. Fake, parody, offline. Reduced-motion: no slide.
import { useState, useEffect, useRef } from 'react';
import type { FakeAd } from './fakeAds';
import './ads.css';

export default function AdPopup({
  ads,
  spins,
  everyNSpins,
  onVisibilityChange,
}: {
  ads: FakeAd[];
  spins: number;
  everyNSpins: number;
  /** Reports whether the popup is currently on screen, so the parent can hide the banner
   *  under the reels while the popup is up and bring it back when it closes (PROJ-004). */
  onVisibilityChange?: (visible: boolean) => void;
}) {
  const [showing, setShowing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const lastFiredAt = useRef(0);

  useEffect(() => {
    if (everyNSpins > 0 && spins > 0 && spins % everyNSpins === 0 && spins !== lastFiredAt.current) {
      lastFiredAt.current = spins;
      setRotation((r) => r + 1);
      setShowing(true);
    }
  }, [spins, everyNSpins]);

  const visible = showing && ads.length > 0;

  // Report visibility up (and reset to false on unmount so the banner isn't left hidden).
  useEffect(() => {
    onVisibilityChange?.(visible);
    return () => onVisibilityChange?.(false);
  }, [visible, onVisibilityChange]);

  if (!visible) return null;
  const ad = ads[rotation % ads.length];

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
