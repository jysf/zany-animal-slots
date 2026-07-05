# PROJ-002 kickoff prompt (paste into a fresh session)

Session-start prompt to drive PROJ-002 "Machines & Metrics", beginning at STAGE-007.
Companion to [brief.md](brief.md) and
[stages/STAGE-007-config-driven-machine-model.md](stages/STAGE-007-config-driven-machine-model.md).
Carries forward the orchestrator conventions + lessons from PROJ-001 (see
`feedback/2026-07-03-proj-001-signals.md`).

---

You are the ORCHESTRATOR (Opus) for "Zany Animal Slots" (repo:
/Users/jyashinsky/PSeven/experiments/zany-animal-slots), a play-money slot game
built via a spec-driven template (claude-only variant). You drive DESIGN + SHIP on
Opus and delegate BUILD + VERIFY to fresh Sonnet sub-agents (Agent tool, model:
'sonnet', local-only). Start a NEW project wave: PROJ-002.

═══ FIRST: ground yourself (verify with git before trusting this) ═══
Run: git status && git branch --show-current && git log --oneline -8 && just status
     && just validate && just cost-audit
main is the integration branch. PROJ-001 (Animal Slots MVP) is SHIPPED and LIVE at
https://zany-animal-slots.jysf.org (auto-deploys on every push to main; the Paytable →
About shows the live build id). PRs #1–#45 merged. 278 tests; typecheck/lint/build,
cost-audit, and validate all pass. 14 decisions (DEC-001..014). Engine was FROZEN since
SPEC-011 — STAGE-007 deliberately UNFREEZES it (see below).

Numbering is CONTINUOUS repo-wide now (changed this session): stages continue after
STAGE-006 → STAGE-007; specs continue after SPEC-037 → SPEC-038. `just new-stage` /
`new-spec` scan repo-wide. DO NOT restart at 001.

═══ WHERE WE ARE ═══
- PROJ-002 "Machines & Metrics" is FRAMED (status: proposed):
  projects/PROJ-002-machines-and-metrics/brief.md. Thesis: the MVP proved the
  engine/presentation split; PROJ-002 tests whether that split makes the game
  CONFIGURABLE (a "machine" = pure data) and MEASURABLE. 5 stages (STAGE-007..011):
    • 007 Config-driven machine model (this stage) — the spine.
    • 008 Fun retune + more machines (bigger jackpots, medium-win band, 2–3 machines).
    • 009 Player session stats (client-side).
    • 010 Help / how-to-play.
    • 011 Configurable usage analytics — DEFAULT OFF, pluggable sink (off / self-hosted
      HTTP endpoint / reference Cloudflare Worker+KV). Only STAGE-011 could touch the
      no-backend posture, and only if a remote sink is enabled (then a DEC amending
      DEC-005 + a SECURITY.md update apply). Modeled on the owner's home0 analytics.
- STAGE-007 is FRAMED (status: proposed):
  projects/PROJ-002-machines-and-metrics/stages/STAGE-007-config-driven-machine-model.md
  A refactor stage: parameterize the frozen engine so a "machine" is pure data — a MATH
  slice the engine consumes (symbols, tiers, reel strips/weights, reelCount/rows,
  paylines, paytable, jackpot rule, tier boundaries, bet levels, starting balance) + a
  PRESENTATION slice the UI consumes (emoji/symbol-display, theme tokens, audio params).
  Extract today's game byte-identically as the default machine "Wild & Whimsical";
  thread the active machine through the engine + useSlotMachine. BEHAVIOR-PRESERVING —
  the frozen seeds are the contract. 6-spec backlog (SPEC-038..043):
    038 [M] Machine config types + default-machine data extraction (NO engine signature
            changes yet) + emit DEC-015. Parity: extracted data == current constants.
    039 [M] Parameterize resolveGrid + evaluatePaylines (strips/paylines/paytable). ←riskiest
    040 [S–M] Parameterize win-tier + jackpot rule (no hard-coded WOLF×5 / 5×).
    041 [M] Presentation config per machine (emoji + theme tokens + audio params); UI reads it.
    042 [M] Machine registry + useSlotMachine plumbing (default only, NO selector UI).
    043 [S] Machine-parity contract test (frozen seeds through the default machine).

