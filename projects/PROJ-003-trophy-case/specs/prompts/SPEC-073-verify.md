# SPEC-073 — verify prompt (Sonnet)

You are running the **verify** cycle for SPEC-073 in a **fresh session**. You did not
write this code. Your job is a cold, adversarial review — not a rubber stamp. Assume the
build may have cut a corner and go looking for it.

## Read first

1. `projects/PROJ-003-trophy-case/specs/SPEC-073-trophy-model-and-forward-compatible-schema.md`
   — the whole spec: Acceptance Criteria, Failing Tests, Implementation Context, Notes
   (including the **adversarial guard-mutations** list), and the build's
   `## Build Completion` (including its claimed deviation).
2. `decisions/DEC-024-trophy-model.md`, `decisions/DEC-020-session-stats-model.md`.
3. The actual diff: `git diff main..HEAD` — read every changed line.

## Checks

- **Acceptance criteria:** walk every checkbox in `## Acceptance Criteria` and confirm it
  against the CODE (not against the build's claims). Tick them off in the spec file.
- **Tests have teeth (the important one):** run the 5 guard-mutations listed in the
  spec's Notes. For EACH: apply the mutation, run `just test src/stats/`, confirm it
  breaks **exactly** its target test and only that test, then revert cleanly. A guard
  that doesn't break when mutated is a fake test — report it. Confirm the suite is green
  again after every revert.
- **The forward-compatibility claim is the whole point of this spec.** Scrutinize the
  "preserve a pre-topWins blob" test specifically: does it use a genuine LITERAL old-shape
  object (no `topWins` key), or did the build cheat by re-serializing `emptyStats()`?
  The latter would prove nothing. Verify by reading the test.
- **Tie rule:** convince yourself `insertTopWin`'s stable-sort argument actually holds for
  the "ties never displace" case, including when the list is already full. Write a scratch
  case if unsure.
- **Scope discipline:** `git diff --stat main..HEAD` — confirm ONLY `src/stats/**` and the
  spec's own bookkeeping changed. `src/engine/**` and `src/ui/**` must be untouched.
  Confirm `STATS_VERSION` is still 1 and `biggestWin` still exists.
- **No test-suite tricks:** grep the changed test files for `.only`, `.skip`, `xit`,
  `todo`.
- **Build deviation:** the build reports substituting tier `'high'` (not a valid
  `WinTier`) with valid tiers in test literals. Confirm that is a correct fix for a spec
  typo and not a behavior change.

## Gate

```
just typecheck && just test && just build && just validate && just cost-audit
```

NOTE on `just lint`: it currently fails with ~1458 errors originating ENTIRELY from
git-ignored paths (`.claude/worktrees/**`, `audio-spike.html`) that CI never sees. The
orchestrator has verified this. Use `npx eslint "src/**/*.{ts,tsx}"` (must exit 0) as the
lint check instead, and confirm for yourself that the `just lint` errors are all from
ignored paths.

## When done

1. Append your **verify** cost session to the spec front-matter `cost.sessions`
   (`tokens_total: null`, `interface: claude-code`, `model:` the model you ran as,
   `recorded_at: 2026-07-23`, one-line note incl. the guard-mutation results and defect
   count). Do NOT invent token numbers.
2. Commit by explicit path (NEVER `git add -A`): the spec file and any fix you made.
   Message: `verify(SPEC-073): cold review + guard-mutations`.
3. Do NOT open a PR or merge.

## Output

End with an explicit verdict: **✅ APPROVED** / **⚠ PUNCH LIST** / **❌ REJECTED**, plus:
- the guard-mutation results (one line each: mutation → which test broke → reverted clean)
- the defect count
- anything you fixed vs. anything you're flagging for the orchestrator
