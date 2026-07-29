// Header region — branding bar at the top of the cabinet.
// SPEC-093: the MachineSwitcher IS the headline row — the machine name replaced the static
// "Zany Animal Slots" title as the header's prominent element, and the controls cluster below
// dropped from five items to four icons. The app name still lives in the document title, the
// Paytable "About" block, and the Help sheet.
// Also renders PaytableSheet trigger (SPEC-020), MuteToggle (SPEC-026), StatsSheet (SPEC-056).
import { PaytableSheet } from '../PaytableSheet';
import { StatsSheet } from '../stats/StatsSheet';
import { HelpSheet } from '../help/HelpSheet';
import MuteToggle from '../audio/MuteToggle';
import MachineSwitcher from '../machine/MachineSwitcher';
import AdSettingsSheet from '../ads/AdSettingsSheet';

interface HeaderProps {
  muted: boolean;
  onToggleMute: () => void;
  /** PROJ-004: show the owner's ad-settings gear (only when ?ads=1). */
  adAdmin?: boolean;
}

export default function Header({ muted, onToggleMute, adAdmin = false }: HeaderProps) {
  return (
    <header className="cabinet__header">
      <MachineSwitcher />
      <div className="cabinet__header-controls">
        <MuteToggle muted={muted} onToggle={onToggleMute} />
        <PaytableSheet />
        <StatsSheet />
        <HelpSheet />
        {adAdmin && <AdSettingsSheet />}
      </div>
    </header>
  );
}
