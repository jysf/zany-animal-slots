---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-044
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-008
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-05

references:
  decisions:
    - DEC-001   # engine-no-dom: the simulator is pure engine, no DOM
    - DEC-002   # seedable RNG: all randomness via createRng(seed), deterministic
    - DEC-015   # config-driven machine model: the simulator measures a machine's math slice
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-005  # seedable mulberry32 RNG (reused for the seed stream)
    - SPEC-043  # frozen-seed contract (the determinism guard this measurement complements)
    - SPEC-045  # the fun-retune that consumes this simulator (next in the backlog)

# One sentence on what this spec contributes to its stage's
# value_contribution.
value_link: >-
  Infrastructure enabling STAGE-008's measured, re-tunable fun retune — the
  RTP / hit-frequency / tier-distribution proxy metric the brief names as the
  antidote to "'more fun' is subjective, retuning is guesswork".

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). Includes a
        real baseline measurement run via vite-node to pin exact expected values.
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 104934   # from Agent result subagent_tokens
      estimated_usd: 0.69    # 104934 tok × $6.6/M (Sonnet)
      duration_minutes: 19.8 # 1190164 ms
      recorded_at: 2026-07-05
      notes: >-
        Sonnet sub-agent build (local only, no push/PR/gh/advance-cycle). Implemented
        src/engine/metrics.ts, src/engine/metrics.test.ts, and scripts/simulate.ts
        verbatim from the spec's Notes drop-in code, plus the justfile `simulate` recipe.
        The pinned Wild & Whimsical baseline (50 000 spins, seed 20260705, bet 10)
        reproduced exactly on the first test run — no deviation from the drop-in
        algorithm was needed. Full gate green (typecheck/lint/test 313 passed incl. the
        6 new metrics.test.ts cases/build/validate). `just simulate` and `just simulate
        wild-and-whimsical` both printed reports and exited 0. Production-file diff
        guard (`git diff main..HEAD` on engine/machine production files) confirmed
        empty; no new dependency; no new DEC.
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 76759    # from Agent result subagent_tokens
      estimated_usd: 0.51    # 76759 tok × $6.6/M (Sonnet)
      duration_minutes: 25.4 # 1523432 ms
      recorded_at: 2026-07-05
      notes: >-
        Sonnet sub-agent COLD verify (local only, no push/PR/gh/advance-cycle). Full gate
        green: typecheck/lint/test/build/validate all exit 0 (313 tests, 53 files, incl.
        the 6 metrics.test.ts cases; validate confirms 44 specs with valid front-matter).
        Confirmed metrics.ts matches the spec's drop-in algorithm verbatim (seed
        derivation, spin() call shape, DEFAULT_SEED/DEFAULT_SPINS), full MachineMetrics
        field set, engine-no-dom import boundary (only ./index + ./rng), not re-exported
        from src/engine/index.ts. Confirmed no .skip/.only/xit and that the synthetic and
        pinned-baseline tests genuinely assert the specified exact values. Ran the
        adversarial guard-mutation per spec Notes: (a) mutated REEL_STRIP in strips.ts
        (DEER->WOLF) — baseline test failed (rtp 0.1295 -> 0.12541) as required, reverted
        clean; (b) mutated PAYTABLE.low[2] in paylines.ts (5->50) — baseline test failed
        (rtp -> 0.30054) as required, reverted clean. Both mutations proved the pinned
        baseline guards the real outcome-drivers, not a tautology. Confirmed
        `git diff main..HEAD` on all production engine/machine files and
        package.json/package-lock.json is EMPTY. `just simulate` and `just simulate
        wild-and-whimsical` both exit 0 and print reports. Verdict: PASS, 0 defects.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 12
      recorded_at: 2026-07-05
      notes: >-
        main-loop, not separately metered (AGENTS §4); ship cycle (orchestrator gate
        reconcile of both sub-agents against git/disk + PR + CI-poll + squash-merge +
        cost totals + STAGE-008 backlog rollup + archive). First STAGE-008 spec shipped.
  totals:
    tokens_total: 181693
    estimated_usd: 1.20
    session_count: 5
