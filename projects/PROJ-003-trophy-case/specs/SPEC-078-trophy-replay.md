---
# Maps to ContextCore task.* semantic conventions.

task:
  id: SPEC-078
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
  created_at: 2026-07-24

references:
  decisions:
    - DEC-001   # engine-no-dom: replay re-renders stored data; no engine involvement
    - DEC-004   # CSS-animation approach the reel spin/bounce already uses
    - DEC-010   # design tokens, no raw hex
    - DEC-021   # per-machine identity preserved through the replay
    - DEC-024   # the stored trophy being replayed
  constraints:
    - engine-no-dom
    - respect-reduced-motion
    - portrait-first
    - touch-targets-44
  related_specs:
    - SPEC-075  # TrophyGrid / ReelGrid's existing `spinning` + `trailKey` animation props
    - SPEC-076  # TrophyCard / TrophyRow, which own the replay trigger
    - SPEC-016  # the reel spin/stop animation being reused
    - SPEC-023  # the paw-trail pop this reuses

value_link: >-
  The difference between looking at your best win and watching it happen again — the strongest
  single "more fun, not minimal" lever in the project, built entirely from animation machinery
  that already exists.

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-24
      note: >-
        Design authored on the main Opus loop (un-metered). Key call: replay animates IN THE TROPHY
        CARD, not on the main reels — the record sheet is position:fixed and covers the viewport at
        375px, so a main-reel replay would be literally invisible while the case is open. This also
        makes the stage's "must not collide with a live spin" criterion moot BY CONSTRUCTION rather
        than by guard (documented as a deliberate deviation from the stage file).
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null
      recorded_at: 2026-07-24
      note: >-
        Extracted the state machine into useTrophyReplay.ts (idle/spinning/settled per Notes for
        the Implementer), wired it into the shared TrophyDetail so cards and expanded rows both
        get the replay button for free, and reused the existing prefersReducedMotion() util
        (src/ui/prefersReducedMotion.ts) rather than re-inlining the matchMedia check. Two
        pre-existing TrophyCase tests had to be rescoped to .trophy-row__toggle because the new
        per-card replay button changed the page's button count/order.
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-078: Trophy replay

## Context

The last spec of STAGE-015, and the strongest "lean toward more fun" lever in the project:
tapping a trophy **replays** it — the reels re-spin and drop into that saved grid, the winning
lines light, the paws pop. It is the difference between *looking at* your best win and
*watching it again*.

It is also cheap, because none of the animation is new. `ReelGrid` has accepted `spinning`
(the staggered spin + stop-bounce, SPEC-016/DEC-004) and `trailKey` (the paw pop, SPEC-023)
since long before this project. That machinery has simply never been pointed at stored data.

### Deliberate deviation from the stage file

STAGE-015's success criteria say a replay "does not start while a live spin or auto-spin is
running (and vice versa)" — written assuming replay would drive the **main reels**. That design
does not survive contact with the target form factor: `.stats__sheet` is `position: fixed` with
`max-height: 100dvh`, so at 375px **the sheet covers the reels**. A main-reel replay would be
invisible exactly when it was triggered.

So replay animates **in the trophy card itself**. The collision requirement is then satisfied
*by construction* — a card-local replay cannot touch the live reels, the live hook, or
auto-spin, because it never reaches them. This is a stronger guarantee than the guard the stage
file imagined, and it removes an entire class of state-coordination bugs.

## Goal

Tapping a trophy re-runs its reveal inside its own card — spin, stop, light the winning lines,
pop the paws — reusing `ReelGrid`'s existing animation props, with an instant non-animated
reveal under `prefers-reduced-motion`.

## Inputs

- **Files to read:**
  - `src/ui/trophies/TrophyGrid.tsx` — gains the animation passthrough
  - `src/ui/trophies/TrophyCard.tsx` / `TrophyRow.tsx` / `TrophyCase.tsx` — the trigger owner
  - `src/ui/reels/ReelGrid.tsx` — `spinning` + `trailKey` props (already present)
  - `src/ui/reels/reels.css` — the spin/bounce keyframes + existing reduced-motion block
  - `src/ui/trophies/trophies.css`

## Outputs

- **Files modified:**
  - `src/ui/trophies/TrophyGrid.tsx` — accept + forward `spinning` and `trailKey`.
  - `src/ui/trophies/TrophyCard.tsx` (and/or a small `useTrophyReplay` hook) — replay state.
  - `src/ui/trophies/trophies.css` — replay affordance styling.
  - `src/ui/trophies/TrophyGrid.test.tsx`, `TrophyCase.test.tsx` — updated + new tests.
