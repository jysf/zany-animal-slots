import { renderHook, act } from '@testing-library/react';
import { HelpSeenProvider, useHelpSeen } from './HelpSeenProvider';
import { setSink, resetSink } from '../../analytics';
import type { TrackedEvent } from '../../analytics';

describe('HelpSeenProvider analytics tap', () => {
  let events: TrackedEvent[];
  beforeEach(() => {
    localStorage.clear();
    events = [];
    setSink({ track: (t) => events.push(t), flush: () => {} });
  });
  afterEach(() => resetSink());

  it('emits help_seen once, on the first mark', () => {
    const { result } = renderHook(() => useHelpSeen(), { wrapper: HelpSeenProvider });
    act(() => result.current.markSeen());
    expect(events.filter((e) => e.event.type === 'help_seen')).toHaveLength(1);
    act(() => result.current.markSeen());
    expect(events.filter((e) => e.event.type === 'help_seen')).toHaveLength(1);
  });
});
