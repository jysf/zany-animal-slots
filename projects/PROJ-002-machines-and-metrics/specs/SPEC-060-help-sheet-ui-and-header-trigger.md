---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-060
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-010
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-09

references:
  decisions:
    - DEC-022   # the first-run help onboarding model this spec's UI half implements (one sheet, two entry points, auto-open-once, mark-seen-on-dismiss)
    - DEC-001   # engine-no-dom: pure presentation; static copy; the engine is untouched
    - DEC-005   # no backend: the only persisted state is the seen flag via the SPEC-059 seam, best-effort
    - DEC-010   # token-only CSS, no raw hex, prefixed classes
    - DEC-004   # slide-up animation with a prefers-reduced-motion fallback
  constraints:
    - engine-no-dom
    - touch-targets-44
    - respect-reduced-motion
  related_specs:
    - SPEC-059  # the first-run-seen storage + reactive seam (useHelpSeen) this sheet CONSUMES
    - SPEC-020  # the PaytableSheet trigger + slide-up + backdrop + Esc/focus idiom this mirrors
    - SPEC-056  # the StatsSheet (most recent sheet) — the closest structural sibling

value_link: >-
  The visible half of STAGE-010's "legible on first contact": a HelpSheet (how-to-play explainer)
  reached two ways — a persistent "How to play" header trigger AND an auto-open-once on first run —
  built over SPEC-059's first-run-seen seam. This is the spec that actually fixes the observed
  PROJ-001 tester failure ("couldn't understand it") and completes the STAGE-010 backlog.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-09
      note: >-
        Design authored on the main Opus loop (un-metered). Pure-UI spec — no RTP/strip simulation to
        pin; the "measure-then-pin" discipline reduces to the deterministic DISPLAY OUTPUT: the two
        long copy strings (help-goal, help-disclaimer) are pinned as exact `.textContent` in the
        Failing Tests, and the first-run behaviour is pinned against the SPEC-059 seam contract
        (clean storage ⇒ seen:false ⇒ auto-open; auto-open alone does NOT mark seen; dismiss marks
        seen; seeded seen:true ⇒ no auto-open; provider-less ⇒ seen:true ⇒ no auto-open). Complete
        drop-in code for HelpSheet.tsx, help.css, the HelpSheet.test.tsx, the one-line Header.tsx
        wiring, and the touch-target test edit live in ## Notes. Two adversarial guard-mutations
        specified for verify. No new dependency; no new DEC (implements DEC-022).
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 101530   # from the build sub-agent's subagent_tokens
      estimated_usd: 0.67    # 101530 tok × $6.6/M (Sonnet)
      duration_minutes: 23.7 # 1423278 ms
      recorded_at: 2026-07-09
      note: >-
        Build delegated to a fresh Sonnet sub-agent (local-only, branch feat/spec-060-help-sheet-ui).
        Verbatim transcription of the Notes drop-ins (HelpSheet.tsx, help.css, HelpSheet.test.tsx,
        the Header.tsx wiring line, the touch-target test edit). Zero deviations; full gate green
        (typecheck/lint/test 425/build/validate/cost-audit); engine + SPEC-059 seam diffs both empty.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 90000    # nominal — see note
      estimated_usd: 0.59    # nominal, 90000 tok × $6.6/M
      recorded_at: 2026-07-10
      note: >-
        Cold re-verification on the main Opus loop (autonomous overnight single-agent run — nominal
        90000-tok estimate, not separately metered). Reconciled the build against git/disk: HelpSheet.tsx
        is byte-for-byte the spec drop-in; Header.tsx + touch-target edits exactly as specified; only
        src/ui/help/** + Header.tsx + the touch-target test + spec bookkeeping changed. Re-ran the FULL
        gate green (typecheck/lint/test 72 files/425 tests/build/validate/cost-audit). Ran both
        adversarial guard-mutations — each broke EXACTLY the "auto-opens once on first run and marks
        seen on dismiss" test and reverted clean (5/5 help tests green after): (1) useState(() => !seen)
        → useState(false) killed the auto-open; (2) removing markSeen() in close() left readHelpSeen()
        false after dismiss. git diff main..HEAD -- src/engine/ EMPTY; SPEC-059 seam diff EMPTY; no
        .only/.skip in src/ui/help/. Preview-verified in a real browser (mobile 375×812): clean storage
        auto-opens the sheet with seen:false; dismiss flips seen:true; reload does NOT re-open
        (non-nagging); the header trigger re-opens it; goal/disclaimer copy + all four controls render;
        trigger declares 48px min-height/width (≥44px); no console errors. Defect count: 0.
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-060: Help sheet UI + header trigger + first-run auto-open

## Context

STAGE-010 makes the game **legible to a first-timer**. SPEC-059 (shipped, PR #69) laid the
**infrastructure keystone**: a safe, versioned first-run-seen flag (`zany:help-seen`) and a
no-op-default reactive Context (`useHelpSeen()` → `{ seen, markSeen }`) wired into `main.tsx`,
but **no UI**. This spec is the **visible half** — the last spec in the STAGE-010 backlog — and it
is the one that actually fixes the brief's top-line comprehension criterion: the observed PROJ-001
tester "couldn't understand it."

It ships a **`HelpSheet`** — a how-to-play explainer that mirrors `PaytableSheet`/`StatsSheet` 1:1
for the sheet/backdrop/Esc/focus idiom — reached **two ways** per DEC-022: a persistent
**"How to play"** trigger in the cabinet header, and an **auto-open-once** on first run (it reads
the SPEC-059 seam's `seen` at mount and opens automatically iff a first-timer hasn't seen it,
marking seen on first dismiss so it never nags on reload). The content covers the essentials a
tester needs — the goal, the four controls, where things live, and the play-money disclaimer — and
**points to the Paytable** for payouts rather than re-listing them.

Pure presentation: DEC-001 holds (static copy; the engine is untouched); DEC-005 holds (the only
persisted state is the seen flag via the seam, best-effort). DEC-010 (token-only CSS), DEC-004
(slide-up + reduced-motion fallback), `touch-targets-44` all apply, exactly as for the two prior
sheets.

## Goal

Ship `src/ui/help/HelpSheet.tsx` (a self-contained trigger + slide-up sheet mirroring
`StatsSheet`) rendering the how-to-play content, wired into the cabinet header, that **auto-opens
once on first run** via the SPEC-059 `useHelpSeen()` seam and **marks seen on first dismiss**; plus
`src/ui/help/help.css` (token-only, reduced-motion fallback) and its `HelpSheet.test.tsx`. No engine
change, no new dependency, no re-listing of paytable payouts.

## Inputs

- **Files to read:**
  - `src/ui/help/HelpSeenProvider.tsx` — the SPEC-059 seam this sheet consumes (`useHelpSeen()` →
    `{ seen, markSeen }`; no-op default `seen: true`).
  - `src/ui/stats/StatsSheet.tsx` — the closest structural sibling (self-contained trigger + open
    state + backdrop + Esc + focus-on-open). Mirror it.
  - `src/ui/stats/stats.css` — the CSS to mirror (trigger, backdrop, slide-up keyframe +
    reduced-motion fallback, header/title/close). Copy the shape, `help__` prefix.
  - `src/ui/PaytableSheet.tsx` + `src/ui/paytable.css` — the original sheet idiom; the
    `paytable__rules` / section styling to echo for the help body.
  - `src/ui/regions/Header.tsx` — where `PaytableSheet` / `StatsSheet` are rendered; the new trigger
    joins this cluster.
  - `src/ui/controls.touch-target.test.ts` — the touch-target guard that enumerates triggers; it
    must gain a `.help__trigger` entry (see ## Notes).
- **Related code paths:** `src/ui/help/` (new component + CSS), `src/ui/regions/Header.tsx` (one line).

## Outputs

- **Files created:**
  - `src/ui/help/HelpSheet.tsx` — the how-to-play trigger + slide-up sheet + first-run auto-open.
  - `src/ui/help/HelpSheet.test.tsx` — interaction + auto-open + pinned-copy tests.
  - `src/ui/help/help.css` — token-only sheet styling with a reduced-motion fallback.
- **Files modified:**
  - `src/ui/regions/Header.tsx` — render `<HelpSheet />` in the header controls cluster.
  - `src/ui/controls.touch-target.test.ts` — add `HELP_CSS` + a `.help__trigger` CONTROLS entry.
- **New exports:**
  - `HelpSheet.tsx`: `HelpSheet` (named export, no props — self-contained like `StatsSheet`).
- **Database changes:** none (the only persisted state is the seen flag via the SPEC-059 seam; DEC-005).

## Acceptance Criteria

Testable outcomes. Cover happy path, error cases, edge cases.

- [ ] A persistent **"How to play"** trigger (`aria-label="How to play"`) renders in the cabinet header.
- [ ] **First run (unseen):** wrapped in `HelpSeenProvider` with clean storage, the sheet
      **auto-opens** (a `role="dialog"` is present without any click).
- [ ] **Auto-open does not itself mark seen** (DEC-022): after auto-open and before any dismiss,
      `readHelpSeen()` is still `false`.
- [ ] **Mark on first dismiss:** dismissing the sheet closes it AND flips the seam so
      `readHelpSeen() === true` (it will not auto-open on the next load).
- [ ] **Already seen ⇒ no auto-open:** with `writeHelpSeen(true)` seeded, wrapped in the provider,
      no dialog is present until the trigger is clicked.
- [ ] **Provider-less ⇒ no auto-open** (keeps `App.test` green): `render(<HelpSheet />)` with no
      provider shows the trigger but no dialog (default `seen: true`).
- [ ] **Content:** when open, the sheet shows the pinned **goal** and **play-money disclaimer**
      strings, explains the four controls (Spin, − / +, Auto, Reset), and **points to the Paytable**
      for payouts (does not re-list them).
- [ ] **Closable** on the ✕ button, backdrop click, and Escape.
- [ ] **Boundaries:** `git diff main..HEAD -- src/engine/` is EMPTY (DEC-001); `help.css` is
      token-only with a `prefers-reduced-motion` block; the trigger is ≥44px (touch-targets-44).
- [ ] `just typecheck && just lint && just test && just build && just validate && just cost-audit` pass.

## Failing Tests

Written during **design**, BEFORE build. The implementer's job in **build** is to make these pass.
The pinned values are the deterministic DISPLAY OUTPUT (exact copy strings) + the SPEC-059 seam
behaviour contract — no simulation needed.

- **`src/ui/help/HelpSheet.test.tsx`** *(`render`/`fireEvent`, no `user-event`; `localStorage.clear()` in `beforeEach`)*
  - `"renders the How to play trigger and does not auto-open without a provider"` —
    `render(<HelpSheet />)`; the button `{ name: /how to play/i }` exists; `queryByRole('dialog')`
    is null (provider-less default `seen: true` ⇒ no auto-open — the App.test invariant).
  - `"auto-opens once on first run and marks seen on dismiss"` — clean storage; render inside
    `<HelpSeenProvider>`; a `role="dialog"` is present **without any click**; `readHelpSeen() === false`
    (auto-open alone does not mark seen); then `fireEvent.click` the Close button; the dialog is gone
    and `readHelpSeen() === true`.
  - `"does not auto-open when already seen"` — `writeHelpSeen(true)`; render inside the provider;
    `queryByRole('dialog')` is null; the "How to play" trigger is present.
  - `"opens on trigger click and shows the how-to-play content"` — `writeHelpSeen(true)` (suppress
    auto-open); render inside the provider; click the trigger; a dialog appears; assert the pinned
    copy exactly:
    - `getByTestId('help-goal').textContent === 'Spin the reels and match animals left-to-right. Line up 3 or more of the same animal starting from the leftmost reel on a payline to win.'`
    - `getByTestId('help-disclaimer').textContent === 'Zany Animal Slots is play-money only — no real money, no wagering, no payouts.'`
    - the four control terms are present: `getByText('Spin')`, `getByText('− / +')`, `getByText('Auto')`, `getByText('Reset')`;
    - it points to the Paytable: `getByText(/what each animal pays/i)`.
  - `"closes on the ✕ button, backdrop, and Escape"` — `writeHelpSeen(true)`; render inside the
    provider; for each of ✕ / backdrop (`getByTestId('help-backdrop')`) / `keyDown Escape`: open via
    the trigger, dismiss, assert `queryByRole('dialog')` is null.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-022` — the first-run help onboarding model. This spec IMPLEMENTS its **UI half**: one sheet,
  two entry points (header trigger + auto-open-once); first run = `seen === false` at mount; mark
  seen on **first dismiss** (not on open); the persistent trigger makes it re-openable on demand.
  (SPEC-059 implemented the storage/seam half.)
- `DEC-001` — engine-no-dom: the sheet is static copy in `src/ui/help/`; `git diff main..HEAD --
  src/engine/` MUST be empty.
- `DEC-005` — no backend: the only persisted state is the seen flag, set via the seam's `markSeen()`,
  best-effort, never throws.
- `DEC-010` — token-only CSS, no raw hex, `help__`-prefixed classes.
- `DEC-004` — slide-up animation with a `prefers-reduced-motion` fallback in `help.css`.

### Constraints that apply

- `engine-no-dom` — `src/ui/help/` imports nothing from `src/engine`.
- `touch-targets-44` — the trigger and close are ≥44px (`min-height`/`min-width: var(--space-7)`).
  The touch-target guard test enumerates triggers explicitly, so it gains a `.help__trigger` entry.
- `respect-reduced-motion` — `help.css` carries a `@media (prefers-reduced-motion: reduce)` block
  that drops the slide-up (the reduced-motion contract test auto-sweeps every `@keyframes` file).

### Prior related work

- `SPEC-059` (shipped, PR #69) — `src/ui/help/HelpSeenProvider.tsx` (`useHelpSeen()`) + `helpSeenStorage.ts`
  (`readHelpSeen`/`writeHelpSeen`); the seam this sheet consumes. Provider already wired in `main.tsx`.
- `SPEC-056` (shipped) — `StatsSheet` / `stats.css`: the closest structural sibling; mirror it.
- `SPEC-020` (shipped) — `PaytableSheet` / `paytable.css`: the original sheet idiom + section styling.

### Out of scope (for this spec specifically)

- Any engine or game-behaviour change (DEC-001).
- Re-listing paytable payouts — the sheet POINTS to the Paytable (SPEC-020) instead.
- An interactive/guided tutorial, per-control tooltips, or multi-step coach-marks (framing out-of-scope).
- Any change to the SPEC-059 seam or storage (`helpSeenStorage.ts`, `HelpSeenProvider.tsx`) — consume
  them as-is; the seam's `git diff` must stay unchanged.
- Reporting whether onboarding was seen anywhere — that is STAGE-011 analytics (opt-in).

## Notes for the Implementer

This is transcription of one component, one CSS file, one test file, a one-line `Header.tsx` edit,
and a two-line touch-target-test edit. Mirror `StatsSheet` exactly for the sheet mechanics; the ONLY
new behaviour is the first-run auto-open, which is `useState(() => !seen)` at mount plus `markSeen()`
inside `close()`. Keep `src/ui/help/` a leaf module (no engine import). `HelpSheet.test.tsx` is `.tsx`
(JSX). Use the U+2212 minus glyph `−` in the "− / +" control term (matching the bet button in
`Action.tsx`).

**Why `useState(() => !seen)` and not a `useEffect`:** the provider hydrates `seen` synchronously
(`useState(() => readHelpSeen())`), so at the sheet's first render `useHelpSeen()` already reports the
correct mount-time value. Initialising `open` from `!seen` auto-opens on first run with no flash of
closed state, and provider-less consumers (default `seen: true`) initialise `open: false` — no
auto-open, which is what keeps `App.test` green without wrapping it. `close()` calls `markSeen()`
unconditionally; it is idempotent, so re-opening via the trigger and closing again is harmless.

**Adversarial guard-mutations to run in verify** (each should break the named test; revert after):
1. In `HelpSheet.tsx`, change `useState(() => !seen)` to `useState(false)` (never auto-open)
   → breaks `"auto-opens once on first run and marks seen on dismiss"` (no dialog without a click).
2. In `HelpSheet.tsx`, remove the `markSeen()` call inside `close()`
   → breaks `"auto-opens once on first run and marks seen on dismiss"` (`readHelpSeen()` stays `false`
   after dismiss).

### `src/ui/help/HelpSheet.tsx` (drop-in)

```tsx
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
      <button className="help__trigger" aria-label="How to play" onClick={() => setOpen(true)}>
        ❓ How to play
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
                  <dt className="help__term">ℹ Paytable</dt>
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
```

### `src/ui/help/help.css` (drop-in)

```css
/*
 * How-to-play explainer — trigger + overlay + slide-up sheet (SPEC-060, DEC-022).
 *
 * DEC-010: global CSS, token colors only, no raw hex, help__-prefixed classes.
 * DEC-004: slide-up keyframe with a prefers-reduced-motion fallback.
 * constraint: touch-targets-44 — trigger and close are ≥44px.
 * constraint: portrait-first — sheet anchored to the bottom; scrolls if tall.
 *
 * Mirrors stats.css / paytable.css, prefix help__.
 */

