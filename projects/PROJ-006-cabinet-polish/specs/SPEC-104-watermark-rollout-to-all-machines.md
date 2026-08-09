---
task:
  id: SPEC-104
  type: task
  cycle: ship
  blocked: false
  priority: medium
  complexity: S

project:
  id: PROJ-006
  stage: STAGE-023
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-29

references:
  decisions:
    - DEC-010
    - DEC-015
  constraints:
    - portrait-first
  related_specs:
    - SPEC-098   # the watermark + its one-machine trial gate
    - SPEC-101   # the clipping fix that made it safe to roll out

value_link: "Every machine gets its own symbol watermark, not just the trial one."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Main-loop; owner's go after living with the Whimsy-only trial."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 22000
      estimated_usd: 0.44
      recorded_at: 2026-07-29
      note: "One `pattern: true` line per machine (5) + a v1.3 changelog highlight. No new code."
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 14000
      estimated_usd: 0.28
      recorded_at: 2026-07-29
      note: >-
        Computed face/deck watermark contrast for all six palettes; rendered Arctic (the faintest at
        1.78:1) to confirm it is legible rather than trusting the number. Full gate green (1038).
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 36000
    estimated_usd: 0.72
    session_count: 4
---

# SPEC-104: Watermark rollout to all machines

## Goal

Owner: *"I would like to roll out the watermark."* SPEC-098 shipped it gated to Whimsy so it could
be judged on one machine first; this turns it on for the other five.

## What it took

**Five lines.** `presentation.pattern = true` per machine, plus a v1.3 changelog highlight. No new
code, no per-machine artwork, no engine change — which is the payoff of having built it as
config-as-data (DEC-015) with the colour coming from each machine's own `--color-frame`.

## Measured contrast (face = frame-on-surface, deck = bg-on-frame)

| Machine | Face | Deck |
|---|---|---|
| Whimsy | 2.52:1 | 2.97:1 |
| Ocean | 2.43:1 | 3.08:1 |
| Farm | 2.42:1 | 2.93:1 |
| Desert | 2.38:1 | 2.92:1 |
| Diner | 2.16:1 | 2.45:1 |
| **Arctic** | **1.78:1** | 2.18:1 |

These are deliberately low — the watermark is `aria-hidden` decoration carrying no information, so
text-contrast minimums do not apply to it. **Arctic is the outlier** and was rendered rather than
trusted: its caribou/seal/mammoth silhouettes are fainter than the rest but genuinely legible. Left
as-is; per-machine tuning would mean overriding a theme value, which DEC-015 treats as data.

## Acceptance

- [x] All six machines show a watermark built from their own reel symbols.
- [x] Arctic — the faintest — verified by render, not by number.
- [x] v1.3 changelog gains a player-facing line.
- [x] Full gate green; no `src/engine/**` diff; `src/ui/audio/**` untouched.

## Reflection (Ship)

1. **What would I do differently next time?** — Nothing; this is what a good gate looks like paying
   off. SPEC-098's `pattern?: boolean` opt-in cost one optional field and made "try it on one" and
   "turn it on everywhere" the same mechanism. Worth naming as a pattern: when shipping something
   whose value is a *taste* judgement, ship it behind a per-instance flag rather than globally —
   the trial and the rollout are then the same code, and the rollout is a review of data, not a
   re-implementation.

2. **Does any template, constraint, or decision need updating?** — No. DEC-015 already covers
   machines-as-data and the flag is ordinary config. One judgement recorded rather than acted on:
   Arctic's watermark could be made to match the others by lightening its `--color-frame`, but that
   would change a *theme value* to serve a decoration — the wrong direction. A future spec that
   wants uniform watermark strength should introduce a dedicated token, not retune palettes.

3. **Is there a follow-up spec I should write now before I forget?** — SPEC-105 (the paw-print) is
   already queued in this stage and is the last visual item before the project can close. After that:
   the project ship itself, which **must** include a `RELEASES.md` entry — PROJ-006 is the most
   player-visible wave since the Trophy Case and currently has no player-facing notes at all.
