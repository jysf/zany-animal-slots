// Tests for muteStorage.ts (SPEC-026).
// Each test gets a clean localStorage state via beforeEach.
import { MUTE_KEY, readMute, writeMute } from './muteStorage';

describe('muteStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to false when absent', () => {
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
  });

  it('treats any non-"true" value as false', () => {
    localStorage.setItem(MUTE_KEY, 'x');
    expect(readMute()).toBe(false);
  });
});
