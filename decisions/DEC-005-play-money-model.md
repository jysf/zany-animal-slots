---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-005
  type: decision
  confidence: 0.98
  audience:
    - executive
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

# Repo-wide policy, not bound to specific files. The no-real-money
# constraint (paths ["**"]) is the mechanical mirror of this decision.
affected_scope: []

tags:
  - policy
  - play-money
  - compliance
  - game-design
---

# DEC-005: Play-money model — no real currency, wagering, or purchases; no RTP claim

## Decision

Animal Slots is play-money only. There is no real currency, no wagering of real
money, and no purchases or payments of any kind, ever. Balance and Reset are
local-only (a `localStorage` number; Reset restores 1000). Reel-strip weights
are tuned for *feel* — wins land often enough to be fun, and balance drifts down
over a long session — **not** to a regulated return-to-player (RTP) figure. We
do not advertise an RTP number.

## Context

A slot game touches a heavily regulated domain the moment real money is
involved. Keeping the model strictly play-money sidesteps that entirely and
keeps the project a clean dogfood/demo vehicle. It also sets an ethical floor:
the math is for fun, and (per the project taste note) celebration/anticipation
must reflect symbols that actually landed — no engineered near-misses that fake
closeness to a jackpot, even with play money.

## Alternatives Considered

- **Option A: Real-money or purchasable coins (IAP)**
  - Why rejected: pulls in gambling/payment regulation, age-gating, and
    liability for zero MVP benefit. Hard out of scope.

- **Option B: Play-money but advertise a specific RTP %**
  - Why rejected: implies a regulated-style guarantee we are not making and do
    not tune for; invites mis-set expectations. We tune for feel and say so.

- **Option C (chosen): Play-money, local balance, feel-tuned weights, no RTP claim**
  - Why selected: maximal fun and demo value, zero regulatory surface, honest
    framing.

## Consequences

- **Positive:** No payment/regulatory surface; free to tune for fun; ethically
  clean.
- **Negative:** No monetization path in this project (intentional).
- **Neutral:** If a future project ever wanted real money, it would be a new
  project with its own legal/compliance design — not an extension of this one.

## Validation

Right if: nothing in the repo ever touches real currency or payment rails, and
no RTP figure is published. Revisit only via a deliberate, separately-scoped
future project — never incrementally.

## References

- Related constraint: `no-real-money` in `/guidance/constraints.yaml`
- Related decisions: DEC-002 (RNG tuned for feel, not regulated fairness)
- Project taste note: `/projects/PROJ-001-animal-slots/brief.md`
