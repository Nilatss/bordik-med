/**
 * Regression tests for `lib/auth-actions.ts`.
 *
 * Bug: `app/auth/login/page.tsx` called `sb.auth.signInWithOtp` /
 * `sb.auth.signInWithOAuth` with no try/catch. Those calls can reject
 * outright — not just resolve with `{ error }` — e.g. a raw DOMException
 * from blocked localStorage (Safari private mode) when the PKCE flow tries
 * to persist the code verifier. Unguarded, the rejection escaped as an
 * unhandled promise and left the login button stuck on "sending" forever
 * with the phase state never reset. `sendMagicLink`/`signInWithGoogle`
 * catch that and return a discriminated result instead of throwing.
 */
import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sendMagicLink, signInWithGoogle } from '@/lib/auth-actions';

function fakeClient(overrides: {
  signInWithOtp?: () => Promise<{ error: { message: string } | null }>;
  signInWithOAuth?: () => Promise<{ error: { message: string } | null }>;
}): SupabaseClient {
  return {
    auth: {
      signInWithOtp: overrides.signInWithOtp ?? (async () => ({ error: null })),
      signInWithOAuth: overrides.signInWithOAuth ?? (async () => ({ error: null })),
    },
  } as unknown as SupabaseClient;
}

describe('sendMagicLink', () => {
  it('returns ok on a clean send', async () => {
    const sb = fakeClient({ signInWithOtp: async () => ({ error: null }) });
    const res = await sendMagicLink(sb, 'a@b.com', 'https://x/auth/callback');
    expect(res).toEqual({ ok: true });
  });

  it('surfaces a Supabase-reported error without throwing', async () => {
    const sb = fakeClient({ signInWithOtp: async () => ({ error: { message: 'rate limited' } }) });
    const res = await sendMagicLink(sb, 'a@b.com', 'https://x/auth/callback');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('rate limited');
  });

  it('catches a rejected promise (e.g. blocked localStorage) instead of letting it escape unhandled', async () => {
    const sb = fakeClient({
      signInWithOtp: async () => { throw new DOMException('blocked', 'SecurityError'); },
    });
    await expect(sendMagicLink(sb, 'a@b.com', 'https://x/auth/callback')).resolves.toEqual(
      expect.objectContaining({ ok: false }),
    );
    const res = await sendMagicLink(sb, 'a@b.com', 'https://x/auth/callback');
    expect(typeof res.error).toBe('string');
  });
});

describe('signInWithGoogle', () => {
  it('returns ok on a clean OAuth kick-off', async () => {
    const sb = fakeClient({ signInWithOAuth: async () => ({ error: null }) });
    const res = await signInWithGoogle(sb, 'https://x/auth/callback');
    expect(res).toEqual({ ok: true });
  });

  it('surfaces a Supabase-reported error without throwing', async () => {
    const sb = fakeClient({ signInWithOAuth: async () => ({ error: { message: 'provider disabled' } }) });
    const res = await signInWithGoogle(sb, 'https://x/auth/callback');
    expect(res.ok).toBe(false);
    expect(res.error).toBe('provider disabled');
  });

  it('catches a rejected promise instead of letting it escape unhandled', async () => {
    const sb = fakeClient({
      signInWithOAuth: async () => { throw new DOMException('blocked', 'SecurityError'); },
    });
    const res = await signInWithGoogle(sb, 'https://x/auth/callback');
    expect(res.ok).toBe(false);
    expect(typeof res.error).toBe('string');
  });
});
