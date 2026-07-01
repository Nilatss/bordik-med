import type { getSupabaseBrowserClient } from '@/lib/supabase/client';

type AuthClient = ReturnType<typeof getSupabaseBrowserClient>;
type AuthResult = { ok: true } | { ok: false; message: string };

/** Request a magic-link email. Never throws — network failures, CORS
 *  errors, and other rejections from `signInWithOtp` are caught and
 *  turned into a `{ ok: false }` result instead of an unhandled
 *  promise rejection. */
export async function requestMagicLink(
  sb: NonNullable<AuthClient>,
  email: string,
  emailRedirectTo: string,
): Promise<AuthResult> {
  try {
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось отправить ссылку. Проверьте соединение и попробуйте снова.' };
  }
}

/** Same shielding for Google OAuth — see requestMagicLink. */
export async function requestGoogleOAuth(
  sb: NonNullable<AuthClient>,
  redirectTo: string,
): Promise<AuthResult> {
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch {
    return { ok: false, message: 'Не удалось войти через Google. Проверьте соединение и попробуйте снова.' };
  }
}