- **Files created (optional):** `src/ui/trophies/useTrophyReplay.ts` + test, if the state is
  cleaner extracted than inline.

## Acceptance Criteria

- [ ] Every trophy card exposes a **replay control** that is a real `<button>`, keyboard
      operable, with a ≥44px hit area (`touch-targets-44`) and an accessible name naming the
      action (e.g. "Replay this win").
- [ ] Activating it puts that card's grid into a spinning state, and after the reveal delay
      the grid shows the saved grid with its winning cells lit and the paw trail popped.
- [ ] The replay is **card-local**: it does not call the engine, does not touch
      `useSlotMachine`, does not change balance/stats/celebration, and does not affect any
      other trophy's grid. Asserted by a test that replays one card and checks a sibling
      card's grid is unaffected.
- [ ] Replaying a trophy **never mutates stored data** — `topWins` is byte-identical before
      and after a replay.
- [ ] Re-activating during an in-flight replay does not stack timers or leave the grid stuck
      in the spinning state (restart or ignore — pick one and test it).
- [ ] Unmounting mid-replay clears its timer (no state update after unmount).
- [ ] Under `prefers-reduced-motion`, activating replay reveals **instantly** — no spin phase,
      no paw animation — and the control still works (`respect-reduced-motion`).
- [ ] The replay preserves the originating machine's symbols and paylines throughout
      (DEC-021) — the spinning phase must not swap in the active machine's creatures.
- [ ] **No audio.** `src/ui/audio/**` diff empty; the replay is silent.
- [ ] `src/engine/**` diff empty; tokens only, no raw hex; no new dependency.

## Failing Tests

- **`src/ui/trophies/TrophyGrid.test.tsx`**
  - `"forwards spinning to ReelGrid"` — `spinning` true ⇒ the spinning class is present.
  - `"suppresses the winning-cell highlight while spinning"` — pins ReelGrid's existing
    behavior through the trophy wrapper (a stale win must not flash mid-replay).
- **`src/ui/trophies/TrophyCase.test.tsx`** (or a dedicated replay test file)
  - `"a replay control is present on each card and is a real button"`.
  - `"activating replay puts that card's grid into the spinning state"` — with fake timers,
    assert spinning immediately after activation.
  - `"after the reveal delay the grid settles with winning cells lit"` — advance timers;
    assert not spinning and the expected lit-cell count.
  - `"replaying one card does not affect a sibling card's grid"` — **the isolation test.**
  - `"replay does not mutate topWins"` — deep-equal the input array before/after.
  - `"re-activating mid-replay does not leave the grid stuck spinning"` — activate twice,
    advance timers fully, assert settled.
  - `"reveals instantly under prefers-reduced-motion"` — mock `matchMedia` to report reduce;
    assert the grid is never in the spinning state and settles immediately.
  - `"unmounting mid-replay does not warn or update state"` — activate, unmount, advance
    timers, assert no act/state warning.

## Implementation Context

### Decisions that apply

- `DEC-004` — the reel animation is CSS-driven; **reuse the existing keyframes**, do not add a
  JS animation loop.
- `DEC-021` — the originating machine's `symbolDisplay` + `math.paylines` must remain in force
  for the entire replay. `TrophyGrid` already resolves them; do not re-resolve per-frame.
- `DEC-024` — replay is strictly read-only over stored trophies.
- `DEC-001` — no engine involvement whatsoever. The grid is already known; nothing is spun.

### Constraints that apply

- `respect-reduced-motion` — **an instant path is mandatory**, not a nicety: this is a
  decorative animation triggered deliberately by the user.
- `touch-targets-44`, `portrait-first`.

### Out of scope (for this spec specifically)

