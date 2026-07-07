// MachineSelector — header control to switch the active machine (SPEC-050).
// Lists the registry's machines and drives SPEC-049's setActiveMachineId; a switch
// re-renders reels + paytable + theme + audio together and persists (DEC-015).
// DEC-001: pure UI. DEC-010: token-only styling via machine-selector.css.
// constraint touch-targets-44: .machine-selector is ≥44px.
import { listMachines } from '../../machines/registry';
import { useActiveMachine } from './MachineProvider';
import './machine-selector.css';

export default function MachineSelector() {
  const { activeMachineId, setActiveMachineId } = useActiveMachine();
  const machines = listMachines();

  return (
    <select
      className="machine-selector"
      aria-label="Machine"
      value={activeMachineId}
      onChange={(e) => setActiveMachineId(e.target.value)}
    >
      {machines.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
