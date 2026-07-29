// Header region — branding bar at the top of the cabinet.
// SPEC-096: the app title is BACK as the header's headline. SPEC-093 had promoted the machine
// name into this slot, which cost the app its identity in its own header; the switcher moved down
// to sit between the readout and the spin controls (App.tsx) — nearer the thumb, and next to the
// other things you actually press.
// Renders PaytableSheet trigger (SPEC-020), MuteToggle (SPEC-026), StatsSheet (SPEC-056).
import { PaytableSheet } from '../PaytableSheet';
import { StatsSheet } from '../stats/StatsSheet';
import { HelpSheet } from '../help/HelpSheet';
import MuteToggle from '../audio/MuteToggle';
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
      <h1 className="cabinet__title">
        {/* Decorative flanking slot emoji — aria-hidden so the accessible name stays
            "Zany Animal Slots", not "slot machine Zany Animal Slots slot machine". */}
        <span className="cabinet__title-emoji" aria-hidden="true">🎰</span>
        <span className="cabinet__title-text">Zany Animal Slots</span>
        <span className="cabinet__title-emoji" aria-hidden="true">🎰</span>
      </h1>
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
