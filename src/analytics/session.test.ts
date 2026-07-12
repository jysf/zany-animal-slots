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
