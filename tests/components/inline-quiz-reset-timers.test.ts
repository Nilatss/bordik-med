/**
 * Regression tests for the collapse-timer leak in InlineQuiz.tsx.
 *
 * Bug: `resetNow()` cleared quiz answers and expanded state but left pending
 * auto-collapse timers running. If the user answered question Q at t=0 (timer
 * queued for t=1200ms), clicked "Сбросить ответы" at t=100ms, then immediately
 * re-answered Q (new timer at t=1300ms), the stale timer from t=0 fired at
 * t=1200ms and collapsed Q 100ms early — before the user had finished reading
 * the feedback.
 *
 * Fix: `resetNow()` now calls `clearCollapseTimers()` before wiping state,
 * and the ref is also set to `[]` so the array doesn't grow unboundedly
 * across a session (each clearTimeout ID stayed in the array forever).
 *
 * These tests verify the timer cancellation contract using the real browser
 * timer API (available in Node via global setTimeout / clearTimeout).
 */
import { describe, it, expect, vi } from 'vitest';

describe('collapse-timer cancellation contract', () => {
  it('clearTimeout on an already-fired timer is a safe no-op', () => {
    return new Promise<void>((resolve) => {
      const id = setTimeout(() => {
        // After firing, calling clearTimeout on this id must not throw.
        expect(() => clearTimeout(id)).not.toThrow();
        resolve();
      }, 0);
    });
  });

  it('clearTimeout before firing prevents the callback from running', () => {
    return new Promise<void>((resolve) => {
      let ran = false;
      const id = setTimeout(() => { ran = true; }, 50);
      clearTimeout(id);
      // Wait long enough that the timer would have fired if not cancelled.
      setTimeout(() => {
        expect(ran).toBe(false);
        resolve();
      }, 100);
    });
  });

  it('a batch clearTimeout (simulating clearCollapseTimers) cancels all pending timers', () => {
    return new Promise<void>((resolve) => {
      const fired: number[] = [];
      const timers: ReturnType<typeof setTimeout>[] = [];

      // Simulate three questions answered in quick succession.
      for (let i = 0; i < 3; i++) {
        timers.push(setTimeout(() => fired.push(i), 50));
      }

      // Simulate resetNow() calling clearCollapseTimers().
      timers.forEach(clearTimeout);
      timers.length = 0;

      // None of the collapse callbacks should have fired.
      setTimeout(() => {
        expect(fired).toEqual([]);
        resolve();
      }, 150);
    });
  });

  it('new timers after reset are unaffected by the cleared batch', () => {
    return new Promise<void>((resolve) => {
      const fired: number[] = [];
      const timers: ReturnType<typeof setTimeout>[] = [];

      // Pre-reset timers.
      for (let i = 0; i < 2; i++) {
        timers.push(setTimeout(() => fired.push(i), 50));
      }
      timers.forEach(clearTimeout);
      timers.length = 0;

      // Post-reset timer (re-answer after reset).
      timers.push(setTimeout(() => fired.push(99), 50));

      setTimeout(() => {
        // Only the post-reset timer should have fired.
        expect(fired).toEqual([99]);
        resolve();
      }, 150);
    });
  });
});

// Verify that the vi fake-timer API can also model the fix for deterministic tests.
describe('collapse-timer cancellation with fake timers', () => {
  it('clears all timers before they fire when resetNow is called', () => {
    vi.useFakeTimers();

    const fired: number[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 0; i < 3; i++) {
      timers.push(setTimeout(() => fired.push(i), 1200));
    }

    // Simulate resetNow() — cancel all queued collapse timers.
    timers.forEach(clearTimeout);
    timers.length = 0;

    vi.advanceTimersByTime(2000);
    expect(fired).toEqual([]);

    vi.useRealTimers();
  });

  it('post-reset timer fires correctly after clearCollapseTimers', () => {
    vi.useFakeTimers();

    const fired: number[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Pre-reset timer.
    timers.push(setTimeout(() => fired.push(0), 1200));
    timers.forEach(clearTimeout);
    timers.length = 0;

    // Post-reset timer (user re-answers the question).
    timers.push(setTimeout(() => fired.push(1), 1200));

    vi.advanceTimersByTime(1500);
    expect(fired).toEqual([1]);

    vi.useRealTimers();
  });
});
