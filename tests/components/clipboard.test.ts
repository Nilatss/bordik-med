/**
 * Tests for lib/clipboard.ts — writeToClipboard helper.
 *
 * Bug fixed: PoisonCell in DrugChecker.tsx called
 *   navigator.clipboard?.writeText(code).then(...)
 * with no .catch(). When clipboard is denied (incognito, HTTP, permission
 * blocked) the promise rejected with an unhandled rejection and the user
 * saw no feedback. writeToClipboard wraps the call in try/catch and returns
 * false on failure so callers decide what to do without risking unhandled
 * rejections.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

// Stub navigator before importing the module under test.
const writeText = vi.fn<(text: string) => Promise<void>>();
vi.stubGlobal('navigator', {
  clipboard: { writeText },
});

import { writeToClipboard } from '@/lib/clipboard';

describe('writeToClipboard', () => {
  afterEach(() => writeText.mockReset());

  it('returns true when clipboard write succeeds', async () => {
    writeText.mockResolvedValue(undefined);
    expect(await writeToClipboard('hello')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('returns false (not throw) when clipboard write is rejected', async () => {
    writeText.mockRejectedValue(new DOMException('NotAllowedError'));
    // Before the fix this path produced an unhandled rejection;
    // with the fix it resolves to false.
    await expect(writeToClipboard('hello')).resolves.toBe(false);
  });

  it('returns false when navigator.clipboard is unavailable', async () => {
    vi.stubGlobal('navigator', {});
    expect(await writeToClipboard('hello')).toBe(false);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
  });
});
