# SPEC-037 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-037-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-03 (Opus): replace the scaffold-default SECURITY.md with the deployed posture (play-money, no PII, no backend, client-only) + coordinated-disclosure policy; document the headers/HSTS split (headers in _headers/SPEC-035, HSTS at the Cloudflare zone). Root-level SECURITY.contract.test.ts (import.meta.url, no `process`) asserts the required sections + posture/HSTS/reporting claims. Failing tests + build prompt written. Third and last [REPO] spec before the [OPS] handoff.
- [~] **build** — Sonnet sub-agent; rewrote SECURITY.md (deployed posture + disclosure) + added root SECURITY.contract.test.ts (5 tests); gate green (270 tests). Local branch feat/spec-037-security-md. Orchestrator validated the gate.
- [ ] **verify** — Sonnet sub-agent; cold review against ACs + constraints.
- [ ] **ship** — orchestrator (Opus): squash-merge, cost totals, archive; then STOP at the credential boundary and hand off the three [OPS] specs.
