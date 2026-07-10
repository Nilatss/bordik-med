/**
 * Regression tests for `lib/user-menu-signout.ts`.
 *
 * Bug: `UserMenu.signOut` did `const { fullLogout } = await
 * import('@/lib/full-logout'); await fullLogout();` with no try/catch. The
 * dynamic import can reject with a ChunkLoadError right after a deploy
 * (stale bundle / service-worker cache referencing a chunk hash that's
 * gone from the CDN) — "Выйти" then silently did nothing, which is unsafe
 * on a shared/clinical device: the next person could find a session that
 * looks logged out but isn't. `signOutWithFallback` must still kill the
 * session, wipe storage, and navigate away even when loading the module
 * fails.
 */
import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { signOutWithFallback } from '@/lib/user-menu-signout';

describe('signOutWithFallback', () => {
  it('calls fullLogout and skips the fallback on the happy path', async () => {
    const fullLogout = vi.fn().mockResolvedValue(undefined);
    const getClient = vi.fn();
    const clearStorage = vi.fn();
    const navigate = vi.fn();

    await signOutWithFallback({
      loadFullLogout: async () => ({ fullLogout }),
      getClient,
      clearStorage,
      navigate,
    });

    expect(fullLogout).toHaveBeenCalledTimes(1);
    expect(getClient).not.toHaveBeenCalled();
    expect(clearStorage).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('falls back to killing the session, wiping storage and navigating when the module fails to load (ChunkLoadError)', async () => {
    const signOutFn = vi.fn().mockResolvedValue({ error: null });
    const sb = { auth: { signOut: signOutFn } } as unknown as SupabaseClient;
    const getClient = vi.fn().mockReturnValue(sb);
    const clearStorage = vi.fn();
    const navigate = vi.fn();

    await signOutWithFallback({
      loadFullLogout: async () => { throw new Error('ChunkLoadError'); },
      getClient,
      clearStorage,
      navigate,
    });

    expect(signOutFn).toHaveBeenCalledWith({ scope: 'global' });
    expect(clearStorage).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('still wipes storage and navigates even if there is no Supabase client configured', async () => {
    const getClient = vi.fn().mockReturnValue(null);
    const clearStorage = vi.fn();
    const navigate = vi.fn();

    await signOutWithFallback({
      loadFullLogout: async () => { throw new Error('ChunkLoadError'); },
      getClient,
      clearStorage,
      navigate,
    });

    expect(clearStorage).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('still navigates even if the fallback signOut/clearStorage itself throws', async () => {
    const getClient = vi.fn().mockImplementation(() => { throw new Error('boom'); });
    const clearStorage = vi.fn().mockImplementation(() => { throw new Error('boom'); });
    const navigate = vi.fn();

    await signOutWithFallback({
      loadFullLogout: async () => { throw new Error('ChunkLoadError'); },
      getClient,
      clearStorage,
      navigate,
    });

    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('falls back when fullLogout() itself rejects, not just when the import rejects', async () => {
    const signOutFn = vi.fn().mockResolvedValue({ error: null });
    const sb = { auth: { signOut: signOutFn } } as unknown as SupabaseClient;
    const getClient = vi.fn().mockReturnValue(sb);
    const clearStorage = vi.fn();
    const navigate = vi.fn();

    await signOutWithFallback({
      loadFullLogout: async () => ({ fullLogout: () => Promise.reject(new Error('boom')) }),
      getClient,
      clearStorage,
      navigate,
    });

    expect(signOutFn).toHaveBeenCalledWith({ scope: 'global' });
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
