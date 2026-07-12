---
# Maps to ContextCore project.* semantic conventions.
# A project is a bounded wave of work against the repo (the app).

project:
  id: PROJ-002
  status: active                    # proposed | active | shipped | cancelled
  priority: medium
  target_ship: null                 # play/dogfood project — no hard external date

repo:
  id: animal-slots

created_at: 2026-07-03
shipped_at: null

# Business value. Testable claim, not marketing copy.
value:
  thesis: >-
    The MVP proved the engine/presentation split; PROJ-002 tests whether that
    split makes the game CONFIGURABLE and MEASURABLE. A "machine" becomes pure
    config (symbols, reel weights, paylines, paytable, tiers, theme, audio), so
    adding a variant or retuning the math is DATA not CODE — no engine-logic
    change. And first-party player + traffic instrumentation lets us answer, from
    evidence rather than vibes, whether the game is actually fun and used.
  beneficiaries:
    - "Players — more variety (machines/themes/music), a game that's actually fun to win, and a visible sense of progress"
    - "The owner — real usage + fun signals from a private analytics dashboard"
    - "Template maintainer — dogfoods a config-driven refactor, a math-tuning loop (a named PROJ-001 risk), and the first backend-introducing wave"
  success_signals:
    - "A machine is a config object: adding or retuning one requires zero change to engine LOGIC (data + a DEC only)."
    - "The default machine is deliberately more fun — higher hit-frequency, a real medium-win band, and bigger jackpots — against a chosen target RTP, not by accident."
    - "A player can switch between >=2 distinct machines (theme + music + math) and the choice persists across reloads."
    - "An in-app stats view shows winnings-over-time, biggest win, spin count, and cash-in count."
    - "Usage tracking is a provider-agnostic beacon that ships default-OFF: enabling it points at a pluggable sink (a self-hosted HTTP endpoint, a reference Cloudflare Worker+KV, or nothing) and reports usage instances/uniques cookielessly — no Cloudflare required, no posture change unless a sink is on."
    - "A first-time player understands how to play without help — the observed tester failure is fixed."
  risks_to_thesis:
    - "Game-math tuning is a loop that resists one-spec-per-branch (an explicit PROJ-001 risk); config-as-data may or may not tame it."
    - "Analytics is opt-in (default OFF) and provider-agnostic, so the no-backend/no-PII posture holds unless a remote sink is enabled — but whoever enables a sink must keep it privacy-first (cookieless, no PII) or it undercuts SECURITY.md."
    - "Parameterizing a frozen engine is a large refactor that could regress the very separation it means to celebrate."
    - "'More fun' is subjective; without a fun proxy metric, retuning is guesswork."
---

# PROJ-002: Machines & Metrics

## What This Project Is

The second wave turns Animal Slots from one hard-coded game into a **configurable,
measured** one. The spine is a **config-driven "machine" model**: the engine is
parameterized so a machine is just data — symbols, reel weights, paylines,
paytable, win tiers, theme tokens, and audio params. On top of that spine the wave
(a) **retunes the math for fun** — the MVP is too hard to win and wins are too small
— delivering a better default machine plus **2–3 selectable machines** (each its own
theme + music + math); (b) adds **player session stats** (winnings-over-time, biggest
win, cash-in count) so there's a sense of progress; (c) adds a **help / how-to-play**
surface because a real tester couldn't understand it; and (d) adds **configurable,
default-off usage analytics** — a provider-agnostic beacon that can report usage
instances to any sink you choose (a self-hosted HTTP endpoint, a reference Cloudflare
Worker+KV, or nothing) — so you can see whether anyone plays without hard-wiring a
vendor or reversing the no-backend posture by default.

## Why Now

PROJ-001 shipped a live, hardened game — but two things surfaced immediately after:
a real tester **couldn't understand it and didn't find it fun** (hard to win, tiny
wins), and we have **no data** on whether anyone plays or comes back. The MVP's clean
engine/UI separation (engine frozen since SPEC-011) is the ideal substrate to make
the game config-driven now, while the architecture is fresh — turning "more machines"
and "retune the math" from risky code edits into cheap data changes — and to
instrument it before iterating further blind. Doing the config refactor first also
de-risks the tuning loop that PROJ-001 flagged as awkward.

