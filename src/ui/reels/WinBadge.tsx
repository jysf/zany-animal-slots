// WinBadge — pop-up win-amount overlay over the reel grid (SPEC-019).
// Renders nothing unless there is a fresh win to show (amount > 0 AND show is
// true). Absolutely positioned over the grid — no layout shift (DEC-010).
// Animates in via a CSS keyframe (DEC-004); reduced-motion shows it statically.
import './win-badge.css';

interface Props {
  amount: number;
  show: boolean;
}

export default function WinBadge({ amount, show }: Props) {
  // Guard: only render when there is a positive win to display and the reels
  // are not spinning (show === !spinning; the badge clears during the next spin).
  if (!show || amount <= 0) return null;

  return (
    <div className="win-badge" role="status">
      WIN +{amount}
    </div>
  );
}