---

# SPEC-044: machine metrics simulator

## Context

STAGE-008 **retunes** the default machine for fun. The brief flags the central risk:
*"'more fun' is subjective; without a fun proxy metric, retuning is guesswork."* This
spec builds that proxy metric — a **seeded Monte-Carlo simulator** that measures a
machine's **RTP** (return-to-player), **hit-frequency**, and **win-tier distribution**
by running many deterministic spins through the real engine and aggregating the
outcomes. It is the measurement tool SPEC-045's retune depends on: retune becomes
*edit data → `just simulate` → read the numbers → adjust → re-run → pin*, and the user's
"can it be tuned?" ask is answered by making that loop cheap and repeatable.

It also produces the **"before" number** for the retune. A baseline measurement run
during design (via `vite-node`, the exact algorithm this spec pins) shows today's
default machine is **brutally stingy**:

```
Wild & Whimsical (current), 50 000 spins, seed 20260705, bet 10:
  RTP           = 0.1295   (the player loses ~87% of every wager)
  hitFrequency  = 0.0999   (a win on ~1 spin in 10)
  tierCounts    = { none: 45003, small: 4786, big: 211, jackpot: 0 }
  jackpotRate   = 0        (five WOLF never landed in 200 000 spins)
  maxWin        = 500
```

That is the quantified form of the brief's "too hard to win, wins too small" — and the
baseline SPEC-045 will move toward ~94% RTP / ~40% hit-frequency.

This is the **first** STAGE-008 spec: measurement before tuning.

## Goal

Add a pure, deterministic `simulateMachine(math, opts)` function that reports a machine's
RTP, hit-frequency, and win-tier distribution over N seeded spins, plus a thin CLI
(`just simulate`) that prints those metrics for the registered machines. No production
game behavior changes — this is a developer/tuning tool.

## Inputs

- **Files to read:**
  - `src/engine/index.ts` — the public `spin({ seed, balance, bet, machine })` path the
    simulator drives; `SpinOutcome`, `WinTier`, `BetLevel`, `MachineMath` types.
  - `src/engine/rng.ts` — `createRng(seed)` (Mulberry32), reused to generate the seed
    stream deterministically.
  - `src/engine/machine.ts` — `MachineMath` (`defaultBet`, `betLevels`, etc.).
  - `src/machines/registry.ts` — `MACHINES` (the CLI iterates registered machines).
  - `scripts/license-check.mjs` + `scripts/license-check.test.ts` — the precedent for a
    repo script with a colocated vitest test and a `just` recipe.
- **Related code paths:** `src/engine/`, `scripts/`, `justfile`.

## Outputs

- **Files created:**
  - `src/engine/metrics.ts` — the pure simulator: `MachineMetrics` type +
    `simulateMachine(math, opts)`.
  - `src/engine/metrics.test.ts` — correctness, determinism, and the pinned W&W baseline.
  - `scripts/simulate.ts` — the thin CLI (run via `vite-node`) printing metrics for the
    registered machines.
- **Files modified:**
  - `justfile` — add a `simulate *ARGS` recipe.
- **New exports:** `simulateMachine`, `MachineMetrics` (from `src/engine/metrics.ts`).
  Not re-exported from `src/engine/index.ts` — the simulator is a dev/tuning tool, not
  part of the UI's public engine interface.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `simulateMachine(math, opts?)` runs `opts.spins` (default 100 000) seeded spins
      through the engine's public `spin()` and returns a `MachineMetrics` with: `spins`,
      `bet`, `totalWagered`, `totalReturned`, `rtp`, `hits`, `hitFrequency`,
      `tierCounts` (per `WinTier`), `tierFrequency`, `maxWin`, `jackpots`, `jackpotRate`.
- [ ] **Deterministic:** same `(math, opts)` → deep-equal `MachineMetrics` (all
      randomness flows through `createRng(opts.seed)`; no `Math.random()`).
