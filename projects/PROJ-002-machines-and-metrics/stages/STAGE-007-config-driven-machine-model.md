---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-007                     # stable, zero-padded, continuous across the repo
  status: active                    # proposed | active | shipped | cancelled | on_hold
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-002                      # parent project
repo:
  id: animal-slots

created_at: 2026-07-04
shipped_at: null

# What part of the project's value thesis this stage advances.
# If you can't articulate value_contribution, the stage may be
# infrastructure-only — acceptable but flag it.
value_contribution:
  advances: >-
    The "configurable" half of the thesis — proves a "machine" can be pure DATA by
    parameterizing the (frozen) engine to consume a Machine config, while preserving
    today's behavior exactly. This is the spine every other PROJ-002 stage builds on.
  delivers:
    # NOTE: this stage is deliberately INFRASTRUCTURE — near-zero user-visible change.
    # Its payoff is that STAGE-008's retune + variety become data edits, not engine code.
    - "A Machine config type (a math slice consumed by the engine + a presentation slice consumed by the UI)."
    - "The current game expressed entirely as data — the default machine, 'Wild & Whimsical'."
    - "Engine spin/grid/payline/tier functions that take a machine instead of module constants (DEC-001 boundary intact)."
    - "The app plays byte-identically to today, driven by the default machine, guarded by a frozen-seed parity test."
  explicitly_does_not:
    - "Retune the math for fun — this stage is strictly behavior-preserving (that's STAGE-008)."
    - "Add a machine-selector UI, persist a choice, or ship a 2nd/3rd machine (STAGE-008)."
    - "Add player stats, help, or analytics (STAGE-009..011)."
    - "Change the engine-no-dom boundary (DEC-001) — the engine takes plain-data config, never DOM."
---

# STAGE-007: config driven machine model

## What This Stage Is

A **refactor** stage: it turns the one hard-coded game into a config-driven one by
parameterizing the engine so a "machine" is pure **data** — symbols, tiers, reel
strips/weights, paylines, paytable, jackpot rule, and bet levels (the **math** the
engine consumes) plus emoji, theme tokens, and audio params (the **presentation** the
UI consumes). The current game is extracted, unchanged, as the first machine
(**"Wild & Whimsical"**), and every engine function — grid resolution, payline
evaluation, win-tier classification, `spin()` — is changed to take a machine instead
of reading module constants. When it ships, the app plays **byte-identically to
today**; but the game is now data, so STAGE-008's fun-retune and extra machines become
config edits, not engine code.

## Why Now

It's the **spine** of PROJ-002: the fun retune, extra machines, themes, and music all
become cheap data changes *only once* the engine is parameterized — so this goes
first. It's also the stage that deliberately **unfreezes the engine** (untouched since
SPEC-011), which is exactly why it must land first, under a strict frozen-seed parity
guard, before any tuning touches the numbers. Doing it while the engine is still small
and freshly frozen is far cheaper than after more behavior accretes.

## Success Criteria

- **Engine consumes config:** `spin`/`resolveGrid`/`evaluatePaylines`/`classifyWin`
  take the machine (its math slice); no engine function reads a hard-coded
  symbol/weight/strip/payline/paytable/tier constant.
- **Game-as-data:** the current game is expressed entirely as the default machine;
  removing the old module-level constants leaves behavior unchanged.
- **Frozen-seed parity:** seeds **407947** (five Wolves → totalWin 2000, jackpot),
  **12345** (→ 0), **276** (→ 55, big, 3 lines), **12** (→ 10, small) produce identical
  grids / lineWins / totalWin / tier through the default machine.
- **DEC-001 intact:** the engine imports no DOM and takes only plain-data config.
- **Visually/aurally unchanged:** the app plays identically to today, driven by the
  default machine through `useSlotMachine` — no selector UI yet.

## Scope

### In scope
- Define the `Machine` type, split into a **math slice** (engine-consumed) and a
  **presentation slice** (UI-consumed).
- Extract today's constants — `SYMBOLS`/`SYMBOL_TIER`/`REEL_WEIGHTS`/`REEL_STRIP`/
  `STRIPS`, `PAYLINES`/`PAYTABLE`, the jackpot rule + tier boundaries, bet levels +
  starting balance; `SYMBOL_DISPLAY` emoji, theme tokens, audio params — into the
  default machine **byte-identically**.
- Parameterize the engine functions to consume the machine's math slice.
- A **machine registry** (default only) + thread the active machine through
  `useSlotMachine` into engine + presentation.
- A **frozen-seed parity contract test** as the regression guard.
- A **DEC** for the config-driven-machine model (extends DEC-001/006/011/003).

### Explicitly out of scope
- Any change to the numbers / feel (retune) — **STAGE-008**.
- A selector UI, persisting the choice, or a 2nd/3rd machine — **STAGE-008**.
- Player stats / help / analytics — STAGE-009..011.
- Per-reel asymmetric strips, more paylines, or new mechanics (scatter, etc.) — later,
  as machine config, in STAGE-008+.

## Spec Backlog

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

- [x] SPEC-038 (shipped) — **Machine config types + default-machine data extraction**:
      defined the `Machine` type (math + presentation slices) and extracted today's
      constants into the default machine "Wild & Whimsical", **no engine signature
      changes**; emitted DEC-015. Parity: extracted data == current constants (8-block
      contract test). PR #46. **[M]**
- [x] SPEC-039 (shipped) — **Parameterize grid + payline evaluation**:
      `resolveGrid`/`evaluatePaylines` consume the machine's strips/paylines/paytable
      instead of module constants; `spin()` threads the machine (defaulted); frozen-seed
      parity guard (`spin-parity.test.ts`). PR #47. **[M]** ← riskiest; landed clean, 0 defects.
