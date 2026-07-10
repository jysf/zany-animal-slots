---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-058
  type: story                      # epic | story | task | bug | chore
  cycle: build  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-012
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # build/verify: single-agent interactive run (see cost notes)
  created_at: 2026-07-09

references:
  decisions:
    - DEC-021   # per-machine symbol identity — the decision this spec implements (supersedes DEC-017/018 symbol clause)
    - DEC-001   # engine-no-dom: symbolDisplay is presentation; the engine alphabet is untouched
    - DEC-006   # the glyph map (emoji + accessible label) is a UI concern
    - DEC-015   # machines are pure data
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-038  # MachinePresentation.symbolDisplay field
    - SPEC-041  # per-machine symbolDisplay threaded into ReelGrid + paytable (the reuse this rides)
    - SPEC-051  # Arctic (DEC-017) — symbol clause superseded here
    - SPEC-052  # Desert (DEC-018) — symbol clause superseded here
    - SPEC-053  # Ocean (DEC-019) — symbol clause superseded here

value_link: >-
  Gives each themed machine its own reel identity: Arctic's polar creatures, Desert's arid creatures,
  Ocean's marine creatures shown on the reels AND the paytable — instead of the same 8 forest animals
  under a different palette. Presentation-only (engine untouched); corrects the autonomous
  shared-vocabulary decision (DEC-017/018) that ran against the user's intent (DEC-021).

# Self-reported AI cost per cycle.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design authored on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-09
      note: >-
        Design authored on the main Opus loop (un-metered). No engine/simulation to pin — this is a
        pure presentation data change verified against the existing threading: confirmed ReelGrid
        (SPEC-041) and paytableRows/PaytableSheet already read machine.presentation.symbolDisplay from
        the ACTIVE machine, so per-machine maps propagate to reels + paytable with zero plumbing. The
        only guards are the three machines' "keeps the 8-symbol vocabulary" tests (currently assert
        symbolDisplay === SYMBOL_DISPLAY) — flipped to assert per-machine identity. Emits DEC-021
        (already authored), which supersedes the shared-vocabulary clause of DEC-017/018 (and DEC-019).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 90000    # NOMINAL — autonomous single-agent run, not separately metered (run cost convention)
      estimated_usd: 0.59    # nominal: 90000 tok × the run's $6.6/M reference rate
      recorded_at: 2026-07-09
      note: >-
        Autonomous single-agent run — nominal estimate, not separately metered. Added ARCTIC_SYMBOLS /
        DESERT_SYMBOLS / OCEAN_SYMBOLS themed maps to the three machine files, pointed each
        presentation.symbolDisplay at its own (swapped the SYMBOL_DISPLAY import for the SymbolDisplay
        type), and flipped the three vocabulary guard-tests. Full gate green: typecheck, lint, test
        (69 files / 408 tests), build, validate, cost-audit. Boundary diffs vs main EMPTY: src/engine/
        (DEC-001) and src/machines/wildAndWhimsical.ts + its parity test (W&W keeps SYMBOL_DISPLAY); no
        math line changed in any themed machine. NOTE: an initial guard-mutation pass reverted the
        uncommitted machine files via `git checkout` (discarding build work); recovered by re-applying,
        then committed the build BEFORE re-running mutations so reverts target the committed build.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 90000    # NOMINAL — autonomous single-agent run, not separately metered (run cost convention)
      estimated_usd: 0.59    # nominal: 90000 tok × the run's $6.6/M reference rate
      recorded_at: 2026-07-09
      note: >-
        Autonomous single-agent run — nominal estimate, not separately metered. Cold review: full gate
        re-run green (typecheck, lint, test 69 files / 408 tests, build, validate, cost-audit). Three
        adversarial guard-mutations (revert each machine's presentation to SYMBOL_DISPLAY — import +
        pointer) each failed EXACTLY that machine's "keeps the 8 engine symbols but themes their display"
        test (arctic/desert/ocean: 1 failed | 5 passed), then reverted clean to the committed build.
        Boundary diffs vs main EMPTY: src/engine/ (DEC-001) and W&W (wildAndWhimsical.ts + parity test);
        no math line changed in any themed machine. Preview check (dev server via .claude/launch.json):
        switched the machine selector across all four — Arctic reels read Caribou/Arctic Fox/Penguin/
        Seal/Eagle/Snowy Owl/Mammoth/Polar Bear; Desert Camel…Sidewinder; Ocean Dolphin…Shark with the
        paytable showing marine creatures; Wild & Whimsical still the forest animals (Deer…Wolf, parity
        intact). Server stopped. Zero defects.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-09
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Recorded nominal build/verify cost
        (single-agent run), opened the PR, CI-polled to CLEAN + all checks SUCCESS, squash-merged,
        post-merge rollup (cycle → ship, STAGE-012 backlog SPEC-058 [x], archive, stage-ship STAGE-012).
  totals:
    tokens_total: 180000   # nominal build 90000 + verify 90000
    estimated_usd: 1.18    # nominal build 0.59 + verify 0.59
    session_count: 4       # design, build, verify, ship
