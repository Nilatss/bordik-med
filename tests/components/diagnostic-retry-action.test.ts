/**
 * Unit tests for resolveRetryAction (lib/diagnostic/utils.ts).
 *
 * Bug: the diagnostic test's error panel always retried via fetchNext
 * ({ action: 'next' }) regardless of which call actually failed. If the
 * failure happened during finalize() (after all 30 questions were
 * answered), history.length already equals the total, so the server
 * rejects a retried 'next' with 'test-complete' every time — the user
 * was stuck in an infinite retry loop and could never actually get their
 * result after a transient finalize failure.
 *
 * Fix: track which action failed and have retry replay that SAME action.
 */
import { describe, it, expect } from 'vitest';
import { resolveRetryAction } from '@/lib/diagnostic/utils';

describe('resolveRetryAction', () => {
  it('retries finalize when finalize failed (not next)', () => {
    expect(resolveRetryAction('finalize')).toBe('finalize');
  });

  it('retries next when next failed', () => {
    expect(resolveRetryAction('next')).toBe('next');
  });
});
