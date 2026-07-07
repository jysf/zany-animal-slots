// mixer.test.ts — unit tests for bus-level gain automation (SPEC-030).
// Mocks ./audioEngine so getChannel returns a fake bed channel with a rampTo spy.
// Uses vi.useFakeTimers() to assert the restore fires after holdMs.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const rampTo = vi.fn();
let activeBedGain = 0.25;

vi.mock('./audioEngine', () => ({
  CHANNEL_GAINS: { bed: 0.25, sfx: 0.6, jingle: 0.8 },
  getChannel: vi.fn(() => ({ gain: { rampTo } })),
  getActiveChannelGain: vi.fn((name: 'bed' | 'sfx' | 'jingle') =>
    name === 'bed' ? activeBedGain : ({ sfx: 0.6, jingle: 0.8 })[name],
  ),
}));

import { MIX, applyMix, setMix } from './mixer';
import { CHANNEL_GAINS } from './audioEngine';

beforeEach(() => {
  vi.useFakeTimers();
  rampTo.mockClear();
  activeBedGain = CHANNEL_GAINS.bed;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('MIX levels', () => {
  it('are ordered: duckLevel < CHANNEL_GAINS.bed < swellLevel', () => {
    expect(MIX.duckLevel).toBeLessThan(CHANNEL_GAINS.bed);
    expect(CHANNEL_GAINS.bed).toBeLessThan(MIX.swellLevel);
  });
});

describe('applyMix', () => {
  it('jackpot ducks then restores', () => {
    applyMix('jackpot');

    expect(rampTo).toHaveBeenCalledTimes(1);
    expect(rampTo).toHaveBeenCalledWith(MIX.duckLevel, MIX.rampS);

    vi.advanceTimersByTime(MIX.holdMs);

    expect(rampTo).toHaveBeenCalledTimes(2);
    expect(rampTo).toHaveBeenLastCalledWith(CHANNEL_GAINS.bed, MIX.restoreS);
  });

  it('big swells then restores', () => {
    applyMix('big');

    expect(rampTo).toHaveBeenCalledTimes(1);
    expect(rampTo).toHaveBeenCalledWith(MIX.swellLevel, MIX.rampS);

    vi.advanceTimersByTime(MIX.holdMs);

    expect(rampTo).toHaveBeenCalledTimes(2);
    expect(rampTo).toHaveBeenLastCalledWith(CHANNEL_GAINS.bed, MIX.restoreS);
  });

  it('small is a no-op', () => {
    applyMix('small');
    vi.advanceTimersByTime(MIX.holdMs);
    expect(rampTo).not.toHaveBeenCalled();
  });

  it('none is a no-op', () => {
    applyMix('none');
    vi.advanceTimersByTime(MIX.holdMs);
    expect(rampTo).not.toHaveBeenCalled();
  });

  it('never throws even when rampTo throws', () => {
    rampTo.mockImplementationOnce(() => { throw new Error('audio context gone'); });
    expect(() => applyMix('jackpot')).not.toThrow();
  });
});

describe('setMix', () => {
  it('changes the levels applyMix ramps to', () => {
    setMix({ ...MIX, swellLevel: 0.9 });

    applyMix('big');
    expect(rampTo).toHaveBeenCalledTimes(1);
    expect(rampTo).toHaveBeenCalledWith(0.9, MIX.rampS);

    vi.advanceTimersByTime(MIX.holdMs);
    expect(rampTo).toHaveBeenCalledTimes(2);
    expect(rampTo).toHaveBeenLastCalledWith(CHANNEL_GAINS.bed, MIX.restoreS);

    // Restore the default so later tests see the baseline.
    setMix(MIX);
  });

  it('restores to the ACTIVE bed gain, not the static CHANNEL_GAINS baseline', () => {
    // Simulate a machine that overrode the bed channel gain.
    activeBedGain = 0.42;

    applyMix('jackpot');
    vi.advanceTimersByTime(MIX.holdMs);

    expect(rampTo).toHaveBeenLastCalledWith(0.42, MIX.restoreS);
  });
});
