'use client';

import { createBrowserClient } from '@supabase/ssr';
// P1-CR-5 — Database type доступен в lib/database.types.ts для opt-in
// per-query типизации (sb.from<Profile>('profiles')). Не применяем как
// generic ко всему клиенту, чтобы не ломать неописанные таблицы
// (audit.record_version, consent_records, tools_versions).

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

/**
 * Extract a user-facing message from a Supabase auth call's `{ error }`
 * result, or `null` on success. `signInWithOAuth`/`signInWithOtp` resolve
 * normally (they don't throw) even when the provider is misconfigured or
 * the request fails — callers must check `error` explicitly or the
 * failure is silently swallowed with no UI feedback at all.
 */
export function authErrorMessage(result: { error: { message: string } | null }): string | null {
  return result.error ? result.error.message : null;
}
