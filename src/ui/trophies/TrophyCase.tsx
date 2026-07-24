// TrophyCase — the ranked, celebratory arrangement of up to TOP_WINS_CAP saved wins
// (SPEC-076). Pure presentation over the persisted topWins list: no engine or storage
// access here (DEC-001). Composes TrophyGrid (SPEC-075) via TrophyCard/TrophyRow.
import { TOP_WINS_CAP, type TopWin } from '../../stats/sessionStats';
import TrophyCard from './TrophyCard';
import TrophyRow from './TrophyRow';
import './trophies.css';

export interface TrophyCaseProps {
  topWins: TopWin[];
  /** Current session spin count — reserved for the drought line in SPEC-079; not rendered here. */
  spins: number;
}

/** Decorative locked-plinth placeholders for the empty state — count keyed off TOP_WINS_CAP,
 * never hardcoded (DEC-024). */
function EmptyCase() {
  const plinths = Array.from({ length: TOP_WINS_CAP });
  return (
    <div className="trophy-case__empty">
      <p className="trophy-case__empty-copy">
        No trophies yet — your ten best wins will live here.
      </p>
      <div className="trophy-case__plinths">
        {plinths.map((_, i) => (
          <div className="trophy-case__plinth" aria-hidden="true" key={i} />
        ))}
      </div>
    </div>
  );
}

export default function TrophyCase({ topWins }: TrophyCaseProps) {
  if (topWins.length === 0) {
    return (
      <section className="trophy-case">
        <h3 className="trophy-case__heading">Trophy Case</h3>
        <EmptyCase />
      </section>
    );
  }

  const cards = topWins.slice(0, 3);
  const rows = topWins.slice(3);
  const isFull = topWins.length === TOP_WINS_CAP;
  const barToBeat = topWins[TOP_WINS_CAP - 1];

  return (
    <section className="trophy-case">
      <h3 className="trophy-case__heading">Trophy Case</h3>
      <ul className="trophy-case__cards">
        {cards.map((trophy, i) => (
          <TrophyCard trophy={trophy} rank={i} key={i} />
        ))}
      </ul>
      {rows.length > 0 && (
        <ul className="trophy-case__rows">
          {rows.map((trophy, i) => (
            <TrophyRow trophy={trophy} rank={i + 3} key={i + 3} />
          ))}
        </ul>
      )}
      {isFull && (
        <p className="trophy-case__bar-to-beat">
          Beat {barToBeat.amount} to make the case
        </p>
      )}
    </section>
  );
}
