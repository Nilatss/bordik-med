'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client.
 *
 * Returns `null` when the env vars are missing so the rest of the app
 * (sign-in UI, sync hook, user menu) can detect that the backend isn't
 * configured yet and fall back to local-only mode — no runtime crash,
 * no infinite skeleton loader. Bordik must keep working without a
 * Supabase project provisioned (offline-first ethos).
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
