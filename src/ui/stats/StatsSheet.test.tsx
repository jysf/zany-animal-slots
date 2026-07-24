// StatsSheet interaction + rendering tests — SPEC-056 failing tests (written at design),
// updated + extended for SPEC-079 (trophy case mount, biggest-win tile removal, drought
// counter, rename to "Your record").
// render/fireEvent (no userEvent). Seeds stats via writeStats + StatsProvider hydration.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsSheet } from './StatsSheet';
import { StatsProvider } from './StatsProvider';
import { emptyStats, type SessionStats, type TopWin } from '../../stats/sessionStats';
import { readStats, writeStats } from '../../stats/statsStorage';

const TEST_GRID: TopWin['grid'] = [
  ['WOLF', 'DEER', 'FOX'],
  ['BEAR', 'EAGLE', 'OWL'],
  ['BISON', 'DEER', 'SQUIRREL'],
  ['FOX', 'WOLF', 'BEAR'],
  ['DEER', 'OWL', 'EAGLE'],
];

const TROPHY: TopWin = {
  amount: 40,
  machineId: 'wild-and-whimsical',
  tier: 'small',
  bet: 10,
  grid: TEST_GRID,
  lineWins: [],
  spinIndex: 10,
};

const SEEDED: SessionStats = {
  ...emptyStats(),
  spins: 10,
  winningSpins: 4,
  totalWagered: 100,
  totalWon: 130,
  biggestWin: { amount: 40, machineId: 'wild-and-whimsical', tier: 'small' },
  cashIns: 2,
  series: [10, -5, 30],
  topWins: [TROPHY],
};

describe('StatsSheet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is closed by default; the trigger is present', () => {
    render(<StatsSheet />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /your record/i })).toBeTruthy();
  });

  it('opens on trigger click and shows the metric tiles', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByTestId('stat-spins').textContent).toBe('10');
    expect(screen.getByTestId('stat-winrate').textContent).toBe('40%');
    expect(screen.getByTestId('stat-net').textContent).toBe('+30');
    expect(screen.getByTestId('stat-cashins').textContent).toBe('2');
  });

  it('still renders spins, win rate, net, and cash-ins', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.getByTestId('stat-spins').textContent).toBe('0');
    expect(screen.getByTestId('stat-winrate').textContent).toBe('0%');
    expect(screen.getByTestId('stat-net').textContent).toBe('0');
    expect(screen.getByTestId('stat-cashins').textContent).toBe('0');
  });

  it('no longer renders a separate Biggest win tile', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.queryByTestId('stat-biggest')).toBeNull();
  });

  it('renders the trophy case above the numeric tiles', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    const dialog = screen.getByRole('dialog');
    const trophyCase = dialog.querySelector('.trophy-case');
    const grid = screen.getByTestId('stat-spins').closest('.stats__grid');
    expect(trophyCase).not.toBeNull();
    expect(grid).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING (4) means `grid` comes after `trophyCase` in the DOM.
    expect(trophyCase!.compareDocumentPosition(grid!) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('shows spins since the last trophy when a trophy exists', () => {
    // biggest win (spinIndex 12) and most recent trophy (spinIndex 100) are DIFFERENT spins —
    // the drought must use the max spinIndex, not topWins[0].
    const stats: SessionStats = {
      ...emptyStats(),
      spins: 143,
      topWins: [
        { ...TROPHY, amount: 999, spinIndex: 12 },
        { ...TROPHY, amount: 40, spinIndex: 100 },
      ],
    };
    writeStats(stats);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.getByTestId('stat-drought').textContent).toBe('43');
  });

  it('reads 0, not a negative number or -0, on the spin that just set a trophy', () => {
    const stats: SessionStats = {
      ...emptyStats(),
      spins: 50,
      topWins: [{ ...TROPHY, spinIndex: 50 }],
    };
    writeStats(stats);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.getByTestId('stat-drought').textContent).toBe('0');
  });

  it('hides the drought counter when there are no trophies', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.queryByTestId('stat-drought')).toBeNull();
  });

  it("the sheet is named 'Your record', not 'Session stats'", () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    expect(screen.getByRole('button', { name: /your record/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.getByRole('dialog', { name: /your record/i })).toBeTruthy();
    expect(screen.getByText('Your record')).toBeTruthy();
    expect(screen.queryByText(/session stats/i)).toBeNull();
  });

  it("clearing the record also clears trophies", () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.getByTestId('stat-spins').textContent).toBe('10');

    fireEvent.click(screen.getByRole('button', { name: /clear record/i }));
    expect(screen.getByTestId('stat-spins').textContent).toBe('0');
    expect(readStats()).toEqual(emptyStats());
    expect(readStats().topWins).toEqual([]);
    expect(screen.getByText(/no trophies yet/i)).toBeTruthy();
  });

  it('closes on the ✕ button', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the winnings-over-time sparkline when opened with a series', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    expect(screen.getByTestId('sparkline')).toBeTruthy();
    expect(screen.getByTestId('sparkline-line').getAttribute('points')).toBe(
      '2.00,18.00 50.00,30.00 98.00,2.00',
    );
  });

  it('closes on backdrop click and on Escape', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    fireEvent.click(screen.getByTestId('stats-backdrop'));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /your record/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
