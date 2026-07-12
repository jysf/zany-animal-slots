---
# Maps to ContextCore insight.* semantic conventions.

insight:
  id: DEC-023
  type: decision
  confidence: 0.9                     # 0.0 - 1.0, honest assessment
  audience:
    - executive
    - developer
    - agent
    - operator

agent:
  id: claude-opus-4-8
  session_id: null

# Decisions are repo-level, but it's useful to track which project
# caused them to be emitted.
project:
  id: PROJ-002
repo:
  id: animal-slots

created_at: 2026-07-11
supersedes: null
superseded_by: null

# The analytics seam lives entirely under src/analytics/**. This decision
# governs that directory: decisions-audit --changed surfaces it whenever the
# analytics code changes (e.g. a future Tier-2 sink), which is exactly when the
# privacy posture must be re-checked.
affected_scope:
  - "src/analytics/**"

tags:
  - policy
  - analytics
  - privacy
  - telemetry
  - default-off
---

# DEC-023: Usage-analytics posture — provider-agnostic, default-OFF, client-only (Tier 1)

## Decision

Usage analytics ships as a **provider-agnostic `Sink` seam that is OFF by default**: the public build
selects the `NoopSink` (build-config `VITE_ANALYTICS_SINK` unset/`off`), makes **zero network calls**,
sets no cookie, and uses no persistent or cross-session identifier — so **DEC-005's no-backend, no-PII
posture stays fully intact**. Events are **anonymous game facts only** (`session_start`, `spin`,
`cash_in`, `machine_switch`, `help_seen`); any session id is **ephemeral and in-memory** (regenerated
every load, never stored) and `navigator.doNotTrack` forces analytics off. This decision covers **Tier 1
only** — it does **not** amend DEC-005. Enabling any **remote sink** (a self-hosted HTTP endpoint, or the
reference Cloudflare Worker+KV — "Tier 2") is what would reverse the no-backend clause, and that requires
a **separate future decision that amends DEC-005 + updates `SECURITY.md`**, explicitly deferred here.

## Context

PROJ-002's thesis has a "measurable" half the offline metrics simulator (STAGE-008) only partly proves:
we can't see *real* play. STAGE-011 closes that loop with a usage beacon — but a network boundary is
exactly what DEC-005 ("no backend / client-only / no PII / no trackers") and `SECURITY.md` promise the
app does **not** have. The framing review (2026-07-11) resolved the tension by **splitting the stage into
two tiers** and approving only the first:

- **Tier 1 (this decision, building now):** the event model, the pluggable `Sink` interface, the
  `NoopSink` default, the `VITE_ANALYTICS_SINK` gate (default `off`), the safe `track()` seam, and the
  recording tap + ephemeral session + Do-Not-Track short-circuit (SPEC-061, SPEC-062). **No network, no
  PII, no cookie, cookieless, no third-party.** The default build's behaviour is unchanged; DEC-005 holds.
- **Tier 2 (GATED, deferred):** a real remote sink — `HttpSink` to a self-hosted endpoint (SPEC-063) or
  the Cloudflare Worker+KV (SPEC-064), plus an optional private `/stats` view (SPEC-065). Turning any of
  these on is the moment the app gains a backend and starts transmitting, so it is out of scope until a
  deliberate, separately-scoped decision amends DEC-005 and `SECURITY.md`.

Splitting this way lets the whole seam land — pluggable, unit-tested, provably inert — without touching
the security posture, and makes "turn analytics on" a conspicuous, documented future choice rather than a
quiet default.

## Alternatives Considered

- **Option A: Ship analytics on, to a bundled default endpoint.**
  - What it is: wire a real sink into the default build so the public site reports usage immediately.
  - Why rejected: reverses DEC-005 and contradicts `SECURITY.md` ("no analytics, no trackers") the moment
    it deploys; makes the privacy-sensitive change the *default* instead of a deliberate opt-in. Hard no.

- **Option B: A runtime in-app toggle / consent banner that can enable a sink at run time.**
  - What it is: put the network path in the default bundle, gated by a user toggle or cookie banner.
  - Why rejected: the network code would ship in the public bundle, and a runtime flip could start
    beaconing without a rebuild — the opposite of "the public site can never beacon by accident." A
    user-facing consent surface is a possible later wave, not this one.

- **Option C: Third-party analytics SDK (GA, Plausible, etc.).**
  - What it is: drop in a vendor script/tag.
  - Why rejected: external JS + third-party data flow directly violate the "strictly first-party, no
    external JS" line in the brief and `SECURITY.md`; also a new top-level dependency.

- **Option D (chosen): Provider-agnostic `Sink` seam, default `NoopSink`, remote sinks gated behind a
  future DEC-005 amendment.**
  - What it is: the app talks only to a `Sink` interface; the build config picks the sink; the default is
    a no-op that does nothing. Anonymous events, ephemeral session id, DNT-honouring. Remote sinks exist
    as a *documented, gated* Tier 2.
  - Why selected: delivers the full, testable seam with **zero** change to the default build's posture;
    DEC-005 stays intact and true; enabling telemetry becomes an explicit operator decision with its own
    DEC. Same "consume plain data behind a seam" ethos as the config-driven machine (DEC-015).

## Consequences

- **Positive:** The default (public) build is provably inert — zero network, no PII, no cookie, DEC-005
  and `SECURITY.md` unchanged. The seam is pluggable and unit-testable; an operator can later self-host a
  sink without vendor lock. "Analytics on" is a conspicuous, separately-decided step, not an accident.
- **Negative:** No real usage data is collected yet — the "measure real play" loop isn't closed until a
  Tier-2 sink is deliberately enabled (by design). The reference sinks + `/stats` are deferred.
- **Neutral:** Introduces the first `import.meta.env.VITE_*` build-config read (a self-contained
  `src/analytics/env.d.ts` types it, mirroring `src/build-info.d.ts`). The engine never sees analytics
  (DEC-001): `src/analytics/**` imports engine **types** only.

## Validation

Right if: with the default config, the built app makes **zero** network requests and ships **no** CSP
`connect-src` change, and a test proves no transport fires for any event when the sink is `off`; and if
`SECURITY.md`'s "no analytics, no trackers, no backend" statements remain accurate for the default build.
Revisit — via a **new** decision that amends DEC-005 and updates `SECURITY.md` — only when the project
deliberately decides to enable a remote sink (Tier 2). Wrong if analytics ever ends up on by default, or
if any event carries PII / a persistent identifier / a cookie.

## References

- Related specs: SPEC-061 (event model + `Sink` seam + `VITE_ANALYTICS_SINK` gate + `NoopSink`),
  SPEC-062 (recording tap + ephemeral session + DNT). Gated Tier 2: SPEC-063/064/065.
- Related decisions: DEC-005 (play-money / no-backend / no-PII — **affirmed, not amended** by this
  decision), DEC-001 (engine/presentation separation — analytics is a side channel), DEC-015 (the
  "consume data behind a seam" ethos this mirrors), DEC-014 (the Workers deploy a Tier-2 Cloudflare sink
  would extend).
- Stage: STAGE-011 (Tier 1 approved 2026-07-11; Tier 2 gated). Policy mirror: `SECURITY.md`,
  `guidance/constraints.yaml` (`no-real-money`, `engine-no-dom`).
