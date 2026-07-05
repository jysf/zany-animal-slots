---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-043
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-007
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-04

references:
  decisions:
    - DEC-015                       # config-driven machine model — the default machine is the contract subject
    - DEC-002                       # deterministic RNG — the four frozen seeds ARE the contract
  constraints:
    - test-before-implementation
    - one-spec-per-pr
    - no-new-top-level-deps-without-decision
  related_specs:
    - SPEC-039                       # spin-parity.test.ts (039's change-scoped guard; this consolidates + deepens)
    - SPEC-042                       # the registry (getActiveMachine) whose resolved machine this contract exercises
    - SPEC-011                       # the public engine interface the contract calls

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-007's <capability>". Optional; null is acceptable.
value_link: "The stage's durable regression guard: one contract test runs the four frozen seeds through the REGISTRY-resolved default machine (getActiveMachine) end-to-end and pins the full outcome — grid shape, lineWins, totalWin, tier, AND balance — plus registry==explicit-default. Consolidates the per-spec parity assertions accumulated across 039–042 into the named contract any future machine/engine change must keep green. Test-only; closes STAGE-007."

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
# Record a REAL tokens_total for metered cycles (build/verify) — the
# orchestrator fills it from the Agent result's subagent_tokens at ship
# (or /cost interactively). Only un-metered main-loop cycles (design/ship)
# may be null-with-note. `just cost-audit` enforces this on shipped specs.
# See AGENTS.md §4 and docs/cost-tracking.md. interface: claude-code |
# claude-ai | api | ollama | other.
cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 20
      recorded_at: 2026-07-04
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (the stage's frozen-seed machine-parity CONTRACT test — the four seeds through getActiveMachine() pin grid-shape/lineWins/totalWin/tier/balance + registry==explicit-default; consolidates 039's spin-parity into the durable named guard. Test-only, no production change; final STAGE-007 spec). Pinned only the values already established by the frozen-seed contract + existing tests to avoid inventing fixtures."
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 15
      recorded_at: 2026-07-05
      notes: "orchestrator to fill tokens_total from subagent_tokens. Created src/machines/machine-parity.contract.test.ts verbatim from the spec's Notes drop-in (no edits). Cross-checked all frozen-seed values against spin-parity.test.ts and index.test.ts before running — all matched, no regression. Full gate green (typecheck, lint, test [307 passed, 52 files], build); just validate passed; git diff main..HEAD -- src/engine/ src/ui/ confirmed empty. No production code touched."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-043: machine parity contract test

## Context

The **final** STAGE-007 spec — the stage's **durable regression guard**. STAGE-007
deliberately unfroze the engine (SPEC-039/040), threaded the presentation (SPEC-041), and
closed the config-driven loop with the registry + hook (SPEC-042). Every one of those
changes was gated by frozen-seed parity assertions, but they're scattered across per-spec
tests (`spin-parity.test.ts`, `tiers.test.ts`, `useSlotMachine.test.tsx`). This spec
consolidates them into one **named contract test**: the four frozen seeds run through the
**registry-resolved default machine** (`getActiveMachine()`) end-to-end and pin the full
outcome — grid shape, `lineWins`, `totalWin`, `tier`, **and** `balance` — plus
registry==explicit-default. It's the "frozen seeds are the contract" formalization: the
single test any future machine or engine change must keep green.

Test-only — **no production code changes**. It exercises the fully-assembled pipeline
(registry → `spin({ …, machine })`) proving the default machine "Wild & Whimsical" behaves
byte-identically to the pre-STAGE-007 game. After it ships, STAGE-007 is complete.

See `STAGE-007` (backlog slot 6 of 6 — the regression guard), `PROJ-002`, DEC-002 (the four
frozen seeds), DEC-015 (the default machine is the contract subject).

## Goal

Add one contract test that runs the four frozen seeds (407947 / 12345 / 276 / 12) through
the registry-resolved default machine and pins the full outcome (grid shape, `lineWins`,
`totalWin`, `tier`, `balance`) plus registry==explicit-default — the durable STAGE-007
regression guard. No production code change.

## Inputs

- **Files to read:**
  - `src/engine/index.ts` — the public `spin({ seed, balance, bet, machine })` +
    `WILD_AND_WHIMSICAL_MATH` re-export.
  - `src/machines/registry.ts` — `getActiveMachine()` (the resolved default machine).
  - `src/engine/spin-parity.test.ts` — SPEC-039's frozen-seed guard (the pattern this
    consolidates + deepens; the pinned totalWin/tier values to reuse).
  - `src/engine/index.test.ts` — the pinned seed-12345 grid + the 276/12 balances.
  - `SECURITY.contract.test.ts` / `src/ui/perf.contract.test.ts` — the `*.contract.test.*`
    naming convention this follows.
