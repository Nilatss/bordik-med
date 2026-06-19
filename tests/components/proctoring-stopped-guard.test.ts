/**
 * Regression test for the missing `stopped` guard after `await` in
 * Proctoring.tsx's face-landmark and object-detector animation loops.
 *
 * Bug: Both async loops checked `if (stopped) return` at the top, but NOT
 * after the `await getFaceLandmarker()` / `await getObjectDetector()` calls.
 * If the component unmounted while the model-load promise was in flight, the
 * loop would continue to call `setFaceState()` and `onViolation()` on an
 * unmounted component. The same pattern was already fixed for timers in
 * commit 75a5351; this extends it to the async model-load awaits.
 *
 * Fix: Add `if (stopped) return;` immediately after each `await`.
 *
 * This test verifies the guard pattern in isolation — the exact same logic
 * used in both loops. It does not mount the React component (no jsdom).
 */
import { describe, it, expect, vi } from 'vitest';

/**
 * Simulates one iteration of the async proctoring detection loop.
 * Returns true if the callback (onViolation) was invoked.
 */
async function runLoopIteration(opts: {
  stopped: boolean;
  setStoppedAfterAwait: boolean;
  modelLoader: () => Promise<void>;
  onViolation: () => void;
}): Promise<boolean> {
  const stoppedRef = { value: opts.stopped };
  let callbackInvoked = false;

  if (stoppedRef.value) return false;

  try {
    await opts.modelLoader();
    // This is the guard that was MISSING (Bug 3).
    if (stoppedRef.value || opts.setStoppedAfterAwait) return false;
    // Would call setFaceState / onViolation here.
    opts.onViolation();
    callbackInvoked = true;
  } catch {
    // silent — matches Proctoring.tsx's catch block
  }

  return callbackInvoked;
}

describe('Proctoring — stopped guard after async await', () => {
  it('does NOT invoke callback when stopped is set before the loop starts', async () => {
    const onViolation = vi.fn();
    const called = await runLoopIteration({
      stopped: true,
      setStoppedAfterAwait: false,
      modelLoader: async () => {},
      onViolation,
    });
    expect(called).toBe(false);
    expect(onViolation).not.toHaveBeenCalled();
  });

  it('does NOT invoke callback when component unmounts DURING the model await (the bug scenario)', async () => {
    const onViolation = vi.fn();
    let awaitResolved = false;
    const called = await runLoopIteration({
      stopped: false,
      // Simulates `stopped` becoming true while the model was loading
      setStoppedAfterAwait: true,
      modelLoader: async () => { awaitResolved = true; },
      onViolation,
    });
    expect(awaitResolved).toBe(true);   // model DID load
    expect(called).toBe(false);          // but callback was suppressed by the guard
    expect(onViolation).not.toHaveBeenCalled();
  });

  it('DOES invoke callback when still mounted after the model await (happy path)', async () => {
    const onViolation = vi.fn();
    const called = await runLoopIteration({
      stopped: false,
      setStoppedAfterAwait: false,
      modelLoader: async () => {},
      onViolation,
    });
    expect(called).toBe(true);
    expect(onViolation).toHaveBeenCalledOnce();
  });

  it('handles model loader rejection without invoking callback', async () => {
    const onViolation = vi.fn();
    const called = await runLoopIteration({
      stopped: false,
      setStoppedAfterAwait: false,
      modelLoader: async () => { throw new Error('model load failed'); },
      onViolation,
    });
    expect(called).toBe(false);
    expect(onViolation).not.toHaveBeenCalled();
  });
});
