'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client — used inside Client Components for
 * realtime subscriptions, file uploads, and direct queries that don't
 * need to run on the server. Cookies are managed automatically by
 * `@supabase/ssr` so auth state is shared with Server Components.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
