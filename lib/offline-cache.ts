'use client';

/**
 * Helpers around the Service Worker tool-detail cache. Used by:
 *   - <OfflineBadge /> on tool cards / detail header
 *   - <BulkDownloadButton /> for offline study trips
 *
 * Strategy: we cache JSON via the existing Serwist runtime rule
 * `bordik-tool-detail` (CacheFirst). Adding a tool to that cache means
 * future opens are instant, even with no network. Removing means the next
 * open hits the network.
 */

const CACHE_NAME = 'bordik-tool-detail';
const TOOL_URL = (id: string) => `/tools-data/${id}.json`;

function hasCacheStorage(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

/** Check whether a single tool's JSON is already in the offline cache. */
export async function isToolCached(id: string): Promise<boolean> {
  if (!hasCacheStorage()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(TOOL_URL(id));
    return !!hit;
  } catch {
    return false;
  }
}

/** Force-fetch and cache a single tool. No-op when already cached. */
export async function cacheTool(id: string): Promise<boolean> {
  if (!hasCacheStorage()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    if (await cache.match(TOOL_URL(id))) return true;
    await cache.add(TOOL_URL(id));
    return true;
  } catch {
    return false;
  }
}

/** Drop a single tool from the offline cache (lets the user free space). */
export async function uncacheTool(id: string): Promise<boolean> {
  if (!hasCacheStorage()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return await cache.delete(TOOL_URL(id));
  } catch {
    return false;
  }
}

/** Bulk download. Reports progress 0..1 via callback so the UI can render
 *  a smooth progress bar. Stops on first cancel signal. */
export async function bulkCacheTools(
  ids: readonly string[],
  onProgress?: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<{ ok: number; fail: number }> {
  if (!hasCacheStorage()) return { ok: 0, fail: ids.length };
  let ok = 0;
  let fail = 0;
  try {
    const cache = await caches.open(CACHE_NAME);
    for (let i = 0; i < ids.length; i++) {
      if (signal?.aborted) break;
      try {
        const url = TOOL_URL(ids[i]);
        if (!(await cache.match(url))) await cache.add(url);
        ok++;
      } catch {
        fail++;
      }
      onProgress?.(i + 1, ids.length);
    }
  } catch {
    fail = ids.length - ok;
  }
  return { ok, fail };
}

/** Approximate the storage budget used by the offline cache. Returns
 *  bytes (best-effort - browser estimates can be coarse). */
export async function getCacheSizeBytes(): Promise<number> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return 0;
  try {
    const est = await navigator.storage.estimate();
    return est.usage ?? 0;
  } catch {
    return 0;
  }
}
