---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-010                     # the roadmap's reserved Help slot (auto-tool assigned 013; renumbered)
  status: shipped                   # proposed | active | shipped | cancelled | on_hold
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

# Framing-review gate for the autonomous overnight orchestrator. The user reviewed this frame
# and APPROVED building it interactively on 2026-07-09 ("go"), so the gate is now open and the
# backlog may be driven through the cycle. (See the task's safety rails.)
framing_approved: true

project:
  id: PROJ-002                      # parent project
repo:
  id: animal-slots

created_at: 2026-07-09
shipped_at: 2026-07-10

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    The "comprehension" half of PROJ-002's thesis and its most concrete success signal — "a first-time
    player understands how to play without external help." PROJ-001's live game failed a real tester who
    couldn't understand it; the fun retune (STAGE-008) and stats (STAGE-009) made it worth playing, but
    a first-timer still lands on a slot cabinet with no explanation. This stage adds an in-app
    how-to-play surface so the rules and controls are legible on first contact.
  delivers:
    - "A first-run onboarding explainer that auto-appears once for a new player (rules + controls in plain language) and does not nag on return."
    - "A persistent 'How to play' entry point in the cabinet header so the explainer can be re-opened anytime."
  explicitly_does_not:
    - "Add a backend, network, or analytics — client-only; the first-run-seen flag is localStorage (zany:*, never throws — DEC-005). Analytics is STAGE-011."
    - "Change the engine or any game behavior (DEC-001) — pure presentation/UX."
    - "Duplicate the full paytable — the Paytable sheet already explains paylines + payouts; Help links to it, it does not re-list payouts."
    - "Add a guided/interactive tutorial, tooltips-on-every-control, or multi-step coach-marks — a single legible explainer is the framed scope; richer onboarding is a possible later wave."
---

# STAGE-010: Help / how-to-play

## What This Stage Is

A stage that makes the game **legible to a first-timer**. When it ships, a new player who opens the
cabinet is shown a short, plain-language how-to-play explainer **once** (auto-opened on first visit,
remembered so it never nags on reload), and can re-open it anytime from a **"How to play"** trigger in
the cabinet header. The explainer covers the essentials a tester needs to start playing confidently:
the goal (match symbols left-to-right on the paylines), the controls (bet −/+, Spin, Auto, Reset), where
to find the paytable / machine selector / stats / mute, and the play-money-only disclaimer. It is
client-only and pure presentation — it reads nothing from the engine and changes no game behavior; the
only persisted state is a "seen" flag under the `zany:*` namespace (never throws — DEC-005).

## Why Now

PROJ-001 shipped a live game that a real tester **couldn't understand** — the brief names this as the
comprehension failure and makes "a first-time player understands how to play without external help" a
top-line success criterion. STAGE-008 (fun retune) and STAGE-009 (progress/stats) fixed the "not fun"
half; this fixes the "couldn't understand it" half. It is independent of STAGE-011 (analytics) and can
ship before it. The substrate is warm: the in-app **sheet idiom** (trigger + slide-up + backdrop + Esc/
focus) is already proven three times over (PaytableSheet, StatsSheet, and the machine selector), and the
**safe-localStorage + `zany:*` namespace** pattern (activeMachineStorage / statsStorage) is ready to
reuse for the first-run-seen flag.

## Success Criteria

- **Legible on first contact:** a first-time visitor is automatically shown the how-to-play explainer
  once, without any action, and can start playing after reading it (fixes the observed tester failure).
- **Non-nagging + re-openable:** the explainer does not reappear on reload once seen; a persistent
  "How to play" header trigger re-opens it on demand. The seen-flag survives reload and degrades to
  "not seen" on an unavailable/corrupt store (never throws — DEC-005).
- **Covers the essentials, doesn't duplicate the paytable:** goal, the four controls (bet −/+, Spin,
  Auto, Reset), where the paytable / machines / stats / mute live, and the play-money disclaimer — with
  a pointer to the Paytable sheet for payouts rather than re-listing them.
