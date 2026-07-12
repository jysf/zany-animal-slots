---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-065
  type: chore                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: low
  complexity: S                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-013
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-opus-4-8     # presentation-data change — built + preview-verified in the orchestrator session
  created_at: 2026-07-12

references:
  decisions:
    - DEC-001   # presentation-only; engine untouched
    - DEC-021   # per-machine symbol identity — this swaps glyphs within that model (no vocabulary change)
    - DEC-006   # emoji symbol set — still emoji, still the 8 engine symbols
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-058  # per-machine reel symbol identity (STAGE-012) this refreshes

# One sentence on what this spec contributes to its stage's
# value_contribution. For plumbing: "infrastructure enabling
# STAGE-013's <capability>". Optional; null is acceptable.
value_link: >-
  STAGE-013 identity polish (Task 2): refreshes each machine's reel-emoji so the four machines read as
  more distinct + fun — Wild & Whimsical goes fully whimsical, and no glyph repeats across machines.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
# Record a REAL tokens_total for metered cycles (build/verify) — the
# orchestrator fills it from the Agent result's subagent_tokens at ship
# (or /cost interactively). Only un-metered main-loop cycles (design/ship)
# may be null-with-note. `just cost-audit` enforces this on shipped specs.
# See AGENTS.md §4 and docs/cost-tracking.md. interface: claude-code |
# claude-ai | api | ollama | other.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # main-loop, not separately metered (AGENTS §4)
      recorded_at: 2026-07-12
      note: Design + build + verify in the orchestrator session (presentation data; verification is the rendered reels per machine).
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 22000   # NOMINAL main-loop estimate — not a metered subagent
      estimated_usd: 0.33   # nominal, 22000 tok x ~$15/M (Opus list, order-of-magnitude)
      recorded_at: 2026-07-12
      note: >-
        Build in the orchestrator loop: swapped symbolDisplay emoji+labels across all 4 machines
        (SYMBOL_DISPLAY for W&W, arctic/desert/ocean consts), updated the pinned-symbol tests
        (ReelGrid/paytable/PaytableSheet/arctic/desert/ocean/parity) and added a cross-machine
        symbol-uniqueness contract test. NOMINAL main-loop token estimate (SPEC-054-verify precedent).
        Note: the local `.claude/worktrees/` copy of a concurrently-spawned task doubled `just test`/`just
        lint` locally — it is git-ignored so CI is unaffected; verified with the worktree excluded.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 14000   # NOMINAL main-loop estimate
      estimated_usd: 0.21   # nominal, 14000 tok x ~$15/M
      recorded_at: 2026-07-12
      note: >-
        Verified in-browser: switched through all 4 machines via the live selector and read each reel's
        rendered emoji+labels from the DOM — W&W fun set (frog..unicorn), Arctic (hare/swan/orca in),
        Desert (cactus/scorpion/bat in), Ocean (jellyfish jackpot). Full suite green with the worktree
        excluded (466). Cross-machine no-duplicate contract passes. NOMINAL main-loop estimate.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-12
      note: main-loop ship cycle — PR + CI-poll + squash-merge + archive + brag.
  totals:
    tokens_total: 36000   # build 22000 + verify 14000 (both NOMINAL; design + ship null)
    estimated_usd: 0.54
    session_count: 4
---

# SPEC-065: Per-machine reel-emoji refresh (Task 2)

## Context

STAGE-013 identity polish (the user's "Task 2"). Per-machine reel symbols shipped in STAGE-012 (SPEC-058,
DEC-021) — each machine owns its `symbolDisplay` (emoji + accessible label). The user asked to refresh the
sets so the machines read as more distinct and fun, with three rules confirmed in review:

