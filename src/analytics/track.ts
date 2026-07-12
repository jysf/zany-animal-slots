// track.ts — the process-wide analytics seam (SPEC-061, STAGE-011, DEC-023).
// A thin, fire-and-forget façade over the active Sink. track()/flush() never throw — analytics must
// never break a spin. The active sink defaults to the build-config sink (Tier 1: the no-op); the
// SPEC-062 recording provider replaces it (e.g. the no-op under Do-Not-Track) via setSink().

import type { AnalyticsEvent } from './events';
import { createSink, type Sink } from './sink';
import { getSessionId } from './session';

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

/** Flush any buffered events (e.g. on pagehide). Fire-and-forget; never throws. */
export function flush(): void {
  try {
    activeSink.flush();
  } catch {
    // never propagate
  }
}
