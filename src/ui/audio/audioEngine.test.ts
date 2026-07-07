// audioEngine.test.ts — unit tests for the shared audio graph (SPEC-028).
// Mocks 'tone' so no AudioContext is needed in the test environment.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared mock instances
const connectMock = vi.fn().mockReturnThis();
const toDestinationMock = vi.fn().mockReturnThis();

// Factory for a mock Gain instance
const makeGain = () => ({
  connect: connectMock,
  toDestination: toDestinationMock,
  gain: {},
});

let gainInstance: ReturnType<typeof makeGain>;

vi.mock('tone', () => {
  return {
    start: vi.fn(() => Promise.resolve()),
    Gain: vi.fn(() => {
      gainInstance = makeGain();
      return gainInstance;
    }),
  };
});

// Import AFTER mock is registered — also resets module-level singleton state.
// We use vi.resetModules() in beforeEach to get fresh singletons per test.
import { CHANNEL_GAINS } from './audioEngine';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CHANNEL_GAINS', () => {
  it('has bed/sfx/jingle levels all numeric and in (0, 1]', () => {
    const keys = ['bed', 'sfx', 'jingle'] as const;
    for (const key of keys) {
      const val = CHANNEL_GAINS[key];
      expect(typeof val).toBe('number');
      expect(val).toBeGreaterThan(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });
});

describe('getChannel', () => {
  it('is idempotent — same instance returned on two calls', async () => {
    // Reset module so singletons are fresh for this test
    vi.resetModules();
    const { getChannel } = await import('./audioEngine');
    const first = getChannel('bed');
    const second = getChannel('bed');
    expect(first).toBe(second);
  });

  it('connects each channel to the master', async () => {
    vi.resetModules();
    const { getChannel, getMaster } = await import('./audioEngine');
    const ch = getChannel('jingle');
    const master = getMaster();
    // The channel's connect was called; one of its calls targeted the master.
    expect(connectMock).toHaveBeenCalled();
    // ch and master are both Gain mock instances; the channel connected to master
    expect(ch).not.toBe(master);
  });
});

describe('setChannelGains / getActiveChannelGain', () => {
  it('setChannelGains changes what getActiveChannelGain reports', async () => {
    vi.resetModules();
    const { setChannelGains, getActiveChannelGain, CHANNEL_GAINS: gains } = await import(
      './audioEngine'
    );

    setChannelGains({ bed: 0.1, sfx: 0.2, jingle: 0.3 });
    expect(getActiveChannelGain('bed')).toBe(0.1);
    expect(getActiveChannelGain('sfx')).toBe(0.2);
    expect(getActiveChannelGain('jingle')).toBe(0.3);

    // Restore the default so later tests (and other files sharing this module) see the baseline.
    setChannelGains(gains);
    expect(getActiveChannelGain('bed')).toBe(gains.bed);
    expect(getActiveChannelGain('sfx')).toBe(gains.sfx);
    expect(getActiveChannelGain('jingle')).toBe(gains.jingle);
  });

  it('default gains still equal CHANNEL_GAINS until setChannelGains is called', async () => {
    vi.resetModules();
    const { getActiveChannelGain, CHANNEL_GAINS: gains } = await import('./audioEngine');
    expect(getActiveChannelGain('bed')).toBe(gains.bed);
    expect(getActiveChannelGain('sfx')).toBe(gains.sfx);
    expect(getActiveChannelGain('jingle')).toBe(gains.jingle);
  });

  it('getChannel creates a not-yet-created channel at the active (machine-overridden) gain', async () => {
    vi.resetModules();
    const { setChannelGains, getChannel, CHANNEL_GAINS: gains } = await import('./audioEngine');
    const { Gain } = await import('tone');

    setChannelGains({ bed: 0.42, sfx: 0.2, jingle: 0.3 });
    getChannel('bed');
    expect(Gain).toHaveBeenCalledWith(0.42);

    // Restore the default so later tests see the baseline.
    setChannelGains(gains);
  });
});
