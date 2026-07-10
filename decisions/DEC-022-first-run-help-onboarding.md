---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-022
  type: decision
  confidence: 0.82                   # honest: a small, reversible UX policy; the shape is well-grounded
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

# Decisions are repo-level, but it's useful to track which project caused them.
project:
  id: PROJ-002
repo:
  id: animal-slots

created_at: 2026-07-09
supersedes: null
superseded_by: null

# Path globs this decision governs.
affected_scope:
  - "src/ui/help/**"

tags:
  - onboarding
  - first-run
  - localStorage
  - ux
---

# DEC-022: First-run help / how-to-play onboarding model

## Decision

The how-to-play explainer is **one** in-app sheet reached **two** ways — a persistent
"How to play" header trigger and an **auto-open-once** on first run — where "first run"
means the **absence of a truthy `zany:help-seen` flag** in `localStorage`; the flag is
set `true` the first time the sheet is dismissed, is stored as a **single versioned JSON
blob** (`{ version, seen }`) via a guarded, never-throwing storage helper, and **degrades
to "not seen"** (the explainer shows again) whenever the store is absent, corrupt, or
wrong-version.

## Context

PROJ-002's brief names comprehension as a top-line success signal: "a first-time player
understands how to play without external help — the observed tester failure is fixed."
STAGE-010 delivers that. Framing (STAGE-010) left one cross-cutting choice to settle at
the first spec's design (SPEC-059): the **first-run-seen semantics** and the
one-sheet-two-entry-points onboarding policy. These choices are shared by both STAGE-010
specs (SPEC-059 storage/seam, SPEC-060 sheet/auto-open) and are the kind of small product
policy a later wave (an interactive tutorial, contextual tips) or STAGE-011 analytics
("did the player see onboarding?") would build on — so they are pinned in a DEC, mirroring
how DEC-020 pinned the session-stats model at SPEC-054.

Constraints in play: DEC-005 (no backend — the flag is `localStorage` only, best-effort,
never throws); DEC-001 (pure presentation — the engine is untouched); DEC-010 (token-only
CSS); `touch-targets-44`; `respect-reduced-motion`. The proven substrate is the sheet idiom
(PaytableSheet/StatsSheet) and the `zany:*` safe-storage pattern
(activeMachineStorage.ts / statsStorage.ts).

## Alternatives Considered

- **Option A: A separate first-run overlay AND a distinct Help section.**
  - What it is: a bespoke welcome/onboarding modal shown once, plus an independent
    always-available help panel with its own content.
  - Why rejected: two components and two copies of the same content to keep in sync, for a
    small game whose "help" is a few sentences. Higher build + maintenance cost, divergent
    copy risk, no user benefit over one sheet reached two ways.

- **Option B: Bare boolean flag under the key (like `activeMachineStorage`'s bare string).**
  - What it is: store `"true"` / `"1"` directly at `zany:help-seen`, no wrapper object.
  - Why rejected: statsStorage already established the **versioned-blob** pattern for
    anything that might evolve; a `{ version, seen }` blob costs one line and buys a clean
    forward-compatible migration path (e.g. a future `{ version: 2, seen, dismissedAt }`)
    with the same absent/corrupt/stale ⇒ default degrade the rest of the repo uses.

- **Option C: Re-show the explainer every N sessions, or offer a "don't show again" opt-out
    checkbox.**
  - What it is: nag-style re-prompting or an explicit suppression control.
  - Why rejected: over-engineered for the failure being fixed (a first-timer not knowing how
    to start). The persistent header trigger already makes the explainer re-openable on
    demand, which is the honest version of "let the player decide." Once-and-done + always
    re-openable is the least-annoying policy.

- **Option D (chosen): One sheet, two entry points; first-run = absence of a versioned
    `zany:help-seen` blob; mark seen on first dismiss; degrade to "not seen".**
  - What it is: the Decision above.
  - Why selected: leanest surface with a single content source; reuses the two proven
    patterns (sheet idiom + versioned safe storage) verbatim; "degrade to not seen" fails
    toward helpfulness (a broken store re-shows the explainer, never hides it or throws),
    consistent with DEC-005's never-throw contract.

## Consequences

- **Positive:** Fixes the brief's comprehension criterion with the smallest possible
  surface. One content source, no sync risk. The no-op-default context (`seen: true` when
  provider-less) keeps `App.test` green with no wrapping — the same rail StatsProvider/
  MachineProvider follow. Forward-compatible flag shape.
- **Negative:** A **permanently unwritable** store (e.g. private mode with storage disabled)
  re-shows the explainer on every full page load, since the "seen" write silently no-ops.
  Accepted: it is honest to DEC-005 and strictly better than hiding help or throwing; within
  a single session the in-memory `seen` state suppresses re-opens after the first dismiss.
- **Neutral:** The flag is per-browser and anonymous (no accounts, no cross-device sync —
  consistent with stats being per-browser). It is not analytics; whether onboarding was seen
  is not reported anywhere (that would be STAGE-011, opt-in).

## Validation

Right if a first-time visitor is shown the explainer exactly once and can start playing,
and returning visitors are never nagged but can always re-open it. Revisit if: analytics
(STAGE-011) shows first-run drop-off despite the explainer (→ richer/interactive onboarding);
or the private-mode re-show proves annoying in practice (→ add a session-cookie fallback or
suppress after N in-session dismissals).

## References

- Related specs: SPEC-059 (storage + reactive seam — implements this), SPEC-060 (the
  HelpSheet UI + header trigger + first-run auto-open that consumes the seam).
- Related decisions: DEC-005 (no backend / never-throw storage), DEC-001 (engine untouched),
  DEC-010 (token-only CSS), DEC-020 (the session-stats model — the precedent for pinning a
  small client model in a DEC at the stage's infra spec).
- Prior art in-repo: `src/stats/statsStorage.ts` (versioned safe-storage blob),
  `src/machines/activeMachineStorage.ts` (the `zany:*` namespace), `src/ui/stats/StatsProvider.tsx`
  (the no-op-default reactive context this seam mirrors).
