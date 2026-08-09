# Audio Spike — probe & recommendation (2026-07-15)

**Type:** spike (investigation/probe, not a build). Pre-project work — PROJ-001 and
PROJ-002 are both shipped/closed. Nothing here ships without an explicit go.

**Question:** What should this play-money slot game *sound* like, and can the current
in-browser synth (Tone.js, DEC-007/DEC-013) get there, or does it need sampled assets?

**Deliverable:** a recommendation the user can approve before any build wave starts,
plus a runnable A/B demo (`/audio-spike.html`) to judge feel by ear.

---

## 1. What the audio is today, and why it reads "cheap"

The whole suite lives in `src/ui/audio/**`, all synthesized at runtime, routed through
a shared singleton graph (master `Gain` → `bed`/`sfx`/`jingle` channel gains). Per sound:

| Sound | File | Synthesis today |
|---|---|---|
| Spin whoosh | `sfx.ts` | one `NoiseSynth` (white), fast decay |
| Reel-stop | `sfx.ts` | 5× `MembraneSynth` hits, all `C2`, 90 ms apart |
| Win ting | `sfx.ts` | one `MetalSynth` at `C6` |
| Win jingle | `jingle.ts` | bare `Synth` arpeggio (3/5/7 notes by tier), `8n`, 120 ms apart |
| Ambient bed | `ambientBed.ts` | `PolySynth(Synth)` re-triggers the **same 4-note chord** every **2 measures**, half-note |

**The single biggest finding: there is not one effects node anywhere in `src/`.**
`grep -rn "Reverb\|Filter\|Compressor\|EQ3\|Chorus\|Delay" src/` → **zero hits.** Every
sound is a bare default Tone synth (basic triangle/sine oscillator, default envelope) run
bone-dry straight into a gain. Dry default oscillators are exactly the "harsh / cheap /
video-game-buzzer" timbre. This is the primary tell, and it's the cheapest to fix.

Secondary tells:

- **The bed is the worst offender — the "repeating bing."** It re-*attacks* the identical
  chord on a hard downbeat every 2 measures with no movement, no melody, no evolving
  texture, and a fast default envelope. A pad that re-attacks on a timer reads as a loop
  point / notification chime, not music. (The per-machine variants only swap the chord and
  timings — same structural problem.)
- **Bare voices.** Default `Synth`/`PolySynth` with default envelopes have no warmth,
  body, or resolution. The jingle stops dead on its last arp note (no resolving chord).
- **No shared space.** Because nothing shares a reverb, sounds don't feel like they're in
  the same room — they feel like separate beeps.

None of these are Tone.js limitations. They're *un-produced* defaults. Tone already ships
`Reverb`, `Filter`, `AutoFilter`, `Chorus`, `FMSynth`, envelopes, etc. — all already in the
7 MB dep we've paid for. **There is a large amount of "produced" quality available in code,
before we ever touch an asset file.**

Context to respect: DEC-007 (synth-only, no assets), DEC-013 (the singleton master+channel
graph — good, keep it), the `audio-gesture-and-mute` constraint, DEC-005 taste note (no
faked anticipation — so no fake "near-miss" build-ups), and the recent iOS-audio-unlock /
Safari fixes (SPEC-071/072) which the retune must not regress.

---

## 2. Options & tradeoffs

### (a) Retune the existing synth — **recommended**
Stay 100% synth-only. Add a small shared **effects bus** (reverb + gentle low-pass, maybe
light master compression), replace bare synths with warmer voiced ones + real ADSR
envelopes, and **rebuild the bed** so it swells and breathes (long attack/release + slow
filter movement, staggered onsets, longer loop) instead of re-attacking on a timer. Optionally
drop the bed's hard re-trigger entirely in favor of a slow evolving drone or a sparse
generative motif.

- **Bundle:** ~0 growth. `Reverb`/`Filter`/`AutoFilter` are already in Tone; tree-shaking
  pulls a bit more of a dep we already ship (current built JS ≈ 418 KB incl. React+Tone).
- **Ethos / DEC-007:** unchanged — no asset files, audio stays versionable code.
- **Licensing:** none.
- **Effort:** low–moderate. Bounded to `src/ui/audio/**`; the DEC-013 graph is untouched;
  per-machine params still work (add an `fx`/voice layer to `MachineAudio` later if wanted).
- **Ceiling:** synthesized audio has an inherent character. A *retuned* synth can sound
  warm, spacious, and intentional (see the demo), but it will not sound like a
  studio-recorded orchestral jackpot fanfare. For a whimsical animal slot, that ceiling is
  likely *high enough*.

### (b) Move to sampled / recorded assets
Best raw fidelity for showpiece moments (a real coin cascade, a recorded pad, a wolf howl).

- **Bundle / network:** adds asset files + a loading path; audio no longer inlined as code;
  network weight + decode.
- **Ethos / DEC-007:** **reverses it** — introduces the asset+licensing pipeline DEC-007
  exists to avoid. Requires a DEC amending DEC-007 and a `docs/license-policy.md` review
  (CC0 sourcing, attribution).
- **Licensing:** real work — sourcing verified-CC0 audio, provenance tracking.
- **Effort:** high (sourcing + pipeline + loader + tests + license gate), most of it
  *not* audio-design work.
