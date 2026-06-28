---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-033
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: S

project:
  id: PROJ-001
  stage: STAGE-005
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-28

references:
  decisions:
    - DEC-006
    - DEC-010
    - DEC-001
  constraints:
    - respect-reduced-motion
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-019
    - SPEC-021

value_link: "Makes the win tier legible without relying on color: the win badge gains a tier word (WIN / BIG WIN / JACKPOT) — a text cue for colorblind players — backed by a redundant tier border color."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 25
      recorded_at: 2026-06-28
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (incl. colorblind audit)"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: null
      recorded_at: 2026-06-28
      notes: "orchestrator to fill tokens_total from subagent_tokens at ship"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-033: Colorblind-safe state cues

## Context

Third STAGE-005 accessibility spec. The colorblind audit: most of the game is
already colorblind-safe — symbols are **shape-distinct emoji** (DEC-006, different
animals, not color swatches), the win **amount is numeric**, and the three win
tiers are mostly distinguished by **intensity** (paw trail → particle count → the
full jackpot scene) rather than hue. The one gap: nothing states the **tier in
words**. A player who can't read the celebration's color/intensity cues (or just
glances at the badge) can't tell a `big` win from a `small` one.

This spec closes that with a **redundant, non-color cue**: the win badge gains a
**tier word** — `WIN` (small) / `BIG WIN` (big) / `JACKPOT` (jackpot) — plus a
`data-tier` attribute, and (as enhancement, not the sole cue) a tier-scaled border
color using the so-far-unused `--color-win-small/-big`/`--color-jackpot` tokens.
The text is the accessible cue; the color is redundant backup — the WCAG "don't
rely on color alone" pattern. Pure presentation (DEC-001); token CSS, no raw hex
(DEC-010).

See `STAGE-005-…md`, the stage's "state distinguishable without color" criterion,
`DEC-006` (emoji shapes), `DEC-010`, SPEC-019 (the `WinBadge`), SPEC-021
(`celebration.tier`).

## Goal

Give `WinBadge` an optional `tier` so it renders a tier word (`WIN`/`BIG WIN`/
`JACKPOT`) before the amount and exposes `data-tier`; thread `celebration.tier`
into it from `Game`; add a redundant tier border color in `win-badge.css` from the
win-tier tokens. Backward-compatible (no `tier` → plain `WIN`).

## Inputs

- **Files to read:** `src/ui/reels/WinBadge.tsx` (+ `WinBadge.test.tsx`),
  `src/ui/reels/win-badge.css`, `src/ui/regions/Game.tsx` (+ `Game.test.tsx`),
  `src/ui/useSlotMachine.ts` (`Celebration`, `WinTier`), `src/styles/tokens.css`
  (`--color-win-small/-big`, `--color-jackpot`).
- **Related code paths:** `src/ui/reels/`, `src/ui/regions/`.

## Outputs

- **Files modified:**
  - `src/ui/reels/WinBadge.tsx` — add optional `tier?: WinTier`; render a tier word
    prefix; add `data-tier={tier}`.
  - `src/ui/reels/win-badge.css` — tier border color via `.win-badge[data-tier=…]`
    using the win-tier tokens (redundant cue; no raw hex).
  - `src/ui/regions/Game.tsx` — pass `tier={celebration?.tier}` to `WinBadge`.
  - `src/ui/reels/WinBadge.test.tsx`, `src/ui/regions/Game.test.tsx`,
    `src/ui/reels/reels.animation.test.ts` (or a small win-badge CSS-contract check)
    — extend (below).
- **New exports:** none (new optional prop only).
- **Database changes:** none.

## Acceptance Criteria

- [ ] `WinBadge` renders a **tier word** before the amount: `tier==='jackpot'` →
      text contains `JACKPOT`; `tier==='big'` → `BIG WIN`; `tier==='small'` or
      omitted → `WIN`. The amount is still shown (e.g. `JACKPOT +2000`).
- [ ] `WinBadge` sets `data-tier` to the tier (default `small` when omitted), so the
      tier is in the DOM independent of color.
- [ ] Existing `WinBadge` behavior holds: renders nothing when `amount <= 0` or
      `!show`; `role="status"`; the amount text is present (the existing "contains 55"
      test still passes via the default `WIN +55`).
- [ ] `win-badge.css` gives a **redundant** tier border color via
      `.win-badge[data-tier="small|big|jackpot"]` using `--color-win-small`,
      `--color-win-big`, `--color-jackpot` — color is a backup to the text, not the
      sole cue; no raw hex.
- [ ] `Game` passes the resolved `celebration.tier` so the live badge shows the
      right tier word. Engine unchanged; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build.

- **`src/ui/reels/WinBadge.test.tsx`** (extended)
  - `"shows the tier word for each tier"` — `<WinBadge amount={2000} show
    tier="jackpot" />` text contains `JACKPOT` and `2000`; `tier="big"` → `BIG WIN`;
    `tier="small"` → `WIN` (and not `BIG`); the existing no-tier `<WinBadge amount={55}
    show />` still contains `55` and `WIN`.
  - `"exposes data-tier"` — `tier="big"` → the status element has
    `data-tier="big"`; omitted → `data-tier="small"`.
  - (keep the existing null cases.)

