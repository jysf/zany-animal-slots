---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-008                     # stable, zero-padded, continuous across the repo
  status: active                    # proposed | active | shipped | cancelled | on_hold
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-002                      # parent project
repo:
  id: animal-slots

created_at: 2026-07-05
shipped_at: null

# What part of the project's value thesis this stage advances.
# If you can't articulate value_contribution, the stage may be
# infrastructure-only — acceptable but flag it.
value_contribution:
  advances: >-
    The "fun" and "variety" halves of the thesis — proves the config-driven spine
    (STAGE-007) pays off: retuning the math for fun and adding themed machines are
    DATA changes, not engine code. This is the first stage that DELIBERATELY CHANGES
    behavior, against a measured target RTP, and the first that ships user-visible
    variety (a machine selector + persisted choice).
  delivers:
    - "A machine-metrics simulator: RTP, hit-frequency, and tier-distribution measured over any machine.math by seeded Monte-Carlo — so the retune is measured, not guessed, and re-tunable."
    - "A deliberately more generous default machine — the retuned 'Wild & Whimsical' hits a chosen target RTP (~94%) / hit-frequency (~40%) with a real medium-win band and a more reachable jackpot, verified by the simulator and re-baselined into the frozen-seed contract."
    - "Four selectable machines — the tuned Wild & Whimsical (default) + Arctic + Desert + Ocean, each with distinct theme tokens, music, and math (pure data + a DEC each)."
    - "Per-machine theme + audio: the UI applies the active machine's theme tokens at runtime and the audio singleton reads its audio params (the theme/audio wiring deferred from STAGE-007/SPEC-041)."
    - "A machine-selector UI whose choice persists across reloads (React Context + localStorage), so switching re-renders the reels, paytable, theme, and audio together."
  explicitly_does_not:
    - "Add player session stats (winnings-over-time, biggest win, cash-ins) — that's STAGE-009."
    - "Add help / how-to-play onboarding — that's STAGE-010."
    - "Add usage analytics or any network beacon — that's STAGE-011; the no-backend posture (DEC-005) is UNCHANGED this stage."
    - "Change the engine-no-dom boundary (DEC-001) — the engine still takes only the math slice; new machines are data."
    - "Add real money, accounts, cross-device sync, or cross-session identity (constraint no-real-money holds forever)."
    - "Ship Food & Drink machines — parked as a future fast-follow once the 4-machine set proves the selector + theme/audio wiring."
---

# STAGE-008: fun retune and more machines

## What This Stage Is

A **behavior-CHANGING** stage — the deliberate inverse of STAGE-007. Where STAGE-007
proved a machine is data by keeping behavior byte-identical, STAGE-008 spends that
config-driven spine to make the game **fun** and **varied**. It (a) builds a
**machine-metrics simulator** that measures a machine's RTP, hit-frequency, and
win-tier distribution by seeded Monte-Carlo, so tuning is evidence-driven and
repeatable; (b) **retunes the default machine "Wild & Whimsical" in place** to a chosen
generous target (~94% RTP, ~40% hit-frequency, a genuine medium-win band, a more
reachable jackpot) — a change that **intentionally alters the frozen seeds' outcomes**,
so the frozen-seed contract is **recomputed and re-pinned** to the retuned numbers under
a retune DEC; (c) finishes the **presentation slice** deferred from STAGE-007 — extends
`MachinePresentation` with **theme** + **audio** and wires the UI (runtime CSS-var
theming) and the audio singleton to read the active machine; (d) parameterizes the last
engine constants the machine should own (bet-level stepping + the paytable's math
source, both deferred from STAGE-007); (e) makes the active machine **reactive**
(React Context + localStorage) and ships a **machine-selector UI**; and (f) adds three
themed machines — **Arctic**, **Desert**, **Ocean** — each a distinct theme + music +
math, as pure data. When it ships, a player can pick among four visibly and aurally
distinct, deliberately-fun machines and the choice sticks across reloads.

## Why Now

STAGE-007 built the spine specifically so this stage would be cheap: the fun retune and
every new machine are now data + a DEC, not engine edits. Two things the brief flags as
urgent land here — the MVP was **too hard to win with wins too small** (a real tester
bounced), and there was **no variety**. This is also the stage the brief earmarked to
**absorb the STAGE-007 deferrals** (per-machine theme + audio, bet-level stepping,
paytable-math source) — they were deferred precisely because they have no payoff until a
genuinely distinct machine exists, which is now. Retuning while the engine is freshly
parameterized and the parity contract is green is the safest moment: the simulator +
re-baselined contract keep a deliberate behavior change from becoming an accidental
regression.

## Success Criteria

