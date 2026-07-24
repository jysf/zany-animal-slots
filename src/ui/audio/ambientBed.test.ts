// ambientBed.test.ts — the bed PLAYBACK loop was removed by SPEC-081/DEC-025; only the
// per-machine music-param store remains (setBedMusic / getActiveBedMusic), used by
// useMachineAudio. No 'tone' mock is needed anymore — nothing here plays.
import { describe, it, expect, beforeEach } from 'vitest';
import { setBedMusic, getActiveBedMusic, DEFAULT_BED_MUSIC } from './ambientBed';

beforeEach(() => {
  // Restore the baseline so tests are order-independent (activeMusic is module state).
  setBedMusic(DEFAULT_BED_MUSIC);
});

describe('bed music params', () => {
  it('defaults to DEFAULT_BED_MUSIC', () => {
    expect(getActiveBedMusic()).toEqual(DEFAULT_BED_MUSIC);
  });

  it('setBedMusic updates the active music and getActiveBedMusic reflects it', () => {
    setBedMusic({ chord: ['A2'], noteDuration: '4n', loopInterval: '1m' });
    expect(getActiveBedMusic()).toEqual({ chord: ['A2'], noteDuration: '4n', loopInterval: '1m' });
  });
});
