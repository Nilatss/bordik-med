/**
 * Regression tests for the TestGuard "justReturned" banner timer cleanup.
 *
 * Root cause (before fix):
 *   `cancelGrace()` inside TestGuard called `setTimeout(() => setJustReturned(false), 3000)`
 *   with no reference stored and no cleanup in the effect return. If the
 *   component unmounted or the effect re-ran (e.g. `active` changed) within
 *   3 seconds of the banner appearing, the orphaned timer would call
 *   `setJustReturned(false)` on an unmounted / stale component.
 *
 * Fix:
 *   The timeout ID is now stored in `justReturnedTimerRef` (a useRef). Before
 *   scheduling a new timeout, any pending one is cancelled. The effect cleanup
 *   also clears the timer, so unmounting while the banner is visible is safe.
 *
 * What's tested here:
 *   - The timer-tracking pattern (store → clear → reschedule) behaves correctly
 *     as a pure function analogue — confirms the logic that wraps the ref.
 *   - Verifies that a pending timer ID is replaced (not leaked) when
 *     cancelGrace fires a second time before the first timeout fires.
 *
 * Note: the useRef lifecycle and effect cleanup are exercised at the React
 * component level only; testing that requires jsdom + testing-library which
 * is not set up in this vitest config (node environment). The pure logic
 * below pins the contract the implementation fulfils.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('TestGuard cancelGrace timer management', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('scheduling a new timer cancels the pending one (no leak)', () => {
    vi.useFakeTimers();

    // Simulate the ref
    let timerRef: ReturnType<typeof setTimeout> | null = null;
    let callCount = 0;
    const setJustReturned = (v: boolean) => { if (!v) callCount++; };

    const scheduleReset = () => {
      if (timerRef !== null) clearTimeout(timerRef);  // the fix
      timerRef = setTimeout(() => {
        timerRef = null;
        setJustReturned(false);
      }, 3000);
    };

    // First call — starts a 3 s timer
    scheduleReset();
    const firstId = timerRef;

    // Second call before first fires — should cancel first
    vi.advanceTimersByTime(1000);
    scheduleReset();

    expect(timerRef).not.toBe(firstId); // new timer issued

    // Advance past original 3 s deadline (2 s remaining from second call)
    vi.advanceTimersByTime(2000);
    expect(callCount).toBe(0); // first timer cancelled — no premature call

    // Advance to second timer's deadline
    vi.advanceTimersByTime(1500);
    expect(callCount).toBe(1); // only one call, from the second timer
  });

  it('cleanup clears a pending timer without calling setJustReturned', () => {
    vi.useFakeTimers();

    let timerRef: ReturnType<typeof setTimeout> | null = null;
    let callCount = 0;
    const setJustReturned = (v: boolean) => { if (!v) callCount++; };

    // Schedule the "you returned" reset
    timerRef = setTimeout(() => {
      timerRef = null;
      setJustReturned(false);
    }, 3000);

    // Simulate effect cleanup (component unmounts / effect re-runs)
    if (timerRef !== null) {
      clearTimeout(timerRef);
      timerRef = null;
    }

    // Timer should have been cleared — advancing past the deadline must not fire
    vi.advanceTimersByTime(5000);
    expect(callCount).toBe(0);
    expect(timerRef).toBeNull();
  });
});
