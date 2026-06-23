// Action region — controls bar at the bottom (STAGE-003).
// SPEC-013: renders the Spin button wired to the hook via props.
// SPEC-014: adds bet −/+ stepper buttons (≥44px, touch-targets-44).
// SPEC-015: adds Reset button (≥44px, touch-targets-44) via onReset prop.
// Button is ≥44px (constraint: touch-targets-44) and disabled when canSpin is false
// (DEC-005: unaffordable spin is a no-op; the button reflects that at the UI level).
import './controls.css';

interface Props {
  onSpin: () => void;
  canSpin: boolean;
  onBetDown: () => void;
  onBetUp: () => void;
  canBetDown: boolean;
  canBetUp: boolean;
  onReset: () => void;
}

export default function Action({ onSpin, canSpin, onBetDown, onBetUp, canBetDown, canBetUp, onReset }: Props) {
  return (
    <section className="cabinet__action" aria-label="Controls">
      <div className="bet-stepper">
        <button
          type="button"
          className="bet-btn"
          aria-label="Decrease bet"
          onClick={onBetDown}
          disabled={!canBetDown}
        >
          −
        </button>
        <button
          type="button"
          className="bet-btn"
          aria-label="Increase bet"
          onClick={onBetUp}
          disabled={!canBetUp}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="spin-btn"
        onClick={onSpin}
        disabled={!canSpin}
      >
        Spin
      </button>
      <button
        type="button"
        className="reset-btn"
        aria-label="Reset"
        onClick={onReset}
      >
        Reset
      </button>
    </section>
  );
}
