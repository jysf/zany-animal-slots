---
# Maps to ContextCore task.* semantic conventions.
# This variant assumes Claude plays every role. The context normally
# in a separate handoff doc lives in the ## Implementation Context
# section below.

task:
  id: SPEC-062
  type: story                      # epic | story | task | bug | chore
  cycle: design                    # frame | design | build | verify | ship
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
    - DEC-023   # the analytics posture this spec IMPLEMENTS (ephemeral in-memory session id; DNT forces off)
    - DEC-005   # no backend / no PII: Tier 1 stays zero-network — the default sink is still the no-op
    - DEC-001   # engine-no-dom: the taps live in UI seams; the engine is untouched
    - DEC-020   # the recording seam (recordSpin/recordCashIn) the spin/cash_in taps sit beside
    - DEC-022   # the help-seen seam the help_seen tap sits beside
  constraints:
    - engine-no-dom
    - no-new-top-level-deps-without-decision
    - no-real-money
  related_specs:
    - SPEC-061  # the Sink seam + track() this taps into (promotes its Sink contract to TrackedEvent)
    - SPEC-055  # the useSlotMachine × StatsProvider recording seam the spin/cash_in taps mirror + test-pattern
    - SPEC-063  # Tier 2 (GATED) — the HttpSink that will consume the TrackedEvent envelope this builds

