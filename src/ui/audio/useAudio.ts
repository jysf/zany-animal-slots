// useAudio.ts — mute state + first-gesture unlock (SPEC-026).
// DEC-007: gates audio behind user gesture + persisted global mute.
// unlocked is intentionally exposed here; SPEC-027 will consume it.
import { useState, useEffect, useCallback } from 'react';
import { readMute, writeMute } from './muteStorage';

export function useAudio() {
  const [muted, setMuted] = useState<boolean>(() => readMute());
  const [unlocked, setUnlocked] = useState(false);

  const toggleMute = useCallback(() => {
    setMuted(prev => { const next = !prev; writeMute(next); return next; });
  }, []);

  useEffect(() => {
    if (unlocked) return;
    const onGesture = () => setUnlocked(true);
    document.addEventListener('pointerdown', onGesture, { once: true });
    document.addEventListener('keydown', onGesture, { once: true });
    return () => {
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('keydown', onGesture);
    };
  }, [unlocked]);

  return { muted, toggleMute, unlocked };
}
