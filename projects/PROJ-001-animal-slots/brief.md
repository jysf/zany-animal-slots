---
# Maps to ContextCore project.* semantic conventions.
# A project is a bounded wave of work against the repo (the app).

project:
  id: PROJ-001
  status: shipped
  priority: high
  target_ship: null                 # play/dogfood project — no hard external date

repo:
  id: animal-slots

created_at: 2026-06-18
shipped_at: 2026-07-03

# Business value. Testable claim, not marketing copy.
value:
  thesis: >-
    An animation-heavy slot game can be delivered as a small web app with game
    logic cleanly separable from presentation — and doing so exercises the
    spec-driven template against a real-time, frontend-heavy, non-CRUD project,
    surfacing gaps the example CRUD flow doesn't.
  beneficiaries:
    - "Template maintainer (dogfooding the template against a non-CRUD app)"
    - "Frontend devs evaluating the template for real-time / animation work"
    - "Players wanting a quick, fun, play-money demo"
  success_signals:
    - "All five states (idle / spinning / small-win / big-win / jackpot) are reachable and visually distinct."
    - "The engine has high unit-test coverage and zero React/DOM imports."
    - "A full spin → win → reset cycle holds ~60fps on a mid-tier phone."
    - "At least one spec completes design → build → verify → ship without the cycle structure fighting the work."
    - "The first weekly review surfaces at least one concrete template improvement."
  risks_to_thesis:
    - "Subjective 'juice' work resists TDD, making the ## Failing Tests section feel like busywork."
    - "Verify can't meaningfully review feel, so the cycle adds overhead without catching much."
    - "Game-math tuning loops don't fit one-spec-per-branch cleanly."
---

# PROJ-001: Animal Slots — MVP

## What This Project Is

Animal Slots is a play-money, mobile-first web slot game themed on North
American wildlife ("Wild & Whimsical"). This wave of work — the MVP — delivers
a fully playable, juiced 5×3 slot: real spin/win logic plus the celebratory
feel from the design spec, built as a small web app whose game logic is cleanly
separable from its presentation. The engine (RNG, reels, paylines, paytable,
bet/balance state) is pure TypeScript with zero DOM coupling; the presentation
layer (React + CSS animation) consumes it through a typed interface.

## Why Now

This is the first project in the repo. It exists for two reasons at once. As a
product, it's a self-contained, shippable demo that needs no backend, accounts,
or payments. As a process, it is a deliberate dogfood vehicle: the spec-driven
template has so far only been exercised against an example CRUD flow, and a
real-time, animation-heavy, non-CRUD frontend is exactly the kind of project
that stress-tests whether the design → build → verify → ship cycle helps or
gets in the way. Building it now tells us where the template needs to bend
before we trust it on harder work.

## Success Criteria

- All five game states (idle, spinning, small-win, big-win, jackpot) are
  reachable and visually distinct in the running app.
- The engine is fully unit-tested with zero React/DOM imports — spins are
  deterministic under a seeded RNG.
- A full spin → win → reset cycle holds ~60fps on a mid-tier phone.
- At least one spec completes the full design → build → verify → ship loop
  without the cycle structure fighting the animation work.
- The first weekly review surfaces at least one concrete, actionable template
  improvement (the dogfood payoff).
- The game is deployed and publicly playable at a URL (Cloudflare Pages),
  served with sensible security headers and an automated deploy on merge.

## Scope

### In scope
- Playable 5×3 slot engine (seedable RNG, weighted reels, spin resolution).
- 5 fixed paylines + paytable evaluation; multiple lines can hit per spin.
- Bet levels x1 / x2 / x3 (total bet 10 / 25 / 50 coins).
- Balance (start 1000) with a Reset control; balance persists in localStorage.
- Auto-spin (default 10 spins; stops on jackpot, count exhaustion, or
  balance < bet).
- All five visual states with win celebrations, including the wolf jackpot
  moment.
- A tier-scaled synthesized win jingle (Tone.js) with a global mute toggle and
  first-gesture audio unlock.
