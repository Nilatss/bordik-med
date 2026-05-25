/**
 * Tests for the offline sync queue (lib/sync-queue.ts), focused on the
 * stage-3 audit race: flushSyncQueue wrote a stale snapshot, so a payload
 * enqueued DURING a flush (concurrent failed push / second flush) was
 * clobbered. The fix re-reads the queue and drops only the entries it
 * actually sent (by ts).
 *
 * The module guards on `typeof window` and uses localStorage, so we stub
 * both before exercising it.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

const store = new Map<string, string>();
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
});

import { enqueueSync, flushSyncQueue, hasPendingSync } from '@/lib/sync-queue';

describe('flushSyncQueue', () => {
  beforeEach(() => store.clear());
  afterAll(() => vi.unstubAllGlobals());

  it('clears an entry that was sent', async () => {
    enqueueSync({ a: 1 });
    const r = await flushSyncQueue(async () => true);
    expect(r.sent).toBe(1);
    expect(hasPendingSync()).toBe(false);
  });

  it('keeps an entry that failed', async () => {
    enqueueSync({ a: 1 });
    const r = await flushSyncQueue(async () => false);
    expect(r.failed).toBe(1);
    expect(hasPendingSync()).toBe(true);
  });

  it('preserves a payload enqueued DURING the flush (race fix)', async () => {
    const nowSpy = vi.spyOn(Date, 'now')
      .mockReturnValueOnce(1000)  // enqueue {v:1}
      .mockReturnValueOnce(2000); // enqueue {v:2} mid-flush
    enqueueSync({ v: 1 });
    const r = await flushSyncQueue(async () => {
      enqueueSync({ v: 2 }); // newer payload arrives while we're flushing
      return true;
    });
    expect(r.sent).toBe(1);
    // {v:2} (ts 2000) must survive — it wasn't in the sent set (ts 1000).
    expect(hasPendingSync()).toBe(true);
    nowSpy.mockRestore();
  });
});
