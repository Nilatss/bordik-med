/**
 * Tests for `AwayGuard` in lib/test-guard-away.ts.
 *
 * Bug: `TestGuard` called `onViolation()` separately from BOTH a window
 * `blur` handler and a `document.visibilitychange` handler. A real tab
 * switch fires both events in the same tick, so one tab switch counted as
 * 2 violations against the "3 strikes" policy — two ordinary alt-tabs
 * during a live exam could force-submit it and trigger the 48h lockout.
 *
 * `AwayGuard.markDeparture()` must coalesce repeated departure signals
 * into a single counted violation until the user returns.
 */
import { describe, it, expect } from 'vitest';
import { AwayGuard } from '@/lib/test-guard-away';

describe('AwayGuard', () => {
  it('counts a single departure signal', () => {
    const guard = new AwayGuard();
    expect(guard.markDeparture()).toBe(true);
  });

  it('coalesces blur immediately followed by visibilitychange (the real tab-switch bug)', () => {
    const guard = new AwayGuard();
    // Simulates: window blur fires, then document.visibilitychange fires,
    // both from the same tab switch.
    const blurCounted = guard.markDeparture();
    const visibilityCounted = guard.markDeparture();
    expect(blurCounted).toBe(true);
    expect(visibilityCounted).toBe(false);
  });

  it('coalesces visibilitychange immediately followed by blur (either event order)', () => {
    const guard = new AwayGuard();
    const visibilityCounted = guard.markDeparture();
    const blurCounted = guard.markDeparture();
    expect(visibilityCounted).toBe(true);
    expect(blurCounted).toBe(false);
  });

  it('counts a second departure after the user returns', () => {
    const guard = new AwayGuard();
    expect(guard.markDeparture()).toBe(true); // 1st tab switch — counted
    guard.markReturned();
    expect(guard.markDeparture()).toBe(true); // 2nd tab switch — counted
  });

  it('still coalesces duplicate signals on the second departure too', () => {
    const guard = new AwayGuard();
    guard.markDeparture();
    guard.markReturned();
    expect(guard.markDeparture()).toBe(true);
    expect(guard.markDeparture()).toBe(false); // duplicate signal for 2nd departure
  });

  it('markReturned before any departure is a no-op', () => {
    const guard = new AwayGuard();
    guard.markReturned();
    expect(guard.markDeparture()).toBe(true);
  });

  it('reset() re-arms the guard for a fresh test attempt', () => {
    const guard = new AwayGuard();
    guard.markDeparture(); // now "away"
    guard.reset();
    expect(guard.markDeparture()).toBe(true);
  });
});