- [ ] **RTP is exact** on a degenerate all-win machine and **zero** on a never-win
      machine (see Failing Tests) — proving the aggregation, not just that it runs.
- [ ] `tierCounts` sums to `spins`; `hitFrequency === hits / spins`;
      `rtp === totalReturned / totalWagered`.
- [ ] The **pinned W&W baseline** (50 000 spins, seed 20260705, bet 10) reproduces the
      measured numbers above.
- [ ] `just simulate` prints a metrics report for every registered machine and exits 0;
      `just simulate wild-and-whimsical` limits to that machine.
- [ ] `just test`, `just lint`, `just typecheck`, `just build` all pass. The engine-no-dom
      boundary holds (`src/engine/metrics.ts` imports no DOM/React).

## Failing Tests

Written now, BEFORE build. The implementer makes these pass. All in
**`src/engine/metrics.test.ts`** (imports `simulateMachine` from `./metrics`,
`WILD_AND_WHIMSICAL_MATH` from `./machine`, and builds tiny synthetic machines for the
exact-RTP checks). Use a small `spins` for the synthetic/degenerate cases (fast).

- **`src/engine/metrics.test.ts`**
  - `"is deterministic — same math + opts yield deep-equal metrics"`
    — `simulateMachine(WILD_AND_WHIMSICAL_MATH, { spins: 2000, seed: 7 })` deep-equals a
      second identical call. Asserts: `expect(a).toEqual(b)`.
  - `"the seed changes the outcome"`
    — metrics for `{ spins: 2000, seed: 1 }` are **not** deep-equal to `{ spins: 2000,
      seed: 2 }`. Asserts: `expect(a).not.toEqual(b)`.
  - `"RTP is exact on an all-win machine"`
    — build `allWin` (see Notes: 1 symbol `'DEER'`, one payline, all-`'DEER'` strips,
      `paytable.low = [0.5, 2, 5]`, `jackpot` = some non-`DEER` rule, `tiers.bigMultiple`
      huge). Every spin is five-DEER on the one line → `totalWin = floor(5 × 10) = 50`.
      Asserts (bet 10, spins 500): `rtp` toBe `5`, `hitFrequency` toBe `1`,
      `tierCounts.none` toBe `0`, `jackpots` toBe `0`, `maxWin` toBe `50`.
  - `"RTP is zero on a never-win machine"`
    — `coldWin` = `allWin` but `paytable.low = [0, 0, 0]` → `totalWin = 0` every spin.
      Asserts: `rtp` toBe `0`, `hits` toBe `0`, `hitFrequency` toBe `0`,
      `tierCounts.none` toBe `spins`.
  - `"tier counts sum to spins and frequencies sum to ~1"`
    — for W&W `{ spins: 3000, seed: 42 }`: sum of `tierCounts` values === `3000`; sum of
      `tierFrequency` values `toBeCloseTo(1, 10)`; `hitFrequency` `toBeCloseTo(hits/spins)`.
  - `"reproduces the pinned Wild & Whimsical baseline (the retune's before-number)"`
    — `const m = simulateMachine(WILD_AND_WHIMSICAL_MATH, { spins: 50000, seed: 20260705, bet: 10 })`.
      Asserts (exact — the algorithm is deterministic):
      `m.rtp` `toBeCloseTo(0.1295, 4)`; `m.hitFrequency` `toBeCloseTo(0.0999, 4)`;
      `m.tierCounts` `toEqual({ none: 45003, small: 4786, big: 211, jackpot: 0 })`;
      `m.jackpots` toBe `0`; `m.maxWin` toBe `500`; `m.totalWagered` toBe `500000`.
      **NOTE for STAGE-008:** this baseline block is **re-baselined by SPEC-045** (the
      retune deliberately moves these numbers). A changed fixture here in SPEC-045 is
      INTENDED — see the STAGE-008 Design Notes.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-001` (engine-no-dom) — `src/engine/metrics.ts` is pure engine: it imports only
  from `./index` and `./rng`, no React/DOM. ESLint's `no-restricted-imports` block on
  `src/engine/**` enforces this.
- `DEC-002` (seedable RNG) — the seed **stream** is itself a `createRng(opts.seed)`; each
  spin's seed is `Math.floor(stream() * 2**32)`. No `Math.random()` anywhere. This makes
  the whole simulation reproducible from one seed.
- `DEC-015` (config-driven machine model) — the simulator takes a `MachineMath` slice and
  measures it; it works for any machine (today W&W; STAGE-008's Arctic/Desert/Ocean later)
  with zero changes.

### Constraints that apply

- `engine-no-dom` — see DEC-001 above. `src/engine/metrics.ts` must not import
  React/DOM. `scripts/simulate.ts` may use Node globals (`console`, `process`), and since
  it's a `.ts` file `no-undef` is off (typescript-eslint) so it needs no ESLint globals
  block — unlike a `.mjs` script.

### Prior related work

- `SPEC-005` (shipped) — the Mulberry32 `createRng`/`randomInt` reused here.
- `SPEC-043` (shipped) — the frozen-seed contract test. This simulator **complements** it:
  the contract pins a *few* seeds' exact outcomes (determinism); the simulator aggregates
  *many* seeds into distribution metrics (fun tuning). Different jobs.
- `scripts/license-check.mjs` + `.test.ts` — the pattern for a repo script with a
  colocated vitest test and a `just` recipe (though this one is `.ts` + `vite-node`).

### Out of scope (for this spec specifically)

- **Retuning any numbers** — that's SPEC-045. This spec only *measures*; it changes no
  machine data and no game behavior.
- A UI surface for metrics — this is a dev CLI + test, not an in-app view.
- Variance / confidence-interval statistics, per-symbol frequency tables, or CSV export —
  keep to RTP, hit-frequency, tier distribution, max win, jackpot rate. Extend later only
  if the retune needs it.
- Re-exporting the simulator from `src/engine/index.ts` (the UI's public interface).

## Notes for the Implementer

**Toolchain brief (read — these have bitten before):** ESLint has NO react-hooks plugin
(no `exhaustive-deps` disables). NO `@testing-library/user-event`. JSX test files must be
`.tsx` not `.ts` (this spec's tests are plain `.ts` — no JSX). `tsconfig` `include` is
`["src"]`, so `scripts/simulate.ts` is NOT typechecked by `tsc --noEmit` (that's fine —
`vite-node` compiles it at run time); keep it simple and correct. `vite-node` is already
present at `node_modules/.bin/vite-node` (bundled with vitest) — no new dependency.

**Drop-in `src/engine/metrics.ts`** (this is the exact algorithm the pinned baseline was
measured with — implement it faithfully or the baseline test won't reproduce):

```ts
// Machine-metrics simulator (STAGE-008 / SPEC-044).
// A pure, deterministic Monte-Carlo measurement of a machine's math slice: RTP,
// hit-frequency, and win-tier distribution over N seeded spins through the real engine.
// DEC-001 (engine-no-dom): imports only the engine — no React/DOM. DEC-002: all
// randomness flows through createRng(seed), so the whole run reproduces from one seed.
// This is a developer/tuning tool (SPEC-045 consumes it); it is deliberately NOT part of
// the UI's public engine interface (src/engine/index.ts).
import { spin } from './index';
import type { MachineMath, BetLevel, WinTier } from './index';
import { createRng } from './rng';

export interface MachineMetrics {
  spins: number;
  bet: number;
  totalWagered: number;
  totalReturned: number;
  /** totalReturned / totalWagered — 1.0 means break-even. */
  rtp: number;
  hits: number;
  /** hits / spins — fraction of spins that returned any win. */
  hitFrequency: number;
  tierCounts: Record<WinTier, number>;
  tierFrequency: Record<WinTier, number>;
  maxWin: number;
  jackpots: number;
  jackpotRate: number;
}

