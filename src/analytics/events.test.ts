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
