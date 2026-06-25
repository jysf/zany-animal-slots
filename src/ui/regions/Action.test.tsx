// Tests for the Action region (SPEC-013, extended SPEC-014, SPEC-015, SPEC-016, SPEC-017).
// SPEC-013: Spin button enabled/disabled behavior.
// SPEC-014: Bet − / + buttons wired to handlers, disabled per flags.
// SPEC-015: Reset button wired to onReset handler.
// SPEC-016: all controls disabled while spinning.
// SPEC-017: Auto toggle button — calls onToggleAuto, reflects autoSpinning state;
//           Spin/bet/Reset are disabled while auto-spinning.
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

  // ── SPEC-016: all controls disabled while spinning ─────────────────────────

  it('disables all controls while spinning', () => {
    render(
      <Action
        onSpin={vi.fn()}
        canSpin
        onBetDown={vi.fn()}
        onBetUp={vi.fn()}
        canBetDown
        canBetUp
        onReset={vi.fn()}
        isSpinning
      />,
    );

    expect(screen.getByRole('button', { name: /spin/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /decrease bet/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /increase bet/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
  });

  // ── SPEC-017: Auto toggle ──────────────────────────────────────────────────

  it('renders an Auto toggle that calls onToggleAuto', () => {
    const onToggleAuto = vi.fn();
    render(
      <Action
        onSpin={vi.fn()}
        canSpin
        {...defaultBetProps}
        autoSpinning={false}
        onToggleAuto={onToggleAuto}
      />,
    );
    const autoBtn = screen.getByRole('button', { name: /auto/i });
    expect(autoBtn).not.toBeDisabled();
    fireEvent.click(autoBtn);
    expect(onToggleAuto).toHaveBeenCalledTimes(1);
  });

  it('reflects the auto-spinning state with aria-pressed and label', () => {
    render(
      <Action
        onSpin={vi.fn()}
        canSpin
        {...defaultBetProps}
        autoSpinning
        onToggleAuto={vi.fn()}
      />,
    );
    // When auto is active the button label changes to "Stop".
    const autoBtn = screen.getByRole('button', { name: /stop auto-spin/i });
    expect(autoBtn).toHaveAttribute('aria-pressed', 'true');
    // The Auto button stays enabled (it's the escape hatch).
    expect(autoBtn).not.toBeDisabled();
  });

  it('disables Spin, bet, and Reset while auto-spinning', () => {
    render(
      <Action
        onSpin={vi.fn()}
        canSpin
        onBetDown={vi.fn()}
        onBetUp={vi.fn()}
        canBetDown
        canBetUp
        onReset={vi.fn()}
        autoSpinning
        onToggleAuto={vi.fn()}
      />,
    );
    // Use exact name 'Spin' to avoid collision with 'Stop auto-spin' aria-label.
    expect(screen.getByRole('button', { name: 'Spin' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /decrease bet/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /increase bet/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
    // Auto button itself must remain enabled.
    expect(screen.getByRole('button', { name: /stop auto-spin/i })).not.toBeDisabled();
  });
});
