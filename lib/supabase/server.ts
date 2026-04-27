import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client. Returns `null` when env vars are missing
 * so API routes can respond with a clean 503 instead of crashing the
 * Next.js server runtime.
 *
 * NOTE: must be awaited because next/headers cookies() is async in
 * Next.js 15+.
 */
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cookieStore = await cookies();
  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet) {
          try {
            for (const { name, value, options } of toSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component during read-only render —
            // safe to ignore. Cookies refresh on the next mutation.
          }
        },
      },
    },
  );
}
