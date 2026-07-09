---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-009                     # stable, zero-padded, continuous across the repo
  status: active                    # proposed | active | shipped | cancelled | on_hold
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-002                      # parent project
repo:
  id: animal-slots

created_at: 2026-07-08
shipped_at: null

# What part of the project's value thesis this stage advances.
# If you can't articulate value_contribution, the stage may be
# infrastructure-only — acceptable but flag it.
value_contribution:
  advances: >-
    The "progress" half of the thesis — now that the game is deliberately fun to win
    (STAGE-008) and varied across four machines, this stage makes that fun VISIBLE and
    MEASURABLE to the player: a client-side session-stats view gives a first-party sense
    of progress (winnings-over-time, biggest win, spins, cash-ins) with zero backend.
  delivers:
    - "An in-app session-stats panel showing spins, biggest win, cash-ins, win rate, and net winnings."
    - "A winnings-over-time sparkline (balance/net sampled per spin) — the visible 'sense of progress'."
    - "Automatic, client-only recording: every spin and every wallet cash-in updates the stats, persisted across reloads (localStorage, namespaced zany:stats:*, never throwing — DEC-005)."
    - "A 'Clear stats' action, distinct from the wallet Reset, that zeroes the session record on demand."
  explicitly_does_not:
    - "Add any backend, network beacon, or usage analytics — that's STAGE-011; the no-backend posture (DEC-005) is UNCHANGED this stage."
    - "Add help / how-to-play onboarding — that's STAGE-010."
    - "Add accounts, login, cross-device sync, or any cross-session/cross-tab player identity — stats are per-browser, client-only."
    - "Add a per-machine stats breakdown — this stage ships AGGREGATE session stats; the model leaves room for a per-machine dimension as a future spec (see Design Notes)."
    - "Change the engine-no-dom boundary (DEC-001) — recording is a UI/presentation concern reading the SpinResult the engine already returns; the engine is untouched."
---

# STAGE-009: Player session stats

## What This Stage Is

A stage that gives the player a **visible sense of progress** in a game that is now
worth measuring. When its specs ship, every spin and every wallet cash-in is recorded
client-side, and an in-app **session-stats panel** shows the player how their session
is going — total spins, biggest win, number of cash-ins, win rate, net winnings, and a
**winnings-over-time sparkline** — all persisted across reloads and clearable on demand.
The whole feature is client-only: it reads the `SpinResult` the engine already returns
and persists a small stats record to `localStorage` under the `zany:stats:*` namespace,
reusing STAGE-008's React-Context-over-localStorage pattern (SPEC-049) and never throwing
on storage access (DEC-005). No backend, no network, no engine change.

## Why Now

STAGE-008 shipped a deliberately-fun, four-machine game (measured RTP ~94%, a real
medium-win band, a reachable jackpot) — a game finally **worth measuring progress in**.
The brief names "a visible sense of progress" as a player beneficiary and lists an
in-app stats view as a success signal; there is no point instrumenting progress until
the game is fun to make progress in, which it now is. This stage is **independent of
STAGE-010 (help) and STAGE-011 (analytics) and could ship before either** — it needs
nothing from them. It also directly reuses two patterns STAGE-008 just proved and left
as explicit hand-offs: the reactive React-Context-backed-by-localStorage seam (SPEC-049)
and the `zany:*` key namespace convention, where SPEC-049 deliberately namespaced
`zany:active-machine` **specifically so STAGE-009's stats keys would not collide**. The
substrate is warm; this is the cheap, natural next step.

## Success Criteria

- **Recorded automatically:** every resolved spin updates the session stats (spin count,
  wagered, won, biggest win, win/loss for win-rate, and the winnings-over-time series),
  and every wallet cash-in increments the cash-in count — with no player action beyond
  playing.
- **Visible in-app:** an in-app panel/sheet (reachable from the cabinet header, mirroring
  the paytable trigger) shows spins, biggest win, cash-ins, win rate, net winnings, and a
  winnings-over-time sparkline — legible in portrait at 375–430px.
