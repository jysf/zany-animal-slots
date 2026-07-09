---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-056
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-009
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-08

references:
  decisions:
    - DEC-001   # engine-no-dom: the panel is pure presentation reading the recorded stats; engine untouched
    - DEC-010   # global token CSS, no raw hex, prefixed classes
    - DEC-020   # the session-stats model + metric definitions the panel renders
  constraints:
    - touch-targets-44
    - respect-reduced-motion
    - portrait-first
  related_specs:
    - SPEC-055  # useStats()/resetStats() — the reactive stats this panel reads (shipped)
    - SPEC-054  # deriveMetrics() — the display metrics the tiles render (shipped)
    - SPEC-020  # PaytableSheet — the trigger + slide-up sheet idiom this mirrors exactly
    - SPEC-050  # MachineSelector — precedent for adding a header control (Header.tsx)

value_link: >-
  The visible half of STAGE-009's "sense of progress": an in-app session-stats panel — spins, win
  rate, net winnings, cash-ins, and biggest win — opened from the cabinet header, reading the reactive
  stats SPEC-055 records, plus a "Clear stats" control (distinct from the wallet Reset). This is the
  first surface the player actually SEES; SPEC-057 adds the winnings-over-time sparkline to it.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-08
      note: >-
        Design authored on the main Opus loop (un-metered). A pure-UI spec: no engine/simulation to
        pin — the "measure-then-pin" discipline here means pinning the DISPLAYED metric strings against
        the real deriveMetrics() (DEC-020) so the tests are transcription. Worked the derivation by hand
        against the shipped reducer: a seed record { spins 10, winningSpins 4, totalWagered 100,
        totalWon 130, biggestWin {40, wild-and-whimsical, small}, cashIns 2 } ⇒ deriveMetrics ⇒
        winRate 0.4 → "40%", net 30 → "+30", spins "10", cashIns "2", biggest "40"; empty record ⇒
        winRate "0%", net "0", biggest "—". The panel mirrors PaytableSheet (SPEC-020) 1:1 for the
        sheet/backdrop/Esc/focus idiom, so the build is a port + a 5-tile grid + a Clear-stats button.
        No new DEC (pure presentation over DEC-020's model, token-styled per DEC-010, ≥44px targets).
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null
      recorded_at: 2026-07-08
      note: >-
        Drop-ins from the spec's Notes for the Implementer transcribed verbatim: StatsSheet.tsx,
        stats.css, StatsSheet.test.tsx (6 new tests), plus the Header.tsx import/mount and the
        controls.touch-target.test.ts STATS_CSS fixture + .stats__trigger/.stats__clear entries.
        Full gate green (typecheck, lint, test — 68 files / 401 tests all passing, build, validate,
        cost-audit); `git diff main..HEAD -- src/engine/` empty. tokens_total left null — to be
        filled at ship from the build sub-agent's subagent_tokens per AGENTS §4.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null   # filled at ship from the verify sub-agent's subagent_tokens
      recorded_at: null
  totals:
    tokens_total: null
    estimated_usd: null
    session_count: 1
---

# SPEC-056: Session-stats panel UI

## Context

STAGE-009 gives the player a **visible sense of progress**. SPEC-054 (shipped) built the pure
stats model + `deriveMetrics`; SPEC-055 (shipped) made it reactive and wired recording into the game
(`useStats()` / `recordSpin` / `recordCashIn` / `resetStats`) — but there is still **no surface the
player sees**. This spec ships that surface.

It adds an in-app **session-stats panel** — a slide-up sheet opened from a cabinet-header trigger,
mirroring `PaytableSheet` (SPEC-020) exactly — rendering the numeric metric tiles (**spins**,
**win rate**, **net winnings**, **cash-ins**, **biggest win**) from `useStats()` + `deriveMetrics()`,
plus a **"Clear stats"** control that calls `resetStats()`. Clear stats is **distinct from the wallet
Reset** (which is itself a *counted* cash-in — the DEC-020 / SPEC-055 invariant): it zeroes the
session record and touches nothing else.

Pure presentation: no engine change (DEC-001 — the panel reads the stats the seam already recorded),
token-styled global CSS with no raw hex (DEC-010), ≥44px touch targets (touch-targets-44), portrait
sheet with a reduced-motion fallback (respect-reduced-motion). **No new DEC.** The winnings-over-time
**sparkline** is deliberately deferred to SPEC-057 — this spec ships the numeric view + Clear control.

## Goal

Ship a self-contained `src/ui/stats/StatsSheet.tsx` (a header trigger + slide-up dialog mirroring
`PaytableSheet`) that renders the five metric tiles from `useStats()` + `deriveMetrics()` and a
"Clear stats" button calling `resetStats()`, its token-only `stats.css`, mount it in the `Header`,
and add its trigger + clear controls to the touch-target guard. No sparkline (SPEC-057), no engine
change.

## Inputs

- **Files to read:**
  - `src/ui/PaytableSheet.tsx` + `src/ui/paytable.css` — the trigger + backdrop + slide-up sheet +
    Esc/focus/close idiom and the token CSS vocabulary to mirror 1:1.
  - `src/ui/stats/StatsProvider.tsx` — `useStats()` (returns `{ stats, resetStats, … }`).
  - `src/stats/sessionStats.ts` — `deriveMetrics()` (returns `{ spins, winRate, net, biggestWin,
    cashIns }`) and the `SessionStats` / `BiggestWin` types.
  - `src/machines/registry.ts` — `getMachine(id)` (fallback-safe) to name the biggest-win machine.
  - `src/ui/regions/Header.tsx` — where header controls (`MachineSelector`, `PaytableSheet`) mount.
  - `src/ui/controls.touch-target.test.ts` — the guard that every interactive control's CSS must
    declare `min-height` + `min-width` ≥44px.
- **Related code paths:** `src/ui/stats/` (extend), `src/ui/regions/` (Header).

## Outputs

- **Files created:**
  - `src/ui/stats/StatsSheet.tsx` — the trigger + panel component.
  - `src/ui/stats/stats.css` — token-only styles (trigger, backdrop, slide-up sheet, tile grid, clear).
  - `src/ui/stats/StatsSheet.test.tsx` — interaction + rendering tests.
- **Files modified:**
  - `src/ui/regions/Header.tsx` — render `<StatsSheet />` in `.cabinet__header-controls`.
  - `src/ui/controls.touch-target.test.ts` — add a `STATS_CSS` fixture and the `.stats__trigger` +
    `.stats__clear` entries to `CONTROLS`.
- **New exports:** `StatsSheet.tsx`: `StatsSheet`.
- **Database changes:** none.

## Acceptance Criteria

Testable outcomes. Cover happy path, error cases, edge cases.

- [ ] The panel is **closed by default** and always renders a header trigger button named
      "Session stats"; clicking it opens a `role="dialog"` (aria-label "Session stats").
- [ ] Open, the panel renders **five metric tiles** from `deriveMetrics(useStats().stats)`:
      **spins**, **win rate** (`Math.round(winRate*100)`+"%"), **net winnings** (signed: `+N` / `0` /
      `-N`), **cash-ins**, and **biggest win** (the amount, subtitled with the producing machine name +
      tier; a **"—"** when there is no win yet).
- [ ] For a seeded record `{ spins 10, winningSpins 4, totalWagered 100, totalWon 130, biggestWin
      {40, 'wild-and-whimsical', 'small'}, cashIns 2 }` the tiles read: spins **10**, win rate
      **40%**, net **+30**, cash-ins **2**, biggest **40**.
- [ ] For the **empty record**, win rate reads **0%**, net reads **0**, and biggest win reads **—**
      (no divide-by-zero, no crash).
- [ ] **"Clear stats"** calls `resetStats()` — the tiles immediately re-render to zeros/"—" and
      `readStats()` deep-equals `emptyStats()`. It does **not** touch balance/bet/active-machine.
- [ ] The sheet **closes** on the ✕ button, on backdrop click, and on Escape (mirrors `PaytableSheet`).
- [ ] **A11y / boundaries:** trigger, close, and Clear are ≥44px (touch-targets-44 guard extended);
      `stats.css` has **no raw hex** (DEC-010) and a `prefers-reduced-motion` fallback; the engine is
      untouched (`git diff main..HEAD -- src/engine/` EMPTY, DEC-001); no new dependency. Full gate green.

## Failing Tests

Written during **design**, BEFORE build. Pinned metric strings were derived by hand against the
shipped `deriveMetrics()` (DEC-020); the sheet-interaction tests mirror `PaytableSheet.test.tsx`.

- **`src/ui/stats/StatsSheet.test.tsx`** *(render/fireEvent; `localStorage.clear()` in `beforeEach`;
  seed via `writeStats` + `StatsProvider` hydration)*
  - `"is closed by default; the trigger is present"` — `render(<StatsSheet />)`; `queryByRole('dialog')`
    is null; `getByRole('button', { name: /session stats/i })` is truthy.
  - `"opens on trigger click and shows the metric tiles"` — `writeStats(SEEDED)`; render `<StatsSheet />`
    inside `<StatsProvider>`; click the trigger; assert `getByRole('dialog')` truthy and
    `getByTestId('stat-spins').textContent === '10'`, `stat-winrate === '40%'`, `stat-net === '+30'`,
    `stat-cashins === '2'`, `stat-biggest === '40'`. (`SEEDED = { ...emptyStats(), spins: 10,
    winningSpins: 4, totalWagered: 100, totalWon: 130, biggestWin: { amount: 40, machineId:
    'wild-and-whimsical', tier: 'small' }, cashIns: 2, series: [10, -5, 30] }`.)
  - `"shows an em dash for biggest win in the empty state"` — render `<StatsSheet />` inside a
    `<StatsProvider>` with clean storage; open; assert `stat-biggest === '—'`, `stat-spins === '0'`,
    `stat-winrate === '0%'`.
  - `"Clear stats zeroes the record and persists emptyStats"` — `writeStats(SEEDED)`; render inside
    `<StatsProvider>`; open (assert `stat-spins === '10'`); click `getByRole('button', { name:
    /clear stats/i })`; assert `stat-spins === '0'`, `stat-biggest === '—'`, and
    `readStats()` deep-equals `emptyStats()`.
  - `"closes on the ✕ button"` — mirror `PaytableSheet`: open, click `getByRole('button', { name:
    /close/i })`, `queryByRole('dialog')` null.
  - `"closes on backdrop click and on Escape"` — open, click `getByTestId('stats-backdrop')` ⇒ closed;
    re-open, `fireEvent.keyDown(document, { key: 'Escape' })` ⇒ closed.

- **`src/ui/controls.touch-target.test.ts`** *(extend the existing guard)*
  - Add `.stats__trigger` and `.stats__clear` (from `stats.css`) to `CONTROLS`; the existing single
    test then asserts each declares `min-height` **and** `min-width` at a 44px-equivalent
    (`var(--space-7)`).

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-001` — engine-no-dom: the panel is pure presentation; it reads `useStats().stats` (already
  recorded by SPEC-055) and derives display metrics. `git diff main..HEAD -- src/engine/` MUST be empty.
- `DEC-010` — global token CSS: `stats.css` uses only `var(--…)` tokens, prefixed `stats__*` classes,
  **no raw hex**. Mirror `paytable.css`.
- `DEC-020` — the metric definitions rendered (win rate, net, biggest win, cash-ins) come straight from
  `deriveMetrics`; the panel does not redefine them.

### Constraints that apply

- `touch-targets-44` — trigger, close, and Clear declare `min-height`/`min-width: var(--space-7)`.
- `respect-reduced-motion` — the slide-up animation drops under `@media (prefers-reduced-motion: reduce)`.
- `portrait-first` — the sheet anchors to the bottom and reads at 375–430px; the tile grid is 2-up.

### Prior related work

- `SPEC-020` (shipped) — `PaytableSheet` + `paytable.css`: copy the sheet/backdrop/Esc/focus idiom and
  the CSS token vocabulary verbatim, renaming `paytable__*` → `stats__*`.
- `SPEC-055` (shipped) — `useStats()` exposes `{ stats, resetStats }` the panel consumes.
- `SPEC-050` (shipped) — precedent for mounting a new control in `Header.tsx`.

### Out of scope (for this spec specifically)

- The winnings-over-time **sparkline** — that is **SPEC-057** (it renders `stats.series` into this panel).
- Any change to the stats model / storage / recording seam (SPEC-054/055 are shipped/frozen).
- A **per-machine** stats breakdown (deferred by DEC-020).
- Any engine or `SpinResult` change (DEC-001).

## Notes for the Implementer

Port `PaytableSheet.tsx` → `StatsSheet.tsx` and `paytable.css` → `stats.css`, renaming the `paytable__`
prefix to `stats__`. Keep the component self-contained (owns its `open` state; always renders the
trigger). Read `{ stats, resetStats } = useStats()` and `const metrics = deriveMetrics(stats)`.
`getMachine(...)` is fallback-safe for an unknown `machineId`. Give each tile value a `data-testid`
(`stat-spins`, `stat-winrate`, `stat-net`, `stat-cashins`, `stat-biggest`) so the tests are precise.

**Adversarial guard-mutations to run in verify** (each should break the named test; revert after):
1. In `formatNet`, drop the `+` (return `String(net)` always) → breaks the `stat-net === '+30'` assertion.
2. Change the "Clear stats" `onClick` from `resetStats` to a no-op `() => {}` → breaks the "Clear stats
   zeroes the record" test.
3. In the biggest-win empty branch, render `0` instead of `—` → breaks the "em dash" empty-state test.
4. Remove `min-width: var(--space-7)` from `.stats__trigger` in `stats.css` → breaks the touch-target guard.

### `src/ui/stats/StatsSheet.tsx` (drop-in)

```tsx
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
      <button className="stats__trigger" aria-label="Session stats" onClick={() => setOpen(true)}>
        📊 Stats
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
```

### `src/ui/stats/stats.css` (drop-in)

```css
/*
 * Session-stats panel — trigger + overlay + slide-up sheet (SPEC-056).
 *
 * DEC-010: global CSS, token colors only, no raw hex, prefixed classes.
 * constraint: touch-targets-44 — trigger, close, and Clear are ≥44px.
 * constraint: respect-reduced-motion — slide-up drops under reduced motion.
 * constraint: portrait-first — sheet anchored to the bottom; tiles 2-up.
 *
 * Mirrors paytable.css (SPEC-020), prefix stats__.
 */

/* ─── Trigger button ─────────────────────────────────────────────────────────── */

.stats__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--space-7);
  min-width: var(--space-7);
  padding: var(--space-1) var(--space-3);

  background: transparent;
  border: 1px solid var(--color-text-muted);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  cursor: pointer;
  flex-shrink: 0;
}

