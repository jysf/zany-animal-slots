// WinBadge — pop-up win-amount overlay over the reel grid (SPEC-019).
// Renders nothing unless there is a fresh win to show (amount > 0 AND show is
// true). Absolutely positioned over the grid — no layout shift (DEC-010).
// Animates in via a CSS keyframe (DEC-004); reduced-motion shows it statically.
// SPEC-033: adds optional `tier` prop — renders a tier word (WIN / BIG WIN /
// JACKPOT) before the amount and exposes data-tier for colorblind-safe cues.
import type { WinTier } from '../../engine/index';
import './win-badge.css';

interface Props {
  amount: number;
  show: boolean;
  tier?: WinTier;
}

const TIER_WORD: Record<'small' | 'big' | 'jackpot', string> = {
  small: 'WIN',
  big: 'BIG WIN',
  jackpot: 'JACKPOT',
};

export default function WinBadge({ amount, show, tier = 'small' }: Props) {
  // Guard: only render when there is a positive win to display and the reels
  // are not spinning (show === !spinning; the badge clears during the next spin).
  if (!show || amount <= 0) return null;

  // Coerce 'none' to 'small' — 'none' should never reach here (Celebration.tier
  // is always 'small' | 'big' | 'jackpot'), but guard defensively.
  const t = tier === 'none' ? 'small' : tier;

  return (
    <div className="win-badge" data-tier={t} role="status">
      {TIER_WORD[t]} +{amount}
    </div>
  );
}
