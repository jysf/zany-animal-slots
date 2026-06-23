// Tests for the Action region (SPEC-013, extended SPEC-014, SPEC-015).
// SPEC-013: Spin button enabled/disabled behavior.
// SPEC-014: Bet − / + buttons wired to handlers, disabled per flags.
// SPEC-015: Reset button wired to onReset handler.
import { render, screen, fireEvent } from '@testing-library/react';
import Action from './Action';

// Default bet+reset props used in every Spin-focused test so they satisfy the
// new required props without repeating them.
const defaultBetProps = {
  onBetDown: vi.fn(),
  onBetUp: vi.fn(),
  canBetDown: true,
  canBetUp: true,
  onReset: vi.fn(),
};

describe('Action', () => {
  it('renders an enabled Spin button that calls onSpin', () => {
    const onSpin = vi.fn();
    render(<Action onSpin={onSpin} canSpin {...defaultBetProps} />);
    const btn = screen.getByRole('button', { name: /spin/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onSpin).toHaveBeenCalledTimes(1);
  });

  it('disables Spin when canSpin is false', () => {
    const onSpin = vi.fn();
    render(<Action onSpin={onSpin} canSpin={false} {...defaultBetProps} />);
    const btn = screen.getByRole('button', { name: /spin/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onSpin).not.toHaveBeenCalled();
  });

  // ── SPEC-014: bet buttons ───────────────────────────────────────────────────

  it('renders bet − and + buttons wired to handlers', () => {
    const onBetDown = vi.fn();
    const onBetUp = vi.fn();
    render(
      <Action
        onSpin={vi.fn()}
        canSpin
        onBetDown={onBetDown}
        onBetUp={onBetUp}
        canBetDown
        canBetUp
        onReset={vi.fn()}
      />,
    );

    const decBtn = screen.getByRole('button', { name: /decrease bet/i });
    const incBtn = screen.getByRole('button', { name: /increase bet/i });

    expect(decBtn).not.toBeDisabled();
    expect(incBtn).not.toBeDisabled();

    fireEvent.click(decBtn);
    expect(onBetDown).toHaveBeenCalledTimes(1);

    fireEvent.click(incBtn);
    expect(onBetUp).toHaveBeenCalledTimes(1);
  });

  it('disables bet buttons per can-bet flags', () => {
    render(
      <Action
        onSpin={vi.fn()}
        canSpin
        onBetDown={vi.fn()}
        onBetUp={vi.fn()}
        canBetDown={false}
        canBetUp={false}
        onReset={vi.fn()}
      />,
    );

    const decBtn = screen.getByRole('button', { name: /decrease bet/i });
    const incBtn = screen.getByRole('button', { name: /increase bet/i });

    expect(decBtn).toBeDisabled();
    expect(incBtn).toBeDisabled();
  });

  // ── SPEC-015: Reset button ─────────────────────────────────────────────────

  it('renders a Reset button that calls onReset', () => {
    const onReset = vi.fn();
    render(
      <Action
        onSpin={vi.fn()}
        canSpin
        {...defaultBetProps}
        onReset={onReset}
      />,
    );
    const btn = screen.getByRole('button', { name: /reset/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
