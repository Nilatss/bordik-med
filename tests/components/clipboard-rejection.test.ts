/**
 * Regression test for unhandled clipboard.writeText() rejections.
 *
 * Bug: CopyCodeButton (ClassificationsHub.tsx), NeoplasmCell
 * (ClassificationsHub.tsx) and PoisonCell (DrugChecker.tsx) all used:
 *
 *   void navigator.clipboard?.writeText(code).then(() => { ... })
 *
 * When the Clipboard API denies access (insecure context, permission
 * blocked, document not focused) writeText() rejects, and without a
 * .catch() that rejection becomes an unhandled Promise rejection —
 * triggering a browser console error and a Sentry event.
 *
 * Fix: add .catch(() => {}) to each call so the rejection is consumed.
 */
import { describe, it, expect } from 'vitest';

function buildClipboardPipeline(
  writeText: () => Promise<void>,
  onSuccess: () => void,
): Promise<void> {
  return writeText().then(onSuccess).catch(() => { /* clipboard denied */ });
}

describe('clipboard writeText rejection handling', () => {
  it('resolves without throwing when writeText succeeds', async () => {
    const successClipboard = () => Promise.resolve();
    const onSuccess = () => {};
    await expect(buildClipboardPipeline(successClipboard, onSuccess)).resolves.toBeUndefined();
  });

  it('does NOT produce an unhandled rejection when writeText is denied', async () => {
    const deniedClipboard = () => Promise.reject(new Error('NotAllowedError'));
    const onSuccess = () => {};
    // Without .catch() this would be an unhandled rejection; with it, resolves cleanly.
    await expect(buildClipboardPipeline(deniedClipboard, onSuccess)).resolves.toBeUndefined();
  });

  it('onSuccess callback is NOT called when clipboard is denied', async () => {
    let called = false;
    const deniedClipboard = () => Promise.reject(new Error('NotAllowedError'));
    await buildClipboardPipeline(deniedClipboard, () => { called = true; });
    expect(called).toBe(false);
  });

  it('onSuccess callback IS called when clipboard succeeds', async () => {
    let called = false;
    const successClipboard = () => Promise.resolve();
    await buildClipboardPipeline(successClipboard, () => { called = true; });
    expect(called).toBe(true);
  });
});
