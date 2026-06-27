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

    // Jackpot 5-of-a-kind = 200×
    expect(screen.getByText(/200/)).toBeTruthy();

    // Low 3-of-a-kind = 0.5×
    expect(screen.getByText(/0\.5/)).toBeTruthy();

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
