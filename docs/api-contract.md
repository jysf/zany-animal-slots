# API Contract

**Not applicable.** Animal Slots makes no network calls and exposes no external
API. It is a static SPA that runs entirely in the browser.

The only "contract" in this app is the **engine's typed public interface**
(`src/engine/index.ts`) that the presentation layer consumes — a TypeScript
boundary, not an HTTP one. It is described in `architecture.md` (Boundaries and
Interfaces) and governed by `DEC-001` (engine/presentation separation). The
engine returns a plain-data `SpinResult`; nothing else crosses the boundary.

If a future project (e.g. PROJ-002) adds accounts, leaderboards, or a backend,
replace this file with the real contract at that time.
