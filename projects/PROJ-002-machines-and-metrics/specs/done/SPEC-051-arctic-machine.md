---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-051
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
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
  created_at: 2026-07-07

references:
  decisions:
    - DEC-001   # engine-no-dom: Arctic is pure data; the engine never sees theme/audio
    - DEC-013   # audio-engine graph: Arctic supplies per-machine audio PARAMS only
    - DEC-015   # config-driven machine model: a new machine is a data file + a DEC, never engine logic
    - DEC-017   # THIS machine's decision (Arctic theme/audio/math), emitted by this spec
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-045  # buildStrip — generates Arctic's strip from its tuned weights
    - SPEC-046  # the W&W retune this mirrors (measure-then-pin against the simulator)
    - SPEC-048  # theme + audio presentation slice Arctic fills in
    - SPEC-049  # reactive context — Arctic is now a real second option
    - SPEC-050  # the selector — Arctic makes it a real multi-option switch

value_link: >-
  The first themed machine: adds Arctic (cool-blue icy theme + colder audio + its own tuned math,
  RTP ~91%) as pure data + a DEC, selectable via the registry — so the selector (SPEC-050) becomes a
  real, visible/audible switch and STAGE-008's variety thesis lands for the first time.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-07
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). MEASURED Arctic's math against
        the real engine's simulator BEFORE pinning (measure-then-pin, per SPEC-046): tuned weights +
        paytable over ~6 candidate sweeps × up to 10 seeds × 50k spins to land a generous RTP band —
        chosen N5 (weights DEER8/FOX8/SQUIRREL7/BEAR5/EAGLE4/OWL4/BISON3/WOLF3 sum 42; paytable
        low[1,3,9]/mid[2,7,21]/high[5,15,56]/jackpot[10,52,258]) measures avg RTP 90.9% (10-seed range
        89.2–94.5%), hit 30.1%, jackpot ~1/31k; strip (buildStrip) has 0 linear adjacent dups. Pinned
        20k/seed-1 = rtp 0.9435 / hit 0.3015 for the sanity test. Verified all 8 theme contrast pairs
        pass WCAG AA (text-on-bg 16.4:1; min 7.0:1). Distinct from W&W (flatter weights, bigger
        5-of-a-kind payouts, icy palette, colder chord).
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 90000   # nominal — see note (prior run's sub-agent metering not retrievable)
      estimated_usd: 0.59
      recorded_at: 2026-07-07
      note: >-
        Transcribed the spec's verbatim drop-in code: engine/index.ts (buildStrip + REEL_COUNT
        re-exports), src/machines/arctic.ts (ARCTIC_WEIGHTS, ARCTIC_PAYTABLE, ARCTIC_STRIP,
        ARCTIC_MATH, theme, audio), registry.ts registration, DEC-017, and the 6 failing tests in
        src/machines/arctic.test.ts (registration, 8-symbol vocabulary, RTP-band via
        simulateMachine 20k/seed1, strip count-exactness + no adjacent dups, distinct-from-W&W,
        inline WCAG contrast helper). No re-tuning; no engine logic changed. Gate green:
        typecheck/lint/test (362 tests, 61 files)/build/validate/cost-audit all pass;
        `just simulate arctic --spins 50000` reports RTP 89.92%; engine-logic guard diff empty.
        The build ran on a prior (interrupted) overnight sub-agent whose token metering was not
        retrievable on resume — nominal estimate (~90000 tok, $6.6/M Sonnet), not separately metered.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 90000   # nominal — autonomous overnight single-agent run, not separately metered
      estimated_usd: 0.59
      recorded_at: 2026-07-07
      note: >-
        Cold verify on the rebased branch: full gate re-run (typecheck/lint/test 362·61/build/validate/
        cost-audit all exit 0). Engine-logic guard diff EMPTY (DEC-001 intact; engine/index.ts gains
        only two re-exports). Adversarial guard-mutation with teeth: reverting Arctic's weights+paytable
        to W&W's made the "distinct from Wild & Whimsical" test FAIL as designed, then restored clean.
        Preview sanity on the dev server confirmed Arctic is a real second selector option and applies
        its icy theme live (--color-bg #0a1622 on .device-stage), no console errors. Defect count 0.
        Autonomous overnight single-agent run — nominal estimate, not separately metered.
    - cycle: ship
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # ship runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-07
      note: >-
        Resumed the interrupted SPEC-051 run: reconciled the local build branch against git/disk,
        rebased on fresh main, ran verify (above), filled closeout cost, pushed the branch and opened
        the PR, CI-polled to CLEAN/all-checks-green, squash-merged, and did the post-merge STAGE-008
        rollup (timeline ship [x], advance-cycle ship, backlog/Count, brag, archive).
  totals:
    tokens_total: 180000
    estimated_usd: 1.19
    session_count: 4
---

# SPEC-051: Arctic machine

## Context

STAGE-008 built the whole config-driven spine — parameterized engine reads (SPEC-047), a per-machine
theme + audio slice (SPEC-048), a reactive persisted context (SPEC-049), and a selector (SPEC-050) —
but only **one** machine is registered, so the selector shows a single option and none of the switch
machinery is visibly exercised. This spec adds the **first themed machine, Arctic**, as pure data + a
DEC: a cool-blue **icy theme** (runtime CSS-var overrides), **colder audio** (per-machine channel
gains / mix / a hollow stacked-fifths bed), and its **own tuned math** (weights → `buildStrip` strip,
paytable, measured to a generous RTP). Registering it makes the selector a real two-option switch and
proves the SPEC-047/048/049/050 payoff end-to-end (reels + paytable + theme + audio all change
together, and the choice persists across reload).

Per DEC-015 and the stage plan, a new machine is a **data file + a DEC**, never engine logic. Arctic
keeps the **8-symbol vocabulary** (same `SYMBOLS`, same `symbolDisplay` emoji) — it is distinguished
by **theme tokens + audio + tuned math**, exactly as the stage direction specifies. Its math was
**measured against the real simulator before pinning** (the SPEC-046 discipline), so the sanity test
is transcription of measured numbers.

## Goal

Add Arctic — a `Machine` data file (`src/machines/arctic.ts`) with a cool-blue theme, colder audio,
and its own tuned math (weights → `buildStrip`; paytable; measured RTP ~91%, in the ~90–95% band) —
register it in the registry, emit **DEC-017**, and add a parity/metrics-sanity test. Expose
`buildStrip` + `REEL_COUNT` from the engine's public interface so machines build their math via it.

## Inputs

- **Files to read:**
  - `src/machines/wildAndWhimsical.ts` — the default machine's shape to mirror (math + presentation).
  - `src/machines/types.ts` — `Machine`, `MachinePresentation`, `ThemeTokens`, `MachineAudio`.
  - `src/machines/registry.ts` — `MACHINES` (register Arctic here).
  - `src/engine/index.ts` — the public engine surface (add `buildStrip`, `REEL_COUNT`).
  - `src/engine/machine.ts` — `WILD_AND_WHIMSICAL_MATH` (the `MachineMath` shape to fill).
  - `src/engine/stripBuilder.ts` (`buildStrip`), `src/engine/strips.ts` (`SYMBOLS`, `SYMBOL_TIER`, `REEL_COUNT`).
  - `src/ui/reels/symbols.ts` (`SYMBOL_DISPLAY`), `src/ui/audio/audioEngine.ts` / `mixer.ts` / `ambientBed.ts` (default audio to differ from).
  - `decisions/_template.md`, `decisions/DEC-015-*.md`, `decisions/DEC-016-*.md` — DEC format + the machine/retune precedent.
- **Related code paths:** `src/machines/`, `src/engine/`, `decisions/`.

## Outputs

- **Files created:**
  - `src/machines/arctic.ts` — `ARCTIC: Machine` (math + presentation: symbolDisplay + theme + audio).
  - `src/machines/arctic.test.ts` — parity/metrics-sanity test.
  - `decisions/DEC-017-arctic-machine.md` — the Arctic decision.
- **Files modified:**
  - `src/engine/index.ts` — re-export `buildStrip` (from `./stripBuilder`) and `REEL_COUNT` (from `./strips`).
  - `src/machines/registry.ts` — register `ARCTIC` in `MACHINES`.
- **New exports:** `ARCTIC` (arctic.ts); `buildStrip`, `REEL_COUNT` (engine/index.ts).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `ARCTIC` is a valid `Machine`: `id: 'arctic'`, `name: 'Arctic'`, a `math` slice (tuned weights →
      `buildStrip` strip, paytable, reusing `SYMBOLS`/`SYMBOL_TIER`/`PAYLINES`/bet levels), and a
      `presentation` with `symbolDisplay: SYMBOL_DISPLAY` (same 8 symbols), a non-empty `theme`, and an
      `audio` slice distinct from the default.
- [ ] Registered: `getMachine('arctic') === ARCTIC`; `listMachines()` includes it (length ≥ 2);
      `getActiveMachine()` still defaults to Wild & Whimsical (empty storage).
- [ ] **Measured math in band:** `simulateMachine(ARCTIC.math, { spins: 20000, seed: 1 })` reports
      `rtp` in `[0.85, 1.02]` (measured 0.9435), `hitFrequency` in `[0.25, 0.35]` (measured 0.3015),
      and the jackpot rule is `WOLF × 5` (reachable — measured ~1/31k).
- [ ] **Strip integrity:** `ARCTIC.math.strips[0]` has length 42 (= weight sum), no linear adjacent
      duplicates, and per-symbol counts equal `ARCTIC.math.reelWeights`.
- [ ] **Distinct from W&W:** `ARCTIC.math.paytable` ≠ W&W's; `ARCTIC.math.reelWeights` ≠ W&W's;
      `ARCTIC.presentation.theme` is non-empty (W&W's is `{}`); `ARCTIC.presentation.audio.music.chord`
      ≠ the default chord.
- [ ] **Accessible theme:** the `--color-text`-on-`--color-bg` contrast ratio ≥ 4.5:1 (WCAG AA);
      measured 16.4:1.
- [ ] `DEC-017` exists (valid front-matter, `just validate` passes) and records Arctic's theme/audio/math.
- [ ] No engine LOGIC change; `git diff main..HEAD -- src/engine/spin.ts src/engine/paylines.ts
      src/engine/tiers.ts src/engine/balance.ts src/engine/strips.ts src/engine/machine.ts` is EMPTY
      (only `src/engine/index.ts` gains two re-exports). DEC-001 intact.
- [ ] `just typecheck && just lint && just test && just build && just validate && just cost-audit`
      all pass; `just simulate arctic --spins 50000` runs and reports Arctic's metrics.

## Failing Tests

Written now, BEFORE build. All in **`src/machines/arctic.test.ts`** unless noted (plain `.ts`, no JSX).

- `"Arctic is registered and resolvable, default unchanged"` — `getMachine('arctic')` toBe `ARCTIC`;
  `listMachines()` toContain `ARCTIC` and length ≥ 2; `getActiveMachine()` toBe `WILD_AND_WHIMSICAL`
  (empty localStorage).
- `"Arctic keeps the 8-symbol vocabulary"` — `ARCTIC.math.symbols` toEqual `SYMBOLS`;
  `ARCTIC.presentation.symbolDisplay` toBe `SYMBOL_DISPLAY`.
- `"Arctic's math measures in the generous RTP band"` — `const m = simulateMachine(ARCTIC.math,
  { spins: 20000, seed: 1 })`; `expect(m.rtp).toBeGreaterThanOrEqual(0.85)`;
  `expect(m.rtp).toBeLessThanOrEqual(1.02)`; `expect(m.hitFrequency).toBeGreaterThanOrEqual(0.25)`;
  `expect(m.hitFrequency).toBeLessThanOrEqual(0.35)`; `expect(ARCTIC.math.jackpot).toEqual({ symbol:
  'WOLF', count: 5 })`.
- `"Arctic's strip is count-exact with no adjacent duplicates"` — `const s = ARCTIC.math.strips[0]`;
  `expect(s.length).toBe(42)`; assert no `i` with `s[i] === s[i+1]`; tally `s` and assert it toEqual
  `ARCTIC.math.reelWeights`. (All five strips are the same reference — assert
  `ARCTIC.math.strips.every((r) => r === s)`.)
- `"Arctic is distinct from Wild & Whimsical"` — `expect(ARCTIC.math.paytable).not.toEqual(
  WILD_AND_WHIMSICAL.math.paytable)`; `expect(ARCTIC.math.reelWeights).not.toEqual(
  WILD_AND_WHIMSICAL.math.reelWeights)`; `expect(ARCTIC.presentation.theme).not.toEqual({})`;
  `expect(ARCTIC.presentation.audio.music.chord).not.toEqual(
  WILD_AND_WHIMSICAL.presentation.audio.music.chord)`.
- `"Arctic's theme is accessible (text on bg ≥ AA)"` — compute the WCAG contrast ratio between
  `ARCTIC.presentation.theme['--color-text']` and `['--color-bg']` with a small inline helper (sRGB →
  relative luminance → ratio); `expect(ratio).toBeGreaterThanOrEqual(4.5)`.

## Implementation Context

### Decisions that apply

- `DEC-001` (engine-no-dom) — Arctic is data; theme/audio are presentation. The engine gains only two
  re-exports (`buildStrip`, `REEL_COUNT`) on its public interface — no logic change.
- `DEC-013` (audio-engine graph) — Arctic supplies per-machine audio *params* (SPEC-048's `MachineAudio`);
  the graph is unchanged.
- `DEC-015` (config-driven machine model) — a new machine is a data file + a DEC. Arctic proves it.
- `DEC-017` (this spec's DEC) — records Arctic's theme/audio/math + the measured RTP.

### Constraints that apply

- `engine-no-dom` — Arctic touches no engine logic.

### Prior related work

- `SPEC-045` (buildStrip), `SPEC-046` (W&W retune, measure-then-pin), `SPEC-048` (theme/audio slice),
  `SPEC-049`/`SPEC-050` (context + selector) — Arctic is the first machine to exercise all of them.

### Out of scope (for this spec specifically)

- **Desert / Ocean** — SPEC-052 / SPEC-053 (same pattern; this establishes it).
- **Per-reel asymmetric strips** — Arctic reuses one strip across all 5 reels (like W&W).
- **New audio nodes** — DEC-013 graph unchanged; Arctic only varies params.
- **A themed selector option style** — the native `<select>` shows "Arctic" as text; no per-option styling.

## Notes for the Implementer

**Toolchain brief:** ESLint restricts only `src/engine/**` (no React/DOM); `src/machines/**` may import
engine internals, but this spec routes through the public `src/engine/index.ts` (adds `buildStrip` +
`REEL_COUNT` there). `tsconfig` include is `["src"]`. No new dependency. The DEC is REQUIRED (DEC-017).
`just simulate arctic` works once Arctic is registered (the `simulate` script resolves machines via the
registry). Measure-then-pin: the numbers below are measured — do NOT re-tune; if a test's RTP assertion
fails, the data was transcribed wrong, not the pin.

**`src/engine/index.ts`** — add two re-exports (machines build their math via the public interface):

```ts
export { SYMBOLS, SYMBOL_TIER, REEL_COUNT } from './strips';
export { buildStrip } from './stripBuilder';
```

(Keep the existing re-exports; just add `REEL_COUNT` to the strips line and add the `buildStrip` line.)

**`src/machines/arctic.ts`** — the data file (drop-in; the weights/paytable/theme/audio are MEASURED):

```ts
// Arctic — the first themed machine (SPEC-051, DEC-017). Pure data (DEC-015):
// same 8-symbol vocabulary as Wild & Whimsical, distinguished by an icy cool-blue
// theme (runtime CSS-var overrides), colder audio (per-machine params — DEC-013),
// and its own tuned math (weights → buildStrip; measured RTP ~91%, hit ~30%,
// jackpot ~1/31k — SPEC-046 measure-then-pin discipline). The engine never sees
// theme/audio (DEC-001).
import {
  SYMBOLS,
  SYMBOL_TIER,
  REEL_COUNT,
  PAYLINES,
  BET_LEVELS,
  DEFAULT_BET,
  STARTING_BALANCE,
  buildStrip,
} from '../engine/index';
import type { MachineMath, SymbolId, Tier } from '../engine/index';
import { SYMBOL_DISPLAY } from '../ui/reels/symbols';
import type { Machine } from './types';

/** Arctic's tuned reel weights (sum 42) — flatter than W&W, more mid-tier (icy, steadier hits). */
const ARCTIC_WEIGHTS: Record<SymbolId, number> = {
  DEER: 8,
  FOX: 8,
  SQUIRREL: 7,
  BEAR: 5,
  EAGLE: 4,
  OWL: 4,
  BISON: 3,
  WOLF: 3,
};

/** Arctic's paytable — bigger 5-of-a-kind payouts than W&W (colder, higher-variance feel). */
const ARCTIC_PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low: [1, 3, 9],
  mid: [2, 7, 21],
  high: [5, 15, 56],
  jackpot: [10, 52, 258],
};

/** One strip, generated from the tuned weights (0 linear adjacent dups; length 42). */
const ARCTIC_STRIP = buildStrip(SYMBOLS, ARCTIC_WEIGHTS);

const ARCTIC_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: ARCTIC_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: Array.from({ length: REEL_COUNT }, () => ARCTIC_STRIP),
  paylines: PAYLINES,
  paytable: ARCTIC_PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};

export const ARCTIC: Machine = {
  id: 'arctic',
  name: 'Arctic',
  math: ARCTIC_MATH,
  presentation: {
    symbolDisplay: SYMBOL_DISPLAY, // same 8-animal vocabulary; theme conveys "Arctic", not new symbols
    // Cool-blue icy palette (runtime overrides of tokens.css). All pairs pass WCAG AA
    // (text-on-bg 16.4:1). Applied on the .device-stage root by useMachineTheme (SPEC-048).
    theme: {
      '--color-bg': '#0a1622',
      '--color-surface': '#14293b',
      '--color-frame': '#2b5170',
      '--color-text': '#eaf4fb',
      '--color-text-muted': '#9fbdd0',
      '--color-accent': '#3fc4ec',
      '--color-coin': '#cfe8f5',
      '--color-win-small': '#38b2a3',
      '--color-win-big': '#4fc3f7',
      '--color-jackpot': '#c9f0ff',
      '--color-jackpot-sky': '#06263f',
    },
    // Colder audio: quieter bed, crisper jingle, a hollow stacked-fifths pad on slow whole notes.
    audio: {
      channelGains: { bed: 0.22, sfx: 0.62, jingle: 0.85 },
      mix: { duckLevel: 0.04, swellLevel: 0.4, rampS: 0.25, restoreS: 0.7, holdMs: 3000 },
      music: { chord: ['D3', 'A3', 'E4', 'B4'], noteDuration: '1n', loopInterval: '2m' },
    },
  },
};
```

**`src/machines/registry.ts`** — register Arctic (import + add to the map; keep everything else):

```ts
import { ARCTIC } from './arctic';
// ...
export const MACHINES: Record<string, Machine> = {
  [WILD_AND_WHIMSICAL.id]: WILD_AND_WHIMSICAL,
  [ARCTIC.id]: ARCTIC,
};
```

(Wild & Whimsical stays first so it remains the default and the selector lists it first.)

**`decisions/DEC-017-arctic-machine.md`** — create from `decisions/_template.md`. Key fields: `id:
DEC-017`, `type: decision`, `confidence: 0.8`, `project.id: PROJ-002`, `created_at: 2026-07-07`,
`tags: [machine, theme, audio, tuning]`, `affected_scope: ["src/machines/arctic.ts"]`. Body:

- **Decision:** "Arctic is the first themed machine — the shared 8-symbol vocabulary with an icy
  cool-blue theme, colder audio, and its own tuned math (RTP ~91%), added as pure data + this DEC."
- **Context:** STAGE-008's spine (SPEC-047/048/049/050) is inert with one machine; Arctic proves the
  data-only "add a machine" path and makes the selector a real switch.
- **Alternatives:** (A) new symbol set per machine — rejected (breaks the 8-symbol vocabulary the
  stage fixes; multiplies art/paytable work). (B) same math as W&W, theme/audio-only — rejected (the
  stage calls for *tuned math* per machine; identical math makes machines feel same-y). (C, chosen)
  shared vocabulary + per-machine theme + audio + tuned math — matches DEC-015 + the stage direction.
- **Consequences:** +proves the config-driven spine end-to-end; +cheap to add Desert/Ocean the same
  way. −each machine's math needs measuring (mitigated by the simulator). Neutral: strips reused
  across reels (per-reel asymmetry is a future spec).
- **Validation:** the metrics-sanity test pins Arctic's RTP band; `just simulate arctic` re-measures on
  demand; revisit if the RTP drifts out of ~90–95% or the theme fails contrast.
- **References:** SPEC-051; DEC-015, DEC-016, DEC-013, DEC-001.

**Measured pins (do not re-tune):** weights sum 42; `buildStrip(SYMBOLS, ARCTIC_WEIGHTS)` → length 42,
0 adjacent dups; `simulateMachine(ARCTIC.math, {spins:20000, seed:1})` → rtp 0.9435, hitFreq 0.3015,
2 jackpots; over 10 seeds × 50k, avg RTP 90.9% (range 89.2–94.5%), jackpot ~1/31k.

**Verify-cycle adversarial checks (teeth):** (a) revert one `ARCTIC_WEIGHTS` entry to the W&W value
(e.g. `DEER: 9`) → the strip count-exactness test (counts == weights, length 42) and/or the RTP-band
test shifts — confirm a test FAILS; revert. (b) set `theme: {}` → the "distinct from W&W" +
theme-contrast tests FAIL; revert. (c) change `music.chord` to the W&W chord → the "distinct" test
FAILS; revert. (d) drop `ARCTIC` from `MACHINES` → the registration test FAILS; revert.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-051-arctic-machine`
- **All acceptance criteria met?** yes
- **New decisions emitted:** DEC-017 (Arctic machine).
- **Deviations from spec:** None. All drop-in code (engine/index.ts re-exports, arctic.ts,
  registry.ts, DEC-017 body) transcribed verbatim from the spec's Notes. The six failing tests
  were implemented as specified, with the WCAG contrast helper written inline as directed.
- **Follow-up work identified:** None beyond what the spec already scopes out (Desert/Ocean —
  SPEC-052/053; per-reel asymmetric strips; a themed selector option style).

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing; the Notes section had
   complete drop-in code for every file, so this was a transcription + test-writing exercise
   exactly as advertised.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No. DEC-001,
   DEC-013, DEC-015 covered the relevant boundaries; `just decisions-audit` flags an expected
   DEC-015/DEC-017 scope overlap (same pattern as other machine-model DECs), not a gap.
3. **If you did this task again, what would you do differently?** — Nothing structurally; would
   run the same measure-then-pin discipline. One minor note: `just simulate arctic --spins 50000`
   (unseeded) reports RTP 89.92%, slightly under the "~90–95%" prose in the spec's Goal, but the
   pinned 20k/seed=1 acceptance criterion (0.9435) and the [0.85, 1.02] band are both satisfied —
   consistent with variance across different seeds/spin counts, not a transcription error.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused, distinct from the build reflection.*

1. **What would I do differently next time?** — This spec was already fully built and gate-green on its
   branch when a prior overnight run was interrupted before verify/ship. Resuming cost nothing extra —
   the trust-git/disk reconcile made it a clean pickup. The one honest gap is cost metering: the build
   sub-agent's tokens weren't retrievable after the interruption, so the build cost is a nominal
   estimate. Next time I'd have the interrupted run persist its subagent_tokens to the spec before
   handing off, so a resume can record real numbers.
2. **Does any template, constraint, or decision need updating?** — No. Arctic validated the DEC-015
   "a machine is data + a DEC" path end-to-end (data file + DEC-017, zero engine-logic change, guard
   diff EMPTY) exactly as the config-driven spine promised. The measure-then-pin discipline (SPEC-046)
   transferred cleanly to a second machine. No template or constraint gap surfaced.
3. **Is there a follow-up spec I should write now before I forget?** — The two already-scoped machines,
   Desert (SPEC-052, DEC-018) and Ocean (SPEC-053, DEC-019), follow this exact pattern and are the last
   two STAGE-008 specs. No new follow-up beyond them; Arctic proves the mold they'll be cast from.
