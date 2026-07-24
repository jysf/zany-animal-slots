// "Your record" panel — trigger + slide-up overlay sheet (SPEC-056; renamed + reorganized
// in SPEC-079; split into Trophies/Numbers tabs in SPEC-080). Self-contained: owns its own
// open state; always renders the trigger. Mirrors PaytableSheet (SPEC-020) 1:1 for the
// sheet/backdrop/Esc/focus idiom. Reads the reactive session stats from useStats()
// (SPEC-055) and derives the display metrics via deriveMetrics() (SPEC-054, DEC-020).
// SPEC-080: the trophy case and the numeric tiles/drought/sparkline are now separate tabs
// (ARIA tab pattern) so neither is buried behind a full-page scroll — only the selected
// panel's content is mounted, the other is genuinely absent from the DOM. Clear record +
// its note live OUTSIDE the tabpanels since they clear both. Tab state is ephemeral
// component state (no localStorage key) — reopening the sheet always returns to Trophies.
// "Clear record" calls resetStats() — DISTINCT from the wallet Reset (which is a counted
// cash-in, DEC-020); it also clears topWins, since DEC-024 keeps trophies in the same
// persisted blob.
// DEC-010: global CSS via stats.css, token colors only, no raw hex, prefixed classes.
// DEC-001: pure presentation — reads the stats the seam already recorded; engine untouched.
// constraint: touch-targets-44 — trigger, close, tabs, and Clear are ≥44px.
import { useState, useEffect, useRef } from 'react';
import { useStats } from './StatsProvider';
import { deriveMetrics } from '../../stats/sessionStats';
import { Sparkline } from './Sparkline';
import TrophyCase from '../trophies/TrophyCase';
import './stats.css';

/** Signed net winnings for display: 0 → "0", positive → "+N", negative keeps its "-". */
function formatNet(net: number): string {
  return net > 0 ? `+${net}` : String(net);
}

type StatsTab = 'trophies' | 'numbers';

export function StatsSheet() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<StatsTab>('trophies');
  const closeRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
  }

  // Focus the close button when the sheet opens (basic dialog a11y).
  useEffect(() => {
    if (open) {
      closeRef.current?.focus();
    }
  }, [open]);

  // Tab state is ephemeral: the sheet body unmounts on close (guarded by `open &&`
  // below), so `tab` living in this same component naturally resets to its initial
  // 'trophies' value on remount. This effect is a belt-and-braces reset in case that
  // ever stops being true (e.g. the sheet body becomes always-mounted) — reopening
  // must always land on Trophies, never wherever the user left off.
  useEffect(() => {
    if (!open) {
      setTab('trophies');
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

  const { stats, resetStats } = useStats();
  const metrics = deriveMetrics(stats);
  const winRatePct = Math.round(metrics.winRate * 100);

  // Spins since the most recent trophy. topWins[0] is the LARGEST win, not the most recent —
  // use the max spinIndex across trophies for "most recent" (Notes for the Implementer).
  const lastTrophySpin = stats.topWins.length
    ? Math.max(...stats.topWins.map((t) => t.spinIndex))
    : null;
  const drought = lastTrophySpin === null ? null : Math.max(0, stats.spins - lastTrophySpin);

  return (
    <>
      {/* Always-rendered trigger — does NOT shift game layout when the sheet is closed. */}
      <button
        className="stats__trigger"
        aria-label="Your record"
        title="Your record"
        onClick={() => setOpen(true)}
      >
        📊
      </button>

      {open && (
        <>
          <div className="stats__backdrop" onClick={close} data-testid="stats-backdrop" />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Your record"
            className="stats__sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="stats__header">
              <h2 className="stats__title">Your record</h2>
              <button ref={closeRef} className="stats__close" aria-label="Close" onClick={close}>
                ✕
              </button>
            </div>

            <div className="stats__tabs" role="tablist" aria-label="Record sections">
              <button
                type="button"
                role="tab"
                id="stats-tab-trophies"
                aria-selected={tab === 'trophies'}
                aria-controls="stats-panel-trophies"
                className="stats__tab"
                onClick={() => setTab('trophies')}
              >
                Trophies
              </button>
              <button
                type="button"
                role="tab"
                id="stats-tab-numbers"
                aria-selected={tab === 'numbers'}
                aria-controls="stats-panel-numbers"
                className="stats__tab"
                onClick={() => setTab('numbers')}
              >
                Numbers
              </button>
            </div>

            {tab === 'trophies' && (
              <div
                role="tabpanel"
                id="stats-panel-trophies"
                aria-labelledby="stats-tab-trophies"
                className="stats__panel"
              >
                <TrophyCase topWins={stats.topWins} spins={stats.spins} />
              </div>
            )}

            {tab === 'numbers' && (
              <div
                role="tabpanel"
                id="stats-panel-numbers"
                aria-labelledby="stats-tab-numbers"
                className="stats__panel"
              >
                <div className="stats__grid">
                  <div className="stats__tile">
                    <span className="stats__tile-value" data-testid="stat-spins">
                      {metrics.spins}
                    </span>
                    <span className="stats__tile-label">Spins</span>
                  </div>

                  <div className="stats__tile">
                    <span className="stats__tile-value" data-testid="stat-winrate">
                      {winRatePct}%
                    </span>
                    <span className="stats__tile-label">Win rate</span>
                  </div>

                  <div className="stats__tile">
                    <span className="stats__tile-value" data-testid="stat-net">
                      {formatNet(metrics.net)}
                    </span>
                    <span className="stats__tile-label">Net winnings</span>
                  </div>

                  <div className="stats__tile">
                    <span className="stats__tile-value" data-testid="stat-cashins">
                      {metrics.cashIns}
                    </span>
                    <span className="stats__tile-label">Cash-ins</span>
                  </div>

                  {drought !== null && (
                    <div className="stats__tile stats__tile--wide">
                      <span className="stats__tile-value" data-testid="stat-drought">
                        {drought}
                      </span>
                      <span className="stats__tile-label">Spins since last trophy</span>
                    </div>
                  )}
                </div>

                <div className="stats__sparkline-wrap">
                  <span className="stats__sparkline-label">Winnings over time</span>
                  <Sparkline series={stats.series} />
                </div>
              </div>
            )}

            <button className="stats__clear" onClick={resetStats}>
              Clear record
            </button>
            <p className="stats__note">
              Clears this browser&rsquo;s record — trophies included. Your balance and machine
              are untouched.
            </p>
          </div>
        </>
      )}
    </>
  );
}
