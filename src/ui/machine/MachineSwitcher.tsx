// MachineSwitcher — prev/next machine stepper with the machine name as the cabinet marquee
// (SPEC-093, replaces SPEC-050's <select>). The name is the header's prominent element, so the
// machine you're on is readable at a glance instead of truncated inside a control.
//
// A11y note: a native <select> gave keyboard switching and screen-reader announcement for free.
// Both are restored deliberately here — ArrowLeft/ArrowRight on the group step machines, and the
// name is an aria-live region so a switch is announced. Losing either would be a regression.
// DEC-001: pure UI. DEC-010: token-only styling via machine-switcher.css.
import { listMachines } from '../../machines/registry';
import { useActiveMachine } from './MachineProvider';
import './machine-switcher.css';

export default function MachineSwitcher() {
  const { activeMachineId, setActiveMachineId } = useActiveMachine();
  const machines = listMachines();

  const index = machines.findIndex((m) => m.id === activeMachineId);
  // An unknown active id would give -1; treat it as the first machine so the arrows still work
  // rather than stepping from a phantom position.
  const current = index === -1 ? 0 : index;

  /** Step by ±1 with wrap-around — 6 machines is small enough that wrapping beats dead-ending. */
  const step = (delta: number): void => {
    const next = (current + delta + machines.length) % machines.length;
    setActiveMachineId(machines[next].id);
  };

  return (
    <div
      className="machine-switcher"
      role="group"
      aria-label="Machine"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          step(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          step(1);
        }
      }}
    >
      <button
        type="button"
        className="machine-switcher__arrow"
        aria-label="Previous machine"
        onClick={() => step(-1)}
      >
        ◀
      </button>
      {/* The marquee: the machine name IS the cabinet's headline (SPEC-093).
          The old title's flanking 🎰 emoji are deliberately NOT carried over — they cost ~70px,
          which at 375px truncated the longest name ("Wild & Whimsical") to "Wild & …". That is
          worse than the <select> this replaced, and it defeats the whole point of promoting the
          name. Decoration loses to legibility. */}
      <h1 className="cabinet__title">
        <span className="cabinet__title-text" aria-live="polite">
          {machines[current]?.name}
        </span>
      </h1>
      <button
        type="button"
        className="machine-switcher__arrow"
        aria-label="Next machine"
        onClick={() => step(1)}
      >
        ▶
      </button>
    </div>
  );
}
