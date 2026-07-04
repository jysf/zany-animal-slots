// Updated for SPEC-003: tests the four-region cabinet structure.
// The "Animal Slots" accessible name moves from <main aria-label> to the
// <h1> heading inside the <header> banner region.
// SPEC-013: extended with Spin control + balance readout assertions.
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the four cabinet regions', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /controls/i })).toBeInTheDocument();
  });

  it('shows the Animal Slots title in the header', () => {
    render(<App />);
    const banner = screen.getByRole('banner');
    expect(banner).toContainElement(
      screen.getByRole('heading', { name: /animal slots/i }),
    );
  });

  // SPEC-004: the device-stage wrapper hosts the cabinet (frame is a desktop-only
  // CSS treatment; here we only assert the structure, since jsdom can't evaluate
  // the min-width media query).
  it('wraps the cabinet in a device stage', () => {
    const { container } = render(<App />);
    const stage = screen.getByTestId('device-stage');
    expect(stage).toBeInTheDocument();
    // The cabinet (and therefore the four regions) renders inside the stage.
    const cabinet = container.querySelector('.cabinet');
    expect(cabinet).not.toBeNull();
    expect(stage).toContainElement(cabinet as HTMLElement);
    expect(cabinet).toContainElement(screen.getByRole('banner'));
    expect(cabinet).toContainElement(screen.getByRole('main'));
  });

  // SPEC-019 (repositioned): the win display lives in an always-present banner
  // band directly under the header title, NOT over the reels. Assert the band
  // exists and sits between the header and the game region (so a win never
  // covers the board). At idle (no win) the band is present but empty.
  it('renders the win banner band between the title and the board', () => {
    const { container } = render(<App />);
    const banner = container.querySelector('.cabinet__winbanner');
    expect(banner).not.toBeNull();

    // DOM order: header → winbanner → game (main). The banner is above the board.
    const cabinet = container.querySelector('.cabinet') as HTMLElement;
    const children = Array.from(cabinet.children);
    const headerIdx = children.findIndex((c) => c.matches('.cabinet__header'));
    const bannerIdx = children.findIndex((c) => c.matches('.cabinet__winbanner'));
    const gameIdx = children.findIndex((c) => c.matches('.cabinet__game'));
    expect(headerIdx).toBeLessThan(bannerIdx);
    expect(bannerIdx).toBeLessThan(gameIdx);

    // At idle there is no win, so the badge (role=status) is not rendered.
    expect(banner?.querySelector('.win-badge')).toBeNull();
  });

  // SPEC-013: Spin control + balance readout wired from the hook.
  it('renders the Spin control and a balance readout', () => {
    render(<App />);
    const spinBtn = screen.getByRole('button', { name: /spin/i });
    expect(spinBtn).toBeInTheDocument();
    expect(spinBtn).not.toBeDisabled();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });
});
