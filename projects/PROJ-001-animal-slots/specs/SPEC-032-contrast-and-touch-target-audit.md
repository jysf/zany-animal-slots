---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-032
  type: story
  cycle: build
  blocked: false
  priority: high
  complexity: M

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
    - DEC-010
    - DEC-001
  constraints:
    - touch-targets-44
    - portrait-first
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-014
    - SPEC-031

value_link: "Makes the game legible and operable for everyone: brings every text/background pair to WCAG AA contrast (one token fix) and locks in ≥44px touch targets — both enforced by guard tests."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 35
      recorded_at: 2026-06-28
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (incl. measuring all contrast pairs + 44px survey)"
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-032: Contrast & touch-target audit

## Context

Second STAGE-005 accessibility spec: a **WCAG AA contrast audit + ≥44px
touch-target audit**, with fixes, then guard tests. The design measured every
real text/background token pair and every interactive control:

- **Touch targets:** all controls already meet ≥44px — `.spin-btn`/`.bet-btn`/
  `.auto-btn`/`.reset-btn` are `2.75rem` (44px), `.mute-toggle`/`.paytable__trigger`
  are `var(--space-7)` (48px). **No fix needed; add a guard test.**
- **Contrast:** all pairs pass AA **except one** — `--color-text-muted` (`#b89a6e`)
  on `--color-frame` (`#5c3317`, the secondary-button background) measures **4.06:1**,
  below the 4.5 needed for the 16px-bold idle/disabled text of the Auto/Reset/disabled
  buttons. **Fix:** lighten `--_raw-muted` to `#ccb084` → that pair becomes **5.21:1**
  (and muted-on-bark/night rise to 7.05/9.02), still a muted tan. Every other pair is
  comfortably AA (cream/night 15.2, coin/bark 8.6, campfire/bark 5.1, jackpot/sky
  12.0, etc.). The win-tier color tokens (`--color-win-small/-big`) are **not used as
  text**, so they're out of scope.

Token-only change (DEC-010); engine untouched (DEC-001). After this, contrast and
touch-target compliance are enforced by tests, not just review.

See `STAGE-005-…md`, `touch-targets-44`, `DEC-010`, SPEC-014 (the bet controls),
SPEC-031 (the sibling reduced-motion audit + its guard-test approach).

## Goal

Lighten `--_raw-muted` to `#ccb084` (the single contrast fix); add
`src/styles/contrast.test.ts` (resolves the token palette from `tokens.css` and
asserts every real text/bg pair meets its WCAG AA threshold, incl. the now-fixed
muted-on-frame); and add `src/ui/controls.touch-target.test.ts` (asserts every
interactive control class declares a ≥44px min-height/width). Record the audit.

## Inputs

- **Files to read:** `src/styles/tokens.css` (the raw palette + semantic mapping),
  `src/ui/regions/controls.css` (the control sizes + colors), `src/ui/audio/audio.css`
  (`.mute-toggle`), `src/ui/paytable.css` (`.paytable__trigger`), `src/ui/regions/
  regions.css` (region backgrounds), `guidance/constraints.yaml` (`touch-targets-44`).
- **Related code paths:** `src/styles/`, `src/ui/`.

## Outputs

- **Files created:**
  - `src/styles/contrast.test.ts` — WCAG AA contrast guard (token-resolved pairs).
  - `src/ui/controls.touch-target.test.ts` — ≥44px guard for interactive controls.
- **Files modified:**
  - `src/styles/tokens.css` — `--_raw-muted: #ccb084;` (was `#b89a6e`).
- **New exports:** none.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `--_raw-muted` is `#ccb084`; `--color-text-muted` therefore resolves to it.
- [ ] `contrast.test.ts` parses `tokens.css` (raw palette + `--color-*: var(--_raw-*)`
      mapping), resolves the semantic colors, and asserts each of the real UI text/bg
      pairs meets WCAG AA: normal text ≥ **4.5**, large/display text ≥ **3.0**.
      Includes the previously-failing **muted-on-frame ≥ 4.5** (now ~5.2) and
      muted-on-surface / muted-on-bg / text-on-* / coin-on-* / accent-on-* /
      jackpot-on-sky pairs.
- [ ] The contrast test would **fail** if `--_raw-muted` were reverted to `#b89a6e`
      (the muted-on-frame pair drops to 4.06) — i.e. the test actually guards the fix.
- [ ] `controls.touch-target.test.ts` asserts `.spin-btn`, `.bet-btn`, `.auto-btn`,
      `.reset-btn` (controls.css), `.mute-toggle` (audio.css), `.paytable__trigger`
      (paytable.css) each declare a `min-height` **and** `min-width` ≥ 44px (i.e.
      `2.75rem`/`44px` or `var(--space-7)` = 3rem).
- [ ] Engine unchanged; no new dependency; existing tests still pass (the lighter
      muted is still distinct from `--color-text`); gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. Implement a small WCAG helper inline
