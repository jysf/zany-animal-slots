// ambientBed.ts — per-machine bed MUSIC PARAMS only (SPEC-028; playback removed by SPEC-081).
//
// The generative ambient bed PLAYBACK (an infinite Tone.Loop firing a PolySynth chord every
// ~4s) was removed under DEC-025: it was on by default and read as "terrible" in play-testing.
// What remains is the per-machine music-param store — `useMachineAudio` still pushes each
// machine's `music` here via setBedMusic(), so the setter/getter are retained (not dead code).
// Nothing plays them anymore; a future audio-quality overhaul may reintroduce an opt-in bed.
// DEC-013: no asset files. DEC-001: UI-only, engine never sees this.

export const DEFAULT_BED_MUSIC = { chord: ['C3', 'G3', 'C4', 'E4'], noteDuration: '2n', loopInterval: '2m' };

let activeMusic = { ...DEFAULT_BED_MUSIC };

/** Set the active per-machine bed music. Retained for the machine-audio param interface
 *  (SPEC-048); playback was removed (SPEC-081/DEC-025), so this no longer drives sound. */
export function setBedMusic(music: typeof DEFAULT_BED_MUSIC): void {
  activeMusic = { ...music };
}

/** Test/inspection helper: the current active bed music. */
export function getActiveBedMusic(): typeof DEFAULT_BED_MUSIC {
  return activeMusic;
}