/* ─── Trigger button ─────────────────────────────────────────────────────────── */

.help__trigger {
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

.help__trigger:hover,
.help__trigger:focus-visible {
  color: var(--color-text);
  border-color: var(--color-text);
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ─── Backdrop ───────────────────────────────────────────────────────────────── */

.help__backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--color-bg);
  opacity: 0.7;
  z-index: 10;
}

/* ─── Slide-up keyframe + sheet ──────────────────────────────────────────────── */

@keyframes help-slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.help__sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 11;

  max-height: 100%;
  overflow-y: auto;

  background-color: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-5) var(--space-4) var(--space-6);

  animation: help-slide-up 0.25s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .help__sheet {
    animation: none;
  }
}

/* ─── Header row (title + close) ─────────────────────────────────────────────── */

.help__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.help__title {
  font-family: var(--font-family-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
}

.help__close {
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

.help__close:hover,
.help__close:focus-visible {
  color: var(--color-text);
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ─── Body sections ──────────────────────────────────────────────────────────── */

.help__section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-frame);
}

/* The first section needs no top divider (the header already separates it). */
.help__section:first-of-type {
  margin-top: var(--space-0);
  padding-top: var(--space-0);
  border-top: none;
}

.help__section-title {
  margin: var(--space-0);
  font-family: var(--font-family-display);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.help__text {
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: var(--line-height-base);
}

.help__text strong {
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

/* ─── Term / description list (controls + where-things-are) ──────────────────── */

.help__list {
  margin: var(--space-3) var(--space-0) var(--space-0);
}

.help__item {
  display: grid;
  grid-template-columns: minmax(0, 6rem) 1fr;
  gap: var(--space-3);
  align-items: baseline;
  margin-top: var(--space-2);
}

.help__term {
  font-family: var(--font-family-display);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.help__desc {
  margin: var(--space-0);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: var(--line-height-base);
}

/* ─── Play-money disclaimer ──────────────────────────────────────────────────── */

.help__disclaimer {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-frame);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
  line-height: var(--line-height-base);
}

.help__disclaimer strong {
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}
```

### `src/ui/help/HelpSheet.test.tsx` (drop-in)

```tsx
// HelpSheet interaction + first-run auto-open tests — SPEC-060 failing tests (written at design).
// render/fireEvent (no user-event). First-run state comes from the SPEC-059 seam: clean storage ⇒
// HelpSeenProvider hydrates seen:false ⇒ auto-open; writeHelpSeen(true) ⇒ no auto-open. The two long
// copy strings are pinned as exact textContent (the deterministic display output for this pure-UI spec).
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpSheet } from './HelpSheet';
import { HelpSeenProvider } from './HelpSeenProvider';
import { readHelpSeen, writeHelpSeen } from './helpSeenStorage';

describe('HelpSheet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Provider-less (App.test's world): default seen:true ⇒ no auto-open; trigger present.
  it('renders the How to play trigger and does not auto-open without a provider', () => {
    render(<HelpSheet />);
    expect(screen.getByRole('button', { name: /how to play/i })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('auto-opens once on first run and marks seen on dismiss', () => {
    // Clean storage ⇒ provider hydrates seen:false ⇒ the sheet auto-opens with no click.
    render(
      <HelpSeenProvider>
        <HelpSheet />
      </HelpSeenProvider>,
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Auto-open alone does NOT mark seen (DEC-022: mark on first dismiss).
    expect(readHelpSeen()).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(readHelpSeen()).toBe(true);
  });

  it('does not auto-open when already seen', () => {
    writeHelpSeen(true);
    render(
      <HelpSeenProvider>
        <HelpSheet />
      </HelpSeenProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /how to play/i })).toBeTruthy();
  });

  it('opens on trigger click and shows the how-to-play content', () => {
    writeHelpSeen(true); // suppress auto-open so the trigger path is tested explicitly
    render(
      <HelpSeenProvider>
        <HelpSheet />
      </HelpSeenProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /how to play/i }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    // Pinned display copy (the deterministic output for this pure-UI spec).
    expect(screen.getByTestId('help-goal').textContent).toBe(
      'Spin the reels and match animals left-to-right. Line up 3 or more of the same animal starting from the leftmost reel on a payline to win.',
    );
    expect(screen.getByTestId('help-disclaimer').textContent).toBe(
      'Zany Animal Slots is play-money only — no real money, no wagering, no payouts.',
    );
    // The four controls are explained (U+2212 minus, matching the bet button).
    expect(screen.getByText('Spin')).toBeTruthy();
    expect(screen.getByText('− / +')).toBeTruthy();
    expect(screen.getByText('Auto')).toBeTruthy();
    expect(screen.getByText('Reset')).toBeTruthy();
    // Points to the Paytable rather than re-listing payouts.
    expect(screen.getByText(/what each animal pays/i)).toBeTruthy();
  });

  it('closes on the ✕ button, backdrop, and Escape', () => {
    writeHelpSeen(true);
    render(
      <HelpSeenProvider>
        <HelpSheet />
      </HelpSeenProvider>,
    );
    const trigger = screen.getByRole('button', { name: /how to play/i });

    // ✕
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();

    // backdrop
    fireEvent.click(trigger);
    fireEvent.click(screen.getByTestId('help-backdrop'));
    expect(screen.queryByRole('dialog')).toBeNull();

    // Escape
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
```

### `src/ui/regions/Header.tsx` (edit — render the trigger)

Add the import and render `<HelpSheet />` as the last item in the header controls cluster:

```tsx
import { PaytableSheet } from '../PaytableSheet';
import { StatsSheet } from '../stats/StatsSheet';
import { HelpSheet } from '../help/HelpSheet';
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
        <HelpSheet />
      </div>
    </header>
  );
}
```

### `src/ui/controls.touch-target.test.ts` (edit — add the help trigger)

Add a `HELP_CSS` fixture and a `.help__trigger` entry to the `CONTROLS` array, mirroring the
existing `.stats__trigger` lines:

```ts
const STATS_CSS = resolve(__dirname, 'stats/stats.css');
const HELP_CSS = resolve(__dirname, 'help/help.css');

// ...
const statsCss = readFileSync(STATS_CSS, 'utf-8');
const helpCss = readFileSync(HELP_CSS, 'utf-8');

// ...in the CONTROLS array, after the stats entries:
  { label: '.help__trigger (help.css)', cssSource: helpCss, selector: '.help__trigger' },
```

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-060-help-sheet-ui`
- **PR (if applicable):** none until ship
- **All acceptance criteria met?** yes — all 9 acceptance criteria satisfied; all 5 Failing Tests in
  `HelpSheet.test.tsx` pass (trigger-present-no-provider, auto-open + mark-on-dismiss,
  no-auto-open-when-seen, trigger-click content + pinned copy, close via ✕/backdrop/Escape); full gate
  (`typecheck && lint && test && build && validate && cost-audit`) green — 72 test files / 425 tests
  passed, including `App.test.tsx` (5 tests) unchanged and green; `git diff main..HEAD -- src/engine/`
  is empty; `git diff main..HEAD -- src/ui/help/HelpSeenProvider.tsx src/ui/help/helpSeenStorage.ts`
  is empty (the SPEC-059 seam untouched).
- **New decisions emitted:**
  - none — implements `DEC-022` (authored at SPEC-059/SPEC-060 design); no NEW dec emitted at build.
- **Deviations from spec:**
  - none — `HelpSheet.tsx`, `help.css`, `HelpSheet.test.tsx`, the `Header.tsx` edit, and the
    `controls.touch-target.test.ts` edit were transcribed verbatim from the Notes drop-ins.
- **Follow-up work identified:**
  - None new. This is the last spec in the STAGE-010 backlog; STAGE-010 is complete once this ships.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing; the Notes section's drop-in
   code and Failing Tests were complete and unambiguous, so this cycle was pure transcription mirroring
   `StatsSheet`/`PaytableSheet`.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No; DEC-022,
   DEC-001, DEC-005, DEC-010, DEC-004 fully covered the boundaries this spec touches.
3. **If you did this task again, what would you do differently?** — Nothing; the mirror-an-existing-
   sheet approach (StatsSheet → HelpSheet) plus the already-shipped SPEC-059 seam made this a fast,
   low-risk build with zero deviations.
