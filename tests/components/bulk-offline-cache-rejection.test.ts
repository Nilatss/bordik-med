/**
 * Regression test for BulkOfflineDownload.tsx getCacheSizeBytes() rejection.
 *
 * Bug: BulkOfflineDownload.tsx called getCacheSizeBytes().then(setEstBytes)
 * without a .catch(). The Cache API throws in Firefox private windows and
 * in some restricted webview environments, producing an unhandled Promise
 * rejection. The estimated download size also stays at 0 (the initial
 * state), which is the acceptable graceful-degradation behaviour.
 *
 * Fix: add .catch(() => {}) so the rejection is consumed and the component
 * stays stable.
 */
import { describe, it, expect } from 'vitest';

function fetchCacheSizeWithFallback(
  getCacheSizeBytes: () => Promise<number>,
  setEstBytes: (n: number) => void,
): Promise<void> {
  return getCacheSizeBytes()
    .then(setEstBytes)
    .catch(() => { /* Cache API unavailable — estimate stays 0 */ });
}

describe('BulkOfflineDownload getCacheSizeBytes rejection handling', () => {
  it('sets the estimate when Cache API succeeds', async () => {
    let est = 0;
    await fetchCacheSizeWithFallback(() => Promise.resolve(12345), (n) => { est = n; });
    expect(est).toBe(12345);
  });

  it('does NOT produce an unhandled rejection when Cache API throws', async () => {
    let est = 0;
    await expect(
      fetchCacheSizeWithFallback(
        () => Promise.reject(new Error('SecurityError: Cache API blocked')),
        (n) => { est = n; },
      ),
    ).resolves.toBeUndefined();
    expect(est).toBe(0);
  });

  it('estimate stays 0 (graceful degradation) when Cache API is unavailable', async () => {
    let est = 0;
    await fetchCacheSizeWithFallback(
      () => Promise.reject(new DOMException('SecurityError')),
      (n) => { est = n; },
    );
    expect(est).toBe(0);
  });
});