export interface SimulateOptions {
  spins?: number;
  bet?: BetLevel;
  seed?: number;
}

const DEFAULT_SPINS = 100_000;
const DEFAULT_SEED = 0x5eed; // 24301

/** Measure a machine's math slice over `opts.spins` deterministic seeded spins. */
export function simulateMachine(math: MachineMath, opts: SimulateOptions = {}): MachineMetrics {
  const spins = opts.spins ?? DEFAULT_SPINS;
  const bet = opts.bet ?? math.defaultBet;
  const seedStream = createRng(opts.seed ?? DEFAULT_SEED);

  const tierCounts: Record<WinTier, number> = { none: 0, small: 0, big: 0, jackpot: 0 };
  let totalReturned = 0;
  let hits = 0;
  let maxWin = 0;
  let jackpots = 0;

  for (let i = 0; i < spins; i++) {
    // Derive each spin's seed from the stream — well-distributed and reproducible.
    const seed = Math.floor(seedStream() * 0x1_0000_0000);
    // balance === bet: exactly affordable, so the spin always runs; balance is irrelevant to RTP.
    const r = spin({ seed, balance: bet, bet, machine: math });
    if (!r.ok) continue; // unreachable (bet is affordable), but keeps the type narrow
    totalReturned += r.totalWin;
    if (r.totalWin > 0) hits++;
    if (r.totalWin > maxWin) maxWin = r.totalWin;
    tierCounts[r.tier] += 1;
    if (r.tier === 'jackpot') jackpots += 1;
  }

  const totalWagered = spins * bet;
  const freq = (n: number): number => n / spins;
  return {
    spins,
    bet,
    totalWagered,
    totalReturned,
    rtp: totalReturned / totalWagered,
    hits,
    hitFrequency: freq(hits),
    tierCounts,
    tierFrequency: {
      none: freq(tierCounts.none),
      small: freq(tierCounts.small),
      big: freq(tierCounts.big),
      jackpot: freq(tierCounts.jackpot),
    },
    maxWin,
    jackpots,
    jackpotRate: freq(jackpots),
  };
}
```

**Building the synthetic machines for the exact-RTP tests** — spread `WILD_AND_WHIMSICAL_MATH`
and override only what's needed, so the shape stays valid:

```ts
import { WILD_AND_WHIMSICAL_MATH } from './machine';