.stats__trigger:hover,
.stats__trigger:focus-visible {
  color: var(--color-text);
  border-color: var(--color-text);
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ─── Backdrop ───────────────────────────────────────────────────────────────── */

.stats__backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--color-bg);
  opacity: 0.7;
  z-index: 10;
}

/* ─── Slide-up keyframe + sheet ──────────────────────────────────────────────── */

@keyframes stats-slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.stats__sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 11;

  background-color: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-5) var(--space-4) var(--space-6);

  animation: stats-slide-up 0.25s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .stats__sheet {
    animation: none;
  }
}

/* ─── Header row (title + close) ─────────────────────────────────────────────── */

.stats__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.stats__title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.stats__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--space-7);
  min-width: var(--space-7);

  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: pointer;
}

.stats__close:hover,
.stats__close:focus-visible {
  color: var(--color-text);
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ─── Metric tile grid (2-up, portrait-first) ────────────────────────────────── */

.stats__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.stats__tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-2);
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  text-align: center;
}

/* The biggest-win tile spans both columns (it carries a longer subtitle). */
.stats__tile--wide {
  grid-column: 1 / -1;
}

.stats__tile-value {
  font-family: var(--font-family-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-coin);
  font-variant-numeric: tabular-nums;
}

.stats__tile-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ─── Clear-stats control + note ─────────────────────────────────────────────── */