- **Boundaries intact:** DEC-001 holds — the engine is untouched (`git diff … -- src/engine/` EMPTY);
  DEC-005 holds — no backend/network. Token-only CSS, no raw hex (DEC-010); ≥44px targets
  (touch-targets-44); portrait-first; reduced-motion fallback.
- **`just typecheck && just lint && just test && just build && just validate && just cost-audit` pass.**

## Scope

### In scope
- **First-run-seen storage + seam** — a safe `localStorage` helper under `zany:help-seen` (mirroring
  `activeMachineStorage.ts` / `statsStorage.ts`: guarded, never throws, degrades to "not seen") plus a
  small reactive seam a component can read/set.
- **Help sheet UI + header trigger** — a `HelpSheet` mirroring `PaytableSheet` (trigger + slide-up +
  backdrop + Esc/focus), rendering the how-to-play content; a **"How to play"** (or "?") cabinet-header
  trigger; **auto-opened once** on first run (reads the seam), marking seen on dismiss.

### Explicitly out of scope
- Backend / network / analytics (STAGE-011); any engine or behavior change (DEC-001).
- Re-listing paytable payouts (link to the Paytable sheet instead).
- Interactive/guided tutorial, per-control tooltips, or multi-step coach-marks — a single explainer only.

## Spec Backlog

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

Ordered infrastructure-before-UI, matching the SPEC-054→056 pattern (safe storage seam → sheet UI).

