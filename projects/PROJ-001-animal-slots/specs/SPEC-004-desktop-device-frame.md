---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-004
  type: story                      # epic | story | task | bug | chore
  cycle: verify  # frame | design | build | verify | ship
  blocked: false
  priority: high
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-001
  stage: STAGE-001
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-06-19

references:
  decisions:
    - DEC-001
    - DEC-010
  constraints:
    - portrait-first
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-002
    - SPEC-003

value_link: "Completes STAGE-001's cabinet: dresses the desktop presentation in a centered device frame so the portrait game reads as an intentional app on large screens — without touching the phone layout."

# Self-reported AI cost per cycle.
cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 25
      recorded_at: 2026-06-19
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 54270
      estimated_usd: 0.36
      duration_minutes: 1.2
      recorded_at: 2026-06-19
      notes: "Sonnet sub-agent build (Agent subagent_tokens=54270, 72.5s). Sub-agent authored device-frame.css + radius/shadow tokens + token-test list then was interrupted; orchestrator finished mechanical wiring (App wrapper, App/device-frame tests) on main-loop (unmetered, not added here). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 66202
      estimated_usd: 0.44
      duration_minutes: 6.9
      recorded_at: 2026-06-19
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=66202, 414s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-004: Desktop device frame

## Context

The final spec of STAGE-001. SPEC-003 built the four-region portrait cabinet,
which on desktop currently sits centered (`max-width: 430px`) against bare dark
gutters. This spec dresses that desktop presentation: it wraps the cabinet in a
**phone-like device frame** — centered on an ambient backdrop, with rounded
corners and a drop shadow, sized to a phone shape — so the portrait game reads
as an intentional app on big screens rather than a stranded column. Crucially,
it must do this **without disturbing the phone layout**: at phone widths the
cabinet stays full-screen, edge-to-edge, exactly as SPEC-003 ships it.

It also extends the design-token sheet with the **radius** and **shadow** tokens
the frame needs (deliberately deferred in SPEC-002 until first needed — that's
now).

When this ships, STAGE-001 is complete: a themed, four-region cabinet that loads
in a browser, full-screen on phones and framed on desktop.

See `STAGE-001-scaffold-and-design-system.md`, SPEC-003's cabinet, SPEC-002's
tokens, and `DEC-010` (global CSS + tokens).

## Goal

On desktop widths, render the SPEC-003 cabinet inside a centered, phone-shaped
device frame (rounded corners, shadow, ambient backdrop) sized to phone
dimensions; at phone widths leave the cabinet full-screen and unchanged. Add the
`--radius-*` / `--shadow-*` tokens the frame uses.

## Inputs

- **Files to read:** `src/ui/App.tsx` + `src/ui/regions/regions.css` (SPEC-003's
  cabinet to wrap), `src/styles/tokens.css` + `src/styles/tokens.test.ts`
  (tokens to extend), `DEC-010` (styling approach).
- **Related code paths:** `src/ui/` (the cabinet + new frame styles).

## Outputs

- **Files created:**
  - `src/ui/device-frame.css` (or extend `regions.css`) — the device-stage
    backdrop + frame styles, gated to desktop with a `min-width` media query.
- **Files modified:**
  - `src/styles/tokens.css` — add `--radius-*` (incl. `--radius-frame`) and
    `--shadow-frame` tokens (the shadow's rgba lives inside the token value, so
    consuming CSS stays hex/color-literal-free).
  - `src/styles/tokens.test.ts` — extend the required-token contract with the new
    `--radius-frame` and `--shadow-frame` tokens.
  - `src/ui/App.tsx` — wrap the cabinet in a `<div className="device-stage">`
    (the desktop backdrop/centering container); import the frame CSS.
