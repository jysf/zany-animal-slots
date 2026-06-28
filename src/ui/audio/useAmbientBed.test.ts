// useAmbientBed.test.ts — hook unit tests with injected start/stop spies (SPEC-028).
// No real Tone used — start/stop are fully injected via ctl.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAmbientBed } from './useAmbientBed';

let startSpy: ReturnType<typeof vi.fn>;
let stopSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  startSpy = vi.fn();
  stopSpy = vi.fn();
});

describe('useAmbientBed', () => {
  it('starts the bed when unlocked and unmuted', () => {
    renderHook(() =>
      useAmbientBed({ muted: false, unlocked: true }, { start: startSpy, stop: stopSpy }),
    );
    expect(startSpy).toHaveBeenCalledOnce();
    expect(stopSpy).not.toHaveBeenCalled();
  });

  it('does not start while locked', () => {
    renderHook(() =>
      useAmbientBed({ muted: false, unlocked: false }, { start: startSpy, stop: stopSpy }),
    );
    expect(startSpy).not.toHaveBeenCalled();
  });

  it('does not start while muted', () => {
    renderHook(() =>
      useAmbientBed({ muted: true, unlocked: true }, { start: startSpy, stop: stopSpy }),
    );
    expect(startSpy).not.toHaveBeenCalled();
  });

  it('stops when muted after starting', () => {
    const { rerender } = renderHook(
      ({ muted, unlocked }: { muted: boolean; unlocked: boolean }) =>
        useAmbientBed({ muted, unlocked }, { start: startSpy, stop: stopSpy }),
      { initialProps: { muted: false, unlocked: true } },
    );
    expect(startSpy).toHaveBeenCalledOnce();
    // Now mute it
    rerender({ muted: true, unlocked: true });
    expect(stopSpy).toHaveBeenCalled();
  });

  it('stops on unmount', () => {
    const { unmount } = renderHook(() =>
      useAmbientBed({ muted: false, unlocked: true }, { start: startSpy, stop: stopSpy }),
    );
    expect(startSpy).toHaveBeenCalledOnce();
    stopSpy.mockClear();
    unmount();
    expect(stopSpy).toHaveBeenCalledOnce();
  });
});
