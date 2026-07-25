---
task:
  id: SPEC-088
  type: story
  cycle: ship
  blocked: false
  priority: low
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
    - DEC-001
    - DEC-010
  constraints:
    - touch-targets-44
    - respect-reduced-motion
  related_specs: []
value_link: "An in-app 'What's new' changelog so players can see what changed."
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: >-
        User request. Bundled on the PROJ-004 branch at the owner's explicit ask ('dump it into
        proj-004'), though it is NOT thematically an ad feature. Data stored as JSON per the owner.
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 22000
      estimated_usd: 0.44
      recorded_at: 2026-07-24
      note: >-
        releases.json (Vite native JSON import — no dependency, no markdown renderer), ChangelogSheet
        (footer 'What's new · vX' link → sheet listing releases with version chip/date/highlights),
        changelog.css (tokens only), a .cabinet__footer. Verified on a real render: link + 3 releases.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 8000
      estimated_usd: 0.16
      recorded_at: 2026-07-24
      note: "Real render: footer link opens the sheet, 3 releases from JSON render styled to match. 0 defects."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-24
      note: "main-loop ship; PROJ-004 draft branch."
  totals:
    tokens_total: 30000
    estimated_usd: 0.60
    session_count: 4
---

# SPEC-088: In-app changelog ("What's new")

## Goal
A small "What's new" link at the bottom of the cabinet that opens a sheet listing player-facing
releases, sourced from a JSON file (no new dependency).

## Outputs
- `src/ui/changelog/releases.json` — the release data (version, date, title, highlights[]).
- `src/ui/changelog/ChangelogSheet.tsx` — footer link + sheet (Esc/backdrop/focus like StatsSheet).
- `src/ui/changelog/changelog.css` — tokens only.
- `App.tsx` — `.cabinet__footer` with the trigger; `regions.css` footer style.

## Notes
Bundled on the PROJ-004 branch at the owner's request; it is a general app feature, not an ad one.
Data lives in JSON (owner's choice) — Vite imports it natively; RELEASES.md stays the prose doc.
Keep both in sync at project ship (a natural add to the ship ritual).

## Acceptance
- [x] Footer "What's new · vX" link opens a sheet listing releases from releases.json, styled to
      match (version chip, date, highlights). No new dependency. Tokens only; ≥44px close. Gate green.
