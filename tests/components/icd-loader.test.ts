/**
 * Tests for lib/icd-loader.ts — loadIcdIndex concurrent dedup.
 *
 * Bug fixed: CommandPalette.tsx's inline loadIcdIndex() had no in-flight
 * deduplication (unlike its sibling loadToolsIndex). Rapid Cmd-K presses
 * before the first fetch resolved fired multiple fetches for the same data.
 * The fix adds an icdIndexLoading singleton so concurrent callers share one
 * Promise, exactly as loadToolsIndex already does.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Reset module cache between tests so each test starts with a clean slate.
vi.mock('@/lib/icd-loader', async (importOriginal) => {
  return await importOriginal();
});

const SAMPLE = { codes: [{ code: 'A00', title: 'Cholera', chapter: '1' }] };

describe('loadIcdIndex', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Reset the module-level cache before each test.
    const mod = await import('@/lib/icd-loader');
    mod._resetIcdCache();

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads and caches the ICD index', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => SAMPLE,
    });

    const { loadIcdIndex } = await import('@/lib/icd-loader');
    const result = await loadIcdIndex();
    expect(result).toHaveLength(1);
    expect(result?.[0]?.code).toBe('A00');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('deduplicates concurrent calls — only ONE fetch fires', async () => {
    let resolveResponse!: (v: Response) => void;
    const pending = new Promise<Response>((res) => { resolveResponse = res; });
    fetchMock.mockReturnValue(pending);

    const { loadIcdIndex } = await import('@/lib/icd-loader');

    // Fire three concurrent calls before the first resolves.
    const [p1, p2, p3] = [loadIcdIndex(), loadIcdIndex(), loadIcdIndex()];

    // Now let the fetch resolve.
    resolveResponse({ ok: true, json: async () => SAMPLE } as unknown as Response);

    const results = await Promise.all([p1, p2, p3]);

    // Only 1 fetch should have been made despite 3 concurrent callers.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // All three callers got the same result.
    for (const r of results) {
      expect(r).toHaveLength(1);
      expect(r?.[0]?.code).toBe('A00');
    }
  });

  it('returns null on HTTP error and allows retry on next call', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 } as Response);
    const { loadIcdIndex } = await import('@/lib/icd-loader');

    const first = await loadIcdIndex();
    expect(first).toBeNull();

    // Cache should still be null — next call should retry.
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => SAMPLE,
    });
    const second = await loadIcdIndex();
    expect(second).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
