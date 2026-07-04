# PROJ-001 Retrospective — what the spec-driven template should learn

**Project:** PROJ-001 Animal Slots — MVP (shipped 2026-07-03, live at
`zany-animal-slots.jysf.org`).
**Scope of this doc:** consolidate the incremental dogfood findings + the
Stage/Project-level reflections into one prioritized set of *upstream template*
changes. The whole point of PROJ-001 was to dogfood the template against a
real-time, animation-heavy, non-CRUD app; this is the payoff writeup.

**Sources:** `feedback/2026-06-18-template-dogfood-proj-001.md` (15 findings),
the STAGE-006 Stage-Level Reflection, the PROJ-001 Project-Level Reflection in
`brief.md`, and the per-spec build/ship reflections across SPEC-001…037.

---

## Bottom line

The template survived a non-CRUD, animation-heavy, then deploy project with **only
papercuts — no structural rework**. Scope stayed stable (no feature creep, no engine
churn: the engine froze at SPEC-011 and never changed through 26 more specs). The two
most valuable takeaways are **not** bug fixes:

1. **The template needs a documented sub-agent / delegated-execution mode.** It was
   written assuming one interactive agent; the claude-only variant delegates
   build/verify to fresh sub-agents, which surfaced a whole new failure class.
2. **"Contract-tests-as-guards" should be promoted from an emergent trick to a
   recommended pattern.** Turning subjective "juice" (motion, contrast, perf, touch
   targets) into enforceable CI guards directly refuted the project's stated risk that
   juice work resists TDD.

Everything else is a prioritized fix list below.

---

## Theme A — Silent-failure tooling bugs (highest value: invisible, bite everyone)

These fail quietly or inconsistently, so they corrupt state without an error.

- **`advance-cycle` matched the wrong file and silently no-op'd (#7).** `find_spec`
  didn't exclude `specs/prompts/`, so it edited `SPEC-001-build.md` (no front-matter),
  reported success with a blank old-cycle, and left the real spec stuck at `design`.
  **Fix:** exclude `prompts/` in `find_spec`, **and** have `advance-cycle` warn when
  the resolved file lacks `task:` front-matter instead of silently succeeding.
