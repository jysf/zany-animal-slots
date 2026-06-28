// useGameSfx — wires mechanical SFX to real game events (SPEC-029).
// Fires 'spin' on the not-spinning→spinning edge, 'reelStop' on spinning→not-spinning.
// Fires 'win' once per new winning celebration.id (tier !== 'none').
// Gated on muted + unlocked at fire time (audio-gesture-and-mute, DEC-007).
// The `play` parameter is injectable for tests — real default is playSfx.
import { useEffect, useRef } from 'react';
import type { Celebration } from '../useSlotMachine';
import { playSfx, type SfxName } from './sfx';

export function useGameSfx(
  isSpinning: boolean,
  celebration: Celebration | null,
  opts: { muted: boolean; unlocked: boolean },
  play: (n: SfxName) => void = playSfx,
): void {
  const { muted, unlocked } = opts;
  const prev = useRef<boolean | null>(null);

  // Edge detection: spin-start and reels-land.
  // Keyed on isSpinning only — muted/unlocked read at fire time.
  // No react-hooks ESLint plugin in this repo — no exhaustive-deps comment needed.
  useEffect(() => {
    const was = prev.current;
    prev.current = isSpinning;
    if (was === null) return; // no fire on mount
    if (muted || !unlocked) return;
    if (!was && isSpinning) play('spin');
    else if (was && !isSpinning) play('reelStop');
  }, [isSpinning]);

  // Win ting: fires once per new winning celebration (keyed on id).
  useEffect(() => {
    if (!celebration || celebration.tier === 'none') return;
    if (muted || !unlocked) return;
    play('win');
  }, [celebration?.id]);
}
