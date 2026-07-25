// AdInterstitial.tsx — the on-load ad modal (PROJ-004). Shows once on load, dismissible. Renders
// one of the active ads (config-driven); nothing if none are active. Fake, parody, offline.
import { useState, useEffect, useRef } from 'react';
import type { FakeAd } from './fakeAds';
import './ads.css';

export default function AdInterstitial({ ads, index = 0 }: { ads: FakeAd[]; index?: number }) {
  const [open, setOpen] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);

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

  if (!open || ads.length === 0) return null;
  const ad = ads[((index % ads.length) + ads.length) % ads.length];

  return (
    <>
      <div className="ad__backdrop" onClick={() => setOpen(false)} data-testid="ad-interstitial-backdrop" />
      <div
        className={`ad ad--interstitial ad--${ad.accent}`}
        role="dialog"
        aria-modal="true"
        aria-label="Advertisement"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="ad__close ad__close--corner"
          aria-label="Close advertisement"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
        <span className="ad__sponsored">Advertisement</span>
        <span className="ad__emoji ad__emoji--hero" aria-hidden="true">{ad.emoji}</span>
        <h2 className="ad__brand ad__brand--hero">{ad.brand}</h2>
        <p className="ad__tagline ad__tagline--hero">{ad.tagline}</p>
        <button type="button" className="ad__cta">{ad.cta}</button>
        {ad.disclaimer && <p className="ad__disclaimer">{ad.disclaimer}</p>}
        <button type="button" className="ad__skip" onClick={() => setOpen(false)}>
          No thanks — take me to the game
        </button>
      </div>
    </>
  );
}
