---
task:
  id: SPEC-095
  type: task
  cycle: ship
  blocked: false
  priority: medium
  complexity: S

project:
  id: PROJ-006
  stage: STAGE-021
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-29

references:
  decisions:
    - DEC-015
    - DEC-024
  constraints:
    - portrait-first
  related_specs:
    - SPEC-093   # the switcher whose font-size compromise this removes
    - SPEC-088   # the in-app changelog this adds a v1.3 entry to

value_link: "Shortens the default machine's name so the marquee fits it at full size."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Main-loop design + build; owner-driven naming decision made interactively."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 34000
      estimated_usd: 0.68
      recorded_at: 2026-07-29
      note: >-
        Display name to 'Whimsy' (id untouched); parity test asserts both, with the id documented
        as a saved-data key. Marquee restored to --font-size-xl. Changelog v1.3 entry added.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 14000
      estimated_usd: 0.28
      recorded_at: 2026-07-29
      note: >-
        Guard mutation on the id (the saved-data risk) killed by the parity test. Full gate green
        (1036 tests). Real render confirms the name at full marquee size.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 48000
    estimated_usd: 0.96
    session_count: 4
---

# SPEC-095: Rename the default machine to "Whimsy"

## Goal

Rename the default machine's **display name** from "Wild & Whimsical" to "Whimsy", and record it in
the in-app changelog. Owner's call, offered as *"we could change wild & whimsical to just whimsy or
fantasy"*.

"Whimsy" over "Fantasy" because the reels are 🐸🐝🐞🦋🦜🦩🦚 with a 🦄 jackpot — seven real
creatures and one unicorn. "Fantasy" promises a genre the reels don't deliver, and sits oddly in an
app called *Zany Animal Slots* where every machine is animals.

## The important constraint: the id is a saved-data key

`wild-and-whimsical` is persisted in **every trophy record**, in `biggestWin`, and in the
active-machine localStorage value. Renaming the *id* would orphan all of it — trophies would stop
resolving to a machine. So:

- **`name` changes.** `id` does not, ever.
- The exported const (`WILD_AND_WHIMSICAL`) and the filename keep the old spelling, matching the id
  rather than the label. Renaming them would be churn that invites someone to "finish the job" on
  the id itself.
- The parity test asserts the id explicitly, with a comment saying why, so a future tidy-up can't
  quietly break saved data.

## Outputs

- `src/machines/wildAndWhimsical.ts` — `name: 'Whimsy'`.
- `src/machines/wildAndWhimsical.parity.test.ts` — assert the new name **and** the unchanged id.
- `src/ui/machine/machine-switcher.css` — marquee restored to `--font-size-xl`.
- `src/ui/changelog/releases.json` — a v1.3 entry leading with the rename.
- Test fixtures in `MachineSwitcher.test.tsx` / `App.test.tsx` updated.

## Failing Tests

1. `WILD_AND_WHIMSICAL.name` is `'Whimsy'`.
2. `WILD_AND_WHIMSICAL.id` is still `'wild-and-whimsical'` — the saved-data guarantee.
3. The header heading renders the new name (`App.test.tsx`).

## Acceptance

- [x] The default machine reads "Whimsy" in the switcher, and the marquee is back at full size.
- [x] The id is unchanged; existing trophies/balance/active-machine still resolve.
- [x] A v1.3 changelog entry leads with the rename and states saved progress is untouched.
- [x] Already-published changelog entries are **not** rewritten (owner's call) — v1.0/v1.1/v1.2
      still say "Wild & Whimsical", which is what players actually saw at the time.
- [x] No machine math/symbol/theme change; no `src/engine/**` diff.

## Guard Mutation

| # | Mutation | Killed by |
|---|---|---|
| 1 | Change the machine's `id` to `whimsy` (the tempting "tidy-up") | parity test's id assertion — this is the mutation that matters, because the production failure mode is silent: every existing trophy would orphan |

## The side benefit

SPEC-093 had to step the marquee down from `--font-size-xl` to `lg` purely because
"Wild & Whimsical" (16 chars) truncated at 375px. At 6 characters that pressure is gone, so the
marquee gets its full size back — a styling compromise removed at its source rather than worked
around. The `text-overflow: ellipsis` safety net stays: a future long name should truncate visibly
and prompt a re-check, not clip silently.

## Reflection (Ship)

1. **What would I do differently next time?** — Nothing about the execution; the useful note is
   about *what made this cheap*. The rename was a one-line change precisely because SPEC-050's
   original design separated the machine's `id` (stable key) from its `name` (label). Had display
   names been used as keys — an easy shortcut back when there was only one machine — this would
   have been a data migration rather than a string edit. Worth remembering when the next "just a
   rename" arrives: check whether the thing being renamed is a **key** before estimating it.

2. **Does any template, constraint, or decision need updating?** — No. DEC-015 (machines are
   config-as-data) already implies names are data; nothing needed amending. The
   id-as-saved-data-key rule now lives in the parity test with its rationale, which is a better
   home than a DEC because it fails loudly at exactly the moment someone tries to break it.

3. **Is there a follow-up spec I should write now before I forget?** — SPEC-096 is already queued in
   this stage (restore the app title, relocate the switcher below the readout) from the owner's
   follow-up. One deliberate inconsistency to flag rather than silently fix: **v1.0–v1.2 changelog
   entries still say "Wild & Whimsical"**, by the owner's explicit choice — they describe releases
   as players experienced them. If that ever reads as a bug, the fix is a footnote, not a rewrite.
