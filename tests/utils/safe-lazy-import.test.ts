/**
 * Regression test for `safeLazyImport` (lib/safe-lazy-import.ts).
 *
 * Bug: `components/layout/Sidebar.tsx` fired `import('@/lib/tools-catalog')`
 * (and a sibling `import('@/lib/curriculum')`) inside a `useEffect` with no
 * `.catch()`. Sidebar mounts on every route, so any user typing 2+ chars
 * into search after a deploy — where their tab still holds an old build's
 * hashed chunk URLs — gets a `ChunkLoadError` that surfaces as an
 * unhandled promise rejection, and search silently stays empty forever
 * with no retry.
 *
 * `safeLazyImport` wraps the dynamic import so a rejection resolves to
 * `null` instead of propagating.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeLazyImport } from '@/lib/safe-lazy-import';

describe('safeLazyImport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the resolved module on success', async () => {
    const result = await safeLazyImport(() => Promise.resolve({ CATALOG_TOOLS: ['bmi'] }));
    expect(result).toEqual({ CATALOG_TOOLS: ['bmi'] });
  });

  it('resolves to null instead of rejecting when the loader throws (chunk 404 / offline)', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      const result = await safeLazyImport(() => Promise.reject(new Error('ChunkLoadError')));
      expect(result).toBeNull();
      // Give the microtask queue a tick — if safeLazyImport had let the
      // rejection escape, Node would have already flagged it by now.
      await new Promise((r) => setTimeout(r, 0));
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });

  it('swallows a synchronously-throwing loader the same way', async () => {
    const result = await safeLazyImport(() => {
      throw new Error('sync boom');
    });
    expect(result).toBeNull();
  });
});