- **Persisted + resilient:** the stats survive a reload (localStorage, `zany:stats:*`),
  and every storage access is guarded — an unavailable/quota-exceeded/corrupt store
  degrades to empty stats, never throws (DEC-005).
- **Clearable, with clear semantics:** a "Clear stats" control zeroes the session record;
  it is DISTINCT from the wallet Reset (which is itself counted as a cash-in) and does not
  touch balance, bet, or the active machine.
- **Boundaries intact:** DEC-001 holds — the engine is untouched (`git diff … -- src/engine/`
  EMPTY); recording reads the existing `SpinResult`. DEC-005 holds — no backend, no network.
- **`just typecheck && just lint && just test && just build && just validate && just cost-audit`
  all pass.**

## Scope

### In scope
- **Session-stats model + safe storage** — a pure, tested stats data model (counters +
  a bounded winnings-over-time series) with a derivation of the display metrics (win rate,
  net), plus safe `localStorage` persistence under `zany:stats:*` that mirrors
  `activeMachineStorage.ts` (guarded, never throws, versioned schema).
- **Reactive stats context + recording seam** — a `StatsProvider`/`useStats` (mirroring
  `MachineProvider`) holding the reactive stats, persisting on change, and exposing
  `recordSpin(result)`, `recordCashIn()`, and `resetStats()`; wired into `useSlotMachine`'s
  spin-resolve and the wallet Reset handler.
- **Session-stats panel UI** — an in-app panel/sheet with a header trigger, rendering the
  numeric metrics (spins, biggest win, cash-ins, win rate, net winnings) and the
  "Clear stats" control.
- **Winnings-over-time sparkline** — a dependency-free SVG sparkline of the balance/net
  series in the panel (the "sense of progress" visual), with a `prefers-reduced-motion`
  and empty-state path.

### Explicitly out of scope
- Any backend, network beacon, or usage analytics — **STAGE-011** (DEC-005 unchanged here).
- Help / how-to-play onboarding — **STAGE-010**.
- Accounts, login, cross-device sync, cross-tab live-sync, or any cross-session identity.
- A **per-machine** stats breakdown — this stage ships **aggregate** session stats; the
  storage schema is versioned so a per-machine dimension can be added later without a
  migration break (see Design Notes). Not built here.
- Real money / payments (constraint `no-real-money` holds forever).
- Any new charting/visualization dependency — the sparkline is hand-rolled SVG (no new dep,
  per constraint `no-new-top-level-deps-without-decision`).
- Changing the engine or its `SpinResult` shape — recording consumes what the engine
  already returns (DEC-001).

## Spec Backlog

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

Ordered infrastructure-before-UI, matching the SPEC-044→053 pattern (pure/tested model →
reactive context seam → panel UI → visualization).