---

# SPEC-058: Per-machine reel symbol identity

## Context

The four machines (Wild & Whimsical + the three themed: Arctic, Desert, Ocean) already differ by theme,
audio, and tuned math, but every one renders the **same** 8 forest-animal reel faces (`SYMBOL_DISPLAY`).
The user's intent was for the themed machines to show their own creatures; the shared vocabulary was an
autonomous decision (DEC-017/018, 2026-07-07) that a later autonomous run (SPEC-053) enforced against a
per-machine-symbols prototype. **DEC-021** records the user's intent and supersedes that clause.

This spec implements it: give Arctic, Desert, and Ocean each their own `presentation.symbolDisplay` map.
It is **presentation-only** — the engine keeps its fixed 8-`SymbolId` alphabet and every machine's math
(weights, strips, paytable, jackpot on `WOLF`) is byte-identical, so a `WOLF` is still a `WOLF` to the
engine; only its rendered face differs (🐻‍❄️ Arctic / 🐍 Desert / 🦈 Ocean). Both surfaces that show
symbols — `ReelGrid` and the paytable — already read the active machine's `symbolDisplay` (SPEC-041), so
there is **no plumbing change**. Wild & Whimsical is the parity machine and keeps `SYMBOL_DISPLAY`.

## Goal

Point each themed machine's `presentation.symbolDisplay` at its own themed emoji/label map (all 8
`SymbolId`s), leaving Wild & Whimsical, the engine, and all machine math unchanged.

## Inputs

- **Files to read:** `src/machines/{arctic,desert,ocean}.ts` (presentation slices), `src/machines/types.ts`
  (`SymbolDisplay` type), `src/ui/reels/symbols.ts` (`SYMBOL_DISPLAY`, the default), `decisions/DEC-021`.
- **Related code paths:** `src/ui/reels/ReelGrid.tsx`, `src/ui/paytable.ts` (already read per-machine
  `symbolDisplay` — read only, no change).

## Outputs

- **Files modified:**
  - `src/machines/arctic.ts` — add `ARCTIC_SYMBOLS`, point `symbolDisplay` at it; drop the now-unused
    `SYMBOL_DISPLAY` import; import `SymbolDisplay` type.
  - `src/machines/desert.ts` — same with `DESERT_SYMBOLS`.
  - `src/machines/ocean.ts` — same with `OCEAN_SYMBOLS`.
  - `src/machines/arctic.test.ts`, `desert.test.ts`, `ocean.test.ts` — flip the vocabulary guard-test.
- **No files created** (DEC-021 already authored). **No engine, math, or W&W change.**

## Acceptance Criteria

- [ ] `ARCTIC/DESERT/OCEAN.presentation.symbolDisplay` is each machine's OWN map (`!== SYMBOL_DISPLAY`),
      with all 8 `SymbolId` keys and accessible labels.
- [ ] `WILD_AND_WHIMSICAL.presentation.symbolDisplay === SYMBOL_DISPLAY` (parity contract unchanged).
- [ ] Every machine's `math` is unchanged — metrics-sanity, strip, and parity tests pass untouched;
      `git diff main..HEAD -- src/engine/` EMPTY.
- [ ] Reels and paytable render the active machine's themed symbols (preview-verified per machine).
- [ ] No new dependency; `just typecheck && just lint && just test && just build && just validate && just cost-audit` pass.

## Failing Tests

Written during **design**, BEFORE build. The three per-machine vocabulary guards flip from
"shared === SYMBOL_DISPLAY" to "own themed map".

- **`src/machines/arctic.test.ts`** — replace the `"Arctic keeps the 8-symbol vocabulary"` test with
  `"Arctic keeps the 8 engine symbols but themes their display"`: asserts `ARCTIC.math.symbols` toEqual
  `SYMBOLS`; `ARCTIC.presentation.symbolDisplay` **not** toBe `SYMBOL_DISPLAY`; its keys sorted toEqual
  `[...SYMBOLS].sort()`; and `…symbolDisplay.WOLF.label` toBe `'Polar Bear'`.
