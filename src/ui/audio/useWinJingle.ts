// useWinJingle — plays the tier-scaled jingle once per win (SPEC-027).
// Keyed on celebration.id (fire-once-per-win pattern from SPEC-021/useCountUp).
// Gated by muted and unlocked so audio respects the gesture policy (DEC-007,
// audio-gesture-and-mute). The `play` parameter is injectable for tests.
import { useEffect } from 'react';
import type { Celebration } from '../useSlotMachine';
import type { WinTier } from '../../engine/index';
import { playJingle } from './jingle';

export function useWinJingle(
  celebration: Celebration | null,
  opts: { muted: boolean; unlocked: boolean },
  play: (tier: WinTier) => void = playJingle,
): void {
  const { muted, unlocked } = opts;
  useEffect(() => {
    if (!celebration) return;
    if (muted || !unlocked) return;
    if (celebration.tier === 'none') return;
    play(celebration.tier);
    // Intentionally keyed on celebration.id ONLY (fire once per win); muted/
    // unlocked are read at fire time. This repo has no react-hooks ESLint plugin.
  }, [celebration?.id]);
}
