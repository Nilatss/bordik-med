/**
 * bulkCacheTools() abort semantics.
 *
 * components/tools/BulkOfflineDownload.tsx used to force `stage: 'done'`
 * synchronously inside cancel(), before `bulkCacheTools()` (still running
 * in `start()`) had actually resolved with a `result`. Since the 'done'
 * view only renders when `stage === 'done' && result`, the modal appeared
 * frozen - no summary, no Close button - until the in-flight `cache.add()`
 * eventually settled on its own.
 *
 * The fix relies on this invariant: `bulkCacheTools` ALWAYS resolves
 * (never hangs, never rejects) with a well-formed `{ ok, fail }`, even
 * when aborted while an item is mid-fetch - the signal is only checked
 * between loop iterations, not inside an in-flight cache.add(). These
 * tests pin that behavior directly against a mocked CacheStorage.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { bulkCacheTools } from '@/lib/offline-cache';

function deferred<T = void>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((r) => { resolve = r; });
  return { promise, resolve };
}

function installCacheMock(cache: { match: (url: string) => Promise<unknown>; add: (url: string) => Promise<void> }) {
  (globalThis as unknown as { caches?: unknown }).caches = { open: async () => cache };
  (globalThis as unknown as { window?: unknown }).window =
    { caches: (globalThis as unknown as { caches: unknown }).caches };
}

afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
  delete (globalThis as unknown as { caches?: unknown }).caches;
});

describe('bulkCacheTools · abort handling', () => {
  it('resolves with a well-formed result even when aborted mid-fetch (never hangs)', async () => {
    const addGate = deferred<void>();
    const addStarted = deferred<void>();
    let addCallCount = 0;
    installCacheMock({
      match: async () => false,
      add: async () => {
        addCallCount++;
        addStarted.resolve();
        await addGate.promise;
      },
    });

    const controller = new AbortController();
    const progressCalls: Array<[number, number]> = [];
    const resultPromise = bulkCacheTools(
      ['a', 'b', 'c'],
      (done, total) => progressCalls.push([done, total]),
      controller.signal,
    );

    await addStarted.promise; // the first cache.add() is now in flight
    controller.abort();       // user hits "Остановить" mid-fetch
    addGate.resolve();        // let the in-flight add() finish naturally

    const result = await resultPromise;
    expect(addCallCount).toBe(1); // loop stopped before starting item 'b'
    expect(result).toEqual({ ok: 1, fail: 0 });
    expect(progressCalls).toEqual([[1, 3]]);
  });

  it('aborting before any item starts resolves immediately with nothing done', async () => {
    let addCallCount = 0;
    installCacheMock({
      match: async () => false,
      add: async () => { addCallCount++; },
    });
    const controller = new AbortController();
    controller.abort();

    const result = await bulkCacheTools(['a', 'b'], undefined, controller.signal);
    expect(result).toEqual({ ok: 0, fail: 0 });
    expect(addCallCount).toBe(0);
  });

  it('runs to completion and counts ok/fail correctly without an abort', async () => {
    installCacheMock({
      match: async () => false,
      add: async (url: string) => { if (url.includes('bad')) throw new Error('network'); },
    });
    const result = await bulkCacheTools(['a', 'bad', 'c']);
    expect(result).toEqual({ ok: 2, fail: 1 });
  });

  it('with no CacheStorage available (e.g. Safari private mode), resolves failing every id instead of throwing', async () => {
    const result = await bulkCacheTools(['a', 'b', 'c']);
    expect(result).toEqual({ ok: 0, fail: 3 });
  });
});