value_link: >-
  Completes STAGE-011 Tier 1: the anonymous recording tap that turns the SPEC-061 seam into a working
  (still default-OFF) usage beacon — session_start / spin / cash_in / machine_switch / help_seen emitted
  from the existing STAGE-008/009/010 seams, stamped with an ephemeral in-memory session id, honoring
  Do-Not-Track. Zero network in the default build; a Tier-2 sink is now a pure swap.

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
        Design authored on the main Opus loop (un-metered, AGENTS §4). The second and final Tier-1 spec:
        the recording tap. Key design call — SPEC-061's Sink contract is promoted from a bare domain
        event to a TrackedEvent envelope ({ event, ts, sessionId, appVersion }) built in track(), so the
        ephemeral session id has a live production consumer (no dead code) and Tier-2 sinks receive a
        complete usage instance. DNT is a policy applied at startup (isDoNotTrack ⇒ force noopSink);
        session id is in-memory only (crypto.randomUUID, never persisted). Taps are synchronous emits at
        the existing imperative seams (guarded by refs where a transition must fire once) — StrictMode
        double-mount only affects session_start, guarded by a once-flag. No new DEC (implements DEC-023);
        no new dependency; engine diff EMPTY (taps are UI). Default build stays zero-network (noop sink).
        Complete drop-ins for all new + modified modules and tests in the Notes.
    - cycle: build
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null   # orchestrator to fill from subagent_tokens
      recorded_at: 2026-07-12
      note: >-
        Verbatim transcription of the spec's Notes drop-ins: 3 new source modules (session.ts,
        lifecycle.ts, AnalyticsProvider.tsx), 4 modified source files + main.tsx, 6 new test files, and
        the 2 updated SPEC-061 test files (sink.test.ts, track.test.ts) promoted to the TrackedEvent
        contract. Full gate green (typecheck, lint, 81 test files / 453 tests, build), plus `just validate`
        and `just cost-audit`. Ran all 5 spec-specified adversarial guard-mutations (MachineProvider guard,
        HelpSeenProvider guard, track() envelope fields, emitSessionStart once-guard,
        applyAnalyticsPolicy dnt branch) — each broke exactly its named test, then reverted; working tree
        confirmed clean before commit. `git diff main..HEAD -- src/engine/` is EMPTY. No new dependency.
    - cycle: verify
      interface: claude-code
      model: claude-sonnet-4-6
      tokens_total: null   # orchestrator to fill from subagent_tokens
      recorded_at: 2026-07-12
      note: >-
        Fresh COLD verify session (Sonnet), reconciled against git/disk, not the build's self-report.
        Scope: `git diff --stat main..HEAD` touches only src/analytics/**, src/ui/analytics/**, the
        three tapped seams (useSlotMachine.ts, MachineProvider.tsx, HelpSeenProvider.tsx), main.tsx, and
        this spec's design artifacts; `git diff main..HEAD -- src/engine/` EMPTY; no package.json/lock
        change. Zero-network + posture confirmed: no fetch/sendBeacon/XHR/WebSocket in non-test
        analytics/tap code; createSink() always resolves noopSink in Tier 1; session id never written to
        localStorage (grepped session.ts); SECURITY.md, public/_headers, decisions/DEC-005 all empty-diff;
        no HttpSink/remote sink/endpoint anywhere. Full gate green: typecheck, lint, test (81 files / 453
        tests, including the SPEC-061 "no network call for any event under the off sink" test still
        passing against the promoted TrackedEvent contract), build, validate, cost-audit. No
        .only/.skip/xit in new/updated test files. All acceptance criteria walked and backed by a test or
        code fact. Ran all 5 spec-specified adversarial guard-mutations (MachineProvider guard,
        HelpSeenProvider guard, track() envelope fields, emitSessionStart once-guard, applyAnalyticsPolicy
        dnt branch); reverted each and reconfirmed 453/453 green. 4 of 5 broke exactly their named test;
        mutation 4 (emitSessionStart once-guard) broke its named lifecycle.test.ts assertion PLUS
        AnalyticsProvider.test.tsx's "consumes the one-shot session_start on mount" test — incidental
        extra coverage of the same once-guard invariant, not missing coverage; not treated as a defect.
        Contract-evolution sanity: SPEC-061's sink.test.ts/track.test.ts confirmed updated to TrackedEvent
        and passing; tap API (callers pass a domain event to track()) unchanged; existing seam tests
        (MachineProvider/HelpSeenProvider/useSlotMachine.stats/App) still green. `just decisions-audit
        --changed main` ran: DEC-023 correctly flagged as governing src/analytics/**, build consistent
        with it; DEC-005 file diff empty (unamended); DEC-004/DEC-010/DEC-022 advisory flags on the touched
        UI files are unrelated to this spec's change (broad path globs) and not violated. Defect count: 0.
        Verdict: APPROVED.
  totals:
    tokens_total: 0
    estimated_usd: 0
    session_count: 0
---

# SPEC-062: Analytics recording tap + ephemeral session + Do-Not-Track

## Context

The **second and final Tier-1 spec** of STAGE-011. SPEC-061 shipped the inert analytics **seam** (event
model, `Sink` interface, `noopSink` default, `VITE_ANALYTICS_SINK` gate, never-throw `track()`). This
spec makes it a working — but still **default-OFF** — usage beacon by **tapping the events into the game
seams already built in STAGE-008/009/010**, adding an **ephemeral in-memory session id**, and a
**Do-Not-Track** short-circuit. It emits `session_start` (on load), `spin` + `cash_in` (from
`useSlotMachine`, beside the SPEC-055 `recordSpin`/`recordCashIn` calls), `machine_switch` (from
`MachineProvider`), and `help_seen` (from `HelpSeenProvider`). The default build is **unchanged**: the
sink is still the no-op, so it makes **zero** network calls and DEC-005 stays fully intact; a test proves
no transport fires when off.

It **implements DEC-023** (no new DEC): anonymous events only, an **ephemeral, in-memory, never-persisted**
session id (regenerated every load — no cookie, no cross-load correlation), and `navigator.doNotTrack`
forcing analytics off regardless of build config. DEC-001 holds — the taps live in `src/ui/**` seams and
the pure `src/analytics/**`; **`git diff … -- src/engine/` stays EMPTY**. Tier 2 (SPEC-063/064/065 — any
remote sink) remains GATED behind a DEC-005 amendment + explicit user decision.

**One contract evolution:** SPEC-061's `Sink.track(event)` is promoted to `Sink.track(tracked:
TrackedEvent)`, where `TrackedEvent = { event, ts, sessionId, appVersion }` is built in `track()`. This
gives the session id a live production consumer (stamped on every event) and gives a future Tier-2 sink
the complete usage instance it needs. The **tap API is unchanged** — callers still `track(domainEvent)`.

## Goal

Emit the five anonymous analytics events from the existing STAGE-008/009/010 seams into `track()`; add a
pure `session.ts` (ephemeral in-memory session id + `isDoNotTrack`) and `lifecycle.ts` (startup policy +
once-per-load `session_start`); mount an `AnalyticsProvider` (policy + `session_start` + pagehide→flush);
and promote the `Sink` contract to carry a `TrackedEvent` envelope. Keep the **default build zero-network**
(noop sink) and the **engine untouched**.

## Inputs

- **Files to read:**
  - `src/analytics/{events,sink,track,index}.ts` (SPEC-061) — the seam this extends; the contract change
    lands here.
  - `src/ui/useSlotMachine.ts` — the `recordSpin` (reveal callback) + `recordCashIn` (`reset`) points the
    `spin`/`cash_in` taps sit beside (SPEC-055).
  - `src/ui/machine/MachineProvider.tsx` — `setActiveMachineId` (the `machine_switch` tap point).
  - `src/ui/help/HelpSeenProvider.tsx` — `markSeen` (the `help_seen` tap point).
  - `src/main.tsx` — the provider tree the `AnalyticsProvider` joins.
  - `src/ui/useSlotMachine.stats.test.tsx` — the fake-timer + provider render pattern the spin/cash_in
    tap tests mirror. `src/build-info.d.ts` / `__APP_VERSION__` — the build constant the envelope uses.
  - `decisions/DEC-023` — the posture this implements.
- **Related code paths:** `src/analytics/` (extend), `src/ui/analytics/` (new), the three UI seams above.

## Outputs

- **Files created:**
  - `src/analytics/session.ts` — `getSessionId`, `resetSessionId`, `isDoNotTrack`.
  - `src/analytics/lifecycle.ts` — `applyAnalyticsPolicy`, `emitSessionStart`, `startSession`,
    `resetSessionStarted`.
  - `src/ui/analytics/AnalyticsProvider.tsx` — the lifecycle provider (policy + session_start + flush).
  - Tests: `src/analytics/session.test.ts`, `src/analytics/lifecycle.test.ts`,
    `src/ui/analytics/AnalyticsProvider.test.tsx`, `src/ui/useSlotMachine.analytics.test.tsx`,
    `src/ui/machine/MachineProvider.analytics.test.tsx`, `src/ui/help/HelpSeenProvider.analytics.test.tsx`.
- **Files modified:**
  - `src/analytics/events.ts` — add the `TrackedEvent` envelope type.
  - `src/analytics/sink.ts` — `Sink.track(tracked: TrackedEvent)` (noopSink unchanged).
  - `src/analytics/track.ts` — `track()` builds the envelope (ts + sessionId + appVersion).
  - `src/analytics/index.ts` — export `TrackedEvent`, the session + lifecycle surface.
  - `src/analytics/sink.test.ts`, `src/analytics/track.test.ts` — update to the `TrackedEvent` contract.
  - `src/ui/useSlotMachine.ts` — emit `spin` + `cash_in`.
  - `src/ui/machine/MachineProvider.tsx` — emit `machine_switch` (from→to, once per real switch).
  - `src/ui/help/HelpSeenProvider.tsx` — emit `help_seen` (once, on the first mark).
  - `src/main.tsx` — mount `AnalyticsProvider`.
- **New exports:** `TrackedEvent`; `getSessionId`, `resetSessionId`, `isDoNotTrack`;
  `applyAnalyticsPolicy`, `emitSessionStart`, `startSession`, `resetSessionStarted`; `AnalyticsProvider`.
- **Database changes:** none (in-memory session id only; no storage, no cookie; DEC-005 intact).

## Acceptance Criteria

- [ ] `getSessionId()` returns a stable, non-empty id within a load and a **different** id after
      `resetSessionId()`; the id is never written to `localStorage`/cookies (in-memory only).
- [ ] `isDoNotTrack(nav)` is `true` when any of `nav.doNotTrack` / `nav.msDoNotTrack` / `window.doNotTrack`
      is `'1'` or `'yes'`, and `false` otherwise (incl. `'0'`, `unspecified`, absent, no navigator).
- [ ] `applyAnalyticsPolicy({ dnt: true, makeSink })` installs the **noopSink** (ignores `makeSink`);
      `{ dnt: false, makeSink }` installs `makeSink()`. Default (no opts) installs `createSink()` (Tier 1:
      noop) unless real DNT is set.
- [ ] `emitSessionStart()` emits exactly one `session_start` per load (idempotent; `resetSessionStarted()`
      re-arms it).
- [ ] `track(event)` hands the active sink a `TrackedEvent` with `event` unchanged, a numeric `ts`, the
      current `sessionId`, and `appVersion === __APP_VERSION__`; still swallows all sink errors.
- [ ] Under the default (off) sink, driving a spin / cash-in / machine switch / help-seen / mount makes
      **no** network call (`fetch`/`sendBeacon` never invoked) — the default build is provably inert.
- [ ] A resolved spin emits `{ type:'spin', machineId, bet, totalWin, tier }` with the engine's real
      outcome; `reset()` emits `{ type:'cash_in', machineId }`.
- [ ] Switching to a **different** machine emits `{ type:'machine_switch', from, to }`; re-selecting the
      current machine emits nothing. The first `markSeen()` emits one `help_seen`; subsequent marks emit none.
- [ ] `AnalyticsProvider` renders its children, applies the policy + consumes the one-shot `session_start`
      on mount, and flushes on `pagehide`; the listener is removed on unmount.
- [ ] `git diff main..HEAD -- src/engine/` is EMPTY; no new dependency; existing tests still pass.

## Failing Tests

Written during **design**, BEFORE build. Match the repo's Vitest-globals style (no import of
`describe`/`it`/`vi`); `.tsx` for React (RTL `renderHook`/`render` + `act`), `.ts` for pure modules.

- **`src/analytics/session.test.ts`** — `getSessionId` stable within a load and non-empty; differs after
  `resetSessionId()`; not written to `localStorage` (`localStorage.length === 0` after a call).
  `isDoNotTrack` true for `{doNotTrack:'1'}`, `{doNotTrack:'yes'}`, `{msDoNotTrack:'1'}`; false for
  `{doNotTrack:'0'}`, `{doNotTrack:'unspecified'}`, `{}`, and `undefined` nav.
- **`src/analytics/lifecycle.test.ts`** — `applyAnalyticsPolicy({dnt:true, makeSink:()=>spy})` returns
  `noopSink` + `getSink()===noopSink` (spy not installed); `{dnt:false, makeSink:()=>spy}` returns spy +
  `getSink()===spy`. `emitSessionStart` with a spy installed pushes exactly one `session_start`; a second
  call pushes none; after `resetSessionStarted()` it fires again.
- **`src/analytics/track.test.ts`** *(UPDATE SPEC-061's file)* — the "dispatches to the active sink" test
  now asserts a `TrackedEvent`: `seen[0].event` deep-equals `{type:'help_seen'}`, `typeof seen[0].ts ===
  'number'`, `seen[0].sessionId` a non-empty string, `seen[0].appVersion === __APP_VERSION__`. The "no
  network under off" and "never throw" tests are unchanged (still pass).
- **`src/analytics/sink.test.ts`** *(UPDATE SPEC-061's file)* — the noopSink no-op test now passes a
  `TrackedEvent` sample; `resolveSinkKind`/`createSink` tests unchanged.
- **`src/ui/useSlotMachine.analytics.test.tsx`** *(fake timers; a spy sink via `setSink` in beforeEach,
  `resetSink()` in afterEach)* — mirrors `useSlotMachine.stats.test.tsx`: `nextSeed:()=>276` + advance
  `SPIN_DURATION_MS` ⇒ a `spin` TrackedEvent whose `event` deep-equals `{type:'spin',
  machineId:'wild-and-whimsical', bet:10, totalWin:40, tier:'small'}`; `reset()` ⇒ a `cash_in` event
  `{type:'cash_in', machineId:'wild-and-whimsical'}`.
- **`src/ui/machine/MachineProvider.analytics.test.tsx`** — `renderHook(useActiveMachine, {wrapper:
  MachineProvider})`; `setActiveMachineId('arctic')` ⇒ one `machine_switch` `{from:'wild-and-whimsical',
  to:'arctic'}`; re-selecting `'wild-and-whimsical'` ⇒ no `machine_switch`.
- **`src/ui/help/HelpSeenProvider.analytics.test.tsx`** *(clear localStorage so seen starts false)* —
  first `markSeen()` ⇒ exactly one `help_seen`; second `markSeen()` ⇒ still one.
- **`src/ui/analytics/AnalyticsProvider.test.tsx`** — renders children; after mount the one-shot
  `session_start` is consumed (`resetSessionStarted()`, mount, then `setSink(spy)` + `emitSessionStart()`
  ⇒ spy NOT called); a `pagehide` event triggers `flush` (install a spy sink after mount, dispatch
  `pagehide` ⇒ `spy.flush` called).

## Implementation Context

*Read this section (and the files it points to) before starting the build cycle.*

### Decisions that apply

- `DEC-023` — IMPLEMENTED here: anonymous events; ephemeral **in-memory** session id (never persisted, no
  cookie); `navigator.doNotTrack` forces analytics off. No new DEC — this is the posture's implementation.
- `DEC-005` — the default build stays **zero-network** (noop sink); the session id is in-memory only, no
  storage. The `track()` façade keeps the never-throw ethos.
- `DEC-001` — the taps are in `src/ui/**` + pure `src/analytics/**`; the engine is untouched
  (`git diff … -- src/engine/` EMPTY).
- `DEC-020` / `DEC-022` — the `recordSpin`/`recordCashIn` (SPEC-055) and `markSeen` (SPEC-059) seams the
  taps sit beside; the taps are additive and do not change those behaviors.

### Constraints that apply

- `engine-no-dom` — nothing here touches `src/engine/**`.
- `no-new-top-level-deps-without-decision` — no new dependency (platform `crypto`/`Date`/`navigator` only).
- `no-real-money` — unaffected.

### Prior related work

- `SPEC-061` (shipped, PR #72) — the seam this extends; this spec promotes its `Sink` contract to
  `TrackedEvent` and updates its `sink.test.ts`/`track.test.ts` accordingly.
- `SPEC-055` (shipped) — the `useSlotMachine` × `StatsProvider` recording seam + the fake-timer test
  pattern the spin/cash_in taps mirror.

### Out of scope (for this spec specifically)

- Any **remote sink** / real transport (`HttpSink`, Cloudflare, `sendBeacon`/`fetch` bodies, batching, an
  endpoint, a CSP `connect-src` change) — the **GATED Tier 2** (SPEC-063/064). Do NOT add them.
- Any UI surface / `/stats` view; any runtime user consent toggle or cookie banner.
- Any change to `SECURITY.md`, `public/_headers`, `DEC-005`, or the engine.
- A persistent or cross-load identifier of any kind (the session id is in-memory, per-load, only).

## Notes for the Implementer

Transcription of the drop-ins below. `src/analytics/**` stays pure (no React); the React provider is in
`src/ui/analytics/`. The taps are **synchronous emits** at existing imperative points — never inside a
`setState` updater (StrictMode double-invokes those). `track` is a stable module import (not a
`useCallback` dep). Match the repo test style (Vitest globals, no `describe`/`vi` import).

**Toolchain notes:** `__APP_VERSION__` is a Vite `define` global (declared in `src/build-info.d.ts`),
available in app + vitest. jsdom provides `crypto.randomUUID` and `localStorage`; it does NOT implement
`navigator.sendBeacon`. `Math.random` is allowed outside `src/engine/**`. `strict` + `noUnusedLocals` +
`noUnusedParameters` (a trailing unused arg is flagged — do not add one) + `noFallthroughCasesInSwitch`
are ON. Existing seam tests must stay green: `track()` is a no-op by default, so the taps are invisible
unless a test installs a spy sink.

**Adversarial guard-mutations to run in verify** (each should break exactly the named test; revert after):
1. In `MachineProvider`, drop the `next !== idRef.current` guard (always emit) → breaks the
   "re-selecting the current machine emits nothing" test.
2. In `HelpSeenProvider`, drop the `!seenRef.current` guard (always emit) → breaks the "second markSeen
   emits none" test.
3. In `track()`, drop `sessionId`/`appVersion` from the envelope → breaks the track "dispatches … envelope"
   assertion (`sessionId`/`appVersion` fields).
4. In `emitSessionStart`, remove the `started` once-guard → breaks the "emits exactly one per load" test.
5. In `applyAnalyticsPolicy`, ignore `dnt` (always use `makeSink`/`createSink`) → breaks the
   "`{dnt:true}` installs noopSink" test.

### `src/analytics/events.ts` — ADD (SPEC-061 content unchanged; append this)

```ts
/**
 * A recorded usage instance: one AnalyticsEvent stamped with the transport envelope a sink needs
 * (SPEC-062). `ts` = capture time (ms epoch); `sessionId` = the ephemeral per-load id (never persisted);
 * `appVersion` = the build version. No PII and no persistent/cross-load identifier.
 */
