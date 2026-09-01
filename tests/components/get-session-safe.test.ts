/**
 * Test for `getSessionSafe` in lib/useSupabaseSync.ts.
 *
 * Bug being fixed: `sb.auth.getSession()` was awaited outside any
 * try/catch inside the sync hook's `pull()`, and `pull()` was invoked
 * bare (no `.catch()`) both on mount and from the `onAuthStateChange`
 * callback. `getSession()` can reject (e.g. AuthRetryableFetchError
 * during a token refresh over a flaky/offline network), which turned
 * into an unhandled promise rejection on effectively every
 * authenticated page load or tab focus.
 */
import { describe, it, expect } from 'vitest';
import { getSessionSafe } from '@/lib/useSupabaseSync';

describe('getSessionSafe', () => {
  it('resolves to the session when getSession succeeds', async () => {
    const session = await getSessionSafe({
      getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }),
    });
    expect(session).toEqual({ user: { id: 'u1' } });
  });

  it('resolves to null when there is no session', async () => {
    const session = await getSessionSafe({
      getSession: async () => ({ data: { session: null } }),
    });
    expect(session).toBeNull();
  });

  it('resolves to null instead of rejecting when getSession throws (flaky network)', async () => {
    const auth = {
      getSession: async () => {
        throw new Error('AuthRetryableFetchError: fetch failed');
      },
    };
    await expect(getSessionSafe(auth)).resolves.toBeNull();
  });
});