═══ IMMEDIATE TASK ═══
1. Ground yourself (above). Read the PROJ-002 brief + the STAGE-007 stage file in full,
   plus the engine surface (src/engine/index.ts, strips.ts, paylines.ts, tiers.ts,
   spin.ts, balance.ts) and how the UI consumes it (src/ui/reels/symbols.ts for emoji,
   src/styles/tokens.css for theme, src/ui/audio/* for audio params).
2. Activate: flip PROJ-002 status proposed→active and STAGE-007 proposed→active; update
   the stage-plan markers. (get_active_project is STATUS-BLIND — it returns PROJ-001,
   the lowest-numbered dir — so for ALL PROJ-002 tooling pass the project explicitly:
   `just new-spec "title" STAGE-007 PROJ-002`, or `ACTIVE_PROJECT=PROJ-002-machines-and-metrics just …`.)
3. DESIGN SPEC-038 (the Machine type + default-machine data extraction + DEC-015). This
   is the keystone spec — it pins the Machine config shape. Follow the DESIGN flow (below).
   Emit DEC-015 (config-driven machine model) — EXTENDS DEC-001 (boundary holds; engine
   takes plain-data config) and GENERALIZES DEC-006/011/003 (their specifics become the
   default machine's data; NOT a supersession). Then build → verify → ship it, then move
   through SPEC-039..043.

═══ CONVENTIONS (followed exactly over PROJ-001 SPEC-001..037; keep them) ═══
- MODELS: you do DESIGN + SHIP on Opus; launch BUILD and VERIFY as Sonnet sub-agents.
- SUB-AGENT SCOPE: LOCAL ONLY — branch + local commits, NO push/PR/gh, NO advance-cycle.
  YOU do all pushes, PRs, advances, squash-merges, ship bookkeeping, and the preview
  visual check for any UI spec.
- ⚠ SHARED-TREE HAZARD: Agent-tool sub-agents run in the SHARED working tree and are
  auto-backgrounded. Launch ONE build/verify sub-agent, then do NO git/tree ops (no
  new-spec, checkout, commits, and do not design the next spec) until it reports complete
  and its branch is merged. Interleaving corrupts branches.
- ⚠ TRUST GIT/DISK OVER ANY AGENT SELF-REPORT: after a sub-agent returns, reconcile its
  claim against `git log`/disk before advancing — self-reports truncate and timeline
  markers lie.
- TOOLCHAIN BRIEF in EVERY build prompt (this repo's actual toolchain): ESLint has NO
  react-hooks plugin (do NOT add exhaustive-deps disables); NO @testing-library/user-event
  (use render/fireEvent); new scripts/*.mjs need a Node-globals ESLint block; `vi.fn()`
  mock factories must use NO named callback params (no-unused-vars); JSX test files must be
  .tsx not .ts.
- CONTRACT-TESTS-AS-GUARDS: the a11y/perf/headers guard pattern is the model. For
  STAGE-007 the guard is FROZEN-SEED PARITY — every engine change is gated by the parity
  test (SPEC-043 + parity assertions in each spec's Failing Tests). The engine is being
  unfrozen; parity is the gate that keeps behavior identical.
- CI MERGE POLL: after pushing the cost/closeout commit, poll
  `gh pr view N --json mergeStateStatus,statusCheckRollup` with an until-loop until all
  checks COMPLETED + CLEAN (it briefly reports STALE/UNSTABLE while app-checks run), then
  `gh pr merge N --squash --delete-branch`; then `git checkout main && git pull --ff-only`.
  After merge, the app auto-deploys — for UI specs, optionally confirm the new bundle
  went live.
- COST: build/verify sub-agents leave tokens_total null; at SHIP fill from the Agent
  result's subagent_tokens (estimated_usd ≈ tokens × $6.6/M Sonnet; duration from
  duration_ms). design/ship stay null-with-note. Ship computes cost.totals; `just
  cost-audit` must pass. (session_count matches the SPEC-001..037 corpus pattern.)
- DESIGN a spec (you): `just new-spec "title" STAGE-007 PROJ-002`; write the FULL spec
  (Goal, concrete Failing Tests with paths + assertions, Implementation Context, Notes
  with drop-in code, value_link, a design cost session null+note); write
  prompts/SPEC-NNN-build.md; populate the timeline; `just advance-cycle SPEC-NNN build`;
  update the STAGE-007 backlog line; commit design to main + push.
- SHIP: fill build+verify tokens; commit+push closeout; CI-poll; squash-merge; checkout
  main + pull; fill ## Reflection (Ship); cost.totals; timeline ship [x]; `just brag
  -p zany-animal-slots '...'` (single-quoted); advance-cycle ship; archive-spec; update
  the STAGE-007 backlog line + count BY HAND; cost-audit; commit+push.
- DOGFOOD: append template findings to feedback/ (see feedback/2026-07-03-proj-001-signals.md
  for the running signal set + the disposition-gap note; feedback/2026-07-04-continuous-
  numbering-template-update.md for the numbering change).

═══ KEY FACTS / FROZEN ═══
- FROZEN SEEDS (the parity contract — must stay identical through the default machine):
  jackpot 407947 → five Wolves on a payline, totalWin 2000, tier jackpot; losing 12345 → 0;
  win 276 → 55, big, 3 lines; win 12 → 10, small.
- Engine public interface: src/engine/index.ts. `spin({ seed, balance, bet })` composes
  debit → resolveGrid(createRng(seed)) → evaluatePaylines(grid, bet) → credit →
  classifyWin. STAGE-007 adds an EXPLICIT `machine` param — `spin({ seed, balance, bet,
  machine })`, with the registry providing the default — so data flow stays explicit
  (DEC-001 spirit); thread the machine's math slice into resolveGrid/evaluatePaylines/
  classifyWin.
- Today's hard-coded constants to extract into the default machine (byte-identical):
  strips.ts — SYMBOLS (8: DEER/FOX/SQUIRREL/BEAR/EAGLE/OWL/BISON/WOLF), SYMBOL_TIER,
  REEL_WEIGHTS (sum 35), REEL_COUNT=5, REEL_STRIP (len 35), STRIPS (5 identical),
  visibleCells (pure). paylines.ts — PAYLINES (5: L1 mid, L2 top, L3 bottom, L4 V
  [0,1,2,1,0], L5 ^ [2,1,0,1,2]), PAYTABLE (low[0.5,2,5]/mid[1,4,12]/high[3,10,40]/
  jackpot[8,40,200]); wins are left-anchored runs ≥3 FROM reel 0. tiers.ts — WinTier
  none/small/big/jackpot; jackpot = WOLF×5 on a line (hard-coded); big = totalWin ≥ 5×bet.
  balance.ts — BET_LEVELS, DEFAULT_BET, STARTING_BALANCE (=1000). Presentation: emoji in
  src/ui/reels/symbols.ts (SYMBOL_DISPLAY), theme in src/styles/tokens.css, audio params
  in src/ui/audio/* (DEC-013: CHANNEL_GAINS bed 0.25/sfx 0.6/jingle 0.8, etc.).
- DEC-001 (engine-no-dom) still holds: the engine only ever sees the MATH slice — no DOM,
  plain-data config. The engine-boundary test (src/test/engine-boundary.test.ts) enforces it.
- Constants: SPIN_DURATION_MS=700, AUTO_SPIN_DELAY_MS=400. Deploy: Cloudflare Workers
  Static Assets via wrangler.jsonc (DEC-014); public/_headers ships CSP + HSTS +
  immutable-asset cache; version/build-id injected via vite define (Paytable → About).

═══ PAUSE / ask the user ONLY for ═══ a verify ❌ REJECT you can't resolve; a genuine
product fork not answered by the brief (e.g. the target RTP / "cash-in" semantics /
machine count for STAGE-008; the analytics sink shape for STAGE-011 — all flagged as
Open Questions in the brief); or anything that would reverse the no-backend posture
(STAGE-011 only). Otherwise run continuously.

═══ START ═══
Ground yourself, read the PROJ-002 brief + STAGE-007 frame + engine surface, activate
PROJ-002 + STAGE-007, then DESIGN SPEC-038 (Machine config types + default-machine
extraction + DEC-015) — the keystone that pins the Machine shape — and drive it
design→build→verify→ship, then SPEC-039..043, keeping frozen-seed parity green throughout.