export interface TrackedEvent {
  readonly event: AnalyticsEvent;
  readonly ts: number;
  readonly sessionId: string;
  readonly appVersion: string;
}
```

### `src/analytics/sink.ts` — MODIFY the import + Sink.track signature (rest unchanged)

```ts
import type { TrackedEvent } from './events';

export interface Sink {
  track(tracked: TrackedEvent): void;
  flush(): void;
}

export const noopSink: Sink = {
  track() {}, // ignores the event entirely (zero side effects)
  flush() {},
};

// SinkKind, KNOWN_SINK_KINDS, resolveSinkKind, createSink are UNCHANGED from SPEC-061.
```

### `src/analytics/track.ts` — MODIFY track() to build the envelope

```ts
import type { AnalyticsEvent } from './events';
import { createSink, type Sink } from './sink';
import { getSessionId } from './session';

let activeSink: Sink = createSink();

export function setSink(sink: Sink): void {
  activeSink = sink;
}

export function resetSink(): void {
  activeSink = createSink();
}

export function getSink(): Sink {
  return activeSink;
}

/**
 * Record one analytics event. Stamps it with the per-load envelope (ts + ephemeral session id + app
 * version) and hands it to the active sink. Fire-and-forget; swallows all errors (never breaks the game).
 */
export function track(event: AnalyticsEvent): void {
  try {
    activeSink.track({
      event,
      ts: Date.now(),
      sessionId: getSessionId(),
      appVersion: __APP_VERSION__,
    });
  } catch {
    // analytics is a side channel — never propagate
  }
}

