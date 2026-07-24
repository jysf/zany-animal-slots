---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-075
  type: story                      # epic | story | task | bug | chore
  cycle: design                    # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-003
  stage: STAGE-015
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-23

references:
  decisions:
    - DEC-001   # engine-no-dom: presentation reads engine data; engine untouched
    - DEC-010   # design tokens, no raw hex, prefixed BEM-ish classes
    - DEC-021   # per-machine symbol identity — a trophy renders its ORIGINATING machine's creatures
    - DEC-024   # the TopWin record being rendered
  constraints:
    - engine-no-dom
    - portrait-first
    - respect-reduced-motion
  related_specs:
    - SPEC-074  # shipped the trophies this renders
    - SPEC-012  # the ReelGrid component being reused
    - SPEC-018  # winningCellKeys — whose module-level PAYLINES coupling this fixes
    - SPEC-058  # per-machine symbolDisplay (DEC-021)

value_link: >-
  The rendering primitive the whole trophy case is built from: a saved 5×3 grid, re-rendered
  in its originating machine's creatures with the winning cells lit — correct by construction
  even if a future machine ships its own paylines.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-23
      note: >-
        Design authored on the main Opus loop (un-metered). Reuse-first: ReelGrid already takes
        grid + lineWins + symbolDisplay and lights winning cells, so this spec adds a size variant
        and a thin TrophyGrid wrapper rather than a parallel component. Also fixes the SPEC-018
        module-level PAYLINES coupling, which is latent-but-real once grids are STORED.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null
      recorded_at: 2026-07-23
      note: >-
        Fixed winningCellKeys' payline coupling, added ReelGrid's paylines/size props (size='full'
        confirmed byte-identical to prior markup), and built TrophyGrid + trophies.css per the
        spec's Notes. Full gate green: typecheck, test (962 passed), build, validate, cost-audit,
        eslint on src/**. engine/audio diffs empty.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-5
      tokens_total: null
      recorded_at: 2026-07-23
      note: >-
        Cold review + all 4 guard-mutations run and reverted clean: (1) PAYLINES-import bypass
        breaks "uses the supplied paylines" - confirmed; (2) active-machine substitution breaks
        "renders the originating machine's symbols" (DEC-021 guard) - confirmed; (3) dropping
        isKnown breaks "marks an unknown machineId" - confirmed; (4) always-append size class
        breaks the size='full' no-regression test - confirmed. Full gate green (typecheck, test
        962/962, build, validate, cost-audit, eslint src/** clean). engine/audio diffs empty; no
        case/card/row/empty-state/animation leakage; no raw hex in trophies.css; a11y summary
        reachable via role=img + aria-label. 0 defects.
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-075: Trophy grid rendering

## Context

STAGE-014 shipped trophies: each `TopWin` carries the 5×3 `grid` and the `lineWins` of a
saved win. STAGE-015 renders them. This spec builds the **rendering primitive** the rest of
the stage composes — a saved win drawn as a real reel grid, in the machine it was won on,
with the winning cells lit.

The deliberate design choice is **reuse**: `src/ui/reels/ReelGrid.tsx` already accepts
`grid`, `lineWins`, and `symbolDisplay`, and already applies `.reel__cell--win` to winning
cells. It needs a size variant and a `paylines` source, not a rewrite.

It also fixes a latent correctness bug. `winningCellKeys` (SPEC-018) derives winning cells
from the **module-level** `PAYLINES` constant rather than the machine's `math.paylines`.
That is harmless today — all four machines share the same 20 lines — but a trophy is
**stored** and outlives the line set that produced it. A future machine with its own
paylines would silently light the wrong cells on old trophies. Cheap to fix now, invisible
and confusing later.

## Goal

Render a saved `TopWin` as a 5×3 emoji grid at two sizes (card + thumbnail), using the
**originating** machine's `symbolDisplay` and `paylines`, with winning cells visually
distinguished and an accessible text alternative — without regressing the live reels.

## Inputs

- **Files to read:**
  - `src/ui/reels/ReelGrid.tsx`, `src/ui/reels/winningCells.ts`, `src/ui/reels/reels.css`
  - `src/ui/regions/Game.tsx` — the live `ReelGrid` call site
  - `src/machines/registry.ts`, `src/machines/types.ts` — `getMachine`, `MACHINES`
  - `src/stats/sessionStats.ts` — the `TopWin` shape
  - `src/styles/tokens.css` — available tokens (no raw hex)

## Outputs

- **Files created:**
  - `src/ui/trophies/TrophyGrid.tsx` — the wrapper: `TopWin` → rendered grid.
  - `src/ui/trophies/TrophyGrid.test.tsx`
  - `src/ui/trophies/trophies.css` — trophy-grid size modifiers (tokens only).
- **Files modified:**
  - `src/ui/reels/winningCells.ts` — `winningCellKeys(lineWins, paylines)`.
  - `src/ui/reels/ReelGrid.tsx` — new `paylines` prop; new `size` prop.
  - `src/ui/regions/Game.tsx` — pass `machine.math.paylines`.
  - `src/ui/reels/winningCells.test.ts`, `src/ui/reels/ReelGrid.test.tsx` — updated.
- **New exports:** `TrophyGrid` (default), `TrophyGridProps`.

## Acceptance Criteria

- [x] `winningCellKeys(lineWins, paylines)` takes the payline set as a **required** second
      parameter; it no longer imports the module-level `PAYLINES`.
- [x] A `LineWin` referencing a line id absent from the supplied paylines is skipped (the
      existing tolerant behavior is preserved, not made to throw).
- [x] `ReelGrid` accepts `paylines` and threads it to `winningCellKeys`; `Game.tsx` supplies
      the **active** machine's `math.paylines`.
- [x] `ReelGrid` accepts an optional `size` (`'full' | 'card' | 'thumb'`, default `'full'`);
      `'full'` renders byte-identically to today (no live-reel regression).
- [x] `TrophyGrid` renders a `TopWin`'s grid using the **originating** machine's
      `symbolDisplay` — verified by a test that renders a trophy won on one machine while a
      *different* machine is active, and asserts the originating machine's emoji appear.
- [x] `TrophyGrid` derives winning cells from the **originating** machine's `math.paylines`.
- [x] Winning cells are distinguished by **more than color alone** (the existing
      `.reel__cell--win` ring/glow qualifies; the trophy sizes must preserve it visibly).
- [x] `TrophyGrid` exposes an accessible summary (e.g. an `aria-label` / visually-hidden
      text naming the amount, machine, and tier) so a screen reader gets the win rather than
      15 unlabelled emoji.
- [x] An unknown `machineId` does **not** silently render as Wild & Whimsical: `TrophyGrid`
      detects the miss and marks it (see Notes) rather than lying about provenance.
- [x] No animation is introduced by this spec; nothing new to gate behind
      `prefers-reduced-motion` (replay is SPEC-078).
- [x] Token colors only, no raw hex (DEC-010). `src/engine/**` and `src/ui/audio/**` diffs
      empty. No new dependency.

## Failing Tests

- **`src/ui/reels/winningCells.test.ts`** (update + add)
  - existing cases updated to pass `PAYLINES` explicitly as the 2nd arg (behavior unchanged).
  - `"uses the supplied paylines, not the module-level PAYLINES"` — call with a custom
    single-line payline set whose rows differ from `PAYLINES`'s same-id line, and assert the
    returned cells match the **custom** rows. *This is the test that proves the fix.*
  - `"skips a LineWin whose line id is absent from the supplied paylines"` — returns no cells
    for that win rather than throwing.
- **`src/ui/trophies/TrophyGrid.test.tsx`** (new)
  - `"renders the originating machine's symbols, not the active machine's"` — render a
    trophy with `machineId: 'arctic'` inside a provider whose active machine is `ocean`;
    assert an Arctic label/emoji is present and the corresponding Ocean one is not.
  - `"lights the winning cells from the trophy's lineWins"` — assert the number of
    `.reel__cell--win` cells equals the expected covered-cell count for the given lineWins.
  - `"exposes an accessible summary naming amount, machine, and tier"` — assert the
    accessible name/text contains the amount and the machine's display name.
  - `"renders at thumb size without changing the emitted grid"` — same trophy at
    `size="thumb"` still renders 15 cells and the same winning-cell count (size is
    presentational only).
  - `"marks an unknown machineId instead of silently showing the default machine"` — render
    a trophy with `machineId: 'no-such-machine'`; assert the unknown marker (per Notes) is
    present.
- **`src/ui/reels/ReelGrid.test.tsx`** (update)
  - existing tests updated for the new required `paylines` prop; add
    `"size='full' is the default and adds no size modifier class"` to pin no live regression.

## Implementation Context

### Decisions that apply

- `DEC-021` — **per-machine symbol identity**. The trophy's `machineId` selects the symbol
  map. Rendering a saved Arctic win in Ocean's creatures would violate this decision, which
  is why it has a dedicated test.
- `DEC-024` — the `TopWin` shape being rendered.
- `DEC-010` — global CSS, design tokens, no raw hex, prefixed classes.
- `DEC-001` — presentation-only; the engine is read for *types* and the `Payline` data the
  machine config already holds. No engine change.

### Constraints that apply

- `engine-no-dom` — engine diff empty.
- `portrait-first` — the trophy sizes must work at 375px. **This is the stage's main risk**
  (see the stage file); the thumbnail may prove illegible on a real phone. Build to the spec;
  the real-device call happens at SPEC-076/ship, and the agreed fallback is that rows #4–#10
  show text only until expanded.
- `respect-reduced-motion` — nothing animated here, but do not introduce any.

### Out of scope (for this spec specifically)

- The trophy **case** — ranking, cards, rows, empty state, the sheet. That is SPEC-076.
- Replay animation — SPEC-078.
- Any change to the stats model, storage, or the record seam.
- Any change to live spin/celebration behavior. `size='full'` must be a no-op.

## Notes for the Implementer

### `winningCells.ts` — make paylines a parameter

```ts
import type { LineWin, Payline } from '../../engine/index';

export function winningCellKeys(
  lineWins: LineWin[],
  paylines: readonly Payline[],
): Set<string> {
  const set = new Set<string>();
  for (const w of lineWins) {
    const line = paylines.find((p) => p.id === w.line);
    if (!line) continue;                       // tolerant: unknown line id contributes nothing
    for (let reel = 0; reel < w.count; reel++) {
      set.add(`${reel}:${line.rows[reel]}`);
    }
  }
  return set;
}
```

Drop the `PAYLINES` import from this file. Update its two call sites.

### `ReelGrid.tsx` — add `paylines` + `size`

Add to `Props`: `paylines: readonly Payline[];` (required) and
`size?: 'full' | 'card' | 'thumb';` (default `'full'`). Thread paylines into
`winningCellKeys(lineWins, paylines)`. For size, append a modifier class **only when not
`'full'`**, so today's markup is unchanged for the live reels:

```tsx
const sizeClass = size === 'full' ? '' : ` reel-grid--${size}`;
// ...
<div className={`reel-grid${spinning ? ' reel-grid--spinning' : ''}${sizeClass}`}>
```

`Game.tsx` passes `paylines={machine.math.paylines}` next to the existing
`symbolDisplay={machine.presentation.symbolDisplay}`.

### `TrophyGrid.tsx` — the wrapper

```tsx
// Renders a saved TopWin as a reel grid in its ORIGINATING machine's identity (DEC-021).
// Presentation only: reads the trophy the stats layer already stored (DEC-001).
import { MACHINES, getMachine } from '../../machines/registry';
import type { TopWin } from '../../stats/sessionStats';
import ReelGrid from '../reels/ReelGrid';
import './trophies.css';

export interface TrophyGridProps {
  trophy: TopWin;
  size?: 'card' | 'thumb';
}

export default function TrophyGrid({ trophy, size = 'card' }: TrophyGridProps) {
  // getMachine() falls back to the default machine for an unknown id, which would
  // silently misattribute a saved win's creatures (DEC-021). Detect the miss and say so.
  const isKnown = Object.prototype.hasOwnProperty.call(MACHINES, trophy.machineId);
  const machine = getMachine(trophy.machineId);
  const name = isKnown ? machine.name : `Unknown machine (${trophy.machineId})`;
  const label = `${trophy.amount} coins on ${name}, ${trophy.tier} win`;

  return (
    <div
      className={`trophy-grid${isKnown ? '' : ' trophy-grid--unknown-machine'}`}
      role="img"
      aria-label={label}
    >
      <ReelGrid
        grid={trophy.grid}
        lineWins={trophy.lineWins}
        paylines={machine.math.paylines}
        symbolDisplay={machine.presentation.symbolDisplay}
        size={size}
      />
    </div>
  );
}
```

> a11y note: the wrapper is `role="img"` with a summary label so a screen reader reads the
> win, not 15 emoji. The inner cells keep their own labels for sighted/AT inspection; if the
> nested labels prove noisy in the RTL test, mark the inner grid `aria-hidden` and keep the
> summary — either is acceptable, but the summary must be reachable.

### `trophies.css` — size modifiers, tokens only

Scale down by overriding the two things that set reel size — the wrapper max-width and the
cell font-size. Keep `.reel__cell--win`'s ring intact (it must stay legible when small):

```css
/* Card size — the hero trophy on a full card. */
.trophy-grid .reel-grid--card { max-width: 260px; padding: var(--space-1); }
.trophy-grid .reel-grid--card .reel__cell { font-size: var(--font-size-lg); }

