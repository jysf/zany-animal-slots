// useAmbientBed.ts — gate + lifecycle for the ambient music bed (SPEC-028).
// Starts the bed when unlocked & unmuted; stops otherwise and on unmount.
// Injectable start/stop for testing (no real Tone in hook tests).
import { useEffect } from 'react';
import { startBed as defaultStart, stopBed as defaultStop } from './ambientBed';

export function useAmbientBed(
  opts: { muted: boolean; unlocked: boolean },
  ctl: { start?: () => void; stop?: () => void } = {},
): void {
  const { muted, unlocked } = opts;
  const start = ctl.start ?? defaultStart;
  const stop = ctl.stop ?? defaultStop;
  useEffect(() => {
    if (unlocked && !muted) start(); else stop();
    return () => stop();
  }, [muted, unlocked]);
}
