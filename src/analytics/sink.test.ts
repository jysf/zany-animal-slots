// src/analytics/sink.test.ts — the Sink interface, noop, and config gate (SPEC-061). Plain Vitest.
import { noopSink, resolveSinkKind, createSink } from './sink';

describe('noopSink', () => {
  it('track/flush are no-ops that return undefined and never throw', () => {
    expect(() => noopSink.track({ type: 'session_start' })).not.toThrow();
    expect(() => noopSink.flush()).not.toThrow();
    expect(noopSink.track({ type: 'session_start' })).toBeUndefined();
    expect(noopSink.flush()).toBeUndefined();
  });
});

describe('resolveSinkKind', () => {
  it('returns off when unset, empty, or unrecognized', () => {
    expect(resolveSinkKind(undefined)).toBe('off');
    expect(resolveSinkKind('')).toBe('off');
    expect(resolveSinkKind('http')).toBe('off'); // a Tier-2 kind is NOT honored in Tier 1
    expect(resolveSinkKind('cloudflare')).toBe('off');
    expect(resolveSinkKind('nonsense')).toBe('off');
  });

  it('recognizes an explicit off', () => {
    expect(resolveSinkKind('off')).toBe('off');
  });
});

describe('createSink', () => {
  it('returns the noopSink instance for off and by default', () => {
    expect(createSink('off')).toBe(noopSink);
    expect(createSink()).toBe(noopSink);
  });
});