- **`src/machines/desert.test.ts`** — same shape; `…WOLF.label` toBe `'Sidewinder'`.
- **`src/machines/ocean.test.ts`** — same shape; `…WOLF.label` toBe `'Shark'`.

(W&W's `wildAndWhimsical.parity.test.ts` — which asserts `symbolDisplay === SYMBOL_DISPLAY` — is left
UNCHANGED and must still pass: W&W is the parity machine.)

## Implementation Context

### Decisions that apply
- `DEC-021` — the decision being implemented: per-machine presentation symbol maps; presentation-only.
- `DEC-001` — engine untouched; `symbolDisplay` is a UI concern the engine never sees.
- `DEC-006` — glyph map = emoji + **accessible label**; every entry keeps a human label.
- `DEC-015` — machines are pure data; the maps are plain literals in the machine files.

### Constraints that apply
- `engine-no-dom` — the engine stays glyph-free; `symbolDisplay` is a UI-layer map (presentation-only).
  (Accessible labels per symbol are required by DEC-006 — every themed entry keeps a human label.)

### Prior related work
- `SPEC-041` (shipped) — `ReelGrid` + `paytableRows` already read `machine.presentation.symbolDisplay`;
  this spec only changes the data they read. `SPEC-038` (shipped) — the `symbolDisplay` field itself.

### Out of scope (for this spec specifically)
- Any engine/math/frozen-seed change; re-theming Wild & Whimsical; new symbol art or dependency;
  per-machine engine differences.

## Notes for the Implementer

Drop-in code follows. Each machine: (1) swap the import, (2) add the themed map, (3) point
`symbolDisplay` at it, (4) flip the test. Write object literals in prettier-canonical form (one entry
per line, single space after colon) — do NOT column-align. The `🐻‍❄️` polar-bear emoji is a ZWJ
sequence; the tests assert `.label` strings (not the emoji), so it never bites the assertions.

### `src/machines/arctic.ts`

Replace `import { SYMBOL_DISPLAY } from '../ui/reels/symbols';` + `import type { Machine } from './types';`
with:
```tsx
import type { Machine, SymbolDisplay } from './types';
```
Add near the other consts (e.g. after `ARCTIC_STRIP`):
```tsx
/** Arctic's own reel creatures — polar identity over the shared 8 engine symbols (DEC-021). */
const ARCTIC_SYMBOLS: SymbolDisplay = {
  DEER: { emoji: '🦌', label: 'Caribou' },
  FOX: { emoji: '🦊', label: 'Arctic Fox' },
  SQUIRREL: { emoji: '🐧', label: 'Penguin' },
  BEAR: { emoji: '🦭', label: 'Seal' },
  EAGLE: { emoji: '🦅', label: 'Eagle' },
  OWL: { emoji: '🦉', label: 'Snowy Owl' },
  BISON: { emoji: '🦣', label: 'Mammoth' },
  WOLF: { emoji: '🐻‍❄️', label: 'Polar Bear' },
};
```
Change the presentation line:
```tsx
    symbolDisplay: ARCTIC_SYMBOLS, // per-machine polar identity (DEC-021; supersedes DEC-017 symbol clause)
```

### `src/machines/desert.ts`
```tsx
import type { Machine, SymbolDisplay } from './types';
```
```tsx
/** Desert's own reel creatures — arid identity over the shared 8 engine symbols (DEC-021). */
const DESERT_SYMBOLS: SymbolDisplay = {
  DEER: { emoji: '🐪', label: 'Camel' },
  FOX: { emoji: '🦊', label: 'Fennec Fox' },
  SQUIRREL: { emoji: '🦎', label: 'Gecko' },
  BEAR: { emoji: '🐢', label: 'Tortoise' },
  EAGLE: { emoji: '🦅', label: 'Vulture' },
  OWL: { emoji: '🦉', label: 'Elf Owl' },
  BISON: { emoji: '🐏', label: 'Bighorn Ram' },
  WOLF: { emoji: '🐍', label: 'Sidewinder' },
};
```
```tsx
    symbolDisplay: DESERT_SYMBOLS, // per-machine arid identity (DEC-021; supersedes DEC-018 symbol clause)
```

