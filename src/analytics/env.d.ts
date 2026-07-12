// env.d.ts — types the one build-config env var this module reads (SPEC-061, DEC-023).
// Mirrors src/build-info.d.ts (which types the Vite `define` constants). Self-contained and ambient
// (no imports/exports): declares import.meta.env with our key so we don't pull in vite/client's full
// env surface. Unset/unrecognized ⇒ 'off' at runtime (see resolveSinkKind).

interface ImportMetaEnv {
  /**
   * Analytics sink selected at BUILD time. Unset or unrecognized ⇒ 'off' (zero-network default).
   * Tier 1 recognizes only 'off'; Tier 2 (GATED) would add 'http' | 'cloudflare'.
   */
  readonly VITE_ANALYTICS_SINK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
