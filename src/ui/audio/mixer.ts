// mixer.ts — bus-level bed automation (SPEC-030, DEC-013).
// Ramps the bed channel gain on a big win (swell) or jackpot (duck),
// then restores to the active bed gain baseline after holdMs.
// All operations are best-effort — never throws into the caller.
// SPEC-048: MIX stays the baseline/default; a mutable `activeMix` layer lets a
// machine override the levels/timings, and the restore target follows whatever
// channel gain is currently active (so a themed machine's own bed gain "wins").
import { getChannel, getActiveChannelGain } from './audioEngine';
import type { WinTier } from '../../engine/index';

export const MIX = {
  duckLevel: 0.05,  // bed drops under the jackpot (< CHANNEL_GAINS.bed)
  swellLevel: 0.45, // bed lifts on a big win   (> CHANNEL_GAINS.bed = 0.25)
  rampS: 0.2,       // seconds to ramp to the target level
  restoreS: 0.6,    // seconds to ramp back to baseline
  holdMs: 3000,     // ms before restoring (≈ jackpot moment span)
};

let activeMix = { ...MIX };

/** Set the active per-machine bed-automation params. */
export function setMix(mix: typeof MIX): void {
  activeMix = { ...mix };
}

export function applyMix(tier: WinTier): void {
  if (tier !== 'big' && tier !== 'jackpot') return; // small / none: flat mix
  try {
    const gain = getChannel('bed').gain;
    const target = tier === 'jackpot' ? activeMix.duckLevel : activeMix.swellLevel;
    gain.rampTo(target, activeMix.rampS);
    setTimeout(() => {
      try {
        gain.rampTo(getActiveChannelGain('bed'), activeMix.restoreS);
      } catch { /* audio is best-effort */ }
    }, activeMix.holdMs);
  } catch { /* audio is best-effort */ }
}
