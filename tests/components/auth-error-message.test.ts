/**
 * Test for lib/supabase/client.ts's authErrorMessage, backing the
 * app/auth/login "Войти через Google" bug: signInWithOAuth resolves
 * normally (no throw) even when the OAuth provider is misconfigured or the
 * request fails — the old code never read the `{ error }` result, so a
 * failure left the button silently doing nothing with no feedback at all.
 */
import { describe, it, expect } from 'vitest';
import { authErrorMessage } from '@/lib/supabase/client';

describe('authErrorMessage', () => {
  it('returns null on success', () => {
    expect(authErrorMessage({ error: null })).toBeNull();
  });

  it('surfaces the message when the provider call fails', () => {
    expect(authErrorMessage({ error: { message: 'provider is not enabled' } })).toBe(
      'provider is not enabled',
    );
  });
});
