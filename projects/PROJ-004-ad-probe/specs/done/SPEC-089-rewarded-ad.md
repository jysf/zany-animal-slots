---
task:
  id: SPEC-089
  type: story
  cycle: ship
  blocked: false
  priority: medium
  complexity: M
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
    - DEC-005
    - DEC-010
  constraints:
    - no-real-money
    - touch-targets-44
    - respect-reduced-motion
  related_specs:
    - SPEC-084
    - SPEC-087
value_link: "A rewarded 'watch a fake ad for coins' mechanic — the one ad that's a fun game beat, granting PLAY money only."
cost:
  sessions:
    - cycle: design
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: null
      recorded_at: 2026-07-24
      note: "User pick; built inline."
    - cycle: build
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 48000
      estimated_usd: 0.96
      recorded_at: 2026-07-24
      note: >-
        useSlotMachine.addCredit(amount) (balance += floor(amount), persisted; not a win, leaves
        stats net untouched; non-positive no-op). RewardedAd: a '📺 Free coins' button opens a fake
        ad that 'plays' 3s then credits config.rewardCoins play-money; reduced-motion skips straight
        to the reward. Config gains placements.rewarded + rewardCoins (clamped 50..5000);
        AD_CONFIG_VERSION bumped to 2 (invalidates v1 overrides). Panel gains the toggle + amount;
        Copy-as-default emits rewardCoins. no-real-money: play coins only, no purchase/network.
    - cycle: verify
      interface: claude-code
      model: claude-opus-4-8
      tokens_total: 16000
      estimated_usd: 0.32
      recorded_at: 2026-07-24
      note: "Real render: '📺 Free coins' → reward modal → Collect credits balance 1000→1500 (persisted). Storage clamps tested. 0 defects."
    - cycle: ship
      agent: claude-opus-4-8
      interface: claude-code
      tokens_total: null
      recorded_at: 2026-07-24
      note: "main-loop ship; PROJ-004 draft branch."
  totals:
    tokens_total: 64000
    estimated_usd: 1.28
    session_count: 4
---

# SPEC-089: Rewarded ad → play-money coins

## Goal
A "watch a fake ad for coins" mechanic: a small "📺 Free coins" button plays a brief fake ad, then
credits PLAY-money coins to the wallet. No real money (no-real-money), first-party/offline.

## Outputs
- `useSlotMachine` — `addCredit(amount)` (balance top-up; not a win; non-positive no-op).
- `src/ui/ads/RewardedAd.tsx` — trigger + fake-ad modal (3s "play" → reward; reduced-motion instant).
- `adConfig` — `placements.rewarded` + `rewardCoins` (clamped 50–5000); `AD_CONFIG_VERSION` → 2.
- `AdSettingsSheet` — rewarded toggle + reward-amount field; Copy-as-default emits `rewardCoins`.
- `App.tsx` footer mounts it (gated on config). `fakeAds.adAt` restored (a consumer again).

## Acceptance
- [x] "📺 Free coins" (when enabled + rewarded) plays a fake ad, then Collect credits `rewardCoins`
      play-money to the balance (persisted). Reduced-motion skips the wait. no-real-money holds;
      no network/tracking. Session net/win-rate unaffected. Engine/audio diffs empty; gate green.