- **`archive-spec` advertises "updates the stage backlog" but only prints hints (#9).**
  → stale backlog markers/counts. **Fix:** make it perform the edit, or correct the
  help text to "prints backlog edits to apply."
- **Cost schema drift (#8).** The spec template + prompt snippets (2b/3/5) record
  `tokens_input`/`tokens_output`, but the `cost-audit` gate + `cycle_tokens_total`
  read a single `tokens_total`. *Following the template verbatim guarantees a
  cost-audit failure.* **Fix:** converge template, prompts, AGENTS §4, and scripts on
  `tokens_total` (the field the gate enforces).
- **Ambiguous project resolution (#1) + repo-id placeholder lag (#5).**
  `new-stage`/`new-spec` resolve the project via `find … | head -n1` (wrong when
  example + real projects coexist), and stamp `repo.id` from a context file still
  holding `my-app` during 1c. **Fix:** deterministic resolution (hard-error on
  ambiguous glob; reuse `get_active_project`), and set the repo id at Prompt 1b.

## Theme B — Vocabulary / asymmetry

- **Severity vocab mismatch (#3).** Plans rate constraints critical/high/medium;
  `constraints.yaml` uses blocking/warning/advisory. No canonical mapping. **Fix:**
  ship one canonical mapping (or align the two vocabularies).
- **Wins aren't captured like costs are (#6).** Cost is gated per-cycle; accomplishment
  capture (brag) was ad-hoc. Addressed here by making brag a REQUIRED ship step
  (AGENTS §15 + Prompts 5/1d/1e). **Upstream decision:** keep it a convention, or add a
  `brag-audit` gate mirroring `cost-audit`?

## Theme C — The sub-agent execution model (the richest *new* learning)

The template's cycle model assumes one interactive agent. Delegating build/verify to
fresh sub-agents surfaced failure modes the template never anticipated:

- **A build sub-agent can't pause to author a DEC (#10).** SPEC-002 needed
  `@types/node`, but `no-new-top-level-deps-without-decision` says "emit a DEC first."
  A non-interactive build can't stop-and-resume, so it invented a types stub that
  review had to undo (a wasted round-trip). **Fix:** let a build cycle add a
  clearly-trivial dev dep *and* author its DEC in one pass, or pre-provision obvious
  test-time dev deps in the scaffold.
- **Sub-agents return truncated/mid-task self-reports; stale timeline markers lie
  (#11).** SPEC-004's build agent returned a mid-sentence fragment with the gate, tests,
  and commit all missing, while the timeline already claimed "built locally." **Durable
  rule (promote to AGENTS.md):** *trust git/disk over any agent self-report* — the
  orchestrator reconciles claimed results against `git log` + disk before advancing.
- **Shared working tree + auto-backgrounding (#14).** Agent-tool sub-agents run in the
  orchestrator's checkout and are auto-backgrounded; interleaving orchestrator git/tree
  work corrupted a branch once. **Rule:** launch exactly one build/verify sub-agent,
  then do no git/tree ops until it reports and its branch is merged.
- **Tool-prior mismatches (#12 / #13 / #15).** Sub-agents reflexively add
  `exhaustive-deps` disables (no react-hooks plugin here), reach for
  `@testing-library/user-event` (not installed → use `fireEvent`), and write
  `scripts/*.mjs` that fail lint on Node globals (need a `globals.node` ESLint block).
  **Fix:** fold the repo's actual toolchain into UI/script build-prompt boilerplate.

## Theme D — Audit noise

- **`decisions-audit` flags intentional parent/child scope nesting as conflicts (#4).**
  A broad `src/engine/**` decision (DEC-001) that deliberately contains narrower ones
  (DEC-002/003/006) produced 7 standing "overlapping scope" warnings. Correct to
  surface once, noisy as a permanent state. **Fix:** let a decision declare an
  intentional parent/broad scope (or reference its children) so the audit can tell
  hierarchy from conflict.

---

## What worked — keep it

- **`value.thesis` / `value_contribution` blocks forced genuine up-front thinking** —
  caught scope a feature list would have hidden.
- **The 1b→1c→2a→…→1d→1e flow mapped cleanly onto real work**, end to end.
- **Cost tracking behaved** (once the schema was fixed); `cost-audit` stayed green.
- **`decisions-audit` structural lint + `affected_scope` globs** gave real confidence
  the decision set was internally consistent.
- **Contract-tests-as-guards turned subjective polish into enforceable CI** —
  reduced-motion (every `@keyframes` has a reduced-motion block), perf
  (transform/opacity-only), contrast (WCAG-AA token pairs), 44px touch targets. This
  was the biggest *emergent* win and refuted the "juice resists TDD" risk. Promote it
  to a recommended template pattern for visual/real-time work.
- **The architecture thesis held in practice:** DEC-001 (engine-no-dom), enforced by a
  boundary test, let the engine freeze at SPEC-011 and stay frozen through all UI /
  audio / deploy work.

---

## Prioritized upstream fix checklist

- **P1 — silent-failure bugs (do first):** `find_spec` excludes `prompts/` +
  warn-on-no-front-matter (#7); `archive-spec` edits the backlog it advertises (#9);
  converge cost schema on `tokens_total` (#8); deterministic project resolution +
  repo-id at 1b (#1, #5).
- **P2 — vocab / capture:** canonical severity mapping (#3); ship required
  accomplishment capture, decide convention-vs-gate (#6).
- **P3 — sub-agent execution model (strategic):** allow trivial dev-dep + its DEC in
  one build pass (#10); "trust git/disk over any self-report" in AGENTS.md (#11);
  shared-tree rule (#14); repo-toolchain notes in build-prompt boilerplate (#12/#13/#15).
- **P4 — audit noise:** intentional parent-scope declaration for decisions (#4).

## Patterns to promote into the template (not fixes — new good practice)

- **Contract-tests-as-guards** for subjective / visual / perf / a11y work.
- **"Trust git/disk over any agent self-report"** as a first-class orchestration rule.
- **A documented sub-agent build/verify mode** (local-only sub-agents, orchestrator
  owns push/PR/advance, the shared-tree rule, cost attribution via `subagent_tokens`).

---

## Meta-conclusion

The dogfood paid off: the template needed no structural change to carry a
frontend-heavy, non-CRUD, real-time project all the way to a live deploy. The gaps it
exposed are concentrated in two places — **silent tooling failures** (Theme A, easy
high-value fixes) and **the assumption of a single interactive agent** (Theme C, the
strategic gap now that delegation/parallelism is real). Fixing those two, plus
promoting contract-tests-as-guards, is the whole return on this project's dogfood
investment.
