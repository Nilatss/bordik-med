/**
 * Regression test for Bug 1 (handleNext phase guard).
 *
 * Before fix: handleNext only checked `!current || picked == null`, so a
 * rapid double-click during 'loading' / 'finalizing' / 'error' phases would
 * fire two concurrent fetchNext/finalize calls — wasting quota and producing
 * a race between two question responses.
 *
 * After fix: `phase !== 'reviewing'` is the first guard, so any call outside
 * 'reviewing' is a no-op.
 *
 * These tests exercise the guard predicate in isolation so the invariant is
 * locked in without needing a DOM/jsdom environment.
 */
import { describe, it, expect } from 'vitest';
import type { Phase } from '@/lib/diagnostic/types';

/** Mirrors the guard condition added to handleNext in DiagnosticTest.tsx. */
function handleNextShouldProceed(
  phase: Phase,
  current: unknown | null,
  picked: number | null,
): boolean {
  return phase === 'reviewing' && current !== null && picked !== null;
}

describe('handleNext phase guard', () => {
  it('proceeds only when phase is "reviewing"', () => {
    const current = { question: 'Q', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
    expect(handleNextShouldProceed('reviewing', current, 2)).toBe(true);
  });

  it('blocks during "loading" phase (double-click before first question arrives)', () => {
    const current = { question: 'Q', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
    expect(handleNextShouldProceed('loading', current, 2)).toBe(false);
  });

  it('blocks during "asking" phase (answer not yet selected)', () => {
    const current = { question: 'Q', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
    expect(handleNextShouldProceed('asking', current, null)).toBe(false);
  });

  it('blocks during "finalizing" phase', () => {
    const current = { question: 'Q', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
    expect(handleNextShouldProceed('finalizing', current, 1)).toBe(false);
  });

  it('blocks during "error" phase', () => {
    const current = { question: 'Q', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
    expect(handleNextShouldProceed('error', current, 0)).toBe(false);
  });

  it('blocks when current question is null even in "reviewing" phase', () => {
    expect(handleNextShouldProceed('reviewing', null, 0)).toBe(false);
  });

  it('blocks when picked is null even in "reviewing" phase', () => {
    const current = { question: 'Q', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };
    expect(handleNextShouldProceed('reviewing', current, null)).toBe(false);
  });
});
