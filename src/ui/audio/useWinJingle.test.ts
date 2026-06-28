// useWinJingle.test.ts — gating tests for SPEC-027.
// Injects a vi.fn() as the `play` param so no real Tone.js is ever called.
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useWinJingle } from './useWinJingle';
import type { Celebration } from '../useSlotMachine';

function makeCelebration(id: number, tier: 'small' | 'big' | 'jackpot'): Celebration {
  return { id, tier, totalWin: 100, lineWins: [] };
}

describe('useWinJingle', () => {
  it('plays once on a win when unmuted and unlocked', () => {
    const play = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useWinJingle(celebration, { muted, unlocked }, play),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: true } },
    );

    // No celebration yet — should not have played.
    expect(play).not.toHaveBeenCalled();

    // Win arrives.
    rerender({ celebration: makeCelebration(1, 'small'), muted: false, unlocked: true });
    expect(play).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledWith('small');
  });

  it('does not play when muted', () => {
    const play = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useWinJingle(celebration, { muted, unlocked }, play),
      { initialProps: { celebration: null as Celebration | null, muted: true, unlocked: true } },
    );

    rerender({ celebration: makeCelebration(1, 'small'), muted: true, unlocked: true });
    expect(play).not.toHaveBeenCalled();
  });

  it('does not play when locked', () => {
    const play = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useWinJingle(celebration, { muted, unlocked }, play),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: false } },
    );

    rerender({ celebration: makeCelebration(1, 'small'), muted: false, unlocked: false });
    expect(play).not.toHaveBeenCalled();
  });

  it('does not play without a celebration', () => {
    const play = vi.fn();
    renderHook(
      ({ celebration, muted, unlocked }) =>
        useWinJingle(celebration, { muted, unlocked }, play),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: true } },
    );

    expect(play).not.toHaveBeenCalled();
  });

  it('re-plays on a new win id', () => {
    const play = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useWinJingle(celebration, { muted, unlocked }, play),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: true } },
    );

    // First win.
    rerender({ celebration: makeCelebration(1, 'small'), muted: false, unlocked: true });
    expect(play).toHaveBeenCalledTimes(1);

    // Second win — new id.
    rerender({ celebration: makeCelebration(2, 'big'), muted: false, unlocked: true });
    expect(play).toHaveBeenCalledTimes(2);
    expect(play).toHaveBeenLastCalledWith('big');
  });

  it('does not re-play when only mute toggles (same id)', () => {
    const play = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useWinJingle(celebration, { muted, unlocked }, play),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: true } },
    );

    // Win arrives.
    rerender({ celebration: makeCelebration(1, 'small'), muted: false, unlocked: true });
    expect(play).toHaveBeenCalledTimes(1);

    // Toggle mute — same celebration id; should NOT re-trigger.
    rerender({ celebration: makeCelebration(1, 'small'), muted: true, unlocked: true });
    expect(play).toHaveBeenCalledTimes(1);

    // Toggle back — still same id; still no additional call.
    rerender({ celebration: makeCelebration(1, 'small'), muted: false, unlocked: true });
    expect(play).toHaveBeenCalledTimes(1);
  });
});
