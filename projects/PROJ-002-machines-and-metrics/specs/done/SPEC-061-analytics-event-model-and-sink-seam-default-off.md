---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-061
  type: story                      # epic | story | task | bug | chore
  cycle: ship  # frame | design | build | verify | ship
  blocked: false
  priority: medium
  complexity: M                    # S | M | L  (L means split it)

project:
  id: PROJ-002
  stage: STAGE-011
repo:
  id: animal-slots

agents:
  architect: claude-opus-4-8       # design/frame: Opus (judgement-heavy). See AGENTS §8.
  implementer: claude-sonnet-4-6   # build/verify: Sonnet (execution against the spec)
  created_at: 2026-07-11

references:
  decisions:
    - DEC-023   # the analytics posture this spec authors + implements (default-off, client-only, Tier 1)
    - DEC-005   # no backend / no PII: Tier 1 AFFIRMS it (zero network) — this spec makes no amendment
    - DEC-001   # engine-no-dom: analytics is a side channel; src/analytics reads engine TYPES only
    - DEC-015   # the "consume plain data behind a seam" ethos the Sink interface mirrors
  constraints:
    - engine-no-dom
    - no-new-top-level-deps-without-decision
    - no-real-money
  related_specs:
    - SPEC-062  # the recording tap + ephemeral session + DNT that CALLS track() (next spec, Tier 1)
    - SPEC-054  # src/stats leaf-module + safe-seam pattern this mirrors (pure, unit-tested, no UI)
    - SPEC-063  # Tier 2 (GATED) — the HttpSink that will implement this Sink interface

value_link: >-
  The infrastructure keystone for STAGE-011's "measurable real play": a provider-agnostic,
  default-OFF analytics Sink seam (event model + NoopSink + VITE_ANALYTICS_SINK gate + a
  never-throw track() façade), proven inert so the public build makes zero network calls and
  DEC-005 stays fully intact. SPEC-062 taps the game seams into it; Tier-2 sinks (GATED) plug in later.

