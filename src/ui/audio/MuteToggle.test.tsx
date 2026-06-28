// Tests for MuteToggle (SPEC-026).
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import MuteToggle from './MuteToggle';

describe('MuteToggle', () => {
  it('reflects muted state via aria-pressed', () => {
    const { rerender } = render(<MuteToggle muted onToggle={() => {}} />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn.textContent).toContain('🔇');

    rerender(<MuteToggle muted={false} onToggle={() => {}} />);
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn.textContent).toContain('🔊');
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<MuteToggle muted={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('defines a ≥44px touch target with no raw hex', () => {
    const cssPath = resolve(__dirname, 'audio.css');
    const css = readFileSync(cssPath, 'utf8');

    // Must contain .mute-toggle selector
    expect(css).toMatch(/\.mute-toggle/);

    // Must declare min-height and min-width (touch-targets-44 constraint)
    expect(css).toMatch(/min-height\s*:/);
    expect(css).toMatch(/min-width\s*:/);

    // Must not contain raw hex color literals
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
