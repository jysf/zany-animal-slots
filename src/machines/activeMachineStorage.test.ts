// activeMachineStorage unit tests (SPEC-049). Plain Vitest, no DOM/JSX — jsdom
// provides localStorage.
import { ACTIVE_MACHINE_KEY, readActiveMachineId, writeActiveMachineId } from './activeMachineStorage';

describe('activeMachineStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ACTIVE_MACHINE_KEY is the namespaced key', () => {
    expect(ACTIVE_MACHINE_KEY).toBe('zany:active-machine');
  });

  it('read returns null when absent', () => {
    expect(readActiveMachineId()).toBeNull();
  });

  it('write then read round-trips the id', () => {
    writeActiveMachineId('wild-and-whimsical');
    expect(readActiveMachineId()).toBe('wild-and-whimsical');
    expect(localStorage.getItem('zany:active-machine')).toBe('wild-and-whimsical');
  });

  it('read/write never throw when storage is unavailable', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(readActiveMachineId()).toBeNull();
    expect(() => writeActiveMachineId('x')).not.toThrow();

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});
