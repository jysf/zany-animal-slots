// Behavior tests for TrophyCase, TrophyCard, and TrophyRow (SPEC-076).
import { render, screen, fireEvent } from '@testing-library/react';
import TrophyCase from './TrophyCase';
import { TOP_WINS_CAP, type TopWin } from '../../stats/sessionStats';
import type { Grid, LineWin } from '../../engine/index';

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
    render(<TrophyCase topWins={makeTrophies(4)} spins={4} />);

    const toggles = screen.getAllByRole('button');
    const fourthToggle = toggles[0]; // only one row exists with 4 trophies (the 4th entry)
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

  it('the row toggle is a keyboard-operable button with aria-expanded', () => {
    render(<TrophyCase topWins={makeTrophies(4)} spins={4} />);

    const toggle = screen.getByRole('button');
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
});
