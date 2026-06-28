---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-004                     # stable, zero-padded within the project
  status: shipped                   # proposed | active | shipped | cancelled | on_hold
  priority: high                    # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-001                      # parent project
repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: 2026-06-27

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    Completes the "animation-heavy slot game" half of the thesis and is the
    sharpest dogfood test: the celebratory feel work (juice + the one shipping
    audio piece) is exactly the subjective, non-CRUD work the template's
    design→build→verify→ship cycle has never been exercised against.
  delivers:
    - "The three win celebrations — small, big, and jackpot — as distinct, reachable states."
    - "Payline paw-print trail and particle effects (leaves / acorns)."
    - "The wolf jackpot moment (howl visual + moon scene) and a balance count-up."
    - "A tier-scaled synthesized win jingle (Tone.js) keyed off the engine's existing win-tier output, with a global mute toggle and first-gesture audio unlock."
  explicitly_does_not:
    - "Build the full audio suite — ambient bed, complete SFX set, dynamic mixing are STAGE-005 / PROJ-002."
    - "Add any engineered near-miss or faked anticipation; celebrations reflect only what actually landed."
    - "Do the formal a11y / contrast / colorblind / perf audit (STAGE-005)."
---

# STAGE-004: Win celebration & juice

## What This Stage Is

The payoff. This stage makes winning *feel* like winning. Building on
STAGE-003's playable spin, it adds the three celebration states — small, big,
and jackpot — each visually distinct: a payline paw-print trail tracing the
winning line, particle effects (leaves / acorns), a balance count-up, and the
showpiece wolf jackpot moment (howl + moon scene) on the five-Wolf 200× hit.
It also ships the **one** piece of audio that belongs in a core stage: a
tier-scaled synthesized win jingle (Tone.js) keyed off the engine's existing
win-tier classification — a short arpeggio for small, a longer flourish for
big, a triumphant run for jackpot — gated behind a global mute toggle and a
first-gesture audio unlock. Everything else audio-related is STAGE-005 /
PROJ-002. When this stage ships, all five game states are reachable and
visually (and, for wins, audibly) distinct.

## Why Now

STAGE-003 made the slot playable but the win feedback is intentionally flat: a
win just makes the balance jump, with only a basic cell highlight and no sense of
*how much* you won or *what pays*. This stage makes winning legible and felt. It's
activated now to answer two concrete gaps first — **showing the win amount** and a
**paytable sheet** — and it's the project's sharpest dogfood test: subjective
"juice" is exactly the non-CRUD work the design→build→verify→ship cycle has never
been exercised against. The engine's `tier`, `lineWins`, and `totalWin` outputs
(plus the exported `PAYTABLE`/`SYMBOL_TIER`) are the data this stage presents — no
new game math.

## Success Criteria

- On a winning spin the player sees **how much they won** — a prominent win-amount
  indicator (a pop-up over the reels) and a persistent last-win readout — both
  driven by the engine's `totalWin`/`lineWins`; cleared on the next spin.
- A **paytable** is available on demand (an "ℹ Paytable" control opens a slide-up
  sheet) listing each tier's 3/4/5-of-a-kind payouts read from the engine's
  `PAYTABLE`/`SYMBOL_TIER` — accurate to what actually pays, closable, and
  keyboard/`Esc` accessible.
- The three win celebrations — small / big / jackpot — are reachable and visually
  distinct (paw-print trail, tier-scaled particles, the wolf jackpot moment, balance
  count-up).
- A tier-scaled synthesized win jingle (Tone.js, DEC-007) keyed off the engine's
  win tier, gated behind a global persisted mute + first-gesture unlock
  (`audio-gesture-and-mute`); celebrations have a non-animated path under
  `prefers-reduced-motion`.
- Everything keys off symbols that **actually landed** — no engineered near-miss or
  faked anticipation (project taste note).
- UI consumes the engine only via `src/engine/index.ts`; no engine change; behavior
  unit-tested (RTL) and verified in the preview.

## Scope

