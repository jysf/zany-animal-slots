// useMachineAudio.test.ts — unit tests for the audio-pushing hook (SPEC-048).
// Injects spy setters so the real Tone-backed singleton is never touched.
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMachineAudio } from './useMachineAudio';
import type { MachineAudio } from '../../machines/types';

const audio: MachineAudio = {
  channelGains: { bed: 0.1, sfx: 0.2, jingle: 0.3 },
  mix: { duckLevel: 0.05, swellLevel: 0.45, rampS: 0.2, restoreS: 0.6, holdMs: 3000 },
  music: { chord: ['A2'], noteDuration: '4n', loopInterval: '1m' },
};

describe('useMachineAudio', () => {
  it("pushes a machine's audio params into the singleton", () => {
    const setGains = vi.fn();
    const setMix = vi.fn();
    const setMusic = vi.fn();

    renderHook(() => useMachineAudio(audio, { setGains, setMix, setMusic }));

    expect(setGains).toHaveBeenCalledOnce();
    expect(setGains).toHaveBeenCalledWith(audio.channelGains);
    expect(setMix).toHaveBeenCalledOnce();
    expect(setMix).toHaveBeenCalledWith(audio.mix);
    expect(setMusic).toHaveBeenCalledOnce();
    expect(setMusic).toHaveBeenCalledWith(audio.music);
  });
});
