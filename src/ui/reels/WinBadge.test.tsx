// Tests for the WinBadge component (SPEC-019).
// The badge shows "WIN +{amount}" when show && amount > 0; renders nothing otherwise.
// SPEC-033: extended with tier word and data-tier tests.
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

  // ── SPEC-033: tier word tests ─────────────────────────────────────────────────

  it('shows the tier word for each tier', () => {
    // jackpot → JACKPOT and the amount
    const { rerender } = render(<WinBadge amount={2000} show tier="jackpot" />);
    expect(screen.getByRole('status').textContent).toContain('JACKPOT');
    expect(screen.getByRole('status').textContent).toContain('2000');

    // big → BIG WIN
    rerender(<WinBadge amount={500} show tier="big" />);
    expect(screen.getByRole('status').textContent).toContain('BIG WIN');

    // small → WIN (and NOT 'BIG')
    rerender(<WinBadge amount={100} show tier="small" />);
    expect(screen.getByRole('status').textContent).toContain('WIN');
    expect(screen.getByRole('status').textContent).not.toContain('BIG');

    // omitted (default) → WIN and still contains the amount (the "contains 55" case)
    rerender(<WinBadge amount={55} show />);
    expect(screen.getByRole('status').textContent).toContain('55');
    expect(screen.getByRole('status').textContent).toContain('WIN');
  });

  it('exposes data-tier', () => {
    // tier="big" → data-tier="big"
    const { rerender } = render(<WinBadge amount={500} show tier="big" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-tier', 'big');

    // omitted → data-tier="small" (default)
    rerender(<WinBadge amount={55} show />);
    expect(screen.getByRole('status')).toHaveAttribute('data-tier', 'small');
  });
});
