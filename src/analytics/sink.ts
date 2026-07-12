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