- **External APIs:** none.
- **Related code paths:** `src/machines/` (test lives here), `src/engine/`.

## Outputs

- **Files created:**
  - `src/machines/machine-parity.contract.test.ts` — the frozen-seed contract test.
- **Files modified:** none (test-only).
- **New exports:** none. **New dependency:** none. **New decision:** none.

## Acceptance Criteria

- [ ] **The contract test exists** at `src/machines/machine-parity.contract.test.ts` and
      runs under vitest (a plain `.ts`, no JSX).
- [ ] **Registry resolves the default machine:** `getActiveMachine().math` is (===)
      `WILD_AND_WHIMSICAL_MATH`, and `getActiveMachine().id === 'wild-and-whimsical'`.
- [ ] **Frozen-seed outcomes through the active machine** (all at `balance: 1000, bet: 10`,
      `machine: getActiveMachine().math`):
      - seed **407947** → `ok`, `totalWin 2000`, `tier 'jackpot'`, `balance 2990`, and some
        `lineWins` entry has `symbol 'WOLF'` + `count 5`.
      - seed **12345** → `ok`, `totalWin 0`, `tier 'none'`, `balance 990`, `lineWins` `[]`,
        and `grid` deep-equals the pinned 5×3 grid (see Notes).
      - seed **276** → `ok`, `totalWin 55`, `tier 'big'`, `balance 1045`, `lineWins.length 3`.
      - seed **12** → `ok`, `totalWin 10`, `tier 'small'`, `balance 1000`, `lineWins.length 1`.
      - every `grid` is 5 reels × 3 rows.
- [ ] **Registry == explicit default:** for each of the four seeds, `spin({ …, machine:
      getActiveMachine().math })` deep-equals `spin({ …, machine: WILD_AND_WHIMSICAL_MATH })`.
- [ ] Full gate green (`just typecheck && just lint && just test && just build`); no new
      dependency; `just validate` passes; `git diff main..HEAD -- src/engine/ src/ui/` shows
      no production change (only the new test file under `src/machines/`).

## Failing Tests

Written during **design**, BEFORE build — this spec IS a test, so the "failing test" is the
deliverable. All pinned values below are already established (SPEC-039 spin-parity +
`index.test.ts` + the frozen-seed contract); do not invent new fixtures.

- **`src/machines/machine-parity.contract.test.ts`** — the drop-in in Notes. Structure:
  one `describe` with (a) the registry-resolves-default case, (b) one case per frozen seed
  asserting the pinned scalars + grid shape (+ exact grid for 12345), and (c) the
  registry==explicit-default equivalence loop over all four seeds.

## Implementation Context

*Read this section before starting the build cycle.*

### Decisions that apply