- [x] SPEC-040 (shipped) — **Parameterize win-tier + jackpot rule**: tier
      boundaries + jackpot symbol/count read from the machine (not hard-coded WOLF×5 /
      5× big); frozen-seed tier parity + a variant-machine guard (verified genuinely
      data-driven via a façade-mutation test). Completes the engine parameterization —
      no engine fn reads a hard-coded tier/jackpot constant. PR #49. **[S–M]**
- [x] SPEC-041 (shipped) — **Presentation symbol-display per machine**: the presentation-
      consuming UI (ReelGrid, paytable) reads `symbolDisplay` (emoji/label) from the
      machine's presentation slice instead of importing the module-level `SYMBOL_DISPLAY`;
      threaded from the default machine via props/params; visual parity (preview-verified).
      **Theme tokens + audio params per machine DEFERRED to STAGE-008** (see Design Note).
      PR #51. **[M]**
- [x] SPEC-042 (shipped) — **Machine registry + hook plumbing**: a registry
      (default only) as the single source of the active machine; `useSlotMachine` threads
      `machine.math` into the engine + inits balance/bet/reset from the machine; Game +
      PaytableSheet source presentation from `getActiveMachine()`. Default machine only,
      no selector UI; end-to-end parity + a supplied-machine guard (preview-verified).
      Config-driven loop closed. PR #52. **[M]**
- [ ] SPEC-043 (not yet written) — **Machine-parity contract test**: the four frozen
      seeds through the default machine assert identical outcomes — the stage's
      regression guard. **[S]**

**Count:** 5 shipped / 0 active / 1 pending — 4×M, 1×S–M, 1×S. No L (the engine
parameterization was split into 039+040 to keep the riskiest work bounded). Within
the 3–8 range. Engine parameterization (038–040) complete; presentation symbolDisplay
(041) + registry/hook (042) shipped — the config-driven loop is closed. Only 043
(the frozen-seed parity contract test) remains. Per-machine theme + audio deferred to
STAGE-008 (see Design Notes).

## Design Notes

- **This stage UNFREEZES the engine.** It's been frozen since SPEC-011 (zero
  `src/engine/**` changes). STAGE-007 deliberately reopens it — so *every* engine
  change is guarded by the frozen-seed parity test (SPEC-043, plus parity assertions in
  each spec's Failing Tests). This is the contract-tests-as-guards pattern PROJ-001
  proved. This stage must land before any STAGE-008 tuning touches the numbers.
- **Split the config: math vs presentation.** The `Machine` has a **math slice**
  (symbols, tiers, strips/weights, reelCount/rows, paylines, paytable, jackpot rule,
  tier boundaries, bet levels, starting balance) the *engine* consumes, and a
  **presentation slice** (emoji/symbol-display, theme token overrides, audio params)
  the *UI* consumes. The engine only ever sees the math slice → **DEC-001
  (engine-no-dom) stays clean**.
- **Behavior-preserving default machine.** "Wild & Whimsical" = today's exact
  constants; the migration re-homes data, it does not re-tune. The frozen seeds are the
  contract.
- **`spin()` signature.** Prefer making the machine **explicit** —
  `spin({ seed, balance, bet, machine })` with the registry providing the default — so
  data flow stays explicit (DEC-001 spirit) rather than relying on a hidden default.
- **DEC to emit — DEC-015 (config-driven machine model):** *extends* DEC-001 (boundary
  holds; the engine now takes config data) and *generalizes* DEC-006 (symbol set),
  DEC-011 (weights/paytable), DEC-003 (paylines) — their specifics become the default
  machine's data; their rationale still holds. Not a supersession: the originals live
  on **inside** the default machine.
- **Presentation scope: symbolDisplay now; theme + audio deferred to STAGE-008 (decided at SPEC-041 design).**
  The original 041 frame bundled emoji + theme tokens + audio params. On inspection, only
  `symbolDisplay` is cleanly extractable behind a low-risk seam (props into ReelGrid/paytable).
  Theme tokens are static CSS (`tokens.css`) and audio params live in a lazily-created global
  audio singleton (`audioEngine.ts` `CHANNEL_GAINS`, `mixer.ts` `MIX`); parameterizing either
  at runtime is invasive **and behavior-preserving-only** — it has zero payoff until a
  genuinely distinct machine exists, which is **STAGE-008** (2–3 machines with theme + music +
  math). So STAGE-007's presentation slice ships `symbolDisplay` wiring (SPEC-041) + the
  registry/hook threading (SPEC-042); per-machine **theme + audio** move to STAGE-008, where a
  themed variant makes the runtime-application mechanism pay for itself. This keeps STAGE-007
  focused on proving "a machine is data (math + its symbol appearance), driven by a registry,
  behavior-preserving" without speculative runtime-theming/audio infrastructure.

## Dependencies

### Depends on
- **PROJ-001 (shipped):** the pure-TS engine being parameterized, the public engine
  interface (`src/engine/index`), the token/theme system, the Tone.js audio graph
  (DEC-013), and the **frozen seeds** that serve as the parity contract.
- External: none.

### Enables
- **STAGE-008 (Fun retune + more machines):** once the engine is config-driven, the
  retune and every new machine/theme/music become data changes, not engine code.
- **STAGE-009..011** indirectly — they layer on the machine-aware app.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1c (Stage Ship) in
FIRST_SESSION_PROMPTS.md to draft this.*

- **Did we deliver the outcome in "What This Stage Is"?** <yes/no + notes>
- **How many specs did it actually take?** <number vs. plan>
- **What changed between starting and shipping?** <one sentence>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - <one-line items>
