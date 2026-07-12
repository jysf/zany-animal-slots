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
