import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Sign-in actions used by `app/auth/login/page.tsx`, pulled out of the
 * component so the error-handling can be unit-tested directly.
 *
 * Both wrap the Supabase call in try/catch: `signInWithOtp`/`signInWithOAuth`
 * don't only resolve with `{ error }` — the client's own internal try/catch
 * (in `@supabase/auth-js`) only swallows `AuthError` instances and re-throws
 * anything else. A raw `DOMException` from blocked localStorage (Safari
 * private mode / hardened-privacy browsers trying to persist the PKCE code
 * verifier) is not an `AuthError`, so it used to escape as an unhandled
 * promise rejection and leave the login button stuck on "sending" forever.
 */
export interface SignInResult {
  ok: boolean;
  error?: string;
}

const UNEXPECTED_ERROR_MESSAGE =
  'Не удалось выполнить вход. Проверьте настройки браузера (приватный режим может блокировать вход) и попробуйте снова.';

export async function sendMagicLink(
  sb: SupabaseClient,
  email: string,
  redirectTo: string,
): Promise<SignInResult> {
  try {
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: UNEXPECTED_ERROR_MESSAGE };
  }
}

export async function signInWithGoogle(
  sb: SupabaseClient,
  redirectTo: string,
): Promise<SignInResult> {
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: UNEXPECTED_ERROR_MESSAGE };
  }
}
