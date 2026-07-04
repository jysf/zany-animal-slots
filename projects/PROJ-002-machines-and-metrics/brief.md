---
# Maps to ContextCore project.* semantic conventions.
# A project is a bounded wave of work against the repo (the app).

project:
  id: PROJ-002
  status: proposed                  # proposed | active | shipped | cancelled
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
    - "A private, cookieless, no-third-party /stats dashboard shows real traffic (pageviews, referrers, geo, click events)."
    - "A first-time player understands how to play without help — the observed tester failure is fixed."
  risks_to_thesis:
    - "Game-math tuning is a loop that resists one-spec-per-branch (an explicit PROJ-001 risk); config-as-data may or may not tame it."
    - "Reversing 'no backend' for traffic analytics enlarges the attack surface and dilutes the play-money/no-PII/client-only posture PROJ-001 sold — the analytics MUST stay privacy-first or it undercuts SECURITY.md."
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
surface because a real tester couldn't understand it; and (d) adds **first-party,
privacy-preserving traffic analytics** (a private `/stats` dashboard, modeled on the
owner's `home0` design) so we can see whether anyone plays and enjoys it.

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
- **Measurement:** a private `/stats` dashboard shows real traffic via cookieless,
  no-third-party, first-party analytics with a daily-rotating visitor hash.
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
- **First-party traffic analytics** — a Worker fetch handler `/api/track` + Cloudflare
  **KV** ingest, cookieless daily-rotating visitor hash, and a private `/stats`
  dashboard (pageviews 24h/7d/30d, top pages, referrers, geo, click events by target),
  modeled on `home0`'s design. **Reverses the no-backend posture** — see Decisions.

### Explicitly out of scope
- Real money / payments of any kind (constraint `no-real-money` holds — forever).
- Accounts, login, cross-device sync, or any cross-session player identity. Player
  stats stay local; analytics stays anonymous.
- Multiplayer, leaderboards, social features.
- Third-party analytics, ads, trackers, or external JS of any kind (the analytics is
  strictly first-party).
- New audio *engine* work beyond per-machine params (the DEC-013 graph stays).

## Decisions this project will need (before/at the relevant stage frame)

- **Amend DEC-005 (no backend):** STAGE-011's analytics introduces a minimal
  first-party Worker + KV. This reverses "no backend" and requires a new DEC (amending
  DEC-005) **plus** a SECURITY.md posture update — from "no backend" to "a minimal,
  cookieless, no-PII first-party analytics endpoint + KV; still no accounts, no
  cross-session identity." Privacy-first is the non-negotiable guardrail.
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
- **Analytics on Workers Static Assets** — home0 uses Pages Functions; this app is on
  Workers Static Assets (DEC-014), so `/api/track` is a Worker route alongside the
  assets binding, not a Pages Function. Confirm the routing shape at STAGE-011 frame.

## Stage Plan

Ordered; the config spine comes first so fun/variety become data changes. A project
typically has 2–5 stages — this is at the top of that range; STAGE-011 (analytics)
is the most separable and could be deferred or split off if the wave runs long.

- [ ] STAGE-007 (not yet framed) — **Config-driven machine model**: parameterize the
      engine; a machine = config; migrate the current game to the first machine,
      behavior-preserving. Foundation for everything else.
- [ ] STAGE-008 (not yet framed) — **Fun retune + more machines**: tune the default
      for fun (hit-rate, medium band, jackpots, more ways to win) to a target RTP;
      ship 2–3 machines with theme+music+math; machine selector + persistence.
- [ ] STAGE-009 (not yet framed) — **Player session stats**: client-side
      winnings-over-time, biggest win, cash-ins, spins; in-app panel.
- [ ] STAGE-010 (not yet framed) — **Help / how-to-play**: onboarding surface that
      fixes the tester-comprehension failure.
- [ ] STAGE-011 (not yet framed) — **First-party traffic analytics**: Worker `/api/track`
      + KV ingest + private `/stats` dashboard (home0 model); the no-backend posture
      reversal (DEC amending DEC-005 + SECURITY.md update); [OPS] KV binding.

**Count:** 0 shipped / 0 active / 5 pending.

## Dependencies

### Depends on
- **PROJ-001 (shipped):** the pure-TS engine, the React/CSS presentation + token
  system, the Tone.js audio graph (DEC-013), the deploy on Cloudflare Workers Static
  Assets (DEC-014), and the contract-test guard pattern.
- **External (STAGE-011 only):** a Cloudflare **KV** namespace binding — an operator
  step, like the PROJ-001 [OPS] deploy items.

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
