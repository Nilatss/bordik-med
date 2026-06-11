/**
 * Regression test for Bug 3 (loadIcdIndex missing deduplication).
 *
 * Before fix: loadIcdIndex in CommandPalette.tsx had no in-flight guard.
 * Concurrent calls (e.g. user opens command palette twice in rapid succession)
 * each started their own fetch, wasting bandwidth and risking a stale-write
 * race where the second response could silently overwrite `icdIndex` with a
 * different (cached or race-won) response.
 *
 * After fix: loadIcdIndex wraps its fetch in the same singletonFetch pattern
 * used by loadToolsIndex and loadCatalogMeta — concurrent calls share one
 * in-flight Promise and only one HTTP request is made.
 *
 * singletonFetch is extracted as a testable utility in lib/singleton-fetch.ts.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { singletonFetch } from '@/lib/singleton-fetch';

describe('singletonFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls the loader exactly once when invoked concurrently', async () => {
    let callCount = 0;
    const loader = vi.fn(async () => {
      callCount++;
      return { codes: [{ code: 'A00', title: 'Cholera', chapter: 'I' }] };
    });

    const load = singletonFetch(loader);

    // Fire three concurrent calls — all should share the first in-flight Promise.
    const [a, b, c] = await Promise.all([load(), load(), load()]);

    expect(callCount).toBe(1);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(a).toStrictEqual(b);
    expect(b).toStrictEqual(c);
  });

  it('caches the result so subsequent calls never re-fetch', async () => {
    const loader = vi.fn(async () => ({ codes: [] }));
    const load = singletonFetch(loader);

    await load();
    await load();
    await load();

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('clears inflight so failed calls can be retried', async () => {
    let attempt = 0;
    const loader = vi.fn(async () => {
      attempt++;
      if (attempt === 1) throw new Error('network error');
      return { codes: [{ code: 'Z00', title: 'Exam', chapter: 'XXI' }] };
    });

    const load = singletonFetch(loader);

    // First call fails.
    await expect(load()).rejects.toThrow('network error');

    // Second call should retry (inflight was cleared on error).
    const result = await load();
    expect(result.codes[0]?.code).toBe('Z00');
    expect(loader).toHaveBeenCalledTimes(2);
  });
});