- Design-token system (colors, type scale, spacing as CSS custom properties).
- Portrait-first layout that also centers nicely in a device frame on desktop.
- Emoji symbols (placeholder art).
- Public deployment to Cloudflare Pages with security headers, a CI deploy on
  merge, and a dependency/license audit gate (STAGE-006). See `DEC-008`.

### Explicitly out of scope (v1)
- Real money / IAP / payments of any kind. (See constraint `no-real-money`.)
- Custom illustrated / SVG art — emoji placeholders only.
- Configurable paylines (fixed set only).
- Multiple themes (Arctic / Desert are future projects).
- The full audio suite (ambient music bed, complete SFX set, dynamic mixing)
  beyond the single win jingle.
- Accounts / leaderboards / any backend.
- Internationalization (i18n).

## Game-Design Spec

*The authoritative game rules the STAGE-002 engine implements. Paylines come from
`DEC-003`, symbols/tiers from `DEC-006`, the seedable RNG from `DEC-002`, and the
play-money / no-RTP stance from `DEC-005`. The paytable and reel-strip weights
below are recorded in `DEC-011` (tuned for feel, not a regulated RTP).*

### Grid & reel model

- The board is **5 reels × 3 rows** (top / mid / bottom = rows 0 / 1 / 2).
- Each reel has its own **weighted strip** (an array of symbol IDs). A spin draws,
  per reel, one **stop index** from the injected PRNG; that reel's three visible
  cells are `strip[stop]`, `strip[(stop+1) % len]`, `strip[(stop+2) % len]`
  (top, mid, bottom), wrapping at the end of the strip.
- Draw order is **reel 0 → reel 4** (one PRNG draw per reel), so a given seed
  produces a fixed, reproducible grid. This order is part of the contract — tests
  pin a seed and assert the exact grid.

### Symbols & tiers (DEC-006)

| Symbol | Tier | Engine ID |
|---|---|---|
| 🦌 Deer | Low | `DEER` |
| 🦊 Fox | Low | `FOX` |
| 🐿️ Squirrel | Low | `SQUIRREL` |
| 🐻 Bear | Mid | `BEAR` |
| 🦅 Eagle | Mid | `EAGLE` |
| 🦉 Owl | Mid | `OWL` |
| 🦬 Bison | High | `BISON` |
| 🐺 Wolf | Jackpot | `WOLF` |

### Reel-strip weights (DEC-011)

For v1 **all five reels use the same composition** (symmetric, easy to test).
Weights are relative counts within each reel's strip:

| Symbol | Tier | Weight / reel |
|---|---|---|
| 🦌 Deer | Low | 7 |
| 🦊 Fox | Low | 7 |
| 🐿️ Squirrel | Low | 6 |
| 🐻 Bear | Mid | 4 |
| 🦅 Eagle | Mid | 4 |
| 🦉 Owl | Mid | 4 |
| 🦬 Bison | High | 2 |
| 🐺 Wolf | Jackpot | 1 |

Per-reel total = **35** (Low 20 ≈ 57%, Mid 12 ≈ 34%, Bison 2 ≈ 5.7%, Wolf 1 ≈ 2.9%
chance per stop). Wolf is deliberately scarce, so a natural five-Wolf jackpot is
extremely rare — the engine stays correct regardless, and the "jackpot reachable"
success criterion is met deterministically via a chosen seed and over many
auto-spins. The exact symbol order within each strip is the build's choice
(documented in `strips.ts`); only the composition above is contractual.

### Paylines (DEC-003)

Five fixed lines, evaluated left-to-right from reel 0, paying on **3+ consecutive
matching symbols** starting at reel 0. Multiple lines can hit on one spin; the
spin's total win is the **sum of all line wins**.

| Line | Rows (reel 0→4) | Shape |
|---|---|---|
| L1 | 1, 1, 1, 1, 1 | middle |
| L2 | 0, 0, 0, 0, 0 | top |
| L3 | 2, 2, 2, 2, 2 | bottom |
| L4 | 0, 1, 2, 1, 0 | V |
| L5 | 2, 1, 0, 1, 2 | ^ |

### Paytable (DEC-011)

