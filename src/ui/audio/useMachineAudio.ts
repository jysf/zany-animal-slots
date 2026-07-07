// useMachineAudio.ts — pushes the active machine's audio params into the singleton (SPEC-048).
// Setters are injectable so tests can spy without touching the real Tone-backed singleton.
import { useEffect } from 'react';
import type { MachineAudio } from '../../machines/types';
import { setChannelGains as defaultSetGains } from './audioEngine';
import { setMix as defaultSetMix } from './mixer';
import { setBedMusic as defaultSetMusic } from './ambientBed';

/** Push the active machine's audio params into the singleton whenever they change. */
export function useMachineAudio(
  audio: MachineAudio,
  ctl: {
    setGains?: (g: MachineAudio['channelGains']) => void;
    setMix?: (m: MachineAudio['mix']) => void;
    setMusic?: (m: MachineAudio['music']) => void;
  } = {},
): void {
  const setGains = ctl.setGains ?? defaultSetGains;
  const setMix = ctl.setMix ?? defaultSetMix;
  const setMusic = ctl.setMusic ?? defaultSetMusic;
  useEffect(() => {
    setGains(audio.channelGains);
    setMix(audio.mix);
    setMusic(audio.music);
  }, [audio]);
}