- **Measured, re-tunable retune:** a simulator reports RTP / hit-frequency / tier
  distribution for any `machine.math`; the retuned default lands within the chosen
  target band (~94% RTP, ~40% hit-frequency), and re-hitting a different target is a
  data edit + a re-run, not code.
- **Fun default:** the retuned Wild & Whimsical is measurably more generous than the MVP
  — higher hit-frequency, a real medium-win band, a more reachable jackpot — and the
  frozen-seed contract is **recomputed and re-pinned** to the new numbers (a changed
  fixture here is INTENDED, recorded under the retune DEC).
- **Variety:** four machines (tuned Wild & Whimsical + Arctic + Desert + Ocean) are
  selectable in-app, each with distinct theme tokens, music, and math.
- **Per-machine theme + audio:** switching machines changes the on-screen theme and the
  audio, both driven by the active machine's presentation slice at runtime.
- **Persisted choice:** the selected machine survives a reload (localStorage); a switch
  re-renders reels, paytable, theme, and audio together (getActiveMachine is now
  reactive, not a module const).
- **Boundaries intact:** DEC-001 holds (engine sees only math); DEC-005 (no backend) is
  untouched this stage; adding/retuning a machine remains data + a DEC, never engine
  logic.

## Scope

### In scope
- **Machine-metrics simulator** — a seeded Monte-Carlo harness (script + a `just`
  recipe) computing RTP, hit-frequency, and win-tier distribution for a machine's math
  slice. The measurement tool behind the retune's DEC number.
- **Fun-retune of the default machine (in place)** — retune Wild & Whimsical's reel
  weights / strip / paytable / jackpot rule / tier boundary to the chosen target,
  verified by the simulator; **re-baseline the frozen-seed contract** and every parity
  test to the new outcomes under a retune DEC.
- **Parameterize residual engine reads** (deferred STAGE-007) — bet-level stepping
  (`nextBet`/`prevBet`) and the paytable view's math source read the active machine, so
  a machine may vary bet levels + paytable.
- **Per-machine theme + audio** (deferred STAGE-007/SPEC-041) — extend
  `MachinePresentation` with a `theme` slice (token overrides applied at runtime as CSS
  vars) and an `audio` slice (channel gains / mix / music params read by the audio
  singleton), and wire the UI + audio to the active machine.
- **Reactive active-machine seam** — lift the active machine into a **React Context**
  backed by **localStorage** so a switch re-renders the hook + UI; `getActiveMachine`
  stops being a module const.
- **Machine-selector UI** — an in-app control to switch machines, with the persisted
  choice.
- **Three themed machines** — Arctic, Desert, Ocean: each a data file (theme + music +
  math) + a DEC + a parity/sanity test, exercised through the selector.

### Explicitly out of scope
- Player session stats — **STAGE-009**.
- Help / how-to-play onboarding — **STAGE-010**.
- Usage analytics / any network beacon — **STAGE-011** (DEC-005 unchanged here).
- A new audio *engine* graph — the DEC-013 graph stays; only its params become
  per-machine.
- Food & Drink machines — parked fast-follow (future wave), after the 4-machine set
  proves the pattern.
- Per-reel asymmetric strips or new mechanics (scatter/wild-substitution) unless a
  chosen machine's math needs them — kept minimal, as data, only if required.

## Spec Backlog

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

- [x] SPEC-044 (shipped 2026-07-05, PR #54) — **Machine-metrics simulator**: a seeded
      Monte-Carlo harness (`src/engine/metrics.ts` + `scripts/simulate.ts` + `just simulate`)
      reporting RTP, hit-frequency, and win-tier distribution for a machine's math slice;
      pins today's Wild & Whimsical baseline (measured: RTP **0.13** / hitFreq **0.10** /
      jackpotRate **0** — the quantified "too hard to win") as the retune's before-number.
      Test-covered, no production game-behavior change; 0 defects. **Finding:** `reelWeights`
      is documentation-only — SPEC-045 must retune the strip/paytable, not the weights. **[M]**
- [x] SPEC-045 (shipped 2026-07-05, PR #55) — **Deterministic strip-builder**: a pure
      `buildStrip(symbols, weights)` (fractional-rank interleave → **provably count-exact**,
      + an adjacency-fix pass → no linear adjacent duplicates) + unit tests. Pure additive
      engine infra — does NOT touch any machine, **no behavior change, no re-baseline**. The
      mechanism SPEC-046's "generate strips from weights" retune consumes (the user's chosen
      tuning knob). 0 functional defects (a verify [?] on a redundant-with-stable-sort tie-break
      resolved as a mutation-design artifact, documented in a comment). **[M]**
