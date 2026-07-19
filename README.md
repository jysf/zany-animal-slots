# 🎰 Zany Animal Slots

A **play-money, mobile-first web slot game** — spin a 5×3 reel of animals across four themed machines,
chase the jackpot, and watch your session stats. No real money, ever: it's built purely for fun (and as
a clean, config-driven demo of an engine/presentation split).

**▶ Play it:** [zany-animal-slots.jysf.org](https://zany-animal-slots.jysf.org)

> **Play-money only.** The balance is a cosmetic number in `localStorage`; **Reset** tops it back up.
> There is no real currency, wagering, or purchases of any kind, and no advertised return-to-player — the
> reel math is tuned for *feel*, not a regulated payout.

## Features

- **Four machines, four worlds** — **Wild & Whimsical** (a rainbow menagerie under a magical-plum theme),
  **Arctic**, **Desert**, and **Ocean**. Each has its own reel creatures, color theme, music, and tuned
  math. Switch anytime from the header; your choice persists across reloads.
- **Real slot mechanics** — 5×3 reels, **20 fixed paylines**, weighted reel strips, Small / Big / Jackpot
  win tiers, adjustable bet levels, and hands-free **auto-spin**.
- **Juice** — paw-print trails, particle bursts, a balance count-up, a jackpot moment, and tier-scaled
  synthesized sound (with a `prefers-reduced-motion` fallback).
- **Session stats** — a winnings-over-time sparkline, biggest win, spin count, and cash-ins, all persisted
  locally.
- **How-to-play** — a first-run explainer so newcomers understand the game without help.
- **Privacy-first** — 100% client-side; no accounts, no PII, no third-party trackers, no ads. A pluggable
  usage-analytics seam ships **OFF by default** (zero network calls) and honors Do-Not-Track.

## Tech

- **TypeScript** (strict), **React 18** + **Vite**
- Vanilla CSS + **design tokens** (no UI library); per-machine theming via CSS custom properties
- **Tone.js** — all audio is synthesized in the browser (no audio asset files)
- **No backend** — a static SPA deployed on **Cloudflare Workers Static Assets**
- **Vitest** + React Testing Library; ESLint + Prettier
- The game **engine** (`src/engine/**`) is pure TypeScript with **zero DOM coupling** — a "machine" is
  just config data, so adding a variant or retuning the math is *data, not code*.

## Run it locally

```bash
npm install
npm run dev        # start the Vite dev server (http://localhost:5173)
npm test           # run the test suite (Vitest)
npm run lint       # ESLint (incl. the engine/no-DOM import boundary)
npm run typecheck  # tsc --noEmit (strict)
npm run build      # production build → static assets in dist/
```

`just` wrappers exist too (`just dev`, `just test`, `just build`, …) — run `just --list`.

## Where things live

| Path | What |
|---|---|
| `src/engine/**` | Pure game logic — RNG, reel strips, spin, paylines, win tiers, balance. No DOM. |
| `src/machines/**` | The four machines as **config objects** (symbols, weights, paytable, theme, audio). |
| `src/ui/**` | React components, per-machine theming, and the juice layer. |
| `src/analytics/**` | The default-OFF, provider-agnostic usage-analytics seam. |
| `docs/architecture.md` | Module layout + the engine/presentation rationale. |
| `decisions/` | Architecture decision records (`DEC-*`). |
| `SECURITY.md` | Security posture (client-only, no PII, default-off analytics). |

## How this repo is built

Zany Animal Slots is developed with a **spec-driven, AI-agent workflow** (architect → implementer →
reviewer, across separate sessions). You don't need any of it to run or hack on the game — that machinery
lives in [`AGENTS.md`](AGENTS.md) and [`docs/spec-driven-workflow.md`](docs/spec-driven-workflow.md).

## License

[Apache License 2.0](LICENSE).
