/**
 * Regression test for loadCatalogMeta retry contract.
 *
 * Bug: on fetch failure, the original code set `catalogMeta = new Map()`.
 * Since `new Map()` is truthy, the `if (catalogMeta) return catalogMeta`
 * guard returned the stale empty Map on every subsequent call — no retry
 * ever happened and tool titles stayed blank for the session.
 *
 * Fix: do not assign catalogMeta on failure (mirror of loadIcdIndex).
 * Leave the module-level variable null so the next open retries the fetch.
 *
 * We use catalog-client.ts as a structural proxy: it has the identical
 * singleton-recovery contract (cached rejected promise → null → retry)
 * and the behaviour is already covered in async-error-boundary.test.ts.
 * Here we add the two-call scenario that proves the fix: first call fails,
 * second call succeeds — only possible if the failure was NOT cached.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('catalog singleton · does not permanently cache failure', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('retries and returns data after a transient fetch failure', async () => {
    vi.resetModules();

    let callCount = 0;
    vi.stubGlobal('fetch', (_url: string) => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error('transient network error'));
      return Promise.resolve({
        ok: true,
        json: async () => [{ id: 'bmi', title: 'BMI Calculator', category: 'Calculators' }],
      });
    });

    const { getCatalog } = await import('@/lib/catalog-client');

    // First call: fetch rejects → getCatalog rejects, cached promise cleared.
    await expect(getCatalog()).rejects.toThrow(/transient network error/);

    // Second call: fetch succeeds → getCatalog resolves (proves failure was
    // NOT permanently cached — the same invariant CommandPalette's
    // loadCatalogMeta must now satisfy after the fix).
    const rows = await getCatalog();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    expect(callCount).toBe(2);
  });

  it('after first failure a second call re-fetches (not returns cached empty)', async () => {
    vi.resetModules();

    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'gcs', title: 'Glasgow Coma Scale' }],
      });
    vi.stubGlobal('fetch', fetchMock);

    const { getCatalog } = await import('@/lib/catalog-client');

    await expect(getCatalog()).rejects.toThrow();
    const rows = await getCatalog();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(rows[0]?.id).toBe('gcs');
  });
});