### In scope
- **Win-amount display** (this stage's first spec): pop-up badge over the reels +
  a persistent last-win readout, from `totalWin`.
- **Paytable sheet** (second spec): a toggle-opened slide-up overlay listing tier
  payouts from `PAYTABLE`/`SYMBOL_TIER`, with the symbols' emoji.
- Win-state routing (small/big/jackpot) and the celebrations: paw-print payline
  trail, tier-scaled particles (leaves / acorns), balance count-up, wolf jackpot
  moment (howl + moon scene).
- The single tier-scaled synthesized win jingle (Tone.js) + global persisted mute +
  first-gesture audio unlock.
- A `prefers-reduced-motion` path for the celebrations.

### Explicitly out of scope
- The full audio suite — ambient bed, complete SFX set, dynamic mixing (STAGE-005 /
  PROJ-002).
- Any engineered near-miss / faked anticipation.
- The formal a11y / contrast / colorblind / perf audit (STAGE-005).
- Any change to engine logic, the paytable values, or reel weights (those are
  DEC-011; the UI only *displays* them).

## Build order note (current slice)

The user asked for win-legibility first, so the backlog leads with **SPEC-019
(win-amount display)** then **SPEC-020 (paytable sheet)** — both pure presentation
of existing engine outputs, independent of the heavier celebration/audio work that
follows. This slice ships, then the stage pauses for review before the celebration
specs.

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.

Format: `- [status] SPEC-ID (cycle) — one-line summary`

- [x] SPEC-019 (shipped 2026-06-27) — **Win-amount display**: show `totalWin` on a win — a pop-up badge over the reels + a persistent last-win readout. **[M]**
- [x] SPEC-020 (shipped 2026-06-27) — **Paytable sheet**: an "ℹ Paytable" button opens a slide-up overlay listing each tier's 3/4/5 payouts (engine `PAYTABLE`/`SYMBOL_TIER` + emoji); ✕/backdrop/Esc close. **[M]**
- [x] SPEC-021 (shipped 2026-06-27) — **Win-state router**: a one-shot `celebration` signal from `useSlotMachine` (monotonic `id` per resolved win, carrying tier/totalWin/lineWins; `null` on a no-win) so celebrations fire once per win. **[S]**
- [x] SPEC-023 (shipped 2026-06-27) — **Payline paw-print trail**: a 🐾 pops onto each winning cell, staggered reel 0→N (CSS keyframe via `--reel-index`, reduced-motion static), keyed off SPEC-021's `celebration` so it replays each win. **[M]**
- [x] SPEC-024 (shipped 2026-06-27) — **Win particle burst**: leaves 🍂 / acorns 🌰 erupt over the reels on a win, count scaled by tier (small 10<big 20<jackpot 32); CSS `particle-fly` keyframe, renders nothing under reduced motion, keyed off `celebration`. **[M]**
- [x] SPEC-022 (shipped 2026-06-27) — **Balance count-up**: the displayed balance ticks old→new on a win (JS interval tween via `useCountUp`, keyed off SPEC-021's `celebration`; snaps under reduced motion — DEC-012). **[M]**
- [x] SPEC-025 (shipped 2026-06-27) — **Wolf jackpot moment**: full-cabinet night-sky + rising moon 🌕 + howling wolf 🐺 + JACKPOT banner on the five-Wolf hit; CSS keyframes (reduced-motion static), auto-dismiss, keyed off `celebration.tier === 'jackpot'`. **[M]**
- [x] SPEC-027 (shipped 2026-06-27) — **Tier-scaled win jingle**: a synthesized Tone.js jingle keyed off the engine win tier (short arpeggio / flourish / triumphant run), gated by mute + first-gesture unlock; adds the `tone` dep (DEC-007-authorized). **[M]**
- [x] SPEC-026 (shipped 2026-06-27) — **Mute toggle + audio unlock**: audio FOUNDATION (no sound) — `useAudio` ({ muted, toggleMute, unlocked }), persisted mute (localStorage `mute`), first-gesture unlock, a 🔊/🔇 MuteToggle in the header (constraint `audio-gesture-and-mute`, DEC-007). **[S]**

**Count:** 9 shipped / 0 active / 0 pending — **backlog COMPLETE** (run Prompt 1d Stage Ship). **Initial slice (DONE):**
SPEC-019 (win amount) + SPEC-020 (paytable sheet) first, then pause; the
celebration/audio specs follow later.

## Design Notes

The jingle is **keyed off the engine's existing win-tier output** — no new game
math, no faked closeness. Per the project's taste note, anticipation/celebration
must be driven by symbols that actually landed; engineered near-misses are out
even with play money. Audio must respect the browser autoplay policy (no sound
before a user gesture) and the always-available, persisted mute
(`audio-gesture-and-mute`), and celebrations need a non-animated feedback path
for reduced motion (`respect-reduced-motion`).

## Dependencies

### Depends on
- STAGE-003 — the spin flow and the engine's win-tier output that celebrations key off.

### Enables
- STAGE-005 — the full audio suite and polish build on this stage's jingle and juice.

## Stage-Level Reflection

*Shipped 2026-06-27. All nine specs (SPEC-019 … SPEC-027) in `specs/done/`.*

### Success criteria — did we deliver?

All six met:
- ✅ **Win amount is legible** — a pop-up `WIN +N` badge over the reels plus a
  persistent Status WIN readout, both from the engine's `totalWin` (SPEC-019);
  cleared on the next spin.
- ✅ **Paytable on demand** — the "ℹ Paytable" slide-up sheet lists each tier's
  3/4/5 payouts from `PAYTABLE`/`SYMBOL_TIER`, ✕/backdrop/Esc closable (SPEC-020).
- ✅ **Three distinct win celebrations** — small/big/jackpot are reachable and
  visually distinct: paw-print trail (SPEC-023), tier-scaled particle burst
  (SPEC-024, 10/20/32), balance count-up (SPEC-022), and the full-cabinet wolf
  jackpot moment (SPEC-025). All routed by the one-shot `celebration` signal
  (SPEC-021) so each fires exactly once per win.
- ✅ **Tier-scaled win jingle** — synthesized Tone.js (DEC-007), keyed off the
  engine win tier, gated behind a persisted mute + first-gesture unlock
  (SPEC-026/027); celebrations have a `prefers-reduced-motion` path (count-up snaps,
  particles render nothing, paw/jackpot scenes go static).
- ✅ **Only what landed** — every celebration keys off real engine output
  (`tier`/`totalWin`/`lineWins`); no engineered near-miss or faked anticipation.
- ✅ **Engine untouched, behavior-tested** — `git diff main -- src/engine/` empty
  across all nine specs; 203 RTL/unit tests green; each UI spec verified in the
  preview (count-up tick, paws, particles, the injected jackpot scene, the mute
  toggle persisting across reload, the jingle path running error-free).

### value_contribution — delivered as claimed?

Yes, and this was the stage the `value_contribution` cared most about — the
subjective "juice" + the one audio piece, the work the design→build→verify→ship
cycle had never been exercised against. All four `delivers` items landed (the three
celebrations as distinct reachable states; paw trail + particles; the wolf jackpot
moment + count-up; the tier-scaled jingle with mute + unlock). The
`explicitly_does_not` items held: no full audio suite (only the win jingle), no
faked anticipation, and no formal a11y/contrast/perf audit (still STAGE-005). No
spec's `value_link` over-claimed — every one traced to a visible/audible win-feel
improvement.

### 3-sentence summary

Built nine specs — the two requested legibility pieces first (win amount, paytable),
then a deliberate foundation-first celebration arc: a one-shot `celebration` signal
(SPEC-021) that every subsequent celebration consumes via `useEffect([celebration?.id])`,
then count-up → paw trail → particles → jackpot moment → audio gate → jingle. It ran
smoothly and a touch faster per spec than STAGE-003 once the signal existed (each
celebration became a small additive overlay/effect rather than new plumbing), and
the "juice resists TDD" risk was sidestepped the same way as STAGE-003 — test
*state* (fire-once, gating, tier-scaling, reduced-motion) and *preview the feel*. The
one genuinely new pattern was JS-side animation where CSS can't reach (the numeric
count-up, DEC-012) with a JS reduced-motion snap, which also seeded a reusable
`prefersReducedMotion()` + a `matchMedia` test mock for future effects.

### Stage-Level Reflection answers

- **Did we deliver the outcome in "What This Stage Is"?** Yes — winning now *feels*
  like winning: the amount is legible, the line that paid is traced, the board bursts,
  the balance ticks up, the rarest hit takes over the cabinet with a moon-and-howl
  scene, and (unmuted, post-gesture) a tier-scaled jingle plays. All five game states
  are reachable and visually — and for wins, audibly — distinct.
- **How many specs did it actually take?** Nine, exactly as framed at Stage Frame
  (the 2-spec legibility slice + the 7 celebration/audio specs). No splits, one
  addition that wasn't a spec: DEC-012.
- **What changed between starting and shipping?** Nothing in scope. The build order
  was made explicit (router signal before its consumers; audio foundation before the
  jingle), which kept each celebration spec tiny. SPEC-022 was honestly resized S→M
  once it pulled in a hook + helper + DEC + test-setup mock.
- **Lessons that should update AGENTS.md, templates, or constraints?** Two recurring
  build-agent frictions are worth a template note (logged as dogfood findings #12/#13
  in `/feedback/`): this repo has **no `react-hooks` ESLint plugin** (agents add
  invalid `exhaustive-deps` disables) and **no `@testing-library/user-event`** (agents
  reach for `userEvent`, must fall back to `fireEvent`). Both always self-corrected
  and never reached `main`, but a one-line heads-up in UI build prompts (the
  orchestrator added these mid-stage) removes the wasted lint/typecheck loop. Also
  worth promoting: pre-authorizing a dependency in a DEC *before* the build needs it
  (DEC-007 → `tone`) let the build add it with no stop-and-ask — the clean answer to
  dogfood finding #10.
- **Should any spec-level reflections be promoted to stage-level lessons?** Yes, two:
  (a) **"signal first, consumers second"** — a one-shot, id-keyed engine-derived
  signal (`celebration`) turns N celebration specs into small independent effects that
  each fire exactly once; it's the reusable shape for event-driven UI feel. (b)
  **verify-by-injection for unreachable states** — the jackpot moment (≈1-in-millions
  naturally) was preview-verified by injecting the component's real markup into the
  live DOM (CSS already bundled), and the Tone jingle's gating/tier-scaling were
  unit-tested via an injected player + a mocked `tone`; both are dependable ways to
  prove states you can't easily trigger or hear.

### Follow-up flags

- **Next stage:** STAGE-005 (audio suite, a11y, polish) is the natural successor — it
  builds on this stage's jingle + `useAudio` gate and the reduced-motion paths, and
  owns the formal a11y/contrast/colorblind/perf audit deliberately deferred here.
- **Small deferrable polish (note for STAGE-005, not blocking):** the centered
  `WinBadge` (z-10) can overlap paw prints on middle-row wins — a layering tweak; and
  tier-scaled celebration *intensity* (badge color by `--color-win-small/-big/-jackpot`,
  count-up easing) could deepen the small/big distinction. A connecting line/SVG path
  between paw prints was explicitly deferred (v1 is per-cell paws).
- **Perf:** `tone` roughly doubled the bundle (~385 KB JS / ~109 KB gz) — expected and
  DEC-007-authorized; STAGE-005's perf pass should confirm the 60fps target still
  holds with the celebration layers + audio.
- No engine work deferred; nothing punted to a future project from STAGE-004.

### Proposed template / guidance updates (for review — not yet applied)

- Add to UI build-prompt boilerplate: "this repo uses `fireEvent` (no
  `@testing-library/user-event`) and has no `react-hooks` ESLint plugin — don't add
  `exhaustive-deps` disables." (Findings #12/#13.)
- Consider enumerating `perf-60fps` in animation specs' `references.constraints`
  (carried over from STAGE-003's note; honored throughout — transform/opacity only).
- No constraint/DEC changes required; DEC-012 (count-up JS-tween exception to DEC-004)
  is the only new decision this stage emitted.
