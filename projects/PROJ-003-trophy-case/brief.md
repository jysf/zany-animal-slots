---
# Maps to ContextCore project.* semantic conventions.
# A project is a bounded wave of work against the repo (the app).

project:
  id: PROJ-003
  status: active                  # proposed | active | shipped | cancelled
  priority: medium
  target_ship: null                 # play/dogfood project — no hard external date

repo:
  id: animal-slots

created_at: 2026-07-23
shipped_at: null

# Business value. Testable claim, not marketing copy.
value:
  thesis: >-
    Winning is the only part of a play-money slot that carries any emotional
    weight, and today the app throws that moment away: the celebration plays,
    and three seconds later the only trace is a number in a stats tile. PROJ-003
    tests whether MAKING WINS PERSISTENT AND RE-VIEWABLE — the actual reels,
    re-rendered in the machine's own creatures, with the winning cells lit —
    turns a session from a sequence of forgotten spins into a collection worth
    coming back to. The engine already computes everything needed; the wave is
    about not discarding it.
  beneficiaries:
    - "Players — a keepsake of their best moments, and a reason to chase a personal best rather than just spin"
    - "The owner — a fun surface that costs no backend, no PII, and no engine change; and a second chase loop (beat your #5) layered on the existing math"
    - "Template maintainer — dogfoods a forward-compatible persisted-schema change (add a field without discarding user history) and a presentation-only re-render of engine data"
  success_signals:
    - "A player's best 10 wins survive a reload and are re-rendered as real 5x3 reels, in the ORIGINATING machine's symbol identity — not the currently-selected machine's."
    - "Winning cells are visually distinguished from non-winning cells on every saved trophy."
    - "Landing a spin that enters the top 10 is legible IN THE MOMENT, not only on a later visit to a sheet."
    - "An existing stats blob written before this wave loads intact — spins, biggest win, series, and cash-ins all survive; topWins simply starts empty."
    - "Zero engine (`src/engine/**`) diff across the whole project: the trophy is assembled entirely from what SpinResult already returns."
  risks_to_thesis:
    - "'More fun' is subjective; a trophy case can read as just another stats table if the visual treatment is timid — the fun is in the treatment, not the data model."
    - "A 5x3 emoji grid at phone width is small; the winning-cell highlight may not read at all on a 375px screen, which would gut the whole point. Real-device check required, not a Chromium screenshot."
    - "Persisting grids grows the `zany:stats` blob; an unbounded or over-generous N risks quota pressure on a key that must never throw (DEC-005)."
    - "A trophy stores a machineId; if a machine is ever removed from the registry the saved reels would silently re-render in the fallback machine's creatures — a quiet DEC-021 violation."
---

# PROJ-003: Trophy Case

## What This Project Is

A wave that makes **winning leave a mark**. Today every spin's full outcome — the
5×3 `grid`, the `lineWins`, the `totalWin`, the `tier` — is computed by the engine,
shown for a moment, and then discarded: `useSlotMachine` records only
`{ totalWin, bet, tier }` into session stats, and `biggestWin` keeps an amount with
no reels attached. This project **stops throwing the reels away**, persists the top
N wins of the session alongside the existing stats blob, and builds a **trophy case**
— a celebratory in-app surface that re-renders each saved win as a real mini reel
grid, in that machine's own creatures, with the winning cells lit and the rest dimmed,
ranked and framed by win tier. It also makes the moment of *earning* a trophy visible
during the celebration, so the case is something you feel yourself filling.

## Why Now

PROJ-002 closed having built exactly the substrate this needs and then stopped one
step short. STAGE-009 shipped the session-stats model, the safe versioned
`localStorage` blob, and the stats sheet; STAGE-012 shipped **per-machine symbol
identity** (DEC-021), which is what makes a *saved* grid re-renderable in the right
creatures rather than in a generic symbol set. The record seam in
`useSlotMachine.ts` already has the full `SpinOutcome` in hand at the moment it calls
`recordSpin` — the grid is discarded on a line of code, not for a structural reason.
PROJ-002's own reflection named the remaining gap as fun/polish rather than plumbing,
and its parked follow-ups are either gated (STAGE-011 Tier 2) or a separate wave (the
audio overhaul). A small, self-contained fun wave against a frozen engine is the right
next move, and the forward-compatible-schema problem it forces is worth dogfooding.

