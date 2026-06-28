// Status region — balance, bet, and last-win readout (STAGE-003).
// SPEC-013: receives balance and bet as props from App (threaded from the hook).
// SPEC-019: adds lastWin prop — the resolved spin's totalWin (0 on a loss or after
// reset). Displayed as a persistent WIN readout alongside Balance / Bet.
// SPEC-022: accepts an optional celebration prop; computes a useCountUp signal so
// the balance ticks from pre-credit to post-win on a win. With no celebration prop
// the signal is null → shownBalance === balance (instant, existing tests pass).
import './controls.css';
import type { Celebration } from '../useSlotMachine';
import { useCountUp } from '../useCountUp';

interface Props {
  balance: number;
  bet: number;
  lastWin: number;
  celebration?: Celebration | null;
}

export default function Status({ balance, bet, lastWin, celebration }: Props) {
  // Derive the count-up signal from the celebration prop (null when no win).
  const signal = celebration ? { id: celebration.id, amount: celebration.totalWin } : null;
  const shownBalance = useCountUp(balance, signal);

  return (
    <section className="cabinet__status" aria-label="Status">
      <div className="status-readout">
        <div className="status-readout__item">
          <span className="status-readout__label">Balance</span>
          <span className="status-readout__value">{shownBalance}</span>
        </div>
        <div className="status-readout__item">
          <span className="status-readout__label">Bet</span>
          <span className="status-readout__value">{bet}</span>
        </div>
        <div className="status-readout__item">
          <span className="status-readout__label">WIN</span>
          <span className="status-readout__value">{lastWin}</span>
        </div>
      </div>
    </section>
  );
}
