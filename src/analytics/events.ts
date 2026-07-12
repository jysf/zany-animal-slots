// events.ts — the anonymous usage-analytics event model (SPEC-061, STAGE-011, DEC-023).
// Pure types + the enumerable discriminant list. No PII, no identifiers, no cookies: every event is
// an anonymous game fact — the same events that already flow through the STAGE-008/009/010 seams.
// The engine never sees this module; it imports engine TYPES only (DEC-001).

import type { WinTier, BetLevel } from '../engine';

/** The analytics event discriminants, in one enumerable list (for tests + future validation). */
export const ANALYTICS_EVENT_TYPES = [
  'session_start',
  'spin',
  'cash_in',
  'machine_switch',
  'help_seen',
] as const;

/** The `type` discriminant of an AnalyticsEvent. */
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

/**
 * One anonymous usage event — a discriminated union on `type`.
 * Payloads carry only anonymous game facts (which machine, bet size, win amount/tier), never a user
 * identity. The transport envelope (timestamp, ephemeral session id, app version) is added by the
 * recording tap / sink layer (SPEC-062+), not here.
 */
export type AnalyticsEvent =
  | { readonly type: 'session_start' }
  | {
      readonly type: 'spin';
      readonly machineId: string;
      readonly bet: BetLevel;
      readonly totalWin: number;
      readonly tier: WinTier;
    }
  | { readonly type: 'cash_in'; readonly machineId: string }
  | { readonly type: 'machine_switch'; readonly from: string; readonly to: string }
  | { readonly type: 'help_seen' };
