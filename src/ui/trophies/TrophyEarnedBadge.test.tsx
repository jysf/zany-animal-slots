// Tests for TrophyEarnedBadge (SPEC-077).
// null → nothing; rank 1 → distinct "new best" treatment; ranks 2-10 → "TROPHY #{rank}";
// always role="status" when rendered.
import { render, screen } from '@testing-library/react';
import TrophyEarnedBadge from './TrophyEarnedBadge';

describe('TrophyEarnedBadge', () => {
  it('renders nothing when trophyRank is null', () => {
    const { container } = render(<TrophyEarnedBadge trophyRank={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the new-best treatment at rank 1', () => {
    render(<TrophyEarnedBadge trophyRank={1} />);
    const badge = screen.getByRole('status');
    expect(badge.textContent).toContain('NEW BEST');
    expect(badge).toHaveAttribute('data-rank', 'best');
  });

  it('names the rank for ranks 2-10', () => {
    render(<TrophyEarnedBadge trophyRank={4} />);
    const badge = screen.getByRole('status');
    expect(badge.textContent).toContain('4');
    expect(badge.textContent).not.toContain('NEW BEST');
    expect(badge).toHaveAttribute('data-rank', 'trophy');
  });

  it('is distinct between rank 1 and rank 2', () => {
    const { rerender } = render(<TrophyEarnedBadge trophyRank={1} />);
    const rank1Text = screen.getByRole('status').textContent;
    const rank1Attr = screen.getByRole('status').getAttribute('data-rank');

    rerender(<TrophyEarnedBadge trophyRank={2} />);
    const rank2Text = screen.getByRole('status').textContent;
    const rank2Attr = screen.getByRole('status').getAttribute('data-rank');

    expect(rank1Text).not.toBe(rank2Text);
    expect(rank1Attr).not.toBe(rank2Attr);
  });

  it('is announced via role=status', () => {
    render(<TrophyEarnedBadge trophyRank={7} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
