# SPEC-061 — VERIFY prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8, §15 verify). A COLD review — do not trust the build's
> self-report; reconcile against git/disk. LOCAL ONLY: no push, no PR, no `gh`, no `just advance-cycle`.
> The branch `feat/spec-061-analytics-sink-seam` is already checked out with the build committed.

```
Cycle: verify. You are NOT the builder and NOT the architect. Review against fixed criteria.

Read in order:
1. /AGENTS.md (§15 verify checklist, §12 tests, §17 confidence).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-061-analytics-event-model-and-sink-seam-default-off.md
   — the Acceptance Criteria, Failing Tests, Implementation Context, and the Notes (incl. the 4
   adversarial guard-mutations at the top of "## Notes for the Implementer").
3. /decisions/DEC-023, DEC-005, DEC-001 (read only).
4. The built source under src/analytics/ (all 5 modules + 3 tests).

Confirm you are on branch feat/spec-061-analytics-sink-seam with the build committed (git log -1).

VERIFY CHECKLIST — reconcile against git/disk, don't trust the build report:
1. Scope: `git diff --stat main..HEAD` touches ONLY src/analytics/** (source) plus this spec's design
   artifacts (SPEC-061 spec+timeline, prompts/SPEC-061-*, decisions/DEC-023, STAGE-011 frame, brief.md).
   Nothing else. In particular `git diff main..HEAD -- src/engine/` is EMPTY (DEC-001).
2. Zero network (the stage's core success criterion): grep src/analytics/*.ts (NON-test) for
   fetch|sendBeacon|XMLHttpRequest|WebSocket|navigator\. — there must be NONE in source (only the
   guarded spies in track.test.ts are allowed). Confirm the default sink is the noop and createSink()
   returns the noopSink singleton.
3. Full gate green (run it): `just typecheck && just lint && just test && just build`, then
   `just validate` and `just cost-audit`. Report the test count. Confirm the 12 new analytics tests ran.
4. No `.only` / `.skip` / `xit` in src/analytics/*.test.ts.
5. Acceptance criteria: walk each checkbox in the spec and confirm a test or code fact backs it.
6. Adversarial guard-mutations — run ALL 4 from the spec's Notes; each must break EXACTLY its named
   test (and ideally only that one); REVERT each after and confirm tests green again:
     (1) resolveSinkKind returns `raw as SinkKind` unconditionally → breaks the "off when unset/empty/
         unrecognized" test.
     (2) createSink returns a throwing object for 'off' instead of noopSink → breaks the "createSink
         returns the noopSink instance" test (identity).
     (3) track drops its try/catch → breaks "track and flush never throw when the active sink throws".
     (4) track calls noopSink.track directly (ignores activeSink) → breaks "track dispatches to the
         active sink; setSink swaps it".
   Report which test each mutation broke. If a mutation breaks NOTHING, that is a missing-coverage defect.
7. Decision drift: `just decisions-audit --changed` — confirm the DECs governing the touched paths
   (DEC-023 governs src/analytics/**) are consistent with the build. DEC-005 must remain UNAMENDED
   (Tier 1) and SECURITY.md / public/_headers UNCHANGED.
8. Build reflection answered honestly? cost.sessions has design + build entries?

Append a verify cost session to the spec's cost.sessions (cycle: verify, model: claude-sonnet-4-6,
interface: claude-code, tokens_total: null + "orchestrator to fill from subagent_tokens" note,
recorded_at: 2026-07-11, a note summarizing what you reconciled + the mutation results + defect count).
Add a verify [~]→ line to the timeline. Commit the bookkeeping locally (git add -A; message references
SPEC-061 verify).

Output a clear verdict: ✅ APPROVED / ⚠ PUNCH LIST (itemized) / ❌ REJECTED, with the test count, the
engine-diff result, the 4 mutation results, and a defect count.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
