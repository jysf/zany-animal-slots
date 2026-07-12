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
