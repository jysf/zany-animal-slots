# SPEC-062 — VERIFY prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8, §15 verify). A COLD review — do not trust the build's
> self-report; reconcile against git/disk. LOCAL ONLY: no push, no PR, no `gh`, no `just advance-cycle`.
> The branch `feat/spec-062-analytics-recording-tap` is checked out with the build committed.

```
Cycle: verify. You are NOT the builder and NOT the architect. Review against fixed criteria.

Read in order:
1. /AGENTS.md (§15 verify checklist, §12 tests, §17 confidence).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-062-analytics-recording-tap-ephemeral-session-and-do-not-track.md
   — the Acceptance Criteria, Failing Tests, Implementation Context, and the 5 adversarial guard-mutations
   in "## Notes for the Implementer".
3. /decisions/DEC-023, DEC-005, DEC-001 (read only).
4. The built source: src/analytics/{events,sink,track,session,lifecycle,index}.ts,
   src/ui/analytics/AnalyticsProvider.tsx, and the taps in src/ui/useSlotMachine.ts,
   src/ui/machine/MachineProvider.tsx, src/ui/help/HelpSeenProvider.tsx, src/main.tsx.

Confirm you are on branch feat/spec-062-analytics-recording-tap with the build committed (git log -1).

VERIFY CHECKLIST — reconcile against git/disk, don't trust the build report:
1. Scope: `git diff --stat main..HEAD` touches ONLY src/analytics/**, src/ui/analytics/**, the three
   tapped UI seams (useSlotMachine.ts, MachineProvider.tsx, HelpSeenProvider.tsx), src/main.tsx, and this
   spec's design artifacts (SPEC-062 spec+timeline, prompts/SPEC-062-*). `git diff main..HEAD --
   src/engine/` is EMPTY (DEC-001). No package.json/lock change (no new dependency).
2. Zero network / posture: grep NON-test src/analytics/** and the taps for
   fetch|sendBeacon|XMLHttpRequest|WebSocket|navigator\.sendBeacon — there must be NONE. Confirm the
   default active sink is still the noop (track.ts activeSink = createSink() ⇒ noopSink). Confirm the
   session id is NEVER written to localStorage/cookie (grep session.ts). Confirm SECURITY.md,
   public/_headers, and decisions/DEC-005 are UNCHANGED (empty diff), and NO remote sink/HttpSink/endpoint
   exists.
3. Full gate green (run it): `just typecheck && just lint && just test && just build`, then
   `just validate` and `just cost-audit`. Report the test count. Confirm the SPEC-061 "no network call for
   any event under the off sink" test STILL passes with the promoted TrackedEvent contract.
4. No `.only`/`.skip`/`xit` in the new/updated test files.
5. Acceptance criteria: walk each checkbox and confirm a test or code fact backs it.
6. Adversarial guard-mutations — run ALL 5 from the spec's Notes; each must break EXACTLY its named test;
   REVERT each after and confirm green again:
     (1) MachineProvider: drop the `next !== idRef.current` guard → breaks "re-selecting the current
         machine emits nothing".
     (2) HelpSeenProvider: drop the `!seenRef.current` guard → breaks "second markSeen emits none".
     (3) track(): drop sessionId/appVersion from the envelope → breaks the track "dispatches … TrackedEvent"
         assertion.
     (4) emitSessionStart: remove the `started` once-guard → breaks "emits exactly one session_start".
     (5) applyAnalyticsPolicy: ignore `dnt` → breaks "forces the noopSink under Do-Not-Track".
   Report which test each broke. A mutation that breaks NOTHING is a missing-coverage defect.
7. Contract-evolution sanity: confirm SPEC-061's sink.test.ts + track.test.ts were updated to the
   TrackedEvent contract and pass, and that the tap API (callers pass a domain event to track()) is
   unchanged. Confirm existing seam tests (MachineProvider/HelpSeenProvider/useSlotMachine/App) still pass
   — the taps are no-ops without a spy sink.
8. Decision drift: `just decisions-audit --changed main` — DEC-023 governs src/analytics/**; confirm the
   build is consistent and DEC-005 stays UNAMENDED. Build reflection answered honestly? cost.sessions has
   design + build entries?

Append a verify cost session to the spec's cost.sessions (cycle: verify, model: claude-sonnet-4-6,
interface: claude-code, tokens_total: null + "orchestrator to fill from subagent_tokens" note,
recorded_at: 2026-07-12, a note summarizing what you reconciled + the mutation results + defect count).
Add a verify line to the timeline. Commit the bookkeeping locally (git add -A; message references SPEC-062
verify). If an untracked reports/daily/*.md appears, leave it OUT of the commit (unrelated).

Output a clear verdict: ✅ APPROVED / ⚠ PUNCH LIST (itemized) / ❌ REJECTED, with the test count, the
engine-diff result, the 5 mutation results, the zero-network + session-id-not-persisted results, and a
defect count.
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
