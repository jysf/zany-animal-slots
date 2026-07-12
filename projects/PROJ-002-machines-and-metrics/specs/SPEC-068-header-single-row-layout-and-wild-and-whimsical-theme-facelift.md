---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-068
  type: chore                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-013
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # visual facelift — built + preview-verified in the orchestrator session
  created_at: 2026-07-12

references:
  decisions:
    - DEC-001   # presentation-only; engine untouched
    - DEC-010   # token-only CSS + the machine theme is CSS custom properties
    - DEC-021   # per-machine identity — W&W gets its own theme like the others
  constraints:
    - engine-no-dom
    - portrait-first
    - touch-targets-44
  related_specs:
    - SPEC-063  # the header wrap this replaces with a clean single row
    - SPEC-065  # the colourful emoji the W&W theme now matches
    - SPEC-048  # the per-machine theme slice this fills for W&W

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-013's <capability>". Optional; null is acceptable.
value_link: >-
  Two user-reported facelift fixes on the live build: the header no longer wraps its controls onto a
  ragged second row, and Wild & Whimsical (the default machine) gets a bright, whimsical theme instead
  of the dull default campfire brown.

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
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # main-loop, not separately metered (AGENTS §4)
      recorded_at: 2026-07-12
      note: Design + build + verify in the orchestrator session (visual facelift; verification is the rendered header + themed game).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 30000   # NOMINAL main-loop estimate — not a metered subagent
      estimated_usd: 0.45   # nominal, 30000 tok x ~$15/M (Opus list, order-of-magnitude)
      recorded_at: 2026-07-12
      note: >-
        Build in the orchestrator loop: made the paytable/stats/help header triggers icon-only (kept
        aria-label + added title tooltip), reworked .cabinet__header-controls to a single non-wrapping
        row (selector flexes + truncates; icon triggers fixed ≥44px), and gave Wild & Whimsical its own
        magical-plum theme. Updated the parity test (theme no longer empty + AA contrast check). NOMINAL
        main-loop estimate. Full gate green (471, worktree excluded); engine diff EMPTY.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 14000   # NOMINAL main-loop estimate
      estimated_usd: 0.21   # nominal, 14000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Verified in-browser at 375px: the five header controls sit on ONE clean row (selector + 4 icon
        buttons), no ragged wrap; Wild & Whimsical renders a vibrant purple/pink/gold theme with the
        colourful menagerie popping on the dark plum; switching to Arctic confirms the W&W theme is
        isolated (Arctic's blue unchanged, its short name shows in full). NOMINAL main-loop estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 44000   # build 30000 + verify 14000 (both NOMINAL; design + ship null)
    estimated_usd: 0.66
    session_count: 4
---

# SPEC-068: Header single-row layout + Wild & Whimsical theme facelift

## Context

Two facelift fixes the user reported after playing the live `main` build:

1. **The header wrapped onto a ragged second row.** SPEC-063 fixed the *Help-off-screen* overflow by
   letting `.cabinet__header-controls` wrap — but with five controls (selector + mute + paytable + stats +
   help, the last three with text labels) the cluster split across two rows and looked bad.
2. **Wild & Whimsical was dull brown.** W&W (the default machine) shipped with `theme: {}`, deferring to
   the static campfire palette in `tokens.css` — while Arctic/Desert/Ocean each have a vivid themed
   palette. On the new colourful reel menagerie (frog…unicorn) the brown read as flat and dated.

Presentation-only: no engine change (DEC-001).

## Goal

Put the five header controls on **one clean row** (icon-only action triggers + a flexing machine
selector), and give **Wild & Whimsical its own bright, whimsical theme** (a magical plum palette with
pink/gold accents) so the default machine matches its colourful identity — while keeping accessibility
(≥44px targets, aria-labels, AA text contrast) and leaving the other machines untouched.

## Outputs

- **Files modified:**
  - `src/ui/PaytableSheet.tsx`, `src/ui/stats/StatsSheet.tsx`, `src/ui/help/HelpSheet.tsx` — triggers are
    now **icon-only** (`ℹ` / `📊` / `❓`), keeping their `aria-label` and adding a `title` tooltip.
  - `src/ui/regions/regions.css` — `.cabinet__header-controls` is a single non-wrapping row; the machine
    selector flexes + shrinks, the icon triggers keep a fixed ≥44px footprint.
  - `src/machines/wildAndWhimsical.ts` — `theme` is now the magical-plum palette (was `{}`).
  - `src/machines/wildAndWhimsical.parity.test.ts` — the "theme is empty" test → "has its own whimsical
    theme" (non-empty + AA text-on-bg contrast).
- No engine / dependency / DEC change.

## Acceptance Criteria

- [ ] At 375px, the five header controls sit on **one row** (no ragged wrap); each is fully visible and
      ≥44px; the Paytable/Stats/Help triggers are icon-only but keep their `aria-label` accessible names.
- [ ] The wide machine selector flexes/truncates to fit rather than forcing an overflow; short machine
      names (Arctic/Desert/Ocean) still show in full.
- [ ] Wild & Whimsical renders its own vibrant theme (magical plum bg, pink accent, gold coins) — not the
      default campfire brown; text-on-bg clears WCAG AA (≥ 4.5:1). Arctic/Desert/Ocean themes are unchanged.
- [ ] `git diff … -- src/engine/` EMPTY; token-only CSS (DEC-010); full gate green.

## Failing Tests / guards

- `wildAndWhimsical.parity.test.ts` — asserts W&W's theme is non-empty with the color tokens and passes
  the AA text-on-bg contrast check (inline sRGB→luminance helper, no dependency).
- The existing PaytableSheet/StatsSheet trigger tests query by `aria-label`/role, so icon-only triggers
  keep them green (accessibility preserved).

## Implementation Context

- `DEC-021` — per-machine identity: W&W gets its own `theme` like the other three; the base `tokens.css`
  campfire palette stays as the fallback (error boundary, initial paint).
- `DEC-010` — the header + theme are token-driven CSS custom properties; no raw hex outside the theme
  map (the theme *values* are the machine's palette, same pattern as arctic/ocean/desert).
- `DEC-001` — no engine change.

### Out of scope
- The `JackpotMoment` machine-agnostic wolf (flagged separately). Any base `tokens.css` change (the
  facelift is isolated to W&W's theme). Any Tier-2 analytics work (gated).

## Notes for the Implementer

Verified in-browser (the bar for "looks good"): the header on one row at 375px, W&W's themed game, and a
switch to Arctic to confirm the theme is isolated. The selector truncates its label on the longest name
(Wild & Whimsical) — acceptable; the dropdown shows full names and it is the active machine.

---

## Build Completion

- **Branch:** `feat/spec-068-facelift`
- **All acceptance criteria met?** yes — header is one clean row at 375px (screenshot); W&W renders the
  magical-plum theme with the colourful menagerie; Arctic switch confirms isolation. Full gate green (471,
  worktree excluded); engine diff EMPTY.
- **New decisions emitted:** none.
- **Deviations from spec:** the machine selector truncates its label on the longest name (Wild &
  Whimsical) to keep the single row — acceptable (dropdown shows full names; it is the active machine).
- **Follow-up identified:** none required for close-out; the `JackpotMoment` wolf remains the only flagged
  cosmetic.

### Build-phase reflection
1. **What was unclear?** — "cannot be on 2 lines" — resolved to "the controls must not ragged-wrap"; a
   single clean controls row (icon-only + flexing selector) satisfies it without shrinking the title.
2. **Missing constraint/decision?** — No.
3. **Do differently?** — Nothing; a colour/layout facelift is preview-iterated by nature.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Ship machine themes for ALL machines at once (W&W was left
   on `theme: {}` since STAGE-007's "default == today" migration, which quietly became "the dull one" once
   the others got vivid palettes). When a per-machine slice exists, fill it for every machine so none is
   accidentally the default-looking outlier.
2. **Does any template/constraint/decision need updating?** — No DEC change (W&W's theme is data within
   DEC-021, same as the emoji). The header is now icon-only + single-row — worth remembering that header
   action buttons should be icon-first from the start so the cluster scales.
3. **Follow-up spec to write now?** — None for close-out. Optional cosmetic: the `JackpotMoment` wolf.
