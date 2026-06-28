// useDynamicMixing.test.ts — gating tests for SPEC-030.
// Injects a vi.fn() as the `mix` param so no real Tone.js is ever called.
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDynamicMixing } from './useDynamicMixing';
import type { Celebration } from '../useSlotMachine';

function makeCelebration(id: number, tier: 'small' | 'big' | 'jackpot'): Celebration {
  return { id, tier, totalWin: 100, lineWins: [] };
}

describe('useDynamicMixing', () => {
  it('applies the mix on a new winning celebration', () => {
    const mix = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useDynamicMixing(celebration, { muted, unlocked }, mix),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: true } },
    );

    expect(mix).not.toHaveBeenCalled();

    rerender({ celebration: makeCelebration(1, 'big'), muted: false, unlocked: true });
    expect(mix).toHaveBeenCalledOnce();
    expect(mix).toHaveBeenCalledWith('big');
  });

  it('passes the jackpot tier', () => {
    const mix = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useDynamicMixing(celebration, { muted, unlocked }, mix),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: true } },
    );

    rerender({ celebration: makeCelebration(1, 'jackpot'), muted: false, unlocked: true });
    expect(mix).toHaveBeenCalledOnce();
    expect(mix).toHaveBeenCalledWith('jackpot');
  });

  it('re-applies on a new win id', () => {
    const mix = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useDynamicMixing(celebration, { muted, unlocked }, mix),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: true } },
    );

    rerender({ celebration: makeCelebration(1, 'big'), muted: false, unlocked: true });
    expect(mix).toHaveBeenCalledTimes(1);

    rerender({ celebration: makeCelebration(2, 'small'), muted: false, unlocked: true });
    expect(mix).toHaveBeenCalledTimes(2);
    expect(mix).toHaveBeenLastCalledWith('small');
  });

  it('does not apply on a no-win', () => {
    const mix = vi.fn();
    renderHook(
      ({ celebration, muted, unlocked }) =>
        useDynamicMixing(celebration, { muted, unlocked }, mix),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: true } },
    );

    expect(mix).not.toHaveBeenCalled();
  });

  it('does not apply when muted', () => {
    const mix = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useDynamicMixing(celebration, { muted, unlocked }, mix),
      { initialProps: { celebration: null as Celebration | null, muted: true, unlocked: true } },
    );

    rerender({ celebration: makeCelebration(1, 'big'), muted: true, unlocked: true });
    expect(mix).not.toHaveBeenCalled();
  });

  it('does not apply when locked', () => {
    const mix = vi.fn();
    const { rerender } = renderHook(
      ({ celebration, muted, unlocked }) =>
        useDynamicMixing(celebration, { muted, unlocked }, mix),
      { initialProps: { celebration: null as Celebration | null, muted: false, unlocked: false } },
    );

    rerender({ celebration: makeCelebration(1, 'big'), muted: false, unlocked: false });
    expect(mix).not.toHaveBeenCalled();
  });
});
