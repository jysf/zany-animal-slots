import '@testing-library/jest-dom';

// Default window.matchMedia mock for jsdom (SPEC-022).
// jsdom does not implement matchMedia; this stub returns matches:false so
// prefersReducedMotion() and any other JS-side media-query checks work without
// throwing. Tests that need a reduced-motion environment replace window.matchMedia
// with a stub returning matches:true and restore the original in afterEach.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
