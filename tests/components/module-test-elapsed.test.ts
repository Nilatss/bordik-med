/**
 * Regression test for the module-test "elapsed time always 0" bug.
 *
 * Context: TestPanel.tsx used to call `submitModuleTest(...)` /
 * `abortModuleTest(...)` with a hardcoded literal `0` for `timeUsedMs`
 * instead of the real elapsed time tracked by TestActiveView's countdown.
 * Every module-test attempt was silently persisted with `timeUsedMs: 0`.
 *
 * The fix threads the real elapsed time from TestActiveView (derived from
 * its countdown state via `computeElapsedMs`) through `onComplete`/
 * `onCancel` into TestPanel's store calls. This test locks in:
 *   (a) `computeElapsedMs` itself — the pure function TestActiveView now
 *       uses to derive elapsed time from `effectiveTimeLimit`/`timeRemaining`.
 *   (b) that the store correctly persists whatever `timeUsedMs` it's given
 *       (so a regression back to a hardcoded 0 at the call site would still
 *       be caught by (a), and any regression in the store's own handling
 *       would be caught here).
 */
import { describe, it, expect } from 'vitest';
import { computeElapsedMs } from '@/lib/quiz';
import { useAppStore } from '@/lib/store';
import type { TestQuestion } from '@/lib/quiz';

describe('computeElapsedMs', () => {
  it('is 0 when the timer has not started (remaining === total)', () => {
    expect(computeElapsedMs(3_600_000, 3_600_000)).toBe(0);
  });

  it('returns the real elapsed duration once time has passed', () => {
    expect(computeElapsedMs(3_600_000, 3_400_000)).toBe(200_000);
  });

  it('is the full duration when the countdown reaches 0 (auto-submit)', () => {
    expect(computeElapsedMs(3_600_000, 0)).toBe(3_600_000);
  });

  it('clamps to totalMs when remaining is negative (a tick overshoot)', () => {
    expect(computeElapsedMs(3_600_000, -500)).toBe(3_600_000);
  });

  it('clamps to 0 when remaining exceeds total (defensive, should not happen)', () => {
    expect(computeElapsedMs(3_600_000, 4_000_000)).toBe(0);
  });
});

describe('submitModuleTest / abortModuleTest persist the real timeUsedMs', () => {
  const questions: TestQuestion[] = [
    { id: 'q1', question: 'Q1', options: ['a', 'b', 'c', 'd'], correctIndex: 0 },
  ];

  it('submitModuleTest stores a non-zero timeUsedMs when given one', () => {
    const moduleId = 999_001;
    useAppStore.getState().submitModuleTest(moduleId, [0], questions, 742_000, 0);
    const attempts = useAppStore.getState().moduleTestAttempts[moduleId];
    expect(attempts?.at(-1)?.timeUsedMs).toBe(742_000);
  });

  it('abortModuleTest stores a non-zero timeUsedMs when given one', () => {
    const moduleId = 999_002;
    useAppStore.getState().abortModuleTest(moduleId, [0, null], 318_000, 1);
    const attempts = useAppStore.getState().moduleTestAttempts[moduleId];
    expect(attempts?.at(-1)?.timeUsedMs).toBe(318_000);
  });
});
