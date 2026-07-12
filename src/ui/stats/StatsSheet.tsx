// Session-stats panel — trigger + slide-up overlay sheet (SPEC-056).
// Self-contained: owns its own open state; always renders the trigger. Mirrors
// PaytableSheet (SPEC-020) 1:1 for the sheet/backdrop/Esc/focus idiom. Reads the
// reactive session stats from useStats() (SPEC-055) and derives the display
// metrics via deriveMetrics() (SPEC-054, DEC-020). "Clear stats" calls resetStats()
// — DISTINCT from the wallet Reset (which is a counted cash-in, DEC-020).
// DEC-010: global CSS via stats.css, token colors only, no raw hex, prefixed classes.
// DEC-001: pure presentation — reads the stats the seam already recorded; engine untouched.
// constraint: touch-targets-44 — trigger, close, and Clear are ≥44px.
import { useState, useEffect, useRef } from 'react';
import { useStats } from './StatsProvider';
import { deriveMetrics } from '../../stats/sessionStats';
import { getMachine } from '../../machines/registry';
import { Sparkline } from './Sparkline';
import './stats.css';

/** Signed net winnings for display: 0 → "0", positive → "+N", negative keeps its "-". */
function formatNet(net: number): string {
  return net > 0 ? `+${net}` : String(net);
}

export function StatsSheet() {
  const [open, setOpen] = useState(false);
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

  return (
    <>
      {/* Always-rendered trigger — does NOT shift game layout when the sheet is closed. */}
      <button
        className="stats__trigger"
        aria-label="Session stats"
        title="Session stats"
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
            aria-label="Session stats"
            className="stats__sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="stats__header">
              <h2 className="stats__title">Session stats</h2>
              <button ref={closeRef} className="stats__close" aria-label="Close" onClick={close}>
                ✕
              </button>
            </div>

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

              <div className="stats__tile stats__tile--wide">
                {metrics.biggestWin ? (
                  <>
                    <span className="stats__tile-value" data-testid="stat-biggest">
                      {metrics.biggestWin.amount}
                    </span>
                    <span className="stats__tile-label">
                      Biggest win — {getMachine(metrics.biggestWin.machineId).name} ·{' '}
                      {metrics.biggestWin.tier}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="stats__tile-value" data-testid="stat-biggest">
                      —
                    </span>
                    <span className="stats__tile-label">Biggest win</span>
                  </>
                )}
              </div>
            </div>

            <div className="stats__sparkline-wrap">
              <span className="stats__sparkline-label">Winnings over time</span>
              <Sparkline series={stats.series} />
            </div>

            <button className="stats__clear" onClick={resetStats}>
              Clear stats
            </button>
            <p className="stats__note">
              Clears this browser&rsquo;s session record only. Your balance and machine are untouched.
            </p>
          </div>
        </>
      )}
    </>
  );
}
