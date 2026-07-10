---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-021
  type: decision
  confidence: 0.9
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

# Emitted during PROJ-002 / STAGE-012 (per-machine reel symbol identity, SPEC-058).
project:
  id: PROJ-002
repo:
  id: animal-slots

created_at: 2026-07-09
supersedes: null   # partial: supersedes only the shared-symbol-vocabulary CLAUSE of DEC-017/DEC-018 (see below)
superseded_by: null

affected_scope:
  - src/machines/**

tags:
  - symbols
  - presentation
  - machines
  - theme
  - correction
---

# DEC-021: Each themed machine gets its OWN reel symbol vocabulary (per-machine presentation symbol map)

## Decision

Each themed machine renders its **own** set of reel symbols — its own emoji + accessible labels —
instead of the single shared `SYMBOL_DISPLAY` map:

- **Wild & Whimsical** (the default / parity machine) keeps the original 8 forest animals
  (`SYMBOL_DISPLAY`): 🦌 Deer, 🦊 Fox, 🐿️ Squirrel, 🐻 Bear, 🦅 Eagle, 🦉 Owl, 🦬 Bison, 🐺 Wolf.
- **Arctic** — polar creatures: 🦌 Caribou, 🦊 Arctic Fox, 🐧 Penguin, 🦭 Seal, 🦅 Eagle, 🦉 Snowy Owl,
  🦣 Mammoth, 🐻‍❄️ Polar Bear (WOLF = jackpot symbol).
- **Desert** — arid creatures: 🐪 Camel, 🦊 Fennec Fox, 🦎 Gecko, 🐢 Tortoise, 🦅 Vulture, 🦉 Elf Owl,
  🐏 Bighorn Ram, 🐍 Sidewinder (WOLF = jackpot).
- **Ocean** — marine creatures: 🐬 Dolphin, 🐠 Tropical Fish, 🦐 Shrimp, 🦀 Crab, 🐡 Pufferfish,
  🐙 Octopus, 🐳 Whale, 🦈 Shark (WOLF = jackpot).

**This is presentation-only.** The engine symbol IDs (`DEER … WOLF`), reel weights, strips, paytable,
and jackpot rule (`{ symbol: 'WOLF', count: 5 }`) are **unchanged** on every machine — a `WOLF` is still
a `WOLF` to the engine; only its rendered emoji/label differs per machine (DEC-006: the glyph map is a
UI concern; DEC-001: the engine never sees it). Each machine's `presentation.symbolDisplay` carries all
8 `SymbolId` keys, so `ReelGrid` and the paytable (which already read the active machine's
`symbolDisplay`, SPEC-041) show the themed creatures with no plumbing change.

## Context

**This decision corrects an autonomous one.** DEC-017 (Arctic) and DEC-018 (Desert) — both authored by
an overnight agent on 2026-07-07, not by the user — chose "Option C: shared vocabulary + per-machine
theme/audio/math" and listed "Option A: new symbol set per machine" as *rejected* ("breaks the 8-symbol
vocabulary; multiplies art work"). A later autonomous run (SPEC-053) then cited that self-made decision
to reject a per-machine-symbols prototype as "off-script." But the user's actual intent was **to change
the symbols per machine** — so the autonomous decision, and its later enforcement, ran against the
human's intent. DEC-021 records the user's intent and supersedes the symbol-vocabulary clause so no
future run re-rejects it.

The original rationale for Option A's rejection no longer holds: (1) "multiplies art work" — the symbols
are emoji, so a themed set is a one-line data change per machine, not art production; (2) "breaks the
8-symbol vocabulary" — the *engine* vocabulary (8 `SymbolId`s) is untouched; only the *presentation* map
varies, which the `MachinePresentation.symbolDisplay` field (SPEC-038) and per-machine threading
(SPEC-041) were already built to support at zero engine cost. Matching creatures make each machine's
theme land far harder than a cool-blue palette over the same forest animals.

## Partial supersession of DEC-017 / DEC-018

DEC-021 supersedes **only the shared-symbol-vocabulary clause** of DEC-017 and DEC-018 (their "Option C
keeps `SYMBOL_DISPLAY`" / "Option A rejected" symbol choice). Everything else in DEC-017/018 — the icy
and warm-sand **theme** palettes, the per-machine **audio** params, and the **tuned math** (weights,
paytable, measured RTP) — remains in force and unchanged. DEC-017/018 each carry a note pointing here.

## Alternatives Considered

- **Keep the shared vocabulary (the DEC-017/018 status quo)**
  - Why rejected: it was an autonomous choice against the user's stated intent, and its stated costs
    (art work, engine-vocabulary breakage) do not apply to an emoji presentation map over unchanged
    engine symbols. The theme reads as weaker when every machine shows the same 8 forest animals.

- **New engine symbol IDs / different reel math per machine**
  - Why rejected: unnecessary and costly. Distinct *identity* needs only a per-machine presentation map;
    changing engine IDs or math would break the frozen-seed contract, the parity machine, and DEC-001
    for zero added value. The engine stays glyph-agnostic with a fixed 8-`SymbolId` alphabet.

- **Also re-theme Wild & Whimsical's symbols**
  - Why rejected: W&W is the **parity** machine — its presentation must match the original PROJ-001
    behavior (the `wildAndWhimsical.parity.test.ts` contract asserts `symbolDisplay === SYMBOL_DISPLAY`).
    It stays the forest-animal default; the *themed* machines are the ones that diverge.

## Consequences

- **Positive:** each machine now has a distinct visual identity on the reels AND in the paytable (both
  read `presentation.symbolDisplay`), at the cost of one data literal per machine; the user's intent is
  recorded so future autonomous runs won't re-reject it. No engine, math, RTP, or frozen-seed change.
- **Negative:** three more symbol maps to keep coherent; emoji rendering varies slightly across
  platforms (already true of the default set). Labels must stay accessible (DEC-006).
- **Neutral:** the engine alphabet is still exactly 8 `SymbolId`s; the jackpot is still `WOLF`-keyed on
  every machine — only its face changes (Polar Bear / Sidewinder / Shark).

## Validation

Right if the reels and paytable show each machine's themed creatures on switch, every machine's
`symbolDisplay` still has all 8 `SymbolId` keys, the engine/parity diffs stay EMPTY, and no future
overnight run re-flags per-machine symbols as off-script. Revisit if a machine needs a symbol whose
emoji collides confusingly with another, or if a future spec wants per-machine *engine* differences
(that would be a separate, weightier decision).

## References

- Related specs: SPEC-058 (this change), SPEC-038 (the `symbolDisplay` presentation field),
  SPEC-041 (per-machine `symbolDisplay` threaded into ReelGrid + paytable), SPEC-051/052/053 (the
  themed machines whose symbol clause this supersedes)
- Related decisions: **supersedes the shared-vocabulary clause of DEC-017 (Arctic) and DEC-018 (Desert)**
  and the same clause carried into the Ocean machine (DEC-019); DEC-006 (glyph map is a UI concern),
  DEC-001 (engine-no-dom), DEC-015 (machines are pure data)
- External docs: none
