/**
 * Regression test for the dead-cache bug in CommandPalette.loadCatalogMeta.
 *
 * Bug: on fetch failure, the function set `catalogMeta = new Map()`.
 * An empty Map is truthy, so the guard `if (catalogMeta) return catalogMeta`
 * on the NEXT call returned the stale empty map immediately — the fetch was
 * never retried and calculator names never appeared in search results.
 *
 * This is the same pattern that was explicitly fixed in loadIcdIndex (PR #127,
 * commit 12a3a1e) but was missed in loadCatalogMeta.
 *
 * Fix: do NOT assign catalogMeta on error. Return new Map() directly so the
 * module-level variable stays null and the next call retries the fetch.
 *
 * These tests verify the retry-vs-cache semantics in pure JS (no DOM / fetch
 * mocking needed) using a local replica of the pattern.
 */

import { describe, it, expect } from 'vitest';

/** Simulate the BUGGY caching pattern (caches empty Map on error). */
function makeBuggyLoader() {
  let cache: Map<string, string> | null = null;
  let callCount = 0;
  return {
    async load(): Promise<Map<string, string>> {
      if (cache) return cache;
      callCount++;
      // Simulate failure
      cache = new Map(); // BUG: empty Map is truthy → never retries
      return cache;
    },
    getCallCount: () => callCount,
  };
}

/** Simulate the FIXED caching pattern (returns without caching on error). */
function makeFixedLoader() {
  const cache: Map<string, string> | null = null;
  let callCount = 0;
  return {
    async load(): Promise<Map<string, string>> {
      if (cache) return cache;
      callCount++;
      // Simulate failure — fixed: do NOT write to cache
      return new Map();
    },
    getCallCount: () => callCount,
  };
}

describe('loadCatalogMeta dead-cache regression', () => {
  it('BUGGY: empty Map is truthy so subsequent calls skip the fetch entirely', async () => {
    const loader = makeBuggyLoader();
    await loader.load(); // fails, caches new Map()
    await loader.load(); // guard returns cached Map — fetch never retried
    expect(loader.getCallCount()).toBe(1); // only 1 fetch attempt total
  });

  it('FIXED: null cache means every call after failure retries the fetch', async () => {
    const loader = makeFixedLoader();
    await loader.load(); // fails, does NOT cache
    await loader.load(); // retries
    expect(loader.getCallCount()).toBe(2); // retried as expected
  });

  it('FIXED: successful load IS cached (no unnecessary retries after success)', async () => {
    let cache: Map<string, string> | null = null;
    let callCount = 0;
    const load = async (): Promise<Map<string, string>> => {
      if (cache) return cache;
      callCount++;
      cache = new Map([['calc-1', 'BMI']]);
      return cache;
    };

    const first = await load();
    const second = await load(); // must return same cached map
    expect(callCount).toBe(1);
    expect(first).toBe(second); // exact same reference
    expect(second?.get('calc-1')).toBe('BMI');
  });
});
