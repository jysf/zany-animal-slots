---
# Maps to ContextCore epic-level conventions.
# A Stage is a coherent chunk of work within a Project.
# It has a spec backlog and ships as a unit when the backlog is done.

stage:
  id: STAGE-011                     # the roadmap's reserved analytics slot (auto-tool assigned 013; renumbered)
  status: active                    # proposed | active | shipped | cancelled | on_hold  (Tier 1 in flight 2026-07-11)
  priority: medium                  # critical | high | medium | low
  target_complete: null             # optional: YYYY-MM-DD

# Framing-review gate. This stage crosses the no-backend posture (DEC-005) ONLY when a REMOTE
# sink is enabled (Tier 2). The user reviewed this frame (2026-07-11) and approved TIER 1 ONLY:
# the default-off, zero-network, client-only seam (SPEC-061 + SPEC-062). Tier 2 (SPEC-063
# HttpSink self-hosted endpoint, SPEC-064 Cloudflare Worker+KV, SPEC-065 /stats) remains GATED —
# a remote sink requires a DEC amending DEC-005 + a SECURITY.md update + an explicit user
# decision, none of which is granted here. framing_approved=true covers the Tier-1 specs only.
framing_approved: true             # Tier 1 (SPEC-061/062) approved 2026-07-11
tier2_gated: true                  # SPEC-063/064/065 need a DEC-005 amendment + explicit user go — do NOT drive

project:
  id: PROJ-002                      # parent project
repo:
  id: animal-slots

created_at: 2026-07-10
shipped_at: null

# What part of the project's value thesis this stage advances.
value_contribution:
  advances: >-
    The "measurable" half of PROJ-002's thesis — the last unproven claim. STAGE-007/012 made a machine
    pure data, STAGE-008 made it fun to a MEASURED target, STAGE-009 gave the player their own session
    numbers, and STAGE-010 made it legible. This stage closes the loop by making real-world PLAY
    measurable: an optional, default-off, provider-agnostic usage beacon so the "fun metric" iteration
    loop (observe → retune → re-measure) can run on actual sessions instead of only the offline simulator.
  delivers:
    - "A provider-agnostic usage-analytics seam that is DEFAULT OFF — the public build makes zero network calls and DEC-005 is fully intact unless an operator explicitly enables a sink."
    - "A generic, self-hostable HTTP-endpoint sink (no Cloudflare required) plus a reference Cloudflare Worker+KV sink, selectable by build config."
    - "(Optional / stretch) a private aggregate `/stats` view over the collected events."
  explicitly_does_not:
    - "Turn analytics on by default, collect any PII, set cookies, or use a persistent cross-session identifier — anonymous, opt-in, ephemeral-session-id only; honors Do-Not-Track."
    - "Change the engine or any game behavior (DEC-001) — the beacon is a fire-and-forget side channel the engine never sees."
    - "Introduce real money, wagering, or an RTP claim (DEC-005 core is unchanged); only the *no-backend* clause is amended, and only when a remote sink is enabled."
    - "Add a runtime in-app opt-in/consent toggle or a cookie banner — enablement is an operator build-config decision this stage; a user-facing consent surface is a possible later wave."
---

# STAGE-011: Configurable usage analytics (default OFF)

## What This Stage Is

A stage that makes **real-world play measurable** without compromising the project's clean client-only
posture. When it ships, the game has a **provider-agnostic usage-analytics seam** that is **off by
default**: the public build (zany-animal-slots.jysf.org) emits nothing, makes no network request, and
DEC-005's no-backend posture is untouched. An operator who wants telemetry selects a **sink** at build
time — a generic **HTTP-endpoint** sink (self-hostable, runtime-agnostic, no Cloudflare) or a reference
**Cloudflare Worker+KV** sink — and only then does the app send small, **anonymous** events (session
start, spin, cash-in, machine switch, help seen) via a fire-and-forget beacon. There is no PII, no
cookie, and no persistent identifier — just an ephemeral per-load session id; Do-Not-Track forces it
off. It reuses the recording seams already built in STAGE-008/009/010, so the app-side change is a thin
tap on existing events, not new game logic. The engine is never involved (DEC-001).

## Why Now

PROJ-002's thesis has two halves — **configurable** and **measurable**. Everything shipped so far proved
"configurable" (a machine is data) and *offline* measurability (the STAGE-008 metrics simulator). What's
still unproven is measurability of **actual play**: the brief makes "close the fun-metric loop
(analytics → retune → re-measure)" an explicit enabler, and names this the **most separable** stage —
the right one to do last, and the one safest to split or defer if the wave runs long. The substrate is
ready: STAGE-009 already records every `SpinResult` and cash-in through a reactive seam, STAGE-008 has an
active-machine context, and STAGE-010 has a help-seen flag — the exact events worth beaconing already
flow through code we own. The one genuinely new thing is the **network boundary**, which is precisely why
this is framed default-off and gated behind operator config: the public build's behavior does not change.