- Replaying on the main reel grid (see the deviation note — deliberately rejected).
- Any audio, including a replay whoosh. `src/ui/audio/**` untouched.
- Auto-playing a replay (e.g. on open, or on the #1 trophy). Replay is user-initiated only.
- Any change to stored data, the case layout, or the celebration badge.

## Notes for the Implementer

### Reduced motion — detect it, don't just style it

CSS alone is not enough here: the *timing* changes, not only the animation. Read the
preference in JS and branch the state machine:

```ts
const prefersReduced = typeof window !== 'undefined'
  && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
```

Under reduce: skip the spinning phase entirely and go straight to the settled state (still
bump `trailKey` if the paw is static — `reels.css` already renders the paw at its final
opacity under reduced motion). Guard `matchMedia` being undefined — jsdom in some configs
lacks it, and the tests will mock it.

### The replay state machine (keep it small)

```ts
// idle -> spinning -> settled(lit + paw)
const [replaySpinning, setReplaySpinning] = useState(false);
const [replayKey, setReplayKey] = useState(0);
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function replay() {
  if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  setReplayKey((k) => k + 1);           // remounts the paw so the pop replays (SPEC-023 idiom)
  if (prefersReduced) { setReplaySpinning(false); return; }
  setReplaySpinning(true);
  timerRef.current = setTimeout(() => { setReplaySpinning(false); timerRef.current = null; }, REPLAY_MS);
}

useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
```

Clearing the pending timer at the top of `replay()` is what makes re-activation safe (restart
semantics). The cleanup effect is what makes unmount safe. Both are tested.

`REPLAY_MS` should match the live reveal feel — reuse `SPIN_DURATION_MS` from
`useSlotMachine` if importing it is clean, otherwise define a local constant near it in value
and say why. Do **not** import anything else from the hook.

### State lives per-card

Keep replay state inside the individual card/row component so each trophy replays
independently — that is what makes the isolation test pass by construction rather than by
coordination. Do not lift it to `TrophyCase`.

### The control

Put a replay button in the card's detail block (the shared `TrophyDetail` from SPEC-076, so
cards and expanded rows both get it for free). Keep it visually secondary to the win amount —
the trophy is the hero, the replay is an affordance. `aria-label` should name the win it
replays if it is icon-only (e.g. "Replay this win").

### Adversarial guard-mutations for verify

1. Drop the `clearTimeout` at the top of `replay()` ⇒ breaks the re-activation test.
2. Drop the unmount cleanup effect ⇒ breaks the unmount test.
3. Ignore `prefersReduced` and always spin ⇒ breaks the reduced-motion test.
4. Lift replay state to `TrophyCase` (shared across cards) ⇒ breaks the sibling-isolation test.

### Do NOT

- Do not touch `src/engine/**` or `src/ui/audio/**`. **No sound.**
- Do not call the engine or `useSlotMachine`.
- Do not start a dev server or open a preview.
- Do not `git add -A`, `git stash -u`, or `git add src/ui/` broadly.

---

## Build Completion

- **Branch:** `feat/spec-078-trophy-replay`
- **PR (if applicable):** not opened (build cycle only)
- **All acceptance criteria met?** Yes — replay button is a real `<button>` (≥44px hit area
  via `--space-7`, keyboard-operable), activating it spins that card's grid and settles it
  with winning cells lit + paw popped; sibling isolation, no-mutation, re-activation, unmount,
  and reduced-motion behaviors are all covered by tests and pass. `src/engine/**` and
  `src/ui/audio/**` diffs are empty.
- **New decisions emitted:** none — this build follows DEC-001/004/010/021/024 as specified.
- **Deviations from spec:** none beyond the one the spec itself already documents (card-local
  replay instead of driving the main reels). Reused the existing
  `src/ui/prefersReducedMotion.ts` helper instead of re-inlining the `matchMedia` check the
  Notes sketch inline — same behavior, one less duplicate implementation.
- **Follow-up work identified:** none.

### Build-phase reflection (3 questions, short answers)

1. **What was unclear in the spec that slowed you down?** — Nothing major; the state-machine
   sketch in the Notes was close to drop-in. The one open question was whether `trailKey`
   should start non-null (so the paw shows on first mount) — the spec's "after the reveal
   delay ... paw popped" phrasing settled it: `trailKey` starts `null` and only becomes
   non-null once a replay has actually run.
2. **Was there a constraint or decision that should have been listed but wasn't?** — No; the
   existing `respect-reduced-motion` and `touch-targets-44` constraints already covered this
   spec fully, and a shared `prefersReducedMotion()` util already existed to point at.
3. **If you did this task again, what would you do differently?** — I'd grep for existing
   `matchMedia`-mocking test patterns before writing new ones — this repo already has three
   near-identical stub helpers (`ParticleBurst.test.tsx`, `prefersReducedMotion.test.ts`,
   `reduced-motion.contract.test.tsx`); a shared test helper would avoid a fourth copy.

---

## Reflection (Ship)

1. **What would I do differently next time?** —
2. **Does any template, constraint, or decision need updating?** —
3. **Is there a follow-up spec I should write now before I forget?** —
