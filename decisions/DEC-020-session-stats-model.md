---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-020
  type: decision
  confidence: 0.85
  audience:
    - developer
    - agent

agent:
  id: claude-opus-4-8
  session_id: null

# Emitted during PROJ-002 / STAGE-009 (the session-stats model, SPEC-054).
project:
  id: PROJ-002
repo:
  id: animal-slots

created_at: 2026-07-08
supersedes: null
superseded_by: null

affected_scope:
  - src/stats/**

tags:
  - stats
  - model
  - persistence
  - metrics
---

# DEC-020: The session-stats model — a cash-in is a wallet Reset, metrics are aggregate, progress is cumulative-net, persisted as one bounded versioned blob

## Decision

STAGE-009 records **aggregate** (not per-machine) play-money session stats in a pure,
engine-independent model under `src/stats/`, with these fixed semantics:

- **A "cash-in" = one wallet Reset press** (the play-money analog of buying back in). It is
  *counted*, never *cleared*, by clearing stats — the two resets are independent.
- **Metrics:** `net winnings = totalWon − totalWagered`; `win rate = winningSpins ÷ spins`
  (0 when `spins === 0`); a **winning spin** is `totalWin > 0`; `biggest win` is the largest
  single-spin `totalWin`, recorded with the `machineId` and `tier` that produced it.
- **Winnings-over-time series:** a per-spin series of **cumulative net winnings**
  (`totalWon − totalWagered` after each spin), **bounded to the last 200 points, FIFO
  drop-oldest**. Cash-ins do NOT append a point and do NOT affect net.
- **Persistence:** a **single versioned JSON blob** under one `localStorage` key
  (`zany:stats`), read/written best-effort and **never throwing** (DEC-005); an
  absent / corrupt / wrong-version blob degrades to `emptyStats()`.

## Context

STAGE-009 makes the now-fun four-machine game's progress **visible and measurable** to the
player with a client-only session-stats panel (brief §"a visible sense of progress"). SPEC-054
is the model keystone: a pure reducer set (`emptyStats`/`recordSpin`/`recordCashIn`/
`deriveMetrics`) plus safe persistence, over which SPEC-055 (reactive context + recording seam),
SPEC-056 (panel UI), and SPEC-057 (sparkline) build. The model carries cross-cutting semantic
choices those specs — and STAGE-011 analytics, and any future per-machine breakdown — will
inherit, so they are pinned here rather than rediscovered per spec.

Constraints: DEC-001 (engine untouched — recording reads the `SpinResult` the engine already
returns); DEC-005 (no backend — `localStorage` only, best-effort, never throws). The current
app has a **wallet Reset** button (`useSlotMachine.reset()` → `STARTING_BALANCE`) and no
auto-reset-on-zero and no explicit "Collect" — this grounds the cash-in definition.

## Alternatives Considered

- **Scope — per-machine breakdown**
  - What it is: keep counters keyed by machine id so the panel can compare machines.
  - Why rejected (for now): multiplies UI + storage for marginal value before analytics
    (STAGE-011) shows machine-switching behavior. Mitigation: the blob is **versioned** and
    shaped so a `perMachine` dimension can be added later without breaking stored data, and we
    already retain the machine id of the biggest win. Aggregate-across-machines ships this stage.

- **Cash-in definition — auto-reset on balance = 0, or an explicit "Collect" action**
  - What it is: count an automatic bankruptcy reset, or a new "cash out winnings" control.
  - Why rejected: neither behavior/control exists in the code today; inventing one is scope
    the brief didn't ask for. The wallet Reset is the only real "give me more chips" event,
    so it is the countable cash-in — no new UI required.

- **Winnings-over-time axis — raw balance per spin**
  - What it is: plot `SpinResult.balance` each spin.
  - Why rejected: balance jumps discontinuously on every cash-in (Reset restores
    `STARTING_BALANCE`), so the "progress" line would show cliffs that aren't wins or losses.
    **Cumulative net winnings** is cash-in-independent and is the honest progress signal.

- **Series bound — unbounded, or downsample-on-overflow**
  - What it is: keep every point, or average buckets when large.
  - Why rejected: unbounded grows `localStorage` without limit over a long session;
    downsampling adds complexity and distorts recent detail. **Cap at the last 200 points,
    FIFO** is simple, ~<2 KB, and preserves the most-relevant recent trajectory. (Chosen:
    `SERIES_CAP = 200`, drop-oldest.)

- **Persistence — many keys vs one blob (chosen)**
  - What it is: one `localStorage` key per counter vs a single JSON blob.
  - Why one blob: atomic, simpler, forward-compatible via a `version` field; a corrupt/absent/
    wrong-version blob cleanly degrades to `emptyStats()`. Reuses the `zany:*` namespace
    SPEC-049 reserved (`zany:active-machine`) precisely to avoid a stats-key collision.

## Consequences

- **Positive:** SPEC-055–057 are a thin reactive-seam + UI over a tested pure model; STAGE-011
  analytics can sample the same in-memory record and event seam; the versioned blob leaves room
  for a per-machine dimension without a migration.
- **Negative:** aggregate-only stats can't answer "which machine pays best" until a later spec;
  the 200-point cap means a very long session's early trajectory scrolls off the sparkline.
- **Neutral:** net excludes cash-ins by construction — "net winnings" measures play outcome,
  not wallet top-ups; the cash-in counter reports top-ups separately.

## Validation

Right if SPEC-055–057 need no new model decisions and the panel reads cleanly from
`deriveMetrics` + the series. Revisit if: players want per-machine stats (add the versioned
dimension), the 200-point window feels too short in practice, or STAGE-011 needs an event shape
the reducers don't already produce.

## References

- Related specs: SPEC-054 (this model), SPEC-055/056/057 (seam + UI over it), SPEC-049 (the
  `zany:*` namespace + Context-over-localStorage pattern reused)
- Related decisions: DEC-001 (engine-no-dom), DEC-005 (no backend / never-throw storage)
- External docs: none
