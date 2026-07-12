// How-to-play explainer — trigger + slide-up overlay sheet + first-run auto-open (SPEC-060, DEC-022).
// One sheet, two entry points: a persistent "How to play" header trigger AND an auto-open-once on
// first run. "First run" = the SPEC-059 seam reporting seen === false at mount (useHelpSeen); the
// sheet marks seen on FIRST DISMISS (DEC-022) so it never nags on reload. Mirrors StatsSheet/
// PaytableSheet 1:1 for the sheet/backdrop/Esc/focus idiom.
// DEC-010: global CSS via help.css, token colors only, no raw hex, help__-prefixed classes.
// DEC-004: slide-up animation; reduced-motion fallback in help.css.
// DEC-001: pure presentation — static copy; reads no engine state; the engine is untouched.
// DEC-005: the only persisted state is the seen flag (via the seam), best-effort, never throws.
// constraint: touch-targets-44 — trigger and close are ≥44px.
import { useState, useEffect, useRef } from 'react';
import { useHelpSeen } from './HelpSeenProvider';
import './help.css';

export function HelpSheet() {
  const { seen, markSeen } = useHelpSeen();
  // Auto-open once on first run: initialise `open` from the mount-time seen value. The provider
  // hydrates `seen` synchronously, so this reflects the real first-run state on the first render.
  // Provider-less consumers (App.test) get the default seen:true ⇒ open:false ⇒ no auto-open.
  const [open, setOpen] = useState(() => !seen);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Mark seen on FIRST dismiss (DEC-022) — idempotent, so re-opening via the trigger and closing
  // again is harmless (markSeen() just re-sets true / re-persists).
  function close() {
    setOpen(false);
    markSeen();
  }

  // Focus the close button when the sheet opens (basic dialog a11y).
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  // Close on Esc while the sheet is open.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* Always-rendered trigger — does NOT shift game layout when the sheet is closed. */}
      <button
        className="help__trigger"
        aria-label="How to play"
        title="How to play"
        onClick={() => setOpen(true)}
      >
        ❓
      </button>

      {open && (
        <>
          <div className="help__backdrop" onClick={close} data-testid="help-backdrop" />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="How to play"
            className="help__sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="help__header">
              <h2 className="help__title">How to play</h2>
              <button ref={closeRef} className="help__close" aria-label="Close" onClick={close}>
                ✕
              </button>
            </div>

            <section className="help__section" aria-label="The goal">
              <h3 className="help__section-title">The goal</h3>
              <p className="help__text" data-testid="help-goal">
                Spin the reels and match animals left-to-right. Line up{' '}
                <strong>3 or more of the same animal starting from the leftmost reel</strong> on a
                payline to win.
              </p>
            </section>

            <section className="help__section" aria-label="Controls">
              <h3 className="help__section-title">Controls</h3>
              <dl className="help__list">
                <div className="help__item">
                  <dt className="help__term">Spin</dt>
                  <dd className="help__desc">Play one round at your current bet.</dd>
                </div>
                <div className="help__item">
                  <dt className="help__term">− / +</dt>
                  <dd className="help__desc">Lower or raise your bet.</dd>
                </div>
                <div className="help__item">
                  <dt className="help__term">Auto</dt>
                  <dd className="help__desc">Spin hands-free until you stop it or funds run low.</dd>
                </div>
                <div className="help__item">
                  <dt className="help__term">Reset</dt>
                  <dd className="help__desc">Top your play-money balance back up (a fresh cash-in).</dd>
                </div>
              </dl>
            </section>

            <section className="help__section" aria-label="Where to find things">
              <h3 className="help__section-title">Where to find things</h3>
              <dl className="help__list">
                <div className="help__item">
                  <dt className="help__term">💰 Paytable</dt>
                  <dd className="help__desc">What each animal pays and how paylines work.</dd>
                </div>
                <div className="help__item">
                  <dt className="help__term">Machines</dt>
                  <dd className="help__desc">Switch between animal machines in the header.</dd>
                </div>
                <div className="help__item">
                  <dt className="help__term">📊 Stats</dt>
                  <dd className="help__desc">Your spins, win rate, and net winnings.</dd>
                </div>
                <div className="help__item">
                  <dt className="help__term">🔊</dt>
                  <dd className="help__desc">Mute or unmute the sounds.</dd>
                </div>
              </dl>
            </section>

            <p className="help__disclaimer" data-testid="help-disclaimer">
              Zany Animal Slots is <strong>play-money only</strong> — no real money, no wagering, no
              payouts.
            </p>
          </div>
        </>
      )}
    </>
  );
}
