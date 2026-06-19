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
});