const oneReel = ['DEER'] as const;
const allWin = {
  ...WILD_AND_WHIMSICAL_MATH,
  symbols: ['DEER'] as const,
  strips: Array.from({ length: WILD_AND_WHIMSICAL_MATH.reelCount }, () => oneReel),
  paylines: [{ id: 'L1' as const, rows: [0, 0, 0, 0, 0] }],
  paytable: { ...WILD_AND_WHIMSICAL_MATH.paytable, low: [0.5, 2, 5] as const },
  symbolTier: { ...WILD_AND_WHIMSICAL_MATH.symbolTier, DEER: 'low' as const },
  jackpot: { symbol: 'WOLF' as const, count: 5 }, // never matches five DEER
  tiers: { bigMultiple: 1_000_000 },              // keep the tier 'small', never 'big'
};
const coldWin = { ...allWin, paytable: { ...allWin.paytable, low: [0, 0, 0] as const } };
```

With a single-symbol strip, `visibleCells` returns `['DEER','DEER','DEER']` for any stop,
so every payline is five-of-a-kind → deterministic totalWin. (`strips` length 1 is fine:
`randomInt(rng, 1)` always returns 0.) For `allWin`, five-DEER on `low` pays the 5-oak
multiplier `5` → `floor(5 × 10) = 50` per spin → `rtp === 5`, `maxWin === 50`. Tier is
`small` (50 < 1_000_000 × 10, and not the WOLF jackpot).

**`scripts/simulate.ts`** — a thin CLI (keep it simple; it's untested I/O glue, like
license-check's CLI guard):

```ts
// CLI: print machine metrics for tuning (STAGE-008 / SPEC-044). Run via vite-node.
//   just simulate                      # all registered machines
//   just simulate wild-and-whimsical   # one machine
//   just simulate --spins 200000 --seed 24301
import { MACHINES } from '../src/machines/registry';
import { simulateMachine } from '../src/engine/metrics';

