// Tests for useCountUp hook (SPEC-022).
// Uses vi.useFakeTimers() so COUNT_UP_DURATION_MS can be driven deterministically.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountUp, COUNT_UP_DURATION_MS } from './useCountUp';

describe('useCountUp', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.matchMedia = originalMatchMedia;
  });

  it('returns the target when signal is null', () => {
    const { result } = renderHook(() => useCountUp(1000, null));
    expect(result.current).toBe(1000);
  });

  it('starts at target − amount on a new signal', () => {
    const { result } = renderHook(() =>
      useCountUp(1045, { id: 1, amount: 55 }),
    );
    // Initial render: display starts at 1045 - 55 = 990
    expect(result.current).toBe(990);
  });

  it('counts up to the target after the full duration', () => {
    const { result } = renderHook(() =>
      useCountUp(1045, { id: 1, amount: 55 }),
    );
    act(() => {
      vi.advanceTimersByTime(COUNT_UP_DURATION_MS);
    });
    expect(result.current).toBe(1045);
  });

  it('interpolates mid-tween', () => {
    const { result } = renderHook(() =>
      useCountUp(1045, { id: 1, amount: 55 }),
    );
    act(() => {
      vi.advanceTimersByTime(COUNT_UP_DURATION_MS / 2);
    });
    // Mid-tween: strictly between 990 and 1045
    expect(result.current).toBeGreaterThan(990);
    expect(result.current).toBeLessThan(1045);
  });

  it('snaps to target under reduced motion', () => {
    window.matchMedia = (query: string) =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;

    const { result } = renderHook(() =>
      useCountUp(1045, { id: 1, amount: 55 }),
    );
    // No timers advanced — should already be at target
    expect(result.current).toBe(1045);
  });

  it('snaps when the target changes with a null signal', () => {
    const { result, rerender } = renderHook(
      ({ target, signal }: { target: number; signal: { id: number; amount: number } | null }) =>
        useCountUp(target, signal),
      { initialProps: { target: 1045, signal: null } },
    );
    expect(result.current).toBe(1045);

    act(() => {
      rerender({ target: 990, signal: null });
    });
    expect(result.current).toBe(990);
  });

  it('re-animates on a new signal id', () => {
    const { result, rerender } = renderHook(
      ({ target, signal }: { target: number; signal: { id: number; amount: number } | null }) =>
        useCountUp(target, signal),
      { initialProps: { target: 1045, signal: { id: 1, amount: 55 } } },
    );

    // Complete first tween
    act(() => {
      vi.advanceTimersByTime(COUNT_UP_DURATION_MS);
    });
    expect(result.current).toBe(1045);

    // New win signal — starts at 1045, count up to 1100
    act(() => {
      rerender({ target: 1100, signal: { id: 2, amount: 55 } });
    });
    expect(result.current).toBe(1045);

    act(() => {
      vi.advanceTimersByTime(COUNT_UP_DURATION_MS);
    });
    expect(result.current).toBe(1100);
  });
});
