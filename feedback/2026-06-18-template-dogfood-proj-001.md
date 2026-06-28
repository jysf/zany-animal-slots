---
source: "PROJ-001 Animal Slots — repo/project design session (dogfooding)"
captured_at: 2026-06-18
captured_by: claude
status: open                # open | addressed | deferred
---

# Template dogfood findings — PROJ-001 design session (Prompts 1b/1c/2a)

Running capture of how the spec-driven template (and its recently-added
functionality — cost tracking, license-policy, validate / decisions-audit) holds
up while building a real, animation-heavy, non-CRUD frontend. Newest findings
appended at the bottom. Scaffold more entries with `just new-feedback "<slug>"`.

## The issue (findings)

1. **`just new-stage` glob collides while two same-numbered PROJ dirs exist.**
   `get_active_project` excludes `*example*`, but `scripts/new-stage.sh`
   resolves the project via `find -name "${PROJECT_ID}-*" | head -n1`, which is
   ambiguous when both `PROJ-001-example-mvp` and `PROJ-001-animal-slots` are
   present. This forced deleting the example *project* during Prompt 1b (earlier
   than the 2a step that nominally owns example deletion) so 1c's `new-stage`
   resolved deterministically.
   - **Suggested fix:** resolve `new-stage`/`new-spec` to the same active
     (non-example) project `get_active_project` returns, or hard-error on an
     ambiguous glob instead of silently `head -n1`.
   - *Same bug-class as the existing bragfile note about placeholder/active
     resolution.*  `status: open`

2. **`just test` name collision: template self-test vs the app's test suite.**
   The justfile shipped `test` → the maintainer self-test (`scripts/test.sh`),
   which only works pre-init anyway. Any real app wants `just test` to run its
   own suite. Resolved by renaming the maintainer recipe to `just selftest` and
   giving the app `just test`.
   - **Suggested fix:** ship the template self-test as `selftest` (or
     `template-test`) from the start, leaving `test` free for the app.
   `status: addressed` (renamed in this repo; upstream template still ships `test`)

3. **Constraint severity vocabulary mismatch.** The project plan rated
   constraints `critical / high / medium`, but `guidance/constraints.yaml`'s enum
   is `blocking / warning / advisory`. I had to invent a mapping (documented in a
   header comment in the file).
   - **Suggested fix:** the template should state a canonical mapping, or align
     the two vocabularies, so severities are comparable across projects.
   `status: open`

4. **`decisions-audit` reports intentional parent/child scope nesting as
   warnings.** A broad architectural decision (DEC-001 over `src/engine/**`) that
   deliberately contains narrower decisions (DEC-002/003/006 on specific engine
   files) produced 7 "overlapping scope — confirm they don't contradict"
   warnings. Correct to surface once, but noisy as a standing state.
   - **Suggested fix:** let a decision declare an intentional broad/parent scope
     (or reference the children) so the audit can distinguish hierarchy from a
     genuine conflict. `status: open`

5. **Repo-id placeholder lag between scaffold and 2a.** `new-stage` stamps
   `repo.id` from `.repo-context.yaml`, which still held the `my-app` placeholder
   during Prompt 1c because the repo-context update lives in Prompt 2a (run
   after 1c). Freshly-scaffolded stages therefore carried `my-app` until
   hand-corrected.
   - **Suggested fix:** set the repo id during 1b (e.g. a `just set-repo-id`
     step), or have scaffolds fall back to a value captured at project creation.
   - *Same bug-class as the existing bragfile placeholder note.* `status: open`

6. **The template never *required* accomplishment capture (brag).** It requires
   cost data per cycle (constraint `cost-captured-per-cycle` + `just cost-audit`)
   and per-spec reflections, but had no equivalent for recording wins, so brag
   only happened ad hoc (e.g. pasting the `brag` CLI's help and asking the agent
   to post). Added a convention here: `just brag` writes a repo-wide
   `./ACCOMPLISHMENTS.md`, and capture is now a REQUIRED step in the ship cycle
   (AGENTS.md §15) and at stage/project ship (Prompts 5, 1d, 1e). Kept the
   requirement tool-agnostic — `just brag` *or* the external `brag` CLI satisfies
   it.
   - **Suggested fix (upstream):** ship an accomplishment-capture step in the
     template's ship prompts + AGENTS.md ship rules. Open question worth a DEC:
     keep it a convention (matching "cycles are tags, not gates") or gate it like
     cost (a `brag-audit` that a shipped stage/project recorded ≥1 entry)?
   `status: addressed` here as a convention; upstream template change still open

