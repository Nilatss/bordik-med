import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Sign-out logic for `components/layout/UserMenu.tsx`, pulled out so the
 * fallback path can be unit-tested (the repo's vitest setup is node-env
 * with no jsdom/testing-library, so DOM-dependent glue like the dynamic
 * `import()` and `location.replace` are injected as deps here).
 *
 * `loadFullLogout` (a dynamic import in production) can reject with a
 * ChunkLoadError when a new deploy ships while this tab still holds an old
 * bundle / service-worker cache referencing a chunk hash that's gone from
 * the CDN. Left unguarded, that made "Выйти" a silent no-op — on a
 * shared/clinical device, the next person could walk up to a session that
 * looks logged out but isn't. If the module fails to load, fall back to
 * killing the Supabase session and wiping storage directly so sign-out can
 * never silently do nothing.
 */
export interface SignOutDeps {
  loadFullLogout: () => Promise<{ fullLogout: () => Promise<void> }>;
  getClient: () => SupabaseClient | null;
  clearStorage: () => void;
  navigate: () => void;
}

export async function signOutWithFallback(deps: SignOutDeps): Promise<void> {
  try {
    const { fullLogout } = await deps.loadFullLogout();
    await fullLogout();
  } catch (err) {
    console.warn('[UserMenu] fullLogout module failed to load, falling back to minimal signOut', err);
    try {
      const sb = deps.getClient();
      await sb?.auth.signOut({ scope: 'global' });
    } catch { /* best effort */ }
    try {
      deps.clearStorage();
    } catch { /* best effort */ }
    deps.navigate();
  }
}
