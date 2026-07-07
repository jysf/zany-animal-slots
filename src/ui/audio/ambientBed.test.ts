// ambientBed.test.ts — unit tests for the ambient bed Transport loop (SPEC-028).
// Mocks 'tone' and './audioEngine' so no AudioContext is needed.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Shared spies ----
const loopStartMock = vi.fn().mockReturnThis();
const loopStopMock = vi.fn().mockReturnThis();
const loopDisposeMock = vi.fn().mockReturnThis();

const padConnectMock = vi.fn().mockReturnThis();
const padDisposeMock = vi.fn();
const padTriggerMock = vi.fn();

const transportStartMock = vi.fn();

// A factory so each PolySynth() call returns a fresh object
const makePolySynth = () => ({
  connect: padConnectMock,
  dispose: padDisposeMock,
  triggerAttackRelease: padTriggerMock,
});

// A factory so each Loop() call returns a fresh object
const makeLoop = () => ({
  start: loopStartMock,
  stop: loopStopMock,
  dispose: loopDisposeMock,
});

vi.mock('tone', () => ({
  getTransport: vi.fn(() => ({ start: transportStartMock })),
  PolySynth: vi.fn(() => makePolySynth()),
  Loop: vi.fn(() => makeLoop()),
  Synth: vi.fn(),
}));

vi.mock('./audioEngine', () => ({
  ensureAudio: vi.fn(),
  getChannel: vi.fn(() => ({})), // returns a mock channel node
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe('startBed', () => {
  it('starts the Transport and a loop', async () => {
    const { startBed } = await import('./ambientBed');
    startBed();
    expect(transportStartMock).toHaveBeenCalledOnce();
    expect(loopStartMock).toHaveBeenCalledOnce();
  });

  it('is idempotent — calling startBed twice creates only one loop', async () => {
    const { startBed } = await import('./ambientBed');
    startBed();
    startBed();
    // Loop constructor should be called only once
    const { Loop } = await import('tone');
    expect(Loop).toHaveBeenCalledOnce();
  });
});

describe('stopBed', () => {
  it('stops and disposes the loop after startBed', async () => {
    const { startBed, stopBed } = await import('./ambientBed');
    startBed();
    stopBed();
    expect(loopStopMock).toHaveBeenCalled();
    expect(loopDisposeMock).toHaveBeenCalled();
  });
});

describe('setBedMusic', () => {
  it('changes the chord the next startBed uses', async () => {
    const { startBed, setBedMusic, getActiveBedMusic, DEFAULT_BED_MUSIC } = await import(
      './ambientBed'
    );

    setBedMusic({ chord: ['A2'], noteDuration: '4n', loopInterval: '1m' });
    expect(getActiveBedMusic()).toEqual({ chord: ['A2'], noteDuration: '4n', loopInterval: '1m' });

    startBed();
    const { Loop } = await import('tone');
    expect(Loop).toHaveBeenCalledWith(expect.any(Function), '1m');

    // Trigger the loop callback to confirm it uses the new chord/duration.
    const loopCallback = (Loop as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as (
      time: number,
    ) => void;
    loopCallback(0);
    expect(padTriggerMock).toHaveBeenCalledWith(['A2'], '4n', 0);

    // Restore the default so later tests see the baseline.
    setBedMusic(DEFAULT_BED_MUSIC);
    expect(getActiveBedMusic()).toEqual(DEFAULT_BED_MUSIC);
  });
});
