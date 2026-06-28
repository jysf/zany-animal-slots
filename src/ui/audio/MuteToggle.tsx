// MuteToggle.tsx — 🔊/🔇 header button (SPEC-026).
// DEC-010: token-only styling via audio.css.
// constraint: touch-targets-44 — ≥44px via .mute-toggle in audio.css.
import './audio.css';

export default function MuteToggle({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="mute-toggle"
      aria-pressed={muted}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      onClick={onToggle}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
