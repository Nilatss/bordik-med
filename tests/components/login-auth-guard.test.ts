/**
 * Regression test for unhandled promise rejections on the login page.
 *
 * Context: app/auth/login/page.tsx called `sb.auth.signInWithOtp` and
 * `sb.auth.signInWithOAuth` with no try/catch. Both calls only handle the
 * `{ error }` field Supabase resolves with on an auth-level failure — a
 * network failure, CORS error, or misconfiguration instead REJECTS the
 * promise. Without a catch, `sendLink` left the UI stuck on "Отправляем…"
 * forever with no error shown, and both were unhandled-rejection noise.
 *
 * `requestMagicLink`/`requestGoogleOAuth` were extracted so this can be
 * proven without a DOM/React harness: they must never throw, always
 * resolving to a discriminated `{ ok }` result.
 */
import { describe, it, expect } from 'vitest';
import { requestMagicLink, requestGoogleOAuth } from '@/lib/supabase/login-helpers';

function throwingClient(errName = 'NetworkError') {
  return {
    auth: {
      signInWithOtp: async () => { throw new Error(errName); },
      signInWithOAuth: async () => { throw new Error(errName); },
    },
  } as unknown as Parameters<typeof requestMagicLink>[0];
}

function erroringClient(message: string) {
  return {
    auth: {
      signInWithOtp: async () => ({ error: { message } }),
      signInWithOAuth: async () => ({ error: { message } }),
    },
  } as unknown as Parameters<typeof requestMagicLink>[0];
}

function okClient() {
  return {
    auth: {
      signInWithOtp: async () => ({ error: null }),
      signInWithOAuth: async () => ({ error: null }),
    },
  } as unknown as Parameters<typeof requestMagicLink>[0];
}

describe('requestMagicLink', () => {
  it('does not throw when signInWithOtp rejects (network/CORS failure)', async () => {
    const result = await requestMagicLink(throwingClient(), 'a@b.com', 'https://x/auth/callback');
    expect(result.ok).toBe(false);
  });

  it('surfaces the Supabase error message when it resolves with {error}', async () => {
    const result = await requestMagicLink(erroringClient('rate limited'), 'a@b.com', 'https://x/auth/callback');
    expect(result).toEqual({ ok: false, message: 'rate limited' });
  });

  it('resolves ok on success', async () => {
    const result = await requestMagicLink(okClient(), 'a@b.com', 'https://x/auth/callback');
    expect(result).toEqual({ ok: true });
  });
});

describe('requestGoogleOAuth', () => {
  it('does not throw when signInWithOAuth rejects (network/CORS failure)', async () => {
    const result = await requestGoogleOAuth(throwingClient(), 'https://x/auth/callback');
    expect(result.ok).toBe(false);
  });

  it('resolves ok on success', async () => {
    const result = await requestGoogleOAuth(okClient(), 'https://x/auth/callback');
    expect(result).toEqual({ ok: true });
  });
});
