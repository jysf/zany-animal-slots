# Data Model

**No backend, no database, no relational model.** Animal Slots is a client-only
SPA. All persistent state is browser `localStorage`, owned entirely by the
presentation layer — the engine persists nothing and is stateless across spins
except for the in-memory bet/balance it is handed.

| Key | Shape | Purpose |
|---|---|---|
| `zany-animal-slots.balance` | number (coins) | Player's play-money balance. Reset restores it to 1000 (`STARTING_BALANCE`). |
| `mute` | `'true'` / `'false'` | Global audio mute. Defaults to **muted** when absent (DEC-025, quiet by default). |
| `zany:active-machine` | machine id | Which of the six machines is selected. Unknown/absent → the default (Wild & Whimsical). |
| `zany:stats` | versioned JSON | Session stats: spin count, biggest win, cash-ins, the winnings series behind the sparkline, and `topWins` (DEC-020). |
| `zany:help-seen` | versioned JSON | Which first-run explainer versions have been shown (DEC-022). |
| `zany:ad-config` | JSON | Local settings for the first-party fake-ad probe (PROJ-004). No ad network, no real money. |

Two keys predate the namespacing convention (`zany-animal-slots.balance` and
`mute`); everything since uses the `zany:*` prefix. Renaming them would silently
reset existing players' balances, so they stay as-is.

## Read/write discipline

Every reader is guarded and **never throws** — `localStorage` can be absent,
disabled, full, or hold data written by an older build. Absent, corrupt, or
wrong-version data falls back to an empty/default value rather than propagating
an error into the game. The versioned blobs (`zany:stats`, `zany:help-seen`)
carry an explicit version and are discarded wholesale on mismatch; there is no
migration path, because none of this data is worth migrating.

**Trophies are derived, not stored** — the trophy case is computed from
`zany:stats` (`topWins`) on read. There is no separate trophy key.

## Not stored

The per-spin `SpinOutcome` the engine returns to the UI is an in-memory value,
not persisted; it is described in `architecture.md` (Data Flow). Nothing is sent
anywhere: the usage-analytics seam ships **OFF by default** with zero network
calls and honors Do-Not-Track (DEC-023).

See `DEC-005` (play-money, local-only balance) and `DEC-020` (session-stats
model).
