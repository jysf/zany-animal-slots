---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-002                     # stable, zero-padded within the project
  status: shipped                   # proposed | active | shipped | cancelled | on_hold
  priority: high                    # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-001                      # parent project
repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: 2026-06-23

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    Directly proves the "game logic cleanly separable from presentation" half
    of the thesis: a complete, deterministic slot engine that is fully
    unit-tested with zero React/DOM imports, validating that the hard part of a
    slot game can live behind a typed interface with no UI coupling.
  delivers:
    - "A pure-TypeScript slot engine: seedable RNG, weighted reel strips, 5×3 spin resolution, 5-payline + paytable evaluation, bet/balance state machine, and win-tier classification (small / big / jackpot)."
    - "A typed interface the presentation layer will consume in STAGE-003."
    - "High unit-test coverage with deterministic spins under a seeded RNG."
  explicitly_does_not:
    - "Render anything or import React/DOM (enforced by the engine-no-dom boundary)."
    - "Add animation, timing, or any notion of a spin taking wall-clock time."
    - "Persist balance to localStorage — wiring persistence is STAGE-003's job."
    - "Fire any celebration or audio; it only classifies the win tier as data."
---

# STAGE-002: Slot engine (pure logic, zero DOM)

## What This Stage Is

The brain of the game, with no face. This stage delivers the complete slot
**engine** as pure TypeScript under `src/engine/**`, with zero React or DOM
imports: a single injected seedable PRNG (mulberry32-style) driving weighted
reel strips, a 5×3 spin resolver, evaluation of the five fixed paylines against
the tier paytable (summing all line wins), a bet/balance state machine, and
win-tier classification (small / big / jackpot). Because every source of
randomness is injected, spins are fully deterministic in tests — the engine is
unit-tested to high coverage. When this stage ships, you can drive a full
spin → evaluate → settle cycle from a test, with no browser in sight. It is the
load-bearing evidence for the project thesis.

## Why Now

The engine is the riskiest part of the thesis and the cheapest to test, so it
comes before any UI wiring. Establishing the typed engine interface now lets
STAGE-003 consume a stable contract rather than co-evolving logic and
presentation. It depends only on STAGE-001's scaffold and the `engine-no-dom`
boundary already being in place.

## Success Criteria

- A full `spin → evaluate → settle` cycle runs from a Vitest test with no browser:
  given a seed and a bet, the engine returns a `SpinResult` (grid, winning lines,
  total win, new balance, win tier).
- **Determinism:** the same seed always produces the same grid and result; every
  source of randomness flows through the injected PRNG (constraint
  `deterministic-rng`) — no bare `Math.random()` anywhere in `src/engine/**`.
- **Boundary stays clean:** `src/engine/**` imports no React/DOM (constraint
  `engine-no-dom`, lint-enforced) and depends on nothing in `src/ui/**`.
- **Rules match the spec:** paylines (DEC-003), paytable + reel weights (DEC-011),
  symbols/tiers (DEC-006), bet/balance, and win-tier classification all behave per
  the brief's **Game-Design Spec**, evidenced by tests derived from its tables and
  worked examples.
- **High coverage:** the pure logic is unit-tested close to every branch (payline
  lengths 3/4/5, multi-line spins, all tiers, insufficient-balance, reset).
- The engine exposes a single typed public surface (`src/engine/index.ts`) the UI
  will consume in STAGE-003; nothing reaches past it into internals.

## Scope

### In scope
- `rng.ts` — seedable mulberry32 PRNG + injection seam (DEC-002).
- `strips.ts` — symbol set, per-reel weighted strips (DEC-011 weights), strip→grid
  stop logic.
- `spin.ts` — resolve a 5×3 grid from seed + strips (draw order reel 0→4).
- `paylines.ts` — the 5 fixed lines (DEC-003) + paytable evaluation (DEC-011),
  summing all line wins.
- `balance.ts` — bet levels 10/25/50, balance debit/credit, reset to 1000,
  invalid-spin as a typed result (no throw).
- `tiers.ts` — win-tier classification (none/small/big/jackpot) as data.
- `index.ts` — the typed public interface (`spin`, bet/balance ops, `SpinResult`).

### Explicitly out of scope
- Anything visual, timed, or audible: rendering, reel-stop animation, spin
  duration, celebration, audio (STAGE-003 / STAGE-004).
- `localStorage` persistence of balance/mute (STAGE-003 wires it).
- Auto-spin orchestration (a UI concern over the engine — STAGE-003).
- Per-reel asymmetric strips or per-symbol payout splits (clean future specs per
  DEC-003 / DEC-011).
- Any RTP claim or tuning toward a regulated payout (DEC-005, `no-real-money`).

## Build order & dependencies (within the stage)

The specs form a dependency chain — build in backlog order: `rng` → `strips` →
`spin` (needs rng + strips) → `paylines` (evaluates a grid; can be built against
hand-built grids in parallel-ish) → `balance` (independent) → `tiers` (needs the
win/total concepts) → `index` (composes all of the above into `spin()`). Each spec
is small and gets its own branch/PR.

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [x] SPEC-005 (shipped 2026-06-19) — Seedable RNG module (mulberry32) + injection seam; no bare `Math.random()` anywhere in `src/engine/**`. **[S]**
- [x] SPEC-006 (shipped 2026-06-19) — Symbol set + weighted reel strips (DEC-011 weights; common animals frequent, Wolf rare); strip-to-grid stop logic. **[S]**
- [x] SPEC-007 (shipped 2026-06-19) — 5×3 spin resolver: given seed/strips, produce the visible grid (draw order reel 0→4). **[S]**
- [x] SPEC-008 (shipped 2026-06-21) — Payline + paytable evaluation: 5 fixed lines (DEC-003), 3/4/5-of-a-kind per tier (DEC-011), sum of all line wins. **[M]**
- [x] SPEC-009 (shipped 2026-06-22) — Bet/balance state machine: bet levels 10/25/50, balance debit/credit, reset to 1000, invalid-spin typed result. **[S]**
- [x] SPEC-010 (shipped 2026-06-23) — Win-tier classification: none / small (<5× bet) / big (≥5× bet) / jackpot (five Wolves), exposed as data. **[S]**
- [x] SPEC-011 (shipped 2026-06-23) — Public engine interface: typed `spin()` surface the UI consumes, with `SpinResult` fully described. **[M]**

