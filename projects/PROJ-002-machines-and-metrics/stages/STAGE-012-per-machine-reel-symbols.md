---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-012                     # renumbered from the auto-assigned 010 to reserve 010/011 for the
                                    # already-planned Help (010) + analytics (011) stages
  status: shipped                   # proposed | active | shipped | cancelled | on_hold
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

project:
  id: PROJ-002                      # parent project
repo:
  id: animal-slots

created_at: 2026-07-09
shipped_at: 2026-07-09

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    The "variety / distinct machines" half of PROJ-002's thesis — the four machines already differ by
    theme, audio, and tuned math, but shared the same 8 forest-animal reel faces; this stage gives each
    themed machine its OWN reel creatures so its identity is visible on the reels and paytable, not just
    in the palette. It also corrects an autonomous decision (DEC-017/018's shared-vocabulary clause) that
    ran against the user's stated intent to vary symbols per machine.
  delivers:
    - "Arctic, Desert, and Ocean each render their own themed reel symbols (emoji + accessible labels) in the reels and the paytable; Wild & Whimsical keeps the default forest animals."
  explicitly_does_not:
    - "Change any engine symbol ID, reel weight, strip, paytable, jackpot rule, RTP, or the frozen-seed contract — this is presentation-only (DEC-001; the engine alphabet stays the 8 SymbolIds)."
    - "Re-theme Wild & Whimsical's symbols — it is the parity machine and must keep SYMBOL_DISPLAY (its parity contract)."
    - "Add new symbol ART or a charting/asset dependency — symbols are emoji, a per-machine data literal."
    - "Add a per-machine engine/math difference — that would be a separate, weightier decision."
---

# STAGE-012: Per-machine reel symbol identity

## What This Stage Is

A small, corrective stage that gives each **themed** machine its own reel creatures. Today all four
machines share one presentation symbol map (`SYMBOL_DISPLAY` — the 8 forest animals), so Arctic, Desert,
and Ocean look like Wild & Whimsical wearing a different palette. When this stage ships, each themed
machine renders its **own** emoji + labels on the reels and in the paytable — Arctic's polar creatures,
Desert's arid creatures, Ocean's marine creatures — while the engine keeps its fixed 8-`SymbolId`
alphabet, unchanged weights/paytable/jackpot, and Wild & Whimsical stays the forest-animal default. It
is a **presentation-only** change over infrastructure that already exists (`MachinePresentation.symbolDisplay`
from SPEC-038, threaded into `ReelGrid` + the paytable per SPEC-041).

## Why Now

The user asked to differentiate the machines' reel symbols, and it surfaced that the "shared vocabulary"
was never their decision — DEC-017/018 (authored autonomously on 2026-07-07) chose it and a later
autonomous run (SPEC-053) cited it to reject a per-machine-symbols prototype as "off-script." This stage
records the user's actual intent (DEC-021, superseding that clause) and delivers it. It is cheap now
because the plumbing already exists — both the reels and paytable already read the active machine's
`presentation.symbolDisplay`; only the per-machine data and the vocabulary guard-tests change. It is
independent of the planned STAGE-010 (Help) and STAGE-011 (analytics).

## Success Criteria

- **Distinct on the reels + paytable:** switching to Arctic / Desert / Ocean shows that machine's own
  creatures on the reels AND in the paytable; Wild & Whimsical still shows the forest animals.
- **Engine untouched:** `git diff main..HEAD -- src/engine/` EMPTY; every machine's `math` (symbols,
  weights, strips, paytable, jackpot) byte-identical; the metrics-sanity + strip + parity tests pass
  unchanged; the frozen-seed contract is not touched (DEC-001, DEC-021).
- **Vocabulary intact where it must be:** each themed machine's `symbolDisplay` carries all 8 `SymbolId`
  keys; Wild & Whimsical's `symbolDisplay` still `=== SYMBOL_DISPLAY` (parity contract holds).
- **No new dependency; no raw hex; token/label accessibility (DEC-006) preserved.**
- **`just typecheck && just lint && just test && just build && just validate && just cost-audit` pass.**

## Scope

### In scope
- Per-machine themed `symbolDisplay` maps for Arctic, Desert, Ocean (emoji + accessible labels for all
  8 `SymbolId`s), each pointed at from that machine's `presentation.symbolDisplay`.