## Success Criteria

- **Config-driven machines:** the engine consumes a machine config; adding/retuning a
  machine touches data + a DEC, never engine logic. The current game is preserved as
  the first machine (behavior-identical migration).
- **Fun:** the default machine hits a deliberately-chosen target RTP / hit-frequency
  with a genuine medium-win band and bigger jackpots — measurably more generous than
  the MVP, verified against the frozen seeds' successors.
- **Variety:** >=2 (ideally 3) distinct machines selectable in-app (theme + music +
  math), with the selection persisted.
- **Progress:** an in-app player-stats view (winnings-over-time, biggest win, spins,
  cash-ins), client-side only.
- **Measurement:** a configurable, default-off usage beacon can report usage instances
  (cookieless, no third-party) to a pluggable sink — a self-hosted HTTP endpoint or a
  reference Cloudflare Worker+KV — with no Cloudflare required and no posture change
  unless a sink is enabled. A `/stats` view is optional and sink-specific.
- **Comprehension:** a first-time player can play without external help.

## Scope

### In scope
- **Config-driven machine model** — parameterize the engine (symbols/weights/paylines/
  paytable/tiers) + theme tokens + audio params into a `Machine` config; a machine
  registry; a UI machine-selector; persisted choice. The current game becomes the
  first machine via a **behavior-preserving** migration.
- **Fun retune** — tune the default machine's hit-frequency, medium-win band, jackpot
  size, and paylines/ways-to-win against a chosen target RTP; recorded in a DEC.
- **2–3 machines** — the tuned default (Wild & Whimsical) plus themed variants (e.g.
  Arctic / Desert from the parked list), each with distinct theme + music + math.
- **Player session stats** — client-side (localStorage) winnings-over-time, biggest
  win, spin count, cash-in count, win-rate; shown in an in-app panel/sheet.
- **Help / how-to-play** — an onboarding surface (first-run overlay and/or a Help
  section) that makes the rules and controls legible to a first-timer.
