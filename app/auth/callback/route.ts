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
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';

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