export function flush(): void {
  try {
    activeSink.flush();
  } catch {
    // never propagate
  }
}
```

### `src/analytics/session.ts` — NEW

```ts
// session.ts — ephemeral per-load session identity + Do-Not-Track check (SPEC-062, DEC-023).
// The session id is generated once per page load, kept ONLY in memory, and never persisted (no cookie,
// no localStorage), so it cannot correlate across loads. Do-Not-Track, when set, forces analytics off.

let sessionId: string | null = null;

/** A random, opaque, in-memory-only id for this page load. Lazily created; never stored. */
export function getSessionId(): string {
  if (sessionId === null) sessionId = createId();
  return sessionId;
}

/** Drop the in-memory session id (tests only; a load boundary otherwise creates a fresh one). */
export function resetSessionId(): void {
  sessionId = null;
}

function createId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  // Fallback (older engines): not a security primitive (DEC-005 ethos) — just needs to be unique-ish.
  return `sid-${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * True when the user has expressed Do-Not-Track (the legacy but still-honored signal). When true,
 * analytics is forced off regardless of build config (DEC-023). `nav` is injectable for tests.
 */
export function isDoNotTrack(
  nav: Navigator | undefined = typeof navigator !== 'undefined' ? navigator : undefined,
): boolean {
  if (!nav) return false;
  const n = nav as unknown as { doNotTrack?: string | null; msDoNotTrack?: string | null };
  const w =
    typeof window !== 'undefined' ? (window as unknown as { doNotTrack?: string | null }) : undefined;
  const signals: Array<string | null | undefined> = [n.doNotTrack, n.msDoNotTrack, w?.doNotTrack];
  return signals.some((s) => s === '1' || s === 'yes');
}
```

