# SPEC-061 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. A pure infra spec — a new `src/analytics/` leaf
> module (event model + pluggable Sink seam, default OFF). No network, no UI, no game wiring, no engine
> change. Analytics is Tier 1 of STAGE-011: it must make ZERO network calls under the default config.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §11 conventions, §12 tests).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-061-analytics-event-model-and-sink-seam-default-off.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes
   contain COMPLETE drop-in code for ALL 5 source modules AND the 3 test files. Implement VERBATIM.
3. /decisions/DEC-023 (the analytics posture), DEC-005, DEC-001, DEC-015 (read only).
4. Source (read only, for types + pattern): src/engine/index.ts (WinTier/BetLevel type re-exports),
   src/stats/sessionStats.ts + src/stats/statsStorage.ts (the leaf-module + never-throw pattern),
   src/build-info.d.ts (the ambient-.d.ts pattern env.d.ts mirrors).

Before coding, branch and mark build [~] in the SPEC-061 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-061-analytics-sink-seam

Implement EXACTLY the spec (drop-ins in the Notes). New files ONLY (nothing modified):
- src/analytics/events.ts   — ANALYTICS_EVENT_TYPES, AnalyticsEventType, AnalyticsEvent (union).
                              Imports engine TYPES only: import type { WinTier, BetLevel } from '../engine'.
- src/analytics/sink.ts     — Sink interface, noopSink (const singleton), SinkKind ('off' only),
                              resolveSinkKind(raw?) (unset/unknown ⇒ 'off'), createSink(kind?) ⇒ noopSink.
- src/analytics/track.ts    — module-level activeSink = createSink(); setSink/resetSink/getSink;
                              track()/flush() each wrapped in try/catch (NEVER throw).
- src/analytics/env.d.ts    — ambient (no imports/exports) ImportMetaEnv.VITE_ANALYTICS_SINK typing.
- src/analytics/index.ts    — barrel re-exporting the public surface.
- src/analytics/events.test.ts, src/analytics/sink.test.ts, src/analytics/track.test.ts — make EVERY
  test in the spec's Failing Tests section pass (plain .ts — no JSX). Match repo test style: Vitest
  globals (describe/it/expect/vi/afterEach) with NO import.

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001 — src/analytics reads engine TYPES only).
- ZERO network: no fetch/sendBeacon/XHR/WebSocket anywhere in src/analytics/. The track.test.ts
  "no network call for any event under the default (off) sink" test must PASS (spies on fetch/sendBeacon).
- No new dependency. No new DEC (DEC-023 already authored at design). No React/JSX, no provider, no tap
  into useSlotMachine/MachineProvider/HelpSeenProvider (that is SPEC-062). No change to SECURITY.md,
  public/_headers, or any DEC. Do NOT modify any file outside src/analytics/.

Repo toolchain gotchas: tsconfig include is ["src"] (picks up env.d.ts); types are
["vitest/globals","@testing-library/jest-dom","node"] — there is NO vite/client, so env.d.ts must
declare import.meta.env itself (ambient interface merging, mirrors src/build-info.d.ts). strict +
noUnusedLocals + noUnusedParameters + noFallthroughCasesInSwitch are ON. jsdom does NOT implement
navigator.sendBeacon (the test guards the spy); node-20/vitest provides globalThis.fetch (guarded too).

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new analytics tests ran and passed; the
`git diff main..HEAD -- src/engine/` guard is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, agent/model: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill tokens_total from subagent_tokens" note,
   recorded_at: 2026-07-11, notes).
3. Mark build [~] in the timeline (leave for orchestrator to close to [x] at ship).
4. Commit locally with a message referencing SPEC-061. Use `git add -A` — the working tree ALREADY
   contains this spec's design artifacts (the SPEC-061 spec + timeline, prompts/SPEC-061-build.md,
   decisions/DEC-023, and the STAGE-011 frame + brief.md updates) carried onto your branch from the
   design cycle; commit them TOGETHER with your new src/analytics/ files so the PR is self-contained.
   (Everything outside src/analytics/ in the tree is intended design docs — do not revert it.)
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
