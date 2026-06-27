---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-021
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-001
  stage: STAGE-004
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-06-27

references:
  decisions:
    - DEC-001
    - DEC-005
  constraints:
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-013
    - SPEC-016
    - SPEC-019

value_link: "Foundation for STAGE-004's celebrations: a one-shot celebration signal (a monotonic id that increments per resolved win, carrying tier/totalWin/lineWins; null on a no-win) so the count-up, paw-print trail, particles, jackpot moment, and jingle each fire exactly once per win — not on every render."

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-021: Win-state router

## Context

The celebration specs that follow (balance count-up SPEC-022, paw-print trail
SPEC-023, particles SPEC-024, the wolf jackpot moment SPEC-025, and the win
jingle SPEC-027) each need to fire **once per win** — exactly when a spin
resolves to a win — not on every React render. Today the hook exposes `tier`,
`lineWins`, and `lastWin`, but those are plain state: a consumer that does
`useEffect(..., [lastWin])` would mis-fire (two equal wins in a row produce the
same `lastWin`, so the effect would NOT re-run) and has no single "a new win just
landed" edge to key off.

This spec adds that edge: a **one-shot `celebration` signal** — an object with a
**monotonically incrementing `id`** that changes only when a fresh win resolves,
carrying the win's `tier` / `totalWin` / `lineWins`, and `null` on a no-win (or
after `reset()`). Downstream celebrations key their `useEffect` on
`celebration?.id`, so each fires exactly once per resolved win. Pure UI state
derived from the engine's already-returned outcome — no engine change, no new
game math (DEC-001), and nothing fired on a non-win (DEC-005 taste note: only
what actually landed).

See `STAGE-004-win-celebration-and-juice.md`, `DEC-001` (engine/presentation
split), `DEC-005` (play-money / no faked anticipation), and SPEC-013/SPEC-016's
`useSlotMachine` timed-resolve flow that this hooks into.

## Goal

Add a `celebration: Celebration | null` field to `useSlotMachine`, set at spin
resolve to a new object (`{ id, tier, totalWin, lineWins }`, `id` strictly
increasing per win) when the resolved spin won, and to `null` when it did not
win or after `reset()`. No rendering change — this is the signal foundation the
later celebration specs consume.

## Inputs

- **Files to read:** `src/ui/useSlotMachine.ts` (+ `useSlotMachine.test.tsx`),
  `src/engine/index.ts` (`SpinResult` — `tier`, `totalWin`, `lineWins`),
  `src/ui/reels/symbols.ts` (test seeds context).
- **Related code paths:** `src/ui/`.

## Outputs

- **Files created:** none.
- **Files modified:**
  - `src/ui/useSlotMachine.ts` — export a `Celebration` interface; add a
    `celebration: Celebration | null` field to `UseSlotMachineResult`; track a
    monotonic id via a `useRef`; set `celebration` in the spin-resolve callback
    (object on a win, `null` on a no-win); `reset()` sets it to `null`; return it.
  - `src/ui/useSlotMachine.test.tsx` — add the celebration tests below.
- **New exports:** `Celebration` (interface) and `celebration` on
  `UseSlotMachineResult`.
- **Database changes:** none.

## Acceptance Criteria

Testable outcomes.

- [ ] `useSlotMachine` exports a `Celebration` interface
      `{ id: number; tier: WinTier; totalWin: number; lineWins: LineWin[] }`
      and exposes `celebration: Celebration | null` on its result.
- [ ] `celebration` starts `null`.
- [ ] After a **winning** spin resolves (advance `SPIN_DURATION_MS`),
      `celebration` is non-null with `tier`/`totalWin`/`lineWins` equal to the
      engine outcome (seed 276 → `tier: 'big'`, `totalWin: 55`, `lineWins.length
      === 3`).
- [ ] After a **losing** spin resolves, `celebration` is `null` (seed 12345).
- [ ] `celebration.id` **strictly increases** across successive wins — two
      winning spins yield a second `id` greater than the first (fire-once edge).
- [ ] The jackpot seed (407947) yields `celebration.tier === 'jackpot'` — the
      router maps every winning tier through unchanged.
- [ ] `reset()` sets `celebration` back to `null`.
- [ ] Engine unchanged; `celebration` is built only from the engine `SpinOutcome`
      (no UI-side game math); gate (`typecheck`/`lint`/`test`/`build`) exits 0.

## Failing Tests

Written during **design**, BEFORE build. Hook flow uses fake timers (advance by
`SPIN_DURATION_MS` to resolve), as established in SPEC-016. Import
`SPIN_DURATION_MS` from the hook; pin outcomes with `opts.nextSeed`.