# Self-reported AI cost per cycle. Each cycle (design, build, verify,
# ship) appends one entry to sessions[]. Totals are computed at ship.
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null   # design cycle runs on the orchestrator's main Opus loop — not separately metered
      recorded_at: 2026-07-11
      note: >-
        Design authored on the main Opus loop (un-metered, AGENTS §4). Reconciled the STAGE-011 frame
        against the task's Tier-1/Tier-2 split: this spec is Tier 1 (SPEC-061) — the pluggable Sink
        seam, default off, ZERO network. Authored DEC-023 (analytics posture) which AFFIRMS DEC-005
        (no no-backend amendment in Tier 1; the amendment + remote sinks are the GATED Tier 2). This is
        a pure infra spec (types + a seam), no game math to simulate/pin, so the Failing Tests carry
        deterministic assertions computed from the module semantics. Complete drop-in code for all
        modules + tests in the Notes; build is transcription. Adversarial guard-mutations specified for
        verify. Engine diff MUST stay EMPTY (DEC-001); no new dependency.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 101937   # from Agent result subagent_tokens
      estimated_usd: 0.67    # 101937 tok × $6.6/M (Sonnet), list rate, no cache discount — order-of-magnitude
      duration_minutes: 9.6  # 574431 ms
      recorded_at: 2026-07-11
      note: >-
        Transcribed all 5 source modules (events.ts, sink.ts, track.ts, env.d.ts, index.ts) and 3 test
        files verbatim from the spec's drop-in Notes on branch feat/spec-061-analytics-sink-seam. No
        deviations. Full gate green: typecheck, lint, test (437/437 across 75 files, incl. the 12 new
        analytics tests), build, validate, cost-audit. git diff main..HEAD -- src/engine/ confirmed
        EMPTY (DEC-001); no fetch/sendBeacon/XHR/WebSocket in src/analytics/ source (tests only, guarded
        spies); no new dependency added.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: 118351   # from Agent result subagent_tokens
      estimated_usd: 0.78    # 118351 tok × $6.6/M (Sonnet), list rate, no cache discount — order-of-magnitude
      duration_minutes: 24.2 # 1449128 ms
      recorded_at: 2026-07-11
      note: >-
        Cold verify session (not the builder). Reconciled git/disk against the build's self-report:
        git diff --stat main..HEAD touches only src/analytics/** (5 source + 3 test files) plus this
        spec's design artifacts (SPEC-061 spec+timeline, prompts/SPEC-061-build.md, DEC-023,
        STAGE-011 frame, brief.md); git diff main..HEAD -- src/engine/ confirmed EMPTY (DEC-001); no
        package.json/package-lock.json diff (no new dependency). Zero-network grep of src/analytics/
        non-test source for fetch|sendBeacon|XMLHttpRequest|WebSocket|navigator\. found NONE. Full gate
        re-run green: typecheck, lint, test (437/437 across 75 files, incl. the 12 new analytics tests),
        build, validate, cost-audit. No .only/.skip/xit in src/analytics/*.test.ts. All 7 acceptance
        criteria walked and backed by a specific test or code fact. Ran all 4 adversarial guard-mutations
        from the spec's Notes, one at a time, reverting each before the next: (1) resolveSinkKind
        unconditional passthrough broke exactly "resolveSinkKind returns off when unset, empty, or
        unrecognized"; (2) createSink throwing-object-for-off broke the named identity test plus 2
        cascading track.test.ts tests (getSink/resetSink default identity) — expected collateral since
        track.ts's default active sink is also built via createSink(), not a coverage gap; (3) removing
        track's try/catch broke exactly "track and flush never throw when the active sink throws"; (4)
        track calling noopSink.track directly (ignoring activeSink) broke exactly "track dispatches to
        the active sink; setSink swaps it". All 4 mutations reverted; git diff against the build commit
        confirmed clean; full suite re-confirmed green (437/437) after revert. just decisions-audit
        --changed main flagged DEC-023 as governing the touched src/analytics/** paths (consistent with
        the build); just decisions-audit (no flag) reported 0 structural errors (29 pre-existing
        scope-overlap warnings, none new, none involving DEC-023). DEC-005 confirmed UNAMENDED
        (superseded_by: null, no diff on decisions/DEC-005-play-money-model.md); SECURITY.md and
        public/_headers confirmed UNCHANGED (empty diff main..HEAD). Build reflection in ## Build
        Completion answered honestly (matches transcription-only build). Zero defects found.
        Verdict: APPROVED.
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      estimated_usd: null
      recorded_at: 2026-07-11
      note: >-
        main-loop, not separately metered (AGENTS §4); ship cycle. Reconciled build + verify against
        git/disk, filled the build/verify cost from the Agent results' subagent_tokens (build 101937,
        verify 118351), appended the Ship Reflection, pushed the branch, opened + CI-polled the PR (all
        checks SUCCESS), squash-merged --delete-branch, closed the timeline cycles, archived the spec,
        captured a brag, and logged the dogfood signals. First Tier-1 spec of STAGE-011.
  totals:
    tokens_total: 220288   # build 101937 + verify 118351 (design + ship main-loop, counted as 0)
    estimated_usd: 1.45    # build 0.67 + verify 0.78
    session_count: 4       # design, build, verify, ship
---

# SPEC-061: Analytics event model and Sink seam (default OFF)

## Context

STAGE-011 makes **real-world play measurable** without compromising the app's clean client-only
posture. Its backlog was split at the 2026-07-11 framing review into **Tier 1** (approved, building
now — the default-off, zero-network seam) and **Tier 2** (GATED — any *remote* sink, which reverses
DEC-005's no-backend clause and needs a separate DEC-005 amendment + `SECURITY.md` update + explicit
user go). **This spec is the first Tier-1 spec** and the stage's **infrastructure keystone**: it ships
the provider-agnostic analytics **seam** — the event model, the pluggable `Sink` interface, the default
`NoopSink`, the `VITE_ANALYTICS_SINK` build-config gate (default `off`), and a never-throw `track()`
façade — **fully unit-tested and proven inert**. There is **no network, no UI, no game wiring** here:
the recording tap into the existing STAGE-008/009/010 seams (plus the ephemeral session id and
Do-Not-Track short-circuit) is the *next* Tier-1 spec, SPEC-062. It mirrors the SPEC-054 shape exactly
(a pure `src/stats/` leaf module + safe seam, no UI) one directory over in `src/analytics/`.

It authors **DEC-023** (the analytics posture). In the Tier-1 scope, DEC-023 **affirms DEC-005 holds**
(the default build is zero-network) and **does not amend** the no-backend clause — any such amendment is
a deferred Tier-2 decision. DEC-001 holds: analytics is a side channel the engine never sees;
`src/analytics/**` imports engine **types** only, so `git diff … -- src/engine/` stays EMPTY.

## Goal

Ship the `src/analytics/` seam — `events.ts` (the anonymous `AnalyticsEvent` union), `sink.ts` (the
`Sink` interface + `noopSink` + the `VITE_ANALYTICS_SINK` gate `resolveSinkKind`/`createSink`, default
`off`), a never-throw `track.ts` façade (`track`/`flush`/`setSink`/`resetSink`/`getSink`), a
self-contained `env.d.ts`, and an `index.ts` barrel — each fully unit-tested and **proven to make zero
network calls under the default (off) sink**. No React, no game wiring, no UI, no engine change.

## Inputs

- **Files to read:**
  - `src/stats/sessionStats.ts` + `src/stats/statsStorage.ts` (SPEC-054) — the pure-leaf-module +
    safe-seam pattern (co-located tests, guarded/never-throw) this spec mirrors one directory over.
  - `src/engine/index.ts` — the `WinTier` (`'none' | 'small' | 'big' | 'jackpot'`) and `BetLevel`
    (`10 | 25 | 50`) **type** re-exports the `spin` event payload uses (types only — DEC-001).
  - `src/build-info.d.ts` — the ambient-`.d.ts` pattern `env.d.ts` mirrors (there is **no** `vite/client`
    reference or `ImportMetaEnv` typing in the repo yet, so `import.meta.env` must be typed by us).
  - `decisions/DEC-023-usage-analytics-posture.md` — the posture this spec implements.
- **Related code paths:** `src/analytics/` (new), `src/engine/` (types only, read).

## Outputs

- **Files created:**
  - `src/analytics/events.ts` — `ANALYTICS_EVENT_TYPES`, `AnalyticsEventType`, `AnalyticsEvent` (union).
  - `src/analytics/sink.ts` — `Sink` interface, `noopSink`, `SinkKind`, `resolveSinkKind`, `createSink`.
  - `src/analytics/track.ts` — module-level active-sink façade: `track`, `flush`, `setSink`,
    `resetSink`, `getSink`.
  - `src/analytics/env.d.ts` — ambient typing for `import.meta.env.VITE_ANALYTICS_SINK`.
  - `src/analytics/index.ts` — barrel (the module's public surface).
  - `src/analytics/events.test.ts`, `src/analytics/sink.test.ts`, `src/analytics/track.test.ts`.
- **Files modified:** none.
- **New exports:** (from `src/analytics/index.ts`) `AnalyticsEvent`, `AnalyticsEventType`,
  `ANALYTICS_EVENT_TYPES`, `Sink`, `SinkKind`, `noopSink`, `resolveSinkKind`, `createSink`, `track`,
  `flush`, `setSink`, `resetSink`, `getSink`.
- **Database changes:** none (no storage, no network; DEC-005 intact).

## Acceptance Criteria

Testable outcomes. Cover happy path, error cases, edge cases.

- [ ] `ANALYTICS_EVENT_TYPES` is exactly `['session_start','spin','cash_in','machine_switch','help_seen']`
      and `AnalyticsEventType` is its element type; each discriminant is constructible as an
      `AnalyticsEvent` with only anonymous game-fact fields (no identity/PII field on any variant).
- [ ] `noopSink.track(event)` and `noopSink.flush()` are no-ops that return `undefined` and never throw.
- [ ] `resolveSinkKind` returns `'off'` for `undefined`, `''`, and any unrecognized value (including the
      Tier-2 kinds `'http'`/`'cloudflare'`, which Tier 1 must NOT honor), and `'off'` for `'off'`.
- [ ] `createSink('off')` and `createSink()` (default, from build config) both return the **`noopSink`
      instance** — the default build's sink is provably the no-op.
- [ ] Under the default (off) sink, calling `track(e)` for **every** event type and then `flush()` makes
      **no** network call — `globalThis.fetch` and `navigator.sendBeacon` (when present) are never
      invoked. (The stage's "provably inert" success criterion.)
- [ ] `track` dispatches the event to the active sink; `setSink(s)` swaps the active sink; `resetSink()`
      restores the `noopSink` default (a previously-set spy then receives nothing).
- [ ] `track` and `flush` never throw even when the active sink's `track`/`flush` throw.
- [ ] `git diff main..HEAD -- src/engine/` is EMPTY; no new dependency; nothing outside `src/analytics/`
      is modified.

## Failing Tests

Written during **design**, BEFORE build. The implementer's job in **build** is to make these pass.
Assertions are deterministic from the module semantics (no simulation needed). Match the repo's existing
test style: Vitest globals (`describe`/`it`/`expect`/`vi`/`afterEach`) with **no** import (types configured).

- **`src/analytics/events.test.ts`**
  - `"ANALYTICS_EVENT_TYPES enumerates exactly the five anonymous event types"` — asserts
    `ANALYTICS_EVENT_TYPES` deep-equals `['session_start','spin','cash_in','machine_switch','help_seen']`.
  - `"every discriminant is constructible and drawn from ANALYTICS_EVENT_TYPES"` — build one sample per
    variant (see Notes `SAMPLE_EVENTS`); assert each `e.type` is in `ANALYTICS_EVENT_TYPES` and that the
    set of sample discriminants equals the set of `ANALYTICS_EVENT_TYPES`.
  - `"the spin payload carries only anonymous game facts"` — for
    `{ type:'spin', machineId:'ocean', bet:25, totalWin:0, tier:'none' }`, assert
    `Object.keys(...).sort()` deep-equals `['bet','machineId','tier','totalWin','type']` (no id/PII key).

- **`src/analytics/sink.test.ts`**
  - `"noopSink.track/flush are no-ops that return undefined and never throw"` — asserts
    `noopSink.track({type:'session_start'})` returns `undefined`, `noopSink.flush()` returns `undefined`,
    and neither throws.
  - `"resolveSinkKind returns off when unset, empty, or unrecognized"` — `resolveSinkKind(undefined)`,
    `resolveSinkKind('')`, `resolveSinkKind('http')`, `resolveSinkKind('cloudflare')`,
    `resolveSinkKind('nonsense')` all `=== 'off'`.
  - `"resolveSinkKind recognizes an explicit off"` — `resolveSinkKind('off') === 'off'`.
  - `"createSink returns the noopSink instance for off and by default"` —
    `createSink('off') === noopSink` and `createSink() === noopSink` (both the same singleton).

- **`src/analytics/track.test.ts`** *(with `afterEach(() => { resetSink(); vi.restoreAllMocks(); })`)*
  - `"getSink defaults to the noopSink (zero-network default build)"` — `getSink() === noopSink`.
  - `"no network call fires for any event under the default (off) sink"` — spy on `globalThis.fetch`
    (guard: only if `typeof globalThis.fetch === 'function'`) and on `navigator.sendBeacon` (guard: only
    if present, since jsdom omits it); `for (const e of SAMPLE_EVENTS) track(e); flush();` then assert the
    spies were **not** called.
  - `"track dispatches to the active sink; setSink swaps it"` — set a recording spy sink, `track` a
    `help_seen`, assert the spy captured exactly `[{ type:'help_seen' }]`.
  - `"resetSink restores the noop default"` — set a spy sink, `resetSink()`, assert `getSink() === noopSink`
    and that a subsequent `track` does NOT reach the spy.
  - `"track and flush never throw when the active sink throws"` — set a sink whose `track`/`flush` throw;
    assert `() => track({type:'session_start'})` and `() => flush()` do not throw.

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-023` — the analytics posture this spec IMPLEMENTS: provider-agnostic `Sink` seam, default off
  (`NoopSink`), anonymous events only, no PII/cookie/persistent id. Tier 1 → **zero network, DEC-005
  intact**; remote sinks are the GATED Tier 2.
- `DEC-005` — no backend / no PII: Tier 1 **affirms** it — no network, no storage here; this spec makes
  NO amendment. (The `track()` façade also mirrors DEC-005's never-throw safe-seam ethos.)
- `DEC-001` — engine-no-dom: `src/analytics/` reads engine **types** only (`WinTier`, `BetLevel`);
  `git diff main..HEAD -- src/engine/` MUST be empty and the engine gains no import of `src/analytics`.
- `DEC-015` — the config-driven "consume plain data behind a seam" ethos the pluggable `Sink` mirrors.

### Constraints that apply

- `engine-no-dom` — `src/analytics/` is a new leaf module importing only engine *types*; never the reverse.
- `no-new-top-level-deps-without-decision` — **no** new dependency (uses only platform + engine types).
- `no-real-money` — unaffected; analytics is anonymous usage telemetry, not money.

### Prior related work

- `SPEC-054` (shipped) — `src/stats/` pure model + safe storage; the leaf-module + co-located-test +
  never-throw pattern this spec mirrors one directory over (analytics has no storage — even leaner).
- `SPEC-049` (shipped) — the `zany:*` safe-seam / provider pattern SPEC-062 will follow for the tap.

### Out of scope (for this spec specifically)

If any of these feel necessary during build, create/await the right spec — do NOT expand this one.

- The recording tap into `useSlotMachine` / `MachineProvider` / `HelpSeenProvider`, the ephemeral
  in-memory session id, and the `navigator.doNotTrack` short-circuit — that is **SPEC-062** (Tier 1).
- Any real transport: `sendBeacon`/`fetch`, batching, an endpoint, a CSP `connect-src` change — those
  belong to the **GATED Tier 2** `HttpSink` (SPEC-063) / Cloudflare sink (SPEC-064). Do NOT add them.
- Any React (provider/hook/context) or UI — none in this spec.
- Any change to `SECURITY.md`, `public/_headers`, or `DEC-005` — Tier 1 changes none of these.

## Notes for the Implementer

Transcription of the drop-in code below. Keep every module a pure leaf; the only non-test import outside
`src/analytics/` is `import type { WinTier, BetLevel } from '../engine'` (types only). New `.test.ts`
(not `.tsx` — no JSX). Match the repo's test style (Vitest globals, no import of `describe`/`it`/`vi`).

**Toolchain notes:** tsconfig `include` is `["src"]` (picks up `env.d.ts`); `types` is
`["vitest/globals","@testing-library/jest-dom","node"]` — there is **no** `vite/client`, so `env.d.ts`
must declare `import.meta.env` itself (ambient, no imports/exports — mirrors `src/build-info.d.ts`).
jsdom does **not** implement `navigator.sendBeacon` (guard the spy). Node-20/vitest provides
`globalThis.fetch` (guard anyway). `strict`, `noUnusedLocals`, `noUnusedParameters`,
`noFallthroughCasesInSwitch` are all on.

**Adversarial guard-mutations to run in verify** (each should break exactly the named test; revert after):
1. In `resolveSinkKind`, return `raw as SinkKind` unconditionally (drop the `KNOWN_SINK_KINDS` check) →
   breaks `"resolveSinkKind returns off when unset, empty, or unrecognized"` (`'http'` would leak through).
2. In `createSink`, return a throwing object instead of `noopSink` for `'off'` (e.g. `{ track(){throw 0},
   flush(){} }`) → breaks `"createSink returns the noopSink instance for off and by default"` (identity).
3. In `track`, remove the `try/catch` → breaks `"track and flush never throw when the active sink throws"`.
4. In `track`, ignore `activeSink` and call `noopSink.track` directly → breaks `"track dispatches to the
   active sink; setSink swaps it"` (the spy would capture nothing).

### `src/analytics/events.ts` (drop-in)

```ts
// events.ts — the anonymous usage-analytics event model (SPEC-061, STAGE-011, DEC-023).
// Pure types + the enumerable discriminant list. No PII, no identifiers, no cookies: every event is
// an anonymous game fact — the same events that already flow through the STAGE-008/009/010 seams.
// The engine never sees this module; it imports engine TYPES only (DEC-001).

import type { WinTier, BetLevel } from '../engine';

/** The analytics event discriminants, in one enumerable list (for tests + future validation). */
export const ANALYTICS_EVENT_TYPES = [
  'session_start',
  'spin',
  'cash_in',
  'machine_switch',
  'help_seen',
] as const;

