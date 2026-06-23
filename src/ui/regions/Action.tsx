// Action region — controls bar at the bottom (STAGE-003).
// SPEC-013: renders the Spin button wired to the hook via props.
// Button is ≥44px (constraint: touch-targets-44) and disabled when canSpin is false
// (DEC-005: unaffordable spin is a no-op; the button reflects that at the UI level).
import './controls.css';

interface Props {
  onSpin: () => void;
  canSpin: boolean;
}

export default function Action({ onSpin, canSpin }: Props) {
  return (
    <section className="cabinet__action" aria-label="Controls">
      <button
        type="button"
        className="spin-btn"
        onClick={onSpin}
        disabled={!canSpin}
      >
        Spin
      </button>
    </section>
  );
}
