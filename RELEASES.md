# Animal Slots — Release Notes

What changed in **the game**, newest first, written for the people who play it.

> Not to be confused with [`CHANGELOG.md`](./CHANGELOG.md), which tracks the *spec-driven
> template* this repo is built with (its own `v5.x` version line). This file is the app.

---

## 2026-07-25 — Two New Machines

**Two more machines to play, and they feel genuinely different from each other.**

The roster had four machines that mostly felt alike. Now there are six, and the two new ones sit
at opposite ends: one that pays rarely and big, one that pays constantly and small. Pick the mood
you're in.

### What's new

- **Farm 🚜 — for when you want the swing.** A barnyard machine (🐔🐷🐑🐮🦆🐐🐴 with a tractor
  jackpot) tuned to be the roster's most volatile. Wins land on about **1 spin in 4** — noticeably
  drier than the others — but when they land they're bigger, and the jackpot is genuinely rare.
  Long quiet stretches are the point.
- **Diner 🎂 — for when you want the drip.** A food-and-drink machine (🍕🍔🌮🍩🍜🥤🍣 with a
  birthday-cake jackpot) tuned to be the friendliest on the roster. Something hits on **nearly
  half of all spins**. The wins are small — often just your bet back — but the reels rarely go
  cold, and its jackpot is the most reachable of the six.
- **Every machine still has its own everything.** Both new machines bring their own reel
  creatures, their own colour scheme, and their own sound — same as Arctic, Desert, Ocean, and
  Wild & Whimsical.

### What did NOT change

- **Your balance, your record, and your trophies are untouched.** Adding machines changed nothing
  about your saved progress.
- **Wild & Whimsical is still the machine you start on.** Nothing switched under you.
- **None of the existing four machines were re-tuned.** Arctic, Desert, Ocean, and Wild &
  Whimsical pay exactly as they did before.

*Under the hood: SPEC-090 (Farm), SPEC-091 (Diner).*

---

## 2026-07-24 — The Trophy Case

**Your best wins are now saved, and you can watch them again.**

Until now, a big win flashed on screen and then vanished — the only trace was a number in a
stats tile. Now the game keeps your ten best wins of the session and shows them back to you as
real reels.

### What's new

- **A trophy case.** Open **Your record** (the 📊 in the header) and you'll find two tabs —
  **Trophies** and **Numbers**. The Trophies tab holds your ten best wins, each shown as the
  actual 5×3 grid that produced it, with the winning cells lit up.
- **Every trophy remembers its machine.** A win on Arctic shows Arctic's creatures, even while
  you're playing Ocean. Your trophies look like where you won them.
- **A podium.** Your top three get full cards with medals and tier framing. Ranks 4–10 sit as
  compact rows — tap any of them to expand it.
- **Replay.** Tap **Replay this win** on any trophy and its reels spin up and drop back into
  that winning grid, lines lighting, paws popping. Watch your jackpot land again.
- **"NEW BEST!"** A badge now appears the moment a spin earns a place in the case — with a
  distinct treatment when you knock off your #1.
- **Know what you're chasing.** Each trophy shows what it paid *relative to your bet* ("24× your
  bet"), so a big win on a small bet gets its due. Once the case is full, you'll see the number
  to beat to get in.
- **A drought counter.** "Spins since your last trophy" — for when it's been a while.
- **An emptier case is an invitation.** With no wins yet, you'll see ten locked plinths waiting
  to be filled rather than a blank panel.

### Also changed

- **"Session stats" is now "Your record."** The old name was wrong: this record survives
  reloads and closing the tab. It's not a session, it's your history.
- **Your stats now live on their own tab.** Spins, win rate, net winnings, cash-ins, the drought
  counter, and the winnings-over-time chart are all on **Numbers** — visible at a glance without
  scrolling past anything.
- **The "Biggest win" tile is gone** — replaced by the #1 trophy, which tells you the same thing
  plus the reels, the machine, the bet, and the spin number.
- **Clearing** is now **"Clear record"**, and it says plainly that trophies go too. It's
  available from either tab.

### Your existing stats were not touched

Adding trophies did **not** reset anything. Your spins, biggest win, winnings-over-time, and
cash-ins all carried over exactly as they were — the trophy case simply starts empty and fills
as you play.

### Under the hood

- No new dependencies, no backend, no tracking. Everything stays in your browser
  (`localStorage`), as before.
- The game engine was not modified at all — trophies are assembled entirely from data each spin
  already produced.
- Sound is unchanged. The trophy case is silent by design.

<sub>PROJ-003 · 7 specs (SPEC-073–079) · PRs #85–#92</sub>