7. **`just advance-cycle` operated on the cycle-prompt file, not the spec.**
   `find_spec` (scripts/_lib.sh) excludes `*-timeline.md` and `specs/done/` but
   not `specs/prompts/`, so for SPEC-001 it matched `prompts/SPEC-001-build.md`
   (same `SPEC-001-*` prefix) and `head -n1` picked it. `advance-cycle` then
   tried to update `task.cycle` in a file with no front-matter — it reported
   success with a blank old-cycle and silently left the real spec at `design`.
   Caught only because `just status` still showed the spec under `design`.
   - **Fix applied here:** added `-not -path '*/prompts/*'` to `find_spec`.
     Re-ran `advance-cycle` → correct (`design → build`).
   - **Suggested fix (upstream):** same one-liner; consider also having
     `advance-cycle` warn if the resolved file lacks `task:` front-matter rather
     than silently no-op'ing. `status: addressed` here; upstream open.

8. **Cost-tracking schema is inconsistent across the template.** The spec
   template (`projects/_templates/spec.md`) and the cost snippets in Prompts
   2b/3/5 record per-session `tokens_input` / `tokens_output`, but AGENTS §4, the
   `cost-audit` gate, and `cycle_tokens_total` (scripts/_lib.sh) all read a
   single per-session **`tokens_total`** field. A spec filled in per the template
   would record input/output and still fail the audit ("missing build/verify
   cost") because no `tokens_total` key exists. Hit this when wiring SPEC-001's
   metered build cost.
   - **Fix applied here:** used `tokens_total` in SPEC-001's `cost.sessions`
     (build = 91115 from `subagent_tokens`); confirmed `cycle_tokens_total`
     reads it. Left design as `tokens_total: null` (main-loop).
   - **Suggested fix (upstream):** pick one schema and make the template, the
     prompt snippets, AGENTS §4, and the scripts agree — `tokens_total` is the
     one the gate enforces, so converge on that. `status: addressed` here;
     upstream open.

9. **`just archive-spec` doesn't actually update the stage backlog.** The
   justfile help says "move to done/ and update stage backlog," but on shipping
   SPEC-001 it moved the files to `specs/done/` and then *printed manual hints*
   ("Change '[ ] SPEC-001' to '[x] SPEC-001 (shipped …)'", "Update the count")
   rather than editing `STAGE-001-…md`. Easy to miss → stale backlog/counts.
   - **Fix applied here:** updated the STAGE-001 backlog by hand (SPEC-001 → `[x]
     shipped`, count → 1 shipped / 0 active / 3 pending).
   - **Suggested fix (upstream):** either make `archive-spec` perform the backlog
     edit it advertises, or change the help text to "prints backlog edits to
     apply." (Related to the existing bragfile note about an `archive-spec`
     stage-shipped false-positive.) `status: addressed` here; upstream open.

10. **A non-interactive build agent can't satisfy `no-new-top-level-deps-without-decision`
    without either stopping or working around it.** SPEC-002's build needed
    `@types/node` (its file-reading test won't type-check without it), but the
    constraint says "emit a DEC first." A sub-agent build can't pause to author a
    DEC and resume, so it chose a hand-rolled Node-types stub instead of the right
    dep — which review then had to undo (DEC-009 + `@types/node`, a wasted
    round-trip).
    - **Suggested fix (upstream):** let a build cycle add a *clearly-trivial*
      dev dependency (types packages, test utilities) AND author its DEC in the
      same pass, rather than forcing a stop-and-ask or a workaround. Or
      pre-provision the obvious test-time dev deps (`@types/node`) in the scaffold
      spec. `status: open` (process/template tension surfaced by SPEC-002).

11. **A build sub-agent can return a truncated/mid-task message while its work is
    only half done — and a stale timeline marker can claim a build already ran when
    it didn't.** SPEC-004's build sub-agent returned the literal fragment
    "Now create the device-frame CSS file:" as its final message with the App
    wrapper, the two test files, the gate run, and the commit all still missing;
    separately, the branch's timeline already said "built locally … push/PR
    pending" before any code change existed on the branch (`git log main..HEAD` was
    empty). Trusting `git`/disk state over both the sub-agent's self-report and the
    timeline marker was what caught it.
    - **Suggested fix (process):** after a build/verify sub-agent returns, the
      orchestrator should always reconcile the claimed result against actual disk +
      `git log` state before advancing — never advance on the self-report alone.
      The contract's existing "trust git over timeline markers" rule held up well;
      worth generalizing it to "trust git/disk over *any* agent self-report."
      `status: addressed` here (orchestrator verified disk state, finished the
      mechanical remainder on main-loop, attributed cost to the sub-agent's metered
      portion). Surfaced by SPEC-004.

