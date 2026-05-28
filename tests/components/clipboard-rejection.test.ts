/**
 * Regression test for unhandled clipboard promise rejections.
 *
 * Bug: DrugChecker and ClassificationsHub used `void promise.then(cb)` without
 * a rejection handler. When navigator.clipboard.writeText() rejects (permission
 * denied, insecure context, etc.) the rejection was unhandled, surfacing as a
 * browser error and potentially reaching Sentry.
 *
 * Fix: replace with `.then(onFulfilled, onRejected)` — the second argument
 * handles the rejection inline, matching the pattern already used in Result.tsx.
 */
import { describe, it, expect, vi, afterAll } from 'vitest';

describe('clipboard writeText: rejection handling', () => {
  afterAll(() => vi.unstubAllGlobals());

  it('two-arg then() calls rejection handler when clipboard rejects', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) },
    });

    let rejectionHandled = false;
    await navigator.clipboard!.writeText('T-123').then(
      () => {},
      () => { rejectionHandled = true; },
    );

    expect(rejectionHandled).toBe(true);
  });

  it('two-arg then() does not invoke fulfillment handler on rejection', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    let fulfillmentCalled = false;
    await navigator.clipboard!.writeText('T-456').then(
      () => { fulfillmentCalled = true; },
      () => {},
    );

    expect(fulfillmentCalled).toBe(false);
  });

  it('fulfillment handler runs and rejection handler is skipped on success', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    let fulfilled = false;
    let rejected = false;
    await navigator.clipboard!.writeText('T-789').then(
      () => { fulfilled = true; },
      () => { rejected = true; },
    );

    expect(fulfilled).toBe(true);
    expect(rejected).toBe(false);
  });
});
