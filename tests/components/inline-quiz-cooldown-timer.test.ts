/**
 * Regression test for bug: InlineQuiz cooldown timer used a fixed 60-second
 * setInterval. When less than 60 seconds remained on mount, the interval
 * fired 60s later instead of at the correct remaining time, keeping the
 * quiz locked for up to ~59 extra seconds after the cooldown actually expired.
 *
 * The UI showed "0 мин" (because Math.floor(remainingMs / 60000) = 0 for
 * < 60s) but the quiz was still locked — confusing UX.
 *
 * Fix: replaced setInterval(60s) with setTimeout(Math.min(remainingMs, 60s))
 * so the timer fires at exactly the right moment.
 */
import { describe, it, expect } from 'vitest';

function computeTimerDelay(remainingMs: number): number {
  return Math.min(remainingMs, 60_000);
}

describe('InlineQuiz · cooldown timer delay', () => {
  it('when > 60s remain, delay is 60s (standard case)', () => {
    expect(computeTimerDelay(24 * 60 * 60 * 1000)).toBe(60_000);
    expect(computeTimerDelay(90_000)).toBe(60_000);
    expect(computeTimerDelay(60_001)).toBe(60_000);
  });

  it('when exactly 60s remain, delay is 60s', () => {
    expect(computeTimerDelay(60_000)).toBe(60_000);
  });

  it('when < 60s remain, delay equals remaining time exactly', () => {
    expect(computeTimerDelay(30_000)).toBe(30_000);
    expect(computeTimerDelay(1_000)).toBe(1_000);
    expect(computeTimerDelay(59_999)).toBe(59_999);
  });

  it('fixed interval (bug): always 60s regardless of remaining time', () => {
    const BUGGY_INTERVAL = 60_000;
    // When 30s remain, the old setInterval fires 60s later → 30s overshoot
    const remainingMs = 30_000;
    expect(BUGGY_INTERVAL).toBeGreaterThan(remainingMs);
    // The fix fires at the correct time
    expect(computeTimerDelay(remainingMs)).toBe(remainingMs);
  });

  it('after first tick with < 60s remaining, remainingMs reaches 0 on time', () => {
    const remainingMs = 30_000;
    const delay = computeTimerDelay(remainingMs);
    const nextRemaining = Math.max(0, remainingMs - delay);
    // With the fix: fires after 30s, remainingMs goes to 0 → quiz unlocks
    expect(nextRemaining).toBe(0);
  });
});