12. **Build sub-agents reflexively add `// eslint-disable-line
    react-hooks/exhaustive-deps` for intentional partial hook deps, but this
    project's ESLint config has no `react-hooks` plugin.** Seen on both SPEC-022
    (`useCountUp`) and SPEC-024 (`ParticleBurst`'s `useMemo`): the agent wrote a
    hook with deliberately narrow deps, added the disable directive out of habit,
    and the lint step flagged it (unused/undefined directive) — caught and removed
    by the agent in one extra lint cycle each time. Low-severity, always
    self-corrected, never reached `main`. Pattern: agents carry a strong "React +
    intentional deps ⇒ add exhaustive-deps disable" prior that doesn't match a repo
    without the plugin.
    - **Suggested fix (process/spec):** when a spec's Notes hand the implementer a
      hook with intentional partial deps, add a one-line "this repo's ESLint has no
      `react-hooks` plugin — do NOT add an `exhaustive-deps` disable; document the
      intent in a code comment instead." (Or, separately, decide whether to adopt
      the `react-hooks` plugin so the intent is machine-checked rather than
      commented.) `status: open` — surfaced across SPEC-022 / SPEC-024.

13. **Build sub-agents reach for `@testing-library/user-event`, which this repo
    does not install.** On SPEC-026 the agent wrote `userEvent.click(...)` in the
    MuteToggle test, hit a typecheck/resolve failure, and fell back to `fireEvent`
    (which IS available) in one extra loop. Same shape as finding #12 (a strong
    React-testing prior that doesn't match this repo's actual toolset). Always
    self-corrected, never reached `main`.
    - **Suggested fix (process/spec):** add a one-line "this repo uses `fireEvent`
      from @testing-library/react — `@testing-library/user-event` is NOT installed"
      to UI build prompts (the orchestrator now includes such notes), or install
      `user-event` as a dev dep if richer interaction tests are wanted. `status:
      open` — surfaced on SPEC-026.

## What worked (keep)

- The `value:` (project) and `value_contribution:` (stage) blocks forced
  genuinely useful up-front thinking — the thesis/risks framing caught scope that
  a feature list would have hidden.
- The Prompt 1b → 1c → 2a flow mapped cleanly onto the work; "stop after the
  cross-check, don't write SPEC-001" was an unambiguous, useful boundary.
- Cost tracking behaved: design cycles are `null`-with-note by design, and
  `just cost-audit` stays green with no shipped specs (no false positive).
- `decisions-audit` structural lint (0 errors) and the `affected_scope` globs
  gave real confidence the decision set is internally consistent.

## Context

Surfaced entirely during the repo/project design session for PROJ-001 (the first
real project in this repo), which deliberately exercises the template against a
real-time, animation-heavy, non-CRUD app — exactly the dogfood the project
thesis calls for.

## Priority (their assessment)

- **#1 (new-stage glob)** and **#5 (repo-id lag)** are the highest-value: both
  bit during a normal first-project flow and have a clean fix. Medium.
- **#2 (test collision)** addressed locally; worth fixing upstream. Low.
- **#3 (severity vocab)** and **#4 (audit nesting)** are papercuts. Low.

## Resolution

Filled in as items are addressed. #2 resolved in this repo (justfile rename).
The rest are `open` — candidates to promote into the template via the next
`just weekly-review` (which already aggregates template-improvement notes).