/** The `type` discriminant of an AnalyticsEvent. */
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

/**
 * One anonymous usage event — a discriminated union on `type`.
 * Payloads carry only anonymous game facts (which machine, bet size, win amount/tier), never a user
 * identity. The transport envelope (timestamp, ephemeral session id, app version) is added by the
 * recording tap / sink layer (SPEC-062+), not here.
 */
export type AnalyticsEvent =
  | { readonly type: 'session_start' }
  | {
      readonly type: 'spin';
      readonly machineId: string;
      readonly bet: BetLevel;
      readonly totalWin: number;
      readonly tier: WinTier;
    }
  | { readonly type: 'cash_in'; readonly machineId: string }
  | { readonly type: 'machine_switch'; readonly from: string; readonly to: string }
  | { readonly type: 'help_seen' };
```

### `src/analytics/sink.ts` (drop-in)

```ts
// sink.ts — the pluggable analytics Sink interface, the default no-op sink, and the build-config gate
// that chooses one (SPEC-061, STAGE-011, DEC-023). The app talks ONLY to the Sink interface (Design
// Note 2): the default build gets the noopSink — zero network, zero side effects, DEC-005 intact.
// Tier 2 (SPEC-063/064, GATED) adds real remote sinks to createSink()'s switch — each of which
// reverses no-backend and needs a DEC-005 amendment + SECURITY.md update before it may be wired in.

