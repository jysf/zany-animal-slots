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
