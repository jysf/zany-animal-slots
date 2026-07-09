// StatsSheet interaction + rendering tests — SPEC-056 failing tests (written at design).
// render/fireEvent (no userEvent). Seeds stats via writeStats + StatsProvider hydration.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsSheet } from './StatsSheet';
import { StatsProvider } from './StatsProvider';
import { emptyStats, type SessionStats } from '../../stats/sessionStats';
import { readStats, writeStats } from '../../stats/statsStorage';

const SEEDED: SessionStats = {
  ...emptyStats(),
  spins: 10,
  winningSpins: 4,
  totalWagered: 100,
  totalWon: 130,
  biggestWin: { amount: 40, machineId: 'wild-and-whimsical', tier: 'small' },
  cashIns: 2,
  series: [10, -5, 30],
};

describe('StatsSheet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is closed by default; the trigger is present', () => {
    render(<StatsSheet />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /session stats/i })).toBeTruthy();
  });

  it('opens on trigger click and shows the metric tiles', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByTestId('stat-spins').textContent).toBe('10');
    expect(screen.getByTestId('stat-winrate').textContent).toBe('40%');
    expect(screen.getByTestId('stat-net').textContent).toBe('+30');
    expect(screen.getByTestId('stat-cashins').textContent).toBe('2');
    expect(screen.getByTestId('stat-biggest').textContent).toBe('40');
  });

  it('shows an em dash for biggest win in the empty state', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    expect(screen.getByTestId('stat-biggest').textContent).toBe('—');
    expect(screen.getByTestId('stat-spins').textContent).toBe('0');
    expect(screen.getByTestId('stat-winrate').textContent).toBe('0%');
  });

  it('Clear stats zeroes the record and persists emptyStats', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    expect(screen.getByTestId('stat-spins').textContent).toBe('10');

    fireEvent.click(screen.getByRole('button', { name: /clear stats/i }));
    expect(screen.getByTestId('stat-spins').textContent).toBe('0');
    expect(screen.getByTestId('stat-biggest').textContent).toBe('—');
    expect(readStats()).toEqual(emptyStats());
  });

  it('closes on the ✕ button', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
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
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
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
    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    fireEvent.click(screen.getByTestId('stats-backdrop'));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /session stats/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
