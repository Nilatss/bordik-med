import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// P1-CR-5 — Database type определён в lib/database.types.ts (hand-typed,
// неполный). НЕ применяем как generic к createServerClient, потому что
// текущий typed scope покрывает только public.* core таблицы;
// audit.record_version, consent_records, tools_versions ещё не описаны
// и сломали бы admin/audit, lib/consent. Generic применять прицельно
// per-call: sb.from<Profile>('profiles'). См. database.types.ts header
// для plan'а full migration через `supabase gen types`.

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
