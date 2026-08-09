# Animal Slots — Release Notes

What changed in **the game**, newest first, written for the people who play it.

> Not to be confused with [`CHANGELOG.md`](./CHANGELOG.md), which tracks the *spec-driven
> template* this repo is built with (its own `v5.x` version line). This file is the app.

---

## 2026-07-29 — The Cabinet

**The game finally looks like a machine.**

Everything you play with is the same — same six machines, same odds, same balance and trophies.
This release is about the thing they all sit inside, which until now was closer to a wireframe
than a slot cabinet.

### What's new

- **A real cabinet.** The reels now sit in a recessed, bezelled window cut into a lit machine face,
  with the balance readout as its own inset display panel and the buttons on a raised control deck.
  Every machine's chrome is coloured to match its own theme — Ocean's is teal, Farm's is green,
  Diner's is warm amber.
- **No more floating in space.** The machine used to sit in a large empty void on tall screens.
  It's now a single unit that fills the screen properly, and it **resizes to fit shorter windows**
  instead of pushing the Spin button off the bottom.
- **A pattern behind the reels.** Each machine shows a faint watermark of its *own* creatures —
  barnyard animals on Farm, sea life on Ocean, food on Diner.
- **Switching machines is easier.** The cramped dropdown is gone. There are now **◀ ▶ arrows** with
  the machine's name between them, sitting right above the Spin button, so you can always see which
  machine you're on. Arrow keys work too.
- **"Wild & Whimsical" is now just "Whimsy."** Same machine, same reels, same everything — the old
  name was too long to fit on a phone.
- **The win paw-prints moved.** They used to land on top of the symbol you'd just won with. Now
  they sit in the corner so you can actually see the winning symbols.

### What did NOT change

- **Your balance, your record, and your trophies are all untouched.** Renaming a machine changed
  only its label, never its identity, so every trophy still remembers exactly where it was won.
- **No machine's odds changed.** Not one payout, weight, or jackpot rule moved in this release.

*Under the hood: SPEC-092 through SPEC-105.*

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