- [x] SPEC-054 (shipped, PR #64) — **Session-stats model + safe storage** *(infra)*: a pure
      `sessionStats` module — the stats record type (spins, wins, totalWagered, totalWon,
      biggestWin, cashIns, and a **bounded** winnings-over-time series), a pure `recordSpin`/
      `recordCashIn`/`emptyStats` reducer set, and `deriveMetrics` (win rate, net) — plus
      safe versioned `localStorage` persistence under a `zany:stats` key mirroring
      `activeMachineStorage.ts` (guarded, never throws — DEC-005). No React, no wiring, no UI.
      Emits **DEC-020** (the session-stats model: cash-in semantics, metric definitions,
      aggregate scope, bounded-series + persistence schema). **[M]**
- [x] SPEC-055 (shipped, PR #65) — **Reactive stats context + recording seam** *(keystone)*: a
      `StatsProvider`/`useStats` (mirroring SPEC-049's `MachineProvider`) holding the reactive
      stats, persisting on change, exposing `recordSpin(input, machineId)` + `recordCashIn()` +
      `resetStats()`; wired `recordSpin` into `useSlotMachine`'s spin-resolve and `recordCashIn`
      into the wallet Reset handler; nested the provider inside `MachineProvider` in `main.tsx`. Stats
      now accumulate and persist across reloads with no display surface (proven by the existing suite +
      an EMPTY engine diff; 8 new tests, 395/395 green; 3 adversarial guard-mutations proven). **[M]**
- [x] SPEC-056 (shipped, PR #66) — **Session-stats panel UI**: an in-app panel/sheet (mirroring
      `PaytableSheet`) opened from a cabinet-header trigger, rendering the numeric metric
      tiles (spins, biggest win, cash-ins, win rate, net winnings) from `useStats()` +
      `deriveMetrics`, plus the "Clear stats" control calling `resetStats()`. Portrait-first,
      ≥44px targets, added to the touch-target guard. Preview-verified; 6 new tests, 401/401 green;
      4 adversarial guard-mutations proven. **[M]**
- [x] SPEC-057 (shipped, PR #67) — **Winnings-over-time sparkline**: a dependency-free SVG sparkline
      (`src/ui/stats/Sparkline.tsx`) of the bounded cumulative-net series (DEC-020) added to the panel —
      polyline + dashed zero baseline (when crossing break-even) + up/down color by final net, an
      empty-state below two points, and a static (non-animated) render. Pure presentation (engine +
      stats-model diffs EMPTY); no new dep, no new DEC. Geometry pinned via a self-contained script;
      preview-verified; 7 new tests, 408/408 green; 5 adversarial guard-mutations proven. **[S]**

**Count:** 4 shipped (SPEC-054, SPEC-055, SPEC-056, SPEC-057) / 0 active / 0 pending — 3×M, 1×S
(4 specs total). **Backlog complete** — the stage is ready to ship. Comfortably
within the 3–8 typical range. **SPEC-057 (the sparkline) was the natural deferral boundary**
if the wave runs long: SPEC-054–056 already deliver the full numeric stats view and
persistence; the sparkline is the separable polish (same deferral logic the brief applies
to STAGE-011 and STAGE-008 applied to Ocean).

## Design Notes

Settled here at frame (with rationale); anything genuinely design-cycle work is flagged.

- **(1) Scope: AGGREGATE session stats, not per-machine — SETTLED.** The brief's success
  signal names a single "session" view (winnings-over-time, biggest win, spins, cash-ins);
  a per-machine breakdown multiplies UI + storage for marginal value now and is better
  motivated once analytics (STAGE-011) shows machine-switching behavior. So stats aggregate
  across all machines this stage. **But** the persistence schema is versioned and the record
  is shaped so a `perMachine` dimension can be added later without breaking the stored blob
  (a future spec, possibly a PROJ-003 item). Cheap high-value detail to keep: record which
  machine + tier produced the biggest win, so the panel can name it.
- **(2) Panel surface + metric set — SETTLED.** A bottom-sheet/panel mirroring
  `PaytableSheet`, opened from a cabinet-header trigger (same idiom as the paytable and the
  SPEC-050 machine selector). Metric set: **spins**, **biggest win** (coins; optionally the
  machine/tier that produced it), **cash-ins**, **win rate** (winning spins ÷ total spins),
  **net winnings** (totalWon − totalWagered), and the **winnings-over-time sparkline**.
  Exact tile layout/copy is design-cycle work for SPEC-056; the metric SET is fixed here.
- **(3) "Cash-in" definition + reset/clear semantics — SETTLED (resolves the brief's open
  question).** Grounded in the current code: the app has a **wallet Reset** button that
  restores `STARTING_BALANCE` (`useSlotMachine.reset()`); there is no auto-reset-on-zero and
  no explicit "Collect" action. So **a cash-in = one wallet Reset press** — the play-money
  analog of buying back in when you want more chips; it is countable and needs no new UI.
  (Alternatives rejected: *auto-reset on balance-hits-zero* — no such behavior exists today;
  *an explicit Collect action* — no such control exists.) **Clearing stats is a SEPARATE,
  explicit action** in the panel that zeroes the `zany:stats` record and does NOT touch
  balance/bet/active-machine; conversely the wallet Reset must NOT clear stats (it is
  *counted* as a cash-in). Keeping the two resets independent is a stage invariant the
  recording-seam spec (SPEC-055) must honor.
- **(4) Persistence — reuse SPEC-049's pattern under `zany:stats:*` — SETTLED.** A safe
  storage module mirrors `src/machines/activeMachineStorage.ts` exactly (guarded try/catch,
  never throws — DEC-005), and a `StatsProvider`/`useStats` context mirrors `MachineProvider`.
  Store a **single versioned JSON blob** under one key (`zany:stats`, holding
  `{ version, ...counters, series }`) rather than many keys — simpler, atomic, and
  forward-compatible; a corrupt/absent/unparseable blob degrades to `emptyStats()`. This
  cleanly reuses the namespace SPEC-049 reserved precisely to avoid this collision.
- **Bounded winnings-over-time series.** The series MUST be length-bounded (e.g. cap at the
  last N points, or downsample) so `localStorage` can't grow without limit over a long
  session — a real constraint the model spec (SPEC-054) must decide (cap value + trim
  policy) and pin in DEC-020. The plotted axis (balance-per-spin vs. cumulative-net-per-spin)
  is settled at SPEC-054 design and recorded in DEC-020; framing fixes only that it is a
  per-spin, capped series.
- **(5) One new DEC — DEC-020 — is warranted.** The session-stats model carries cross-cutting
  semantic choices that STAGE-011 analytics and any future per-machine breakdown will build
  on: what a "cash-in" is, the metric definitions (win rate, net, biggest win), the
  aggregate-not-per-machine scope, and the bounded-series + `zany:stats` persistence schema
  and versioning. **DEC-020 is authored at SPEC-054 design** (framing plans; it does not write
  DECs). It references DEC-005 (never-throw storage) and DEC-001 (recording is a UI concern);
  it does not amend DEC-005 (no backend added). No other spec is expected to need a DEC —
  SPEC-055–057 are the reactive seam + UI over the DEC-020 model, same as SPEC-050 rode
  SPEC-049's DEC-less reactive seam.
- **Engine untouched (DEC-001).** Recording reads the `SpinResult` the engine already
  returns (`{ totalWin, balance, tier, bet, ... }`); the recording seam lives in
  `src/ui`/`src/stats` (module placement is a SPEC-054 design call). Every spec's
  `git diff … -- src/engine/` must be EMPTY — the STAGE-007/008 guard-mutation discipline
  carries forward.

## Dependencies

### Depends on
- **STAGE-008 (shipped):** a fun, varied four-machine game worth measuring progress in;
  and — reused directly — the **React-Context-over-localStorage** pattern (SPEC-049's
  `MachineProvider`/`activeMachineStorage.ts`) plus the **`zany:*` key namespace** SPEC-049
  reserved so stats keys won't collide.
- **PROJ-001 (shipped):** the `SpinResult` contract recording consumes, the
  `src/ui/storage.ts` safe-localStorage idiom, the token system + `PaytableSheet` sheet idiom
  the panel mirrors, and the wallet `reset()` that defines a cash-in.
- **External:** none (no backend this stage; DEC-005 unchanged).

### Enables
- **STAGE-011 (analytics):** a proven client-side event-recording seam (spin/cash-in) and a
  stats model that a usage beacon could later sample from; the "fun metric" iteration loop
  the brief describes (analytics → retune → re-measure) has its client half here.
- A possible future **per-machine stats breakdown** (schema already leaves room) and any
  progress/achievement surface in a later wave.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1c (Stage Ship) in
FIRST_SESSION_PROMPTS.md to draft this.*

- **Did we deliver the outcome in "What This Stage Is"?** <yes/no + notes>
- **How many specs did it actually take?** <number vs. plan>
- **What changed between starting and shipping?** <one sentence>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - <one-line items>
