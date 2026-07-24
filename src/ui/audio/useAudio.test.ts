// Tests for useAudio (SPEC-026, SPEC-072).
import { renderHook, act } from '@testing-library/react';
import { useAudio } from './useAudio';
import { readMute } from './muteStorage';
import { ensureAudio } from './audioEngine';

vi.mock('./audioEngine', () => ({ ensureAudio: vi.fn() }));

describe('useAudio', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts muted by default — quiet by default (DEC-025)', () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.muted).toBe(true);
  });

  it('rehydrates an explicit un-mute from storage', () => {
    localStorage.setItem('mute', 'false');
    const { result } = renderHook(() => useAudio());
    expect(result.current.muted).toBe(false);
  });

  it('toggleMute flips and persists', () => {
    // Default is muted now, so the first toggle un-mutes.
    const { result } = renderHook(() => useAudio());
    act(() => { result.current.toggleMute(); });
    expect(result.current.muted).toBe(false);
    expect(readMute()).toBe(false);
    act(() => { result.current.toggleMute(); });
    expect(result.current.muted).toBe(true);
  });

  it('starts locked', () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.unlocked).toBe(false);
  });

  it('unlocks on the first gesture', () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.unlocked).toBe(false);
    act(() => { document.dispatchEvent(new Event('pointerdown')); });
    expect(result.current.unlocked).toBe(true);
    // Second gesture keeps it true
    act(() => { document.dispatchEvent(new Event('pointerdown')); });
    expect(result.current.unlocked).toBe(true);
  });

  it('resumes the AudioContext synchronously in the gesture (SPEC-072 — iOS unlock)', () => {
    renderHook(() => useAudio());
    expect(ensureAudio).not.toHaveBeenCalled();
    act(() => { document.dispatchEvent(new Event('pointerdown')); });
    // ensureAudio() must run inside the gesture handler, not deferred to a later effect.
    expect(ensureAudio).toHaveBeenCalledTimes(1);
  });
});
