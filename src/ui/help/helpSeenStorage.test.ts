// helpSeenStorage tests (SPEC-059). Pinned deterministic storage contract from DEC-022:
// absent/corrupt/wrong-version/non-boolean ⇒ false; round-trips a versioned blob; never throws.
import { HELP_SEEN_KEY, HELP_SEEN_VERSION, readHelpSeen, writeHelpSeen } from './helpSeenStorage';

describe('helpSeenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('HELP_SEEN_KEY is the namespaced key and version is 1', () => {
    expect(HELP_SEEN_KEY).toBe('zany:help-seen');
    expect(HELP_SEEN_VERSION).toBe(1);
  });

  it('readHelpSeen returns false when absent', () => {
    expect(readHelpSeen()).toBe(false);
  });

  it('writeHelpSeen(true) round-trips to true', () => {
    writeHelpSeen(true);
    expect(readHelpSeen()).toBe(true);
    expect(JSON.parse(localStorage.getItem(HELP_SEEN_KEY)!)).toEqual({ version: 1, seen: true });
  });

  it('writeHelpSeen(false) round-trips to false', () => {
    writeHelpSeen(false);
    expect(readHelpSeen()).toBe(false);
  });

  it('readHelpSeen returns false on an unparseable blob (never throws)', () => {
    localStorage.setItem(HELP_SEEN_KEY, 'not json{');
    expect(readHelpSeen()).toBe(false);
  });

  it('readHelpSeen returns false on a version mismatch', () => {
    localStorage.setItem(HELP_SEEN_KEY, JSON.stringify({ version: 999, seen: true }));
    expect(readHelpSeen()).toBe(false);
  });

  it('readHelpSeen returns false on a non-boolean seen', () => {
    localStorage.setItem(HELP_SEEN_KEY, JSON.stringify({ version: 1, seen: 'yes' }));
    expect(readHelpSeen()).toBe(false);
  });

  it('writeHelpSeen never throws when setItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writeHelpSeen(true)).not.toThrow();
    spy.mockRestore();
  });
});
