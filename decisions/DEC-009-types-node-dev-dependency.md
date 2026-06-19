---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-009
  type: decision
  confidence: 0.9
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

project:
  id: PROJ-001
repo:
  id: animal-slots

created_at: 2026-06-19
supersedes: null
superseded_by: null

affected_scope:
  - package.json
  - tsconfig.json

tags:
  - tooling
  - testing
  - dependencies
---

# DEC-009: Add `@types/node` (dev) for Node-side test code

## Decision

Add `@types/node` as a **devDependency** and include `"node"` in `tsconfig.json`'s
`types` array, so test files that read source from disk (via `fs`/`path`/
`__dirname`) type-check under strict `tsc --noEmit`. Satisfies the
`no-new-top-level-deps-without-decision` constraint for this addition.

## Context

SPEC-002's token-contract test (`src/styles/tokens.test.ts`) verifies that
`tokens.css` declares the required design tokens by **parsing the CSS source**
(jsdom can't resolve `var()`/computed custom properties, and a Vite `?raw`
import returns an empty string in the jsdom test environment because Vite
transforms CSS first). Reading the file with Node's `fs` in the Vitest Node
runtime is the reliable path, and that needs Node type declarations.

The project's `tsconfig` pins `types: ["vitest/globals", "@testing-library/jest-dom"]`,
so `@types/node` is not picked up implicitly — it must be installed and added to
that list.

## Alternatives Considered

- **Option A: Hand-rolled ambient `.d.ts` stub for `fs`/`path`/`__dirname`**
  - What it is: declare only the few Node signatures the test uses.
  - Why rejected: incomplete and fragile — it only type-checks because
    `skipLibCheck: true` hides that its own `BufferEncoding` reference is
    undefined. Surprising to contributors; conflicts if `@types/node` is added
    later. (This was the initial build attempt; replaced.)

- **Option B: `import css from './tokens.css?raw'`**
  - What it is: import the CSS as a raw string instead of reading from disk.
  - Why rejected: Vite transforms CSS in the jsdom test env before `?raw`
    resolves, yielding an empty string — the test would pass vacuously.

- **Option C (chosen): `@types/node` devDependency + `"node"` in tsconfig types**
  - What it is: the standard, types-only Node typings.
  - Why selected: idiomatic, complete, zero runtime/bundle weight (types only),
    and it is literally the types for the Node runtime Vitest already runs in.

## Consequences

- **Positive:** Test code reads files with correct, complete Node types; no
  fragile hand-rolled shim; standard setup any contributor recognizes.
- **Negative:** Node globals (`process`, `fs`, …) become visible to app code at
  type level too, so a stray Node API in browser code wouldn't be caught by the
  type system. Mitigated by review and the `engine-no-dom` boundary / the app
  being a static SPA with no reason to touch Node APIs.
- **Neutral:** Types-only — nothing ships to the browser bundle.

## Validation

Right if: `tsc --noEmit` stays green and no Node API leaks into shipped browser
code. Revisit if: app code starts (incorrectly) depending on Node globals — then
consider scoping Node types to test files via a separate test tsconfig.

## References

- Related spec: SPEC-002 (design-token sheet)
- Related constraint: `no-new-top-level-deps-without-decision`
- Related decisions: DEC-001 (the test stays out of `src/engine/**`)
