/**
 * Coalesces a single physical "left the test tab" action into exactly one
 * counted violation.
 *
 * Bug: TestGuard.tsx listens for both `visibilitychange` (document hidden)
 * and window `blur` to catch tab-switches/alt-tabs during a proctored test,
 * each independently calling onViolation(). A single Ctrl+Tab / Alt+Tab
 * commonly fires BOTH events back-to-back in Chromium and Firefox, so one
 * real departure was counted as two violations — force-submitting the test
 * and triggering the 48h retake lockout (TestPanel, violations >= 3) after
 * only two real tab-switches instead of three (MAX_VIOLATIONS).
 *
 * Fix: a tiny latch. `depart()` returns true only for the FIRST departure
 * signal since the last `returned()` call; any second signal for the same
 * departure (the other event firing moments later) is swallowed. The next
 * real departure, after the user has actually come back, counts again.
 *
 * Lives in its own pure module (no DOM/React) so it's unit-testable without
 * jsdom/testing-library, which this project doesn't have set up.
 */
export function createDepartureGate() {
  let away = false;
  return {
    /** Call on visibilitychange(hidden) or window blur. Returns true if
     *  this signal should count as a new violation. */
    depart(): boolean {
      if (away) return false;
      away = true;
      return true;
    },
    /** Call on focus or visibilitychange(visible) — re-arms the gate so
     *  the next departure counts. */
    returned(): void {
      away = false;
    },
  };
}