(relative luminance + contrast ratio); no new dependency.

- **`src/styles/contrast.test.ts`**
  - `"resolves semantic colors from tokens.css"` — parse `--_raw-*: #hex` and
    `--color-*: var(--_raw-*)`; `--color-text-muted` resolves to `#ccb084`.
  - `"all UI text/bg pairs meet WCAG AA"` — for a defined list of pairs (fg, bg,
    minRatio), assert `contrast(fg,bg) >= minRatio`. At minimum:
    text/bg 4.5, text/surface 4.5, **muted/frame 4.5**, muted/surface 4.5, muted/bg
    4.5, coin/surface 4.5, accent/surface 3.0 (large display title), accent/bg 4.5
    (spin-btn uses bg-on-accent ≈ same ratio), jackpot/jackpot-sky 4.5.
  - `"the muted fix is load-bearing"` — computing the muted-on-frame ratio with the
    OLD value `#b89a6e` yields `< 4.5` (assert the guard isn't vacuous).

- **`src/ui/controls.touch-target.test.ts`** (reads the CSS files via `fs`)
  - `"interactive controls are ≥44px"` — for each `{file, selector}` in
    `[{controls.css, .spin-btn}, {.bet-btn}, {.auto-btn}, {.reset-btn},
    {audio.css, .mute-toggle}, {paytable.css, .paytable__trigger}]`, extract the
    rule block and assert it contains a `min-height` and a `min-width` whose value is
    `2.75rem` / `44px` / `var(--space-7)`.

## Implementation Context

### Decisions that apply

- `DEC-010` — colors are tokens; the fix is a one-line raw-palette change, no raw hex
  introduced in components. The contrast test reads the token file (the source of
  truth).
- `DEC-001` — pure UI; engine untouched.

### Constraints that apply

- `touch-targets-44` — this spec adds its enforcing test (controls already comply).
- `portrait-first` — unchanged; the audit is colors + sizes, no layout change.
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-014` (shipped) — the bet ± controls (44px). `SPEC-020`/`SPEC-026` — the header
  trigger / mute toggle (48px). `SPEC-031` (shipped) — the sibling a11y audit; mirror
  its "verify + guard test + record the audit" shape.

### Out of scope (for this spec specifically)

- Colorblind-safe state cues (SPEC-033) and perf (SPEC-034).
- Re-theming or changing any color other than the single `--_raw-muted` lighten.
- Focus-ring / keyboard-nav audit beyond what already exists (not framed here).

## Notes for the Implementer

- **The fix is one line:** in `tokens.css`, change `--_raw-muted: #b89a6e;` to
  `--_raw-muted: #ccb084;`. Do not touch any other token. (`--color-text-muted` is
  `var(--_raw-muted)`, so it updates automatically; the lighter tan still reads as
  "muted" next to `--color-text` cream.)
- `contrast.test.ts` — inline WCAG helpers (no dep):
  ```ts
  function luminance(hex: string): number {
    const c = hex.replace('#', '');
    const ch = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255)
      .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }
  function contrast(a: string, b: string): number {
    const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  }
  ```
  Parse `tokens.css` (read via `fs`): build `raw['--_raw-night'] = '#1a1008'` etc.
  from `/--(_raw-[a-z]+):\s*(#[0-9a-fA-F]{6})/`, and `semantic['--color-text-muted'] =
  raw['--_raw-muted']` from `/--(color-[a-z-]+):\s*var\(--(_raw-[a-z]+)\)/`. Then assert
  the pair list. Include a `muted/frame` pair with the OLD hex `#b89a6e` to prove the
  guard fails on regression (a `expect(contrast('#b89a6e', frameHex)).toBeLessThan(4.5)`).
- `controls.touch-target.test.ts` — read each CSS file with `fs`, slice out the
  `selector { … }` block (e.g. via an index-of/`{`…`}` scan or a regex like
  `new RegExp('\\.spin-btn\\s*\\{[^}]*\\}')`), and assert it contains `min-height`
  and `min-width` with a 44px-equivalent value.
- No new dependency. No new DEC (DEC-010 + touch-targets-44 cover this). This repo's
  ESLint has **no react-hooks plugin** and **no `@testing-library/user-event`**.
- Record the audit in Build Completion: the measured pairs, the one fix (muted), and
  the 44px confirmation.
- After build, the orchestrator previews: confirm the Auto/Reset labels are now
  legibly lighter against the wood buttons (a subtle but real lift); nothing else
  changes visually.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:**
- **PR (if applicable):**
- **All acceptance criteria met?** yes/no
- **New decisions emitted:**
  - none expected
- **Deviations from spec:**
  - [list]
- **Follow-up work identified:**
  - [any new specs for the stage's backlog]
- **Audit result:**
  - [contrast pairs measured + the muted fix; 44px confirmation across all controls]

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — <answer>

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — <answer>

3. **If you did this task again, what would you do differently?**
   — <answer>

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
