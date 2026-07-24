// StatsSheet interaction + rendering tests — SPEC-056 failing tests (written at design),
// updated + extended for SPEC-079 (trophy case mount, biggest-win tile removal, drought
// counter, rename to "Your record") and SPEC-080 (Trophies/Numbers tabs — only one panel's
// content is in the accessible tree at a time; Clear record lives outside both panels).
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

/** Open the sheet via its trigger. */
function openSheet() {
  fireEvent.click(screen.getByRole('button', { name: /your record/i }));
}

/** Switch tabs via the tab button's accessible name ("Trophies" | "Numbers"). */
function switchTo(name: RegExp) {
  fireEvent.click(screen.getByRole('tab', { name }));
}

describe('StatsSheet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is closed by default; the trigger is present', () => {
    render(<StatsSheet />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /your record/i })).toBeTruthy();
  });

  it('opens on trigger click and shows the metric tiles on the Numbers tab', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    expect(screen.getByRole('dialog')).toBeTruthy();
    switchTo(/numbers/i);
    expect(screen.getByTestId('stat-spins').textContent).toBe('10');
    expect(screen.getByTestId('stat-winrate').textContent).toBe('40%');
    expect(screen.getByTestId('stat-net').textContent).toBe('+30');
    expect(screen.getByTestId('stat-cashins').textContent).toBe('2');
  });

  it('still renders spins, win rate, net, and cash-ins on the Numbers tab', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    switchTo(/numbers/i);
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
    openSheet();
    switchTo(/numbers/i);
    expect(screen.queryByTestId('stat-biggest')).toBeNull();
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
    openSheet();
    switchTo(/numbers/i);
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
    openSheet();
    switchTo(/numbers/i);
    expect(screen.getByTestId('stat-drought').textContent).toBe('0');
  });

  it('hides the drought counter when there are no trophies', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    switchTo(/numbers/i);
    expect(screen.queryByTestId('stat-drought')).toBeNull();
  });

  it("the sheet is named 'Your record', not 'Session stats'", () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    expect(screen.getByRole('button', { name: /your record/i })).toBeTruthy();
    openSheet();
    expect(screen.getByRole('dialog', { name: /your record/i })).toBeTruthy();
    expect(screen.getByText('Your record')).toBeTruthy();
    expect(screen.queryByText(/session stats/i)).toBeNull();
  });

  it('closes on the ✕ button', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders the winnings-over-time sparkline on the Numbers tab', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    switchTo(/numbers/i);
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
    openSheet();
    fireEvent.click(screen.getByTestId('stats-backdrop'));
    expect(screen.queryByRole('dialog')).toBeNull();

    openSheet();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // ─── SPEC-080: tabbed record sheet ───────────────────────────────────────

  it('opens on the Trophies tab by default', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('.trophy-case')).not.toBeNull();
    expect(screen.queryByTestId('stat-spins')).toBeNull();
  });

  it('switching to Numbers shows the stats and hides the trophy case', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    switchTo(/numbers/i);
    // Both directions: the new panel is present AND the old one is genuinely gone —
    // a test that only checked the former would pass even if both stayed mounted.
    expect(screen.getByTestId('stat-spins')).toBeTruthy();
    expect(screen.getByRole('dialog').querySelector('.trophy-case')).toBeNull();
  });

  it('switching back to Trophies restores the case and hides the stats', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    switchTo(/numbers/i);
    switchTo(/trophies/i);
    expect(screen.getByRole('dialog').querySelector('.trophy-case')).not.toBeNull();
    expect(screen.queryByTestId('stat-spins')).toBeNull();
  });

  it('tabs expose the ARIA tab pattern', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeTruthy();

    const trophiesTab = screen.getByRole('tab', { name: /trophies/i });
    const numbersTab = screen.getByRole('tab', { name: /numbers/i });

    expect(trophiesTab.getAttribute('aria-selected')).toBe('true');
    expect(numbersTab.getAttribute('aria-selected')).toBe('false');

    const trophiesPanelId = trophiesTab.getAttribute('aria-controls');
    expect(trophiesPanelId).toBeTruthy();
    const trophiesPanel = document.getElementById(trophiesPanelId!);
    expect(trophiesPanel).not.toBeNull();
    expect(trophiesPanel!.getAttribute('role')).toBe('tabpanel');

    switchTo(/numbers/i);
    expect(numbersTab.getAttribute('aria-selected')).toBe('true');
    expect(trophiesTab.getAttribute('aria-selected')).toBe('false');

    const numbersPanelId = numbersTab.getAttribute('aria-controls');
    expect(numbersPanelId).toBeTruthy();
    const numbersPanel = document.getElementById(numbersPanelId!);
    expect(numbersPanel).not.toBeNull();
    expect(numbersPanel!.getAttribute('role')).toBe('tabpanel');
  });

  it('Clear record is reachable from BOTH tabs', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    // Active tab is Trophies by default.
    expect(screen.getByRole('button', { name: /clear record/i })).toBeTruthy();

    switchTo(/numbers/i);
    expect(screen.getByRole('button', { name: /clear record/i })).toBeTruthy();
  });

  it('clearing from the Numbers tab still clears trophies', () => {
    writeStats(SEEDED);
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    switchTo(/numbers/i);
    expect(screen.getByTestId('stat-spins').textContent).toBe('10');

    fireEvent.click(screen.getByRole('button', { name: /clear record/i }));
    expect(screen.getByTestId('stat-spins').textContent).toBe('0');
    expect(readStats()).toEqual(emptyStats());
    expect(readStats().topWins).toEqual([]);

    switchTo(/trophies/i);
    expect(screen.getByText(/no trophies yet/i)).toBeTruthy();
  });

  it('reopening the sheet returns to the Trophies tab', () => {
    render(
      <StatsProvider>
        <StatsSheet />
      </StatsProvider>,
    );
    openSheet();
    switchTo(/numbers/i);
    expect(screen.getByRole('tab', { name: /numbers/i }).getAttribute('aria-selected')).toBe(
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();

    openSheet();
    expect(screen.getByRole('tab', { name: /trophies/i }).getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(screen.getByRole('tab', { name: /numbers/i }).getAttribute('aria-selected')).toBe(
      'false',
    );
  });
});
