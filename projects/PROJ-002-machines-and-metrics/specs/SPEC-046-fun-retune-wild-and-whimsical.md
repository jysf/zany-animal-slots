---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-046
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: L                    # S | M | L  (L means split it)

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
    - DEC-001   # engine-no-dom holds — only data changes, no engine logic
    - DEC-002   # determinism — the frozen seeds stay a determinism guard (re-baselined values)
    - DEC-003   # fixed paylines — SUPERSEDED for W&W: 5 → 20 lines (recorded in DEC-016)
    - DEC-006   # symbol set — unchanged (still the 8 animals)
    - DEC-011   # weights + paytable — RETUNED (recorded in DEC-016)
    - DEC-015   # config-driven machine model — retune is DATA, not engine logic
    - DEC-016   # THIS retune (emitted by this spec)
  constraints:
    - engine-no-dom
    - no-real-money
  related_specs:
    - SPEC-044  # the simulator that measured the target (shipped)
    - SPEC-045  # buildStrip — this spec consumes it to generate strips from weights (shipped)

value_link: >-
  Delivers the "fun" half of the project thesis: the default machine goes from a brutal
  13% RTP / 10% hit-frequency / never-hit jackpot to a generous ~94% / ~34% / reachable
  jackpot, measured by the SPEC-044 simulator — the retune the brief exists for.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). Includes ~5 simulator
        tuning sweeps + a full pin computation (frozen seeds, representative seeds, metrics
        baseline, synthetic-grid re-evaluations) run via vite-node against the REAL shipped
        buildStrip + engine, so every re-baselined value is a reproduced fact.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 196411   # from Agent result subagent_tokens
      estimated_usd: 1.30    # 196411 tok × $6.6/M (Sonnet)
      duration_minutes: 46.1 # 2767385 ms
      note: >-
        Build subagent run: applied the pinned DATA (REEL_WEIGHTS/REEL_STRIP/PAYLINES/PAYTABLE),
        wrote DEC-016, re-baselined the 8 named test files to the spec's exact pins (verified via
        vite-node before editing tests), plus 4 unlisted fixtures the retune also moved
        (spin.test.ts strip-length/stops/grid, PaylineMap.test.tsx aria label, paytable.test.ts
        multipliers, PaytableSheet.test.tsx payout text) — full 54-file/321-test suite green.
        Orchestrator fills tokens_total/duration_minutes from the Agent result's subagent_tokens.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 110308   # from Agent result subagent_tokens
      estimated_usd: 0.73    # 110308 tok × $6.6/M (Sonnet)
      duration_minutes: 13.4 # 805232 ms
      note: >-
        Cold verify (Sonnet, no prior context). Full gate green (typecheck/lint/test/build/
        validate/cost-audit; 54 files / 321 tests). Confirmed engine-logic diff EMPTY
        (spin.ts/tiers.ts/rng.ts/machine.ts unchanged vs main; paylines.ts's evaluatePaylines/
        lineSymbols bodies byte-identical, only data+comments+LineId type changed). Simulator
        confirmed the target on the pinned seed (RTP 93.79%/hit 34.43%) and a second seed
        (12345: RTP 94.65%/hit 34.66%, within the generous band) to rule out a single-seed
        artifact. Independently reproduced all 4 pinned contract seeds (68357/6/1/2) via
        vite-node against the real spin()+getActiveMachine(), bypassing the test suite.
        Verified the generated REEL_STRIP byte-matches the spec's pinned 42-symbol strip.
        Read all 12 re-baselined fixture files end-to-end for staleness. Ran the adversarial
        REEL_WEIGHTS.WOLF 3→1 mutation — both the metrics baseline and the machine-parity
        jackpot case failed as required, then cleanly reverted (git diff empty). 0 defects
        found; verdict PASS. Orchestrator fills tokens_total from the Agent result's
        subagent_tokens.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 18
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Includes ~5 simulator tuning
        sweeps + full pin computation during design (folded into this Opus loop), reconcile of
        both sub-agents against git/disk + independent gate/simulator re-run, PR + CI-poll +
        squash-merge + preview check (20-payline paytable + generous gameplay) + backlog rollup
        + archive. The behavior-changing centerpiece — Wild & Whimsical is now generous.
  totals:
    tokens_total: 306719   # build 196411 + verify 110308
    estimated_usd: 2.03    # build $1.30 + verify $0.73
    session_count: 5
