---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-053
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
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
    - DEC-001   # engine-no-dom: Ocean is pure data; the engine never sees theme/audio
    - DEC-013   # audio-engine graph: Ocean supplies per-machine audio PARAMS only
    - DEC-015   # config-driven machine model: a new machine is a data file + a DEC, never engine logic
    - DEC-017   # Arctic — the first themed machine; Ocean is the fourth, same mold
    - DEC-018   # Desert — the second themed machine; Ocean follows its exact pattern
    - DEC-019   # THIS machine's decision (Ocean theme/audio/math), emitted by this spec
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-045  # buildStrip — generates Ocean's strip from its tuned weights
    - SPEC-046  # the W&W retune (measure-then-pin against the simulator)
    - SPEC-048  # theme + audio presentation slice Ocean fills in
    - SPEC-049  # reactive context — Ocean is a fourth real option
    - SPEC-050  # the selector — Ocean makes it a four-option switch
    - SPEC-051  # Arctic — the first themed machine
    - SPEC-052  # Desert — the second themed machine; Ocean follows its exact pattern

value_link: >-
  The fourth and final themed machine: adds Ocean (teal/deep-blue flowing theme + flowing, spacious
  audio + its own steady, low-variance tuned math, the highest hit-frequency of the four, avg RTP ~94%)
  as pure data + a DEC, selectable via the registry — so the selector (SPEC-050) becomes a four-option
  switch and STAGE-008's variety thesis lands with its complete 4-machine set.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-07
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). MEASURED Ocean's math against
        the real engine's simulator BEFORE pinning (measure-then-pin, per SPEC-046/051/052): swept ~10
        weight profiles (steep → flat) × paytable scales × 10 seeds × 50k spins. Ocean's identity is the
        INVERSE of Desert's sparseness — "flowing/steady": the HIGHEST hit-frequency of the four with the
        GENTLEST high/jackpot payouts (low variance). Concentrating weight on the low symbols to lift hit-
        frequency drove RTP up fast (first candidates overshot 112–128%); the paytable multipliers were
        pulled down to land the band. Chosen profile J — weights DEER10/FOX9/SQUIRREL7/BEAR4/EAGLE3/OWL3/
        BISON3/WOLF3 (sum 42, steeper low-end than W&W/Arctic/Desert) + paytable low[1,2,6]/mid[2,4,12]/
        high[3,9,32]/jackpot[6,30,150] (the gentlest highs of the four — low-variance, flowing) → avg RTP
        94.21% (10-seed range 92.88–95.74%), hit 37.45% (the highest — vs W&W 34% / Arctic 30% / Desert
        28%), jackpot ~1/26.3k; strip (buildStrip) has 0 linear adjacent dups. Pinned 20k/seed-1 = rtp
        0.94185 / hit 0.37165 (big 0.04595, 3 jackpots) for the sanity test. Verified the theme's text-on-
        bg contrast is 16.14:1 (WCAG AA; every foreground pair — text/muted/accent/coin/wins — ≥ 7.29:1).
        Distinct from W&W AND Arctic AND Desert (steeper weights, gentlest paytable, teal/deep-blue
        palette, flowing A-major chord `['A2','E3','C#4','E4']`).
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null   # orchestrator to fill tokens_total from the build sub-agent's subagent_tokens
      recorded_at: 2026-07-07
      note: >-
        (to be filled at ship from the build sub-agent's metered subagent_tokens)
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # orchestrator to fill at ship
      recorded_at: 2026-07-07
      note: >-
        (to be filled at ship)
    - cycle: ship
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # ship runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-07
      note: >-
        (to be filled at ship)
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-053: Ocean machine

## Context

STAGE-008 built the config-driven spine (SPEC-047 parameterized reads · SPEC-048 theme+audio slice ·
SPEC-049 reactive context · SPEC-050 selector) and then landed three themed machines — **Arctic**
(SPEC-051, icy/steady), **Desert** (SPEC-052, warm/sparse) — proving the data-only "add a machine" path
end-to-end. **Ocean** is the **fourth and final** themed machine that completes the set: a teal/deep-blue
**ocean theme**, **flowing, spacious audio**, and its own **steady, low-variance tuned math** (the
HIGHEST hit-frequency of the four, but the gentlest high/jackpot payouts). Registering it turns the
selector into a real **four-option** switch and is the last spec of STAGE-008 (after it, the stage ships
its 4-machine set).

Per DEC-015, DEC-017, and DEC-018, a new machine is a **data file + a DEC**, never engine logic. Ocean
keeps the **8-symbol vocabulary** (same `SYMBOLS`, same `symbolDisplay` emoji) — it is distinguished by
**theme tokens + audio + tuned math**, exactly like Arctic and Desert. Its math was **measured against
the real simulator before pinning** (the SPEC-046/051/052 discipline), so the sanity test is
transcription of measured numbers.

Ocean's identity is deliberately the **inverse of Desert's sparseness**: where Desert hits rarely with
juicy rare wins (high variance), Ocean hits *often* with *modest* wins — a steady, "flowing" feel. This
gives the four machines a coherent spread of character: W&W (balanced default), Arctic (steady/icy),
Desert (sparse/high-variance), Ocean (frequent/low-variance).

## Goal

Add Ocean — a `Machine` data file (`src/machines/ocean.ts`) with a teal/deep-blue theme, flowing audio,
and its own steady tuned math (weights → `buildStrip`; paytable; measured avg RTP ~94%, in the ~92–96%
band; hit ~37%, the highest of the four) — register it in the registry, emit **DEC-019**, and add a
parity/metrics-sanity test. No engine logic changes (Arctic already exposed `buildStrip` + `REEL_COUNT`
on the public engine interface; Ocean reuses them).

## Inputs

- **Files to read:**
  - `src/machines/desert.ts` — the second themed machine; Ocean mirrors its exact shape (math + theme + audio).
  - `src/machines/arctic.ts` — the first themed machine (same mold).
  - `src/machines/wildAndWhimsical.ts` — the default machine's presentation shape.
  - `src/machines/types.ts` — `Machine`, `MachinePresentation`, `ThemeTokens`, `MachineAudio`.
  - `src/machines/registry.ts` — `MACHINES` (register Ocean here).
  - `src/engine/index.ts` — the public engine surface (already re-exports `buildStrip`, `REEL_COUNT` since SPEC-051).
  - `src/machines/desert.test.ts` — the test template to mirror (registration / vocabulary / RTP-band / strip / distinct / contrast).
  - `decisions/DEC-018-desert-machine.md`, `decisions/_template.md` — DEC format + the machine precedent.
- **Related code paths:** `src/machines/`, `src/engine/`, `decisions/`.

## Outputs

- **Files created:**
  - `src/machines/ocean.ts` — `OCEAN: Machine` (math + presentation: symbolDisplay + theme + audio).
  - `src/machines/ocean.test.ts` — parity/metrics-sanity test.
  - `decisions/DEC-019-ocean-machine.md` — the Ocean decision.
- **Files modified:**
  - `src/machines/registry.ts` — register `OCEAN` in `MACHINES` (after Desert; W&W stays first/default).
- **New exports:** `OCEAN` (ocean.ts).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `OCEAN` is a valid `Machine`: `id: 'ocean'`, `name: 'Ocean'`, a `math` slice (tuned weights →
      `buildStrip` strip, paytable, reusing `SYMBOLS`/`SYMBOL_TIER`/`PAYLINES`/bet levels), and a
      `presentation` with `symbolDisplay: SYMBOL_DISPLAY` (same 8 symbols), a non-empty `theme`, and an
      `audio` slice distinct from the default.
- [ ] Registered: `getMachine('ocean') === OCEAN`; `listMachines()` includes it (length ≥ 4);
      `getActiveMachine()` still defaults to Wild & Whimsical (empty storage).
- [ ] **Measured math in band:** `simulateMachine(OCEAN.math, { spins: 20000, seed: 1 })` reports
      `rtp` in `[0.88, 1.00]` (measured 0.94185), `hitFrequency` in `[0.35, 0.40]` (measured 0.37165,
      the highest of the four), and the jackpot rule is `WOLF × 5` (reachable — measured ~1/26.3k).
- [ ] **Strip integrity:** `OCEAN.math.strips[0]` has length 42 (= weight sum), no linear adjacent
      duplicates, and per-symbol counts equal `OCEAN.math.reelWeights`.
- [ ] **Distinct from W&W AND Arctic AND Desert:** `OCEAN.math.paytable` ≠ each of theirs;
      `OCEAN.math.reelWeights` ≠ each of theirs; `OCEAN.presentation.theme` is non-empty (W&W's is `{}`);
      `OCEAN.presentation.audio.music.chord` ≠ the default chord and ≠ Arctic's and ≠ Desert's chord.
- [ ] **Accessible theme:** the `--color-text`-on-`--color-bg` contrast ratio ≥ 4.5:1 (WCAG AA);
      measured 16.14:1.
- [ ] `DEC-019` exists (valid front-matter, `just validate` passes) and records Ocean's theme/audio/math.
- [ ] No engine LOGIC change; `git diff main..HEAD -- src/engine/` is EMPTY (Ocean touches only
      `src/machines/`, `decisions/`). DEC-001 intact.
- [ ] `just typecheck && just lint && just test && just build && just validate && just cost-audit`
      all pass; `just simulate ocean --spins 50000` runs and reports Ocean's metrics.

## Failing Tests

Written now, BEFORE build. All in **`src/machines/ocean.test.ts`** (plain `.ts`, no JSX — mirrors
`desert.test.ts`).

- `"Ocean is registered and resolvable, default unchanged"` — `getMachine('ocean')` toBe `OCEAN`;
  `listMachines()` toContain `OCEAN` and length ≥ 4; `getActiveMachine()` toBe `WILD_AND_WHIMSICAL`
  (empty localStorage).
- `"Ocean keeps the 8-symbol vocabulary"` — `OCEAN.math.symbols` toEqual `SYMBOLS`;
  `OCEAN.presentation.symbolDisplay` toBe `SYMBOL_DISPLAY`.
- `"Ocean's math measures in the generous RTP band"` — `const m = simulateMachine(OCEAN.math,
  { spins: 20000, seed: 1 })`; `expect(m.rtp).toBeGreaterThanOrEqual(0.88)`;
  `expect(m.rtp).toBeLessThanOrEqual(1.00)`; `expect(m.hitFrequency).toBeGreaterThanOrEqual(0.35)`;
  `expect(m.hitFrequency).toBeLessThanOrEqual(0.40)`; `expect(OCEAN.math.jackpot).toEqual({ symbol:
  'WOLF', count: 5 })`.
- `"Ocean's strip is count-exact with no adjacent duplicates"` — `const s = OCEAN.math.strips[0]`;
  `expect(s.length).toBe(42)`; assert no `i` with `s[i] === s[i+1]`; tally `s` and assert it toEqual
  `OCEAN.math.reelWeights`; assert `OCEAN.math.strips.every((r) => r === s)`.
- `"Ocean is distinct from Wild & Whimsical, Arctic, and Desert"` — `expect(OCEAN.math.paytable).not.toEqual(
  WILD_AND_WHIMSICAL.math.paytable)` and `.not.toEqual(ARCTIC.math.paytable)` and `.not.toEqual(DESERT.math.paytable)`;
  `expect(OCEAN.math.reelWeights).not.toEqual(WILD_AND_WHIMSICAL.math.reelWeights)` and
  `.not.toEqual(ARCTIC.math.reelWeights)` and `.not.toEqual(DESERT.math.reelWeights)`;
  `expect(OCEAN.presentation.theme).not.toEqual({})`;
  `expect(OCEAN.presentation.audio.music.chord).not.toEqual(WILD_AND_WHIMSICAL.presentation.audio.music.chord)`
  and `.not.toEqual(ARCTIC.presentation.audio.music.chord)` and `.not.toEqual(DESERT.presentation.audio.music.chord)`.
- `"Ocean's theme is accessible (text on bg ≥ AA)"` — compute the WCAG contrast ratio between
  `OCEAN.presentation.theme['--color-text']` and `['--color-bg']` with the same inline helper as
  `desert.test.ts` (sRGB → relative luminance → ratio); `expect(ratio).toBeGreaterThanOrEqual(4.5)`.

## Implementation Context

*Read this section (and the files it points to) before starting
the build cycle. It is the equivalent of a handoff document, folded
into the spec since there is no separate receiving agent.*

### Decisions that apply

- `DEC-001` (engine-no-dom) — Ocean is data; theme/audio are presentation. Zero engine change (the
  `buildStrip`/`REEL_COUNT` re-exports already landed in SPEC-051).
- `DEC-013` (audio-engine graph) — Ocean supplies per-machine audio *params* (SPEC-048's `MachineAudio`);
  the graph is unchanged.
- `DEC-015` (config-driven machine model) — a new machine is a data file + a DEC. Ocean is the fourth.
- `DEC-017` (Arctic) / `DEC-018` (Desert) — the themed-machine mold; Ocean follows its exact structure.
- `DEC-019` (this spec's DEC) — records Ocean's theme/audio/math + the measured RTP.

### Constraints that apply

- `engine-no-dom` — Ocean touches no engine logic; `git diff main..HEAD -- src/engine/` must be EMPTY.

### Prior related work

- `SPEC-045` (buildStrip), `SPEC-046` (measure-then-pin), `SPEC-048` (theme/audio slice),
  `SPEC-049`/`SPEC-050` (context + selector), `SPEC-051` (Arctic), `SPEC-052` (Desert — the mold this
  reuses verbatim).

### Out of scope (for this spec specifically)

Explicit list of what this spec does NOT include. If any of these feel necessary during build, create a
new spec rather than expanding this one.

- **A fifth machine / Food & Drink machines** — parked fast-follow (a future wave, per the stage scope).
- **Per-reel asymmetric strips** — Ocean reuses one strip across all 5 reels (like W&W / Arctic / Desert).
- **New audio nodes** — DEC-013 graph unchanged; Ocean only varies params.
- **A themed selector option style** — the native `<select>` shows "Ocean" as text; no per-option styling.
- **The STAGE-008 stage-ship** — done in the ship cycle AFTER Ocean merges (this spec ships the machine;
  the orchestrator then does the stage close-out), not part of this build.

## Notes for the Implementer

**Toolchain brief:** ESLint restricts only `src/engine/**` (no React/DOM); `src/machines/**` may import
the public `src/engine/index.ts`. `tsconfig` include is `["src"]`. No new dependency. The DEC is
REQUIRED (DEC-019). `just simulate ocean` works once Ocean is registered. Measure-then-pin: the numbers
below are measured — do NOT re-tune; if a test's RTP assertion fails, the data was transcribed wrong,
not the pin. This is a pure transcription build (mirror `desert.ts` / `desert.test.ts`).

**`src/machines/ocean.ts`** — the data file (drop-in; weights/paytable/theme/audio are MEASURED):

```ts
// Ocean — the fourth and final themed machine (SPEC-053, DEC-019). Pure data (DEC-015):
// same 8-symbol vocabulary as Wild & Whimsical, distinguished by a teal/deep-blue ocean
// theme (runtime CSS-var overrides), flowing spacious audio (per-machine params — DEC-013),
// and its own steady, low-variance tuned math (weights → buildStrip; measured avg RTP ~94%,
// hit ~37% — the HIGHEST hit-frequency of the four — jackpot ~1/26.3k; SPEC-046/051/052
// measure-then-pin discipline). The engine never sees theme/audio (DEC-001).
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

/** Ocean's tuned reel weights (sum 42) — steeper low-end than W&W/Arctic/Desert (most frequent hits). */
const OCEAN_WEIGHTS: Record<SymbolId, number> = {
  DEER: 10,
  FOX: 9,
  SQUIRREL: 7,
  BEAR: 4,
  EAGLE: 3,
  OWL: 3,
  BISON: 3,
  WOLF: 3,
};

/** Ocean's paytable — the gentlest highs of the four (steady, low-variance "flowing" feel). */
const OCEAN_PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low: [1, 2, 6],
  mid: [2, 4, 12],
  high: [3, 9, 32],
  jackpot: [6, 30, 150],
};

/** One strip, generated from the tuned weights (0 linear adjacent dups; length 42). */
const OCEAN_STRIP = buildStrip(SYMBOLS, OCEAN_WEIGHTS);

const OCEAN_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: OCEAN_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: Array.from({ length: REEL_COUNT }, () => OCEAN_STRIP),
  paylines: PAYLINES,
  paytable: OCEAN_PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};

export const OCEAN: Machine = {
  id: 'ocean',
  name: 'Ocean',
  math: OCEAN_MATH,
  presentation: {
    symbolDisplay: SYMBOL_DISPLAY, // same 8-animal vocabulary; theme conveys "Ocean", not new symbols
    // Teal/deep-blue ocean palette (runtime overrides of tokens.css). Text-on-bg 16.14:1 (WCAG AA);
    // every foreground pair ≥ 7.29:1. Applied on the .device-stage root by useMachineTheme (SPEC-048).
    theme: {
      '--color-bg': '#041a26',
      '--color-surface': '#0a2f42',
      '--color-frame': '#1c6f80',
      '--color-text': '#e6f7fb',
      '--color-text-muted': '#9ec9d6',
      '--color-accent': '#25c7c9',
      '--color-coin': '#7fe3d8',
      '--color-win-small': '#2fb9a6',
      '--color-win-big': '#33c9d6',
      '--color-jackpot': '#bdf1ec',
      '--color-jackpot-sky': '#02121b',
    },
    // Flowing, spacious audio: gentle bed, slow swells, a shimmering open A-major chord on long whole
    // notes over a wide loop.
    audio: {
      channelGains: { bed: 0.28, sfx: 0.6, jingle: 0.82 },
      mix: { duckLevel: 0.05, swellLevel: 0.45, rampS: 0.3, restoreS: 0.8, holdMs: 3200 },
      music: { chord: ['A2', 'E3', 'C#4', 'E4'], noteDuration: '1n', loopInterval: '3m' },
    },
  },
};
```

**`src/machines/registry.ts`** — register Ocean (import + add to the map after Desert; keep the rest):

```ts
import { OCEAN } from './ocean';
// ...
export const MACHINES: Record<string, Machine> = {
  [WILD_AND_WHIMSICAL.id]: WILD_AND_WHIMSICAL,
  [ARCTIC.id]: ARCTIC,
  [DESERT.id]: DESERT,
  [OCEAN.id]: OCEAN,
};
```

(Wild & Whimsical stays first — default + first in the selector; Ocean lists fourth, after Desert.)

**`src/machines/ocean.test.ts`** — mirror `desert.test.ts` exactly, adding `DESERT` to the imports and
the extra "distinct from Desert" assertions (so the distinctness test covers W&W AND Arctic AND Desert),
and use `listMachines()` length ≥ 4. The inline WCAG contrast helper is copied verbatim from
`desert.test.ts` (no dependency).

**`decisions/DEC-019-ocean-machine.md`** — create from `decisions/_template.md`. Key fields: `id:
DEC-019`, `type: decision`, `confidence: 0.8`, `project.id: PROJ-002`, `created_at: 2026-07-07`,
`tags: [machine, theme, audio, tuning]`, `affected_scope: ["src/machines/ocean.ts"]`. Body:

- **Decision:** "Ocean is the fourth and final themed machine — the shared 8-symbol vocabulary with a
  teal/deep-blue ocean theme, flowing spacious audio, and its own steady, low-variance tuned math (the
  highest hit-frequency of the four, avg RTP ~94%, hit ~37%), added as pure data + this DEC (a sibling
  of DEC-017 Arctic / DEC-018 Desert). Completes STAGE-008's 4-machine set."
- **Context:** SPEC-051/052 (Arctic/Desert) proved the data-only machine path; Ocean reuses it as the
  fourth option and turns the selector into a four-option switch. Ocean's identity is the *inverse of
  Desert's sparseness*: it hits *often* with *modest* wins (steady, low variance) — a "flowing" feel that
  reads as "ocean" and gives the four machines a coherent spread (default / icy-steady / sparse / flowing).
- **Alternatives:** (A) new symbol set per machine — rejected (breaks the 8-symbol vocabulary; per
  DEC-017/018). (B) reuse an existing machine's math, theme/audio-only — rejected (the stage calls for
  *tuned math* per machine; identical math makes machines feel same-y). (C, chosen) shared vocabulary +
  per-machine teal theme + flowing audio + steady/low-variance tuned math — matches DEC-015 +
  DEC-017/018.
- **Consequences:** +the fourth machine completes STAGE-008's variety thesis and lets the stage ship. −
  each machine's math needs measuring (mitigated by the simulator — `just simulate ocean`). Neutral:
  strips reused across reels (per-reel asymmetry is a future spec).
- **Validation:** the metrics-sanity test pins Ocean's RTP band (20k/seed-1 = rtp 0.94185 / hit 0.37165);
  over 10 seeds × 50k, avg RTP 94.21% (range 92.88–95.74%), hit 37.45%, jackpot ~1/26.3k.
  `just simulate ocean` re-measures on demand; revisit if the RTP drifts out of ~92–96% or the theme
  fails contrast (text-on-bg 16.14:1 today).
- **References:** SPEC-053; DEC-018, DEC-017, DEC-015, DEC-016, DEC-013, DEC-001.

**Measured pins (do not re-tune):** weights sum 42; `buildStrip(SYMBOLS, OCEAN_WEIGHTS)` → length 42,
0 adjacent dups, tally `{DEER:10,FOX:9,SQUIRREL:7,BEAR:4,EAGLE:3,OWL:3,BISON:3,WOLF:3}`;
`simulateMachine(OCEAN.math, {spins:20000, seed:1})` → rtp 0.94185, hitFreq 0.37165, big-tier 0.04595,
3 jackpots; over 10 seeds × 50k, avg RTP 94.21% (range 92.88–95.74%), hit 37.45%, jackpot ~1/26.3k.
Theme contrast: text-on-bg 16.14:1, every foreground pair (text/muted/accent/coin/win-small/win-big/
jackpot) ≥ 7.29:1.

**Verify-cycle adversarial checks (teeth):** (a) revert `OCEAN_WEIGHTS` to W&W/Arctic/Desert's values →
the strip count-exactness test (counts == weights) and/or the RTP-band + hit-band tests shift (Ocean's
hit-band lower bound 0.35 sits ABOVE Arctic 0.30 / Desert 0.28 / W&W 0.34) — confirm a test FAILS;
revert. (b) set `theme: {}` → the "distinct" + theme-contrast tests FAIL; revert. (c) change
`music.chord` to the W&W chord `['C3','G3','C4','E4']`, Arctic's `['D3','A3','E4','B4']`, or Desert's
`['G3','B3','D4','A4']` → the "distinct" test FAILS; revert. (d) drop `OCEAN` from `MACHINES` → the
registration test FAILS; revert.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?** yes/no
- **New decisions emitted:**
  - `DEC-019` — Ocean machine (if any)
- **Deviations from spec:**
  - [list]
- **Follow-up work identified:**
  - [any new specs for the stage's backlog]

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

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