### `src/analytics/lifecycle.ts` — NEW

```ts
// lifecycle.ts — analytics startup policy + one-shot session start (SPEC-062, DEC-023).
// Applies the Do-Not-Track policy (DNT ⇒ force the no-op sink), then emits session_start exactly once
// per load. Kept out of React so it is unit-testable and StrictMode-double-mount-safe.

import { createSink, noopSink, type Sink } from './sink';
import { isDoNotTrack } from './session';
import { setSink, track } from './track';

/**
 * Choose + install the active sink for this load. Do-Not-Track forces the no-op sink regardless of build
 * config; otherwise the build-config sink is used (Tier 1: also the no-op). `opts` is injectable for
 * tests (a `dnt` override + a `makeSink` factory) so the DNT branch is provable without a real sink.
 */
export function applyAnalyticsPolicy(opts: { dnt?: boolean; makeSink?: () => Sink } = {}): Sink {
  const dnt = opts.dnt ?? isDoNotTrack();
  const sink = dnt ? noopSink : (opts.makeSink ?? createSink)();
  setSink(sink);
  return sink;
}

let started = false;

/** Emit session_start at most once per load (StrictMode-double-mount-safe). */
export function emitSessionStart(): void {
  if (started) return;
  started = true;
  track({ type: 'session_start' });
}

/** Re-arm the once-per-load session_start guard (tests only). */
export function resetSessionStarted(): void {
  started = false;
}

/** Full startup: apply the DNT/build policy, then emit session_start once. */
export function startSession(): void {
  applyAnalyticsPolicy();
  emitSessionStart();
}
```

