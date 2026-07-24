---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-074
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-003
  stage: STAGE-014
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-23

references:
  decisions:
    - DEC-001   # engine-no-dom: the seam reads the SpinResult the engine already returned
    - DEC-005   # no backend: recording stays client-side, guarded
    - DEC-020   # the session-stats model + recording seam this completes
    - DEC-024   # the trophy model whose grid/lineWins this spec finally supplies
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-073  # shipped the model with grid/lineWins OPTIONAL for compat; this discharges that debt
    - SPEC-055  # the StatsProvider seam this flows through

value_link: >-
  Completes STAGE-014: the trophy model stops being theoretically populated and starts
  actually collecting, because the one call site that holds the full outcome finally hands
  over the reels it was discarding.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-23
      note: >-
        Design authored on the main Opus loop (un-metered). Small spec: one production call site plus
        a type tightening (grid/lineWins optional → required) that discharges the compat debt SPEC-073
        deliberately created and its reflection flagged as this spec's job.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 106299    # from Agent result subagent_tokens
      estimated_usd: 0.70     # 106299 tok x $6.6/M (Sonnet list, no cache discount) - order-of-magnitude
      duration_minutes: 8.7   # 523287 ms
      recorded_at: 2026-07-23
      note: >-
        Passed outcome.grid/lineWins through the recordSpin call site, tightened SpinRecordInput
        to require them, simplified the trophy condition to input.totalWin > 0, and fixed all 17
        compiler-flagged test call sites (sessionStats.test.ts, statsStorage.test.ts,
        StatsProvider.test.tsx) by adding grid/lineWins fixtures without weakening any assertion.
        Added the two hook-level tests to useSlotMachine.test.tsx, driving the real hook inside a
        StatsProvider wrapper (renderHook returning {slot, stats}) — proven to depend on the
        call-site change by construction. Full gate green (typecheck, test x953, build, validate,
        cost-audit); eslint on src/**/*.{ts,tsx} exits 0; src/engine/** and src/ui/audio/** diffs
        empty.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-5
      tokens_total: 77174     # from Agent result subagent_tokens
      estimated_usd: 0.51     # 77174 tok x $6.6/M (Sonnet list, no cache discount) - order-of-magnitude
      duration_minutes: 53.9  # 3236024 ms
      recorded_at: 2026-07-23
      note: >-
        Cold review + guard-mutations, all confirmed as specified: (1) reverting the call
        site to the pre-spec `{ totalWin, bet, tier }` shape (with grid/lineWins made
        optional + cast to compile) made the new winning-spin hook test FAIL
        (topWins[0].grid undefined) — the test has teeth, not decorative; reverted clean,
        diff matches original exactly, green again. (2) call site `lineWins: []` broke the
        hook test's lineWins assertion as expected. (3) `input.totalWin > 0` → `>= 0` broke
        "a losing spin records no trophy" as expected. All 3 mutations reverted cleanly.
        Diffed all ~17 updated test call sites: additions only, no weakened/deleted
        assertions. Scope confirmed: src/engine/** and src/ui/audio/** diffs empty, no
        STAGE-015 UI. No .only/.skip/xit/.todo in changed test files. Full gate green
        (typecheck, test 953/953, build, validate, cost-audit); eslint on src/**/*.{ts,tsx}
        exits 0 (just lint's 1458 errors are entirely .claude/worktrees/** dist output +
        audio-spike.html, confirmed none from src/**). 0 defects found. Verdict: APPROVED.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-23
      note: >-
        main-loop, not separately metered (AGENTS 4); ship cycle. Full gate re-run green,
        PR + CI-poll to 7/7 + squash-merge, stage rollup, archive, brag, cost bookkeeping.
        Verify's critical call-site-revert mutation is the evidence that mattered here: it
        proved the new hook test actually fails when the seam is disconnected, which is the
        one thing this spec exists to guarantee.
  totals:
    tokens_total: 183473   # build 106299 + verify 77174 (design/ship un-metered main-loop)
    estimated_usd: 1.21    # build 0.70 + verify 0.51
    session_count: 4       # design, build, verify, ship
---

# SPEC-074: Record-seam widening

## Context

SPEC-073 shipped the `TopWin` model and made `readStats()` forward-compatible, but left
`grid` and `lineWins` **optional** on `SpinRecordInput` for one deliberate reason: making
them required would have broken the existing `recordSpin(...)` call in
`src/ui/useSlotMachine.ts`, which was out of that spec's scope. The consequence is that
today the trophy path is dead code in production — `useSlotMachine` still passes only
`{ totalWin, bet, tier }`, so `input.grid` is always `undefined` and **no trophy is ever
recorded**, no matter how big the win.

This spec closes that gap and discharges the debt. It is the last spec in STAGE-014;
when it ships, the app is silently collecting trophies with no visible change.

## Goal

Pass `outcome.grid` and `outcome.lineWins` through `recordSpin` at the `useSlotMachine`
call site, and tighten `SpinRecordInput` so `grid` and `lineWins` are **required** — making
a future call site that forgets them a compile error rather than a silent trophy blackout.

## Inputs

- **Files to read:**
  - `src/ui/useSlotMachine.ts` (~line 222) — the call site holding the full `SpinOutcome`
  - `src/stats/sessionStats.ts` — `SpinRecordInput`, `recordSpin`
  - `src/ui/stats/StatsProvider.tsx` + `.test.tsx` — the seam and its tests
  - `src/stats/sessionStats.test.ts`, `src/stats/statsStorage.test.ts` — call sites to update
- **Related code paths:** `src/ui/`, `src/stats/`

## Outputs

- **Files modified:**
  - `src/ui/useSlotMachine.ts` — pass `grid: outcome.grid, lineWins: outcome.lineWins`.
  - `src/stats/sessionStats.ts` — `grid` / `lineWins` become required on `SpinRecordInput`;
    the `&& input.grid` guard in `recordSpin` is no longer needed (trophy condition
    reduces to `input.totalWin > 0`).
  - `src/ui/stats/StatsProvider.test.tsx`, `src/stats/sessionStats.test.ts`,
    `src/stats/statsStorage.test.ts` — supply a grid at every `recordSpin` call site.
  - `src/ui/useSlotMachine.test.tsx` (or equivalent) — new trophy-accumulation test.
- **New exports:** none.

## Acceptance Criteria

- [x] `useSlotMachine`'s `recordSpin` call passes `grid` and `lineWins` from `outcome`.
- [x] `grid` and `lineWins` are **required** on `SpinRecordInput`; omitting either is a
      TypeScript error.
- [x] `recordSpin`'s trophy condition is `input.totalWin > 0` (the `&& input.grid` compat
      guard is removed, since the type now guarantees it).
- [x] A winning spin driven through the real hook + `StatsProvider` produces a `topWins`
      entry whose `grid` deep-equals the outcome's grid and whose `lineWins` deep-equal the
      outcome's lineWins. **This is the test that proves the seam is actually connected** —
      it must drive the hook, not call the reducer directly.
- [x] A losing spin driven the same way produces no trophy.
- [x] All existing tests still pass (call sites updated, no behavior change to counters,
      `biggestWin`, or `series`).
- [x] `src/engine/**` diff is empty; `src/ui/audio/**` untouched; no new dependency.

## Failing Tests

- **`src/ui/useSlotMachine.test.tsx`** (add; follow the file's existing render/act idiom
  and its existing `StatsProvider` wrapper pattern if present — otherwise wrap the hook in
  `<StatsProvider>`)
  - `"a winning spin records a trophy carrying the outcome's grid and lineWins"` — render
    the hook inside a `StatsProvider` with a seed/machine that yields a win, spin, advance
    timers past the reveal, then read the persisted/`useStats()` stats and assert
    `topWins.length === 1`, `topWins[0].grid` deep-equals the revealed grid, and
    `topWins[0].lineWins` deep-equals the revealed lineWins.
  - `"a losing spin records no trophy"` — same setup with a losing outcome; assert
    `topWins` stays empty while `spins` increments.
- **`src/stats/sessionStats.test.ts`** — existing tests updated to pass a grid; no new
  assertions required beyond keeping them green.

## Implementation Context

### Decisions that apply

- `DEC-024` — the trophy model. This spec supplies the `grid`/`lineWins` it defined.
- `DEC-020` — the recording seam's shape (input + machineId) is unchanged; only the input
  widens.
- `DEC-001` — the seam reads the `SpinOutcome` the engine already returned. **No engine
  change.** Do not import engine internals; `useSlotMachine` already has `outcome`.

### Constraints that apply

- `engine-no-dom` — engine untouched (empty diff).

### Prior related work

- `SPEC-073` (shipped, PR #85) — the model. Its ship reflection names this spec as the
  step that flips `grid`/`lineWins` from optional-for-compat to actually supplied.

### Out of scope (for this spec specifically)

- Any UI rendering of `topWins` — that is STAGE-015 (SPEC-075+).
- Any change to `series`, cash-ins, `biggestWin`, analytics/`track()`, or audio.
- Any change to spin timing or the celebration.

## Notes for the Implementer

The production change is two properties:

```ts
      recordSpin(
        { totalWin: outcome.totalWin, bet, tier: outcome.tier,
          grid: outcome.grid, lineWins: outcome.lineWins },
        machine.id,
      );
```

In `src/stats/sessionStats.ts`, make the fields required:

```ts
export type SpinRecordInput = Pick<SpinResult, 'totalWin' | 'bet' | 'tier'> & {
  grid: Grid;
  lineWins: LineWin[];
};
```

…and simplify the trophy condition (the type now guarantees a grid):

```ts
  const topWins =
    input.totalWin > 0
      ? insertTopWin(stats.topWins, {
          amount: input.totalWin,
          machineId,
          tier: input.tier,
          bet: input.bet,
          grid: input.grid,
          lineWins: input.lineWins,
          spinIndex: spins,
        })
      : stats.topWins;
```

(`input.lineWins ?? []` can become `input.lineWins`.)

Then fix the ~15 test call sites the compiler points at. Most files already define a
shared `G` / `LW` fixture from SPEC-073's tests — reuse it; add one where missing. Do not
weaken any existing assertion to make it compile.

**The hook test is the point of this spec.** A test that calls the reducer directly proves
nothing here — SPEC-073 already covers the reducer. The new test must drive
`useSlotMachine` so it would fail if someone reverted the call-site change. Check how the
existing `useSlotMachine.test.tsx` fakes timers and picks seeds; reuse that machinery
rather than inventing new.

### Adversarial guard-mutations for verify

1. Remove `grid: outcome.grid` from the call site ⇒ must fail to compile (type error is
   the guard here) — note it as a compile-time guard rather than a runtime test break.
2. Change the call site to pass `lineWins: []` ⇒ breaks the hook test's lineWins assertion.
3. `input.totalWin > 0` → `>= 0` ⇒ breaks "a losing spin records no trophy".

### Do NOT

- Do not touch `src/engine/**`, `src/ui/audio/**`, or any STAGE-015 UI.
- Do not `git add -A`.

---

## Build Completion

- **Branch:** `feat/spec-074-record-seam`
- **PR (if applicable):** none yet — not opened per instructions.
- **All acceptance criteria met?** Yes, all 7 boxes:
  - `useSlotMachine`'s `recordSpin` call passes `grid`/`lineWins` from `outcome` — done.
  - `grid`/`lineWins` required on `SpinRecordInput` — done; omitting either is now a
    compile error (confirmed via the compiler flagging every prior call site missing
    them).
  - Trophy condition simplified to `input.totalWin > 0`, compat guard and `?? []`
    removed — done.
  - New hook test drives the real `useSlotMachine` inside a `StatsProvider` and asserts
    `topWins[0].grid`/`lineWins` deep-equal the revealed grid/lineWins — done
    (`"a winning spin records a trophy carrying the outcome's grid and lineWins"`).
  - Losing-spin hook test asserts `topWins` stays empty while `spins` increments — done.
  - All existing tests still pass, no assertion weakened — done (953/953 green; the ~17
    compiler-flagged call sites got real `grid`/`lineWins` fixtures, mostly reusing the
    existing `G`/`LW` const in each file, one new fixture added to
    `StatsProvider.test.tsx` which previously had none).
  - `src/engine/**` and `src/ui/audio/**` diffs empty — confirmed.
- **New decisions emitted:** none — this spec discharges debt DEC-024/DEC-020 already
  described; no new architectural choice was made.
- **Deviations from spec:** none of substance. The Notes-for-the-Implementer code block
  was used close to verbatim; the only judgment call was the shape of the new hook test
  (a single `renderHook` returning `{ slot: useSlotMachine(...), stats: useStats() }`
  under a `StatsProvider` wrapper) since the spec left the exact wiring to the
  implementer and the existing file had no precedent for combining both hooks.
- **Follow-up work identified:** none beyond the already-planned STAGE-015 specs
  (SPEC-075+) for rendering `topWins` in the UI.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing really; the Notes
   for the Implementer gave the exact diff. The only open decision was how to structure
   the new hook test's `renderHook` call, since no prior test in the file combined
   `useSlotMachine` with `useStats()` under a shared wrapper.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No.
   `engine-no-dom` and the "don't touch STAGE-015 UI" scope note were sufficient guardrails.
3. **If you did this task again, what would you do differently?** — Nothing meaningfully
   different; the spec was tightly scoped and the drop-in code matched the actual
   codebase shape exactly, so there was no rework.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Split the compat debt differently. SPEC-073
   shipped `grid`/`lineWins` as optional purely so the tree would typecheck, which meant the
   trophy path was *merged to main as dead code* — correct by unit test, inert in production,
   for one whole spec. Nothing broke, but "shipped and provably tested" and "actually doing
   anything" were two different states for a full cycle, and only this spec's hook test could
   tell them apart. If a spec must land a feature inert, the spec should say so in its own
   Context (SPEC-073's did) *and* the stage should not be considered demonstrable until the
   seam spec lands.

2. **Does any template, constraint, or decision need updating?** — No template change. The
   reusable lesson is about test altitude: a reducer test proves a reducer, never a seam.
   The only test that could distinguish "connected" from "disconnected" here was one that
   drove the real hook through the real provider — and verify's call-site-revert mutation is
   what proved that test wasn't decorative. Worth carrying: **when a spec's whole value is
   "X is wired to Y", the acceptance test must exercise the wire, and verify must mutate the
   wire to prove the test would notice.**

3. **Is there a follow-up spec I should write now before I forget?** — No. STAGE-014 is
   complete (2/2) and the model is now genuinely collecting. STAGE-015 (SPEC-075–078) is
   already framed and is the direct continuation: render what this now persists.