- [x] SPEC-046 (shipped 2026-07-05, PR #56) — **Fun-retune Wild & Whimsical (in place)**: retuned
      the default's weights + paytable + **paylines (5 → 20, the "more ways to win")** to the
      generous target, `strips` GENERATED from the tuned weights via SPEC-045's `buildStrip`;
      **measured RTP 93.8% / hit 34.4% / jackpot ~1-in-25k** (was 13% / 10% / never). Re-baselined
      the frozen-seed contract + metrics baseline + 12 test files to the tuned outcomes (a changed
      fixture INTENDED); emitted **DEC-016**. Preview-verified (20 line diagrams + retuned paytable).
      0 defects. **[L]**
- [x] SPEC-047 (shipped 2026-07-06, PR #57) — **Parameterize residual engine reads**: bet-level
      stepping (`nextBet`/`prevBet` gained an optional `levels` param) and the paytable view's math
      source (`paytableRows`/new `paylineCount` read `MachineMath`; `PAYLINE_COUNT` const removed)
      now read the active machine instead of engine constants (deferred STAGE-007). Same
      "optional-param-defaulting-to-default" pattern as SPEC-039/040. NO behavior change for the
      default machine → **no frozen-seed re-baseline** (empty git-diff guard). Both adversarial
      guard-mutations proved teeth; 0 defects. No new dep, no new DEC. **[S–M]**
- [x] SPEC-048 (shipped 2026-07-06, PR #58) — **Per-machine theme + audio slice**: extended
      `MachinePresentation` with `theme` (CSS `--color-*` overrides applied at runtime to the
      `.device-stage` root via a self-clearing `applyTheme`/`useMachineTheme`) + `audio` (channel
      gains / mix / generative-bed music); the audio singleton (`audioEngine.ts`/`mixer.ts`/
      `ambientBed.ts`) + `useMachineAudio` now read the active machine (deferred STAGE-007/SPEC-041).
      Default machine = no-op (theme `{}` + audio by reference); DEC-001 clean (engine diff EMPTY);
      DEC-013 graph unchanged. Preview-verified unchanged campfire render; all 3 guard-mutations had
      teeth; 0 defects. No new dep, no new DEC. **[L]**
- [ ] (not yet written) SPEC-049 — **Reactive active-machine context**: lift the active
      machine into a React Context backed by localStorage; `useSlotMachine` + presentation
      subscribe; `getActiveMachine` is no longer a module const. Persisted choice survives
      reload. **[M]**
- [ ] (not yet written) SPEC-050 — **Machine-selector UI**: an in-app control to switch
      machines; switching re-renders reels + paytable + theme + audio together
      (preview-verified). **[M]**
- [ ] (not yet written) SPEC-051 — **Arctic machine**: theme + music + math as data + a
      DEC + a parity/metrics-sanity test; selectable via the registry. **[M]**
- [ ] (not yet written) SPEC-052 — **Desert machine**: theme + music + math as data + a
      DEC + a parity/metrics-sanity test. **[M]**
- [ ] (not yet written) SPEC-053 — **Ocean machine**: theme + music + math as data + a
      DEC + a parity/metrics-sanity test. Completes the 4-machine set. **[M]**

**Count:** 5 shipped / 0 active / 5 pending — 2×L, 7×M, 1×S–M (10 specs total). **Above the
3–8 typical range** — the "generate strips from weights" decision split the retune into a
tested strip-builder (SPEC-045) + the retune that consumes it (SPEC-046), and the stage also
absorbs three STAGE-007 deferrals and ships four machines. The three themed-machine specs
(051–053) are cheap DATA specs once the theme/audio/selector infra (048–050) lands; if the
wave runs long, **Ocean (SPEC-053) is the natural boundary to defer** (ship 3 machines,
fast-follow the 4th) — same deferral logic the brief applies to STAGE-011.

## Design Notes

- **⚠ BEHAVIOR-CHANGING — the inverse of STAGE-007.** STAGE-007's rule was "a changed
  frozen-seed fixture is a regression." STAGE-008's retune (SPEC-046) **deliberately
  changes** those outcomes. So the contract tests are **RE-BASELINED, not held fixed**:
  the frozen seeds stay a *determinism* guard (same seed → same result), but their
  EXPECTED VALUES are recomputed to the retuned numbers and pinned under the retune DEC.
  SPEC-045 (the strip-builder) is pure additive infra and does NOT re-baseline — only
  SPEC-046 (which wires the builder into W&W + retunes) does. The retune spec must
  **recompute-then-pin**, and the spec + PR must state explicitly that the changed fixture
  is INTENDED. The tests to re-baseline in SPEC-046:
  `src/machines/machine-parity.contract.test.ts`, `src/engine/metrics.test.ts` (the pinned
  W&W baseline from SPEC-044), `src/engine/spin-parity.test.ts`, `src/engine/index.test.ts`,
  `src/engine/tiers.test.ts`, `src/ui/useSlotMachine.test.tsx` (plus
  `src/machines/wildAndWhimsical.parity.test.ts`, which pins extracted-data == constants —
  it stays green because the retune edits the *constants*, so the reference equality holds;
  confirm it, don't assume).
- **Measure before you tune (SPEC-044 first).** The brief names "'more fun' is
  subjective — retuning is guesswork without a proxy metric" as a risk. The simulator is
  that proxy: retune = edit data → `just simulate <machine>` → read RTP/hit-freq/tiers →
  adjust → re-run → pin. The retune DEC records the **measured** target band, and the
  tool makes re-hitting or changing it repeatable (the user's "can it be tuned?" ask).
- **The locked retune config (measured during SPEC-045/046 design).** Target hit at
  **RTP ~94% / hit-freq ~34% / jackpot ~1-in-25k / big-band ~4.5%** (up from 13%/10%/never/
  0.4%): `reelWeights` DEER 9, FOX 8, SQUIRREL 7, BEAR 5, EAGLE 4, OWL 3, BISON 3, WOLF 3
  (sum 42); `paytable` low [1,3,7] · mid [2,6,18] · high [4,14,55] · jackpot [10,50,250];
  **paylines 5 → 20** (the brief's "more ways to win" — the structural lever, since 5 lines
  cap hit-freq at ~11% no matter the weights); jackpot WOLF×5 and `tiers.bigMultiple` 5
  unchanged; `strips` GENERATED from the tuned weights via SPEC-045's `buildStrip` (the
  user's "generate strips from weights" decision — weights become the live knob). Structure
  otherwise preserved (8 symbols, 5×3). Representative re-baselined seeds under the tuned
  machine: 1→small, 6→big, **68357→jackpot (2500)**, 2→loss. These numbers are re-tunable —
  re-run `just simulate` after any edit.
- **Presentation slice grows (SPEC-048).** STAGE-007 shipped only `symbolDisplay`. Add
  `theme` (a token-override map applied at runtime — set CSS custom properties on a root
  element from the active machine, since `tokens.css` is static) and `audio`
  (per-machine `CHANNEL_GAINS` / `MIX` / music params the singleton reads). DEC-001 stays
  clean: these live in the **presentation** slice; the engine never sees them.
- **Reactive seam (SPEC-049) is the keystone for variety.** `getActiveMachine()` is a
  module const today — a switch wouldn't re-render. Lift it into a React Context (backed
  by localStorage) that `useSlotMachine` and the presentation read; a module-const can't
  drive a live switch. Persist the chosen id; fall back to the default for an unknown id
  (registry already does this).
- **One DEC per new machine, descendants of DEC-015.** Each themed machine (Arctic/
  Desert/Ocean) is data + a DEC recording its theme/music/math choices; the retune is its
  own DEC. None touch engine logic — that's the whole point of DEC-015.
- **Adversarial guard-mutation stays the default verify move.** For every "prove it's
  data-driven / retuned" spec, VERIFY reverts the source to the old value and confirms the
  new guard FAILS (proven this wave in STAGE-007). For the retune, that means confirming
  the re-baselined seeds FAIL against the *old* math — proving the numbers actually moved.
- **Selector persistence collides with STAGE-009 stats later** — both want localStorage.
  Namespace the machine-choice key cleanly now (e.g. `zany:active-machine`) so STAGE-009's
  stats keys don't clash.

## Dependencies

### Depends on
- **STAGE-007 (shipped):** the config-driven machine model — `MachineMath` /
  `MachinePresentation`, the registry (`getActiveMachine`/`getMachine`), the parity
  contract, and `useSlotMachine` threading the machine. STAGE-008 spends this spine.
- **PROJ-001 (shipped):** the seedable RNG (Mulberry32) the simulator reuses, the token
  system (`tokens.css`), and the Tone.js audio graph (DEC-013) whose params become
  per-machine.
- External: none (no backend this stage; DEC-005 unchanged).

### Enables
- **STAGE-009 (player stats):** a fun, varied game worth measuring progress in; the
  localStorage + reactive-context patterns stats will reuse.
- **STAGE-010 / STAGE-011** indirectly — a game a first-timer might actually enjoy and
  that's worth instrumenting.
- **Future machines** (Food, Drink, and the parked polish) — pure config once the
  theme/audio/selector infra exists here.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1c (Stage Ship) in
FIRST_SESSION_PROMPTS.md to draft this.*

- **Did we deliver the outcome in "What This Stage Is"?** <yes/no + notes>
- **How many specs did it actually take?** <number vs. plan of 9>
- **What changed between starting and shipping?** <one sentence>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - <one-line items>