### `src/analytics/index.ts` — ADD to the barrel (SPEC-061 exports unchanged)

```ts
export type { TrackedEvent } from './events';
export { getSessionId, resetSessionId, isDoNotTrack } from './session';
export {
  applyAnalyticsPolicy,
  emitSessionStart,
  startSession,
  resetSessionStarted,
} from './lifecycle';
```

### `src/ui/analytics/AnalyticsProvider.tsx` — NEW

```tsx
// AnalyticsProvider — mounts the analytics lifecycle (SPEC-062, DEC-023).
// On mount: applies the Do-Not-Track / build policy + emits session_start (once per load), and flushes on
// pagehide. Renders nothing of its own. The recording TAPS live at the existing game seams
// (useSlotMachine spin/cash-in, MachineProvider switch, HelpSeenProvider help-seen) which call the
// module-level track(); this provider only owns lifecycle. Default build: the sink is the no-op, so this
// is fully inert (DEC-005 intact).
import { useEffect, type ReactNode } from 'react';
import { startSession, flush } from '../../analytics';

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    startSession();
    const onHide = () => flush();
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, []);

  return <>{children}</>;
}
```

### `src/ui/useSlotMachine.ts` — MODIFY (add the two taps)

Add the import near the other UI imports:

```ts
import { track } from '../analytics';
```

In `reset()`, immediately after `recordCashIn();`:

```ts
    track({ type: 'cash_in', machineId: machine.id }); // SPEC-062: anonymous cash-in beacon (default off)
```

In the spin reveal callback, immediately after the `recordSpin({ ... }, machine.id);` line:

```ts
      track({
        type: 'spin',
        machineId: machine.id,
        bet,
        totalWin: outcome.totalWin,
        tier: outcome.tier,
      }); // SPEC-062: anonymous spin beacon (default off)
```

(No `useCallback` dep changes — `track` is a stable module import.)

### `src/ui/machine/MachineProvider.tsx` — MODIFY (machine_switch tap)

Add `useRef` to the React import and `import { track } from '../../analytics';`. Track the committed id in
a ref and emit on a real switch:

```ts
  const [activeMachineId, setId] = useState<string>(() => normalizeId(readActiveMachineId()));
  const idRef = useRef(activeMachineId);
  idRef.current = activeMachineId;

  const setActiveMachineId = useCallback((id: string) => {
    const next = normalizeId(id);
    if (next !== idRef.current) {
      track({ type: 'machine_switch', from: idRef.current, to: next }); // SPEC-062 (default off)
    }
    setId(next);
    writeActiveMachineId(next);
  }, []);
```

### `src/ui/help/HelpSeenProvider.tsx` — MODIFY (help_seen tap)

Add `useRef` to the React import and `import { track } from '../../analytics';`. Emit on the first mark:

```ts
  const [seen, setSeen] = useState<boolean>(() => readHelpSeen());
  const seenRef = useRef(seen);
  seenRef.current = seen;

  const markSeen = useCallback(() => {
    if (!seenRef.current) {
      track({ type: 'help_seen' }); // SPEC-062: fire once, on the first time help is seen (default off)
    }
    setSeen(true);
  }, []);
```

### `src/main.tsx` — MODIFY (mount AnalyticsProvider innermost)

```tsx
import { AnalyticsProvider } from './ui/analytics/AnalyticsProvider';

// ...
createRoot(rootElement).render(
  <StrictMode>
    <MachineProvider>
      <StatsProvider>
        <HelpSeenProvider>
          <AnalyticsProvider>
            <App />
          </AnalyticsProvider>
        </HelpSeenProvider>
      </StatsProvider>
    </MachineProvider>
  </StrictMode>,
);
```

### Test drop-ins

```ts
// src/analytics/session.test.ts
import { getSessionId, resetSessionId, isDoNotTrack } from './session';

describe('session id', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSessionId();
  });
  afterEach(() => resetSessionId());

  it('is stable within a load and non-empty', () => {
    const a = getSessionId();
    expect(a).toBeTruthy();
    expect(getSessionId()).toBe(a);
  });

  it('is regenerated after resetSessionId (per-load, not persistent)', () => {
    const a = getSessionId();
    resetSessionId();
    expect(getSessionId()).not.toBe(a);
  });

  it('is never written to localStorage', () => {
    getSessionId();
    expect(localStorage.length).toBe(0);
  });
});

describe('isDoNotTrack', () => {
  it('is true when a DNT signal is set to 1 or yes', () => {
    expect(isDoNotTrack({ doNotTrack: '1' } as unknown as Navigator)).toBe(true);
    expect(isDoNotTrack({ doNotTrack: 'yes' } as unknown as Navigator)).toBe(true);
    expect(isDoNotTrack({ msDoNotTrack: '1' } as unknown as Navigator)).toBe(true);
  });

  it('is false when unset, 0, unspecified, or no navigator', () => {
    expect(isDoNotTrack({ doNotTrack: '0' } as unknown as Navigator)).toBe(false);
    expect(isDoNotTrack({ doNotTrack: 'unspecified' } as unknown as Navigator)).toBe(false);
    expect(isDoNotTrack({} as unknown as Navigator)).toBe(false);
    expect(isDoNotTrack(undefined)).toBe(false);
  });
});
```

