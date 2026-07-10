// HelpSheet interaction + first-run auto-open tests — SPEC-060 failing tests (written at design).
// render/fireEvent (no user-event). First-run state comes from the SPEC-059 seam: clean storage ⇒
// HelpSeenProvider hydrates seen:false ⇒ auto-open; writeHelpSeen(true) ⇒ no auto-open. The two long
// copy strings are pinned as exact textContent (the deterministic display output for this pure-UI spec).
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpSheet } from './HelpSheet';
import { HelpSeenProvider } from './HelpSeenProvider';
import { readHelpSeen, writeHelpSeen } from './helpSeenStorage';

describe('HelpSheet', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Provider-less (App.test's world): default seen:true ⇒ no auto-open; trigger present.
  it('renders the How to play trigger and does not auto-open without a provider', () => {
    render(<HelpSheet />);
    expect(screen.getByRole('button', { name: /how to play/i })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('auto-opens once on first run and marks seen on dismiss', () => {
    // Clean storage ⇒ provider hydrates seen:false ⇒ the sheet auto-opens with no click.
    render(
      <HelpSeenProvider>
        <HelpSheet />
      </HelpSeenProvider>,
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Auto-open alone does NOT mark seen (DEC-022: mark on first dismiss).
    expect(readHelpSeen()).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(readHelpSeen()).toBe(true);
  });

  it('does not auto-open when already seen', () => {
    writeHelpSeen(true);
    render(
      <HelpSeenProvider>
        <HelpSheet />
      </HelpSeenProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: /how to play/i })).toBeTruthy();
  });

  it('opens on trigger click and shows the how-to-play content', () => {
    writeHelpSeen(true); // suppress auto-open so the trigger path is tested explicitly
    render(
      <HelpSeenProvider>
        <HelpSheet />
      </HelpSeenProvider>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /how to play/i }));

    expect(screen.getByRole('dialog')).toBeTruthy();
    // Pinned display copy (the deterministic output for this pure-UI spec).
    expect(screen.getByTestId('help-goal').textContent).toBe(
      'Spin the reels and match animals left-to-right. Line up 3 or more of the same animal starting from the leftmost reel on a payline to win.',
    );
    expect(screen.getByTestId('help-disclaimer').textContent).toBe(
      'Zany Animal Slots is play-money only — no real money, no wagering, no payouts.',
    );
    // The four controls are explained (U+2212 minus, matching the bet button).
    expect(screen.getByText('Spin')).toBeTruthy();
    expect(screen.getByText('− / +')).toBeTruthy();
    expect(screen.getByText('Auto')).toBeTruthy();
    expect(screen.getByText('Reset')).toBeTruthy();
    // Points to the Paytable rather than re-listing payouts.
    expect(screen.getByText(/what each animal pays/i)).toBeTruthy();
  });

  it('closes on the ✕ button, backdrop, and Escape', () => {
    writeHelpSeen(true);
    render(
      <HelpSeenProvider>
        <HelpSheet />
      </HelpSeenProvider>,
    );
    const trigger = screen.getByRole('button', { name: /how to play/i });

    // ✕
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();

    // backdrop
    fireEvent.click(trigger);
    fireEvent.click(screen.getByTestId('help-backdrop'));
    expect(screen.queryByRole('dialog')).toBeNull();

    // Escape
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
