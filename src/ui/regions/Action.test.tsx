// Tests for the Action region (SPEC-013): Spin button enabled/disabled behavior.
import { render, screen, fireEvent } from '@testing-library/react';
import Action from './Action';

describe('Action', () => {
  it('renders an enabled Spin button that calls onSpin', () => {
    const onSpin = vi.fn();
    render(<Action onSpin={onSpin} canSpin />);
    const btn = screen.getByRole('button', { name: /spin/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onSpin).toHaveBeenCalledTimes(1);
  });

  it('disables Spin when canSpin is false', () => {
    const onSpin = vi.fn();
    render(<Action onSpin={onSpin} canSpin={false} />);
    const btn = screen.getByRole('button', { name: /spin/i });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onSpin).not.toHaveBeenCalled();
  });
});