**Count:** 7 shipped / 0 active / 0 pending — backlog complete (Stage Ship pending).

## Design Notes

See `DEC-001`, `DEC-002`, `DEC-003`, `DEC-005`, `DEC-006`, and `DEC-011` (the
paytable + reel-strip weights), plus the **Game-Design Spec** in `brief.md`.
Reel-strip weights are tuned for feel (wins land often enough to be fun; balance
drifts down over a long session), explicitly **not** a regulated RTP — do not
advertise an RTP number.

## Dependencies

### Depends on
- STAGE-001 — scaffold, TypeScript config, and the `engine-no-dom` boundary.

### Enables
- STAGE-003 — the UI consumes this engine's typed interface.

## Stage-Level Reflection

*Shipped 2026-06-23. All seven specs in `specs/done/`.*

### Success criteria — did we deliver?

All six met:
- ✅ A full `spin → evaluate → settle` cycle runs from a Vitest test, no browser:
  `spin({ seed, balance, bet })` returns a `SpinResult` (grid, lineWins, totalWin,
  new balance, tier) — pinned end-to-end (e.g. seed 276 → 55-coin big win, balance
  1045).
- ✅ **Determinism:** every draw flows through the injected mulberry32 (`createRng`);
  a grep confirms no bare `Math.random()` anywhere in `src/engine/**`.
- ✅ **Boundary clean:** `src/engine/**` has zero React/DOM/`src/ui` imports
  (lint-enforced `engine-no-dom`, re-confirmed by grep at stage close).
- ✅ **Rules match the spec:** paylines (DEC-003), paytable + reel weights (DEC-011),
  symbols/tiers (DEC-006), bet/balance, and win-tier all behave per the brief's
  Game-Design Spec — every expected value was computed independently (Node) and
  pinned as a fixture (SPEC-008's payouts were even hand-re-derived at verify).
- ✅ **High coverage:** 72 engine tests across the 7 modules — payline lengths
  3/4/5, multi-line spins, all tiers, insufficient-balance, the 5× boundary,
  floor rounding, jackpot precedence, and the canonical-RNG/strip/grid pipeline.
- ✅ Single typed public surface at `src/engine/index.ts` (`spin()` + re-exports);
  nothing reaches past it.

### value_contribution — delivered as claimed?

Yes. The stage's thesis claim — "the hard part of a slot game can live behind a
typed interface with no UI coupling" — is now load-bearing evidence, not a promise:
a complete, deterministic engine that scores a full spin from a test with zero DOM.
All three `delivers` items (pure engine, typed interface, high deterministic
coverage) landed; all four `explicitly_does_not` items held (no rendering, no
timing, no localStorage, no celebration/audio — those stay in STAGE-003/004).

### 3-sentence summary

Built exactly the seven specs framed, in dependency order (rng → strips → spin →
paylines → balance → tiers → index), each its own branch/PR, with no scope added or
dropped. It went smoothly and fast — the engine is the TDD sweet spot the frame
predicted, so every spec got real failing tests derived from the game-design spec
and most builds passed first try. The one process wrinkle was sub-agent
reliability (a truncated build return, a stale timeline marker, a stale CI `CLEAN`
read) — all caught by trusting git/disk state over self-reports.

### Stage-Level Reflection answers

- **Did we deliver the outcome in "What This Stage Is"?** Yes — the brain of the
  game with no face: a pure-TS, fully deterministic, fully unit-tested slot engine
  behind one typed interface.
- **How many specs did it actually take?** Seven, exactly as framed (no splits, no
  additions). Sizing held: 5×S, 2×M, no L.
- **What changed between starting and shipping?** Nothing in scope. The only
  pre-work was authoring the game-design spec (paytable + reel weights, DEC-011) +
  fixing three dangling references — a gap the frame had assumed already existed in
  `brief.md`. Once that was in place, the seven specs ran clean.
- **Lessons that should update AGENTS.md, templates, or constraints?** Two dogfood
  candidates, neither blocking: (a) generalize "trust git over timeline markers" to
  "trust git/disk over any agent self-report" (finding #11), and (b) optionally
  make `deterministic-rng` lint-enforced (a `no-restricted-syntax` rule banning
  `Math.random` under `src/engine/**`) rather than verify-enforced. Both belong in
  the next weekly review, not a mid-project AGENTS edit.
- **Should any spec-level reflections be promoted to stage-level lessons?** Yes —
  the "compute exact fixtures from a reference, then pin them" pattern (used for the
  RNG sequence, the reel strip, the paytable payouts, and the full-spin results) is
  the reusable technique that made a deterministic engine trustworthy under
  sub-agent builds. It is the stage's most transferable takeaway.

### Follow-up flags

- **Next:** STAGE-003 (reels UI & spin flow) — consumes this engine's `spin()` +
  re-exported surface through `src/engine/index.ts` only. Now unblocked.
- No new engine stage needed; no engine spec deferred. Two template/process
  candidates noted above for the weekly review. Per-reel asymmetric strips and
  per-symbol payout splits remain clean *future-project* specs (DEC-003/DEC-011),
  not MVP work.
