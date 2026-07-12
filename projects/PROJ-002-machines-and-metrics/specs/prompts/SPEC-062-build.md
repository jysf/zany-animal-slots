# SPEC-062 — BUILD prompt (fresh session — Sonnet)

> Run on **claude-sonnet-4-6** (AGENTS §8). LOCAL ONLY: branch + local commits.
> NO push, NO PR, NO `gh`, NO `just advance-cycle`. The recording tap — Tier 1 of STAGE-011. The default
> build must still make ZERO network calls (the sink stays the no-op). Engine untouched.

```
Cycle: build. You are NOT the architect. The spec file is your only context.

Read in order:
1. /AGENTS.md (§5 build flow, §8 models, §11 conventions, §12 tests, §16 hygiene).
2. /projects/PROJ-002-machines-and-metrics/specs/SPEC-062-analytics-recording-tap-ephemeral-session-and-do-not-track.md
   — the ENTIRE Acceptance Criteria, Failing Tests, Implementation Context, and Notes. The Notes contain
   COMPLETE drop-in code for every NEW module + every MODIFIED file (exact edits) + all test files.
   Implement it VERBATIM.
3. /decisions/DEC-023 (posture), DEC-005, DEC-001, DEC-020, DEC-022 (read only).
4. Source to read (for the exact edit points + patterns): src/analytics/{events,sink,track,index}.ts,
   src/ui/useSlotMachine.ts (recordSpin in the reveal callback + recordCashIn in reset), 
   src/ui/machine/MachineProvider.tsx, src/ui/help/HelpSeenProvider.tsx, src/main.tsx,
   src/ui/useSlotMachine.stats.test.tsx (the fake-timer test pattern), src/build-info.d.ts.

Before coding, branch and mark build [~] in the SPEC-062 timeline.

Branch: git checkout main && git pull --ff-only && git checkout -b feat/spec-062-analytics-recording-tap

Implement EXACTLY the spec (drop-ins in the Notes):
NEW source:
- src/analytics/session.ts   — getSessionId (lazy, in-memory only, crypto.randomUUID + fallback),
                               resetSessionId, isDoNotTrack(nav?) reading doNotTrack/msDoNotTrack/window.
- src/analytics/lifecycle.ts — applyAnalyticsPolicy({dnt?,makeSink?}) (DNT⇒noopSink), emitSessionStart
                               (once-guard), resetSessionStarted, startSession.
- src/ui/analytics/AnalyticsProvider.tsx — effect: startSession() + pagehide→flush listener; renders children.
MODIFIED source:
- src/analytics/events.ts    — ADD the TrackedEvent envelope interface.
- src/analytics/sink.ts      — Sink.track(tracked: TrackedEvent); import TrackedEvent (drop the now-unused
                               AnalyticsEvent import); noopSink/resolveSinkKind/createSink otherwise unchanged.
- src/analytics/track.ts     — track() builds { event, ts: Date.now(), sessionId: getSessionId(),
                               appVersion: __APP_VERSION__ } and passes it to activeSink.track; still try/catch.
- src/analytics/index.ts     — export TrackedEvent + the session + lifecycle surface.
- src/ui/useSlotMachine.ts    — import { track } from '../analytics'; emit cash_in after recordCashIn() in
                               reset(), and spin after recordSpin(...) in the reveal callback.
- src/ui/machine/MachineProvider.tsx — add useRef + track import; idRef; emit machine_switch on a real switch.
- src/ui/help/HelpSeenProvider.tsx   — add useRef + track import; seenRef; emit help_seen on the first mark.
- src/main.tsx               — mount <AnalyticsProvider> innermost (inside HelpSeenProvider, wrapping App).
NEW tests (make every Failing Test pass): src/analytics/session.test.ts, src/analytics/lifecycle.test.ts,
  src/ui/analytics/AnalyticsProvider.test.tsx, src/ui/useSlotMachine.analytics.test.tsx,
  src/ui/machine/MachineProvider.analytics.test.tsx, src/ui/help/HelpSeenProvider.analytics.test.tsx.
UPDATED tests (SPEC-061 contract change): src/analytics/track.test.ts (the "dispatches" test → TrackedEvent
  assertions; add the TrackedEvent import), src/analytics/sink.test.ts (noop test passes a TrackedEvent).

HARD CONSTRAINTS (verify before finishing):
- `git diff main..HEAD -- src/engine/` MUST be EMPTY (DEC-001 — taps are UI/analytics only).
- ZERO network: no fetch/sendBeacon/XHR/WebSocket anywhere in src/analytics/ or the taps. The default sink
  stays the noop. The SPEC-061 "no network call for any event under the off sink" test must STILL pass.
- No new dependency. No new DEC (implements DEC-023). No remote sink / HttpSink / endpoint / CSP change.
  No change to SECURITY.md, public/_headers, or any DEC. No /stats UI, no consent toggle.
- The session id is IN-MEMORY only — never write it to localStorage/cookies.
- Existing tests must stay green (the taps are no-ops without a spy sink installed).

Repo toolchain gotchas: __APP_VERSION__ is a Vite define global (src/build-info.d.ts), available in
vitest. jsdom provides crypto.randomUUID + localStorage but NOT navigator.sendBeacon (guarded in tests).
Math.random is allowed OUTSIDE src/engine. strict + noUnusedLocals + noUnusedParameters (do NOT leave a
trailing unused arg) + noFallthroughCasesInSwitch are ON. Taps must be synchronous emits at the imperative
seams — NEVER inside a setState updater (StrictMode double-invokes those). track is a stable module import
(not a useCallback dep). Match the repo test style (Vitest globals, no import of describe/it/vi; RTL
renderHook/render + act from @testing-library/react).

Gate (all exit 0): just typecheck && just lint && just test && just build
Then confirm: `just validate` and `just cost-audit` pass; the new analytics tests ran and passed; the
`git diff main..HEAD -- src/engine/` guard is EMPTY.

When done:
1. Fill "## Build Completion" (incl. 3 honest reflection answers).
2. Append a build cost session (cycle: build, model: claude-sonnet-4-6, interface: claude-code,
   tokens_total: null + "orchestrator to fill from subagent_tokens" note, recorded_at: 2026-07-11, notes).
3. Mark build [~] in the timeline (leave for the orchestrator to close to [x] at ship).
4. Commit locally with `git add -A` and a message referencing SPEC-062. The working tree ALREADY contains
   this spec's design artifacts (SPEC-062 spec + timeline, prompts/SPEC-062-build.md) carried onto your
   branch — commit them together with your source. (Everything outside src/ in the tree is intended design
   docs — do not revert it.)
DO NOT git push / open a PR / run gh / run just advance-cycle.
```
