// mixer.ts — bus-level bed automation (SPEC-030, DEC-013).
// Ramps the bed channel gain on a big win (swell) or jackpot (duck),
// then restores to the CHANNEL_GAINS.bed baseline after holdMs.
// All operations are best-effort — never throws into the caller.
import { getChannel, CHANNEL_GAINS } from './audioEngine';
import type { WinTier } from '../../engine/index';

export const MIX = {
  duckLevel: 0.05,  // bed drops under the jackpot (< CHANNEL_GAINS.bed)
  swellLevel: 0.45, // bed lifts on a big win   (> CHANNEL_GAINS.bed = 0.25)
  rampS: 0.2,       // seconds to ramp to the target level
  restoreS: 0.6,    // seconds to ramp back to baseline
  holdMs: 3000,     // ms before restoring (≈ jackpot moment span)
};

export function applyMix(tier: WinTier): void {
  if (tier !== 'big' && tier !== 'jackpot') return; // small / none: flat mix
  try {
    const gain = getChannel('bed').gain;
    const target = tier === 'jackpot' ? MIX.duckLevel : MIX.swellLevel;
    gain.rampTo(target, MIX.rampS);
    setTimeout(() => {
      try {
        gain.rampTo(CHANNEL_GAINS.bed, MIX.restoreS);
      } catch { /* audio is best-effort */ }
    }, MIX.holdMs);
  } catch { /* audio is best-effort */ }
}
