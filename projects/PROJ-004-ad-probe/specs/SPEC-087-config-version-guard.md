---
task:
  id: SPEC-087
  type: bug
  cycle: ship
  blocked: false
  priority: medium
  complexity: S
project:
  id: PROJ-004
  stage: STAGE-017
repo:
  id: animal-slots
agents:
  architect: claude-opus-4-8
  implementer: claude-opus-4-8
  created_at: 2026-07-24
references:
  decisions:
    - DEC-005
  constraints: []
  related_specs:
    - SPEC-084
value_link: "A version guard so a redeployed default actually reaches testers who once touched the panel — the committed-default model depends on it."
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: "Surfaced while reviewing PROJ-004; built inline."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 18000
      estimated_usd: 0.36
      recorded_at: 2026-07-24
      note: >-
        Added AD_CONFIG_VERSION + version on AdConfig/DEFAULT_AD_CONFIG. readAdConfig discards a
        stored override whose version != AD_CONFIG_VERSION (and clears it), so bumping the constant
        on a redeploy overrides testers pinned to a saved override. Copy-as-default emits
        version: AD_CONFIG_VERSION and the panel note says to bump it. 2 new tests.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 8000
      estimated_usd: 0.16
      recorded_at: 2026-07-24
      note: "Tests: stale-version + unversioned overrides discarded (and cleared); current-version partial still gap-fills. 0 defects."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-24
      note: "main-loop ship; PROJ-004 draft branch."
  totals:
    tokens_total: 26000
    estimated_usd: 0.52
    session_count: 4
---

# SPEC-087: Ad-config version guard

## The bug
A per-browser override always beat the committed default, with no version check — so a tester who
opened the panel once was pinned to their localStorage forever and never saw a redeployed default.
That silently defeats the "committed default + redeploy" model the owner chose (SPEC-084).

## Fix
- `AD_CONFIG_VERSION` + `version` on `AdConfig`/`DEFAULT_AD_CONFIG`.
- `readAdConfig` discards (and clears) a stored override whose `version` !== `AD_CONFIG_VERSION`,
  returning the committed default. Bump the constant on a redeploy to override existing testers.
- `Copy as default` emits `version: AD_CONFIG_VERSION`; panel note says to bump it.

## Acceptance
- [x] Stale-version and unversioned overrides are discarded (and cleared); the committed default
      wins. A current-version-but-partial blob still gap-fills. Engine/audio diffs empty; gate green.
