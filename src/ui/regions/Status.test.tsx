// Tests for the Status region (SPEC-013, SPEC-019): balance, bet, and last-win readout.
import { render, screen } from '@testing-library/react';
import Status from './Status';

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
});
