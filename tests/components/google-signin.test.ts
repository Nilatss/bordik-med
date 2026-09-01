/**
 * Test for `attemptGoogleSignIn` in lib/supabase/google-sign-in.ts, used by
 * the Google button on app/auth/login/page.tsx.
 *
 * Bug being fixed: unlike the magic-link `sendLink` handler right above it,
 * `signInWithGoogle` awaited `sb.auth.signInWithOAuth` with no try/catch and
 * ignored the returned `{ error }` — a failed request (third-party cookies
 * blocked, network error) left the button doing nothing with zero feedback,
 * and a rejection would have been an unhandled promise rejection on click.
 */
import { describe, it, expect } from 'vitest';
import { attemptGoogleSignIn } from '@/lib/supabase/google-sign-in';

describe('attemptGoogleSignIn', () => {
  it('returns null on success', async () => {
    const sb = {
      auth: {
        signInWithOAuth: async () => ({ error: null }),
      },
    };
    await expect(attemptGoogleSignIn(sb, 'https://bordik.example')).resolves.toBeNull();
  });

  it('returns the Supabase error message when signInWithOAuth resolves with an error', async () => {
    const sb = {
      auth: {
        signInWithOAuth: async () => ({ error: { message: 'provider not enabled' } }),
      },
    };
    await expect(attemptGoogleSignIn(sb, 'https://bordik.example')).resolves.toBe('provider not enabled');
  });

  it('returns a fallback message instead of throwing when signInWithOAuth rejects', async () => {
    const sb = {
      auth: {
        signInWithOAuth: async () => {
          throw new Error('network error');
        },
      },
    };
    await expect(attemptGoogleSignIn(sb, 'https://bordik.example')).resolves.toMatch(/Google/);
  });

  it('passes the callback redirect URL built from the given origin', async () => {
    let seenRedirect = '';
    const sb = {
      auth: {
        signInWithOAuth: async (args: { options: { redirectTo: string } }) => {
          seenRedirect = args.options.redirectTo;
          return { error: null };
        },
      },
    };
    await attemptGoogleSignIn(sb, 'https://bordik.example');
    expect(seenRedirect).toBe('https://bordik.example/auth/callback');
  });
});
