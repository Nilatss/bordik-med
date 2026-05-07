import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * OAuth / magic-link callback. Supabase appends `?code=...` to the
 * redirect URL — we exchange that for a session, set the auth cookies,
 * and bounce the user to the original destination (or home if none).
 *
 * Magic-link flow:  user clicks email link → /auth/callback?code=...
 *                  → exchange → cookies set → redirect to `/`
 *
 * OAuth flow:       Google/GitHub redirect → /auth/callback?code=...
 *                  → same as above
 */
/**
 * P1-SEC — open-redirect guard. Supabase передаёт `next` user-controlled
 * параметром, который мы используем для пост-логин редиректа. Без
 * валидации `?next=//evil.com` или `?next=https://evil.com/x` уведёт
 * пользователя на чужой хост (URL-конструктор резолвит `//host` как
 * authority, не как path). Разрешаем только относительные пути с
 * единственным ведущим `/` и без `//` / `\\` / control-chars.
 */
function safeNextPath(raw: string | null): string {
  if (!raw) return '/';
  // Разрешаем только локальный путь: должен начинаться с одного `/`,
  // не быть `//host`, `\\host`, `/\evil`, `\/evil` и не содержать
  // control-символов (CRLF injection).
  if (!raw.startsWith('/')) return '/';
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/';
  if (/[\x00-\x1F]/.test(raw)) return '/';
  return raw;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNextPath(url.searchParams.get('next'));

  if (code) {
    const sb = await getSupabaseServerClient();
    if (!sb) {
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent('Backend ещё не настроен')}`, url.origin),
      );
    }
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) {
      // Fall back to login page with error toast
      return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, url.origin));
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
