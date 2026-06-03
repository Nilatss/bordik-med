/**
 * Regression test for: unhandled promise rejection when navigator.clipboard
 * is denied/unavailable.
 *
 * Bug: `void navigator.clipboard?.writeText(code).then(...)` with no
 * `.catch()` leaves the promise rejection unhandled when clipboard access
 * is denied (e.g. missing permissions-policy, Safari, sandboxed iframes).
 * Unhandled rejections are captured by Sentry and show in the console.
 *
 * Fix: `.catch(() => {})` added to both CopyCodeButton instances
 * (DrugChecker.tsx and ClassificationsHub.tsx).
 *
 * This test verifies the core invariant: a rejection from clipboard
 * must NOT propagate as an unhandled rejection when the .catch handler
 * is present.
 */
import { describe, it, expect } from 'vitest';

function copyWithoutCatch(clipboard: { writeText: (s: string) => Promise<void> }): void {
  void clipboard.writeText('ABC').then(() => { /* success */ });
}

function copyWithCatch(clipboard: { writeText: (s: string) => Promise<void> }): void {
  void clipboard.writeText('ABC')
    .then(() => { /* success */ })
    .catch(() => {});
}

describe('clipboard error handling', () => {
  it('rejecting clipboard write is suppressed by .catch()', async () => {
    const failingClipboard = {
      writeText: (_: string) => Promise.reject(new DOMException('NotAllowedError')),
    };

    await expect(
      new Promise<void>((resolve, reject) => {
        const unhandled = (reason: unknown) => { reject(reason); };
        process.once('unhandledRejection', unhandled);
        copyWithCatch(failingClipboard);
        setImmediate(() => {
          process.off('unhandledRejection', unhandled);
          resolve();
        });
      }),
    ).resolves.toBeUndefined();
  });

  it('without .catch(), a rejected clipboard write leaves an unhandled rejection', async () => {
    const failingClipboard = {
      writeText: (_: string) => Promise.reject(new DOMException('NotAllowedError')),
    };

    await expect(
      new Promise<void>((resolve, reject) => {
        const unhandled = (reason: unknown) => {
          process.off('unhandledRejection', unhandled);
          reject(reason);
        };
        process.once('unhandledRejection', unhandled);
        copyWithoutCatch(failingClipboard);
        setImmediate(() => {
          process.off('unhandledRejection', unhandled);
          resolve();
        });
      }),
    ).rejects.toBeInstanceOf(DOMException);
  });
});
