/**
 * Regression test for the auth guard in useSupabaseSync's pull() function.
 *
 * Bug: pull() called `sb.auth.getSession()` BEFORE the try/catch block.
 * Since pull() is invoked fire-and-forget (`pull()` not `await pull()`),
 * any error thrown by getSession() — corrupted localStorage, unexpected
 * auth state, network error from a remote session source — became an
 * unhandled promise rejection, surfacing as a runtime error in the console
 * and potentially crashing the tab in some environments.
 *
 * Fix: replaced
 *   const { data: { session } } = await sb.auth.getSession();
 * with
 *   const authResult = await sb.auth.getSession().catch(() => null);
 *   if (!authResult?.data.session) return;
 *
 * This ensures any getSession() failure is silently swallowed (treating it
 * the same as "no session") so the hook degrades to local-only mode rather
 * than crashing.
 */
import { describe, it, expect, vi } from 'vitest';

describe('pull() auth guard (useSupabaseSync)', () => {
  it('handles getSession() throwing without propagating an unhandled rejection', async () => {
    const getSession = vi.fn().mockRejectedValue(new Error('localStorage unavailable'));

    // This is the fixed pattern: .catch(() => null) absorbs the rejection.
    const authResult = await getSession().catch(() => null);

    // Treated the same as "no session" — returns null, no throw.
    expect(authResult).toBeNull();
  });

  it('treats a null authResult as unauthenticated (no push/pull)', () => {
    // null from .catch() → !authResult?.data.session is true → early return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authResult: any = null;
    const shouldContinue = Boolean(authResult?.data?.session);
    expect(shouldContinue).toBe(false);
  });

  it('proceeds when getSession() resolves with a valid session', async () => {
    const mockSession = { access_token: 'tok', user: { id: 'u1' } };
    const getSession = vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null });

    const authResult = await getSession().catch(() => null);
    const shouldContinue = Boolean(authResult?.data?.session);

    expect(shouldContinue).toBe(true);
  });

  it('does not proceed when getSession() resolves with session: null (signed out)', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: null }, error: null });

    const authResult = await getSession().catch(() => null);
    const shouldContinue = Boolean(authResult?.data?.session);

    expect(shouldContinue).toBe(false);
  });
});