## Success Criteria

- **Default build is provably inert:** with analytics off (the default), the app makes **zero** network
  requests, ships **no** CSP `connect-src` change, and DEC-005 is fully intact — a test asserts the
  default sink is the no-op and that no beacon transport is invoked on any recorded event.
- **Enabled build beacons anonymously and safely:** when an operator selects the HTTP sink, recorded
  events POST to the configured endpoint via `navigator.sendBeacon` (with a `fetch(keepalive)` fallback),
  batched and fire-and-forget; it carries **no PII and no persistent id**, honors `navigator.doNotTrack`,
  and **never throws or blocks the game** on transport failure (mirrors the DEC-005 safe-storage ethos).
- **Two sinks, one interface:** the app talks only to a `Sink` interface; a generic `HttpSink`
  (self-hostable) and a reference **Cloudflare Worker+KV** sink (a Worker route alongside the assets
  binding — not a Pages Function, per DEC-014) both satisfy it. The reference sink is **inert until
  deployed with its KV binding**; the [OPS] binding step + `wrangler.jsonc` + `SECURITY.md` update ship
  with it.
- **The posture change is documented, not silent:** a new **DEC-023** records the analytics posture and
  *amends* DEC-005's no-backend clause to permit anonymous, opt-in, default-off telemetry; the
  operational parts (CSP `connect-src`, `SECURITY.md`, KV binding) apply **only** when a remote sink is
  enabled.
- **Boundaries intact:** DEC-001 holds — the engine is untouched (`git diff … -- src/engine/` EMPTY) in
  every spec. Any UI is token-only CSS, no raw hex (DEC-010), ≥44px targets, reduced-motion fallback.
- **`just typecheck && just lint && just test && just build && just validate && just cost-audit` pass.**

## Scope

### In scope
- **Event model + provider-agnostic sink seam (default off)** — a typed `AnalyticsEvent` union, a `Sink`
  interface (`track` / `flush`), a default `NoopSink`, and a build-config gate (`VITE_ANALYTICS_SINK`,
  default `off`) that selects the sink. A `track()` seam that is a no-op unless a sink is configured.
- **Recording tap** — emit events from the existing STAGE-008/009/010 seams (session start, spin,
  cash-in / Reset, machine switch, help seen). An **ephemeral, in-memory** session id; a Do-Not-Track
  short-circuit. Still default-off, so no default-build behavior change.
- **Generic HTTP-endpoint sink** — an `HttpSink` (batched `sendBeacon` + `fetch(keepalive)` fallback,
  swallow failures) posting to a configured endpoint; the `connect-src` CSP note for operators.
- **Reference Cloudflare Worker+KV sink** — a Worker ingestion route + KV write, the [OPS] KV binding,
  `wrangler.jsonc` wiring, and the `SECURITY.md` / DEC-005 amendment; inert until deployed with a binding.
- **(Optional / stretch) private `/stats` aggregate view** — a small read-only view over the KV sink;
  ship only if the remote sink lands cleanly with room to spare (see Design Note 7).

### Explicitly out of scope
- Analytics on by default; any PII, cookie, fingerprint, or persistent cross-session identifier.
- A user-facing in-app consent toggle / cookie banner (enablement is operator build-config this stage).
- Any engine or game-behavior change (DEC-001); real money / wagering / RTP (DEC-005 core unchanged).
- Third-party analytics SDKs (GA, etc.) — the seam is provider-agnostic and self-hostable by design.

## Spec Backlog

Format: `- [status] SPEC-ID (cycle) — one-line summary` · sizing **[S/M/L]**

Ordered infrastructure-before-network-before-UI (mirrors the SPEC-054→056 and SPEC-059→060 shape):
the inert seam first, then the tap, then each sink, then the optional view.

**Tiering (set at the 2026-07-11 framing review).** The backlog splits into two tiers by whether it
touches the network boundary:

- **TIER 1 — approved, buildable now (SPEC-061 + SPEC-062).** The default-off, **zero-network**,
  client-only seam. No network call, no PII, no cookie, cookieless, no third-party. DEC-005 stays
  **fully intact** — Tier 1 introduces no backend, so it needs and makes **no** DEC-005 amendment.
