# SPEC-035 — SHIP prompt (fresh session!)

> Copy everything in the box into a NEW Claude session. You are shipping
> an approved PR. The spec file and PR are your only context.

```
Cycle: ship. PR #35 for SPEC-035 is approved (verified 2026-07-03).

Read files in order:
1. /AGENTS.md — esp. §4 (cost tracking), §8 (cycle model), §15 (ship rules)
2. /projects/PROJ-001-animal-slots/specs/SPEC-035-security-headers-and-cache-policy.md — the spec (all sections)
3. /projects/PROJ-001-animal-slots/specs/SPEC-035-security-headers-and-cache-policy-timeline.md — current timeline state
4. /projects/PROJ-001-animal-slots/stages/STAGE-006-release-and-deploy.md — the parent stage

Before merging, mark ship `[~]` in:
  projects/PROJ-001-animal-slots/specs/SPEC-035-security-headers-and-cache-policy-timeline.md

Pre-ship checklist:
[ ] CI passing? (check all checks green on PR #35)
[ ] Deployment steps? (static SPA — no deploy step until a later STAGE-006 [OPS] spec wires Cloudflare Pages)
[ ] Rollback plan? (git revert merge commit; app is not yet deployed so blast radius is zero)
[ ] CHANGELOG? (no CHANGELOG required for this project at this stage)

Merge PR #35:
  gh pr merge 35 --squash --delete-branch

After merge, answer the three Reflection (Ship) questions below and
paste your answers where indicated in the spec's "## Reflection (Ship)" section:

1. What would I do differently next time?
   [REPLACE: answer]

2. Does any template, constraint, or decision need updating?
   [REPLACE: answer]

3. Is there a follow-up spec to write before I forget?
   [REPLACE: answer]

After you have the answers:
- Format as ## Reflection (Ship) block in the spec
- Append a ship cost session entry to `cost.sessions` in the spec
  (cycle: ship, agent: <your model>, interface: claude-code,
   tokens_total: null, estimated_usd: null, duration_minutes: <estimate>,
   recorded_at: 2026-07-03,
   notes: "main-loop, not separately metered (AGENTS §4); ship cycle")
- Compute `cost.totals` from ALL sessions (design + build + verify + ship):
  * tokens_total = sum of non-null tokens_total across sessions
    (build and verify have null with "orchestrator to fill" notes — fill
     them in from the orchestrator's subagent_tokens for those two Agent
     calls before summing; otherwise leave null and note partial data)
  * estimated_usd = sum of non-null estimated_usd across sessions
  * session_count = total number of sessions (including null-numeric ones)
- Mark ship `[x]` in the timeline with merge date and total cost
- Run: just advance-cycle SPEC-035 ship
- Run: just archive-spec SPEC-035  (moves spec + timeline into done/)
- REQUIRED: capture accomplishment — just brag "SPEC-035: Security headers & cache policy — public/_headers adds a tight CSP (script-src 'self'; style-src 'unsafe-inline' for runtime custom props only; no unsafe-eval), X-Content-Type-Options/X-Frame-Options/Referrer-Policy/Permissions-Policy, and immutable long-cache for /assets/* + no-cache default; Vite copies it to dist/_headers verbatim; 5 contract tests assert all directives; engine + package.json untouched; 257/257 tests green; 1st of 6 SPECs in STAGE-006"

NOTE: SPEC-035 is the FIRST spec in STAGE-006 (1/6). Do NOT trigger a Stage Ship.
The remaining STAGE-006 specs ([REPO] CI supply-chain gate + SECURITY.md, then
[OPS] Pages deploy + custom domain + smoke check) are still pending.

After archiving SPEC-035, update the STAGE-006 backlog entry:
  - Change `- [~] SPEC-035 (build)` to `- [x] SPEC-035 (ship)` in
    projects/PROJ-001-animal-slots/stages/STAGE-006-release-and-deploy.md
  - Update the Count line accordingly.

If any template/constraint/decision updates were mentioned in Reflection (Ship),
propose the edits now (do not commit without showing me).

If a follow-up spec was mentioned, add it to the STAGE-006 backlog with a one-line
summary — do NOT write the full spec (that is a separate design cycle).

Decisions referenced: DEC-008 (Cloudflare Pages _headers governs this file; no
revisit — _headers format as specified), DEC-005 (client-only SPA → connect-src
'self'), DEC-006 (emoji symbols → no external img/font fetches), DEC-007
(synthesized audio → no media asset sources); no new DEC-* emitted by this build.
```
