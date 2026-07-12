// index.ts — the analytics module's public surface (SPEC-061, STAGE-011, DEC-023).
// The rest of the app imports analytics ONLY through here (mirrors src/engine/index.ts).

export { ANALYTICS_EVENT_TYPES } from './events';
export type { AnalyticsEvent, AnalyticsEventType, TrackedEvent } from './events';
export { noopSink, resolveSinkKind, createSink } from './sink';
export type { Sink, SinkKind } from './sink';
export { track, flush, setSink, resetSink, getSink } from './track';
export { getSessionId, resetSessionId, isDoNotTrack } from './session';
export {
  applyAnalyticsPolicy,
  emitSessionStart,
  startSession,
  resetSessionStarted,
} from './lifecycle';
