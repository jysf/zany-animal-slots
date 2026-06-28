// Header region — branding bar at the top of the cabinet.
// Renders the PaytableSheet trigger (SPEC-020) and MuteToggle (SPEC-026)
// alongside the title.
import { PaytableSheet } from '../PaytableSheet';
import MuteToggle from '../audio/MuteToggle';

interface HeaderProps {
  muted: boolean;
  onToggleMute: () => void;
}

export default function Header({ muted, onToggleMute }: HeaderProps) {
  return (
    <header className="cabinet__header">
      <h1 className="cabinet__title">Zany Animal Slots</h1>
      <div className="cabinet__header-controls">
        <MuteToggle muted={muted} onToggle={onToggleMute} />
        <PaytableSheet />
      </div>
    </header>
  );
}
