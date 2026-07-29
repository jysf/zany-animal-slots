// MachineSwitcher — prev/next machine stepper with the machine's name between the arrows
// (SPEC-093, replaces SPEC-050's <select>; relocated by SPEC-096).
//
// SPEC-096 moved this out of the header to sit between the readout and the spin controls, and the
// name stopped being the page's <h1> — the app title reclaimed that. The name is now a plain
// labelled element: still the largest text in its band, but no longer competing with the app's
// own heading for document structure (two <h1>s on one page is the bug that would have caused).
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
      {/* The machine name. aria-live keeps the screen-reader announcement the old <select> gave
          for free; it is NOT a heading any more (SPEC-096) — the header's app title is the page's
          <h1>, and a second one here would be a document-structure bug. */}
      <span className="machine-switcher__name" aria-live="polite">
        {machines[current]?.name}
      </span>
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
