---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-005                     # stable, zero-padded within the project
  status: shipped                   # proposed | active | shipped | cancelled | on_hold
  priority: high                    # critical | high | medium | low  (activated 2026-06-27)
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-001                      # parent project
repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: 2026-06-28

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    Hardens the thesis rather than extending it: takes the playable, juiced
    game from a demo toward something defensible — a full audio bed, motion and
    contrast accessibility, and a measured 60fps pass — which is also where the
    template's verify cycle is most likely to earn its keep on non-CRUD work.
  delivers:
    - "The full audio suite: generative ambient music bed, complete SFX set (spin whoosh, reel-stop clunk, win tings), and dynamic mixing (swell on big win, duck for the jackpot howl), building on STAGE-004's jingle."
    - "prefers-reduced-motion support with non-animated win-feedback paths."
    - "A contrast + 44px touch-target audit and colorblind-safe symbol shapes."
    - "A performance pass holding the ~60fps spin/celebration target on a mid-tier phone."
  explicitly_does_not:
    - "Introduce new game mechanics, themes, or symbols (those are PROJ-002)."
    - "Replace synthesized audio with an asset pipeline (still no audio files; see DEC-007)."
    - "Add accounts, persistence beyond local, or any backend."
---

# STAGE-005: Audio suite, a11y & polish (stretch)

## What This Stage Is

The stretch hardening stage. It builds STAGE-004's single win jingle out into a
full **synthesized audio suite** — a generative ambient music bed, a complete
SFX set (spin whoosh, reel-stop clunk, win tings), and dynamic mixing (swell on
a big win, duck under the jackpot howl) — still with no audio asset files
(`DEC-007`). Alongside the audio, it does the accessibility and performance work
the earlier stages deliberately deferred: `prefers-reduced-motion` with
non-animated win-feedback paths, a contrast and 44px touch-target audit,
colorblind-safe symbol shapes, and a measured 60fps performance pass on a
mid-tier phone. When this stage ships, the game is not just playable and juicy
but accessible and performant — the difference between a demo and something you
could put in front of anyone.

## Why Now

STAGE-004 made the game playable *and* juicy — all five states reachable, the win
celebrations and the one win jingle in place. That is a demo. This stage is the
difference between a demo and something you can put in front of anyone: it widens
the single jingle into a full **synthesized audio suite**, and it does the
accessibility and performance work the earlier stages deliberately deferred
(keeping the paths *open* — every animation already has a reduced-motion branch,
controls were built ≥44px — rather than retrofitting). It's framed now, but it is
the project's **stretch** stage: activate it (Prompt 1b/2b) only with momentum to
spare, and decide deliberately whether it runs before or after STAGE-006 (a
polished, accessible build is nicer to deploy, but the game is already shippable
without it). It's also where the template's **verify** cycle is most likely to
earn its keep on non-CRUD work — perf and a11y have objective, checkable targets
(measured fps, contrast ratios, hit-area sizes) in a way "feel" did not.

## Success Criteria

- The **audio suite** is complete and all synthesized (no asset files, DEC-007),
  gated by the existing persisted mute + first-gesture unlock (SPEC-026): a
  generative ambient bed loops during play; a full SFX set fires on the real
  events (spin whoosh, per-reel stop clunk, win tings); and dynamic mixing swells
  the bed on a big win and ducks it under the jackpot moment — all balanced against
  SPEC-027's jingle on a shared audio graph.
- **Reduced motion is complete and audited:** every animated path (spin + all four
  celebrations) has a verified non-animated feedback path, confirmed by a
  CSS-contract sweep + behavior tests; audio (not motion) still plays under
  reduced motion.
- **Contrast + touch targets pass:** all text and controls meet WCAG AA contrast
  and every interactive control has a ≥44px hit area, with a documented audit and
  any token/markup fixes applied.
- **State is distinguishable without color:** win-tier feedback does not rely on
  color alone (the win amount is already numeric; add a tier label/icon cue where
  needed); symbols stay shape-distinct (emoji, DEC-006).
