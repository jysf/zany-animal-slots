// Tests for JackpotMoment (SPEC-025).
// Uses vi.useFakeTimers() so auto-dismiss can be advanced deterministically.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import JackpotMoment, { JACKPOT_MOMENT_MS } from './JackpotMoment';
import type { Celebration } from './useSlotMachine';

const jackpotCelebration: Celebration = {
  id: 1,
  tier: 'jackpot',
  totalWin: 2000,
  lineWins: [],
};

describe('JackpotMoment', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing without a celebration', () => {
    const { container } = render(<JackpotMoment />);
    expect(container.querySelector('.jackpot-moment')).toBeNull();
  });

  it('renders nothing for a non-jackpot tier', () => {
    const tiers = ['small', 'big', 'none'] as const;
    for (const tier of tiers) {
      const celebration: Celebration = { id: 1, tier, totalWin: tier === 'none' ? 0 : 100, lineWins: [] };
      const { container, unmount } = render(<JackpotMoment celebration={celebration} />);
      expect(container.querySelector('.jackpot-moment')).toBeNull();
      unmount();
    }
  });

  it('renders the jackpot scene on a jackpot', () => {
    const { container } = render(<JackpotMoment celebration={jackpotCelebration} />);
    const el = container.querySelector('.jackpot-moment');
    expect(el).not.toBeNull();
    expect(el?.textContent).toContain('🌕');
    expect(el?.textContent).toContain('🐺');
    expect(el?.textContent).toMatch(/jackpot/i);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-label');
  });

  it('auto-dismisses after JACKPOT_MOMENT_MS', () => {
    const { container } = render(<JackpotMoment celebration={jackpotCelebration} />);
    expect(container.querySelector('.jackpot-moment')).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(JACKPOT_MOMENT_MS);
    });
    expect(container.querySelector('.jackpot-moment')).toBeNull();
  });

  it('re-shows on a new jackpot id', () => {
    const { container, rerender } = render(<JackpotMoment celebration={jackpotCelebration} />);
    // Dismiss the first showing.
    act(() => {
      vi.advanceTimersByTime(JACKPOT_MOMENT_MS);
    });
    expect(container.querySelector('.jackpot-moment')).toBeNull();
    // A new jackpot arrives with a higher id.
    const secondJackpot: Celebration = { id: 2, tier: 'jackpot', totalWin: 2000, lineWins: [] };
    rerender(<JackpotMoment celebration={secondJackpot} />);
    expect(container.querySelector('.jackpot-moment')).not.toBeNull();
  });

  it('defines the keyframes + reduced-motion + no raw hex', () => {
    const cssPath = resolve(__dirname, 'jackpot.css');
    const css = readFileSync(cssPath, 'utf-8');
    // Must have @keyframes blocks.
    expect(css).toMatch(/@keyframes/);
    // Must use transform in at least one keyframe.
    expect(css).toMatch(/transform/);
    // Must have a prefers-reduced-motion: reduce block.
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);
    // Must not contain raw hex color literals.
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
