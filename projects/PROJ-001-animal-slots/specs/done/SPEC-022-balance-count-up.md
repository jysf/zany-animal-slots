---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-022
  type: story
  cycle: ship
  blocked: false
  priority: high
  complexity: M                    # S | M | L  (count-up hook + helper + DEC + wiring)

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
    - DEC-012
  constraints:
    - respect-reduced-motion
    - test-before-implementation
    - one-spec-per-pr
  related_specs:
    - SPEC-019
    - SPEC-021

value_link: "Makes a win *feel* earned: the displayed balance ticks old→new on a win (snapping instantly under reduced motion), the first celebration to consume SPEC-021's one-shot signal."

cost:
  sessions:
    - cycle: design
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 30
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); design cycle (incl. DEC-012)"
    - cycle: build
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 69567
      estimated_usd: 0.46
      duration_minutes: 3.5
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent build (Agent subagent_tokens=69567, 212s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: verify
      agent: claude-sonnet-4-6
      interface: claude-code
      tokens_total: 70803
      estimated_usd: 0.47
      duration_minutes: 3.5
      recorded_at: 2026-06-27
      notes: "Sonnet sub-agent verify (Agent subagent_tokens=70803, 211s). estimated_usd ~= tokens x $6.6/M Sonnet blended, no cache discount (order-of-magnitude, AGENTS §4)."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      duration_minutes: 8
      recorded_at: 2026-06-27
      notes: "main-loop, not separately metered (AGENTS §4); ship cycle (orchestrator squash-merge + bookkeeping; incl. preview count-up check)"
  totals:
    tokens_total: 140370
    estimated_usd: 0.93
    session_count: 5
---

# SPEC-022: Balance count-up

## Context

The second STAGE-004 celebration and the first **consumer** of SPEC-021's
one-shot `celebration` signal. Today, on a win the Status balance snaps from its
pre-win value straight to the new total — legible (SPEC-019 shows the amount) but
flat. This spec animates the displayed balance **ticking up** from the pre-credit
value to the post-win value, so the win reads as coins being added.

A numeric tween cannot be done in testable pure CSS, so the count-up is a small
JS interval tween in a reusable `useCountUp` hook, keyed off `celebration.id` so
it fires exactly once per win (SPEC-021). Its `prefers-reduced-motion` path is
therefore also JS — a tiny `prefersReducedMotion()` helper that makes the hook
snap straight to the target. This JS-tween-with-JS-reduced-motion choice is
recorded in **DEC-012** (a narrow exception to DEC-004's CSS-for-celebrations).

Pure presentation: the count-up reads only the engine-derived `celebration`
(tier/totalWin) and the `balance` — no engine change, no game math (DEC-001).

See `STAGE-004-win-celebration-and-juice.md`, `DEC-012` (the JS-tween decision),
`DEC-004` (celebrations otherwise CSS), `DEC-001`, and SPEC-021 (`celebration`).

## Goal

Animate the Status balance counting up from `balance − totalWin` to `balance`
over a fixed short duration when a win resolves (driven once per `celebration.id`
via a new `useCountUp` hook), and snap instantly to the target on a no-win,
reset, or under `prefers-reduced-motion`.

## Inputs

- **Files to read:** `src/ui/useSlotMachine.ts` (the `celebration` signal,
  SPEC-021), `src/ui/regions/Status.tsx` (+ `Status.test.tsx`), `src/ui/App.tsx`,
  `src/test/setup.ts` (test bootstrap — matchMedia mock goes here),
  `src/engine/index.ts` (`Celebration` re-uses `WinTier`/`LineWin`).
- **Related code paths:** `src/ui/`.

## Outputs

- **Files created:**
  - `src/ui/prefersReducedMotion.ts` — `prefersReducedMotion()` helper
    (defensive `window.matchMedia` check; returns `false` when unavailable).
  - `src/ui/prefersReducedMotion.test.ts` — its tests.
  - `src/ui/useCountUp.ts` — the count-up hook + exported `COUNT_UP_DURATION_MS`.
  - `src/ui/useCountUp.test.tsx` — its tests (fake timers).
- **Files modified:**
  - `src/test/setup.ts` — add a default `window.matchMedia` mock (matches:false)
    so JS reduced-motion checks work in jsdom and tests can override it.
  - `src/ui/regions/Status.tsx` — accept an optional `celebration` prop and render
    the count-up value for balance via `useCountUp`.
  - `src/ui/App.tsx` — thread `celebration` from the hook into `Status`.
- **New exports:** `prefersReducedMotion`; `useCountUp`, `COUNT_UP_DURATION_MS`.
- **Database changes:** none.

## Acceptance Criteria

- [ ] `prefersReducedMotion()` returns `false` by default (matchMedia matches
      false or unavailable) and `true` when `matchMedia('(prefers-reduced-motion:
      reduce)').matches` is true.
- [ ] `useCountUp(target, signal)` (where `signal` is `{ id, amount } | null`)
      returns `target` immediately when `signal` is `null`.
- [ ] On a new `signal` (id not seen before), the hook starts the display at
      `target − amount` and, after advancing `COUNT_UP_DURATION_MS`, the display
      equals `target` (counts up to the exact final value).
- [ ] Mid-tween, the display is strictly between `target − amount` and `target`
      (it actually interpolates — not an instant jump).
- [ ] Under reduced motion (`matchMedia` matches:true), the hook shows `target`
      immediately on a new signal (no tween).
- [ ] When `target` changes while `signal` is `null` (a loss, reset, or bet
      change), the display snaps to the new `target` (no animation).
- [ ] A second, higher `signal.id` re-runs the tween for the new win.
- [ ] Status renders the count-up value; existing Status tests (no `celebration`
      prop → instant) still pass. Engine unchanged; gate exits 0.

## Failing Tests

Written during **design**, BEFORE build. Use `vi.useFakeTimers()`. For
reduced-motion tests, override `window.matchMedia` to return `{ matches: true }`
for the reduced-motion query (restore afterward).

- **`src/ui/prefersReducedMotion.test.ts`**
  - `"returns false by default"` — with the setup's default matchMedia mock,
    `prefersReducedMotion() === false`.
  - `"returns true when the user prefers reduced motion"` — stub
    `window.matchMedia` to return `{ matches: true, … }` → `=== true`.
  - `"returns false when matchMedia is unavailable"` — temporarily delete
    `window.matchMedia` → `=== false` (no throw).

- **`src/ui/useCountUp.test.tsx`** (renderHook + fake timers)
  - `"returns the target when signal is null"` — `useCountUp(1000, null)` → `1000`.
  - `"starts at target − amount on a new signal"` — `useCountUp(1045, { id: 1,
    amount: 55 })` → initial render value `=== 990`.
  - `"counts up to the target after the full duration"` — same hook; `act(() =>
    vi.advanceTimersByTime(COUNT_UP_DURATION_MS))` → value `=== 1045`.
  - `"interpolates mid-tween"` — after advancing roughly half `COUNT_UP_DURATION_MS`,
    value is `> 990` and `< 1045`.
  - `"snaps to target under reduced motion"` — matchMedia matches:true;
    `useCountUp(1045, { id: 1, amount: 55 })` → value `=== 1045` immediately
    (before advancing timers).
  - `"snaps when the target changes with a null signal"` — rerender from
    `(1045, null)` to `(990, null)` → value `=== 990` (a loss/reset; no tween).
  - `"re-animates on a new signal id"` — after completing one tween (id 1), rerender
    with `(1100, { id: 2, amount: 55 })` → starts at `1045`, ends at `1100` after
    the duration.

- **`src/ui/regions/Status.test.tsx`** (extended)
  - `"counts up the balance on a win"` — render `<Status balance={1045} bet={10}
    lastWin={55} celebration={{ id: 1, tier: 'big', totalWin: 55, lineWins: [] }} />`;
    initially the balance readout shows `990`; after advancing
    `COUNT_UP_DURATION_MS` it shows `1045`. (Existing Status tests, which pass no
    `celebration`, must still show the balance instantly.)

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-012` — the count-up is a JS `setInterval` tween and its reduced-motion
  path is a JS snap (`prefersReducedMotion()`); this is the authoritative
  decision for this spec. Implement exactly this shape.
- `DEC-004` — the rest of the celebrations stay CSS; this spec is the documented
  numeric-tween exception, not a precedent for moving other effects to JS.
- `DEC-001` — the count-up reads only `balance` + the engine-derived
  `celebration`; no engine change, no game math in the UI.

### Constraints that apply

- `respect-reduced-motion` — reduced motion snaps to the final value (no tween).
- `test-before-implementation`, `one-spec-per-pr`.

### Prior related work

- `SPEC-021` (shipped) — `celebration: { id, tier, totalWin, lineWins } | null`;
  the count-up keys its tween on `celebration.id` and uses `celebration.totalWin`
  as the count-up amount. First consumer of that signal.
- `SPEC-019` (shipped) — the Status WIN readout / `lastWin`; the balance readout
  this spec animates sits in the same Status region.

### Out of scope (for this spec specifically)

- Animating the WIN readout or any other number — only the **balance** counts up.
- Tier-scaled count-up speed/easing, particles, paw-prints, jackpot moment,
  audio — later STAGE-004 specs.
- Any CSS animation file — this spec adds none (the tween is JS; reduced motion is
  a JS snap, so there is **no** `.css` and therefore no CSS-contract test here).

## Notes for the Implementer

- `prefersReducedMotion.ts`:
  ```ts
  export function prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
  ```
- `src/test/setup.ts` — add (keeps the existing jest-dom import):
  ```ts
  if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
    window.matchMedia = (query: string) => ({
      matches: false, media: query, onchange: null,
      addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
  }
  ```
  Tests that need reduced motion replace `window.matchMedia` with a stub returning
  `matches: true` and restore it afterward (e.g. in `afterEach`).
- `useCountUp.ts`:
  ```ts
  export const COUNT_UP_DURATION_MS = 800;
  const STEP_MS = 40; // ~20 ticks; smooth enough, and fake-timer friendly

  export function useCountUp(
    target: number,
    signal: { id: number; amount: number } | null,
  ): number {
    const [display, setDisplay] = useState(target);
    const lastIdRef = useRef<number | null>(null);
    useEffect(() => {
      // New win to animate?
      if (signal && signal.id !== lastIdRef.current) {
        lastIdRef.current = signal.id;
        if (prefersReducedMotion()) { setDisplay(target); return; }
        const from = target - signal.amount;
        setDisplay(from);
        let elapsed = 0;
        const iv = setInterval(() => {
          elapsed += STEP_MS;
          const t = Math.min(1, elapsed / COUNT_UP_DURATION_MS);
          setDisplay(t >= 1 ? target : Math.round(from + (target - from) * t));
          if (t >= 1) clearInterval(iv);
        }, STEP_MS);
        return () => clearInterval(iv);
      }
      // No new win (loss, reset, bet, or unrelated rerender): snap to target.
      setDisplay(target);
      return undefined;
    }, [signal?.id, target]);
    return display;
  }
  ```
  Keep `target` in the deps so a no-win balance change snaps; the `signal.id !==
  lastIdRef.current` guard prevents the win branch from re-firing when only
  `target` changed mid-tween (it falls through to the snap branch and ends the
  tween — an in-flight count-up interrupted by the next spin simply snaps, which
  is acceptable).
- `Status.tsx`: accept `celebration?: Celebration | null` (import the type from
  `../useSlotMachine`). Compute `const signal = celebration ? { id:
  celebration.id, amount: celebration.totalWin } : null;` and
  `const shownBalance = useCountUp(balance, signal);` Render `shownBalance` in the
  Balance value cell (keep WIN/Bet as-is). With no `celebration` prop, `signal` is
  null → `shownBalance === balance` (instant) so existing tests pass.
- `App.tsx`: pass `celebration={celebration}` to `<Status …>` (destructure
  `celebration` from `useSlotMachine()`).
- The build must emit **no new DEC** — DEC-012 already records the approach (it
  was authored in this design cycle). Just reference it.

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** feat/spec-022-balance-count-up
- **PR (if applicable):** local only (no push per build instructions)
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none — DEC-012 authored at design
- **Deviations from spec:**
  - Removed the inline `// eslint-disable-line react-hooks/exhaustive-deps` comment from `useCountUp.ts` — the `react-hooks/exhaustive-deps` ESLint rule is not configured in this project so the disable comment itself caused a lint error. The deps array `[signal?.id, target]` is intentionally narrowed per the spec's Notes (the `signal.id !== lastIdRef.current` guard prevents re-firing on unrelated rerenders); no functional change.
- **Follow-up work identified:**
  - none beyond the already-listed STAGE-004 backlog specs (paw-print trail, particles, jackpot moment, jingle, mute toggle)

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?**
   — Nothing material. The Notes were extremely complete drop-in code; the only friction was the stray eslint-disable comment that referenced a rule not present in the project's config, which lint caught immediately and was a one-line fix.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No gaps. DEC-012, DEC-004, DEC-001, `respect-reduced-motion`, and `test-before-implementation` all applied cleanly. The absence of `react-hooks/exhaustive-deps` in the ESLint config isn't a missing constraint — the intentional narrow deps are documented in the hook comment.

3. **If you did this task again, what would you do differently?**
   — I'd skip trying to add the eslint-disable comment in the first place (knowing the rule isn't installed), saving one lint/fix cycle. Everything else — the drop-in code from Notes, the fake-timer test structure — worked first-try.

---

## Reflection (Ship)

*Appended during the **ship** cycle.*

1. **What would I do differently next time?**
   — Nothing material. Authoring DEC-012 during *design* (rather than leaving the
   JS-vs-CSS call to the build agent) paid off: the build was a clean drop-in of
   the Notes code, and verify had an authoritative record to check against instead
   of having to judge whether a JS tween violated DEC-004. The `prefersReducedMotion()`
   helper + the `src/test/setup.ts` matchMedia mock are reusable foundations the
   later JS-touching specs can lean on. Preview confirmed the live tick (870→875 on
   a real small win) — exactly the feel intended.

2. **Does any template, constraint, or decision need updating?**
   — No. DEC-012 captured the one genuinely new decision. One reusable artifact
   worth remembering for future specs: the default `window.matchMedia` mock now
   lives in `src/test/setup.ts`, so any later JS reduced-motion check is testable
   out of the box (override to `matches:true` per-test, restore in `afterEach`).

3. **Is there a follow-up spec I should write now before I forget?**
   — No new spec. SPEC-023 (payline paw-print trail) is next, then 024 particles,
   025 jackpot moment, 026 mute/unlock, 027 jingle. The count-up deliberately
   animates only the balance; the WIN readout and other numbers stay instant.

---

## Verify

**Verdict: ✅ APPROVED**

**Gate results (2026-06-27):**
- `just typecheck` — exit 0 (tsc --noEmit clean)
- `just lint` — exit 0 (no ESLint errors or warnings)
- `just test` — exit 0 (160/160 tests passing, 25 test files)
- `just build` — exit 0 (Vite production build, 58 modules)
- `just decisions-audit --changed main` — advisory only; DEC-004, DEC-010, DEC-012 flagged; all expected and consistent (DEC-012 is the documented narrow exception to DEC-004)

**Checklist:**

- ✅ **ACCEPTANCE CRITERIA — all met.**
  - `prefersReducedMotion()` returns `false` by default (setup.ts default mock, matches:false) and `true` when matchMedia returns matches:true; returns `false` when matchMedia is deleted (`(window as any).matchMedia = undefined`) without throwing.
  - `useCountUp(1000, null)` returns `1000` immediately (null-signal test).
  - New signal: starts at 1045−55=990 (confirmed in "starts at target−amount" test); after advancing `COUNT_UP_DURATION_MS` reaches exactly 1045.
  - Mid-tween after `COUNT_UP_DURATION_MS / 2`: value is strictly `> 990` and `< 1045`.
  - Reduced motion: matchMedia mock returns matches:true; hook returns 1045 immediately, no timers advanced.
  - Null-signal target change: rerender (1045,null) → (990,null), value snaps to 990.
  - New signal.id: after tween id=1 completes at 1045, rerender with (1100, {id:2, amount:55}) → starts at 1045, reaches 1100 after full duration.
  - Status "counts up the balance on a win" test: initial render shows 990; after advanceTimersByTime shows 1045. Existing two Status tests (no celebration prop) still pass — 4 Status tests total.

- ✅ **ENGINE UNCHANGED** — `git diff main..HEAD -- src/engine/` is empty. App.tsx imports `useSlotMachine` (UI hook); Status.tsx imports `Celebration` type from `../useSlotMachine`; neither imports engine internals.

- ✅ **DEC-012 HONORED** — `useCountUp.ts` uses `setInterval` (not CSS, not rAF). `prefersReducedMotion()` is a JS `window.matchMedia` check. No `.css` file added in diff (confirmed `git diff --name-only | grep .css` returned empty). DEC-012 is the explicit documented exception to DEC-004.

- ✅ **NO SCOPE CREEP / NO NEW DEPS** — Only the 11 files in the diff changed; `package.json` unchanged; no engine files or regions outside Status/App touched.

- ✅ **TESTS NOT VACUOUS** — Count-up tests advance fake timers and assert concrete values: 990 start, 1045 end, mid-tween strictly between. The reduced-motion test would fail if the snap branch were absent (without it, the tween runs and the hook would still be at 990 initially, failing the === 1045 assertion). The matchMedia-unavailable test would throw without the defensive `typeof window.matchMedia === 'function'` guard.

- ✅ **REDUCED-MOTION CORRECTNESS** — `prefersReducedMotion.test.ts` captures `originalMatchMedia` at describe-scope and restores it in `afterEach`. `useCountUp.test.tsx` also restores `window.matchMedia = originalMatchMedia` in `afterEach`. No test leakage.

- ✅ **EFFECT DEPS** — Deps are `[signal?.id, target]`. Win branch is guarded by `signal.id !== lastIdRef.current` (fires once per id). `target` in deps means a no-win balance change (signal null, target shifts) re-runs the effect → falls to snap branch. In-flight interrupt: when signal goes null, effect re-runs, previous cleanup `clearInterval(iv)` fires first, then snap branch executes — correct behavior, no dangling interval.

- ✅ **DECISION DRIFT** — `just decisions-audit --changed main` flags DEC-004 (expected; DEC-012 documents the exception), DEC-010 (CSS styling decision; no CSS added), DEC-012 (new, matches implementation exactly). DEC-012's `affected_scope` correctly lists `src/ui/useCountUp.ts` and `src/ui/prefersReducedMotion.ts`. No undocumented non-trivial choices.

- ✅ **BUILD REFLECTION** — Honest and specific: notes the stray eslint-disable comment for a rule not installed (`react-hooks/exhaustive-deps`) caused a lint error and was removed. The final code has no dangling eslint-disable (confirmed by reading `useCountUp.ts` — no disable comments at all).

- ✅ **COST** — Build session has `tokens_total: null` with "orchestrator to fill tokens_total from subagent_tokens at ship" note, consistent with AGENTS §4 and the metered-cycle pattern. Verify session added by this cycle (same pattern).

**Reviewer:** claude-sonnet-4-6 (cold session, 2026-06-27)
