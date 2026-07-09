// Sparkline rendering tests — SPEC-057 failing tests (written at design). Coordinates pinned via
// the geometry script. render/rerender only (no userEvent).
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('shows an empty state below two points', () => {
    const { rerender } = render(<Sparkline series={[]} />);
    expect(screen.getByTestId('sparkline-empty')).toBeTruthy();
    expect(screen.queryByTestId('sparkline')).toBeNull();

    rerender(<Sparkline series={[5]} />);
    expect(screen.getByTestId('sparkline-empty')).toBeTruthy();
    expect(screen.queryByTestId('sparkline')).toBeNull();
  });

  it('plots pinned polyline points for a mixed series', () => {
    render(<Sparkline series={[10, -5, 30]} />);
    expect(screen.getByTestId('sparkline-line').getAttribute('points')).toBe(
      '2.00,18.00 50.00,30.00 98.00,2.00',
    );
  });

  it('draws a dashed zero baseline when the series crosses break-even', () => {
    render(<Sparkline series={[10, -5, 30]} />);
    const baseline = screen.getByTestId('sparkline-baseline');
    expect(baseline.getAttribute('y1')).toBe('26.00');
    expect(baseline.getAttribute('y2')).toBe('26.00');
  });

  it('omits the baseline when every point is on one side of zero', () => {
    render(<Sparkline series={[3, 8, 12]} />);
    expect(screen.queryByTestId('sparkline-baseline')).toBeNull();
    expect(screen.getByTestId('sparkline-line').getAttribute('points')).toBe(
      '2.00,30.00 50.00,14.44 98.00,2.00',
    );
  });

  it('colors an up trend and a down trend by the final net', () => {
    const { rerender } = render(<Sparkline series={[10, -5, 30]} />);
    expect(screen.getByTestId('sparkline-line').getAttribute('class')).toContain(
      'sparkline__line--up',
    );

    rerender(<Sparkline series={[5, -20]} />);
    expect(screen.getByTestId('sparkline-line').getAttribute('class')).toContain(
      'sparkline__line--down',
    );
  });

  it('centers a flat series on the vertical midline', () => {
    render(<Sparkline series={[7, 7, 7]} />);
    expect(screen.getByTestId('sparkline-line').getAttribute('points')).toBe(
      '2.00,16.00 50.00,16.00 98.00,16.00',
    );
  });
});
