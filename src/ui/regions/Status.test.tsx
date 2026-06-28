// Tests for the Status region (SPEC-013, SPEC-019, SPEC-022):
// balance, bet, and last-win readout; balance count-up on a win.
import { render, screen, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import Status from './Status';
import { COUNT_UP_DURATION_MS } from '../useCountUp';

describe('Status', () => {
  it('shows the balance and bet', () => {
    render(<Status balance={1000} bet={10} lastWin={0} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows the last win amount', () => {
    render(<Status balance={1045} bet={10} lastWin={55} />);
    // The WIN readout must show the lastWin value.
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  describe('balance count-up (SPEC-022)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('counts up the balance on a win', () => {
      render(
        <Status
          balance={1045}
          bet={10}
          lastWin={55}
          celebration={{ id: 1, tier: 'big', totalWin: 55, lineWins: [] }}
        />,
      );
      // Initially: shownBalance starts at 1045 - 55 = 990
      expect(screen.getByText('990')).toBeInTheDocument();

      // After the full count-up duration: shownBalance reaches 1045
      act(() => {
        vi.advanceTimersByTime(COUNT_UP_DURATION_MS);
      });
      expect(screen.getByText('1045')).toBeInTheDocument();
    });

    it('shows balance instantly when no celebration prop is passed', () => {
      render(<Status balance={1045} bet={10} lastWin={0} />);
      // No celebration → signal is null → shownBalance === balance immediately
      expect(screen.getByText('1045')).toBeInTheDocument();
    });
  });
});