Payouts are **multiples of the total bet** (not per-line bet). A line pays its
tier's multiplier for the longest run of 3/4/5 identical symbols from reel 0.

| Tier (symbols) | 3 of a kind | 4 of a kind | 5 of a kind |
|---|---|---|---|
| Low (Deer / Fox / Squirrel) | 0.5× | 2× | 5× |
| Mid (Bear / Eagle / Owl) | 1× | 4× | 12× |
| High (Bison) | 3× | 10× | 40× |
| Jackpot (Wolf) | 8× | 40× | **200×** |

- `lineWin = floor(multiplier × totalBet)` (floor keeps coins whole; only Low
  3-of-a-kind is fractional — e.g. `0.5 × 25 = 12.5 → 12`).
- `spinWin = Σ lineWin` over the (up to five) hitting lines.
- Same symbol within a tier pays the same (per-symbol payout splits are a clean
  future spec, per DEC-003's consequences).

### Bet & balance

- **Bet levels (total bet):** x1 = **10**, x2 = **25**, x3 = **50** coins. Default x1.
- **Balance:** starts at **1000**; **Reset** restores it to 1000.
- A spin requires `balance ≥ totalBet`; otherwise it returns a typed
  invalid-spin result (no throw — AGENTS §11) and does not debit. On a valid spin
  the engine debits `totalBet`, then credits `spinWin`.
- Persisting balance to `localStorage` is **STAGE-003**, not the engine.

### Win-tier classification

Classifies a resolved spin as data (the UI maps it to a celebration; the engine
fires nothing):

| Tier | Condition |
|---|---|
| `none` | `spinWin == 0` |
| `small` | `0 < spinWin < 5 × totalBet` |
| `big` | `spinWin ≥ 5 × totalBet` (and not a jackpot) |
| `jackpot` | the grid shows **five Wolves on at least one payline** |

### Worked examples (for deriving failing tests)

- **All-Wolf grid:** every line is five Wolves → `5 × 200× = 1000×` total bet;
  tier = `jackpot`. (Bet 10 → 10,000 coins.)
- **Single 3-Mid:** L1 = Bear, Bear, Bear, Deer, Fox and no other line hits →
  `1× totalBet`; tier = `small`. (Bet 10 → 10 coins.)
- **Single 5-Low:** L2 = five Deer → `5× totalBet` → tier = `big` (just crosses
  the threshold).
- **Insufficient balance:** balance 5, bet 10 → invalid-spin result, balance
  unchanged at 5.

## Stage Plan

- [x] STAGE-001 (shipped 2026-06-19) — Scaffold & design system (Vite + React + TS boots; design tokens; four-region portrait layout; no game logic).
- [x] STAGE-002 (shipped 2026-06-23) — Slot engine: pure logic, zero DOM (RNG, reels, spin resolution, paylines/paytable, bet/balance, win-tier classification; fully unit-tested).
- [x] STAGE-003 (shipped 2026-06-26) — Reels UI & spin flow (wire engine to UI; grid, spin button, bet controls, auto-spin; idle → spinning → stopped with reel-stop bounce).
- [x] STAGE-004 (shipped 2026-06-27) — Win celebration & juice (small/big/jackpot states, payline trail, particles, wolf jackpot moment, balance count-up, tier-scaled win jingle + mute).
- [x] STAGE-005 (shipped 2026-06-28) — Audio suite, a11y, polish (full audio suite, prefers-reduced-motion, contrast/44px audit, colorblind-safe shapes, perf pass).
- [x] STAGE-006 (shipped 2026-07-03) — Release & deploy (Cloudflare **Workers Static Assets** deploy via auto-build on merge — DEC-014 superseded the Pages plan; security headers/CSP + HSTS, dependency+license audit gate, SECURITY.md, prod smoke check; live at `zany-animal-slots.jysf.org`).

**Count:** 6 shipped / 0 active / 0 pending — all stages shipped.

## Dependencies

### Depends on
- None. This is the first project in the repo.

### Enables
- PROJ-002 (framed 2026-07-03, status: proposed) — **Machines & Metrics**:
  config-driven machines (theme + music + math as data), a fun retune (bigger
  jackpots / more ways to win / a real medium-win band), player session stats,
  a help/how-to-play surface, and first-party traffic analytics. See
  `projects/PROJ-002-machines-and-metrics/brief.md`. The parked polish (fuller
  audio, anticipation slowdown, haptics, day/night sky) rolls forward into it or a
  later PROJ-003.

## Project-Level Reflection

*Shipped 2026-07-03. Drafted via Prompt 1e (Project Ship).*

**Success criteria — all met.** All five game states are reachable and visually
distinct; the engine is fully unit-tested with zero React/DOM imports and
deterministic seeded spins (enforced by the engine-boundary test, and frozen since
SPEC-011); the spin→win→reset cycle animates transform/opacity only (perf pass
SPEC-034 + a perf contract test) for a 60fps path; many specs completed the full
design→build→verify→ship loop cleanly; the dogfood feedback log surfaced **15**
concrete template findings; and the game is deployed and publicly playable at a URL
with verified security headers and automated deploy — via Cloudflare Workers Static
Assets rather than Pages (the one criterion whose *mechanism* changed; outcome met).

- **Did we deliver the outcome in "What This Project Is"?** Yes — a fully playable,
  juiced 5×3 play-money slot with the engine cleanly separated from presentation,
  now live in front of players. The thesis held strongly: the engine froze at
  SPEC-011 and never needed a change through 26 more specs of UI/audio/juice/deploy
  work, which is the separability claim proven in practice.
- **How many stages did it actually take?** Exactly the 6 planned (STAGE-001…006),
  across **37 specs** (SPEC-001…037), plus a handful of post-launch fixes done
  directly on `main` (win-banner reposition, version/About, HSTS-in-`_headers`,
  asset-cache tidy, and the Workers deploy config). 14 decisions (DEC-001…014).
- **What changed between starting and shipping?** The scope stayed remarkably stable
  — no feature creep, no engine churn. The real evolution was at the edges: (a) the
  deploy target moved Cloudflare **Pages → Workers Static Assets** (DEC-014
  superseded DEC-008) because Cloudflare steers new projects to Workers, which also
  forced an explicit `wrangler.jsonc` to dodge a Vite-6 auto-config failure; (b) two
  hardening assumptions proved Worker-specific (zone HSTS doesn't reach a
  Worker-owned custom domain → served from `_headers`; Workers merges `_headers`
  rules → `no-cache` had to be scoped off `/*`). The count-up tween (DEC-012) and the
  shared Tone.js audio graph (DEC-013) were the notable mid-project design calls.
- **Lessons that should update AGENTS.md, templates, or constraints?** The dogfood
  log (`feedback/2026-06-18-…`) captured 15; the highest-value for a non-CRUD/
  animation project: (#12/#13) agents carry React-testing priors (exhaustive-deps
  disables, `@testing-library/user-event`) that don't match a lean toolchain — fold
  the repo's actual setup into UI build prompts; (#14) Agent-tool sub-agents share the
  working tree and auto-background, so the orchestrator must not touch git/tree while
  one runs; (#15) new `scripts/*.mjs` need a Node-globals ESLint block. Template-level:
  the scaffold's generic `SECURITY.md` should be replaced at deploy time with the real
  posture, and the `license-policy` constraint can move advisory→blocking now that
  it's CI-enforced. "Juice" work resisted TDD less than feared — contract tests
  (reduced-motion, perf, contrast, touch-target) turned subjective polish into
  enforceable guards, which is the reusable win.
- **What did we defer to the next project?** PROJ-002 (parked): fuller audio suite,
  anticipation reel-slowdown, haptics, day/night sky, theme-swap (Arctic/Desert),
  session stats. Small deferred hardening: `.well-known/security.txt`, HSTS
  `includeSubDomains`/`preload` once the whole zone is HTTPS-only, and the
  license-policy severity bump. **Recommendation:** mark PROJ-001 shipped; do **not**
  auto-start PROJ-002 — promote it into a frame only if the demo gains momentum.
