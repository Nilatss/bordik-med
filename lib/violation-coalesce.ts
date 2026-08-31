/**
 * createViolationCoalescer — de-dupe guard for TestGuard's tab-switch
 * violation detection.
 *
 * Bug: TestGuard listened to BOTH `document.visibilitychange` and window
 * `blur` to catch a user leaving the test tab, and each listener called
 * `onViolation()` independently. In every mainstream browser, switching
 * tabs / alt-tabbing / minimising fires both events for the SAME action —
 * so one tab switch was counted as 2 violations. With MAX_VIOLATIONS = 3,
 * a user got force-submitted (and locked out 48h) after roughly 2 honest
 * tab switches instead of the advertised 3.
 *
 * Fix: both listeners call the same coalescer before firing a violation;
 * only the first call within `windowMs` of the previous one is allowed
 * through. Pure and timestamp-based (no setTimeout) so it stays trivially
 * unit-testable, and is imported by BOTH TestGuard.tsx and its test.
 */
export function createViolationCoalescer(
  windowMs = 100,
  now: () => number = Date.now,
): () => boolean {
  let lastFireAt = -Infinity;
  return function shouldFire(): boolean {
    const t = now();
    if (t - lastFireAt < windowMs) return false;
    lastFireAt = t;
    return true;
  };
}
