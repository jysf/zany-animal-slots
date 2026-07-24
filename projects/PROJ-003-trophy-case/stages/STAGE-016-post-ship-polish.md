---
stage:
  id: STAGE-016
  status: active                    # proposed | active | shipped | cancelled | on_hold
  priority: medium
  target_complete: null

project:
  id: PROJ-003
repo:
  id: animal-slots

created_at: 2026-07-24
shipped_at: null

value_contribution:
  advances: >-
    Protects the project thesis from its own success: the trophy case became so prominent that
    it buried the session numbers, which the user values equally. This stage makes both
    first-class instead of trading one for the other.
  delivers:
    - "A tabbed record sheet (Trophies / Numbers) — neither surface buried, neither requiring a scroll past the other."
  explicitly_does_not:
    - "Change the trophy case, the stats model, storage, or any recorded data."
    - "Add a sixth header control — the tabs live inside the existing sheet."
    - "Touch src/ui/audio/** or src/engine/**."
---

# STAGE-016: Post-ship polish

## What This Stage Is

Same-day feedback on the shipped Trophy Case. SPEC-079 inverted the record sheet's hierarchy so
trophies led and the numbers followed — an **agent-made design decision, not a user-agreed one**.
Playing it, the user's verdict was that both surfaces are worth having and one shouldn't be
buried under the other. The merged sheet is ~1537px tall on an 812px screen, so reaching the
numbers means scrolling the entire trophy case.

This stage replaces the stacked layout with **two tabs** inside the same sheet.

## Why Now

It is a small correction to a surface that shipped hours ago, and leaving it means the stats —
which predate this project and were fine — stay degraded by a change this project made.

## Success Criteria

- Both surfaces are reachable in one tap from the open sheet, with no scrolling past one to
  reach the other.
- The sheet's height per tab is roughly one screen at 375px.
- No header control is added.
- No change to trophies, stats, storage, or recorded data.

## Spec Backlog

- [~] SPEC-080 — Tabbed record sheet: Trophies / Numbers (built, PR #93, awaiting user test).
- [ ] SPEC-081 (design) — Quiet by default: remove the ambient-bed loop + default sound to OFF.
      User play-test found the default-on looping bed "terrible". DEC-025.

**Count:** 0 shipped / 2 active / 0 pending

## Design Notes

- The sheet already has a clean seam: `<TrophyCase />` then `<h3 class="stats__divider">` then
  the tile grid + sparkline + clear button. Tabs wrap those two blocks; the divider heading is
  subsumed by the tab label.
- **Clear record** is global (it clears both), so it should stay visible regardless of tab
  rather than living inside one.
- Tab state is ephemeral (component state, reset when the sheet closes) — no new persisted key.
  Persisting it would mean a new `localStorage` entry for a trivial preference.

## Dependencies

### Depends on
- **STAGE-015** — the case and the sheet this reorganizes.

### Enables
- A calmer home for anything else the record sheet later needs to show.

## Stage-Level Reflection

*Filled in when status moves to shipped.*
