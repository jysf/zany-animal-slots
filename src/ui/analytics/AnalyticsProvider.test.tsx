import { render } from '@testing-library/react';
import { AnalyticsProvider } from './AnalyticsProvider';
import { setSink, resetSink, resetSessionStarted, emitSessionStart } from '../../analytics';
import type { TrackedEvent } from '../../analytics';

describe('AnalyticsProvider', () => {
  afterEach(() => {
    resetSink();
    resetSessionStarted();
    vi.restoreAllMocks();
  });

  it('renders its children', () => {
    const { getByTestId } = render(
      <AnalyticsProvider>
        <div data-testid="child">hi</div>
      </AnalyticsProvider>,
    );
    expect(getByTestId('child')).toBeInTheDocument();
  });

  it('consumes the one-shot session_start on mount', () => {
    resetSessionStarted();
    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>,
    );
    // the provider already fired session_start; a fresh spy must NOT receive another
    const seen: TrackedEvent[] = [];
    setSink({ track: (t) => seen.push(t), flush: () => {} });
    emitSessionStart();
    expect(seen).toHaveLength(0);
  });

  it('flushes on pagehide', () => {
    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>,
    );
    const flushSpy = vi.fn();
    setSink({ track: () => {}, flush: flushSpy });
    window.dispatchEvent(new Event('pagehide'));
    expect(flushSpy).toHaveBeenCalled();
  });
});