## Success Criteria

- **Persistence:** the top 10 wins of a session survive reload, stored inside the
  existing `zany:stats` blob under a new bounded `topWins` field.
- **Non-destructive schema change:** a stats blob written by the current build loads
  **without loss** after the upgrade. `STATS_VERSION` does not change; a missing
  `topWins` normalizes to `[]` rather than invalidating the record.
- **Faithful replay:** each trophy re-renders the actual 5×3 grid using the
  **originating machine's** `symbolDisplay` (DEC-021), with winning cells visually
  distinguished from non-winning cells.
- **Celebratory, not tabular:** rank treatment, tier-derived framing, an inviting
  empty state, and a legible "you just earned a trophy" moment during the win
  celebration. Judged by look, on a real device.
- **Zero engine diff:** `src/engine/**` is untouched for the entire project (DEC-001).
- **No posture change:** no backend, no PII, no new dependency, no analytics change
  (DEC-005; STAGE-011 Tier 2 stays gated), and `src/ui/audio/**` untouched.

## Scope

### In scope
- **Trophy data model** — a `TopWin` record `{ amount, machineId, tier, bet, grid,
  lineWins, spinIndex }` and a bounded (cap 10), sorted `topWins: TopWin[]` on
  `SessionStats`, with insert/cap reducers. Pure, immutable, tested — mirrors the
  SPEC-054 model style.
- **Forward-compatible read** — `readStats()` tolerates a blob with no `topWins` and
  normalizes it to `[]`, and `isValid()` accepts both shapes. Explicitly a
  no-`STATS_VERSION`-bump change; existing history must not be discarded.
- **Record-seam widening** — `recordSpin` receives `grid` + `lineWins` from the
  outcome already in hand at `src/ui/useSlotMachine.ts`.
- **Trophy grid rendering** — reuse the existing `ReelGrid` at trophy scale rather than
  a new component (it already takes grid + lineWins + symbolDisplay and lights winning
  cells); token colors only (DEC-010), accessible text alternative. Fix the winning-cell
  derivation to read the originating machine's `math.paylines`, not the module-level
  `PAYLINES`, since a trophy is stored and outlives the current line set.
- **The trophy case surface** — the ranked case at the top of the (renamed) record
  sheet: full cards for #1–#3 (medal, tier framing, amount + machine + bet + spin
  number + bet multiplier), compact tap-to-expand rows for #4–#10, a **locked-plinth
  empty state**, a **bar-to-beat** once full, a **drought counter**, and a
  reduced-motion-safe flourish.
- **Trophy replay** — tapping a trophy re-spins the reels into its saved grid, reusing
  `ReelGrid`'s existing `spinning` + `trailKey` animation; instant reveal under
  reduced-motion; never collides with a live spin or auto-spin.
