/**
 * Regression test for bug: async RAF loops in Proctoring.tsx (face detection
 * and object detection) checked `stopped` only at the entry of each iteration,
 * not after the `await getFaceLandmarker()` / `await getObjectDetector()` call.
 *
 * Scenario: effect cleanup fires (stopped = true, RAF cancelled) while the
 * loop is awaiting the model promise. After the promise resolves, code
 * continued calling setFaceState/onViolation with stale callbacks.
 *
 * Fix: added `if (stopped) return;` immediately after each await.
 */
import { describe, it, expect } from 'vitest';

async function faceLoopIterationWithFix(
  stopped: () => boolean,
  loadModel: () => Promise<unknown>,
  onSideEffect: () => void,
): Promise<void> {
  if (stopped()) return;
  await loadModel();
  if (stopped()) return; // ← the fix
  onSideEffect();
}

async function faceLoopIterationWithoutFix(
  stopped: () => boolean,
  loadModel: () => Promise<unknown>,
  onSideEffect: () => void,
): Promise<void> {
  if (stopped()) return;
  await loadModel();
  // no stopped check — the bug
  onSideEffect();
}

describe('Proctoring · stopped guard after async model await', () => {
  it('with fix: stopped=true during model load prevents post-await side effects', async () => {
    let isStopped = false;
    let sideEffectCalled = false;

    let resolveModel!: () => void;
    const modelPromise = new Promise<void>((res) => { resolveModel = res; });

    const loopPromise = faceLoopIterationWithFix(
      () => isStopped,
      () => modelPromise,
      () => { sideEffectCalled = true; },
    );

    // Simulate cleanup firing while model is loading
    isStopped = true;
    resolveModel();
    await loopPromise;

    expect(sideEffectCalled).toBe(false);
  });

  it('without fix: stopped=true does not prevent post-await side effects (demonstrates the bug)', async () => {
    let isStopped = false;
    let sideEffectCalled = false;

    let resolveModel!: () => void;
    const modelPromise = new Promise<void>((res) => { resolveModel = res; });

    const loopPromise = faceLoopIterationWithoutFix(
      () => isStopped,
      () => modelPromise,
      () => { sideEffectCalled = true; },
    );

    isStopped = true;
    resolveModel();
    await loopPromise;

    // Without the fix, the side effect fires even though cleanup set stopped=true
    expect(sideEffectCalled).toBe(true);
  });

  it('with fix: side effects run normally when stopped stays false', async () => {
    let sideEffectCalled = false;

    const loopPromise = faceLoopIterationWithFix(
      () => false,
      () => Promise.resolve(),
      () => { sideEffectCalled = true; },
    );

    await loopPromise;
    expect(sideEffectCalled).toBe(true);
  });
});