- **TIER 2 — GATED, do NOT drive (SPEC-063 + SPEC-064 + SPEC-065).** Every Tier-2 spec enables a
  **remote sink** (a self-hosted HTTP endpoint, or the Cloudflare Worker+KV) — which is exactly what
  reverses DEC-005's no-backend posture. Tier 2 requires a **DEC amending DEC-005 + a SECURITY.md
  update + an explicit user decision**, none of which is granted by the Tier-1 approval. Framed as a
  documented follow-up; no Tier-2 spec may enter the cycle until that decision is made.

- [x] SPEC-061 (shipped 2026-07-11, PR #72) — **[TIER 1]** **Analytics event model + Sink seam (default
      OFF)** *(infra)*: the typed `AnalyticsEvent` union, the `Sink` interface + `noopSink` default, the
      `VITE_ANALYTICS_SINK` build-config gate (default `off`), and a never-throw `track()` seam proven
      no-op with no sink. No network, no UI. Authored **DEC-023** (analytics posture) — affirms DEC-005
      (default build zero-network), no no-backend amendment. Engine diff EMPTY; 12 new tests incl. a
      zero-network inert-proof; 0 verify defects. **[M]**
- [x] SPEC-062 (shipped 2026-07-12, PR #73) — **[TIER 1]** **Recording tap + ephemeral session + DNT**
      *(seam)*: emits `session_start` / `spin` / `cash_in` / `machine_switch` / `help_seen` from the
      existing STAGE-008/009/010 seams into `track()`; an in-memory-only session id (`crypto.randomUUID`,
      never persisted); a `navigator.doNotTrack` short-circuit. Promoted the Sink contract to a
      `TrackedEvent` envelope so the session id has a live consumer. Still default-off (noop sink) — a
      test proves no transport fires when off; engine diff EMPTY; 453 tests; 0 verify defects. **[M]**
- [ ] SPEC-063 (pending) — **[TIER 2 — GATED]** **Generic HTTP-endpoint sink** *(sink)*: an `HttpSink`
      — batched `navigator.sendBeacon` with a `fetch(keepalive)` fallback, swallow-all-failures —
      POSTing to a configured endpoint; the operator `connect-src` CSP note + `SECURITY.md` update for
      the enabled case. Self-hostable, no Cloudflare. **Remote sink → reverses no-backend; needs the
      DEC-005 amendment + user go.** **[M]**
- [ ] SPEC-064 (pending) — **[TIER 2 — GATED]** **Reference Cloudflare Worker+KV sink + [OPS]**
      *(sink/ops)*: a Worker ingestion route (alongside the assets binding, not a Pages Function —
      DEC-014) writing to KV; the [OPS] KV-binding step, `wrangler.jsonc` wiring, and the DEC-005
      amendment landed in `SECURITY.md`. Inert until deployed with a binding. **Remote sink → needs the
      DEC-005 amendment + user go.** **[L]**
- [ ] SPEC-065 (optional / stretch) — **[TIER 2 — GATED]** **Private `/stats` aggregate view** *(UI)*:
      a read-only view over the KV sink's aggregates. Depends on SPEC-064; defer to a fast-follow. **[M]**

**Count:** 2 shipped / 0 active / 3 pending — **✅ Tier 1 COMPLETE (SPEC-061 PR #72 seam + SPEC-062 PR #73
tap, both shipped default-OFF 2026-07-11/12)**; **Tier 2: 3 (SPEC-063/064/065; 2×M + 1×L), GATED** behind
a DEC-005 amendment + `SECURITY.md` update + explicit user go — not written, not driven.

## Design Notes

*Settled at frame (with rationale); anything genuinely design-cycle work is flagged. Because this stage
touches the no-backend posture, these settle the intent-level choices the user should confirm via
`framing_approved`.*

- **(1) Default OFF, gated at BUILD time — SETTLED.** The sink is chosen by a build-config env
  (`VITE_ANALYTICS_SINK`, default `off`; endpoint via env). The default build — including the auto-deploy
  to zany-animal-slots.jysf.org from `main` — is therefore analytics-off, zero-network, CSP-unchanged,
  DEC-005-intact. Rationale: a build-time gate makes "on" a deliberate operator rebuild/redeploy, so the
  public site can never start beaconing by accident; a runtime toggle would put the network path in the
  default bundle. Runtime/user toggle is explicitly out of scope this stage.
- **(2) One provider-agnostic `Sink` interface — SETTLED.** The app talks only to `Sink`
  (`track(event)` / `flush()`); `NoopSink` (default), `HttpSink`, and the Cloudflare Worker+KV (server
  side) all satisfy it. Rationale: same "consume plain data behind a seam" ethos as the config-driven
  machine — pluggable, unit-testable, no vendor lock, self-hostable. Exact interface shape is SPEC-061
  design work.
- **(3) Event set + privacy floor — SETTLED (payload fields are SPEC-061/062 design).** Anonymous events
  only: `session_start`, `spin`, `cash_in`, `machine_switch`, `help_seen` — the events already flowing
  through the STAGE-008/009/010 seams. **No PII, no cookie, no persistent id**; an **ephemeral in-memory
  session id** (regenerated every load, never stored); `navigator.doNotTrack` forces off. Rationale: this
  is telemetry for the fun-metric loop, not user tracking — it must honor the ethical floor DEC-005 sets.
- **(4) DEC-005 amendment scope — REFINED at the 2026-07-11 review (Tier split).** DEC-005's *core* (no
  real money / wagering / RTP) is unchanged, always. **DEC-023** (authored at SPEC-061 design, as DEC-020
  was at SPEC-054) records the analytics posture. In the **Tier-1** scope shipping now it **affirms
  DEC-005 holds** — the default build is zero-network, client-only, no backend — and **does NOT amend the
  no-backend clause**; it explicitly *defers* any such amendment to a future **Tier-2** decision. The
  no-backend amendment, the CSP `connect-src` change, the `SECURITY.md` update, and the KV binding are all
  **Tier-2 deliverables** (SPEC-063/064) that land ONLY when a remote sink is enabled — behind a separate
  DEC + explicit user go. So the default build's posture is unchanged and no DEC-005 amendment exists until
  Tier 2 is deliberately taken up.