```ts
// src/analytics/lifecycle.test.ts
import { applyAnalyticsPolicy, emitSessionStart, resetSessionStarted } from './lifecycle';
import { setSink, resetSink, getSink } from './track';
import { noopSink, type Sink } from './sink';
import type { TrackedEvent } from './events';

const spySink = (bucket: TrackedEvent[]): Sink => ({ track: (t) => bucket.push(t), flush: () => {} });

describe('applyAnalyticsPolicy', () => {
  afterEach(() => {
    resetSink();
    resetSessionStarted();
    vi.restoreAllMocks();
  });

  it('forces the noopSink under Do-Not-Track (ignores makeSink)', () => {
    const chosen = applyAnalyticsPolicy({ dnt: true, makeSink: () => spySink([]) });
    expect(chosen).toBe(noopSink);
    expect(getSink()).toBe(noopSink);
  });

  it('uses makeSink when DNT is off', () => {
    const spy = spySink([]);
    const chosen = applyAnalyticsPolicy({ dnt: false, makeSink: () => spy });
    expect(chosen).toBe(spy);
    expect(getSink()).toBe(spy);
  });
});

describe('emitSessionStart', () => {
  afterEach(() => {
    resetSink();
    resetSessionStarted();
  });

  it('emits exactly one session_start per load and re-arms after reset', () => {
    const seen: TrackedEvent[] = [];
    setSink(spySink(seen));
    emitSessionStart();
    emitSessionStart();
    expect(seen.filter((t) => t.event.type === 'session_start')).toHaveLength(1);
    resetSessionStarted();
    emitSessionStart();
    expect(seen.filter((t) => t.event.type === 'session_start')).toHaveLength(2);
  });
});
```

```ts
// src/analytics/track.test.ts — UPDATE the "dispatches" test only (others unchanged from SPEC-061).
// Add `import type { TrackedEvent } from './events';` to the imports, then replace that test body with:
  it('track dispatches to the active sink as a TrackedEvent; setSink swaps it', () => {
    const seen: TrackedEvent[] = [];
    const spy: Sink = { track: (t) => seen.push(t), flush: () => {} };
    setSink(spy);
    track({ type: 'help_seen' });
    expect(seen).toHaveLength(1);
    expect(seen[0].event).toEqual({ type: 'help_seen' });
    expect(typeof seen[0].ts).toBe('number');
    expect(typeof seen[0].sessionId).toBe('string');
    expect(seen[0].sessionId.length).toBeGreaterThan(0);
    expect(seen[0].appVersion).toBe(__APP_VERSION__);
  });
```

```ts
// src/analytics/sink.test.ts — UPDATE the noop test to pass a TrackedEvent (rest unchanged).
// Add `import type { TrackedEvent } from './events';` to the imports, then:
  it('track/flush are no-ops that return undefined and never throw', () => {
    const sample: TrackedEvent = {
      event: { type: 'session_start' },
      ts: 0,
      sessionId: 't',
      appVersion: '0.0.0',
    };
    expect(() => noopSink.track(sample)).not.toThrow();
    expect(() => noopSink.flush()).not.toThrow();
    expect(noopSink.track(sample)).toBeUndefined();
    expect(noopSink.flush()).toBeUndefined();
  });
```

```tsx
// src/ui/useSlotMachine.analytics.test.tsx
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine, SPIN_DURATION_MS } from './useSlotMachine';
import { setSink, resetSink } from '../analytics';
import type { TrackedEvent } from '../analytics';
import type { UseSlotMachineOpts } from './useSlotMachine';

describe('useSlotMachine analytics taps', () => {
  let events: TrackedEvent[];
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    events = [];
    setSink({ track: (t) => events.push(t), flush: () => {} });
  });
  afterEach(() => {
    resetSink();
    vi.useRealTimers();
  });

  const render = (opts?: UseSlotMachineOpts) => renderHook(() => useSlotMachine(opts));

  it('a resolved spin emits a spin event with the engine outcome', () => {
    const { result } = render({ nextSeed: () => 276 });
    act(() => result.current.spin());
    act(() => vi.advanceTimersByTime(SPIN_DURATION_MS));
    const spin = events.find((e) => e.event.type === 'spin');
    expect(spin?.event).toEqual({
      type: 'spin',
      machineId: 'wild-and-whimsical',
      bet: 10,
      totalWin: 40,
      tier: 'small',
    });
  });

  it('reset emits a cash_in event', () => {
    const { result } = render({ nextSeed: () => 276 });
    act(() => result.current.reset());
    const cash = events.find((e) => e.event.type === 'cash_in');
    expect(cash?.event).toEqual({ type: 'cash_in', machineId: 'wild-and-whimsical' });
  });
});
```

