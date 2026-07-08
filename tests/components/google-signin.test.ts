/**
 * Regression tests for `signInWithGoogleClient` (lib/auth/google-signin.ts).
 *
 * Bug: app/auth/login/page.tsx's `signInWithGoogle` called
 * `sb.auth.signInWithOAuth(...)` without reading the returned `{ error }`.
 * `signInWithOAuth` only resolves with the tab still open when the request
 * itself failed (misconfigured provider, network error) — on success it
 * navigates away. Dropping the error meant a failed OAuth attempt looked
 * like the button silently did nothing: no error message, no feedback.
 */
import { describe, it, expect, vi } from 'vitest';
import { signInWithGoogleClient } from '@/lib/auth/google-signin';

describe('signInWithGoogleClient', () => {
  it('returns the error message when signInWithOAuth fails', async () => {
    const sb = {
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({
          error: { message: 'Provider google is not enabled' },
        }),
      },
    };
    const result = await signInWithGoogleClient(sb, 'https://bordik.example/auth/callback');
    expect(result).toBe('Provider google is not enabled');
  });

  it('returns null when signInWithOAuth succeeds', async () => {
    const sb = {
      auth: {
        signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    const result = await signInWithGoogleClient(sb, 'https://bordik.example/auth/callback');
    expect(result).toBeNull();
  });

  it('passes the google provider and redirectTo through', async () => {
    const signInWithOAuth = vi.fn().mockResolvedValue({ error: null });
    const sb = { auth: { signInWithOAuth } };
    await signInWithGoogleClient(sb, 'https://bordik.example/auth/callback');
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://bordik.example/auth/callback' },
    });
  });
});
