// Updated for SPEC-003: tests the four-region cabinet structure.
// The "Animal Slots" accessible name moves from <main aria-label> to the
// <h1> heading inside the <header> banner region.
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
});
