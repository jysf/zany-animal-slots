// Tests for muteStorage.ts (SPEC-026).
// Each test gets a clean localStorage state via beforeEach.
import { MUTE_KEY, readMute, writeMute } from './muteStorage';

describe('muteStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to muted (true) when absent — quiet by default (DEC-025)', () => {
    expect(readMute()).toBe(true);
  });

  it('an explicit "false" un-mutes (a stored preference is honored)', () => {
    localStorage.setItem(MUTE_KEY, 'false');
    expect(readMute()).toBe(false);
  });

  it('round-trips true', () => {
    writeMute(true);
    expect(readMute()).toBe(true);
    expect(localStorage.getItem(MUTE_KEY)).toBe('true');
  });

  it('round-trips false', () => {
    writeMute(false);
    expect(readMute()).toBe(false);
    expect(localStorage.getItem(MUTE_KEY)).toBe('false');
  });

  it('treats any value other than "false" as muted', () => {
    localStorage.setItem(MUTE_KEY, 'x');
    expect(readMute()).toBe(true);
  });
});
