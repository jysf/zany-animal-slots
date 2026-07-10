// HelpSeenProvider / useHelpSeen tests (SPEC-059). renderHook + act, no
// @testing-library/user-event in this repo's toolchain — a `wrapper` supplies
// the provider where needed. Mirrors StatsProvider.test.tsx.
import { renderHook, act } from '@testing-library/react';
import { HelpSeenProvider, useHelpSeen } from './HelpSeenProvider';
import { readHelpSeen, writeHelpSeen } from './helpSeenStorage';

describe('HelpSeenProvider / useHelpSeen', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('useHelpSeen without a provider returns seen:true and a no-op markSeen', () => {
    const { result } = renderHook(() => useHelpSeen());
    expect(result.current.seen).toBe(true);
    act(() => {
      result.current.markSeen();
    });
    expect(result.current.seen).toBe(true);
    // No provider => nothing persisted.
    expect(readHelpSeen()).toBe(false);
  });

  it('provider hydrates seen:false from clean storage', () => {
    const { result } = renderHook(() => useHelpSeen(), { wrapper: HelpSeenProvider });
    expect(result.current.seen).toBe(false);
  });

  it('provider hydrates seen:true from a seeded flag', () => {
    writeHelpSeen(true);
    const { result } = renderHook(() => useHelpSeen(), { wrapper: HelpSeenProvider });
    expect(result.current.seen).toBe(true);
  });

  it('markSeen flips seen to true and persists', () => {
    const { result } = renderHook(() => useHelpSeen(), { wrapper: HelpSeenProvider });
    expect(result.current.seen).toBe(false);
    act(() => {
      result.current.markSeen();
    });
    expect(result.current.seen).toBe(true);
    expect(readHelpSeen()).toBe(true);
    act(() => {
      result.current.markSeen();
    });
    expect(result.current.seen).toBe(true);
  });
});