/* Thumb size — the compact row. */
.trophy-grid .reel-grid--thumb { max-width: 128px; padding: var(--space-1); gap: 2px; }
.trophy-grid .reel-grid--thumb .reel { gap: 2px; }
.trophy-grid .reel-grid--thumb .reel__cell { font-size: var(--font-size-xs); border-radius: 2px; }
```

Use tokens for color; the px values above are layout sizing (permitted — DEC-010 governs
*themed values*, and `reels.css` already uses `max-width: 400px` / `8px` the same way).
If a value has a token, prefer the token.

### Adversarial guard-mutations for verify

1. `winningCellKeys`: ignore the `paylines` param and use imported `PAYLINES` ⇒ breaks
   "uses the supplied paylines".
2. `TrophyGrid`: use the **active** machine instead of `getMachine(trophy.machineId)` ⇒
   breaks "renders the originating machine's symbols".
3. `TrophyGrid`: drop the `isKnown` check ⇒ breaks "marks an unknown machineId".
4. `ReelGrid`: always append the size class (even for `'full'`) ⇒ breaks the no-regression
   default-size test.

### Do NOT

- Do not touch `src/engine/**` or `src/ui/audio/**`.
- Do not change live spin/celebration behavior — `size='full'` is a strict no-op.
- Do not build the case, cards, rows, or empty state (SPEC-076).
- Do not `git add -A` or `git stash -u`.

---

## Build Completion

- **Branch:** `feat/spec-075-trophy-grid`
- **PR (if applicable):** none yet (not opened this cycle)
- **All acceptance criteria met?** Yes.
  - `winningCellKeys(lineWins, paylines)` — `paylines` required, no `PAYLINES` import; tolerant
    skip of unknown line ids preserved and tested.
  - `ReelGrid` accepts `paylines` (required) and `size` (`'full' | 'card' | 'thumb'`, default
    `'full'`); `size='full'` appends no modifier class — verified by a dedicated test plus a
    line-by-line diff read of `ReelGrid.tsx` (see report) showing the only change to the
    live-reel path is `winningCellKeys(lineWins, paylines)` and an empty `sizeClass` string.
  - `Game.tsx` passes `machine.math.paylines`.
  - `TrophyGrid` renders via `getMachine(trophy.machineId)` (the originating machine), derives
    winning cells from that machine's `math.paylines`, exposes an `aria-label` summary
    (amount/machine/tier), and marks an unknown `machineId` with `.trophy-grid--unknown-machine`
    plus an "Unknown machine (id)" label instead of silently falling back to Wild & Whimsical.
  - Token colors only in `trophies.css`; `engine-no-dom` / `audio` diffs empty (confirmed via
    `git diff --stat main..HEAD -- src/engine/ src/ui/audio/`).
- **New decisions emitted:** none.
- **Deviations from spec:** none — `TrophyGrid.tsx`, `trophies.css`, and the `ReelGrid`/
  `winningCells` signatures were transcribed from the spec's Notes as given. Added two small
  tests beyond the required list (a `size='card'` modifier-class check, and asserting the
  `.trophy-grid--unknown-machine` class directly) as low-cost extra coverage alongside the
  required cases — not a scope deviation.
- **Follow-up work identified:** none beyond SPEC-076/077/078 already on the backlog.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing; the Notes' code was
   directly transcribable and the acceptance criteria mapped 1:1 onto the Failing Tests list.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No gap
   found; DEC-021/010/024 plus `guidance/constraints.yaml` covered every judgment call
   (originating-machine lookup, token-only CSS, additive schema already in place from SPEC-073).
3. **If you did this task again, what would you do differently?** — Nothing structural; would
   again read `ReelGrid.test.tsx`/`Game.tsx` first to catch every call site needing the new
   required `paylines` prop before editing, which avoided a second pass here.

---

## Reflection (Ship)

1. **What would I do differently next time?** —
2. **Does any template, constraint, or decision need updating?** —
3. **Is there a follow-up spec I should write now before I forget?** —