- **New exports:** none (App's default export unchanged).
- **Database changes:** none.

## Acceptance Criteria

- [ ] At **desktop** widths (≥ a `min-width` breakpoint, e.g. 640px): the cabinet
      renders inside a centered device frame — rounded corners
      (`var(--radius-frame)`), a drop shadow (`var(--shadow-frame)`), constrained
      to a phone shape (max-width ~430px and a bounded height, not full-viewport),
      centered both axes on an ambient backdrop.
- [ ] At **phone** widths (< the breakpoint): the cabinet is full-screen,
      edge-to-edge — **no** frame, bezel, rounded corners, or backdrop gutters.
      SPEC-003's four-region phone layout is visually unchanged.
- [ ] `tokens.css` declares `--radius-frame` and `--shadow-frame` (and a small
      radius scale) with non-empty values; the frame CSS consumes them via
      `var(--…)` and contains **no raw hex color literals**.
- [ ] The frame styling is gated behind a `min-width` media query (so it cannot
      affect the phone layout).
- [ ] `just typecheck`, `just lint`, `just test`, `just build` all exit 0; the
      existing SPEC-002/003 tests still pass.

## Failing Tests

Written during **design**, BEFORE build. Build's job is to make these pass.

> Same jsdom caveat: jsdom doesn't evaluate media queries or compute layout, so
> we can't unit-test "the frame appears only on desktop." Instead we test (a) the
> **structure** (the device-stage wrapper exists around the cabinet), (b) the
> **CSS contract** by parsing the frame CSS (it gates the frame behind a
> `min-width` media query, uses the radius/shadow tokens, and has no raw hex),
> and (c) the **token contract** (the new tokens are declared). Actual
> responsive appearance is a review/manual (screenshot) check.

- **`src/ui/App.test.tsx`** (extended)
  - `"wraps the cabinet in a device stage"` — render `<App />`; assert a
    device-stage container is present and the four cabinet regions render inside
    it (the existing four-region assertions still hold). Use a stable hook
    (e.g. `data-testid="device-stage"` or a class query) for the wrapper.

- **`src/ui/device-frame.test.ts`** (CSS contract for the frame stylesheet)
  - `"gates the device frame behind a min-width media query"` — read the frame
    CSS via `fs.readFileSync`; assert it contains a `@media` rule with
    `min-width` (the desktop gate).
  - `"styles the frame with radius and shadow tokens"` — assert the frame CSS
    references `var(--radius-frame)` and `var(--shadow-frame)`.
  - `"uses no raw hex color literals"` — assert no `/#[0-9a-fA-F]{3,8}\b/` match
    in the frame CSS.

- **`src/styles/tokens.test.ts`** (extended)
  - Add `--radius-frame` and `--shadow-frame` to the required-token list so the
    existing "declares every required design token" test now also asserts them.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-001` (engine/presentation separation) — pure presentation; no
  `src/engine/**` imports.
- `DEC-010` (global CSS + tokens, no CSS Modules/CSS-in-JS) — the frame is global
  CSS consuming tokens via `var()`, prefixed class names (e.g. `.device-stage`).

### Constraints that apply

- `portrait-first` — the phone (portrait) layout is primary and must be
  untouched; the frame is **additive desktop chrome only**, gated behind a
  `min-width` media query.
- `test-before-implementation`, `one-spec-per-pr`.
- (`touch-targets-44` already satisfied in SPEC-003; this spec adds no controls.)

### Prior related work

- `SPEC-003` (shipped, PR #3) — the four-region cabinet this frame wraps; its
  desktop centering (`max-width: 430px`) is the seam the frame builds on.
- `SPEC-002` (shipped, PR #2) — the token sheet this extends with radius/shadow.

### Out of scope (for this spec specifically)

- Any change to the **phone** layout / the SPEC-003 regions' interior.
- Skeuomorphic device chrome (notch, camera, home indicator, hardware buttons) —
  keep it a clean rounded-rect frame + shadow, not a photoreal phone.
- Reels, controls, balance, engine, animation, audio.
- `prefers-reduced-motion` (nothing animates).
- A desktop landscape "two-up" or alternate layout — portrait-in-a-frame only.

## Notes for the Implementer

- Structure: `App` → `<div className="device-stage"><div className="cabinet">…</div></div>`.
  The cabinet (SPEC-003) is unchanged internally.
- Phone (default, no media query): `.device-stage` adds no layout — the cabinet
  fills the viewport exactly as SPEC-003 (`100dvh`, `max-width: 430px` centered).
  Do NOT let any frame style apply below the breakpoint.
- Desktop (`@media (min-width: 640px)` or similar): `.device-stage` becomes a
  full-viewport flex center with an ambient backdrop (use a token — an existing
  dark one like `--color-jackpot-sky`/`--color-bg`, or add `--color-backdrop`);
  `.cabinet` gets `border-radius: var(--radius-frame)`, `box-shadow:
  var(--shadow-frame)`, `overflow: hidden`, and a bounded height (e.g.
  `height: min(92dvh, 880px)`, `min-height: 0`) so it's phone-shaped, not
  full-height.
- New tokens in `tokens.css`: a small radius scale (e.g. `--radius-sm/md/lg`) +
  `--radius-frame`, and `--shadow-frame` as a complete `box-shadow` value (its
  rgba lives in the token definition, keeping the frame CSS color-literal-free).
- Keep the frame CSS in its own file (`src/ui/device-frame.css`) imported by
  `App` for separation, or fold into `regions.css` — your call, but the
  device-frame.test.ts reads whichever file holds the frame rules, so keep them
  together in one stylesheet.
- After building, do a visual check at phone (375px) and desktop widths — phone
  must look identical to SPEC-003; desktop should show the framed cabinet.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-004-desktop-device-frame`
- **PR (if applicable):** (orchestrator fills at push/PR)
- **All acceptance criteria met?** yes
  - Desktop (≥640px): cabinet renders in a centered, rounded (`var(--radius-frame)`),
    shadowed (`var(--shadow-frame)`) frame on an ambient backdrop, bounded to a
    phone shape — confirmed by screenshot at 1280px.
  - Phone (<640px): cabinet full-screen, edge-to-edge, no frame — confirmed by
    screenshot at 375px (visually identical to SPEC-003).
  - `tokens.css` declares `--radius-frame` + `--shadow-frame` (rgba lives inside
    the shadow token); frame CSS consumes them via `var()` with no raw hex.
  - Frame gated behind `@media (min-width: 640px)`.
  - `just typecheck && just lint && just test && just build` all exit 0 (13/13 tests pass).
- **New decisions emitted:**
  - None. The frame is additive presentation under existing DEC-010 (global CSS +
    tokens) and DEC-001 (presentation-only); no new architectural choice.
- **Deviations from spec:**
  - Backdrop uses the existing `--color-jackpot-sky` token rather than adding a new
    `--color-backdrop` (the spec offered this as an explicit option) — keeps the
    token set minimal until a distinct backdrop color is actually needed.
  - Build was completed across two sessions: a Sonnet sub-agent authored
    `device-frame.css` + the radius/shadow tokens + extended the token test list,
    then was interrupted mid-task; the orchestrator finished the remaining
    mechanical wiring (App.tsx `device-stage` wrapper + import, the App.test.tsx
    structure test, and `device-frame.test.ts`) and ran the gate. No design
    decisions were made in the finish; cost is attributed to the sub-agent below.
- **Follow-up work identified:**
  - None. STAGE-001's backlog is complete with this spec.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing material. The jsdom caveat and the explicit CSS-contract / token-contract
   test specifications removed the usual "how do we test responsive CSS" ambiguity.
   The only open choice was which dark token to use for the backdrop, and the spec
   pre-empted that by naming candidates.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. `portrait-first` plus DEC-010 (tokens, no raw hex) fully governed the work;
   the "no raw hex in the frame CSS" rule follows directly from DEC-010.

3. **If you did this task again, what would you do differently?**
   — Nothing on the implementation — the additive, `min-width`-gated approach that
   leaves the phone layout completely untouched is the correct shape. Process-wise,
   the only lesson is sub-agent fragility (see dogfood finding): an interrupted
   build needs a clean way to resume or hand off mid-task.

---

## Verify

✅ APPROVED — reviewed by claude-sonnet-4-6, 2026-06-19

### Gate results

| Command | Result |
|---|---|
| `just typecheck` | EXIT 0 |
| `just lint` | EXIT 0 |
| `just test` | EXIT 0 — 13/13 tests pass |
| `just build` | EXIT 0 |
| `just decisions-audit --changed main` | EXIT 0 — advisory only, no violations |

### Acceptance criteria

- [x] **Desktop frame (AC1):** `device-frame.css` places all rules inside `@media (min-width: 640px)`. `.device-stage` is full-viewport flex-centered; `.cabinet` gets `border-radius: var(--radius-frame)`, `box-shadow: var(--shadow-frame)`, `height: min(92dvh, 880px)`, `overflow: hidden`. Ambient backdrop uses `--color-jackpot-sky`. Centered both axes confirmed in CSS.
- [x] **Phone unchanged (AC2):** No rules outside the media query; `regions.css` is untouched (zero diff vs `main`). Phone path adds no layout.
- [x] **Tokens declared (AC3):** `tokens.css` has `--radius-frame: 2.5rem` and `--shadow-frame: 0 8px 40px rgba(0,0,0,0.6), 0 2px 12px rgba(0,0,0,0.4)`. Frame CSS consumes both via `var()`. No raw hex in `device-frame.css` (grep confirms zero matches).
- [x] **Min-width gate (AC4):** Single `@media (min-width: 640px)` block; every frame rule is inside it.
- [x] **All gates pass (AC5):** Confirmed above.

### Tests not vacuous

- `device-frame.test.ts` "gates behind min-width": regex `/@media[^{]*min-width[^{]*\{/` — would FAIL if the `@media` block were removed.
- `device-frame.test.ts` "styles with radius and shadow tokens": `.includes('var(--radius-frame)')` and `.includes('var(--shadow-frame)')` — would FAIL if either `var()` reference were deleted.
- `device-frame.test.ts` "no raw hex": `/#[0-9a-fA-F]{3,8}\b/` — would FAIL if a hex literal were introduced. Regex is non-trivial (3–8 hex digits with word boundary).
- `App.test.tsx` "wraps in device stage": `screen.getByTestId('device-stage')` throws if absent; `.toContainElement` checks nesting structure — would FAIL if the wrapper were removed.
- `tokens.test.ts` (extended): `--radius-frame` and `--shadow-frame` in `REQUIRED_TOKENS` — pattern test would FAIL if either token were removed from `tokens.css`.

### Constraints

- **portrait-first:** Satisfied — phone layout entirely untouched. Frame styles are exclusively inside `@media (min-width: 640px)`. `regions.css` has zero changes.
- **test-before-implementation:** Satisfied — failing tests specified in spec's `## Failing Tests` section (design phase); build made them pass.
- **one-spec-per-pr:** Satisfied — PR #4 covers only SPEC-004.
- **DEC-001 (engine/presentation separation):** Satisfied — no `src/engine` imports in any touched file.
- **DEC-010 (global CSS + tokens, no raw hex):** Satisfied — frame CSS is global, token-driven, zero raw hex literals.

### Decision drift

Two decisions govern the touched files (per `just decisions-audit --changed main`): DEC-004 and DEC-010.
- DEC-004 (CSS animation, not canvas): no animation added; consistent.
- DEC-010 (global CSS + tokens): frame follows the convention exactly; consistent.
- No new non-trivial build decision required — additive presentation under existing decisions. Confirmed correct.

### Build reflection

Three questions answered honestly and non-trivially. Deviation (using `--color-jackpot-sky` instead of adding `--color-backdrop`) is documented and matches the spec's explicit guidance.

### Cost sessions

Design (null, main-loop note) and build (null, sub-agent note) present. Verify session appended above. Orchestrator fills real tokens at ship per AGENTS §4.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
