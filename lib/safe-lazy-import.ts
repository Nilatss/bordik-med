/**
 * Awaits a dynamic `import()` and swallows a rejection instead of leaving
 * an unhandled promise rejection loose in the console/Sentry.
 *
 * Dynamic imports reject with `ChunkLoadError` when the hashed chunk 404s
 * — the classic case being a tab left open across a Vercel deploy, or a
 * flaky connection. Call sites get `null` back and fall back to whatever
 * UI state they already show (e.g. leave search results empty) instead of
 * crashing the effect.
 */
export async function safeLazyImport<T>(loader: () => Promise<T>): Promise<T | null> {
  try {
    return await loader();
  } catch {
    return null;
  }
}