- **(5) Beacon transport — SETTLED.** `navigator.sendBeacon` with a `fetch(keepalive)` fallback; batched,
  fire-and-forget, all failures swallowed; must never throw or block a spin. Rationale: mirrors the
  DEC-005 safe-storage discipline (never throw) and keeps the game path untouched even when a sink is on.
- **(6) Cloudflare sink is a Worker route, not a Pages Function — SETTLED (per DEC-014).** The reference
  ingestion route sits alongside the Workers Static Assets binding; KV is the store; the KV binding is the
  single [OPS] operator step. The reference code ships in-repo but is **inert** until deployed with a
  binding, so it never affects the default build.
- **(7) `/stats` view is OPTIONAL / deferrable — SETTLED as stretch.** The brief says "decide at the
  STAGE-011 frame." Decision: frame it as the last, optional spec (SPEC-065) — ship it only if the remote
  sink (SPEC-064) lands cleanly with schedule room; otherwise defer to a fast-follow. Rationale: it is the
  most separable slice of the most separable stage; the stage's value (a working, safe, default-off seam +
  sinks) is fully delivered by SPEC-061–064 without it.
- **Engine untouched (DEC-001).** Analytics is a side channel; the engine never sees an event. Every
  spec's `git diff … -- src/engine/` must be EMPTY.

## Dependencies

### Depends on
- **STAGE-009 (shipped):** the reactive recording seam over `SpinResult` + the cash-in (Reset) signal —
  the spin/cash-in events tap straight into it.
- **STAGE-008 (shipped):** the active-machine context — the `machine_switch` event and the machine tag on
  each event come from it.
- **STAGE-010 (shipped):** the `zany:help-seen` seam — the `help_seen` event source.
- **PROJ-001 (shipped):** the Cloudflare Workers Static Assets deploy (DEC-014) the reference sink extends
  with a route + KV; `public/_headers` CSP the enabled build amends (`connect-src`).
- **External (only if a remote sink is enabled):** a Cloudflare **KV** namespace binding (operator step)
  for the reference sink. The default-off build and the generic HTTP sink need no Cloudflare and no
  operator step.

### Enables
- The brief's **fun-metric iteration loop** (analytics → retune → re-measure) on real sessions.
- A possible PROJ-003 grounded in observed behavior (which machines get played, where first-timers drop
  off) rather than only the offline simulator.

## Stage-Level Reflection

*Filled in when status moves to shipped. Run Prompt 1c (Stage Ship) in FIRST_SESSION_PROMPTS.md to draft.*

- **Did we deliver the outcome in "What This Stage Is"?** <yes/no + notes>
- **How many specs did it actually take?** <number vs. plan>
- **What changed between starting and shipping?** <one sentence>
- **Lessons that should update AGENTS.md, templates, or constraints?**
  - <one-line updates>
- **Should any spec-level reflections be promoted to stage-level lessons?**
  - <one-line items>
