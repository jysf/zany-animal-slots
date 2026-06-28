// JackpotMoment — full-cabinet overlay for the five-Wolf jackpot (SPEC-025).
// Fires only when celebration.tier === 'jackpot'; keyed on celebration.id so
// it replays on a new jackpot. Auto-dismisses after JACKPOT_MOMENT_MS.
// CSS handles the animation; no JS reduced-motion check (DEC-004).
import { useState, useEffect } from 'react';
import type { Celebration } from './useSlotMachine';
import './jackpot.css';

export const JACKPOT_MOMENT_MS = 3500;

export default function JackpotMoment({ celebration }: { celebration?: Celebration | null }) {
  const isJackpot = celebration?.tier === 'jackpot';
  const id = celebration?.id ?? null;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isJackpot) { setVisible(false); return; }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), JACKPOT_MOMENT_MS);
    return () => clearTimeout(t);
  }, [id, isJackpot]);

  if (!isJackpot || !visible) return null;

  return (
    <div className="jackpot-moment" role="status" aria-label="Jackpot! Five wolves!">
      <div className="jackpot-moment__sky" aria-hidden="true" />
      <div className="jackpot-moment__moon" aria-hidden="true">🌕</div>
      <div className="jackpot-moment__wolf" aria-hidden="true">🐺</div>
      <div className="jackpot-moment__banner">JACKPOT!</div>
    </div>
  );
}
