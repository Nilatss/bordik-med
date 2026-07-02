/**
 * Bug: `TestGuard` treated window `blur` and `document.visibilitychange`
 * as two independent signals, each calling `onViolation()`. A single tab
 * switch (or alt-tab) fires BOTH events in the same tick, so one action
 * from the user counted as 2 violations against the stated "3 strikes"
 * policy — two ordinary tab switches during a real exam could force-submit
 * it and trigger the 48h retry lockout.
 *
 * `AwayGuard` coalesces any number of "departure" signals that happen
 * before the user returns into a single counted violation, then re-arms
 * once the user is back so the NEXT real departure still counts.
 */
export class AwayGuard {
  private away = false;

  /** Call on blur / visibilitychange→hidden. Returns true exactly once per
   *  departure — true the first time, false for any duplicate signal that
   *  fires before the user returns. */
  markDeparture(): boolean {
    if (this.away) return false;
    this.away = true;
    return true;
  }

  /** Call on focus / visibilitychange→visible. Arms the guard so the next
   *  departure counts again. */
  markReturned(): void {
    this.away = false;
  }

  reset(): void {
    this.away = false;
  }
}