- **Configurable usage analytics (default OFF)** — a provider-agnostic client beacon
  that fires a minimal *usage instance* (ts, event, app version, optional cookieless
  daily-rotating session hash) to a **configurable endpoint**, behind a **pluggable
  sink**: `off` (client-only, the ship default — no network, posture unchanged), a
  **generic HTTP endpoint** you self-host on any runtime (no Cloudflare), or a
  **reference Cloudflare Worker+KV** sink (home0's design informs this one). An
  optional, sink-specific private `/stats` view (usage instances + uniques). Cloudflare
  is one reference sink, not a requirement. **Reverses the no-backend posture only when
  a remote sink is enabled** — see Decisions.

### Explicitly out of scope
- Real money / payments of any kind (constraint `no-real-money` holds — forever).
- Accounts, login, cross-device sync, or any cross-session player identity. Player
  stats stay local; analytics stays anonymous.
- Multiplayer, leaderboards, social features.
- Third-party analytics, ads, trackers, or external JS of any kind (the analytics is
  strictly first-party).
- New audio *engine* work beyond per-machine params (the DEC-013 graph stays).

## Decisions this project will need (before/at the relevant stage frame)

- **DEC-005 (no backend) — amend ONLY IF a remote sink is enabled:** analytics ships
  **default OFF** and provider-agnostic, so the no-backend/no-PII posture is unchanged
  by default and the default build needs no DEC. Enabling a remote sink (the reference
  Cloudflare Worker+KV, or any self-hosted HTTP endpoint) is what reverses "no backend"
  — at that point a new DEC amending DEC-005 + a SECURITY.md posture update apply
  ("a minimal, cookieless, no-PII first-party usage endpoint; still no accounts, no
  cross-session identity"). Privacy-first is the non-negotiable guardrail for any sink.
- **Config-machine model DEC(s):** extends/supersedes DEC-006 (symbol set), DEC-011
  (paytable/reel weights), and DEC-003 (fixed paylines) — these move from hard-coded
  constants to machine config. The engine-no-dom boundary (DEC-001) must survive.
- **Retune-target DEC:** record the chosen target RTP / hit-frequency / jackpot policy
  for the default machine (play-money, so we can be generous — but pick a number).

## Open Questions

- **"Cash in" semantics** — define what a cash-in is (balance-hits-zero-and-resets
  count? an explicit "Collect" action? number of Reset presses?). Needed for the
  player-stats stage.
- **How many machines to ship** — recommend 3 (tuned default + Arctic + Desert).
- **Fun proxy metric** — is there a measurable stand-in for "fun" (session length,
  spins-before-quit, return rate from analytics) to steer the retune?
- **Analytics beacon + sink contract** — define the provider-agnostic beacon payload
  + the generic HTTP-endpoint contract (runtime-agnostic, self-hostable, no Cloudflare),
  and which reference sink(s) to ship. On Cloudflare, the sink is a Worker route
  alongside the assets binding (not a Pages Function, per DEC-014). Default OFF is
  confirmed; decide at the STAGE-011 frame whether to ship a `/stats` view and for
  which sink(s).

## Stage Plan

Ordered; the config spine comes first so fun/variety become data changes. A project
typically has 2–5 stages — this is at the top of that range; STAGE-011 (analytics)
is the most separable and could be deferred or split off if the wave runs long.

- [x] STAGE-007 (shipped 2026-07-05) — **Config-driven machine model**:
      parameterized the engine + presentation; a machine = config; migrated the current
      game to the default machine "Wild & Whimsical", behavior-preserving (frozen-seed
      contract). 6 specs (SPEC-038–043), 0 defects. Foundation for everything else.
- [x] STAGE-008 (shipped 2026-07-08) — **Fun retune + more machines**: tuned the
      default (Wild & Whimsical, **in place**) for fun to a **measured** target (RTP 93.8% /
      hit 34.4% / jackpot ~1-in-25k, via a new machine-metrics simulator), **re-baselined**
      the frozen-seed contract to the retuned numbers under DEC-016; shipped **4 machines**
      (tuned W&W + Arctic + Desert + Ocean) with distinct theme+music+math; machine selector
      + persistence (React Context + localStorage). Absorbed the STAGE-007 deferrals
      (per-machine `theme`+`audio` presentation slice with runtime CSS-var theming + the
      audio singleton reading the active machine; bet-level-stepping + paytable-math-source).
      Food & Drink machines parked as a future fast-follow. **10 specs (SPEC-044–053), 0
      defects, no engine-logic regressions (DEC-001 held throughout).** See the STAGE-008
      stage file.
- [x] STAGE-009 (shipped 2026-07-09) — **Player session stats**: client-side,
      aggregate session stats (spins, biggest win, cash-ins, win rate, net winnings) +
      a winnings-over-time sparkline, in an in-app panel; recorded automatically from the
      `SpinResult`, persisted under `zany:stats` (reusing SPEC-049's React-Context +
      localStorage pattern, never throwing — DEC-005). A "cash-in" = a wallet Reset press;
      "Clear stats" is a separate action. Emitted **DEC-020** (the stats model). No backend
      (DEC-005 unchanged), no engine change (**DEC-001 held — every spec's engine diff EMPTY**).
      **4 specs (SPEC-054–057)**, shipped as framed; the sparkline (SPEC-057) was completed, not
      deferred.
- [x] STAGE-010 (shipped 2026-07-10) — **Help / how-to-play**: onboarding surface that
      fixes the tester-comprehension failure. One `HelpSheet` (mirroring `PaytableSheet`) reached two
      ways — auto-opened once on first run (safe `zany:help-seen` flag, never throws — DEC-005) and via
      a persistent "How to play" header trigger; covers goal + controls + where-things-are + play-money
      disclaimer, links to the Paytable for payouts. Client-only, engine untouched (DEC-001). **2 specs
      (SPEC-059 infra PR #69, SPEC-060 UI PR #70)**, shipped as framed; the onboarding model was pinned
      in **DEC-022**.
- [~] STAGE-011 (framed 2026-07-10; **Tier 1 approved + active 2026-07-11**) — **Configurable usage
      analytics (default OFF)**: a provider-agnostic usage beacon + config. Split at the 2026-07-11
      framing review into **Tier 1** (approved, building now) and **Tier 2** (gated). **Tier 1
      (SPEC-061 event model + Sink seam + `VITE_ANALYTICS_SINK` gate + `NoopSink`; SPEC-062 recording
      tap + ephemeral session + DNT)** is the default-off, **zero-network**, client-only seam — DEC-005
      stays fully intact and DEC-023 (authored at SPEC-061) *affirms* it, making no no-backend amendment.
      **Tier 2 (SPEC-063 self-hosted HttpSink, SPEC-064 Cloudflare Worker+KV, SPEC-065 `/stats`) is
      GATED**: each enables a remote sink, which is what reverses no-backend — so Tier 2 needs a DEC
      amending DEC-005 + a SECURITY.md update + an explicit user decision, deferred as a documented
      follow-up. `framing_approved: true` covers Tier 1 only; `tier2_gated: true`.
- [x] STAGE-012 (shipped 2026-07-09) — **Per-machine reel symbol identity**: Arctic/Desert/Ocean
      each render their own themed reel creatures (emoji + labels) on the reels + paytable;
      W&W keeps the forest-animal default. Presentation-only (engine untouched); corrected the
      autonomous shared-vocabulary decision (DEC-017/018) that ran against user intent, via
      **DEC-021**. Numbered 012 to reserve 010/011 for the already-planned Help + analytics
      stages. **1 spec (SPEC-058, PR #68)**.

> **Parked (not in this project's plan):** an **audio-quality overhaul** — the current synthesized
> SFX/music sound cheap/harsh and undermine the "worth playing" thesis. User-flagged 2026-07-10 as a
> candidate for a **future project** (undecided whether it's the next one), likely preceded by a
> standalone **spike/probe** to assess what "good" sounds like and whether the current Web-Audio synth
> approach can get there or needs sampled assets. Deliberately NOT a PROJ-002 stage.

**Count:** 5 shipped / 1 active (STAGE-011 Tier 1) / 0 pending (STAGE-010 shipped 2026-07-10, 2 specs
SPEC-059 PR #69 + SPEC-060 PR #70; STAGE-012 shipped 2026-07-09; STAGE-011 analytics **framed 2026-07-10**,
**Tier 1 (SPEC-061/062) approved + active 2026-07-11**, Tier 2 (SPEC-063/064/065) gated behind a DEC-005
amendment + explicit user go). An audio-quality overhaul is parked as a future-project candidate (see the
note above), not a PROJ-002 stage.

## Dependencies

### Depends on
- **PROJ-001 (shipped):** the pure-TS engine, the React/CSS presentation + token
  system, the Tone.js audio graph (DEC-013), the deploy on Cloudflare Workers Static
  Assets (DEC-014), and the contract-test guard pattern.
- **External (STAGE-011, only if the Cloudflare sink is enabled):** a Cloudflare **KV**
  namespace binding — an operator step. The default-off build and the generic
  HTTP-endpoint sink need no Cloudflare and no operator step.

### Enables
- A "fun metric" iteration loop (analytics → retune → re-measure).
- Further machines/themes/music as pure config.
- A possible PROJ-003 (e.g. anticipation slowdown, haptics, day/night sky — the
  remaining parked polish, now cheap to slot into a machine).

## Project-Level Reflection

*Filled in when status moves to shipped.*

- **Did we deliver the outcome in "What This Project Is"?** <yes/no + notes>
- **How many stages did it actually take?** <number, compare to plan>
- **What changed between starting and shipping?** <one or two sentences>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **What did we defer to the next project?**
  - <one-line items>
