// Tests for the WinBadge component (SPEC-019).
// The badge shows "WIN +{amount}" when show && amount > 0; renders nothing otherwise.
import { render, screen } from '@testing-library/react';
import WinBadge from './WinBadge';

describe('WinBadge', () => {
  it('shows the amount on a win', () => {
    render(<WinBadge amount={55} show />);
    // The badge must render text containing the win amount.
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('status').textContent).toContain('55');
  });

  it('renders nothing when there is no win (amount 0)', () => {
    const { container } = render(<WinBadge amount={0} show />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when show is false', () => {
    const { container } = render(<WinBadge amount={55} show={false} />);
    expect(container.firstChild).toBeNull();
  });
});
