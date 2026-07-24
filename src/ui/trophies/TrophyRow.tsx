// TrophyRow — a compact rank #4-#10 row (SPEC-076) that expands in place to reveal the
// same detail block a TrophyCard shows. Expansion state is local (not lifted) — rows are
// independent and nothing else needs to know (Notes for the Implementer).
import { useState } from 'react';
import type { TopWin } from '../../stats/sessionStats';
import TrophyGrid from './TrophyGrid';
import { TrophyDetail, trophyMachineName } from './TrophyCard';
import './trophies.css';

export interface TrophyRowProps {
  trophy: TopWin;
  /** 0-based rank within the full topWins list (used for the visible "#N" label). */
  rank: number;
}

export default function TrophyRow({ trophy, rank }: TrophyRowProps) {
  const [open, setOpen] = useState(false);
  const machineName = trophyMachineName(trophy);

  return (
    <li className="trophy-row">
      <button
        type="button"
        className="trophy-row__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="trophy-row__rank" aria-hidden="true">
          #{rank + 1}
        </span>
        <TrophyGrid trophy={trophy} size="thumb" />
        <span className="trophy-row__summary">
          <span className="trophy-row__amount">{trophy.amount} coins</span>
          <span className="trophy-row__machine">{machineName}</span>
        </span>
      </button>
      {open && (
        <div className="trophy-row__expanded">
          <TrophyDetail trophy={trophy} />
        </div>
      )}
    </li>
  );
}