- Updating the three machines' "keeps the 8-symbol vocabulary" guard-tests to assert per-machine
  identity (own map, not `SYMBOL_DISPLAY`; all 8 keys; a signature themed label).

### Explicitly out of scope
- Any engine / math / frozen-seed change (DEC-001) — presentation only.
- Re-theming Wild & Whimsical (the parity machine keeps `SYMBOL_DISPLAY`).
- New symbol art, a charting/asset dependency, or per-machine engine differences.

## Spec Backlog

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

- [x] SPEC-058 (shipped, PR #68) — **Per-machine reel symbol identity**: Arctic (polar), Desert (arid),
      Ocean (marine) each render their own themed `symbolDisplay` on the reels + paytable; W&W keeps the
      forest default. Presentation-only (engine + W&W diffs EMPTY, no math changed); rode the existing
      SPEC-041 threading; emitted **DEC-021** (supersedes the symbol clause of DEC-017/018/019).
      Preview-verified all four machines; 3 vocabulary guard-tests flipped + 3 adversarial mutations
      proven; 408/408 green. **[S]**

**Count:** 1 shipped (SPEC-058) / 0 active / 0 pending — 1×S. **Backlog complete** — stage ready to ship.

## Design Notes

- **DEC-021 is the weighty decision** (already authored): each themed machine gets its own presentation
  symbol map; presentation-only; supersedes the shared-vocabulary clause of DEC-017/018 (and the same
  clause in DEC-019 Ocean). Engine alphabet + all math unchanged; W&W stays the default.
- **Reuse, no plumbing.** `ReelGrid` (SPEC-041) and `paytableRows`/`PaytableSheet` already read
  `machine.presentation.symbolDisplay`, threaded from the active machine — so a per-machine map
  propagates to both surfaces with zero wiring change. The maps live inline in each machine's data file
  (`src/machines/{arctic,desert,ocean}.ts`), typed `SymbolDisplay` (from `./types`).
- **Guard-tests flip, don't disappear.** The three "keeps the 8-symbol vocabulary" tests currently
  assert `presentation.symbolDisplay === SYMBOL_DISPLAY`; they become "keeps the 8 engine symbols but
  themes their display" (own map, all 8 keys, a pinned signature label). W&W's `parity.test` is
  UNCHANGED (it must still equal `SYMBOL_DISPLAY`).

## Dependencies

### Depends on
- **STAGE-008 (shipped):** the four themed machines (Arctic/Desert/Ocean + W&W) as pure-data files.
- **STAGE-007 (shipped):** `MachinePresentation.symbolDisplay` (SPEC-038) + per-machine threading into
  `ReelGrid` and the paytable (SPEC-041) — the infrastructure this rides at zero plumbing cost.

### Enables
- A cleaner precedent that per-machine *presentation* can diverge freely (theme, audio, and now
  symbols) while the engine alphabet stays fixed — useful for any future themed machine.

## Stage-Level Reflection

*Filled in when status moved to shipped (2026-07-09).*

- **Did we deliver the outcome in "What This Stage Is"?** **Yes.** Arctic, Desert, and Ocean each render
  their own reel creatures (polar / arid / marine) on the reels AND the paytable; Wild & Whimsical keeps
  the forest-animal default. Preview-verified all four live. Presentation-only: `git diff main --
  src/engine/` EMPTY, no machine's math changed, W&W + its parity test untouched (DEC-001 held; DEC-021
  is the only new decision).
- **How many specs did it actually take?** **1** (SPEC-058), exactly as framed — a single focused data
  change over the SPEC-041 threading that already existed.
- **What changed between starting and shipping?** Nothing in scope; the change landed as designed. The
  stage exists at all because it **corrected an autonomous decision** (DEC-017/018's shared-vocabulary
  clause, superseded by DEC-021) rather than adding net-new capability.
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - **Autonomous decisions are provisional.** An overnight run authored the shared-vocabulary DEC and a
    later run enforced it against the user's intent; the fix is a standing rule (now in the overnight
    task's safety rails + the signals file): never override apparent user intent to enforce a prior
    autonomous DEC — surface the conflict. Intent-level framing should carry a review gate
    (`framing_approved`).
  - **Commit the build before adversarial guard-mutations** — reverting a mutation with `git checkout`
    on an uncommitted tree discards the build. (Logged to signals.)
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - Both of SPEC-058's — the autonomous-override risk and the commit-before-mutation process note — are
    already promoted to the signals file for the template author.