- `DEC-002` — the four frozen seeds are the deterministic contract; this test names them.
- `DEC-015` — the default machine "Wild & Whimsical" is the contract subject; the test goes
  through `getActiveMachine()` (SPEC-042's registry) to exercise the assembled pipeline.

### Constraints that apply

- `test-before-implementation` — the test is the whole deliverable.
- `one-spec-per-pr` — only the contract test; no production change.
- `no-new-top-level-deps-without-decision` — none.

### Prior related work

- `SPEC-039` `spin-parity.test.ts` — the change-scoped frozen-seed guard; this consolidates
  it into the named durable contract and adds `balance` + the exact grid + registry
  resolution. The intentional overlap is defense-in-depth (leave `spin-parity.test.ts` in
  place). `SPEC-042` — `getActiveMachine()`. `SPEC-011` — the public engine interface.

### Out of scope (for this spec specifically)

- **Any production code change** — this is a test. If a frozen-seed value does NOT match,
  that's a real regression somewhere in 038–042; STOP and set `[?]` rather than "fixing" the
  fixture to match.
- **Deleting `spin-parity.test.ts`** — keep it; the overlap is intentional.
- **Per-machine theme/audio, selector, 2nd machine** — STAGE-008.

## Notes for the Implementer

- **All pinned values are known — do not invent.** They come from the frozen-seed contract
  (KEY FACTS), `spin-parity.test.ts`, and `index.test.ts`. If any assertion fails, it means a
  real behavior regression accreted across 038–042 — STOP and flag `[?]`; do NOT change the
  expected value to make it pass.
- **Drop-in — `src/machines/machine-parity.contract.test.ts`:**
  ```ts
  // STAGE-007 machine-parity contract — the durable regression guard (SPEC-043).
  // The four frozen seeds (DEC-002) run through the REGISTRY-resolved default machine
  // (getActiveMachine, SPEC-042) and pin the full outcome. Any future machine/engine change
  // must keep this green. Consolidates SPEC-039's spin-parity.test.ts + adds balance, the
  // exact grid, and registry resolution. Test-only; no production code.
  import { describe, it, expect } from 'vitest';
  import { spin, WILD_AND_WHIMSICAL_MATH } from '../engine/index';
  import { getActiveMachine } from './registry';

  const activeMath = getActiveMachine().math;
  const run = (seed: number) =>
    spin({ seed, balance: 1000, bet: 10, machine: activeMath });

  describe('STAGE-007 machine-parity contract — frozen seeds through the active machine', () => {
    it('the registry resolves the default machine', () => {
      expect(getActiveMachine().math).toBe(WILD_AND_WHIMSICAL_MATH);
      expect(getActiveMachine().id).toBe('wild-and-whimsical');
    });

    it('seed 407947 → jackpot (2000, five WOLF, balance 2990)', () => {
      const r = run(407947);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.totalWin).toBe(2000);
      expect(r.tier).toBe('jackpot');
      expect(r.balance).toBe(2990);
      expect(r.lineWins.some((w) => w.symbol === 'WOLF' && w.count === 5)).toBe(true);
      expect(r.grid).toHaveLength(5);
      for (const reel of r.grid) expect(reel).toHaveLength(3);
    });

    it('seed 12345 → losing (0 / none, balance 990, exact grid)', () => {
      const r = run(12345);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.totalWin).toBe(0);
      expect(r.tier).toBe('none');
      expect(r.balance).toBe(990);
      expect(r.lineWins).toEqual([]);
      expect(r.grid).toEqual([
        ['FOX', 'DEER', 'FOX'],
        ['DEER', 'FOX', 'BEAR'],
        ['DEER', 'FOX', 'WOLF'],
        ['FOX', 'BEAR', 'EAGLE'],
        ['FOX', 'WOLF', 'SQUIRREL'],
      ]);
    });

    it('seed 276 → big (55, 3 lines, balance 1045)', () => {
      const r = run(276);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.totalWin).toBe(55);
      expect(r.tier).toBe('big');
      expect(r.balance).toBe(1045);
      expect(r.lineWins).toHaveLength(3);
    });

    it('seed 12 → small (10, 1 line, balance 1000)', () => {
      const r = run(12);
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.totalWin).toBe(10);
      expect(r.tier).toBe('small');
      expect(r.balance).toBe(1000);
      expect(r.lineWins).toHaveLength(1);
    });

    it('registry-resolved machine equals the explicit default for every frozen seed', () => {
      for (const seed of [407947, 12345, 276, 12]) {
        const viaRegistry = spin({ seed, balance: 1000, bet: 10, machine: getActiveMachine().math });
        const viaExplicit = spin({ seed, balance: 1000, bet: 10, machine: WILD_AND_WHIMSICAL_MATH });
        expect(viaRegistry).toEqual(viaExplicit);
      }
    });
  });
  ```
- **Repo toolchain gotchas:** it's a plain `.ts` (no JSX). `tsconfig` `include` is `["src"]`,
  so it's typechecked. No new dependency. Do NOT touch any production file.
- **Self-check before finishing:** `git diff main..HEAD -- src/engine/ src/ui/` is EMPTY
  (only the new `src/machines/machine-parity.contract.test.ts` is added); the full gate is
  green with the new test passing.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-043-machine-parity-contract`
- **PR (if applicable):** none (local-only build cycle; PR opened at ship)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none — the drop-in test file in the spec's Notes was used verbatim, byte-for-byte.
- **Follow-up work identified:**
  - none new; this is the last STAGE-007 spec (the backlog rollup happens at ship).

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing. The spec's Notes contained the complete drop-in test, and the pinned values
   were cross-checked against `spin-parity.test.ts` and `index.test.ts` before writing —
   both matched exactly, so there was no ambiguity to resolve.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. `DEC-002` (frozen seeds) and `DEC-015` (default machine as contract subject) fully
   covered the rationale; the hard constraints (diff guard, no new deps, don't touch
   `spin-parity.test.ts`) were explicit and sufficient.

3. **If you did this task again, what would you do differently?**
   — Nothing procedurally different. This was a clean, low-risk build: copy the verbatim
   drop-in, run the gate, confirm the diff guard. The only judgment call was double-checking
   the frozen values against existing tests before running anything, which paid off by
   giving confidence the run would be green rather than a regression finding.

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
