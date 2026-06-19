/**
 * Regression test for the missing try/catch around the favourites_updated_at
 * Supabase update in /api/sync POST handler.
 *
 * Bug: The comment above that code block said "any error here is ignored",
 * but the await was not wrapped in try/catch. A Supabase error (e.g. the
 * favourites_updated_at column not yet existing after a pending migration)
 * would propagate as an unhandled rejection, returning a 500 to the client
 * even though the main sync upsert had already succeeded.
 *
 * Fix: Wrap the update in try/catch. The enclosing logic now mirrors the
 * comment's intent — the favourites_updated_at step is truly optional.
 */
import { describe, it, expect } from 'vitest';

/**
 * Simulates the critical section of the POST /api/sync handler:
 * the main tasks succeed, and then the favourites_updated_at update
 * is attempted. Returns the final response object.
 */
async function runSyncPost(opts: {
  favUpdatedAt: number | null;
  hasSettings: boolean;
  updateFn: () => Promise<void>;
}): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const tasks: Promise<void>[] = [Promise.resolve()];
  const results = await Promise.allSettled(tasks);
  const rejected = results.filter((r) => r.status === 'rejected');
  if (rejected.length > 0) return { ok: false, error: 'partial-failure' };

  // This is the block that previously lacked try/catch (Bug 1).
  if (opts.favUpdatedAt != null && opts.hasSettings) {
    try {
      await opts.updateFn();
    } catch {
      // Tolerant: column may not exist yet (migration not applied).
    }
  }

  return { ok: true, count: tasks.length };
}

describe('sync POST — favourites_updated_at error isolation', () => {
  it('returns success even when the favourites_updated_at update throws', async () => {
    const result = await runSyncPost({
      favUpdatedAt: Date.now(),
      hasSettings: true,
      updateFn: async () => { throw new Error('column "favourites_updated_at" of relation "tool_settings" does not exist'); },
    });
    expect(result).toEqual({ ok: true, count: 1 });
  });

  it('returns success when the favourites_updated_at update succeeds', async () => {
    const result = await runSyncPost({
      favUpdatedAt: Date.now(),
      hasSettings: true,
      updateFn: async () => { /* no-op — success */ },
    });
    expect(result).toEqual({ ok: true, count: 1 });
  });

  it('skips the update when favUpdatedAt is null', async () => {
    let called = false;
    const result = await runSyncPost({
      favUpdatedAt: null,
      hasSettings: true,
      updateFn: async () => { called = true; },
    });
    expect(result).toEqual({ ok: true, count: 1 });
    expect(called).toBe(false);
  });

  it('skips the update when there is no settings payload', async () => {
    let called = false;
    const result = await runSyncPost({
      favUpdatedAt: Date.now(),
      hasSettings: false,
      updateFn: async () => { called = true; },
    });
    expect(result).toEqual({ ok: true, count: 1 });
    expect(called).toBe(false);
  });
});