```tsx
// src/ui/machine/MachineProvider.analytics.test.tsx
import { renderHook, act } from '@testing-library/react';
import { MachineProvider, useActiveMachine } from './MachineProvider';
import { setSink, resetSink } from '../../analytics';
import type { TrackedEvent } from '../../analytics';

describe('MachineProvider analytics tap', () => {
  let events: TrackedEvent[];
  beforeEach(() => {
    localStorage.clear();
    events = [];
    setSink({ track: (t) => events.push(t), flush: () => {} });
  });
  afterEach(() => resetSink());

  it('switching to a different machine emits machine_switch from→to', () => {
    const { result } = renderHook(() => useActiveMachine(), { wrapper: MachineProvider });
    act(() => result.current.setActiveMachineId('arctic'));
    const sw = events.find((e) => e.event.type === 'machine_switch');
    expect(sw?.event).toEqual({ type: 'machine_switch', from: 'wild-and-whimsical', to: 'arctic' });
  });

  it('re-selecting the current machine emits nothing', () => {
    const { result } = renderHook(() => useActiveMachine(), { wrapper: MachineProvider });
    act(() => result.current.setActiveMachineId('wild-and-whimsical'));
    expect(events.some((e) => e.event.type === 'machine_switch')).toBe(false);
  });
});
```

```tsx
// src/ui/help/HelpSeenProvider.analytics.test.tsx
import { renderHook, act } from '@testing-library/react';
import { HelpSeenProvider, useHelpSeen } from './HelpSeenProvider';
import { setSink, resetSink } from '../../analytics';
import type { TrackedEvent } from '../../analytics';

describe('HelpSeenProvider analytics tap', () => {
  let events: TrackedEvent[];
  beforeEach(() => {
    localStorage.clear();
    events = [];
    setSink({ track: (t) => events.push(t), flush: () => {} });
  });
  afterEach(() => resetSink());

  it('emits help_seen once, on the first mark', () => {
    const { result } = renderHook(() => useHelpSeen(), { wrapper: HelpSeenProvider });
    act(() => result.current.markSeen());
    expect(events.filter((e) => e.event.type === 'help_seen')).toHaveLength(1);
    act(() => result.current.markSeen());
    expect(events.filter((e) => e.event.type === 'help_seen')).toHaveLength(1);
  });
});
```

```tsx
// src/ui/analytics/AnalyticsProvider.test.tsx
import { render } from '@testing-library/react';
import { AnalyticsProvider } from './AnalyticsProvider';
import { setSink, resetSink, resetSessionStarted, emitSessionStart } from '../../analytics';
import type { TrackedEvent } from '../../analytics';

describe('AnalyticsProvider', () => {
  afterEach(() => {
    resetSink();
    resetSessionStarted();
    vi.restoreAllMocks();
  });

  it('renders its children', () => {
    const { getByTestId } = render(
      <AnalyticsProvider>
        <div data-testid="child">hi</div>
      </AnalyticsProvider>,
    );
    expect(getByTestId('child')).toBeInTheDocument();
  });

  it('consumes the one-shot session_start on mount', () => {
    resetSessionStarted();
    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>,
    );
    // the provider already fired session_start; a fresh spy must NOT receive another
    const seen: TrackedEvent[] = [];
    setSink({ track: (t) => seen.push(t), flush: () => {} });
    emitSessionStart();
    expect(seen).toHaveLength(0);
  });

  it('flushes on pagehide', () => {
    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>,
    );
    const flushSpy = vi.fn();
    setSink({ track: () => {}, flush: flushSpy });
    window.dispatchEvent(new Event('pagehide'));
    expect(flushSpy).toHaveBeenCalled();
  });
});
```

---

## Build Completion

*Filled in at the end of the **build** cycle, before advancing to verify.*

- **Branch:** `feat/spec-062-analytics-recording-tap` (local only — no push, no PR, per this cycle's
  build prompt).
- **PR (if applicable):** none (local-only build session; ship cycle opens the PR).
- **All acceptance criteria met?** yes
- **New decisions emitted:**
  - none (implements DEC-023, as expected)
- **Deviations from spec:**
  - none — every NEW module, MODIFIED file, and test file is a verbatim transcription of the spec's
    Notes drop-ins.
- **Follow-up work identified:**
  - none beyond the already-scoped SPEC-063 (Tier 2 HttpSink, GATED).

### Build-phase reflection (3 questions, short answers)

Process-focused: how did the build go? What friction did the spec create?

1. **What was unclear in the spec that slowed you down?**
   — Nothing of substance. The Notes gave complete, copy-paste-ready code for every file, so the only
   work was locating the exact existing lines to anchor each edit to (e.g. the `recordCashIn()` /
   `recordSpin(...)` call sites in `useSlotMachine.ts`) — all found on the first read.

2. **Was there a constraint or decision that should have been listed but wasn't?**
   — No. DEC-023/DEC-005/DEC-001/DEC-020/DEC-022 together fully covered the posture, the zero-network
   guarantee, the engine boundary, and the two prior recording seams the taps sit beside.

3. **If you did this task again, what would you do differently?**
   — Nothing. Transcribing verbatim plus running the five spec-specified adversarial guard-mutations
   (each reverted immediately after confirming it broke exactly the named test) gave high confidence for
   very little extra effort — that combination is worth keeping as the default build-verification pattern
   for taps like these.

---

## Reflection (Ship)

*Appended during the **ship** cycle. Outcome-focused reflection, distinct
from the process-focused build reflection above.*

1. **What would I do differently next time?**
   — <answer>

2. **Does any template, constraint, or decision need updating?**
   — <answer>

3. **Is there a follow-up spec I should write now before I forget?**
   — <answer>
