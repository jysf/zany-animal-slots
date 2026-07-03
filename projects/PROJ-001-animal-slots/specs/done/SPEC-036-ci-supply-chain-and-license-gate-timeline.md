# SPEC-036 timeline

Architect appends as cycles are designed. Executors update status as
they go. Status markers: `[ ]` not started · `[~]` in progress · `[x]` complete · `[?]` blocked.

Cycle prompts live in `prompts/SPEC-036-<cycle>.md`.

## Instructions

- [x] **design** — completed 2026-07-03 (Opus): scanned the installed license set (all permissive; 1 exception caniuse-lite CC-BY-4.0) + spec (dependency-free scanner + npm audit, CI job + just recipes) + failing tests + build prompt. Second [REPO] spec.
- [x] **build** — completed 2026-07-03: license-check.mjs + recipes + CI supply-chain job + 8 tests; eslint Node-globals block for scripts/. Gate green (265 tests, license-check 0 violations, audit 0 vulns). Original Sonnet sub-agent was killed mid-run; orchestrator (Opus) validated + finished. PR #36. Local branch feat/spec-036-supply-chain-gate.
- [x] **verify** — completed 2026-07-03 (Sonnet sub-agent): cold review — full gate re-run + function-level scanner probe + engine-freeze/no-new-dep checks. VERDICT PASS, 0 defects. subagent_tokens=46226, 410s.
- [x] **ship** — completed 2026-07-03 (Opus): squash-merged PR #36 (CI CLEAN — cost-capture, app-checks, supply-chain all green), cost totals (91226 tok / $0.61 / 5 sessions), ship reflection, archived. Second STAGE-006 [REPO] spec (2/6).