### `src/machines/ocean.ts`
```tsx
import type { Machine, SymbolDisplay } from './types';
```
```tsx
/** Ocean's own reel creatures — marine identity over the shared 8 engine symbols (DEC-021). */
const OCEAN_SYMBOLS: SymbolDisplay = {
  DEER: { emoji: '🐬', label: 'Dolphin' },
  FOX: { emoji: '🐠', label: 'Tropical Fish' },
  SQUIRREL: { emoji: '🦐', label: 'Shrimp' },
  BEAR: { emoji: '🦀', label: 'Crab' },
  EAGLE: { emoji: '🐡', label: 'Pufferfish' },
  OWL: { emoji: '🐙', label: 'Octopus' },
  BISON: { emoji: '🐳', label: 'Whale' },
  WOLF: { emoji: '🦈', label: 'Shark' },
};
```
```tsx
    symbolDisplay: OCEAN_SYMBOLS, // per-machine marine identity (DEC-021; supersedes DEC-019 symbol clause)
```

### Test flip (each of the three) — Arctic shown; Desert/Ocean identical but `'Sidewinder'` / `'Shark'`
```tsx
  it('Arctic keeps the 8 engine symbols but themes their display', () => {
    expect(ARCTIC.math.symbols).toEqual(SYMBOLS);
    // Per-machine identity (DEC-021, supersedes DEC-017's shared-vocabulary clause): Arctic renders
    // its own polar creatures, NOT the shared SYMBOL_DISPLAY.
    expect(ARCTIC.presentation.symbolDisplay).not.toBe(SYMBOL_DISPLAY);
    expect(Object.keys(ARCTIC.presentation.symbolDisplay).sort()).toEqual([...SYMBOLS].sort());
    expect(ARCTIC.presentation.symbolDisplay.WOLF.label).toBe('Polar Bear');
  });
```
Keep each test file's existing `SYMBOL_DISPLAY` and `SYMBOLS` imports (still referenced).

Adversarial guard-mutations for verify (each must fail its target, then revert):
1. Revert `arctic.ts` `symbolDisplay` back to `SYMBOL_DISPLAY` ⇒ Arctic's vocabulary test fails (both
   the `not.toBe` and the `WOLF.label` assertions).
2. Same for `desert.ts` / `ocean.ts` ⇒ their tests fail.
3. Drop one key from a themed map (won't typecheck — `Record<SymbolId>` is exhaustive) — demonstrates
   the 8-key guarantee is enforced at the type level.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-058-per-machine-symbols`
- **All acceptance criteria met?** Yes — Arctic/Desert/Ocean each render their own themed symbols on the
  reels AND paytable (preview-verified per machine); W&W unchanged (forest animals, parity holds); engine
  + W&W diffs EMPTY; no math changed; full gate green (69 files / 408 tests).
- **New decisions emitted:** DEC-021 (authored at design; supersedes the symbol clause of DEC-017/018/019).
- **Deviations from spec:** none in the shipped result. Process note: an initial mutation pass used
  `git checkout` to revert uncommitted build files and lost the machine-file edits; re-applied and
  committed the build before re-running mutations.
- **Follow-up work identified:** none. (Optional future: point markers / per-machine sparkline, or a
  per-machine *engine* difference — a separate, weightier decision.)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing; the drop-in maps + flipped tests
   were unambiguous and the change matched on first gate run.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No. DEC-021 +
   DEC-001 + DEC-006 covered it; confirming the SPEC-041 threading up front meant zero plumbing.
3. **If you did this task again, what would you do differently?** — **Commit the build BEFORE running
   adversarial guard-mutations.** Reverting mutations with `git checkout` on an uncommitted tree
   discards the real build work; committing first makes revert target the build, not the base branch.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?** — Commit the build before adversarial guard-mutations (a
   `git checkout` revert on an uncommitted tree discards the build). And, more broadly: treat a
   "constraint" cited from an autonomously-authored DEC as *provisional* — this whole spec exists because
   an overnight run's shared-vocabulary decision was enforced against the user's intent; the fix was to
   record the intent (DEC-021) and supersede, not to defend the machine's prior call.
2. **Does any template, constraint, or decision need updating?** — Two signals logged: (a) an autonomous
   run must never override apparent USER intent to enforce a prior autonomous DEC — surface the conflict
   instead (also now encoded in the STAGE-010 overnight task's safety rails); (b) the verify recipe
   should say "commit the build before mutation-testing."
3. **Is there a follow-up spec I should write now before I forget?** — No. STAGE-012 closes with this
   spec. Optional future waves: per-machine sparkline point markers, or per-machine *engine* differences
   (a separate, weightier decision).
