---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-052
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
    - DEC-001   # engine-no-dom: Desert is pure data; the engine never sees theme/audio
    - DEC-013   # audio-engine graph: Desert supplies per-machine audio PARAMS only
    - DEC-015   # config-driven machine model: a new machine is a data file + a DEC, never engine logic
    - DEC-017   # Arctic — the first themed machine; Desert is the second, same mold
    - DEC-018   # THIS machine's decision (Desert theme/audio/math), emitted by this spec
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-045  # buildStrip — generates Desert's strip from its tuned weights
    - SPEC-046  # the W&W retune (measure-then-pin against the simulator)
    - SPEC-048  # theme + audio presentation slice Desert fills in
    - SPEC-049  # reactive context — Desert is a third real option
    - SPEC-050  # the selector — Desert makes it a three-option switch
    - SPEC-051  # Arctic — the first themed machine; Desert follows its exact pattern

value_link: >-
  The second themed machine: adds Desert (warm sand/amber theme + warm, dry audio + its own sparse,
  higher-variance tuned math, avg RTP ~90%) as pure data + a DEC, selectable via the registry — so the
  selector (SPEC-050) becomes a three-option switch and STAGE-008's variety thesis deepens.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-07
      note: >-
        Design authored on the main Opus orchestrator loop (un-metered). MEASURED Desert's math against
        the real engine's simulator BEFORE pinning (measure-then-pin, per SPEC-046/051): swept ~5 weight
        profiles (steep → flat) × paytable scales × up to 10 seeds × 50k spins. Steep weights overshot
        RTP (>110%); flat "sparse" weights landed the desert character. Chosen profile X1 — weights
        DEER8/FOX7/SQUIRREL6/BEAR5/EAGLE5/OWL4/BISON4/WOLF3 (sum 42, flatter/sparser than W&W and
        Arctic) + paytable low[1,2,8]/mid[2,8,21]/high[7,18,60]/jackpot[12,58,280] (stingy small wins,
        juicy high/jackpot — high-variance) → avg RTP 89.98% (10-seed range 87.4–94.0%), hit 27.65%
        (sparser than Arctic 30% / W&W 34%), jackpot ~1/21.7k; strip (buildStrip) has 0 linear adjacent
        dups. Pinned 20k/seed-1 = rtp 0.9556 / hit 0.2797 for the sanity test. Verified all 7 theme
        contrast pairs pass WCAG AA (text-on-bg 15.76:1; min 8.2:1). Distinct from W&W AND Arctic
        (flatter weights, stingy-low/juicy-high payouts, warm amber palette, warm major chord).
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-052: Desert machine

## Context

STAGE-008 built the config-driven spine (SPEC-047 parameterized reads · SPEC-048 theme+audio slice ·
SPEC-049 reactive context · SPEC-050 selector) and SPEC-051 landed the **first** themed machine,
Arctic, proving the data-only "add a machine" path end-to-end. Desert is the **second** themed machine
— same pattern, a fresh identity: a warm sand/amber **desert theme**, **warm, dry audio**, and its own
**sparse, higher-variance tuned math** (fewer hits, juicier rare wins). Registering it turns the
selector into a real **three-option** switch and further exercises SPEC-047/048/049/050 (reels +
paytable + theme + audio all change together, and the choice persists across reload).

Per DEC-015 and DEC-017, a new machine is a **data file + a DEC**, never engine logic. Desert keeps the
**8-symbol vocabulary** (same `SYMBOLS`, same `symbolDisplay` emoji) — it is distinguished by **theme
tokens + audio + tuned math**, exactly like Arctic. Its math was **measured against the real simulator
before pinning** (the SPEC-046/051 discipline), so the sanity test is transcription of measured numbers.

## Goal

Add Desert — a `Machine` data file (`src/machines/desert.ts`) with a warm sand/amber theme, warm/dry
audio, and its own sparse tuned math (weights → `buildStrip`; paytable; measured avg RTP ~90%, in the
~87–94% band; hit ~28%) — register it in the registry, emit **DEC-018**, and add a parity/metrics-sanity
test. No engine logic changes (Arctic already exposed `buildStrip` + `REEL_COUNT` on the public engine
interface; Desert reuses them).

