// Behavior tests for TrophyGrid (SPEC-075).
// The load-bearing behavior: a trophy renders using its ORIGINATING machine
// (getMachine(trophy.machineId)), not the currently-active machine (DEC-021).
import { render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import TrophyGrid from './TrophyGrid';
import { MachineProvider } from '../machine/MachineProvider';
import { writeActiveMachineId } from '../../machines/activeMachineStorage';
import type { TopWin } from '../../stats/sessionStats';
import type { Grid, LineWin } from '../../engine/index';

/** A 5×3 grid using only engine symbol IDs — the emoji rendered depend on the machine. */
const TEST_GRID: Grid = [
  ['WOLF', 'DEER', 'FOX'],
  ['BEAR', 'EAGLE', 'OWL'],
  ['BISON', 'DEER', 'SQUIRREL'],
  ['FOX', 'WOLF', 'BEAR'],
  ['DEER', 'OWL', 'EAGLE'],
];

/** L1 win of count 3: reels 0,1,2 at row 1 (middle row) — same shape used in ReelGrid tests. */
const L1_WIN_3: LineWin = { line: 'L1', symbol: 'BEAR', count: 3, multiplier: 1, amount: 10 };

function makeTrophy(overrides: Partial<TopWin> = {}): TopWin {
  return {
    amount: 250,
    machineId: 'arctic',
    tier: 'big',
    bet: 10,
    grid: TEST_GRID,
    lineWins: [L1_WIN_3],
    spinIndex: 4,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('TrophyGrid', () => {
  it("renders the originating machine's symbols, not the active machine's", () => {
    // Active machine is Ocean; the trophy was won on Arctic.
    writeActiveMachineId('ocean');
    render(
      <MachineProvider>
        <TrophyGrid trophy={makeTrophy({ machineId: 'arctic' })} />
      </MachineProvider>,
    );

    // Arctic's BEAR slot renders as Seal (🦭); Ocean's BEAR slot renders as Crab (🦀).
    const sealCells = screen.getAllByLabelText('Seal');
    expect(sealCells.length).toBeGreaterThan(0);
    expect(screen.queryByLabelText('Crab')).toBeNull();
  });

  it("lights the winning cells from the trophy's lineWins", () => {
    const { container } = render(<TrophyGrid trophy={makeTrophy()} />);
    // L1 count=3 covers reels 0,1,2 at row 1 → exactly 3 winning cells.
    expect(container.querySelectorAll('.reel__cell--win')).toHaveLength(3);
  });

  it('exposes an accessible summary naming amount, machine, and tier', () => {
    render(<TrophyGrid trophy={makeTrophy({ amount: 250, machineId: 'arctic', tier: 'big' })} />);
    const summary = screen.getByRole('img', { name: /250/ });
    expect(summary.getAttribute('aria-label')).toContain('250');
    expect(summary.getAttribute('aria-label')).toContain('Arctic');
    expect(summary.getAttribute('aria-label')).toContain('big');
  });

  it('renders at thumb size without changing the emitted grid', () => {
    const { container } = render(<TrophyGrid trophy={makeTrophy()} size="thumb" />);
    expect(container.querySelectorAll('.reel__cell')).toHaveLength(15);
    expect(container.querySelectorAll('.reel__cell--win')).toHaveLength(3);
    expect(container.querySelector('.reel-grid--thumb')).not.toBeNull();
  });

  it('marks an unknown machineId instead of silently showing the default machine', () => {
    const { container } = render(
      <TrophyGrid trophy={makeTrophy({ machineId: 'no-such-machine' })} />,
    );
    expect(container.querySelector('.trophy-grid--unknown-machine')).not.toBeNull();
    // The accessible summary must say so too, not lie about provenance.
    const summary = screen.getByRole('img', { name: /Unknown machine/ });
    expect(summary.getAttribute('aria-label')).toContain('no-such-machine');
  });

  // SPEC-078: TrophyGrid gains a spinning/trailKey passthrough to ReelGrid so replay can
  // drive the animation without TrophyGrid knowing anything about replay itself.
  it('forwards spinning to ReelGrid', () => {
    const { container } = render(<TrophyGrid trophy={makeTrophy()} spinning />);
    expect(container.querySelector('.reel-grid--spinning')).not.toBeNull();
    expect(container.querySelectorAll('.reel--spinning').length).toBeGreaterThan(0);
  });

  it('suppresses the winning-cell highlight while spinning', () => {
    // Pins ReelGrid's existing spinning-suppresses-highlight behavior through the
    // trophy wrapper — a stale win must not flash mid-replay.
    const { container } = render(<TrophyGrid trophy={makeTrophy()} spinning />);
    expect(container.querySelectorAll('.reel__cell--win')).toHaveLength(0);
  });
});
