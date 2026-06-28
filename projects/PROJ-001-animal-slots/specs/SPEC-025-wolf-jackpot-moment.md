---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-025
  type: story
  cycle: verify
  blocked: false
  priority: high
  complexity: M

project:
  id: PROJ-001
  stage: STAGE-004
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-sonnet-4-6
  created_at: 2026-06-27

references:
  decisions:
    - DEC-001
    - DEC-004
    - DEC-006
    - DEC-010
  constraints:
    - respect-reduced-motion
    - perf-60fps
    - portrait-first
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-021
    - SPEC-024

value_link: "The showpiece: on the five-Wolf jackpot, a full-cabinet night-sky + rising moon + howling wolf overlay makes the rarest win unmistakably the biggest — the third, distinct celebration state."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); design cycle"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 54563
      estimated_usd: 0.36
      duration_minutes: 2.4
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent build (Agent subagent_tokens=54563, 143s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 68396
      estimated_usd: 0.45
      duration_minutes: 13.1
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=68396, 786s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 8
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (orchestrator squash-merge + bookkeeping; incl. preview jackpot-overlay check)"
  totals:
    tokens_total: 122959
    estimated_usd: 0.81
    session_count: 5
---

# SPEC-025: Wolf jackpot moment

## Context

The showpiece celebration — the third, visually distinct win state (small / big /
jackpot). On the five-Wolf jackpot (`celebration.tier === 'jackpot'`, the engine's
five-Wolves-on-a-payline classification), a **full-cabinet moment** takes over: a
midnight-sky tint washes the cabinet, a moon 🌕 rises, and a wolf 🐺 howls
front-and-centre with a "JACKPOT!" banner. It auto-dismisses after a few seconds
so play resumes. This is the "howl + moon scene" the stage frame calls for.

Fires only on a real jackpot (DEC-001/DEC-005 — five Wolves actually landed),
keyed on `celebration.id` (SPEC-021) so it plays once per jackpot and can replay.
CSS celebration (DEC-004): the sky/moon/wolf animate via `transform`/`opacity`
keyframes; under `prefers-reduced-motion` the scene appears **statically** (no
motion) — the jackpot is still announced, just without movement. Emoji art
(DEC-006); token-only CSS, no raw hex (DEC-010). The overlay is decorative
(`pointer-events: none`) and labelled for screen readers via `role="status"`.

See `STAGE-004-win-celebration-and-juice.md`, `DEC-004`, `DEC-006`, `DEC-010`,
SPEC-021 (`celebration` — `id`/`tier`), SPEC-024 (the jackpot already throws the
largest particle burst; this adds the scene on top).

## Goal

Render a full-cabinet `JackpotMoment` overlay when `celebration.tier ===
'jackpot'`: a night-sky tint + rising moon 🌕 + howling wolf 🐺 + "JACKPOT!"
banner, animated via CSS (static under reduced motion), auto-dismissing after
`JACKPOT_MOMENT_MS` and re-showing on a new jackpot `id`. Render nothing for any
non-jackpot tier (small / big / none) or when there is no celebration.

## Inputs

- **Files to read:** `src/ui/App.tsx` (the cabinet host; already has
  `celebration`); `src/ui/regions/regions.css` (`.cabinet { position: relative }`
  already present — the overlay's containing block); `src/ui/useSlotMachine.ts`
  (`Celebration`); `src/ui/reels/WinBadge.tsx` + `win-badge.css` (overlay/CSS
  pattern); `src/styles/tokens.css` (`--color-jackpot`, `--color-jackpot-sky`,
  `--color-coin`); the jackpot seed note (407947) in this stage's context.
- **Related code paths:** `src/ui/`, `src/styles/`.

## Outputs

- **Files created:**
  - `src/ui/JackpotMoment.tsx` — the overlay component + exported
    `JACKPOT_MOMENT_MS`.
  - `src/ui/JackpotMoment.test.tsx` — behavior + CSS-contract tests (fake timers).
  - `src/ui/jackpot.css` — `.jackpot-moment` + sky/moon/wolf/banner styles, the
    keyframes, and the `prefers-reduced-motion` block.
- **Files modified:**
  - `src/ui/App.tsx` — render `<JackpotMoment celebration={celebration} />` inside
    `.cabinet` (it already destructures `celebration`).
- **New exports:** `JackpotMoment` (default), `JACKPOT_MOMENT_MS`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `JackpotMoment` renders nothing when `celebration` is null/undefined or when
      `tier` is `small` / `big` / `none`.
- [ ] On `tier === 'jackpot'` it renders a `.jackpot-moment` overlay containing the
      moon 🌕, the wolf 🐺, and a "JACKPOT" banner; the root has `role="status"`
      with a descriptive `aria-label`, and is `pointer-events: none`.
- [ ] The moment **auto-dismisses** after `JACKPOT_MOMENT_MS` (advancing fake
      timers removes it), and **re-shows** when a new jackpot arrives (a higher
      `celebration.id` still at `tier === 'jackpot'`).
- [ ] The sky/moon/wolf animate via CSS `@keyframes` (transform/opacity, DEC-004);
      a `@media (prefers-reduced-motion: reduce)` block shows the scene without
      animation; `jackpot.css` has no raw hex (CSS-contract test).
- [ ] It overlays the whole cabinet at a z-index above the win badge / paytable
      (z-index ≥ 20). Engine unchanged; existing App tests still pass; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. Use `vi.useFakeTimers()`. Query via
`container.querySelector('.jackpot-moment')` and `screen.queryByRole('status')`.
Import `JACKPOT_MOMENT_MS` from the component.

- **`src/ui/JackpotMoment.test.tsx`**
  - `"renders nothing without a celebration"` — `<JackpotMoment />` → no
    `.jackpot-moment`.
  - `"renders nothing for a non-jackpot tier"` — `tier:'small'` and `tier:'big'`
    and `tier:'none'` each → no `.jackpot-moment`.
  - `"renders the jackpot scene on a jackpot"` — `celebration={{ id:1,
    tier:'jackpot', totalWin:2000, lineWins:[] }}` → `.jackpot-moment` present,
    text includes 🌕, 🐺, and `/jackpot/i`; root has `role="status"` and an
    `aria-label`.
  - `"auto-dismisses after JACKPOT_MOMENT_MS"` — render jackpot; `act(() =>
    vi.advanceTimersByTime(JACKPOT_MOMENT_MS))` → `.jackpot-moment` gone.
  - `"re-shows on a new jackpot id"` — after dismiss, rerender with `{ id:2,
    tier:'jackpot', … }` → `.jackpot-moment` present again.
  - `"defines the keyframes + reduced-motion + no raw hex"` (CSS-contract, reads
    `jackpot.css`) — matches `/@keyframes/`, uses `transform`, has a
    `/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/` block, and no
    `/#[0-9a-fA-F]{3,8}\b/`.

## Implementation Context

### Decisions that apply

- `DEC-004` — sky/moon/wolf motion is CSS keyframes; reduced motion shows the
  scene statically (the jackpot is still announced — that is the non-animated
  path; do NOT hide it under reduced motion).
- `DEC-006` — 🌕 / 🐺 emoji art.
- `DEC-010` — token-only CSS (`--color-jackpot-sky` for the sky, `--color-jackpot`
  / `--color-coin` for the banner), prefixed `.jackpot-moment*`, no raw hex. Use a
  full-opacity `--color-jackpot-sky` layer with element `opacity` for the tint
  (avoids needing an rgba literal).
- `DEC-001` — fires only on the engine's `jackpot` tier (via `celebration`); no
  engine change, no UI game math.

### Constraints that apply

- `respect-reduced-motion` — static scene under reduced motion.
- `perf-60fps` — transform/opacity only; a handful of elements.
- `portrait-first` (overlay fills the ≤430px cabinet), `test-before-implementation`,
  `one-spec-per-pr`.

### Prior related work

- `SPEC-021` (shipped) — `celebration.tier === 'jackpot'` + `celebration.id`; the
  trigger + replay key. Jackpot seed 407947 → tier `jackpot`, totalWin 2000.
- `SPEC-024` (shipped) — the jackpot already gets the biggest particle burst; this
  scene layers above it (z-index 20 > particles' 8).
- `SPEC-020` (shipped) — the paytable sheet also overlays `.cabinet` (z-index 10/11);
  the jackpot moment sits above it.

### Out of scope (for this spec specifically)

- Audio — the actual howl *sound* is SPEC-027 (jingle, gated by SPEC-026's
  mute/unlock). This spec is the visual "howl + moon" scene only.
- A tap-to-dismiss interaction — auto-dismiss only (overlay is `pointer-events:
  none`). Parallax / multi-layer sky depth — keep one sky + moon + wolf.

## Notes for the Implementer

- `JackpotMoment.tsx`:
  ```tsx
  import { useState, useEffect } from 'react';
  import type { Celebration } from './useSlotMachine';
  import './jackpot.css';

  export const JACKPOT_MOMENT_MS = 3500;

  export default function JackpotMoment({ celebration }: { celebration?: Celebration | null }) {
    const isJackpot = celebration?.tier === 'jackpot';
    const id = celebration?.id ?? null;
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      if (!isJackpot) { setVisible(false); return; }
      setVisible(true);
      const t = setTimeout(() => setVisible(false), JACKPOT_MOMENT_MS);
      return () => clearTimeout(t);
    }, [id, isJackpot]);

    if (!isJackpot || !visible) return null;
    return (
      <div className="jackpot-moment" role="status" aria-label="Jackpot! Five wolves!">
        <div className="jackpot-moment__sky" aria-hidden="true" />
        <div className="jackpot-moment__moon" aria-hidden="true">🌕</div>
        <div className="jackpot-moment__wolf" aria-hidden="true">🐺</div>
        <div className="jackpot-moment__banner">JACKPOT!</div>
      </div>
    );
  }
  ```
  No `prefersReducedMotion()` JS check here — the scene shows for everyone; the CSS
  `@media` block removes only the motion. The `setTimeout` is an auto-dismiss
  timer (not motion), so it runs under reduced motion too.
- `jackpot.css` (sketch — tokens only, no raw hex):
  ```css
  .jackpot-moment {
    position: absolute; inset: 0; z-index: 20;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    pointer-events: none; overflow: hidden;
  }
  .jackpot-moment__sky {
    position: absolute; inset: 0;
    background-color: var(--color-jackpot-sky);
    opacity: 0.92;                       /* tint without an rgba literal */
    animation: jackpot-sky-in 0.5s ease-out both;
  }
  .jackpot-moment__moon {
    position: relative; font-size: 5rem; line-height: 1;
    animation: jackpot-moon-rise 0.9s ease-out both;
  }
  .jackpot-moment__wolf {
    position: relative; font-size: 4rem; line-height: 1;
    animation: jackpot-wolf-howl 1s ease-out 0.2s both;
  }
  .jackpot-moment__banner {
    position: relative;
    font-family: var(--font-family-display);
    font-size: var(--font-size-3xl); font-weight: var(--font-weight-black);
    color: var(--color-jackpot);
    animation: jackpot-banner-in 0.6s ease-out 0.3s both;
  }
  @keyframes jackpot-sky-in { from { opacity: 0; } to { opacity: 0.92; } }
  @keyframes jackpot-moon-rise { 0% { transform: translateY(40px) scale(0.6); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
  @keyframes jackpot-wolf-howl { 0% { transform: scale(0.6) rotate(0deg); opacity: 0; } 60% { transform: scale(1.2) rotate(-8deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
  @keyframes jackpot-banner-in { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .jackpot-moment__sky, .jackpot-moment__moon, .jackpot-moment__wolf, .jackpot-moment__banner { animation: none; }
    .jackpot-moment__sky { opacity: 0.92; }
  }
  ```
  (Raw `rem`/`px` for the one-off decorative scene sizes is fine — the hard
  contract is **no hex colors**; colors must be tokens.)
- `App.tsx`: add `<JackpotMoment celebration={celebration} />` as a child of the
  `.cabinet` div (e.g. after `<Action … />`), so it overlays the whole cabinet.
- No new DEC — DEC-004/006/010 cover this.
- After build, the orchestrator previews the jackpot via the pinned seed path
  (inject `nextSeed: () => 407947` is hook-internal; in the live app, drive it by
  temporarily forcing the seed, or verify the component directly) — confirm the
  moon rises, the wolf howls, the banner reads JACKPOT, and it auto-dismisses.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-025-jackpot-moment
- **PR (if applicable):** none (local only)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none
- **Deviations from spec:**
  - none; drop-in code from spec Notes used verbatim
- **Follow-up work identified:**
  - none beyond already-planned SPEC-026/027

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing meaningfully slowed the build. The "Notes for the Implementer" provided complete drop-in code for every file; the only ambiguity was whether `tier: 'none'` was a valid value for the `Celebration` interface in tests (the comment says "never 'none', only set on a win" but the TypeScript type allows it). It compiled fine without adjustment.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No missing constraints. The spec's note about the ESLint react-hooks plugin absence (and the resulting ban on `// eslint-disable-line react-hooks/exhaustive-deps`) was a helpful heads-up that saved a lint failure. All relevant decisions (DEC-004/006/010/001) were explicitly cited and sufficient.

3. **If you did this task again, what would you do differently?**
   — Nothing significant; the spec was self-contained enough that implementation was essentially transcription + gate verification. One micro-improvement: running `just test` before `just typecheck` would surface test logic errors faster than a type error, since the component code and test code interact closely.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing material. Hosting the overlay in `.cabinet` (already `position:
   relative` from SPEC-020's paytable) meant no layout plumbing, and a JS
   auto-dismiss timer keyed on `celebration.id` (re-arms per jackpot) plus a pure
   CSS reduced-motion path kept the component tiny. Verifying via injected markup
   over the live cabinet (since a natural jackpot is ~1-in-millions) confirmed the
   z-index/layering and the moon/wolf/banner scene render exactly as intended.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-004/006/010 covered it. Worth noting the verification technique for
   future rare-state specs: injecting the component's exact markup into the live
   DOM (the CSS is already bundled) is a clean, non-destructive way to preview a
   state that's impractical to trigger naturally — better than forcing a seed edit.

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. The visual celebrations are now complete (count-up, paw trail,
   particles, jackpot moment). Next is the audio pair: SPEC-026 (mute toggle +
   first-gesture unlock — audio foundation, no sound) then SPEC-027 (the
   tier-scaled Tone.js jingle, including the jackpot howl this scene pairs with).

---

## Verify

**Verdict: ✅ APPROVED**

**Gate results (all exit 0):**
- `just typecheck` — pass
- `just lint` — pass
- `just test` — 181/181 tests passed (27 test files); JackpotMoment.test.tsx contributes 6 tests
- `just build` — production build clean (62 modules, 154 kB JS)

**`just decisions-audit --changed`:** No issues (clean committed working tree).
**`just decisions-audit`:** 16 pre-existing scope-overlap warnings across 12 decisions; none introduced by this spec, all pre-date it.

**Checklist:**

- ✅ **Renders nothing when celebration null / tier small/big/none** — `if (!isJackpot || !visible) return null` at line 23 of JackpotMoment.tsx; tests "renders nothing without a celebration" and "renders nothing for a non-jackpot tier" (iterates small/big/none) verify this; they would fail if the tier gate were absent.
- ✅ **On tier 'jackpot' renders `.jackpot-moment` with 🌕, 🐺, JACKPOT banner, role="status" + aria-label, pointer-events:none** — confirmed in JackpotMoment.tsx lines 25–32; `jackpot.css` line 22 sets `pointer-events: none`; test "renders the jackpot scene on a jackpot" asserts all of these.
- ✅ **Auto-dismiss after JACKPOT_MOMENT_MS** — `setTimeout(() => setVisible(false), JACKPOT_MOMENT_MS)` with `return () => clearTimeout(t)` cleanup; test advances fake timers by `JACKPOT_MOMENT_MS` and checks overlay gone.
- ✅ **Re-show on new jackpot id** — effect is keyed on `[id, isJackpot]`; when id changes from 1→2, effect re-runs, calls `setVisible(true)` + arms new timer; test "re-shows on a new jackpot id" verifies this; the test would fail if the id were missing from the dependency array.
- ✅ **No state-update-after-unmount risk** — `return () => clearTimeout(t)` cleanup cancels any pending timer on unmount or before the next effect run.
- ✅ **Engine unchanged** — `git diff main..HEAD -- src/engine/` is empty (confirmed).
- ✅ **CSS @keyframes use transform/opacity** — 4 keyframe blocks (`jackpot-sky-in`, `jackpot-moon-rise`, `jackpot-wolf-howl`, `jackpot-banner-in`) confirmed in jackpot.css lines 57–76; all use `transform` and/or `opacity`.
- ✅ **@media (prefers-reduced-motion: reduce) block present** — jackpot.css line 78; sets `animation: none` on all four animated elements and explicitly preserves `opacity: 0.92` on sky so the scene remains visible.
- ✅ **No raw hex in jackpot.css** — grep for `#[0-9a-fA-F]{3,8}` returns zero matches; CSS-contract test in the test file also asserts this.
- ✅ **z-index ≥ 20** — `z-index: 20` at jackpot.css line 17.
- ✅ **Only expected files changed** — `git diff --name-only`: `src/ui/App.tsx`, `src/ui/JackpotMoment.tsx`, `src/ui/JackpotMoment.test.tsx`, `src/ui/jackpot.css`, plus 3 project/spec docs (spec, timeline, stage). No package.json change.
- ✅ **No new deps** — `git diff main..HEAD -- package.json` empty.
- ✅ **No bad eslint-disable** — zero `eslint-disable` comments in any new file.
- ✅ **Tests not vacuous** — fake timers used throughout; non-jackpot test iterates all three non-jackpot tiers and unmounts between; re-show test depends on the id key in the dependency array; CSS-contract test reads the actual file on disk.
- ✅ **App.tsx existing tests still pass** — all 4 App.test.tsx tests pass (banner/regions/heading/controls); JackpotMoment returns null in the default render (no celebration prop), so it is invisible to those tests.
- ✅ **Decision drift** — DEC-004 (CSS keyframes, reduced-motion static), DEC-006 (🌕/🐺 emoji art), DEC-010 (token-only CSS, prefixed class names), DEC-001 (fires on engine's jackpot tier only, engine untouched) — all honored. No new DEC emitted; spec says none needed and build confirms.
- ✅ **Build reflection** — honest and specific; notes the one minor ambiguity (tier:'none' in tests), identifies no missing constraints, and concedes the spec was essentially transcription. Not a boilerplate non-answer.
- ✅ **Cost sessions** — design: null-with-note ("main-loop, not separately metered") ✓; build: null-with-note ("orchestrator to fill tokens_total from subagent_tokens at ship") ✓; both are correct per AGENTS §4 until the orchestrator fills them at ship.
- ✅ **portrait-first / perf-60fps** — overlay uses only `transform`/`opacity` keyframes on a handful of elements; fills the ≤430px cabinet via `position: absolute; inset: 0`.

**No punch list items.** Ready to ship.
