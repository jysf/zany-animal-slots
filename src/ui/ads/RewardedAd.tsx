// RewardedAd.tsx — a "watch a fake ad for play-money coins" mechanic (PROJ-004).
// A small "📺 Free coins" button opens a modal that plays a brief fake ad, then credits PLAY-money
// coins via onReward. no-real-money: the reward is play coins only — nothing is purchased or real.
// First-party/offline: no ad network, no video, no tracking — just a timed fake "ad" and a credit.
// Reduced-motion: skip the countdown, credit immediately. Tokens only (DEC-010).
import { useState, useEffect, useRef } from 'react';
import { adAt } from './fakeAds';
import { prefersReducedMotion } from '../prefersReducedMotion';
import './ads.css';

type Phase = 'idle' | 'watching' | 'done';

/** Seconds the fake ad "plays" before the reward unlocks. */
const WATCH_SECONDS = 3;

export default function RewardedAd({
  rewardCoins,
  onReward,
  adIndex = 0,
}: {
  rewardCoins: number;
  onReward: (coins: number) => void;
  adIndex?: number;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [remaining, setRemaining] = useState(WATCH_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ad = adAt(adIndex);

  function clear() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  useEffect(() => () => clear(), []);

  function startWatching() {
    if (prefersReducedMotion()) {
      // No countdown — go straight to the reward-ready state.
      setPhase('done');
      return;
    }
    setRemaining(WATCH_SECONDS);
    setPhase('watching');
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clear();
          setPhase('done');
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  }

  function claim() {
    onReward(rewardCoins);
    close();
  }

  function close() {
    clear();
    setPhase('idle');
    setRemaining(WATCH_SECONDS);
  }

  return (
    <>
      <button type="button" className="reward__trigger" onClick={startWatching} aria-label={`Watch a fake ad for ${rewardCoins} coins`}>
        📺 Free coins
      </button>

      {phase !== 'idle' && (
        <>
          <div className="ad__backdrop" onClick={phase === 'done' ? undefined : close} data-testid="reward-backdrop" />
          <div className={`ad ad--interstitial ad--${ad.accent}`} role="dialog" aria-modal="true" aria-label="Rewarded advertisement">
            {phase === 'watching' ? (
              <>
                <span className="ad__sponsored">Advertisement</span>
                <span className="ad__emoji ad__emoji--hero" aria-hidden="true">{ad.emoji}</span>
                <h2 className="ad__brand ad__brand--hero">{ad.brand}</h2>
                <p className="ad__tagline ad__tagline--hero">{ad.tagline}</p>
                <p className="reward__countdown" role="status" aria-live="polite">
                  Reward in {remaining}s…
                </p>
              </>
            ) : (
              <>
                <span className="ad__emoji ad__emoji--hero" aria-hidden="true">🪙</span>
                <h2 className="ad__brand ad__brand--hero">+{rewardCoins} coins!</h2>
                <p className="ad__tagline ad__tagline--hero">Play-money reward — just for fun.</p>
                <button type="button" className="ad__cta" onClick={claim}>Collect</button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