.stats__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--space-7);
  min-width: var(--space-7);
  width: 100%;
  margin-top: var(--space-5);
  padding: var(--space-2) var(--space-4);

  background: transparent;
  border: 1px solid var(--color-text-muted);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.stats__clear:hover,
.stats__clear:focus-visible {
  color: var(--color-text);
  border-color: var(--color-text);
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.stats__note {
  margin-top: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  line-height: var(--line-height-base);
}
```

### `src/ui/stats/StatsSheet.test.tsx` (drop-in)

```tsx
// StatsSheet interaction + rendering tests — SPEC-056 failing tests (written at design).
// render/fireEvent (no userEvent). Seeds stats via writeStats + StatsProvider hydration.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsSheet } from './StatsSheet';
import { StatsProvider } from './StatsProvider';
import { emptyStats, type SessionStats } from '../../stats/sessionStats';
import { readStats, writeStats } from '../../stats/statsStorage';

const SEEDED: SessionStats = {
  ...emptyStats(),
  spins: 10,
  winningSpins: 4,
  totalWagered: 100,
  totalWon: 130,
  biggestWin: { amount: 40, machineId: 'wild-and-whimsical', tier: 'small' },
  cashIns: 2,
  series: [10, -5, 30],
};

describe('StatsSheet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is closed by default; the trigger is present', () => {
    render(<StatsSheet />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /session stats/i })).toBeTruthy();
  });

  it('opens on trigger click and shows the metric tiles', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByTestId('stat-spins').textContent).toBe('10');
    expect(screen.getByTestId('stat-winrate').textContent).toBe('40%');
    expect(screen.getByTestId('stat-net').textContent).toBe('+30');
    expect(screen.getByTestId('stat-cashins').textContent).toBe('2');
    expect(screen.getByTestId('stat-biggest').textContent).toBe('40');
  });

  it('shows an em dash for biggest win in the empty state', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    expect(screen.getByTestId('stat-biggest').textContent).toBe('—');
    expect(screen.getByTestId('stat-spins').textContent).toBe('0');
    expect(screen.getByTestId('stat-winrate').textContent).toBe('0%');
  });

  it('Clear stats zeroes the record and persists emptyStats', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    expect(screen.getByTestId('stat-spins').textContent).toBe('10');

    fireEvent.click(screen.getByRole('button', { name: /clear stats/i }));
    expect(screen.getByTestId('stat-spins').textContent).toBe('0');
    expect(screen.getByTestId('stat-biggest').textContent).toBe('—');
    expect(readStats()).toEqual(emptyStats());
  });

  it('closes on the ✕ button', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on backdrop click and on Escape', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    fireEvent.click(screen.getByTestId('stats-backdrop'));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
```

### `src/ui/regions/Header.tsx` (edit)

Add the import and render `<StatsSheet />` after `<PaytableSheet />`:

```tsx
import { StatsSheet } from '../stats/StatsSheet';
// …
        <MachineSelector />
        <MuteToggle muted={muted} onToggle={onToggleMute} />
        <PaytableSheet />
        <StatsSheet />
```

### `src/ui/controls.touch-target.test.ts` (edit)

Add the fixture + two `CONTROLS` entries (the existing single test then covers them):

```ts
const STATS_CSS = resolve(__dirname, 'stats/stats.css');
const statsCss = readFileSync(STATS_CSS, 'utf-8');
// …in CONTROLS:
  { label: '.stats__trigger (stats.css)', cssSource: statsCss, selector: '.stats__trigger' },
  { label: '.stats__clear (stats.css)',   cssSource: statsCss, selector: '.stats__clear' },
```

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-056-session-stats-panel`
- **PR (if applicable):** none yet — local-only build cycle
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — pure presentation over DEC-020, token-styled (DEC-010)
- **Deviations from spec:**
  - none — the three drop-in files and the `Header.tsx` / `controls.touch-target.test.ts` edits
    were transcribed verbatim from the spec's Notes for the Implementer.
- **Follow-up work identified:**
  - none new — SPEC-057 (winnings-over-time sparkline into this same panel) is already backlogged.

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing; the spec's Notes for the Implementer contained complete drop-in code for all three
   new files plus the exact edits for `Header.tsx` and `controls.touch-target.test.ts`, so the build
   was a transcription + gate-run exercise, not a design decision exercise.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. DEC-001 (engine untouched), DEC-010 (token-only CSS), and DEC-020 (metric definitions)
   were all correctly scoped and sufficient; the touch-targets-44 and respect-reduced-motion
   constraints were already baked into the drop-in CSS.

3. **If you did this task again, what would you do differently?**
   — Nothing procedurally different. The one thing worth double-checking mechanically (and which I
   did check) is that the em dash character used in the empty-state biggest-win render and in the
   pinned test assertion is the same U+2014 codepoint — a design/build session split makes that an
   easy silent mismatch if the drop-in weren't transcribed byte-for-byte.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
