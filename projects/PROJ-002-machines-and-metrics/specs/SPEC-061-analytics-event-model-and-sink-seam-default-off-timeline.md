# SPEC-061 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-061-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-11 (Opus): STAGE-011's **Tier-1 infrastructure keystone** — the
      provider-agnostic, default-OFF analytics **Sink seam** in a new `src/analytics/` leaf module,
      mirroring SPEC-054's pure-module + safe-seam shape one directory over. Ships: `events.ts` (the
      anonymous `AnalyticsEvent` union + `ANALYTICS_EVENT_TYPES`), `sink.ts` (`Sink` interface +
      `noopSink` + the `VITE_ANALYTICS_SINK` gate `resolveSinkKind`/`createSink`, default `off`),
      `track.ts` (never-throw `track`/`flush`/`setSink`/`resetSink`/`getSink` façade over the active
      sink), a self-contained ambient `env.d.ts` (there is NO `vite/client` in the repo), and an
      `index.ts` barrel. **No network, no UI, no game wiring, no storage** — the tap + ephemeral session
      + DNT are SPEC-062. Authored **DEC-023** (analytics posture) at design: it **affirms DEC-005**
      (Tier 1 is zero-network) and makes **no** no-backend amendment — remote sinks are the GATED Tier 2.
      Pure infra ⇒ deterministic Failing Tests (event enumeration; noop no-ops; `resolveSinkKind` fails
      safe to `off` even for `'http'`/`'cloudflare'`; `createSink()===noopSink`; **a "no network call for
      any event under the off sink" inert-proof** spying on `fetch`/`sendBeacon`; setSink/resetSink
      dispatch; never-throw-on-throwing-sink). DEC-001 clean (`src/analytics` reads engine TYPES only;
      `git diff src/engine/` MUST stay EMPTY); no new dependency. Complete drop-in code for all 5 source
      modules + 3 test files in the spec's Notes. Four adversarial guard-mutations specified for verify.
      **[M]** Build prompt written.
- [~] **build** — 2026-07-11 (Sonnet): transcribed the spec's drop-in `src/analytics/` modules
      (`events.ts`, `sink.ts`, `track.ts`, `env.d.ts`, `index.ts`) + 3 test files verbatim on branch
      `feat/spec-061-analytics-sink-seam`, no deviations. Full gate green: `just typecheck && just lint
      && just test && just build` (437/437 tests across 75 files, incl. 12 new analytics tests), plus
      `just validate` and `just cost-audit`. `git diff main..HEAD -- src/engine/` confirmed EMPTY
      (DEC-001); zero fetch/sendBeacon/XHR in source; no new dependency. Left `[~]` for the orchestrator
      to close to `[x]` at ship per AGENTS §9. Local commit only — no push/PR (LOCAL ONLY build session).