## Inputs

- **Files to read:**
  - `src/machines/arctic.ts` — the first themed machine; Desert mirrors its exact shape (math + theme + audio).
  - `src/machines/wildAndWhimsical.ts` — the default machine's presentation shape.
  - `src/machines/types.ts` — `Machine`, `MachinePresentation`, `ThemeTokens`, `MachineAudio`.
  - `src/machines/registry.ts` — `MACHINES` (register Desert here).
  - `src/engine/index.ts` — the public engine surface (already re-exports `buildStrip`, `REEL_COUNT` since SPEC-051).
  - `src/machines/arctic.test.ts` — the test template to mirror (registration / vocabulary / RTP-band / strip / distinct / contrast).
  - `decisions/DEC-017-arctic-machine.md`, `decisions/_template.md` — DEC format + the machine precedent.
- **Related code paths:** `src/machines/`, `src/engine/`, `decisions/`.

## Outputs

- **Files created:**
  - `src/machines/desert.ts` — `DESERT: Machine` (math + presentation: symbolDisplay + theme + audio).
  - `src/machines/desert.test.ts` — parity/metrics-sanity test.
  - `decisions/DEC-018-desert-machine.md` — the Desert decision.
- **Files modified:**
  - `src/machines/registry.ts` — register `DESERT` in `MACHINES` (after Arctic; W&W stays first/default).
- **New exports:** `DESERT` (desert.ts).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `DESERT` is a valid `Machine`: `id: 'desert'`, `name: 'Desert'`, a `math` slice (tuned weights →
      `buildStrip` strip, paytable, reusing `SYMBOLS`/`SYMBOL_TIER`/`PAYLINES`/bet levels), and a
      `presentation` with `symbolDisplay: SYMBOL_DISPLAY` (same 8 symbols), a non-empty `theme`, and an
      `audio` slice distinct from the default.
- [ ] Registered: `getMachine('desert') === DESERT`; `listMachines()` includes it (length ≥ 3);
      `getActiveMachine()` still defaults to Wild & Whimsical (empty storage).
- [ ] **Measured math in band:** `simulateMachine(DESERT.math, { spins: 20000, seed: 1 })` reports
      `rtp` in `[0.85, 1.02]` (measured 0.9556), `hitFrequency` in `[0.24, 0.32]` (measured 0.2797),
      and the jackpot rule is `WOLF × 5` (reachable — measured ~1/21.7k).
- [ ] **Strip integrity:** `DESERT.math.strips[0]` has length 42 (= weight sum), no linear adjacent
      duplicates, and per-symbol counts equal `DESERT.math.reelWeights`.
