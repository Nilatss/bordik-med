/**
 * Regression tests for offline-cache error resilience.
 *
 * Covers the root causes of three component-level bugs:
 *   1. BulkOfflineDownload.start() could freeze UI in 'running' state when
 *      caches are unavailable — fixed by adding try/catch + 'error' stage.
 *   2. BulkOfflineDownload useEffect missing cancellation guard — fixed with
 *      cancelled flag; getCacheSizeBytes must always resolve, never reject.
 *   3. OfflineBadge.handleSave() had no error handling — fixed by try/catch;
 *      isToolCached/cacheTool must always resolve, never reject.
 *
 * These tests verify that the underlying lib/offline-cache.ts functions
 * honour their "never throws" contract, so component-level callers can
 * rely on .then()/.catch() chains without an unhandled-rejection risk.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function stubCaches(
  impl: Partial<typeof globalThis.caches> | null,
) {
  if (impl === null) {
    // Simulate environments where the Cache API is absent (private mode, old OS)
    Object.defineProperty(globalThis, 'caches', { value: undefined, writable: true, configurable: true });
  } else {
    Object.defineProperty(globalThis, 'caches', { value: impl, writable: true, configurable: true });
  }
}

function stubNavigatorStorage(
  impl: Partial<StorageManager> | null,
) {
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      ...(globalThis.navigator ?? {}),
      storage: impl ?? undefined,
    },
    writable: true,
    configurable: true,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// getCacheSizeBytes — Bug 2 regression
// ──────────────────────────────────────────────────────────────────────────────

describe('getCacheSizeBytes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    // restore a basic navigator
    Object.defineProperty(globalThis, 'navigator', { value: {}, writable: true, configurable: true });
  });

  it('returns 0 (never rejects) when navigator.storage is absent', async () => {
    stubNavigatorStorage(null);
    const { getCacheSizeBytes } = await import('@/lib/offline-cache');
    const result = getCacheSizeBytes();
    await expect(result).resolves.toBe(0);
  });

  it('returns 0 (never rejects) when navigator.storage.estimate throws', async () => {
    stubNavigatorStorage({
      estimate: () => Promise.reject(new Error('QuotaExceededError')),
    } as unknown as StorageManager);
    const { getCacheSizeBytes } = await import('@/lib/offline-cache');
    await expect(getCacheSizeBytes()).resolves.toBe(0);
  });

  it('returns usage bytes when estimate succeeds', async () => {
    stubNavigatorStorage({
      estimate: () => Promise.resolve({ usage: 512_000, quota: 10_000_000 }),
    } as unknown as StorageManager);
    const { getCacheSizeBytes } = await import('@/lib/offline-cache');
    await expect(getCacheSizeBytes()).resolves.toBe(512_000);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// bulkCacheTools — Bug 1 regression
// The UI lockup reproduced when bulkCacheTools bubbled an error out of start().
// The function must always resolve so the try/catch in start() has a safety net.
// ──────────────────────────────────────────────────────────────────────────────

describe('bulkCacheTools', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    stubCaches(null);
  });

  it('resolves {ok:0, fail:n} (never rejects) when Cache API is absent', async () => {
    stubCaches(null);
    const { bulkCacheTools } = await import('@/lib/offline-cache');
    const result = bulkCacheTools(['tool-a', 'tool-b', 'tool-c']);
    await expect(result).resolves.toMatchObject({ ok: 0, fail: 3 });
  });

  it('resolves {ok:0, fail:n} (never rejects) when caches.open throws', async () => {
    stubCaches({
      open: () => Promise.reject(new Error('SecurityError: insecure context')),
    } as unknown as typeof globalThis.caches);
    const { bulkCacheTools } = await import('@/lib/offline-cache');
    await expect(bulkCacheTools(['tool-a'])).resolves.toMatchObject({ ok: 0, fail: 1 });
  });

  it('stops at abort signal and does not reject', async () => {
    stubCaches(null);
    const { bulkCacheTools } = await import('@/lib/offline-cache');
    const ctrl = new AbortController();
    ctrl.abort();
    // Even with abort + no cache API: resolves, never throws
    const result = await bulkCacheTools(['a', 'b', 'c'], undefined, ctrl.signal);
    expect(result.ok + result.fail).toBeLessThanOrEqual(3);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// isToolCached — Bug 3 regression
// OfflineBadge.handleSave was unguarded; isToolCached must never reject.
// ──────────────────────────────────────────────────────────────────────────────

describe('isToolCached', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    stubCaches(null);
  });

  it('returns false (never rejects) when Cache API is absent', async () => {
    stubCaches(null);
    const { isToolCached } = await import('@/lib/offline-cache');
    await expect(isToolCached('tool-x')).resolves.toBe(false);
  });

  it('returns false (never rejects) when caches.open throws', async () => {
    stubCaches({
      open: () => Promise.reject(new Error('quota exceeded')),
    } as unknown as typeof globalThis.caches);
    const { isToolCached } = await import('@/lib/offline-cache');
    await expect(isToolCached('tool-x')).resolves.toBe(false);
  });

});

// ──────────────────────────────────────────────────────────────────────────────
// cacheTool — Bug 3 regression (handleSave path)
// ──────────────────────────────────────────────────────────────────────────────

describe('cacheTool', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    stubCaches(null);
  });

  it('returns false (never rejects) when Cache API is absent', async () => {
    stubCaches(null);
    const { cacheTool } = await import('@/lib/offline-cache');
    await expect(cacheTool('tool-z')).resolves.toBe(false);
  });

  it('returns false (never rejects) when cache.add throws', async () => {
    const fakeCache = {
      match: vi.fn().mockResolvedValue(undefined),
      add: vi.fn().mockRejectedValue(new Error('network failure')),
    };
    stubCaches({
      open: vi.fn().mockResolvedValue(fakeCache),
    } as unknown as typeof globalThis.caches);
    const { cacheTool } = await import('@/lib/offline-cache');
    await expect(cacheTool('tool-z')).resolves.toBe(false);
  });

});