const argv = process.argv.slice(2);
const flags = new Map<string, string>();
const positional: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) flags.set(a.slice(2), argv[++i]);
  else positional.push(a);
}
const spins = flags.has('spins') ? Number(flags.get('spins')) : undefined;
const seed = flags.has('seed') ? Number(flags.get('seed')) : undefined;
const only = positional[0];

const ids = only ? [only] : Object.keys(MACHINES);
for (const id of ids) {
  const machine = MACHINES[id];
  if (!machine) { console.error(`unknown machine: ${id}`); process.exitCode = 1; continue; }
  const m = simulateMachine(machine.math, { spins, seed });
  const pct = (x: number) => `${(x * 100).toFixed(2)}%`;
  console.log(`\n${machine.name}  (${id})  ${m.spins} spins @ bet ${m.bet}`);
  console.log(`  RTP           ${pct(m.rtp)}`);
  console.log(`  hit-frequency ${pct(m.hitFrequency)}`);
  console.log(`  tiers         none ${pct(m.tierFrequency.none)} | small ${pct(m.tierFrequency.small)} | big ${pct(m.tierFrequency.big)} | jackpot ${pct(m.tierFrequency.jackpot)}`);
  console.log(`  jackpot rate  ${m.jackpotRate > 0 ? `1 in ${Math.round(1 / m.jackpotRate)}` : 'never (in sample)'}`);
  console.log(`  max win       ${m.maxWin}`);
}
```

**`justfile` recipe** (mirror the `license-check` recipe's style):

```
# Simulate machine metrics (RTP / hit-frequency / tier distribution) for tuning.
# Usage: just simulate [machine-id] [--spins N] [--seed S]
simulate *ARGS:
    @node_modules/.bin/vite-node scripts/simulate.ts {{ARGS}}
```

**Verify-cycle adversarial check (teeth):** confirm the baseline test is a real guard —
temporarily bump one `REEL_WEIGHTS` value (e.g. `WOLF: 1 → 5`) and confirm the pinned
baseline test **fails** (the numbers move), then revert. This proves the baseline pins
the actual math, not a tautology.

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-044-machine-metrics-simulator`
- **PR (if applicable):** none — local-only build cycle per orchestrator instructions;
  PR deferred to ship.
- **All acceptance criteria met?** yes
  - `simulateMachine(math, opts?)` runs seeded spins through the engine's public `spin()`
    and returns the full `MachineMetrics` shape (spins, bet, totalWagered, totalReturned,
    rtp, hits, hitFrequency, tierCounts, tierFrequency, maxWin, jackpots, jackpotRate).
  - Deterministic: same `(math, opts)` → deep-equal metrics; different seed → not
    deep-equal (both covered by tests, both pass).
  - Exact RTP proven on the synthetic `allWin` (rtp 5 / hitFrequency 1 / none 0 /
    jackpots 0 / maxWin 50) and `coldWin` (rtp 0 / hits 0 / none === spins) machines.
  - `tierCounts` sums to `spins`; `tierFrequency` sums to ~1; `hitFrequency === hits/spins`.
  - The pinned W&W baseline (50 000 spins, seed 20260705, bet 10) reproduced exactly on
    the first run of the drop-in algorithm: rtp≈0.1295, hitFrequency≈0.0999, tierCounts
    `{none:45003, small:4786, big:211, jackpot:0}`, jackpots 0, maxWin 500,
    totalWagered 500000 — no deviation needed.
  - `just simulate` prints a report for all registered machines and exits 0;
    `just simulate wild-and-whimsical` limits to that one machine.
  - `just typecheck && just lint && just test && just build` all exit 0 (313 tests
    passed, including the 6 new `metrics.test.ts` cases). `just validate` passes.
- **New decisions emitted:**
  - none (DEC-001/002/015 already cover the shape; no new judgment calls required).
