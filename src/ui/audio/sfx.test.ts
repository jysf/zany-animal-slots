// sfx.test.ts — unit tests for playSfx and REEL_STOP_CLUNKS (SPEC-029).
// Mocks 'tone' and './audioEngine' to confirm channel routing and no toDestination.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared spy for triggerAttackRelease — defined before mocks so factory closures
// can capture it without named callback params (avoids no-unused-vars).
const triggerAttackRelease = vi.fn();

// Mock channel returned by getChannel — has a connect method we can spy on.
const mockChannel = { _isMockChannel: true };

vi.mock('./audioEngine', () => ({
  ensureAudio: vi.fn(),
  getChannel: vi.fn(() => mockChannel),
}));

vi.mock('tone', () => ({
  now: vi.fn(() => 0),
  NoiseSynth: vi.fn(() => ({
    connect: vi.fn(() => ({ triggerAttackRelease })),
  })),
  MembraneSynth: vi.fn(() => ({
    connect: vi.fn(() => ({ triggerAttackRelease })),
    triggerAttackRelease,
  })),
  MetalSynth: vi.fn(() => ({
    connect: vi.fn(() => ({ triggerAttackRelease })),
  })),
}));

import { REEL_STOP_CLUNKS, playSfx } from './sfx';
import { getChannel } from './audioEngine';
import { NoiseSynth, MembraneSynth, MetalSynth } from 'tone';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('sfx', () => {
  it('REEL_STOP_CLUNKS is 5', () => {
    expect(REEL_STOP_CLUNKS).toBe(5);
  });

  it('playSfx routes through the sfx channel — spin connects to getChannel("sfx") and triggers', () => {
    const mockConnected = { triggerAttackRelease };
    const connectSpy = vi.fn(() => mockConnected);
    vi.mocked(NoiseSynth).mockImplementationOnce(() => ({ connect: connectSpy } as unknown as InstanceType<typeof NoiseSynth>));

    playSfx('spin');

    expect(getChannel).toHaveBeenCalledWith('sfx');
    // synth was connected to the channel (not toDestination)
    expect(connectSpy).toHaveBeenCalledWith(mockChannel);
    // and triggered at least once
    expect(triggerAttackRelease).toHaveBeenCalledTimes(1);
  });

  it('reelStop schedules REEL_STOP_CLUNKS hits', () => {
    const drumMock = { triggerAttackRelease, connect: vi.fn() };
    drumMock.connect.mockReturnValue(drumMock);
    vi.mocked(MembraneSynth).mockImplementationOnce(() => drumMock as unknown as InstanceType<typeof MembraneSynth>);

    playSfx('reelStop');

    expect(triggerAttackRelease).toHaveBeenCalledTimes(REEL_STOP_CLUNKS);
  });

  it('playSfx never throws even if tone throws internally', () => {
    vi.mocked(MetalSynth).mockImplementationOnce(() => {
      throw new Error('Simulated Tone error');
    });
    expect(() => playSfx('win')).not.toThrow();
  });
});
