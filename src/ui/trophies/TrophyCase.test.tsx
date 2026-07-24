// Behavior tests for TrophyCase, TrophyCard, and TrophyRow (SPEC-076/SPEC-078).
import { render, screen, fireEvent, act } from '@testing-library/react';
import TrophyCase from './TrophyCase';
import { TOP_WINS_CAP, type TopWin } from '../../stats/sessionStats';
import type { Grid, LineWin } from '../../engine/index';
import { SPIN_DURATION_MS } from '../useSlotMachine';

const TEST_GRID: Grid = [
  ['WOLF', 'DEER', 'FOX'],
  ['BEAR', 'EAGLE', 'OWL'],
  ['BISON', 'DEER', 'SQUIRREL'],
  ['FOX', 'WOLF', 'BEAR'],
  ['DEER', 'OWL', 'EAGLE'],
];

const L1_WIN_3: LineWin = { line: 'L1', symbol: 'BEAR', count: 3, multiplier: 1, amount: 10 };

function makeTrophy(overrides: Partial<TopWin> = {}): TopWin {
  return {
    amount: 100,
    machineId: 'wild-and-whimsical',
    tier: 'small',
    bet: 10,
    grid: TEST_GRID,
    lineWins: [L1_WIN_3],
    spinIndex: 1,
    ...overrides,
  };
}

/** Build N trophies with descending amounts, as topWins is always amount-descending. */
function makeTrophies(n: number, startAmount = 1000): TopWin[] {
  return Array.from({ length: n }, (_, i) =>
    makeTrophy({ amount: startAmount - i * 10, spinIndex: i + 1 }),
  );
}

