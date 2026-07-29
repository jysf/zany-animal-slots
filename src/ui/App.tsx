// Cabinet shell — composes the four portrait regions (SPEC-003).
// SPEC-013: calls useSlotMachine() and threads live state into child regions.
// SPEC-004: wrapped in a device-stage that frames the cabinet on desktop while
// leaving the phone layout full-screen (frame styles are gated behind min-width).
// SPEC-016: threads isSpinning into Game (as `spinning`) and Action so controls
// freeze and the reel animation plays during the spin phase.
// SPEC-017: threads autoSpinning / toggleAutoSpin into Action for the Auto toggle.
// SPEC-018: threads lineWins from the hook into Game so winning cells are highlighted.
// SPEC-019: threads lastWin into Status (WIN readout) and into the WinBadge, which
// now sits in the .cabinet__winbanner band under the header (repositioned so the
// win display no longer covers the reels) rather than overlaying the Game region.
// SPEC-022: destructures celebration from useSlotMachine and passes it to Status
// so the balance count-up fires on a win (driven by useCountUp inside Status).
// SPEC-025: renders JackpotMoment overlay inside .cabinet for the jackpot tier.
// SPEC-026: calls useAudio() and threads muted + toggleMute into Header.
// SPEC-027: destructures unlocked from useAudio() and calls useWinJingle.
// SPEC-030: calls useDynamicMixing for bus-level bed automation (swell/duck).
// SPEC-048: refs the stage root and applies the active machine's theme + audio
// params (default machine == today's values, so this is a no-op today).
import { useRef, useState } from 'react';
import './regions/regions.css';
import './device-frame.css';
import Header from './regions/Header';
import MachineSwitcher from './machine/MachineSwitcher';
import MachinePattern from './reels/MachinePattern';
import Game from './regions/Game';
import Status from './regions/Status';
import Action from './regions/Action';
import WinBadge from './reels/WinBadge';
import TrophyEarnedBadge from './trophies/TrophyEarnedBadge';
import JackpotMoment from './JackpotMoment';
import { useSlotMachine } from './useSlotMachine';
import { useAudio } from './audio/useAudio';
import { useWinJingle } from './audio/useWinJingle';
import { useGameSfx } from './audio/useGameSfx';
import { useDynamicMixing } from './audio/useDynamicMixing';
import { useMachineTheme } from './theme/useMachineTheme';
import { useMachineAudio } from './audio/useMachineAudio';
import { useStats } from './stats/StatsProvider';
import { useAdConfig } from './ads/AdConfigProvider';
import { useAdAdmin } from './ads/useAdAdmin';
import { activeAds } from './ads/adConfig';
import AdBanner from './ads/AdBanner';
import AdInterstitial from './ads/AdInterstitial';
import AdPopup from './ads/AdPopup';
import RewardedAd from './ads/RewardedAd';
import ChangelogSheet from './changelog/ChangelogSheet';

export default function App() {
  const { muted, toggleMute, unlocked } = useAudio();
  const { config: adConfig } = useAdConfig(); // PROJ-004 — ads render per the committed/overridden config
  const adAdmin = useAdAdmin(); // ?ads=1 reveals the owner's settings gear
  const ads = activeAds(adConfig);
  const showAds = adConfig.enabled && ads.length > 0;
  // PROJ-004: while the popup is over the reels, hide the on-machine banner; restore it after.
  const [popupActive, setPopupActive] = useState(false);
  const { stats } = useStats();
  const {
    machine,
    grid,
    balance,
    bet,
    lineWins,
    lastWin,
    celebration,
    spin,
    canSpin,
    isSpinning,
    increaseBet,
    decreaseBet,
    canIncreaseBet,
    canDecreaseBet,
    reset,
    addCredit,
    autoSpinning,
    toggleAutoSpin,
  } = useSlotMachine();

  useWinJingle(celebration, { muted, unlocked });
  useGameSfx(isSpinning, celebration, { muted, unlocked });
  useDynamicMixing(celebration, { muted, unlocked });

  const stageRef = useRef<HTMLDivElement>(null);
  useMachineTheme(stageRef, machine.presentation.theme);
  useMachineAudio(machine.presentation.audio);

  return (
    <div className="device-stage" data-testid="device-stage" ref={stageRef}>
      <div className="cabinet">
        <Header muted={muted} onToggleMute={toggleMute} adAdmin={adAdmin} />
        <div className="cabinet__winbanner">
          {/* SPEC-100: the reserved win band carries the watermark too — it is empty most of the
              time, so decoration is exactly what it should hold. */}
          {machine.presentation.pattern && (
            <MachinePattern symbolDisplay={machine.presentation.symbolDisplay} count={12} variant="band" />
          )}
          <WinBadge amount={lastWin} show={!isSpinning} tier={celebration?.tier} />
          {/* SPEC-077: sits alongside WinBadge in the in-flow winbanner band — never
              overlays the reel grid, so the lit winning cells stay visible on a win. */}
          <TrophyEarnedBadge trophyRank={!isSpinning ? (celebration?.trophyRank ?? null) : null} />
        </div>
        <Game grid={grid} spinning={isSpinning} lineWins={lineWins} celebration={celebration} />
        {showAds && adConfig.placements.banner && !popupActive && <AdBanner ads={ads} index={0} />}
        <Status balance={balance} bet={bet} lastWin={lastWin} celebration={celebration} />
        {/* SPEC-096: the machine switcher sits between the readout and the spin controls. */}
        <MachineSwitcher />
        <Action
          onSpin={spin}
          canSpin={canSpin}
          isSpinning={isSpinning}
          onBetDown={decreaseBet}
          onBetUp={increaseBet}
          canBetDown={canDecreaseBet}
          canBetUp={canIncreaseBet}
          onReset={reset}
          autoSpinning={autoSpinning}
          onToggleAuto={toggleAutoSpin}
        />
        <JackpotMoment celebration={celebration} />
        <footer className="cabinet__footer">
          {showAds && adConfig.placements.rewarded && (
            <RewardedAd rewardCoins={adConfig.rewardCoins} onReward={addCredit} adIndex={3} />
          )}
          <ChangelogSheet />
        </footer>
      </div>
      {/* PROJ-004 ads — driven by the ad config (committed default = off). */}
      {showAds && adConfig.placements.interstitial && <AdInterstitial ads={ads} index={0} />}
      {showAds && adConfig.placements.popup && (
        <AdPopup
          ads={ads}
          spins={stats.spins}
          everyNSpins={adConfig.popupEveryNSpins}
          onVisibilityChange={setPopupActive}
        />
      )}
    </div>
  );
}