- **`src/ui/useSlotMachine.test.tsx`** (extended — new `describe('celebration …')`)
  - `"celebration starts null"` — fresh hook → `result.current.celebration === null`.
  - `"celebration is set on a winning spin"` — `nextSeed: () => 276`; `act(spin)`
    then advance `SPIN_DURATION_MS` → `celebration` is non-null with
    `tier === 'big'`, `totalWin === 55`, `lineWins.length === 3`.
  - `"celebration is null after a losing spin"` — `nextSeed: () => 12345`; spin +
    advance → `celebration === null`.
  - `"celebration carries the jackpot tier"` — `nextSeed: () => 407947`; spin +
    advance → `celebration.tier === 'jackpot'` and `celebration.totalWin === 2000`.
  - `"celebration id strictly increases across wins"` — `nextSeed: () => 276`
    (each spin wins 55); spin+advance → capture `id1`; spin+advance again →
    `celebration.id > id1` (e.g. `id1 === 1`, then `2`).
  - `"reset clears celebration"` — after a winning spin (celebration non-null),
    `act(reset)` → `celebration === null`.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-001` — `celebration` is derived purely from the engine's `SpinOutcome`
  (`tier`/`totalWin`/`lineWins`); the UI computes no game logic and the engine is
  untouched.
- `DEC-005` — celebration fires only on an actual win (`totalWin > 0`); a no-win
  yields `null`. No faked/anticipated celebration.

### Constraints that apply

- `test-before-implementation` — the celebration tests above are written in this
  design cycle and made to pass during build.
- `one-spec-per-pr` — this PR adds only the celebration signal.

### Prior related work

- `SPEC-013` (shipped) — `useSlotMachine` resolves a `SpinResult`; `tier` /
  `lineWins` already surfaced.
- `SPEC-016` (shipped) — the timed `spinning → resolved` flow; the resolve
  callback (after `SPIN_DURATION_MS`) is where `celebration` is set.
- `SPEC-019` (shipped) — `lastWin` is set in the same resolve callback; mirror
  its placement and its `reset()` clearing.

### Out of scope (for this spec specifically)

- Any rendering / visible celebration — App and the regions do NOT consume
  `celebration` yet. The count-up (SPEC-022), paw-print trail (SPEC-023),
  particles (SPEC-024), jackpot moment (SPEC-025), and jingle (SPEC-027) are the
  consumers, each its own spec.
- Clearing the celebration when a new spin *starts* — not required; the id edge
  is what makes consumers fire once. Leave the prior celebration in place during
  the next `spinning` phase; it is replaced (or nulled) at the next resolve.

## Notes for the Implementer

- Add the interface near the top of `useSlotMachine.ts` (export it):
  ```ts
  export interface Celebration {
    id: number;
    tier: WinTier;       // 'small' | 'big' | 'jackpot' (never 'none' — only set on a win)
    totalWin: number;    // > 0
    lineWins: LineWin[];
  }
  ```
  `WinTier` and `LineWin` are already imported from `../engine/index`.
- State + monotonic id:
  ```ts
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const celebrationIdRef = useRef(0);
  ```
  A `useRef` counter (not derived from `celebration?.id`) guarantees ids are
  globally unique and strictly increasing even when a `null` no-win sits between
  two wins.
- In the spin-resolve callback (the `setTimeout` body, alongside the existing
  `setLastWin(outcome.totalWin)`):
  ```ts
  if (outcome.totalWin > 0) {
    celebrationIdRef.current += 1;
    setCelebration({
      id: celebrationIdRef.current,
      tier: outcome.tier,
      totalWin: outcome.totalWin,
      lineWins: outcome.lineWins,
    });
  } else {
    setCelebration(null);
  }
  ```
- In `reset()` add `setCelebration(null)` (next to the existing `setLastWin(0)`).
  Do NOT reset `celebrationIdRef` — ids stay monotonic across a reset.
- Add `celebration` to the `UseSlotMachineResult` interface and the returned
  object. No other file changes; App keeps working unchanged (the field is
  opt-in for future consumers).
- This is a hook-only spec — **no CSS, no animation, no reduced-motion path**
  here (those belong to the consumer specs). The gate must stay green and all
  existing hook tests must keep passing.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?** yes/no
- **New decisions emitted:**
  - `DEC-NNN` — <title> (if any)
- **Deviations from spec:**
  - [list]
- **Follow-up work identified:**
  - [any new specs for the stage's backlog]

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — <answer>

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — <answer>

3. **If you did this task again, what would you do differently?**
   — <answer>

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