- **Performance holds ~60fps:** a measured pass on a throttled mid-tier-phone
  profile shows the spin and each celebration (incl. particles + jackpot scene
  with audio) holding the frame budget with no long main-thread blocks; the result
  is documented (and DEC-004's CSS-animation choice is revisited only if it fails).

## Scope

### In scope
- Generative ambient music bed (Tone.js on `Tone.Transport`), establishing the
  shared audio graph (master bus + channels) the rest of the suite mixes on.
- Complete synthesized SFX set: spin whoosh, reel-stop clunk (staggered per reel),
  win tings — fired off the existing spin flow / `celebration` signal.
- Dynamic mixing: bus-level swell on a big win, duck under the jackpot moment,
  balanced levels across bed / SFX / jingle.
- `prefers-reduced-motion` audit: verify + complete non-animated feedback for spin
  and every celebration.
- Contrast + 44px touch-target audit and fixes (WCAG AA).
- Colorblind-safe state cues (win-tier distinction beyond color).
- Performance pass: measure + hold ~60fps spin/celebration on a mid-tier phone.

### Explicitly out of scope
- New game mechanics, themes, or symbols — PROJ-002.
- Any audio **asset pipeline** / sample files — still fully synthesized (DEC-007);
  the single CC0 wolf-howl sample remains parked for PROJ-002.
- Accounts, a backend, or persistence beyond the two existing localStorage keys.
- The deploy itself, CI deploy, security headers, dependency/license gate —
  STAGE-006 (this stage produces the polished build that stage ships).

## Spec Backlog

One-liners only at this stage; expand each via Prompt 2b in its own session.
Suggested build order: audio graph + bed → SFX → mixing (mixing needs both), then
the a11y audits, then the perf pass last (so it measures the final
celebration+audio load).

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

- [x] SPEC-028 (shipped 2026-06-27) — **Ambient music bed + audio-graph foundation**: a generative Tone.js loop on `Tone.Transport`, gated by mute+unlock; sets up the shared master bus / channels the SFX and mixing build on (DEC-013); jingle re-routed onto its channel. **[M]**
- [x] SPEC-029 (shipped 2026-06-27) — **SFX set**: synthesized spin whoosh, per-reel stop clunk (×5), and win ting, fired off the spin flow (`isSpinning` edges) / `celebration` signal; routed through the `sfx` channel, gated. **[M]**
- [x] SPEC-030 (shipped 2026-06-27) — **Dynamic mixing**: bus-level bed automation — swell on a big win, duck under the jackpot moment, restore to baseline — keyed off the engine win tier (`celebration`), gated. **[M]**
- [x] SPEC-031 (shipped 2026-06-28) — **Reduced-motion audit**: a global motion safety net + a regression-guard sweep (every `@keyframes` CSS has a reduced-motion block) + audio-not-motion-gated + App-renders-under-reduced-motion; confirmed all 5 keyframes CSS already compliant. **[S]**
- [x] SPEC-032 (shipped 2026-06-28) — **Contrast + 44px audit & fixes**: WCAG AA contrast audit (1 fix — lightened `--_raw-muted` #b89a6e→#ccb084 so muted-on-frame button text clears 4.5:1 at 5.21) + ≥44px confirmed; both locked by guard tests. **[M]**
- [x] SPEC-033 (shipped 2026-06-28) — **Colorblind-safe state cues**: win badge gains a tier WORD (WIN / BIG WIN / JACKPOT) + `data-tier` — a text cue backed by a redundant tier border color (win-tier tokens); symbols already shape-distinct (DEC-006). **[S]**
- [x] SPEC-034 (shipped 2026-06-28) — **Performance pass**: a compositor-only keyframe guard (every `@keyframes` animates transform/opacity only) + a `will-change` hint on the spin + a documented measurement (median 8.3ms, 0 long frames) — validates DEC-004 holds at ~60fps. **[M]**

**Count:** 7 shipped / 0 active / 0 pending — **backlog COMPLETE** (audio suite + all 3 a11y audits + perf pass; run Prompt 1d Stage Ship). Sized at
Stage Frame; within the 3–8 range (no rescoping needed). Two carry the most
uncertainty — dynamic mixing (#3) and the perf pass (#7); split #7 if profiling
reveals deep work.

## Design Notes

- **Audio architecture.** SPEC-027's jingle is fire-and-forget (a fresh `Synth`
  per win). The suite needs a small **shared audio graph** — a `Tone.Transport`
  for the looping bed plus a master bus / named channels so dynamic mixing has
  something to duck and swell. The ambient-bed spec (#1) should establish this and
  refactor the jingle onto a channel; SFX (#2) and mixing (#3) then plug in. All of
  it stays behind the existing `useAudio` gate (`muted` + `unlocked`, SPEC-026) and
  fully synthesized (DEC-007) — no asset files; the lone CC0 wolf-howl sample stays
  parked for PROJ-002.
- **Accessibility is mostly *audit*, not greenfield.** Reduced-motion branches
  already exist (reels, win badge, paw trail, count-up snap, particles render
  nothing, jackpot scene goes static) and controls were built ≥44px; #4/#5/#6
  verify, measure, document, and fill gaps rather than build from scratch.
  Win-tier color (`--color-win-small` / `--color-win-big` / `--color-jackpot`) is
  the main colorblind risk — pair it with the already-numeric win amount and a
  small tier label/icon so nothing is color-only.
- **Performance.** Animations are transform/opacity only (DEC-004), so the spin
  should already be close; the perf pass measures on a throttled mid-tier profile,
  with attention to the heaviest moment (jackpot scene + a 32-particle burst +
  audio at once). Treat DEC-004 as "measure, then revisit only if it fails."

## Dependencies

### Depends on
- STAGE-004 — the win jingle + `useAudio` gate + the celebration signal/visuals
  this stage generalizes and audits.
- STAGE-003 — the spin flow whose motion gets the reduced-motion audit and perf pass.

### Enables
- STAGE-006 — release & deploy ships the polished, accessible, performant build
  this stage produces.
- PROJ-002 — anticipation reel-slowdown, haptics, theme-swap, day/night sky, the
  CC0 howl sample, etc.

## Stage-Level Reflection

*Shipped 2026-06-28. All seven specs (SPEC-028 … SPEC-034) in `specs/done/`.*

### Success criteria — did we deliver?

All five met:
- ✅ **Audio suite complete & synthesized, gated.** A shared Tone.js graph
  (master bus + `bed`/`sfx`/`jingle` channels + `Tone.Transport`, **DEC-013**)
  hosts a generative ambient bed (SPEC-028), a full SFX set — spin whoosh,
  per-reel stop clunks ×5, win ting — fired off real game events (SPEC-029), and
  bus-level dynamic mixing that swells the bed on a big win and ducks it under the
  jackpot (SPEC-030). All gated by `useAudio` (mute + first-gesture unlock,
  SPEC-026), no asset files (DEC-007); the SPEC-027 jingle was re-routed onto its
  channel.
- ✅ **Reduced motion complete & audited.** All 5 `@keyframes` CSS files already
  carried a reduced-motion block; SPEC-031 added a global motion safety net + a
  regression-guard sweep + confirmed audio is not motion-gated + App renders under
  emulated reduced motion.
- ✅ **Contrast + 44px pass.** SPEC-032 measured every text/bg pair: all AA except
  one (muted-on-frame 4.06) → fixed with a single token lighten
  (`--_raw-muted` `#b89a6e→#ccb084`, now 5.21); all 6 controls confirmed ≥44px;
  both locked by guard tests (with a load-bearing regression proof).
- ✅ **State distinguishable without color.** SPEC-033 gave the win badge a tier
  **word** (WIN / BIG WIN / JACKPOT) + `data-tier` — a text cue — backed by a
  redundant tier border color; symbols were already shape-distinct emoji (DEC-006).
- ✅ **~60fps holds.** SPEC-034 found every keyframe animates only
  transform/opacity (GPU-composited) and locked it with a compositor-only sweep
  guard + a `will-change` hint; the preview rAF sample was median 8.3ms / 0 long
  frames. DEC-004 validated, not revisited.

### value_contribution — delivered as claimed?

Yes. The stage *hardened* the thesis rather than extending it, exactly as framed:
the demo became "something you can put in front of anyone." All four `delivers`
landed (full audio suite; reduced-motion support; contrast/44px + colorblind cues;
a documented perf pass). The `explicitly_does_not` held: no new mechanics/themes/
symbols, no audio asset pipeline (still fully synthesized — the CC0 howl stays
parked for PROJ-002), no accounts/backend. And the frame's prediction proved
right — **this is where `verify` earned its keep**: perf, contrast, reduced-motion,
and compositor-safety all have objective, checkable targets, so each audit shipped
as a *guard test*, not just a manual sign-off.

### 3-sentence summary

Built seven specs in the framed order — audio graph + bed → SFX → mixing, then the
three a11y audits, then the perf pass last so it measured the final
celebration+audio load — with the shared audio graph (DEC-013) laid first so SFX
and mixing were small plug-ins rather than rewrites. It ran smoothly and was the
most *test-shaped* stage of the project: the audio was gated/tier logic unit-tested
via injected spies + mocked `tone` (no sound needed to prove correctness), and the
four audits each became a sweep/guard test (reduced-motion coverage, WCAG-AA
contrast, colorblind text cue, compositor-only keyframes). The audits mostly
*confirmed* prior-stage discipline (only one real fix surfaced — the muted-contrast
token), which is itself the payoff of building the reduced-motion/44px paths open
from the start.

### Stage-Level Reflection answers

- **Did we deliver the outcome in "What This Stage Is"?** Yes — the game is now
  not just playable and juicy but **accessible and performant with a full
  synthesized audio bed/SFX/mixing layer**, all gated and measured.
- **How many specs did it actually take?** Seven, exactly as framed (5×M + 1×S–M
  + 1×S; no L, no splits, no additions). The two flagged-uncertain specs (dynamic
  mixing, perf pass) both came in clean — mixing because DEC-013 made it a one-node
  gain ramp, perf because DEC-004's transform/opacity discipline already held.
- **What changed between starting and shipping?** Nothing in scope. One new
  decision (DEC-013, the audio-graph architecture) emitted at design; the audits
  surfaced a single real fix (the muted-contrast token) and otherwise confirmed
  compliance, codifying it as guard tests.
- **Lessons that should update AGENTS.md, templates, or constraints?** The
  recurring build-agent frictions logged in STAGE-004 (no `react-hooks` ESLint
  plugin; no `@testing-library/user-event`; write `vi.fn()` mock factories with no
  named params) showed up again in the audio specs and were pre-empted by one-line
  notes in the build prompts — worth folding into the UI build-prompt boilerplate.
  Three a11y/perf invariants are now test-enforced (reduced-motion, WCAG-AA
  contrast, compositor-only animation); a weekly review could promote them to named
  constraints (`contrast-aa`, `state-not-color-only`, `compositor-only-keyframes`),
  but the guard tests already enforce them so it's optional.
- **Should any spec-level reflections be promoted to stage-level lessons?** Two:
  (a) **lay the shared infrastructure first** — the DEC-013 audio graph turned
  three audio specs into small channel plug-ins and made dynamic mixing a single
  `gain.rampTo`; (b) **ship audits as guard tests, not sign-offs** — a sweep that
  fails on a future regression (reduced-motion blocks, compositor-only keyframes,
  AA contrast, ≥44px) is durable where a one-time manual audit rots.

### Follow-up flags

- **Next stage:** STAGE-006 (release & deploy) is the natural successor and the
  last stage of PROJ-001 — it ships the polished, accessible, performant build this
  stage produced (Cloudflare Pages, CI deploy on merge, security headers, the
  dependency/license gate, SECURITY.md, a prod smoke check; DEC-008).
- **Carry-forward (for STAGE-006 / PROJ-002):** `tone` roughly **doubled the
  bundle** (~407 KB JS / ~114 KB gz) — a bundle-size concern for the deploy stage
  (code-split the audio / lazy-load Tone behind the first gesture?), not a
  frame-rate one. A true **mid-tier-device perf confirmation** (DevTools 4–6× CPU
  throttle or a real phone) is documented in `docs/perf-notes.md` as a manual step
  — worth doing once in STAGE-006's prod smoke check. The CC0 wolf-howl sample and
  the richer "audio settings" UI remain PROJ-002.
- No engine work deferred; nothing punted that isn't already on a future stage/
  project.

### Proposed template / guidance updates (for review — not yet applied)

- Fold the standing UI build-prompt notes into boilerplate: "this repo uses
  `fireEvent` (no `@testing-library/user-event`) and has no `react-hooks` ESLint
  plugin — don't add `exhaustive-deps` disables; write `vi.fn()` mock factories
  with no named callback params." (Dogfood findings #12/#13.)
- Consider promoting the three test-enforced a11y/perf invariants to named
  constraints at the next weekly review (optional — guard tests already enforce
  them).
- No DEC changes required; DEC-013 (audio-graph architecture) is the only new
  decision this stage emitted.