- Note: DEC-007 already parked "a single CC0 wolf-howl sample" as the one plausible
  exception — i.e. this was always the escalation path, not the starting point.

### (c) Hybrid
Retuned synth for the mechanical layer (whoosh/clunk/ting — synth is genuinely fine here),
plus **one or two** tiny CC0 samples only for the showpiece (jackpot fanfare) and/or a
recorded ambient loop for the bed.

- **Bundle/licensing/effort:** between (a) and (b); still reverses DEC-007 (needs the DEC +
  license review), but scoped to 1–2 files.
- Sensible **later escalation** *if* a full retune still reads cheap on the big moments.

---

## 3. Recommendation

**Do (a) first: a synth-retune project. Do not reverse DEC-007 yet.**

Rationale: the dominant defects — total absence of effects, bare default voices, and a bed
that re-attacks instead of breathing — are all fixable in code at ~zero bundle cost and no
licensing. We haven't spent the synth budget we already have; jumping to assets now would
pay the DEC-007 reversal and licensing cost to fix something a reverb + envelope pass and a
bed rewrite likely fix for free. Escalate to a single CC0 sample (option c) **only if** the
retuned showpiece moments still fall short by ear — and that escalation is a deliberate DEC,
not a default.

**DEC status:** the recommended direction (synth-only retune) **does not reverse DEC-007**,
so no new DEC is required to start it. A DEC amending DEC-007 becomes required *only* if we
later choose option (b)/(c) and introduce asset files. (Draft trigger noted below.)

### Proposed project frame

> **PROJ-003 — Audio Feel** (proposed; the natural next wave, or later at the user's call)
>
> **Thesis:** The game's synthesized audio currently reads as cheap/harsh and the ambient
> bed loops a "bing." Prove that a *produced* synth pass — shared effects bus, warmer
> voices, a breathing bed — makes the audio feel intentional and pleasant on real devices,
> staying 100% synth-only (DEC-007 intact) at ~zero bundle cost.
>
> **Success signals:**
> - A shared effects bus (reverb + tone-shaping) exists in the DEC-013 graph; no sound is
>   bone-dry.
> - The ambient bed no longer re-attacks a chord on a timer — it evolves/breathes (or is a
>   sparse motif), verified by ear on desktop + a real iOS device (Safari).
> - Jingle and SFX are re-voiced with real envelopes and a resolving jingle.
> - No asset files added; built-JS growth negligible; iOS unlock + mute (SPEC-071/072,
>   `audio-gesture-and-mute`) still pass.
> - Per-machine audio params still theme correctly (arctic/desert/ocean/wild) after the
>   retune.
>
> **Explicitly out of scope / gated:** sampled assets (would need a DEC amending DEC-007);
> STAGE-011 Tier 2 analytics (separately gated); any faked anticipation (DEC-005).
>
> **Proposed STAGE-1 / first spec — "Shared effects bus + bed rewrite":**
> Add a reverb + gentle low-pass (optionally light master compression) as shared nodes in
> the audioEngine graph that channels feed, and rebuild `ambientBed.ts` so the bed swells
> and breathes instead of re-triggering. This is the highest-leverage single change (kills
> the two worst tells at once) and de-risks the rest. Voicing passes for jingle/SFX follow
> as their own specs.

Suggested spec sequencing after STAGE-1: (2) jingle re-voice + resolving chord, (3) SFX
re-voice (whoosh/clunk/ting), (4) per-machine voice/fx params + re-tune the 4 machines,
(5) real-device verification pass (desktop + iOS Safari) + mute/unlock regression.

---

## 4. Prototype (behind a flag — spike only, not shipped)

A throwaway A/B demo lets the user judge feel by ear:

- Page: **`/audio-spike.html`** (dev only) → run `just dev`, open
  `http://localhost:5173/audio-spike.html`.
- Code: `src/ui/audio/_spike/` (`spikeSounds.ts`, `spikeDemo.ts`). Imported **only** by the
  demo page — the production app tree is untouched.
- Buttons play **CURRENT vs RETUNED** for the bed, the win jingle, and the reel-stop SFX.
  RETUNED = shared reverb + low-pass bus, warmer voices with real envelopes, and a bed that
  swells + breathes via a slow `AutoFilter` and staggered long-attack onsets.

Verified in the in-app Chromium preview: page loads, Tone v15 initializes, and exercising
all six A/B variants (including the new `Reverb`/`Filter`/`AutoFilter` nodes) throws **no
console errors** — the retuned graph builds and plays. The agent cannot *hear* it, so the
sound-quality judgment is the user's: **A/B by ear, ideally also on a real iOS device /
Safari** (this session's Safari/iOS bugs were invisible to Chromium + unit tests).

**Cleanup:** delete `audio-spike.html` + `src/ui/audio/_spike/` when the spike closes (they
are additive and isolated; nothing else imports them).

---

## 5. Ask

Please **A/B the demo by ear** and pick a direction:

1. **Approve (a)** — greenlight framing **PROJ-003 Audio Feel** (synth retune, no DEC needed
   to start) and its first spec (effects bus + bed rewrite); or
2. **Prefer (c)** — you want 1–2 CC0 samples for the showpiece → I'll draft the DEC amending
   DEC-007 + the license-policy note first; or
3. **Park it** — leave audio as-is for now.

No build wave starts until you approve one.