import type { AnalyticsEvent } from './events';

/**
 * A pluggable analytics sink. `track` records one event; `flush` is a hint to send any buffered
 * events (e.g. on pagehide). Both MUST be total and non-throwing — analytics is a fire-and-forget
 * side channel that must never break the game (the DEC-005 never-throw ethos).
 */
export interface Sink {
  track(event: AnalyticsEvent): void;
  flush(): void;
}

/** The default sink: does nothing at all. The public build ships this (zero network). */
export const noopSink: Sink = {
  track() {},
  flush() {},
};

/**
 * The analytics sink kinds selectable at BUILD time via VITE_ANALYTICS_SINK.
 * Tier 1 ships only 'off' (the no-op). Tier 2 (GATED) will extend this to 'http' | 'cloudflare'.
 */
export type SinkKind = 'off';

const KNOWN_SINK_KINDS: readonly SinkKind[] = ['off'];

/**
 * Resolve the configured sink kind. Unset or unrecognized ⇒ 'off' (fail safe to zero-network).
 * `raw` defaults to the build-config env; passing it explicitly makes the resolver unit-testable.
 */
export function resolveSinkKind(
  raw: string | undefined = import.meta.env.VITE_ANALYTICS_SINK,
): SinkKind {
  return (KNOWN_SINK_KINDS as readonly string[]).includes(raw ?? '') ? (raw as SinkKind) : 'off';
}