- [ ] **Distinct from W&W AND Arctic:** `DESERT.math.paytable` ≠ each of theirs; `DESERT.math.reelWeights`
      ≠ each of theirs; `DESERT.presentation.theme` is non-empty (W&W's is `{}`);
      `DESERT.presentation.audio.music.chord` ≠ the default chord and ≠ Arctic's chord.
- [ ] **Accessible theme:** the `--color-text`-on-`--color-bg` contrast ratio ≥ 4.5:1 (WCAG AA);
      measured 15.76:1.
- [ ] `DEC-018` exists (valid front-matter, `just validate` passes) and records Desert's theme/audio/math.
- [ ] No engine LOGIC change; `git diff main..HEAD -- src/engine/` is EMPTY (Desert touches only
      `src/machines/`, `decisions/`). DEC-001 intact.
- [ ] `just typecheck && just lint && just test && just build && just validate && just cost-audit`
      all pass; `just simulate desert --spins 50000` runs and reports Desert's metrics.

## Failing Tests

Written now, BEFORE build. All in **`src/machines/desert.test.ts`** (plain `.ts`, no JSX — mirrors
`arctic.test.ts`).

- `"Desert is registered and resolvable, default unchanged"` — `getMachine('desert')` toBe `DESERT`;
  `listMachines()` toContain `DESERT` and length ≥ 3; `getActiveMachine()` toBe `WILD_AND_WHIMSICAL`
  (empty localStorage).
- `"Desert keeps the 8-symbol vocabulary"` — `DESERT.math.symbols` toEqual `SYMBOLS`;
  `DESERT.presentation.symbolDisplay` toBe `SYMBOL_DISPLAY`.
- `"Desert's math measures in the generous RTP band"` — `const m = simulateMachine(DESERT.math,
  { spins: 20000, seed: 1 })`; `expect(m.rtp).toBeGreaterThanOrEqual(0.85)`;
  `expect(m.rtp).toBeLessThanOrEqual(1.02)`; `expect(m.hitFrequency).toBeGreaterThanOrEqual(0.24)`;
  `expect(m.hitFrequency).toBeLessThanOrEqual(0.32)`; `expect(DESERT.math.jackpot).toEqual({ symbol:
  'WOLF', count: 5 })`.
- `"Desert's strip is count-exact with no adjacent duplicates"` — `const s = DESERT.math.strips[0]`;
  `expect(s.length).toBe(42)`; assert no `i` with `s[i] === s[i+1]`; tally `s` and assert it toEqual
  `DESERT.math.reelWeights`; assert `DESERT.math.strips.every((r) => r === s)`.
- `"Desert is distinct from Wild & Whimsical and Arctic"` — `expect(DESERT.math.paytable).not.toEqual(
  WILD_AND_WHIMSICAL.math.paytable)` and `.not.toEqual(ARCTIC.math.paytable)`;
  `expect(DESERT.math.reelWeights).not.toEqual(WILD_AND_WHIMSICAL.math.reelWeights)` and
  `.not.toEqual(ARCTIC.math.reelWeights)`; `expect(DESERT.presentation.theme).not.toEqual({})`;
  `expect(DESERT.presentation.audio.music.chord).not.toEqual(
  WILD_AND_WHIMSICAL.presentation.audio.music.chord)` and `.not.toEqual(ARCTIC.presentation.audio.music.chord)`.
- `"Desert's theme is accessible (text on bg ≥ AA)"` — compute the WCAG contrast ratio between
  `DESERT.presentation.theme['--color-text']` and `['--color-bg']` with the same inline helper as
  `arctic.test.ts` (sRGB → relative luminance → ratio); `expect(ratio).toBeGreaterThanOrEqual(4.5)`.

## Implementation Context

### Decisions that apply

- `DEC-001` (engine-no-dom) — Desert is data; theme/audio are presentation. Zero engine change (the
  `buildStrip`/`REEL_COUNT` re-exports already landed in SPEC-051).
- `DEC-013` (audio-engine graph) — Desert supplies per-machine audio *params* (SPEC-048's `MachineAudio`);
  the graph is unchanged.
- `DEC-015` (config-driven machine model) — a new machine is a data file + a DEC. Desert is the third.
- `DEC-017` (Arctic) — the first themed machine; Desert follows its exact structure.
- `DEC-018` (this spec's DEC) — records Desert's theme/audio/math + the measured RTP.

### Constraints that apply

- `engine-no-dom` — Desert touches no engine logic; `git diff main..HEAD -- src/engine/` must be EMPTY.

### Prior related work

- `SPEC-045` (buildStrip), `SPEC-046` (measure-then-pin), `SPEC-048` (theme/audio slice),
  `SPEC-049`/`SPEC-050` (context + selector), `SPEC-051` (Arctic — the mold this reuses verbatim).

### Out of scope (for this spec specifically)

- **Ocean** — SPEC-053 (same pattern; the last machine).
- **Per-reel asymmetric strips** — Desert reuses one strip across all 5 reels (like W&W / Arctic).
- **New audio nodes** — DEC-013 graph unchanged; Desert only varies params.
- **A themed selector option style** — the native `<select>` shows "Desert" as text; no per-option styling.

## Notes for the Implementer

**Toolchain brief:** ESLint restricts only `src/engine/**` (no React/DOM); `src/machines/**` may import
the public `src/engine/index.ts`. `tsconfig` include is `["src"]`. No new dependency. The DEC is
REQUIRED (DEC-018). `just simulate desert` works once Desert is registered. Measure-then-pin: the
numbers below are measured — do NOT re-tune; if a test's RTP assertion fails, the data was transcribed
wrong, not the pin. This is a pure transcription build (mirror `arctic.ts` / `arctic.test.ts`).

**`src/machines/desert.ts`** — the data file (drop-in; weights/paytable/theme/audio are MEASURED):

```ts
// Desert — the second themed machine (SPEC-052, DEC-018). Pure data (DEC-015):
// same 8-symbol vocabulary as Wild & Whimsical, distinguished by a warm sand/amber
// desert theme (runtime CSS-var overrides), warm dry audio (per-machine params — DEC-013),
// and its own sparse, higher-variance tuned math (weights → buildStrip; measured avg RTP
// ~90%, hit ~28%, jackpot ~1/21.7k — SPEC-046/051 measure-then-pin discipline). The engine
// never sees theme/audio (DEC-001).
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

/** Desert's tuned reel weights (sum 42) — flatter/sparser than W&W and Arctic (fewer hits). */
const DESERT_WEIGHTS: Record<SymbolId, number> = {
  DEER: 8,
  FOX: 7,
  SQUIRREL: 6,
  BEAR: 5,
  EAGLE: 5,
  OWL: 4,
  BISON: 4,
  WOLF: 3,
};

/** Desert's paytable — stingy small wins, juicy high/jackpot (warm, high-variance feel). */
const DESERT_PAYTABLE: Record<Tier, readonly [number, number, number]> = {
  low: [1, 2, 8],
  mid: [2, 8, 21],
  high: [7, 18, 60],
  jackpot: [12, 58, 280],
};

/** One strip, generated from the tuned weights (0 linear adjacent dups; length 42). */
const DESERT_STRIP = buildStrip(SYMBOLS, DESERT_WEIGHTS);

const DESERT_MATH: MachineMath = {
  symbols: SYMBOLS,
  symbolTier: SYMBOL_TIER,
  reelWeights: DESERT_WEIGHTS,
  reelCount: REEL_COUNT,
  rows: 3,
  strips: Array.from({ length: REEL_COUNT }, () => DESERT_STRIP),
  paylines: PAYLINES,
  paytable: DESERT_PAYTABLE,
  jackpot: { symbol: 'WOLF', count: 5 },
  tiers: { bigMultiple: 5 },
  betLevels: BET_LEVELS,
  defaultBet: DEFAULT_BET,
  startingBalance: STARTING_BALANCE,
};

export const DESERT: Machine = {
  id: 'desert',
  name: 'Desert',
  math: DESERT_MATH,
  presentation: {
    symbolDisplay: SYMBOL_DISPLAY, // same 8-animal vocabulary; theme conveys "Desert", not new symbols
    // Warm sand/amber palette (runtime overrides of tokens.css). All pairs pass WCAG AA
    // (text-on-bg 15.76:1). Applied on the .device-stage root by useMachineTheme (SPEC-048).
    theme: {
      '--color-bg': '#1c1206',
      '--color-surface': '#33240f',
      '--color-frame': '#7a5a2e',
      '--color-text': '#f7ecd8',
      '--color-text-muted': '#cbb391',
      '--color-accent': '#e0a53a',
      '--color-coin': '#f2d489',
      '--color-win-small': '#d9a441',
      '--color-win-big': '#f0b429',
      '--color-jackpot': '#ffe6a0',
      '--color-jackpot-sky': '#2b1a08',
    },
    // Warm, dry audio: fuller warm bed, a bright open major chord on dry half notes.
    audio: {
      channelGains: { bed: 0.3, sfx: 0.66, jingle: 0.8 },
      mix: { duckLevel: 0.06, swellLevel: 0.5, rampS: 0.2, restoreS: 0.6, holdMs: 2500 },
      music: { chord: ['G3', 'B3', 'D4', 'A4'], noteDuration: '2n', loopInterval: '2m' },
    },
  },
};
```

**`src/machines/registry.ts`** — register Desert (import + add to the map after Arctic; keep the rest):

```ts
import { DESERT } from './desert';
// ...
export const MACHINES: Record<string, Machine> = {
  [WILD_AND_WHIMSICAL.id]: WILD_AND_WHIMSICAL,
  [ARCTIC.id]: ARCTIC,
  [DESERT.id]: DESERT,
};
```

(Wild & Whimsical stays first — default + first in the selector; Desert lists third, after Arctic.)

**`src/machines/desert.test.ts`** — mirror `arctic.test.ts` exactly, adding `ARCTIC` to the imports and
the extra "distinct from Arctic" assertions. The inline WCAG contrast helper is copied verbatim from
`arctic.test.ts` (no dependency).

**`decisions/DEC-018-desert-machine.md`** — create from `decisions/_template.md`. Key fields: `id:
DEC-018`, `type: decision`, `confidence: 0.8`, `project.id: PROJ-002`, `created_at: 2026-07-07`,
`tags: [machine, theme, audio, tuning]`, `affected_scope: ["src/machines/desert.ts"]`. Body:

- **Decision:** "Desert is the second themed machine — the shared 8-symbol vocabulary with a warm
  sand/amber theme, warm dry audio, and its own sparse, higher-variance tuned math (avg RTP ~90%, hit
  ~28%), added as pure data + this DEC (a sibling of DEC-017 Arctic)."
- **Context:** SPEC-051 (Arctic) proved the data-only machine path; Desert reuses it to add variety and
  make the selector a three-option switch. Desert's identity is *sparseness* — fewer hits than Arctic /
  W&W, but juicier high/jackpot payouts (higher variance).
- **Alternatives:** (A) new symbol set per machine — rejected (breaks the 8-symbol vocabulary; per
  DEC-017). (B) reuse Arctic's or W&W's math, theme/audio-only — rejected (the stage calls for *tuned
  math* per machine; identical math makes machines feel same-y). (C, chosen) shared vocabulary +
  per-machine warm theme + warm audio + sparse tuned math — matches DEC-015 + DEC-017.
- **Consequences:** +second machine deepens the config-driven proof; +Ocean (SPEC-053) is now the only
  one left. −each machine's math needs measuring (mitigated by the simulator). Neutral: strips reused
  across reels (per-reel asymmetry is a future spec).
- **Validation:** the metrics-sanity test pins Desert's RTP band; `just simulate desert` re-measures on
  demand; revisit if the RTP drifts out of ~87–94% or the theme fails contrast.
- **References:** SPEC-052; DEC-017, DEC-015, DEC-016, DEC-013, DEC-001.

**Measured pins (do not re-tune):** weights sum 42; `buildStrip(SYMBOLS, DESERT_WEIGHTS)` → length 42,
0 adjacent dups, tally `{DEER:8,FOX:7,SQUIRREL:6,BEAR:5,EAGLE:5,OWL:4,BISON:4,WOLF:3}`;
`simulateMachine(DESERT.math, {spins:20000, seed:1})` → rtp 0.9556, hitFreq 0.2797, big-tier 0.0442,
3 jackpots; over 10 seeds × 50k, avg RTP 89.98% (range 87.38–93.97%), hit 27.65%, jackpot ~1/21.7k.
Theme contrast: text-on-bg 15.76:1, all 7 checked pairs ≥ 8.2:1.

**Verify-cycle adversarial checks (teeth):** (a) revert one `DESERT_WEIGHTS` entry to a W&W/Arctic value
→ the strip count-exactness test (counts == weights) and/or the RTP-band test shifts — confirm a test
FAILS; revert. (b) set `theme: {}` → the "distinct" + theme-contrast tests FAIL; revert. (c) change
`music.chord` to the W&W chord `['C3','G3','C4','E4']` or Arctic's `['D3','A3','E4','B4']` → the
"distinct" test FAILS; revert. (d) drop `DESERT` from `MACHINES` → the registration test FAILS; revert.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?** yes/no
- **New decisions emitted:**
  - `DEC-018` — Desert machine (if built as designed)
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
