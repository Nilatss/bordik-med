/**
 * singletonFetch — deduplicate concurrent calls to the same async loader.
 *
 * If two callers invoke the returned function before the first settles, the
 * second receives the same in-flight Promise rather than starting a new fetch.
 * This matches the pattern used by loadToolsIndex in CommandPalette.tsx and
 * is extracted here so it can be unit-tested.
 *
 * Usage:
 *   const loadData = singletonFetch(async () => {
 *     const r = await fetch('/data.json');
 *     return r.json();
 *   });
 *
 *   // Concurrent callers share the same request:
 *   const [a, b] = await Promise.all([loadData(), loadData()]);
 */
const UNCACHED = Symbol('uncached');

export function singletonFetch<T>(loader: () => Promise<T>): () => Promise<T> {
  let cached: T | typeof UNCACHED = UNCACHED;
  let inflight: Promise<T> | null = null;

  return async function load(): Promise<T> {
    if (cached !== UNCACHED) return cached;
    if (inflight) return inflight;
    inflight = loader().then((result) => {
      cached = result;
      inflight = null;
      return result;
    }, (err) => {
      inflight = null;
      throw err;
    });
    return inflight;
  };
}