/**
 * Build the sink selected by config. Tier 1: always the no-op (zero network, DEC-005 intact).
 * Tier 2 (GATED) adds real cases here.
 */
export function createSink(kind: SinkKind = resolveSinkKind()): Sink {
  switch (kind) {
    case 'off':
      return noopSink;
    default:
      return noopSink;
  }
}
```

### `src/analytics/track.ts` (drop-in)

```ts
// track.ts — the process-wide analytics seam (SPEC-061, STAGE-011, DEC-023).
// A thin, fire-and-forget façade over the active Sink. track()/flush() never throw — analytics must
// never break a spin. The active sink defaults to the build-config sink (Tier 1: the no-op); the
// SPEC-062 recording provider replaces it (e.g. the no-op under Do-Not-Track) via setSink().

import type { AnalyticsEvent } from './events';
import { createSink, type Sink } from './sink';

let activeSink: Sink = createSink();

/** Swap the active sink. Used by the SPEC-062 provider (DNT → noopSink) and by tests. */
export function setSink(sink: Sink): void {
  activeSink = sink;
}

/** Restore the build-config default sink. Test/teardown helper (and provider reset). */
export function resetSink(): void {
  activeSink = createSink();
}

/** The current active sink (mainly for assertions/tests). */
export function getSink(): Sink {
  return activeSink;
}

