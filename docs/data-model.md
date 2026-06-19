# Data Model

**Not applicable.** Animal Slots is a client-only SPA with no backend, no
database, and no relational data model.

The only persistent state is two browser `localStorage` keys, owned entirely by
the presentation layer:

| Key | Type | Purpose |
|---|---|---|
| `balance` | number (coins) | Player's current play-money balance; Reset restores it to 1000. |
| `mute` | boolean | Global audio mute state. |

Both are play-money / UI-preference values, not records. There is no migration
or retention strategy beyond "Reset clears the balance back to 1000." The
engine itself is stateless across spins except for the in-memory bet/balance it
is handed — it persists nothing.

The transient per-spin data shape (`SpinResult`) that the engine returns to the
UI is described in `architecture.md` (Data Flow), not here, because it is an
in-memory value, not stored data.

See `DEC-005` (play-money, local-only balance).