- **Wild & Whimsical** → fully re-themed to a bright, whimsical menagerie ("fun colored, animals
  tangential"); unicorn jackpot.
- **Arctic** → retire fox/eagle/owl for other arctic fauna (Arctic Hare, Tundra Swan, Orca).
- **Desert** → retire fox/eagle/owl; add a Cactus; add Scorpion + Bat.
- **Ocean** → keep as-is except the grey Shark → a new-color **Jellyfish** jackpot.
- **No emoji is reused across machines.**

Presentation-only: the 8 engine symbol IDs and their tiers are unchanged — only which glyph/label fills
each slot changes. So no engine change (DEC-001) and no DEC (the symbol *vocabulary*/model, DEC-021/DEC-006,
is unchanged — this is data).

## Goal

Update each machine's `symbolDisplay` emoji + labels to the approved sets, keep every set internally and
cross-machine unique, update the tests that pin symbols, and preview-verify the reels + paytable render the
new glyphs per machine.

## Outputs

- **Files modified:**
  - `src/ui/reels/symbols.ts` — `SYMBOL_DISPLAY` (Wild & Whimsical's map, its only consumer) → the fun set.
  - `src/machines/arctic.ts` — FOX→Arctic Hare 🐇, EAGLE→Tundra Swan 🦢, OWL→Orca 🐋.
  - `src/machines/desert.ts` — FOX→Cactus 🌵, EAGLE→Scorpion 🦂, OWL→Bat 🦇.
  - `src/machines/ocean.ts` — WOLF→Jellyfish 🪼.
  - Pinned-symbol tests: `src/ui/reels/ReelGrid.test.tsx`, `src/ui/paytable.test.ts`,
    `src/ui/PaytableSheet.test.tsx`, `src/machines/arctic.test.ts`, `src/machines/desert.test.ts`,
    `src/machines/ocean.test.ts`, `src/machines/wildAndWhimsical.parity.test.ts`.
- **Files created:** `src/machines/symbol-uniqueness.contract.test.ts` — cross-machine no-duplicate guard.
- No engine change; no dependency; no DEC.

## The approved sets (tier order low→jackpot; 8th = jackpot / WOLF slot)

| Machine | DEER | FOX | SQUIRREL | BEAR | EAGLE | OWL | BISON | WOLF (jackpot) |
|---|---|---|---|---|---|---|---|---|
| Wild & Whimsical | 🐸 Frog | 🐝 Bee | 🐞 Ladybug | 🦋 Butterfly | 🦜 Parrot | 🦩 Flamingo | 🦚 Peacock | 🦄 Unicorn |
| Arctic | 🦌 Caribou | 🐇 Arctic Hare | 🐧 Penguin | 🦭 Seal | 🦢 Tundra Swan | 🐋 Orca | 🦣 Mammoth | 🐻‍❄️ Polar Bear |
| Desert | 🐪 Camel | 🌵 Cactus | 🦎 Gecko | 🐢 Tortoise | 🦂 Scorpion | 🦇 Bat | 🐏 Bighorn Ram | 🐍 Sidewinder |
| Ocean | 🐬 Dolphin | 🐠 Tropical Fish | 🦐 Shrimp | 🦀 Crab | 🐡 Pufferfish | 🐙 Octopus | 🐳 Whale | 🪼 Jellyfish |

All 32 glyphs are distinct across machines (the old shared 🦊/🦅/🦉/🦌 collisions are gone).

## Acceptance Criteria

- [ ] Each machine's `symbolDisplay` matches the table (emoji + label); the 8 engine symbol IDs + tiers
      are unchanged.
- [ ] No emoji is used by more than one machine, and each machine's 8 emoji are internally distinct
      (guarded by `symbol-uniqueness.contract.test.ts`).
- [ ] Reels + paytable render the new glyphs per machine (preview-verified across all four).
- [ ] `git diff … -- src/engine/` EMPTY; no new dependency; no DEC; full gate green.

## Failing Tests / guards

- `symbol-uniqueness.contract.test.ts` — no glyph shared across machines; 8 distinct per machine.
- Pinned-label updates: ocean WOLF `Jellyfish`; arctic FOX/EAGLE/OWL `Arctic Hare`/`Tundra Swan`/`Orca`;
  desert FOX/EAGLE/OWL `Cactus`/`Scorpion`/`Bat`; W&W (parity) WOLF `Unicorn` + DEER `Frog`;
  ReelGrid + paytable + PaytableSheet updated off the old forest glyphs to the fun set.

## Implementation Context

- `DEC-021` — per-machine symbol identity: this swaps glyphs WITHIN that model; no model/vocabulary change,
  so no DEC amendment.
- `DEC-001` — the engine (symbol IDs, tiers, math) is untouched; `symbolDisplay` is pure UI.
- **W&W uses the shared `SYMBOL_DISPLAY`** (its only consumer) rather than a per-machine const, so its
  refresh lands in `src/ui/reels/symbols.ts`; the parity test's `toEqual(SYMBOL_DISPLAY)` stays green.

### Out of scope
- The jackpot **celebration** scene (`JackpotMoment.tsx`) hardcodes a howling-wolf 🐺 motif that is already
  machine-agnostic (it showed a wolf even for Arctic/Desert/Ocean). This refresh does not touch it; whether
  to make the celebration machine-aware (or drop the wolf) is a separate design call, flagged for the user.
- Any engine/tier/vocabulary change; any new machine.

## Notes for the Implementer

Verified by switching machines in the browser and reading each reel's rendered emoji/label from the DOM.

---

## Build Completion

- **Branch:** `feat/spec-065-emoji-refresh`
- **All acceptance criteria met?** yes — all 4 machines' `symbolDisplay` updated to the approved sets;
  cross-machine uniqueness guarded by a new contract test; reels + paytable preview-verified across all
  four machines (DOM read + Ocean screenshot). Engine diff EMPTY; no DEC; full suite green (466, worktree
  excluded).
- **New decisions emitted:** none (presentation data within DEC-021).
- **Deviations from spec:** none in the data. Test churn beyond the machine tests: `ReelGrid.test.tsx`,
  `paytable.test.ts`, `PaytableSheet.test.tsx` also pinned the old W&W forest glyphs (Wolf/Deer/tier
  emoji) and were updated to the fun set — a wider blast radius than the machine-test files the task named,
  because W&W's symbols are the default rendered everywhere.
- **Follow-up identified:** the `JackpotMoment` wolf (out of scope; flagged to the user); the numbering
  gap at SPEC-066 is the concurrently-spawned box-sizing task's worktree (intentional, not a mis-number).

### Build-phase reflection
1. **What was unclear?** — Nothing about the data. The friction was (a) the git-ignored worktree doubling
   local `just test`/`just lint` (resolved by excluding it; CI unaffected), and (b) tracking down the
   non-machine tests that pinned the default W&W glyphs.
2. **Missing constraint/decision?** — No. A grep for the old glyphs up front would have found all the pins
   in one pass.
3. **Do differently?** — Grep the whole `src/` for each retired glyph/label before running the suite, to
   enumerate every pinned reference at once.

---

## Reflection (Ship)

1. **What would I do differently next time?** — Enumerate every test that pins a symbol (grep the retired
   glyphs across all of `src/`, not just the machine tests) before the first run — the default machine's
   symbols surface in ReelGrid/paytable/PaytableSheet tests too, which the task's file list didn't name.
2. **Does any template/constraint/decision need updating?** — No DEC (DEC-021/DEC-006 unchanged — glyph
   swap, not a vocabulary change, exactly as the task scoped). Worth an AGENTS note: git-ignored worktrees
   under `.claude/` are picked up by `eslint .` / vitest locally — CI is fine, but local gate runs need the
   worktree excluded. (Logged to the box-sizing follow-up context.)
3. **Follow-up spec to write now?** — Optional, user's call: make the `JackpotMoment` celebration
   machine-aware (it still shows a wolf howling at the moon regardless of machine / the new unicorn
   jackpot). Not written — flagged.
