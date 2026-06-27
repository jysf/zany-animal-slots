// Status region — balance, bet, and last-win readout (STAGE-003).
// SPEC-013: receives balance and bet as props from App (threaded from the hook).
// SPEC-019: adds lastWin prop — the resolved spin's totalWin (0 on a loss or after
// reset). Displayed as a persistent WIN readout alongside Balance / Bet.
import './controls.css';

interface Props {
  balance: number;
  bet: number;
  lastWin: number;
}

export default function Status({ balance, bet, lastWin }: Props) {
  return (
    <section className="cabinet__status" aria-label="Status">
      <div className="status-readout">
        <div className="status-readout__item">
          <span className="status-readout__label">Balance</span>
          <span className="status-readout__value">{balance}</span>
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
