---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-003
  type: decision
  confidence: 0.85
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

created_at: 2026-06-18
supersedes: null
superseded_by: null

affected_scope:
  - src/engine/paylines.ts

tags:
  - engine
  - game-design
  - paylines
---

# DEC-003: Fixed set of five paylines for v1

## Decision

v1 evaluates a fixed set of five paylines, evaluated left-to-right from reel 0,
paying on 3+ consecutive matching symbols. A spin may hit multiple lines; total
win is the sum of all line wins. Configurable/selectable paylines are deferred.

The five lines (row per reel, reels 0→4):

| Line | Pattern | Shape |
|---|---|---|
| L1 | 1, 1, 1, 1, 1 | middle |
| L2 | 0, 0, 0, 0, 0 | top |
| L3 | 2, 2, 2, 2, 2 | bottom |
| L4 | 0, 1, 2, 1, 0 | V |
| L5 | 2, 1, 0, 1, 2 | ^ |

## Context

A slot needs paylines, but configurable lines add UI (line selection, per-line
bet) and engine complexity that does not serve the MVP's goals. Five fixed lines
give visually distinct, recognizable win patterns (rows + two chevrons) while
keeping evaluation small and easy to test.

## Alternatives Considered

- **Option A: Single center line**
  - Why rejected: too few wins to feel like a slot; little visual variety.

- **Option B: Configurable / player-selected lines (e.g. 20+ lines)**
  - Why rejected: substantial added UI and engine state for no MVP value;
    deferred to a possible follow-up.

- **Option C (chosen): Five fixed lines (3 rows + V + ^)**
  - Why selected: enough variety for fun and distinct paw-print trails, small
    enough to evaluate and unit-test exhaustively.

## Consequences

- **Positive:** Simple, fully testable evaluation; clear celebration trails.
- **Negative:** No per-line betting or line selection; some classic slot feel
  (choosing lines) is absent.
- **Neutral:** Splitting per-symbol payouts within a tier, or adding lines, is a
  clean future spec — the evaluation shape does not preclude it.

## Validation

Right if: payline evaluation stays small and exhaustively tested, and players
read the win patterns clearly. Revisit if: playtesting shows five lines feel too
sparse or too dense.

## References

- Game rules: `/projects/PROJ-001-animal-slots/brief.md` (Game-Design Spec section)
- Related decisions: DEC-001, DEC-002, DEC-011 (paytable + reel-strip weights)
