// Action region — controls bar at the bottom (STAGE-003).
// SPEC-013: renders the Spin button wired to the hook via props.
// SPEC-014: adds bet −/+ stepper buttons (≥44px, touch-targets-44).
// SPEC-015: adds Reset button (≥44px, touch-targets-44) via onReset prop.
// SPEC-016: accepts isSpinning; disables bet −/+, Reset, and Spin while spinning
//           so no controls can be activated mid-spin.
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
  isSpinning?: boolean;
}

export default function Action({ onSpin, canSpin, onBetDown, onBetUp, canBetDown, canBetUp, onReset, isSpinning = false }: Props) {
  return (
    <section className="cabinet__action" aria-label="Controls">
      <div className="bet-stepper">
        <button
          type="button"
          className="bet-btn"
          aria-label="Decrease bet"
          onClick={onBetDown}
          disabled={!canBetDown || isSpinning}
        >
          −
        </button>
        <button
          type="button"
          className="bet-btn"
          aria-label="Increase bet"
          onClick={onBetUp}
          disabled={!canBetUp || isSpinning}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="spin-btn"
        onClick={onSpin}
        disabled={!canSpin || isSpinning}
      >
        Spin
      </button>
      <button
        type="button"
        className="reset-btn"
        aria-label="Reset"
        onClick={onReset}
        disabled={isSpinning}
      >
        Reset
      </button>
    </section>
  );
}