- **Earned-in-the-moment feedback** — a badge/flourish on the existing celebration when
  a spin enters the top 10 (and a distinct one when it takes #1).
- **Honest naming** — rename the "Session stats" sheet, since the record survives
  reloads. The `zany:stats` storage key stays (renaming it would orphan history).
- **Clear semantics** — the clear action clears trophies too; say so in the sheet's note.

### Explicitly out of scope
- Any engine change, new payline/paytable/math work, or new machine.
- Cross-session or cross-device persistence, accounts, sharing, export, screenshots,
  or leaderboards (DEC-005: no backend, no PII, no cross-session identity).
- Audio of any kind, including a trophy sting — `src/ui/audio/**` is untouched; the
  audio-quality overhaul is a separate parked wave.
- STAGE-011 **Tier 2** remote analytics sinks — remain gated behind a DEC-005
  amendment + an explicit user go. No new `track()` event types in this wave.
- **Best-per-machine strip / per-machine trophy cases** — considered and declined for
  this wave (fast-follow candidate); the case is aggregate across machines.
- All-time (vs session) records, or a "worst loss" counterpart.
- Real money, in any form (constraint `no-real-money`).

## Decisions this project will need

- **DEC-0NN — the trophy model** (authored at the first spec): what a trophy stores,
  N and why, the tie/insert rule, and the FIFO/cap policy. Extends **DEC-020** (the
  session-stats model) rather than superseding it. N = 10 and the ranked
  full-card/compact-row presentation are recorded here as the user's framing decision.
- **DEC-0NN — additive persisted-schema evolution** (may be folded into the above):
  the rule that a purely additive field normalizes on read instead of bumping
  `STATS_VERSION`, and when that rule stops applying. This is the reusable lesson.
- No DEC-005 amendment is needed — everything stays client-side.
- A **DEC-021 note** if the "unknown machineId" fallback is judged to need more than
  the registry's current default-machine behavior.

## Settled at framing (user decisions, 2026-07-23)

- **N = 10.** A deeper collection and a longer chase (beating #10 stays achievable).
  Costs ~5–6 KB of blob and, naively rendered, a long phone scroll — mitigated by the
  ranked presentation below rather than by cutting N.
- **Placement: the top zone of the existing stats sheet.** The sheet's hierarchy
  inverts — trophies first, numbers below — and the current "Biggest win" tile is
  promoted into the #1 trophy. No sixth header trigger; the header already carries
  five controls at 375px.
- **Ranked presentation (design answer to N=10 on a phone):** **#1–#3 render as full
  trophy cards** (hero 5×3 grid, medal, tier framing, machine + spin number);
  **#4–#10 render as compact rows** (thumbnail grid, amount, machine) that **expand in
  place on tap** to the full card. Depth without the scroll marathon, and it keeps the
  podium meaningful.

## Open Questions

- **Ties.** Proposed: a new win enters only on a **strictly greater** amount than the
  entry it displaces, so the earliest of equal wins keeps the higher rank — consistent
  with `biggestWin`'s existing tie rule.
- **`biggestWin` vs `topWins[0]`.** Proposed: keep `biggestWin` as-is (nothing reads it
  wrongly, and removing it is a breaking schema change for zero gain); `topWins[0]`
  becomes the display source and the two are asserted consistent in tests.
- **Compact-row grid legibility.** A thumbnail 5×3 emoji grid at 375px may be too small
  to read at all, in which case rows 4–10 show amount + machine + tier only until
  expanded. Settle on a real device, not in a preview.

## Stage Plan

Two stages: the data has to exist before it can be shown, and the split keeps the
schema-safety work reviewable on its own rather than buried in a UI diff.

- [ ] STAGE-014 — **Trophy data model + record seam**: the `TopWin` type, the bounded
      insert reducer, the forward-compatible `readStats()` normalization (no version
      bump, existing history preserved), and widening the `useSlotMachine` record seam
      to pass `grid` + `lineWins`. No visible UI change. ~2 specs (SPEC-073, SPEC-074).
- [ ] STAGE-015 — **The trophy case**: trophy grid rendering (reusing `ReelGrid`), the
      ranked case at the top of the renamed record sheet (full cards #1–#3, tap-to-expand
      rows #4–#10, locked-plinth empty state, bet multiplier, bar-to-beat, drought
      counter), **trophy replay**, and the "trophy earned" moment on the win celebration.
      4 specs (SPEC-075–078).

**Count:** 0 shipped / 0 active / 2 pending

## Dependencies

### Depends on
- **PROJ-002 (shipped):** the session-stats model + safe versioned storage (STAGE-009,
  DEC-020), per-machine symbol identity (STAGE-012, DEC-021), the machine registry,
  the sheet/backdrop/Esc/focus idiom, and the design-token system (DEC-010).
- **PROJ-001 (shipped):** the pure engine and its `SpinResult` contract (DEC-001) —
  consumed read-only; nothing here asks the engine for anything new.
- **External:** none. No backend, no new dependency, no operator step.

### Enables
- An all-time (vs per-session) records surface, if that ever becomes wanted.
- A machine-aware `JackpotMoment` (PROJ-002's deferred cosmetic) — the same
  "re-render a grid in its own machine's creatures" component solves it.
- A fun-proxy signal for any future data-grounded retune: trophy amounts and the
  spins-between-trophies gap are exactly what a tuning loop would want to look at.

## Project-Level Reflection

*Filled in when status moves to shipped.*

- **Did we deliver the outcome in "What This Project Is"?** <yes/no + notes>
- **How many stages did it actually take?** <number, compare to plan>
- **What changed between starting and shipping?** <one or two sentences>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **What did we defer to the next project?**
  - <one-line items>
