---
task:
  id: SPEC-091
  type: story
  cycle: ship
  blocked: false
  priority: low
  complexity: M

project:
  id: PROJ-005
  stage: STAGE-019
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-25

references:
  decisions:
    - DEC-001
    - DEC-015
    - DEC-021
    - DEC-026
    - DEC-027
  constraints:
    - engine-no-dom
  related_specs:
    - SPEC-053   # Ocean — the machine template + measure-then-pin discipline
    - SPEC-090   # Farm — the high-variance opposite; its reflection set this spec's band discipline

value_link: "The Diner machine — the generous, high-hit-rate sixth machine, as pure config."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-25
      note: >-
        Designed + built inline: the tuning is an iterative simulator loop (measure-then-pin) tightly
        coupled to `just simulate`, so it was done on the main loop rather than handed to a subagent.
        Authored DEC-027 and STAGE-019.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 78000
      estimated_usd: 1.56
      recorded_at: 2026-07-25
      note: >-
        diner.ts (food-and-drink symbols, warm amber theme — contrast 16.78:1, audio params) +
        generous math tuned over 9 simulator iterations to RTP ~95.0% / hit ~44.9% / big ~4.5% /
        jackpot ~1-in-30k, then pinned across 6 seeds at 200k spins. Registered in registry.ts
        (selector auto-lists it). diner.test.ts (6 tests: registration, vocabulary, metrics-sanity
        with a TIGHT band, strip integrity, distinctness, per-token theme a11y).
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 24000
      estimated_usd: 0.48
      recorded_at: 2026-07-25
      note: >-
        Five guard mutations run, each killed by its named input (see ## Guard Mutations). Real
        render in the browser preview: Diner selectable as the 6th option, warm theme + food
        symbols. Contracts + full gate green. 0 defects.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-25
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 102000
    estimated_usd: 2.04
    session_count: 4
---

# SPEC-091: Diner machine (generous / high-hit-rate)

## Goal
A sixth machine — Diner — with a food-and-drink identity, a warm amber/red theme, and generous
tuned math: wins land on nearly half of all spins, and land small (~95% RTP, ~44.9% hit-frequency).
Pure config; no engine change. This is the personality DEC-026 explicitly deferred when it chose
high-variance for Farm.

## Outputs
- `src/machines/diner.ts` — the machine (symbols, weights, paytable, theme, audio).
- `src/machines/registry.ts` — register DINER (selector auto-lists it).
- `src/machines/diner.test.ts` — registration, vocabulary, metrics-sanity, strip, distinctness, a11y.
- `decisions/DEC-027-diner-machine.md`.

## Acceptance
- [x] Diner is the 6th selectable machine; own food symbols (🍕🍔🌮🍩🍜🥤🍣🎂) + warm amber theme.
- [x] Measures GENEROUS: hit-frequency ~44.9% — the roster's highest, above Ocean's 37.6% — at
      RTP ~95.0%, big-tier ~4.5%, jackpot ~1-in-30k. Pinned via `just simulate diner` across 6 seeds.
- [x] Passes symbol-uniqueness + machine-parity contracts; default machine unchanged; engine diff empty.
- [x] Theme contrast ≥ WCAG AA (text-on-bg 16.78:1; every foreground token ≥ 9.21:1). Tokens only.
- [x] The metrics-sanity RTP band is tight (0.92–0.99, ~7 points) and demonstrably has teeth —
      directly addressing SPEC-090's reflection that Farm's 17-point band was close to a no-op.

## Guard Mutations
Each prescribed mutation ships with the input that kills it. All five run at verify; all five failed
as predicted, and the suite returned green on restore.

| # | Mutation | Killed by |
|---|---|---|
| 1 | `DINER_WEIGHTS.DEER` `10 → 7` (flatten toward Farm) | metrics-sanity (`hitFrequency` falls below 0.43) **and** strip integrity (tally no longer equals `reelWeights`) — 2 tests |
| 2 | `DINER_PAYTABLE.low` 4-of-a-kind `2 → 3` | metrics-sanity (`rtp` rises to ~1.05, above the 0.99 ceiling) — this is the mutation that proves the tight band is not decorative |
| 3 | `DINER_SYMBOLS.WOLF.emoji` `🎂 → 🚜` (Farm's tractor) | cross-machine symbol-uniqueness contract |
| 4 | Remove `[DINER.id]: DINER` from `registry.ts` | registration test (`getMachine('diner')` no longer resolves) |
| 5 | `--color-accent` `#ff9f43 → #8a3a1c` (the frame brown, dark-on-dark) | theme-a11y test's per-token loop — note the text-only assertion still passes, which is why the loop over every foreground token exists |

## Implementation Context

Machines are config-as-data (DEC-015): a new file under `src/machines/`, registered in
`registry.ts`, plus a test and a DEC. No engine change (DEC-001) — the engine never sees theme or
audio. Symbols are per-machine (DEC-021) and must not collide with any other machine's glyphs
(the `symbol-uniqueness` contract).

**Tuning method (measure-then-pin, 9 iterations).** The generosity lever is *hit-frequency*, driven
entirely by `reelWeights`; the paytable then has to be shallow enough to make that hit rate
affordable. The path: an initial steep-weight + rich-paytable guess measured **RTP 295%**; cutting
the paytable alone reached 127% at 55% hit-frequency, which showed the low tier was the whole
problem — at that hit rate even a 1× low 3-of-a-kind is unaffordable. Backing the low-end weights
down to `DEER 10 / FOX 9 / SQUIRREL 8` dropped hit-frequency to ~45% and opened the headroom; the
last ~10 points were dialled in on the low 4-of-a-kind rung alone (`3 → 2`), confirming DEC-026's
finding that 4ok is the dominant RTP lever.

**Band discipline (the SPEC-090 lesson).** Farm's metrics-sanity RTP band is `0.85–1.02` — 17 points
wide, because high variance genuinely is noisy. Do **not** copy that width here. Diner is
low-variance and measures quietly (0.42-point spread across six 200k seeds), so its band is
`0.92–0.99` and catches real drift. Band width follows measured variance; verify it with a mutation
rather than asserting it.
