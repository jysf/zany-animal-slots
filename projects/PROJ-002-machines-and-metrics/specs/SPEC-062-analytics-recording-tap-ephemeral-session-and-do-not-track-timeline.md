# SPEC-062 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-062-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-11 (Opus): STAGE-011's **second and final Tier-1 spec** — the
      recording **tap** that turns the SPEC-061 seam into a working (still default-OFF) usage beacon.
      Emits `session_start` / `spin` / `cash_in` / `machine_switch` / `help_seen` from the existing
      STAGE-008/009/010 seams into `track()`; adds a pure `session.ts` (ephemeral **in-memory** session
      id via `crypto.randomUUID`, never persisted; `isDoNotTrack`) + `lifecycle.ts` (`applyAnalyticsPolicy`
      = DNT⇒force noopSink; `emitSessionStart` once-per-load; `startSession`); mounts an `AnalyticsProvider`
      (policy + session_start + pagehide→flush) in `src/ui/analytics/`. **Key design call:** promotes
      SPEC-061's `Sink.track(event)` → `Sink.track(TrackedEvent)` (`{event, ts, sessionId, appVersion}`)
      built in `track()`, so the session id has a **live production consumer** (no dead code) and Tier-2
      sinks get a complete usage instance; the tap API (`track(domainEvent)`) is unchanged, and SPEC-061's
      `sink.test.ts`/`track.test.ts` are updated to the new contract. Taps are **synchronous emits** at
      imperative seams, ref-guarded where a transition must fire once (`machine_switch` on a real switch,
      `help_seen` on first mark); StrictMode double-mount only affects `session_start`, guarded by a
      once-flag. **Implements DEC-023 — no new DEC.** Default build stays **zero-network** (noop sink);
      engine diff EMPTY (taps are UI); no new dependency. Complete drop-ins for 3 new + 4 modified source
      modules and 6 test files (incl. the 2 SPEC-061 test updates) in the Notes. Five adversarial
      guard-mutations specified for verify. **[M]** Build prompt written.

- [~] **build** — 2026-07-12 (Sonnet, local branch `feat/spec-062-analytics-recording-tap`, local commit
      only — no push/PR): transcribed the spec's Notes drop-ins verbatim — 3 new source modules
      (`session.ts`, `lifecycle.ts`, `AnalyticsProvider.tsx`), 4 modified source files + `main.tsx`, 6 new
      test files, and the 2 updated SPEC-061 test files (`sink.test.ts`/`track.test.ts` promoted to the
      `TrackedEvent` contract). Full gate green: `just typecheck && just lint && just test && just build`
      (81 test files / 453 tests), plus `just validate` and `just cost-audit`. Ran all 5 spec-specified
      adversarial guard-mutations — each broke exactly its named test, then reverted; tree confirmed
      clean before commit. `git diff main..HEAD -- src/engine/` EMPTY; no new dependency; zero network
      confirmed (no `fetch`/`sendBeacon` outside the test spy that asserts they're never called). No
      deviations from spec. Left `[~]` for the orchestrator to close to `[x]` at ship.

- [~] **verify** — 2026-07-12 (Sonnet, cold session, not the builder): reconciled git/disk against the
      build's self-report. `git diff --stat main..HEAD` touches only `src/analytics/**`,
      `src/ui/analytics/**`, the three tapped seams (`useSlotMachine.ts`, `MachineProvider.tsx`,
      `HelpSeenProvider.tsx`), `src/main.tsx`, and this spec's design artifacts; `git diff main..HEAD --
      src/engine/` confirmed EMPTY (DEC-001); no `package.json`/lock diff. Zero-network grep of non-test
      `src/analytics/**` + the taps for `fetch|sendBeacon|XMLHttpRequest|WebSocket` found NONE;
      `createSink()` confirmed to always resolve `noopSink` in Tier 1; session id confirmed never written
      to `localStorage`/cookie (grepped `session.ts`); `SECURITY.md`, `public/_headers`,
      `decisions/DEC-005` all empty-diff; no `HttpSink`/remote sink/endpoint anywhere. Full gate re-run
      green: `typecheck`, `lint`, `test` (81 files / 453 tests, incl. the SPEC-061 "no network call for
      any event under the off sink" test still passing against the promoted `TrackedEvent` contract),
      `build`, `validate`, `cost-audit`. No `.only`/`.skip`/`xit` in new/updated test files. All 9
      acceptance criteria walked and backed by a specific test/code fact. Ran all 5 spec-specified
      adversarial guard-mutations one at a time, reverting each before the next: (1) `MachineProvider`
      guard drop → broke exactly "re-selecting the current machine emits nothing"; (2) `HelpSeenProvider`
      guard drop → broke exactly "emits help_seen once, on the first mark"; (3) `track()` envelope fields
      dropped → broke exactly the track "dispatches … TrackedEvent" assertion; (4) `emitSessionStart`
      once-guard removed → broke its named lifecycle test PLUS `AnalyticsProvider.test.tsx`'s "consumes
      the one-shot session_start on mount" test (expected collateral — both assert the same once-guard
      invariant; not a coverage gap); (5) `applyAnalyticsPolicy` ignoring `dnt` → broke exactly "forces
      the noopSink under Do-Not-Track". All 5 reverted; full suite re-confirmed green (453/453) after
      each revert and again at the end; working tree clean before committing bookkeeping.
      Contract-evolution sanity: SPEC-061's `sink.test.ts`/`track.test.ts` confirmed updated to the
      `TrackedEvent` contract and passing; tap API (`track(domainEvent)`) unchanged; existing seam tests
      (`MachineProvider`/`HelpSeenProvider`/`useSlotMachine.stats`/`App`) still green. `just
      decisions-audit --changed main` ran: DEC-023 correctly flagged as governing `src/analytics/**`,
      build consistent with it; DEC-005 confirmed UNAMENDED (empty diff); DEC-004/DEC-010/DEC-022
      advisory flags on the touched UI files are broad path-glob matches, not violations. **Zero defects.
      Verdict: ✅ APPROVED.** Left `[~]` for the orchestrator to close to `[x]` at ship. Local commit
      only — no push/PR (LOCAL ONLY verify session).