---

# SPEC-046: fun retune wild and whimsical

## Context

The MVP's default machine is **brutally stingy** — SPEC-044 measured it at **RTP 13% /
hit-frequency 10% / jackpot never in 200k spins**, the quantified form of the brief's
"too hard to win, wins too small." This spec **retunes Wild & Whimsical in place** to a
deliberately generous target and is the **behavior-CHANGING centerpiece** of STAGE-008 —
the inverse of STAGE-007. The frozen-seed contract is therefore **re-baselined**: the
seeds stay a *determinism* guard (same seed → same result), but their expected values are
recomputed to the retuned numbers under the retune DEC. **A changed fixture here is
INTENDED** (the opposite of STAGE-007, where a changed fixture was a regression).

The retune uses three levers, all pure machine DATA (DEC-015 — no engine logic changes):
1. **Reel weights** — reweighted so wins are more frequent and the jackpot is reachable;
   `strips` are now GENERATED from the weights via SPEC-045's `buildStrip` (weights are
   the live tuning knob — SPEC-044 found the hand-authored strip made them inert).
2. **Paytable** — richer multipliers for a real medium-win band.
3. **Paylines 5 → 20** — the structural lever: 5 lines cap hit-frequency at ~11% no
   matter the weights, so hitting ~40% needs "more ways to win" (the brief's phrase).

Measured result (SPEC-044 simulator, 50k spins): **RTP 93.8% / hit-frequency 34.4% /
jackpot ~1-in-25k / a 4.5% big-win band** — generous, and re-tunable via `just simulate`.

## Goal

Retune the default machine "Wild & Whimsical" to the generous measured target by editing
only machine DATA (weights, paytable, paylines) + generating its strips from weights, and
re-baseline every frozen-seed / metrics fixture to the new deterministic outcomes under a
new retune DEC. No engine logic changes.

## Inputs

- **Files to read:** `src/engine/strips.ts`, `src/engine/paylines.ts`,
  `src/engine/machine.ts`, `src/engine/stripBuilder.ts` (SPEC-045's `buildStrip`),
  `src/ui/PaylineMap.tsx`, and every test listed under Failing Tests.
- **Related code paths:** `src/engine/`, `src/machines/`, `src/ui/`.

## Outputs

- **Files modified (production):**
  - `src/engine/strips.ts` — `REEL_WEIGHTS` retuned (sum 42); `REEL_STRIP` now
    `buildStrip(SYMBOLS, REEL_WEIGHTS)` (generated, len 42) instead of the hand-authored
    literal; `STRIPS` unchanged in form.
  - `src/engine/paylines.ts` — `PAYLINES` 5 → 20 lines; `PAYTABLE` retuned; `LineId`
    widened to `` `L${number}` ``.
  - `src/ui/PaylineMap.tsx` — its two exhaustive `Record<LineId, string>` label maps
    replaced with per-line labels derived from the line index (they can't enumerate 20 lines).
  - `src/machines/machine.ts` — **expected UNCHANGED** (it references the updated constants);
    confirm, don't edit unless an import breaks.
- **Files modified (tests re-baselined):** `src/engine/strips.test.ts`,
  `src/engine/paylines.test.ts`, `src/engine/index.test.ts`, `src/engine/spin-parity.test.ts`,
  `src/engine/metrics.test.ts`, `src/machines/machine-parity.contract.test.ts`,
  `src/machines/wildAndWhimsical.parity.test.ts`, `src/ui/useSlotMachine.test.tsx`.
- **Files created:** `decisions/DEC-016-fun-retune-wild-and-whimsical.md`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] Retune is DATA only: `git diff` shows changes to machine data (weights/paytable/
      paylines) + generated strips + fixtures + PaylineMap; NO change to engine *logic*
      (`spin.ts`, `paylines.ts` `evaluatePaylines`, `tiers.ts`, `rng.ts` bodies unchanged —
      only `paylines.ts` data + the `LineId` type change).
- [ ] `WILD_AND_WHIMSICAL_MATH.strips` are generated via `buildStrip(SYMBOLS, REEL_WEIGHTS)`.
- [ ] Simulator confirms the target: `just simulate wild-and-whimsical --spins 50000 --seed 20260705`
      reports RTP ≈ 93.8% / hit ≈ 34.4% (was 13% / 10%).
- [ ] The frozen seeds are re-baselined to the tuned outcomes (see Failing Tests) and every
      test passes; the machine-parity contract pins the tuned representative seeds.
- [ ] `just typecheck`, `just lint`, `just test`, `just build`, `just validate`,
      `just cost-audit` all pass.
- [ ] `DEC-016` records the retune (levers, measured target, the DEC-003/011 supersession).

## Failing Tests

Written now, BEFORE build. **These are RE-BASELINED values — a changed fixture is INTENDED.**
Every value below was computed via vite-node against the REAL shipped `buildStrip` + engine
with the tuned data, so they reproduce exactly. The build's job is to apply the data and make
these pass; if a value differs, the DATA was applied wrong (not the pin).

**The tuned data (apply exactly):**
- `REEL_WEIGHTS = { DEER:9, FOX:8, SQUIRREL:7, BEAR:5, EAGLE:4, OWL:3, BISON:3, WOLF:3 }` (sum 42)
- `PAYTABLE = { low:[1,3,7], mid:[2,6,18], high:[4,14,55], jackpot:[10,50,250] }`
- `PAYLINES` (20; the first 5 are today's L1–L5 unchanged):
  ```
  L1 [1,1,1,1,1]  L2 [0,0,0,0,0]  L3 [2,2,2,2,2]  L4 [0,1,2,1,0]  L5 [2,1,0,1,2]
  L6 [1,0,0,0,1]  L7 [1,2,2,2,1]  L8 [0,0,1,2,2]  L9 [2,2,1,0,0]  L10 [1,2,1,0,1]
  L11 [1,0,1,2,1] L12 [0,1,1,1,0] L13 [2,1,1,1,2] L14 [0,1,0,1,0] L15 [2,1,2,1,2]
  L16 [1,1,0,1,1] L17 [1,1,2,1,1] L18 [0,0,1,0,0] L19 [2,2,1,2,2] L20 [0,2,0,2,0]
  ```
- The generated `REEL_STRIP` (= `buildStrip(SYMBOLS, REEL_WEIGHTS)`, len 42) is:
  ```
  DEER FOX SQUIRREL BEAR EAGLE DEER OWL BISON WOLF FOX SQUIRREL DEER BEAR FOX SQUIRREL
  EAGLE DEER FOX DEER SQUIRREL BEAR OWL BISON WOLF FOX DEER EAGLE SQUIRREL FOX BEAR
  DEER SQUIRREL FOX DEER OWL BISON WOLF EAGLE BEAR SQUIRREL FOX DEER
  ```

- **`src/engine/strips.test.ts`** (re-baseline): `REEL_WEIGHTS` → the tuned map; weight sum
  `35 → 42`; `REEL_STRIP.length` `35 → 42`; the pinned canonical strip array → the generated
  42-strip above; `STRIPS` each length `42`; `visibleCells` wrap tests use indices `41`/`40`
  (the new last indices) instead of `34`/`33`.
- **`src/engine/paylines.test.ts`** (re-baseline): `PAYLINES` length `5 → 20` (keep the L1–L5
  entry assertions — unchanged); `PAYTABLE` → the tuned map; and the synthetic-grid amounts,
  recomputed under **20 lines + tuned paytable** (20 lines catch extra runs):
  - "3-of-a-kind mid on L1": `totalWin 20`, 1 line, `{line:'L1',symbol:'BEAR',count:3,multiplier:2,amount:20}`.
  - "5-of-a-kind low on L2": `totalWin 70`, 1 line, `{line:'L2',symbol:'DEER',count:5,multiplier:7,amount:70}`.
  - "4-of-a-kind high on L1": now **2 lines** (L1 + L12), `totalWin 280`, each `BISON` ×4 mult 14 amount 140.
  - "five Wolves … every line": now **20 lines**, `totalWin 50000`, each `WOLF` ×5 mult 250 amount 2500.
  - "sums multiple hitting lines": bet 10 `totalWin 30` (L1 BEAR×3=20 + L3 DEER×3=10); bet 25 `totalWin 75`.
  - "floors fractional payouts": recompute against the tuned (integer) low multipliers — the
    build derives the new amount from the deterministic evaluator (flooring is no longer
    exercised by a fractional multiplier; assert the correct new integer amount).
- **`src/engine/index.test.ts`** (re-baseline to representative seeds for clean tier coverage):
  - loss: seed 12345 → `totalWin 0`, `tier none`, `balance 990`; grid
    `[[DEER,DEER,FOX],[BEAR,FOX,SQUIRREL],[BEAR,OWL,BISON],[OWL,BISON,WOLF],[OWL,BISON,WOLF]]`.
  - small: seed 1 → `totalWin 10`, `tier small`, `balance 1000`, `lineWins` length 1.
  - big: seed 6 → `totalWin 70`, `tier big`, `balance 1060`, `lineWins` length 1.
  - jackpot: seed 68357 → `totalWin 2500`, `tier jackpot`, `balance 3490`.
  - keep the unaffordable (seed 1 bal 5) + determinism (seed 999) cases; `PAYLINES` length `5 → 20`.
- **`src/engine/spin-parity.test.ts`** (re-baseline): jackpot seed `407947 → 68357`
  (`totalWin 2500`, `tier jackpot`, a `WOLF`×5 line win present); 12345 → 0/none; big → seed 6
  (70/big/1 line); small → seed 1 (10/small); the explicit==default loop over the new seed set.
- **`src/engine/metrics.test.ts`** (re-baseline the pinned W&W baseline block only): 50000 spins,
  seed 20260705, bet 10 → `rtp` toBeCloseTo `0.9379` (4dp); `hitFrequency` toBeCloseTo `0.3443`;
  `tierCounts` toEqual `{ none:32787, small:14975, big:2237, jackpot:1 }`; `jackpots` `1`;
  `maxWin` `3150`; `totalWagered` `500000`; `totalReturned` `468950`. (The determinism /
  synthetic all-win / cold / tier-sum tests are machine-independent — leave them.)
- **`src/machines/machine-parity.contract.test.ts`** (re-baseline — the durable contract):
  pin the tuned representative seeds, one per tier, through `getActiveMachine()`:
  seed 1 → small (10 / balance 1000 / 1 line); seed 6 → big (70 / 1060 / 1 line);
  seed 68357 → jackpot (2500 / 3490 / a `WOLF`×5 line); seed 2 → loss (0 / none / 990).
  Keep the registry-resolves-default + explicit==registry-for-every-seed checks (over the new
  seeds). Add one metrics-sanity assertion: `simulateMachine(getActiveMachine().math,
  {spins:20000, seed:1}).rtp` is within `[0.85, 1.05]` (guards the tuning didn't silently drift).
- **`src/machines/wildAndWhimsical.parity.test.ts`**: `toHaveLength(35) → 42` (strip length) and
  `expect(sum).toBe(35) → 42` (two places). Reference-equality assertions stay green.
- **`src/ui/useSlotMachine.test.tsx`** (re-baseline the seeds it injects via `nextSeed`):
  seed 276 was a "big win" → now **small** (`totalWin 40`, `balance 1030`, 3 line wins); the
  jackpot seed `407947 → 68357` (`tier jackpot`, `totalWin 2500`, `balance 3490`); 12345 stays a
  loss (balance 990 at bet 10, 975 at bet 25). Update every assertion that referenced the old
  amounts/tier; the auto-spin + celebration structure is unchanged.

## Implementation Context

### Decisions that apply
- `DEC-015` — the retune is DATA; the engine only sees the math slice. No engine logic changes.
- `DEC-001` — engine-no-dom holds; `strips.ts` importing `buildStrip` from `./stripBuilder`
  is a value import into the engine (fine); `stripBuilder.ts`'s `import type` back is erased.
- `DEC-003` / `DEC-011` — their specifics (5 paylines, the old paytable/weights) are SUPERSEDED
  for W&W by DEC-016; the engine mechanics they describe are unchanged.

### Constraints that apply
- `engine-no-dom` — only data + the `LineId` type change in the engine; no DOM import.
- `no-real-money` — play-money only; a generous RTP is fine (holds forever).

### Out of scope
- Any engine *logic* change (evaluator, tiers, rng). Retune is data only.
- Theme/audio per machine (SPEC-048), residual param reads (SPEC-047), selector (SPEC-049/050),
  the other machines (SPEC-051–053).
- Changing the 8-symbol vocabulary, the 5×3 grid, the WOLF×5 jackpot rule, or `bigMultiple` 5.

## Notes for the Implementer

**Toolchain brief:** ESLint has NO react-hooks plugin; NO `@testing-library/user-event` (use
renderHook/act); JSX tests are `.tsx`; `tsconfig` include is `["src"]`; no new dependency.

**`src/engine/strips.ts`** — retune weights + generate the strip:
```ts
import { buildStrip } from './stripBuilder';
// ...
export const REEL_WEIGHTS: Record<SymbolId, number> = {
  DEER: 9, FOX: 8, SQUIRREL: 7, BEAR: 5, EAGLE: 4, OWL: 3, BISON: 3, WOLF: 3,
}; // sum 42 (DEC-016 retune)
// REEL_STRIP is now GENERATED from the weights (DEC-016; SPEC-045 buildStrip) — no longer
// hand-authored. Even spread + no linear adjacent dups are guaranteed by the builder.
export const REEL_STRIP = buildStrip(SYMBOLS, REEL_WEIGHTS);
export const STRIPS: readonly (readonly SymbolId[])[] = Array.from(
  { length: REEL_COUNT }, () => REEL_STRIP,
);
```
(Keep `SYMBOLS`, `SYMBOL_TIER`, `REEL_COUNT`, `visibleCells` as-is. Delete the old hand-authored
`REEL_STRIP` literal + its comment. `REEL_STRIP` must be declared AFTER `SYMBOLS`/`REEL_WEIGHTS`.)

**`src/engine/paylines.ts`** — widen `LineId`, expand `PAYLINES`, retune `PAYTABLE`:
```ts
export type LineId = `L${number}`;
export const PAYLINES: readonly Payline[] = [
  { id: 'L1',  rows: [1,1,1,1,1] }, { id: 'L2',  rows: [0,0,0,0,0] }, { id: 'L3',  rows: [2,2,2,2,2] },
  { id: 'L4',  rows: [0,1,2,1,0] }, { id: 'L5',  rows: [2,1,0,1,2] }, { id: 'L6',  rows: [1,0,0,0,1] },
  { id: 'L7',  rows: [1,2,2,2,1] }, { id: 'L8',  rows: [0,0,1,2,2] }, { id: 'L9',  rows: [2,2,1,0,0] },
  { id: 'L10', rows: [1,2,1,0,1] }, { id: 'L11', rows: [1,0,1,2,1] }, { id: 'L12', rows: [0,1,1,1,0] },
  { id: 'L13', rows: [2,1,1,1,2] }, { id: 'L14', rows: [0,1,0,1,0] }, { id: 'L15', rows: [2,1,2,1,2] },
  { id: 'L16', rows: [1,1,0,1,1] }, { id: 'L17', rows: [1,1,2,1,1] }, { id: 'L18', rows: [0,0,1,0,0] },
  { id: 'L19', rows: [2,2,1,2,2] }, { id: 'L20', rows: [0,2,0,2,0] },
];
export const PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low:     [1,  3,   7],
  mid:     [2,  6,  18],
  high:    [4, 14,  55],
  jackpot: [10, 50, 250],
};
```

**`src/ui/PaylineMap.tsx`** — the two `Record<LineId,string>` maps can't enumerate 20 lines.
Derive labels from the line index instead (the `.map` already has it):
```tsx
{PAYLINES.map((line, i) => {
  // ...
  aria-label={`Payline ${i + 1}`}
  // ...
  <span className="payline-map__label">{`Line ${i + 1}`}</span>
```
Delete `LINE_LABELS` / `LINE_ARIA` and the `LineId` import if now unused. The dot/polyline
rendering is unchanged (still data-driven from `line.rows`).

**`decisions/DEC-016-fun-retune-wild-and-whimsical.md`** — copy the `decisions/_template.md`
structure (see `DEC-015` for a filled example). Content: the retune of Wild & Whimsical to a
measured generous target; **confidence 0.8**; levers = reweighted symbols (sum 42, WOLF 1→3 for
a reachable jackpot), richer paytable, paylines 5→20 (generated strip via `buildStrip`);
measured RTP 93.8% / hit 34.4% / jackpot ~1-in-25k / big-band 4.5% (SPEC-044 simulator, 50k spins
seed 20260705) vs. the old 13% / 10% / never; **supersedes the specifics of DEC-003 (5 paylines)
and DEC-011 (weights/paytable) for W&W** while their mechanics (fixed left-anchored paylines, tier
paytable) hold; engine-no-dom (DEC-001) + config-driven model (DEC-015) intact — retune is DATA.
`affected_scope: [src/engine/strips.ts, src/engine/paylines.ts]`.

**Re-baseline discipline:** all fixture values above were computed against the real engine — if
a test fails on a value that DISAGREES with this spec, the data was applied wrong; if it fails on
a value this spec didn't list, re-derive it from the deterministic engine (that's an intended
re-baseline) and note it in Build Completion. The metrics baseline + the machine-parity contract
are the guards that the tuning is correct.

**Verify-cycle adversarial check (teeth):** revert `REEL_WEIGHTS.WOLF` from 3 back to 1 and
confirm BOTH the metrics baseline (RTP drops, jackpots → 0) AND the machine-parity jackpot seed
(68357 no longer a jackpot) FAIL — proving the re-baselined contract pins the *tuned* machine,
then revert. This is the intended-behavior-change analogue of the STAGE-007 guard-mutation.

**UI preview (orchestrator, at ship):** the paytable's payline map now shows 20 line diagrams,
and the game visibly pays more often with a reachable jackpot — spot-check via the preview.

## Build Completion

**Applied exactly as pinned.** `REEL_WEIGHTS` (sum 42), the generated `REEL_STRIP` (via
`buildStrip(SYMBOLS, REEL_WEIGHTS)`), `PAYLINES` (20 lines), and `PAYTABLE` were applied
byte-for-byte from the spec's Notes. Re-ran the generated strip through vite-node before
touching any test and it matched the spec's pinned 42-symbol strip exactly, confirming the
data was applied correctly before re-baselining fixtures against it. Every value in the spec's
Failing Tests section reproduced exactly once the data was applied (strips, paylines/paytable
synthetic grids, representative seeds 1/6/68357/2/12345/276/999, and the metrics baseline
RTP 0.9379 / hit 0.3443 / tierCounts / jackpots 1 / maxWin 3150 / totalReturned 468950).

**Fixtures re-derived beyond the spec's pinned set** (the spec explicitly anticipated this —
"a synthetic-grid or UI assertion the 20-line change also moved"):
- `src/engine/spin.test.ts` — `resolveStops`/`resolveGrid` tests reference the strip length
  (35 → 42) and pin `createRng(12345)`'s stops/grid; re-derived via the deterministic engine:
  stops `[41, 12, 20, 34, 21]`, grid identical to the new seed-12345 loss grid pinned in
  `index.test.ts`/`spin-parity.test.ts`.
- `src/ui/PaylineMap.test.tsx` — "exposes an accessible label per line" asserted on the old
  `LINE_ARIA['L1']` text ("middle row"); re-derived against the new index-derived label
  (`Payline 1`), consistent with the Notes' drop-in.
- `src/ui/paytable.test.ts` — "each tier has its DEC-011 multipliers" pinned the old paytable
  numbers; re-derived to the DEC-016 numbers (`[10,50,250]` / `[4,14,55]` / `[2,6,18]` /
  `[1,3,7]`), renamed the test to "DEC-016 multipliers".
- `src/ui/PaytableSheet.test.tsx` — "shows tier payouts" asserted literal text `/200/` and
  `/0\.5/` (the old jackpot/low multipliers); re-derived to `/250/` and an exact-match
  `/^1×$/` (the new low 3-of-a-kind multiplier renders as one `"1×"` text node, so an exact
  substring match was needed instead of the old loose `/0\.5/` regex).

No other test files needed changes; the full 54-file / 321-test suite is green.

**Reflection:**

1. **What was the hardest part of this build?** Not the data application (that was
   mechanical — copy the Notes' drop-ins verbatim) but making sure every *unlisted* fixture
   that the 20-line/retuned-paytable change silently moved actually got found. The spec was
   explicit that this could happen, but finding all four instances (`spin.test.ts`'s strip-length
   assumption, `PaylineMap.test.tsx`'s hard-coded aria text, `paytable.test.ts`'s old
   multipliers, `PaytableSheet.test.tsx`'s literal payout text) required running the full
   suite (not just the 8 named files) and reading each failure's diff carefully enough to
   confirm it was a genuine "the retune moved this" case rather than an engine-logic bug I'd
   introduced.
2. **What would you do differently next time?** Run the full `just test` once immediately
   after applying the production data (before touching any of the 8 named test files) to get
   the complete list of everything the retune touches up front, rather than discovering the
   4 unlisted failures only after the 8 named files were already green. Same outcome, slightly
   less efficient path.
3. **Is there anything in this spec that should inform how future specs are written?** The
   "list the exact pins, but explicitly flag that unlisted-but-touched fixtures may need
   re-derivation" pattern worked well — it gave a hard contract to apply mechanically (the 8
   files) while still licensing the judgment call needed for the rest. Worth keeping as the
   template for future behavior-changing retune specs.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused, distinct from the process-focused
build reflection above.*

1. **What would I do differently next time?**
   — Almost nothing — the "measure-then-pin against the real engine during design" discipline
   paid off hugely on the widest-blast-radius spec of the wave. Every pinned fixture reproduced,
   and the build agent's own re-derivation of the 4 *unlisted* fixtures (spin.test, PaylineMap.test,
   paytable.test, PaytableSheet.test) confirms the "here are the pins, re-derive the rest" contract
   scales. The one thing I under-scoped at design time: the 20-payline change rippled into UI tests
   (paytable text, payline-map aria) I hadn't enumerated — I caught the *engine* blast radius fully
   but under-counted the *UI* one. Next behavior-changing UI spec: grep the UI test tree for the
   changing constants up front, not just the engine.

2. **Does any template, constraint, or decision need updating?**
   — No template/constraint change. DEC-016 records the retune and supersedes the DEC-003 (5
   paylines) / DEC-011 (weights/paytable) specifics for W&W. Logged a signal: a behavior-changing
   spec's design should enumerate BOTH the engine and UI fixture blast radius (a UI test can pin a
   payout string or an aria label derived from the changed data).

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. The remaining STAGE-008 backlog (SPEC-047 residual param reads, SPEC-048 theme+
   audio, SPEC-049 reactive context, SPEC-050 selector, SPEC-051–053 machines) is already framed.
   Note for SPEC-051–053 (the themed machines): each new machine's generated strip must be checked
   for adjacent-duplicate quality and its metrics measured with `just simulate` before pinning —
   the same measure-then-pin loop this spec used.