- [x] SPEC-059 (shipped, PR #69) — **First-run-seen storage + seam** *(infra)*: a safe `zany:help-seen`
      helper mirroring `statsStorage.ts` (guarded get/set, never throws — DEC-005) + a no-op-default reactive
      seam (`useHelpSeen` / `HelpSeenProvider`, default `seen: true` so App.test never auto-opens) exposing
      `seen` + `markSeen()`, wired into `main.tsx`. No UI. Authored **DEC-022** (the onboarding model).
      Engine diff EMPTY (DEC-001); 12 new tests, 420/420 green; 2 adversarial guard-mutations proven. **[S]**
- [x] SPEC-060 (shipped, PR #70) — **Help sheet UI + header trigger + first-run auto-open** *(UI)*: a
      `HelpSheet` mirroring `PaytableSheet`/`StatsSheet` with a "How to play" cabinet-header trigger,
      rendering the plain-language how-to-play content (goal, four controls, where things are, play-money
      disclaimer, pointer to Paytable), **auto-opened once** on first run via the SPEC-059 seam and marking
      seen on first dismiss (DEC-022). Engine + seam diffs EMPTY (DEC-001); 5 new tests, 425/425 green; 2
      adversarial guard-mutations proven; preview-verified. **[M]**

**Count:** 2 shipped (SPEC-059, SPEC-060) / 0 active / 0 pending — 1×S + 1×M. Backlog COMPLETE.

## Design Notes

*Settled at frame (with rationale); anything genuinely design-cycle work is flagged.*

- **(1) One explainer, two entry points — SETTLED.** Rather than build a separate first-run overlay AND
  a Help section, build ONE `HelpSheet` and reach it two ways: auto-opened once on first run, and via a
  persistent header trigger. Leanest surface, single source of content, mirrors the proven sheet idiom.
- **(2) First-run detection — a single `zany:help-seen` flag — SETTLED.** Show the sheet automatically
  iff the flag is absent/false; set it true when the sheet is first dismissed. Safe storage mirrors
  `activeMachineStorage.ts` / `statsStorage.ts` (guarded, never throws — DEC-005); a corrupt/unavailable
  store degrades to "not seen" (worst case: the explainer shows again — harmless). The exact flag shape
  (bare boolean vs. a `{ version, seen }` blob for future-proofing) is a SPEC-059 design call.
- **(3) Content set — SETTLED (copy is SPEC-060 design work).** The explainer covers: the **goal**
  (match 3+ symbols left-to-right on a payline), the **four controls** (bet −/+, Spin, Auto, Reset —
  and that Reset tops the wallet back up / counts as a cash-in), **where things live** (ℹ Paytable, the
  machine selector, 📊 Stats, 🔊 mute), and the **play-money-only** disclaimer. It **points to** the
  Paytable sheet for payouts instead of duplicating them. Exact wording/layout is SPEC-060 design.
- **(4) Whether a DEC is warranted — decide at SPEC-059 design.** The first-run-seen semantics + the
  "one sheet, auto-opened once, non-nagging" onboarding approach is a small cross-cutting UX decision;
  it may deserve a lightweight **DEC-022** (authored at SPEC-059 design, like DEC-020 was authored at
  SPEC-054), or it may be small enough to live in these Design Notes. Framing does not write the DEC.
- **Engine untouched (DEC-001).** Pure presentation; the Help content is static copy. Every spec's
  `git diff … -- src/engine/` must be EMPTY.

## Dependencies

### Depends on
- **PROJ-001 (shipped):** the `PaytableSheet` sheet idiom the `HelpSheet` mirrors; the cabinet header
  the trigger joins; the `src/ui/storage.ts` safe-localStorage idiom.
- **STAGE-007 (shipped):** the `zany:*` namespace + Context-over-localStorage pattern (SPEC-049) and the
  safe per-key storage helpers (activeMachineStorage) reused for the seen flag.
- **STAGE-008 / STAGE-009 (shipped):** a game now worth explaining (fun + measurable), and the header
  controls (machine selector, 📊 Stats) the explainer points a first-timer to.

### Enables
- Removes the last blocker on the brief's comprehension criterion; a cleaner first-run experience that a
  later wave could extend (interactive tutorial, contextual tips) if analytics (STAGE-011) shows drop-off.

## Stage-Level Reflection

*Filled in when status moves to shipped (2026-07-10).*

- **Did we deliver the outcome in "What This Stage Is"?** **Yes.** A first-timer who opens the cabinet
  is now shown a short, plain-language how-to-play explainer **once** (auto-opened on first visit,
  remembered so it never nags on reload), and can re-open it anytime from the persistent **"How to play"**
  header trigger. The explainer covers the goal, the four controls, where things live, and the play-money
  disclaimer, and points to the Paytable for payouts. This closes the brief's top-line comprehension
  criterion — the observed PROJ-001 tester failure ("couldn't understand it") is fixed end-to-end.
- **How many specs did it actually take?** **2, exactly as planned** (SPEC-059 storage/seam infra →
  SPEC-060 sheet UI). The infra-before-UI split (mirroring SPEC-054→056) held with zero re-scoping.
- **What changed between starting and shipping?** Nothing material — both specs shipped verbatim from
  their design drop-ins with zero deviations; the only mid-stream event was the framing gate opening
  (`framing_approved: true`) after the user reviewed the frame.
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - Any new `*__trigger` control must be hand-added to the `controls.touch-target.test.ts` `CONTROLS`
    array (that guard enumerates triggers explicitly; it does not auto-discover) — worth a one-line
    AGENTS note under the testing conventions.
  - The Context-over-safe-storage seam (machine → stats → help) and the overlay sheet idiom
    (paytable → stats → machine-selector → help) are each now proven a fourth time: they are the repo's
    standard shapes for a persisted client flag and an in-app panel, respectively.
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - From SPEC-060: for a first-run auto-open, read the seam's **mount-time** value via a `useState`
    initialiser (not a `useEffect`) so there is no flash of closed-then-opened, and so the no-op-default
    `seen: true` keeps provider-less consumers (App.test) green without wrapping.
  - From SPEC-059: the storage default (`false` = not seen) and the provider no-op default
    (`seen: true` = don't auto-open) must point in **opposite** directions — that inversion is the whole
    onboarding contract (DEC-022).
