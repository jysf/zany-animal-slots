# SPEC-073 — build prompt (Sonnet)

You are running the **build** cycle for SPEC-073 in a fresh session. Do not assume any
context beyond this repo. Read, in order:

1. `projects/PROJ-003-trophy-case/specs/SPEC-073-trophy-model-and-forward-compatible-schema.md`
   — the whole spec, especially **## Failing Tests**, **## Implementation Context**, and
   **## Notes for the Implementer** (the drop-in code is there).
2. `decisions/DEC-024-trophy-model.md`, `decisions/DEC-020-session-stats-model.md`.
3. `src/stats/sessionStats.ts`, `src/stats/statsStorage.ts`, and their `*.test.ts`.
4. `guidance/constraints.yaml` (esp. `engine-no-dom`, `test-before-implementation`).

## Your job

Make the spec's Failing Tests pass by implementing the drop-in changes in the spec's
Notes. This is a pure model + storage change — **no UI, no engine edits**.

Specifics that matter:
- Add the tests from **## Failing Tests** to the existing
  `src/stats/sessionStats.test.ts` and `src/stats/statsStorage.test.ts`, matching the
  existing test idiom (plain Vitest, no `describe`-per-test bloat — follow the file).
- For the storage "preserve a pre-topWins blob" test, use a **literal** old-shape object
  (no `topWins` key), NOT a re-serialized `emptyStats()` — the point is to prove a blob
  from the *previous* build survives.
- Keep `grid`/`lineWins` **optional** on `SpinRecordInput` so `src/ui/useSlotMachine.ts`
  still typechecks. Do **not** edit `useSlotMachine.ts` (that is SPEC-074).
- Do not bump `STATS_VERSION`. Do not remove `biggestWin`.

## Gate (all must pass, from the repo root)

```
just typecheck && just lint && just test && just build && just validate && just cost-audit
```

Also confirm the engine is untouched:

```
git diff --stat main..HEAD -- src/engine/    # must be EMPTY
```

## When done

1. Fill in the spec's **## Build Completion** (branch `feat/spec-073-trophy-model`, all
   criteria met?, deviations, the 3-question build reflection).
2. Append your **build** cost session to the spec front-matter `cost.sessions` with
   `tokens_total: null` (the orchestrator fills the real number at ship), `interface:
   claude-code`, `model:` the model you ran as, `recorded_at: 2026-07-23`, and a
   one-line note. Do NOT invent token numbers.
3. Do NOT open a PR, do NOT `git add -A` (stage files by path), do NOT merge. The
   orchestrator ships. Leave the working tree with your changes committed to the branch.

Report back: what you changed, the gate results (paste the tails), any deviation from the
spec, and your build reflection answers.
