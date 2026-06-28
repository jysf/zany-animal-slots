// jingle.test.ts — unit tests for JINGLE_NOTES and playJingle (SPEC-027).
// Updated in SPEC-028: jingle now routes via connect(getChannel('jingle'))
// instead of toDestination(); mock updated accordingly.
// Mocks the 'tone' module and './audioEngine' so no AudioContext is needed.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Shared spy for triggerAttackRelease — defined before the mock factory so it
// can be referenced inside the factory and asserted in tests.
const triggerAttackRelease = vi.fn();

vi.mock('./audioEngine', () => ({
  getChannel: vi.fn(() => ({})), // returns a mock channel node; Synth.connect receives it
}));

vi.mock('tone', () => ({
  start: vi.fn(() => Promise.resolve()),
  now: vi.fn(() => 0),
  Synth: vi.fn(() => ({
    // SPEC-028: connect() replaces toDestination(); must be chainable to triggerAttackRelease
    connect: vi.fn(() => ({ triggerAttackRelease })),
  })),
}));

// Import after the mocks are registered.
import { JINGLE_NOTES, playJingle } from './jingle';
import { start } from 'tone';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('JINGLE_NOTES', () => {
  it('scales note count by tier (strictly increasing: small < big < jackpot)', () => {
    expect(JINGLE_NOTES.small.length).toBeLessThan(JINGLE_NOTES.big.length);
    expect(JINGLE_NOTES.big.length).toBeLessThan(JINGLE_NOTES.jackpot.length);
  });
});

describe('playJingle', () => {
  it("playJingle('none') is a no-op — start not called, no notes triggered", () => {
    playJingle('none');
    expect(start).not.toHaveBeenCalled();
    expect(triggerAttackRelease).not.toHaveBeenCalled();
  });

  it("playJingle('small') calls start once and triggers small.length notes", () => {
    playJingle('small');
    expect(start).toHaveBeenCalledOnce();
    expect(triggerAttackRelease).toHaveBeenCalledTimes(JINGLE_NOTES.small.length);
  });

  it("playJingle('jackpot') triggers jackpot.length notes (more than small)", () => {
    playJingle('jackpot');
    expect(start).toHaveBeenCalledOnce();
    expect(triggerAttackRelease).toHaveBeenCalledTimes(JINGLE_NOTES.jackpot.length);
    // jackpot must be more than small — tier scaling reaches Tone.
    expect(triggerAttackRelease.mock.calls.length).toBeGreaterThan(JINGLE_NOTES.small.length);
  });
});
