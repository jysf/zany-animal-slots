// Tests for the Status region (SPEC-013): balance and bet readout.
import { render, screen } from '@testing-library/react';
import Status from './Status';

describe('Status', () => {
  it('shows the balance and bet', () => {
    render(<Status balance={1000} bet={10} />);
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