- **`src/ui/regions/Game.test.tsx`** (extended)
  - `"threads the tier into the win badge"` — `<Game grid={INITIAL_GRID}
    spinning={false} lastWin={2000} celebration={{ id:1, tier:'jackpot',
    totalWin:2000, lineWins:[] }} />` → the badge text contains `JACKPOT`.

- **`src/ui/reels/win-badge.css` contract** (extend `reels.animation.test.ts` or a
  small co-located check)
  - `"tier border colors use the win-tier tokens, no raw hex"` — `win-badge.css`
    matches `/--color-win-big/` and `/--color-jackpot/` (and `/--color-win-small/`)
    in `[data-tier=…]` rules, and has no `/#[0-9a-fA-F]{3,8}\b/`.

## Implementation Context

### Decisions that apply

- `DEC-006` — symbols stay shape-distinct emoji (already colorblind-safe); this spec
  only adds the tier text cue + redundant color.
- `DEC-010` — tier colors are the existing `--color-win-*` tokens (first real use as
  a visual cue); no raw hex.
- `DEC-001` — pure presentation; `tier` comes from the engine-derived `celebration`;
  engine untouched.

### Constraints that apply

- `respect-reduced-motion` — unchanged (the badge's pop-in already has a
  reduced-motion path; this spec adds no new animation).
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-019` (shipped) — `WinBadge` (`WIN +{amount}`). `SPEC-021` (shipped) —
  `celebration.tier`. `SPEC-032` (shipped) — the contrast guard (the badge text stays
  `--color-coin` on `--color-surface`, already AA; the tier border is decorative).

### Out of scope (for this spec specifically)

- The perf pass (SPEC-034). Adding tier words to the Status WIN readout or other
  surfaces — the badge is the prominent tier indicator; keep the change focused.
- Any new colorblind-simulation tooling.

## Notes for the Implementer

- `WinBadge.tsx`:
  ```tsx
  import type { WinTier } from '../../engine/index';
  import './win-badge.css';
  interface Props { amount: number; show: boolean; tier?: WinTier }
  const TIER_WORD: Record<'small' | 'big' | 'jackpot', string> = {
    small: 'WIN', big: 'BIG WIN', jackpot: 'JACKPOT',
  };
  export default function WinBadge({ amount, show, tier = 'small' }: Props) {
    if (!show || amount <= 0) return null;
    const t = tier === 'none' ? 'small' : tier;                 // 'none' shouldn't reach here
    return (
      <div className="win-badge" data-tier={t} role="status">
        {TIER_WORD[t]} +{amount}
      </div>
    );
  }
  ```
- `win-badge.css` — add, after the base `.win-badge` rule (which keeps its
  `--color-coin` border as the default/small look):
  ```css
  /* Redundant tier cue — the tier WORD is the accessible signal; this color
     is a backup (WCAG: don't rely on color alone). Tokens only. */
  .win-badge[data-tier="small"]   { border-color: var(--color-win-small); }
  .win-badge[data-tier="big"]     { border-color: var(--color-win-big); }
  .win-badge[data-tier="jackpot"] { border-color: var(--color-jackpot); }
  ```
- `Game.tsx` — change `<WinBadge amount={lastWin} show={!spinning} />` to
  `<WinBadge amount={lastWin} show={!spinning} tier={celebration?.tier} />`. (When
  `celebration` is null the badge is hidden anyway since `lastWin` is 0.)
- No new dependency. No new DEC. This repo's ESLint has **no react-hooks plugin**;
  **no `@testing-library/user-event`**.
- After build, the orchestrator previews: a win shows `WIN +N` / `BIG WIN +N` /
  `JACKPOT +N` with a tier-tinted border; confirm the word matches the tier and the
  amount is still shown.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-033-colorblind-cues
- **PR (if applicable):** local only (no push per instructions)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none; drop-in code used verbatim
- **Follow-up work identified:**
  - none beyond the already-planned SPEC-034 perf pass

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing slowed me down. The spec's "Notes for the Implementer" was unusually complete — the drop-in code snippets for all four files were exact and needed no interpretation. The only judgment call was where to insert the new describe block in `reels.animation.test.ts`, and the existing file made the pattern obvious.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. `respect-reduced-motion` was correctly listed as a no-op for this spec (the badge's animation already had a reduced-motion path and this spec adds no new animation). `engine-no-dom` was implicitly observed by importing `WinTier` as a type only from `src/engine/index`.

3. **If you did this task again, what would you do differently?**
   — Nothing material. The spec was sized right (S) and the drop-in code matched the existing conventions exactly. Reading all six source files before writing a line was the right order and took under a minute — worth keeping as the default for even small specs.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