describe('TrophyCase', () => {
  it('renders the locked-plinth empty state with no trophies', () => {
    const { container } = render(<TrophyCase topWins={[]} spins={0} />);
    expect(container.querySelectorAll('.trophy-case__plinth')).toHaveLength(TOP_WINS_CAP);
    expect(container.querySelector('.trophy-grid')).toBeNull();
  });

  it('renders up to three full cards and the rest as compact rows', () => {
    const { container } = render(<TrophyCase topWins={makeTrophies(6)} spins={6} />);
    expect(container.querySelectorAll('.trophy-card')).toHaveLength(3);
    expect(container.querySelectorAll('.trophy-row')).toHaveLength(3);
  });

  it('renders only cards when there are three or fewer trophies', () => {
    const { container } = render(<TrophyCase topWins={makeTrophies(2)} spins={2} />);
    expect(container.querySelectorAll('.trophy-card')).toHaveLength(2);
    expect(container.querySelectorAll('.trophy-row')).toHaveLength(0);
  });

  it('a full card shows amount, machine, tier, spin number, and bet multiplier', () => {
    const trophy = makeTrophy({
      amount: 240,
      bet: 10,
      machineId: 'arctic',
      tier: 'big',
      spinIndex: 143,
    });
    render(<TrophyCase topWins={[trophy]} spins={143} />);
    expect(screen.getByText(/240/)).toBeInTheDocument();
    expect(screen.getByText(/Arctic/)).toBeInTheDocument();
    expect(screen.getByText(/143/)).toBeInTheDocument();
    expect(screen.getByText(/24×/)).toBeInTheDocument();
  });

  it('a compact row expands in place on click and collapses again', () => {
    const { container } = render(<TrophyCase topWins={makeTrophies(4)} spins={4} />);

    // Scope to the row toggle specifically — SPEC-078 adds a replay button to each of the
    // three cards too, so a bare getAllByRole('button')[0] is no longer reliably the toggle.
    const fourthToggle = container.querySelector('.trophy-row__toggle') as HTMLElement;
    expect(fourthToggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(fourthToggle);
    expect(fourthToggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelector('.trophy-row__expanded')).not.toBeNull();

    fireEvent.click(fourthToggle);
    expect(fourthToggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('.trophy-row__expanded')).toBeNull();
  });

  it('shows the bar to beat only when the case is full', () => {
    const full = makeTrophies(TOP_WINS_CAP, 1000);
    // Ensure the 10th (smallest) trophy's amount is 35, per the acceptance criterion example.
    full[TOP_WINS_CAP - 1] = makeTrophy({ amount: 35, spinIndex: TOP_WINS_CAP });
    const { rerender } = render(<TrophyCase topWins={full} spins={TOP_WINS_CAP} />);
    expect(screen.getByText(/Beat 35 to make the case/)).toBeInTheDocument();

    rerender(<TrophyCase topWins={makeTrophies(9)} spins={9} />);
    expect(screen.queryByText(/make the case/)).toBeNull();
  });

  it('formats a fractional bet multiplier to at most one decimal', () => {
    const trophy = makeTrophy({ amount: 48, bet: 10 });
    render(<TrophyCase topWins={[trophy]} spins={1} />);
    expect(screen.getByText(/4\.8×/)).toBeInTheDocument();
    expect(screen.queryByText(/4\.800000/)).toBeNull();
  });

  it('ROUNDS a ratio that is not already one-decimal exact', () => {
    // 48/10 === 4.8 exactly in IEEE-754, so the case above passes even if the ratio is
    // returned un-rounded — it cannot detect a missing toFixed(1). 29/25 === 1.16 does
    // NOT round-trip through one decimal, so this case actually exercises the rounding.
    const trophy = makeTrophy({ amount: 29, bet: 25 });
    render(<TrophyCase topWins={[trophy]} spins={1} />);
    expect(screen.getByText(/1\.2×/)).toBeInTheDocument();
    expect(screen.queryByText(/1\.16×/)).toBeNull();
  });

  it('the row toggle is a keyboard-operable button with aria-expanded', () => {
    const { container } = render(<TrophyCase topWins={makeTrophies(4)} spins={4} />);

    // Scope to the row toggle specifically — see the note above about replay buttons.
    const toggle = container.querySelector('.trophy-row__toggle') as HTMLElement;
    // A real <button> (not a div with a click handler) is keyboard-operable by construction
    // — the browser fires a click on Enter/Space for it natively.
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    toggle.focus();
    expect(document.activeElement).toBe(toggle);

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  // ─── Replay (SPEC-078) ─────────────────────────────────────────────────────
  describe('replay', () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
      vi.useRealTimers();
    });

    /** Stub matchMedia to report a given prefers-reduced-motion state. */
    function stubReducedMotion(matches: boolean) {
      window.matchMedia = (query: string) =>
        ({
          matches,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList;
    }

    it('a replay control is present on each card and is a real button', () => {
      render(<TrophyCase topWins={makeTrophies(2)} spins={2} />);
      const replayButtons = screen.getAllByRole('button', { name: /replay this win/i });
      expect(replayButtons).toHaveLength(2);
      for (const btn of replayButtons) {
        expect(btn.tagName).toBe('BUTTON');
        expect(btn).toHaveAttribute('type', 'button');
      }
    });

    it('activating replay puts that card\'s grid into the spinning state', () => {
      vi.useFakeTimers();
      const { container } = render(<TrophyCase topWins={makeTrophies(1)} spins={1} />);
      const replayButton = screen.getByRole('button', { name: /replay this win/i });

      act(() => {
        fireEvent.click(replayButton);
      });

      expect(container.querySelector('.reel-grid--spinning')).not.toBeNull();
    });

    it('after the reveal delay the grid settles with winning cells lit', () => {
      vi.useFakeTimers();
      const { container } = render(<TrophyCase topWins={makeTrophies(1)} spins={1} />);
      const replayButton = screen.getByRole('button', { name: /replay this win/i });

      act(() => {
        fireEvent.click(replayButton);
      });
      act(() => {
        vi.runAllTimers();
      });

      expect(container.querySelector('.reel-grid--spinning')).toBeNull();
      // L1 count=3 covers reels 0,1,2 at row 1 → exactly 3 winning cells (same fixture as
      // TrophyGrid.test.tsx).
      expect(container.querySelectorAll('.reel__cell--win')).toHaveLength(3);
    });

    it("replaying one card does not affect a sibling card's grid", () => {
      vi.useFakeTimers();
      const { container } = render(<TrophyCase topWins={makeTrophies(2)} spins={2} />);
      const replayButtons = screen.getAllByRole('button', { name: /replay this win/i });

      act(() => {
        fireEvent.click(replayButtons[0]);
      });

      const cards = container.querySelectorAll('.trophy-card');
      expect(cards[0].querySelector('.reel-grid--spinning')).not.toBeNull();
      // The sibling card's grid must be completely unaffected — still settled, still
      // showing its own winning cells.
      expect(cards[1].querySelector('.reel-grid--spinning')).toBeNull();
      expect(cards[1].querySelectorAll('.reel__cell--win')).toHaveLength(3);
    });

    it('replay does not mutate topWins', () => {
      vi.useFakeTimers();
      const topWins = makeTrophies(2);
      const before = JSON.parse(JSON.stringify(topWins));
      render(<TrophyCase topWins={topWins} spins={2} />);
      const replayButton = screen.getAllByRole('button', { name: /replay this win/i })[0];

      act(() => {
        fireEvent.click(replayButton);
      });
      act(() => {
        vi.runAllTimers();
      });

      expect(topWins).toEqual(before);
    });

    it('re-activating mid-replay does not leave the grid stuck spinning', () => {
      vi.useFakeTimers();
      const { container } = render(<TrophyCase topWins={makeTrophies(1)} spins={1} />);
      const replayButton = screen.getByRole('button', { name: /replay this win/i });

      act(() => {
        fireEvent.click(replayButton);
      });
      act(() => {
        vi.advanceTimersByTime(100); // still mid-flight
      });
      act(() => {
        fireEvent.click(replayButton); // re-activate — must restart, not stack
      });
      act(() => {
        vi.runAllTimers();
      });

      expect(container.querySelector('.reel-grid--spinning')).toBeNull();
    });

    it('a restarted replay is not settled early by the first activation timer', () => {
      // The test above cannot detect a missing clearTimeout: it runs ALL timers, so the
      // stale timer and the fresh one both fire and the end state is settled either way.
      // The real symptom of a stacked timer is a PREMATURE settle — the first activation's
      // timeout firing mid-way through the restarted replay and stopping the spin early.
      // Advancing to just past the first timer's deadline (but before the second's) is the
      // only window where the bug is visible.
      vi.useFakeTimers();
      const { container } = render(<TrophyCase topWins={makeTrophies(1)} spins={1} />);
      const replayButton = screen.getByRole('button', { name: /replay this win/i });

      act(() => {
        fireEvent.click(replayButton);
      });
      act(() => {
        vi.advanceTimersByTime(200); // first replay in flight
      });
      act(() => {
        fireEvent.click(replayButton); // restart — the first timer must be cancelled
      });
      // Now advance past when the FIRST timer would have fired (200 consumed + the rest),
      // but not far enough for the restarted one to complete.
      act(() => {
        vi.advanceTimersByTime(SPIN_DURATION_MS - 100);
      });

      // Still spinning: the restart owns the timeline. With a stacked timer the stale one
      // would have fired by now and wrongly cleared the spin.
      expect(container.querySelector('.reel-grid--spinning')).not.toBeNull();
    });

    it('reveals instantly under prefers-reduced-motion', () => {
      stubReducedMotion(true);
      vi.useFakeTimers();
      const { container } = render(<TrophyCase topWins={makeTrophies(1)} spins={1} />);
      const replayButton = screen.getByRole('button', { name: /replay this win/i });

      act(() => {
        fireEvent.click(replayButton);
      });

      // Never spinning, settles immediately — no need to advance timers at all.
      expect(container.querySelector('.reel-grid--spinning')).toBeNull();
      expect(container.querySelectorAll('.reel__cell--win')).toHaveLength(3);
    });

    it('unmounting mid-replay does not warn or update state', () => {
      vi.useFakeTimers();
      const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { unmount } = render(<TrophyCase topWins={makeTrophies(1)} spins={1} />);
      const replayButton = screen.getByRole('button', { name: /replay this win/i });

      act(() => {
        fireEvent.click(replayButton);
      });
      unmount();
      act(() => {
        vi.runAllTimers();
      });

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