/** Record one analytics event. Fire-and-forget; swallows all errors (never breaks the game). */
export function track(event: AnalyticsEvent): void {
  try {
    activeSink.track(event);
  } catch {
    // analytics is a side channel — never propagate
  }
}

/** Flush any buffered events (e.g. on pagehide). Fire-and-forget; never throws. */
export function flush(): void {
  try {
    activeSink.flush();
  } catch {
    // never propagate
  }
}
```

### `src/analytics/env.d.ts` (drop-in)

```ts
// env.d.ts — types the one build-config env var this module reads (SPEC-061, DEC-023).
// Mirrors src/build-info.d.ts (which types the Vite `define` constants). Self-contained and ambient
// (no imports/exports): declares import.meta.env with our key so we don't pull in vite/client's full
// env surface. Unset/unrecognized ⇒ 'off' at runtime (see resolveSinkKind).

interface ImportMetaEnv {
  /**
   * Analytics sink selected at BUILD time. Unset or unrecognized ⇒ 'off' (zero-network default).
   * Tier 1 recognizes only 'off'; Tier 2 (GATED) would add 'http' | 'cloudflare'.
   */
  readonly VITE_ANALYTICS_SINK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### `src/analytics/index.ts` (drop-in)

```ts
// index.ts — the analytics module's public surface (SPEC-061, STAGE-011, DEC-023).
// The rest of the app imports analytics ONLY through here (mirrors src/engine/index.ts).

export { ANALYTICS_EVENT_TYPES } from './events';
export type { AnalyticsEvent, AnalyticsEventType } from './events';
export { noopSink, resolveSinkKind, createSink } from './sink';
export type { Sink, SinkKind } from './sink';
export { track, flush, setSink, resetSink, getSink } from './track';
```

### Test drop-ins

```ts
// src/analytics/events.test.ts — the event model (SPEC-061). Plain Vitest, no DOM.
import { ANALYTICS_EVENT_TYPES, type AnalyticsEvent } from './events';

// One sample per discriminant (also used, verbatim, by track.test.ts).
const SAMPLE_EVENTS: AnalyticsEvent[] = [
  { type: 'session_start' },
  { type: 'spin', machineId: 'ocean', bet: 10, totalWin: 50, tier: 'big' },
  { type: 'cash_in', machineId: 'arctic' },
  { type: 'machine_switch', from: 'ocean', to: 'desert' },
  { type: 'help_seen' },
];

describe('analytics events', () => {
  it('ANALYTICS_EVENT_TYPES enumerates exactly the five anonymous event types', () => {
    expect([...ANALYTICS_EVENT_TYPES]).toEqual([
      'session_start',
      'spin',
      'cash_in',
      'machine_switch',
      'help_seen',
    ]);
  });

  it('every discriminant is constructible and drawn from ANALYTICS_EVENT_TYPES', () => {
    for (const e of SAMPLE_EVENTS) {
      expect(ANALYTICS_EVENT_TYPES).toContain(e.type);
    }
    expect(new Set(SAMPLE_EVENTS.map((e) => e.type))).toEqual(new Set(ANALYTICS_EVENT_TYPES));
  });

  it('the spin payload carries only anonymous game facts', () => {
    const spin: AnalyticsEvent = {
      type: 'spin',
      machineId: 'ocean',
      bet: 25,
      totalWin: 0,
      tier: 'none',
    };
    expect(Object.keys(spin).sort()).toEqual(['bet', 'machineId', 'tier', 'totalWin', 'type']);
  });
});
```

```ts
// src/analytics/sink.test.ts — the Sink interface, noop, and config gate (SPEC-061). Plain Vitest.
import { noopSink, resolveSinkKind, createSink } from './sink';

describe('noopSink', () => {
  it('track/flush are no-ops that return undefined and never throw', () => {
    expect(() => noopSink.track({ type: 'session_start' })).not.toThrow();
    expect(() => noopSink.flush()).not.toThrow();
    expect(noopSink.track({ type: 'session_start' })).toBeUndefined();
    expect(noopSink.flush()).toBeUndefined();
  });
});

describe('resolveSinkKind', () => {
  it('returns off when unset, empty, or unrecognized', () => {
    expect(resolveSinkKind(undefined)).toBe('off');
    expect(resolveSinkKind('')).toBe('off');
    expect(resolveSinkKind('http')).toBe('off'); // a Tier-2 kind is NOT honored in Tier 1
    expect(resolveSinkKind('cloudflare')).toBe('off');
    expect(resolveSinkKind('nonsense')).toBe('off');
  });

  it('recognizes an explicit off', () => {
    expect(resolveSinkKind('off')).toBe('off');
  });
});

describe('createSink', () => {
  it('returns the noopSink instance for off and by default', () => {
    expect(createSink('off')).toBe(noopSink);
    expect(createSink()).toBe(noopSink);
  });
});
```

```ts
// src/analytics/track.test.ts — the never-throw track() seam, proven inert (SPEC-061).
import { track, flush, setSink, resetSink, getSink } from './track';
import { noopSink, type Sink } from './sink';
import type { AnalyticsEvent } from './events';

const SAMPLE_EVENTS: AnalyticsEvent[] = [
  { type: 'session_start' },
  { type: 'spin', machineId: 'ocean', bet: 10, totalWin: 50, tier: 'big' },
  { type: 'cash_in', machineId: 'arctic' },
  { type: 'machine_switch', from: 'ocean', to: 'desert' },
  { type: 'help_seen' },
];

describe('analytics track seam', () => {
  afterEach(() => {
    resetSink();
    vi.restoreAllMocks();
  });

  it('getSink defaults to the noopSink (zero-network default build)', () => {
    expect(getSink()).toBe(noopSink);
  });

  it('no network call fires for any event under the default (off) sink', () => {
    const fetchSpy =
      typeof globalThis.fetch === 'function' ? vi.spyOn(globalThis, 'fetch') : null;
    const beaconSpy =
      typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function'
        ? vi.spyOn(navigator, 'sendBeacon')
        : null;

    for (const e of SAMPLE_EVENTS) track(e);
    flush();

    if (fetchSpy) expect(fetchSpy).not.toHaveBeenCalled();
    if (beaconSpy) expect(beaconSpy).not.toHaveBeenCalled();
  });

  it('track dispatches to the active sink; setSink swaps it', () => {
    const seen: AnalyticsEvent[] = [];
    const spy: Sink = { track: (e) => seen.push(e), flush: () => {} };
    setSink(spy);
    track({ type: 'help_seen' });
    expect(seen).toEqual([{ type: 'help_seen' }]);
  });

  it('resetSink restores the noop default', () => {
    const spy: Sink = { track: vi.fn(), flush: vi.fn() };
    setSink(spy);
    resetSink();
    expect(getSink()).toBe(noopSink);
    track({ type: 'session_start' });
    expect(spy.track).not.toHaveBeenCalled();
  });

  it('track and flush never throw when the active sink throws', () => {
    setSink({
      track: () => {
        throw new Error('sink boom');
      },
      flush: () => {
        throw new Error('flush boom');
      },
    });
    expect(() => track({ type: 'session_start' })).not.toThrow();
    expect(() => flush()).not.toThrow();
  });
});
```

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-061-analytics-sink-seam`
- **PR (if applicable):** none — local-only build session, no push/PR per prompt
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - `DEC-023` — Usage-analytics posture (authored at design; no NEW dec emitted at build)
- **Deviations from spec:**
  - None. All 5 source modules and 3 test files were transcribed verbatim from the spec's "Notes for
    the Implementer" drop-ins.
- **Follow-up work identified:**
  - None beyond the already-scoped SPEC-062 (recording tap + ephemeral session + DNT) and the gated
    Tier-2 specs (SPEC-063/064/065) referenced by the spec.

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing. The spec's drop-in code was complete and internally consistent (types, sink gate,
   track façade, ambient env typing, barrel, and all three test files), so build was pure transcription
   plus running the gate.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. `engine-no-dom`, `no-new-top-level-deps-without-decision`, and DEC-001/005/015/023 fully covered
   what build needed to check (engine-types-only import, zero network, no new dependency).

3. **If you did this task again, what would you do differently?**
   — Nothing material. One could note the "no vite/client in tsconfig" toolchain gotcha directly in
   `env.d.ts`'s own comment (already done) rather than only in the spec — but that's a wash since both
   already carry it.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?**
   — Very little — the "measure-then-pin" discipline degenerates cleanly for a pure-infra spec (no game
   math to simulate), so the drop-ins transcribed verbatim with zero deviations and the build/verify were
   frictionless. The one judgement call worth flagging for the *next* Tier-1 spec (SPEC-062): the
   `resolveSinkKind` fail-safe deliberately refuses even `'http'`/`'cloudflare'` in Tier 1 — that guard is
   what makes "Tier 2 can't sneak on via an env var" true, and it should stay until Tier 2 is deliberately
   taken up. Worth keeping the tier boundary mechanical, not just documented.

2. **Does any template, constraint, or decision need updating?**
   — No template/constraint change. DEC-023 was authored here and held cleanly through build + verify
   (DEC-005 stayed UNAMENDED; SECURITY.md/`_headers` untouched — exactly the Tier-1 posture). One small
   repo-first: this is the first `import.meta.env.VITE_*` read in the codebase; the self-contained
   ambient `src/analytics/env.d.ts` (mirroring `src/build-info.d.ts`) typed it without pulling in
   `vite/client`. If a future spec needs more `VITE_*` vars, that file is the place to extend — no
   `vite/client` dependency needed.

3. **Is there a follow-up spec I should write now before I forget?**
   — No NEW spec — SPEC-062 (recording tap + ephemeral session + DNT) is already framed and is the exact
   next step: it consumes this `track()` seam from the STAGE-008/009/010 recording points, adds the
   in-memory session id, and short-circuits on `navigator.doNotTrack`. The Tier-2 specs (SPEC-063/064/065)
   remain GATED behind a DEC-005 amendment + explicit user decision — deliberately NOT queued.
