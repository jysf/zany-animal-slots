// useGameSfx.test.ts — unit tests for the game SFX event-wiring hook (SPEC-029).
// Injects a `play` spy (no real Tone) so tests remain deterministic.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameSfx } from './useGameSfx';
import type { Celebration } from '../useSlotMachine';

function makeOpts(overrides: { muted?: boolean; unlocked?: boolean } = {}) {
  return { muted: false, unlocked: true, ...overrides };
}

function makeCelebration(id: number): Celebration {
  return { id, tier: 'small', totalWin: 100, lineWins: [] };
}

describe('useGameSfx', () => {
  let play: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    play = vi.fn();
  });

  it('plays spin on the spin-start edge', () => {
    const { rerender } = renderHook(
      ({ isSpinning }: { isSpinning: boolean }) =>
        useGameSfx(isSpinning, null, makeOpts(), play),
      { initialProps: { isSpinning: false } },
    );
    expect(play).not.toHaveBeenCalled();

    rerender({ isSpinning: true });
    expect(play).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledWith('spin');
  });

  it('plays reelStop on the reels-land edge', () => {
    const { rerender } = renderHook(
      ({ isSpinning }: { isSpinning: boolean }) =>
        useGameSfx(isSpinning, null, makeOpts(), play),
      { initialProps: { isSpinning: false } },
    );

    rerender({ isSpinning: true });
    play.mockClear();

    rerender({ isSpinning: false });
    expect(play).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledWith('reelStop');
  });

  it('does not fire on mount', () => {
    renderHook(() => useGameSfx(false, null, makeOpts(), play));
    expect(play).not.toHaveBeenCalled();
  });

  it('plays win on a new winning celebration', () => {
    const { rerender } = renderHook(
      ({ cel }: { cel: Celebration | null }) =>
        useGameSfx(false, cel, makeOpts(), play),
      { initialProps: { cel: null as Celebration | null } },
    );
    expect(play).not.toHaveBeenCalled();

    rerender({ cel: makeCelebration(1) });
    expect(play).toHaveBeenCalledWith('win');
    expect(play).toHaveBeenCalledTimes(1);

    play.mockClear();

    rerender({ cel: makeCelebration(2) });
    expect(play).toHaveBeenCalledWith('win');
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('does not play win on a null celebration', () => {
    const { rerender } = renderHook(
      ({ cel }: { cel: Celebration | null }) =>
        useGameSfx(false, cel, makeOpts(), play),
      { initialProps: { cel: null as Celebration | null } },
    );
    rerender({ cel: null });
    expect(play).not.toHaveBeenCalled();
  });

  it('does not play anything when muted', () => {
    const { rerender } = renderHook(
      ({ isSpinning, cel }: { isSpinning: boolean; cel: Celebration | null }) =>
        useGameSfx(isSpinning, cel, makeOpts({ muted: true }), play),
      { initialProps: { isSpinning: false, cel: null as Celebration | null } },
    );
    rerender({ isSpinning: true, cel: makeCelebration(1) });
    expect(play).not.toHaveBeenCalled();
  });

  it('does not play anything when locked', () => {
    const { rerender } = renderHook(
      ({ isSpinning, cel }: { isSpinning: boolean; cel: Celebration | null }) =>
        useGameSfx(isSpinning, cel, makeOpts({ unlocked: false }), play),
      { initialProps: { isSpinning: false, cel: null as Celebration | null } },
    );
    rerender({ isSpinning: true, cel: makeCelebration(1) });
    expect(play).not.toHaveBeenCalled();
  });
});
