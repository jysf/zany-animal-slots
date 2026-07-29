---
task:
  id: SPEC-093
  type: story
  cycle: ship
  blocked: false
  priority: medium
  complexity: S

project:
  id: PROJ-006
  stage: STAGE-020
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-29

references:
  decisions:
    - DEC-001
    - DEC-010
    - DEC-015
    - DEC-028
  constraints:
    - portrait-first
    - touch-targets-44
  related_specs:
    - SPEC-050   # the <select> machine selector this replaces
    - SPEC-068   # the header-controls row this un-crowds
    - SPEC-092   # the framing this lands on top of

value_link: "The switcher half of STAGE-020 — gives the machine name a home and un-crowds the header."

cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-29
      note: "Designed + built inline on the main loop, alongside the browser preview."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 62000
      estimated_usd: 1.24
      recorded_at: 2026-07-29
      note: >-
        MachineSwitcher.tsx + machine-switcher.css replacing MachineSelector (deleted, incl. its
        test + CSS — no dead code). Header rewired; controls row 5 to 4 icons. 11 tests
        (stepping, wrap-around both ends, a11y group/labels, keyboard parity, aria-live,
        unknown-id fallback) + the touch-target contract repointed at the new arrow.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 26000
      estimated_usd: 0.52
      recorded_at: 2026-07-29
      note: >-
        Five guard mutations, each killed by its named input. Real render at 375px: stepping,
        wrap-around, and ArrowLeft/Right all exercised in the browser; aria-live confirmed present
        on the live node. Two truncation fixes found only by rendering (see Reflection). Full gate
        green (1036 tests); no console errors.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-29
      note: "main-loop ship; own PR."
  totals:
    tokens_total: 88000
    estimated_usd: 1.76
    session_count: 4
---

# SPEC-093: Machine switcher — prev/next arrows + marquee name

## Goal

Replace the machine `<select>` with a prev/next stepper, and promote the machine name to the
header's marquee line. The owner's framing: *"a cleaner way to change the machine, that control is
not great… perhaps we can do like arrows, and have the current machine name be somewhere in the
UI."*

## The problem

`MachineSelector` was a `<select>` competing for width with four icon triggers in a five-item
header row (SPEC-068). At 375px it truncated to **"Wild & Whi⌄"** — the machine you are playing was
the least readable thing in the header, while the app's static title ("Zany Animal Slots") occupied
the prominent marquee line instead.

## Outputs

- `src/ui/machine/MachineSwitcher.tsx` + `machine-switcher.css` — the stepper and its marquee.
- `src/ui/regions/Header.tsx` — switcher becomes the headline row; controls row drops to 4 icons.
- **Deleted:** `MachineSelector.tsx`, `MachineSelector.test.tsx`, `machine-selector.css`
  (convention: no dead code).
- `src/ui/controls.touch-target.test.ts` — repointed at `.machine-switcher__arrow`.
- `src/ui/App.test.tsx` — the header heading now names the active machine, not the app.

## Failing Tests

1. The active machine's name renders as the marquee **heading**.
2. Prev/next expose accessible names inside a `role="group"` labelled "Machine".
3. Next steps forward through the roster; prev steps back.
4. **Wrap-around at both ends** — next from the last machine reaches the first, and vice versa.
5. **Keyboard parity** — ArrowLeft/ArrowRight on the group step machines.
6. **Screen-reader parity** — the name is `aria-live="polite"`.
7. An unknown active id falls back to the first machine rather than stepping from a phantom index.
8. (touch-target contract) `.machine-switcher__arrow` is ≥44px.

## Acceptance

- [x] Machine switching is `◀ Name ▶`; the name is the header's most prominent element.
- [x] The controls row is 4 icons; no truncation of any machine name at 375px.
- [x] Keyboard and screen-reader behaviour is at least as good as the `<select>` it replaced.
- [x] Verified by real render; full gate green; no `src/engine/**` diff; `src/ui/audio/**` untouched.

## Guard Mutations

| # | Mutation | Killed by |
|---|---|---|
| 1 | Clamp instead of wrap (`Math.min/max` for the modulo) | test 4 — **2 failures**, both wrap directions |
| 2 | `ArrowLeft` → a key that is never pressed | test 5 — keyboard parity with the old select is lost |
| 3 | Remove `aria-live="polite"` | test 6 — the switch stops being announced |
| 4 | `current = index` (drop the `-1` fallback) | test 7 — an unknown id renders nothing and steps from a phantom position |
| 5 | Arrow `min-height/width` → `--space-5` (24px) | touch-target contract — below the 44px floor |

## Implementation Context

**A native `<select>` gave three things for free**: keyboard switching, screen-reader announcement
of the new value, and a platform picker UI. Replacing it means re-earning the first two by hand —
they are *parity*, not enhancements, and tests 5 and 6 exist so a future refactor can't quietly
drop them. The third (random access to any machine) is genuinely lost; that is what SPEC-094's
picker sheet is for, deferred by owner decision.

**Wrap-around** is right at six machines — stepping should never dead-end when the roster is small
enough to cycle. Revisit if the roster grows past ~8, which is also the trigger for SPEC-094.

## Reflection (Ship)

1. **What would I do differently next time?** — Size text against the *worst-case content*, not the
   typical case. Promoting the name to the marquee inherited the old title's styling —
   `font-size: xl` plus two flanking 🎰 emoji — and neither survived contact with the longest
   machine name. "Wild & Whimsical" (16 chars) rendered as **"Wild & …"**, i.e. *worse truncation
   than the `<select>` this spec exists to replace.* It took two more renders to fix: drop the
   decorative emoji (~70px), then step the marquee down to `--font-size-lg`. Both were obvious in a
   screenshot and invisible in the code. The reusable rule, and the second time this stage has
   produced it: **for visual work the render is the test.** Concretely: when promoting an element,
   re-derive its sizing from what it must now hold — inherited styling encodes the *old* content's
   constraints.

2. **Does any template, constraint, or decision need updating?** — No. DEC-028 covers the framing
   this sits in and needed no amendment; this spec is a component swap, not a new architectural
   choice, so it takes no DEC of its own. Worth stating plainly for whoever picks up SPEC-094: the
   `<select>`'s **random access is a real loss**, not a wash. Six machines are fine to step through,
   but a player who wants to jump from Wild & Whimsical to Diner now presses next five times (or
   prev once). Wrap-around softens it; the picker sheet is the actual fix.

3. **Is there a follow-up spec I should write now before I forget?** — No new spec. SPEC-094 (picker
   sheet) already exists as a planned, deliberately-deferred item with its trigger conditions in the
   PROJ-006 brief; what this spec adds is a sharper *why* (random access), which is the useful thing
   to carry forward. STAGE-020's remaining backlog is therefore only that deferred item, so the
   stage is ready to ship. Still open and untouched here: the owner's "could be nicer" note on the
   chrome — the heavier arcade treatment remains available on the token layer without restructuring
   — and the real-iPhone Safari check, which now covers a new interactive control as well as layout.
