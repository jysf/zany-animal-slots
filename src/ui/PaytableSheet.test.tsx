// PaytableSheet interaction tests — SPEC-020 failing tests (written at design).
// Uses fireEvent (not userEvent) per spec; no fake timers needed.

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaytableSheet } from './PaytableSheet';

describe('PaytableSheet', () => {
  it('is closed by default', () => {
    render(<PaytableSheet />);

    // No dialog in the DOM yet.
    expect(screen.queryByRole('dialog')).toBeNull();

    // But the trigger button is present.
    expect(screen.getByRole('button', { name: /paytable/i })).toBeTruthy();
  });

  it('opens on trigger click and shows tier payouts', () => {
    render(<PaytableSheet />);

    const trigger = screen.getByRole('button', { name: /paytable/i });
    fireEvent.click(trigger);

    // Dialog is now in the DOM.
    expect(screen.getByRole('dialog')).toBeTruthy();

    // Jackpot 5-of-a-kind = 250× (DEC-016 retune)
    expect(screen.getByText(/250/)).toBeTruthy();

    // Low 3-of-a-kind = 1× (DEC-016 retune) — the multiplier renders as "1×" in one span.
    expect(screen.getByText(/^1×$/)).toBeTruthy();

    // Wolf emoji (jackpot tier)
    expect(screen.getByText(/🐺/)).toBeTruthy();

    // Deer emoji (low tier)
    expect(screen.getByText(/🦌/)).toBeTruthy();
  });

  it('closes on the ✕ button', () => {
    render(<PaytableSheet />);

    // Open it.
    fireEvent.click(screen.getByRole('button', { name: /paytable/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    // Click the close button.
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('explains how wins work (left-anchored payline rule)', () => {
    render(<PaytableSheet />);
    fireEvent.click(screen.getByRole('button', { name: /paytable/i }));

    const rules = screen.getByRole('region', { name: /how wins work/i });
    // The two facts a player needs to make sense of a near-miss:
    expect(rules.textContent).toMatch(/left-to-right/i);
    expect(rules.textContent).toMatch(/leftmost reel/i);
    // And the minimum run length is stated.
    expect(rules.textContent).toMatch(/3\+/);
  });

  it('shows the app version + build id in the About section', () => {
    render(<PaytableSheet />);
    fireEvent.click(screen.getByRole('button', { name: /paytable/i }));

    const version = screen.getByTestId('app-version');
    // Vite `define` replaces __APP_VERSION__ with the package.json version.
    expect(version.textContent).toMatch(/v\d+\.\d+\.\d+/);
    // A build id (short SHA or 'unknown') is present alongside the version.
    expect(version.textContent).toMatch(/·/);
  });

  it('closes on backdrop click', () => {
    render(<PaytableSheet />);

    // Open it.
    fireEvent.click(screen.getByRole('button', { name: /paytable/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    // Click the backdrop element.
    const backdrop = document.querySelector('[data-testid="paytable-backdrop"]')!;
    fireEvent.click(backdrop);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Escape', () => {
    render(<PaytableSheet />);

    // Open it.
    fireEvent.click(screen.getByRole('button', { name: /paytable/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    // Fire Escape on the document.
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
