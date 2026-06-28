// prefersReducedMotion — defensive wrapper around window.matchMedia (SPEC-022).
// Returns false when matchMedia is unavailable (SSR, jsdom without mock) so
// callers get a safe default without throwing. The JS-side check is needed
// because the count-up is a setInterval tween, not a CSS animation (DEC-012).
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
