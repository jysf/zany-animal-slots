// Header region — branding bar at the top of the cabinet.
// Renders the MachineSelector (SPEC-050), PaytableSheet trigger (SPEC-020),
// MuteToggle (SPEC-026), and StatsSheet trigger (SPEC-056) alongside the title.
import { PaytableSheet } from '../PaytableSheet';
import { StatsSheet } from '../stats/StatsSheet';
import MuteToggle from '../audio/MuteToggle';
import MachineSelector from '../machine/MachineSelector';

interface HeaderProps {
  muted: boolean;
  onToggleMute: () => void;
}

export default function Header({ muted, onToggleMute }: HeaderProps) {
  return (
    <header className="cabinet__header">
      <h1 className="cabinet__title">Zany Animal Slots</h1>
      <div className="cabinet__header-controls">
        <MachineSelector />
        <MuteToggle muted={muted} onToggle={onToggleMute} />
        <PaytableSheet />
        <StatsSheet />
      </div>
    </header>
  );
}
