// Status region — balance and bet readout (STAGE-003).
// SPEC-013: receives balance and bet as props from App (threaded from the hook).
import './controls.css';

interface Props {
  balance: number;
  bet: number;
}

export default function Status({ balance, bet }: Props) {
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
      </div>
    </section>
  );
}
