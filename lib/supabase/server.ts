import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client — for use inside Server Components,
 * Route Handlers, and Server Actions. Reads/writes auth cookies via
 * the Next.js cookies() store, so the same session that the browser
 * established is recognised here without any extra wiring.
 *
 * NOTE: must be awaited because next/headers cookies() is async in
 * Next.js 15+.
 */
export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