- **Deviations from spec:**
  - none. `src/engine/metrics.ts`, `src/engine/metrics.test.ts`'s synthetic machines,
    `scripts/simulate.ts`, and the `justfile` recipe were implemented verbatim from the
    spec's Notes. The only addition beyond a literal copy-paste was routine test-file
    scaffolding (the `describe`/`it` wrapper and imports) around the six specified
    assertions, which the Failing Tests section described in prose rather than as a
    literal test-file drop-in.
- **Follow-up work identified:**
  - none new — SPEC-045 (the retune that consumes this simulator) is already scheduled
    next in the STAGE-008 backlog, as anticipated by this spec's Context section.

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing. The Notes section provided complete, verbatim drop-in code for all three
   new files plus the justfile recipe, and the Failing Tests section spelled out each of
   the six assertions precisely enough that writing the test file was mechanical
   transcription, not design. Cross-checking the synthetic `allWin`/`coldWin` machines
   against the real `MachineMath` shape (`strips.ts`, `paylines.ts`, `tiers.ts`,
   `balance.ts`) confirmed the spread-and-override pattern type-checks cleanly with no
   surprises.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. The hard constraints (pure engine-no-dom import boundary, no production/machine
   file changes, no new dependency, no new DEC, verbatim algorithm to reproduce the pinned
   baseline) were all explicit and were sufficient to self-verify before finishing. The
   `git diff main..HEAD` production-file guard came back completely empty on the first
   check.

3. **If you did this task again, what would you do differently?**
   — Nothing procedurally. The pinned baseline reproduced exactly on the first `just test`
   run with zero iteration, which is the strongest possible signal the drop-in algorithm
   was transcribed correctly (seed-stream derivation, `spin()` call shape, `DEFAULT_SEED`
   all matched). I did attempt the Notes' suggested adversarial "bump a REEL_WEIGHTS value
   and confirm the baseline test fails" check as an extra sanity pass, but discovered that
   constant only documents the strip *composition* — the actual pinned `REEL_STRIP` array
   is a separate literal, so editing `REEL_WEIGHTS` alone doesn't move the simulated
   numbers. That adversarial check is explicitly scoped to the verify cycle in the spec's
   Notes, so I reverted the experimental edit (clean diff) and left the real adversarial
   proof (editing `REEL_STRIP` or an actual paytable/strip value) for the verify agent,
   per the spec's own cycle boundary.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused, distinct from the process-focused
build reflection above.*

1. **What would I do differently next time?**
   — Almost nothing — measure-before-tune paid off immediately. Running the real
   measurement *during design* (via `vite-node`, the exact pinned algorithm) meant the
   failing-test baseline was a reproduced fact, not an invented fixture, so the build
   reproduced it on the first run with zero iteration. The one thing worth flagging for
   the next spec: the design assumed `reelWeights` drove hit-frequency, but it's actually
   **documentation-only** — `resolveGrid` draws from the `REEL_STRIP` literal array, and
   `reelWeights` is consumed by no engine logic. The build agent surfaced this when the
   adversarial `REEL_WEIGHTS` mutation moved nothing; verify then proved teeth by mutating
   the real drivers (`REEL_STRIP` and `PAYTABLE`). This is the single most important
   carry-forward for SPEC-045.

2. **Does any template, constraint, or decision need updating?**
   — No template/constraint change. But **SPEC-045's design must encode the `reelWeights`
   finding**: retuning hit-frequency/RTP means editing the **strip composition** (and/or
   paytable/jackpot placement), not `reelWeights` — or, better, deciding whether SPEC-045
   should make `strips` *generated from* `reelWeights` so the weights become a live tuning
   knob (a determinism-affecting design choice, to be recorded in the retune DEC). Logged
   to the PROJ-002 signals set.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec — SPEC-045 (the fun-retune) is already next in the STAGE-008 backlog and
   is the direct consumer of this simulator. The simulator's `just simulate` loop + the
   pinned baseline are exactly the measure→tune→re-measure→re-pin machinery SPEC-045 needs.
