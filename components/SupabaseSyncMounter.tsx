'use client';

/**
 * Lazy-loaded mount point for the Supabase ↔ Zustand sync hook.
 *
 * Why this wrapper exists: previously `useSupabaseSync()` was called
 * directly from `app/page.tsx`, which forced webpack to bundle
 * `@supabase/ssr` + `@supabase/supabase-js` into the home page chunk.
 * Lighthouse measured 45.9 KB of Supabase code as **unused** on the
 * anonymous home page (92% of the chunk).
 *
 * With this mounter wrapped in `next/dynamic({ ssr: false })`, the
 * Supabase code is split into its own async chunk that loads after
 * hydration, off the critical path. Anonymous visitors never pay the
 * cost. Authenticated visitors download the chunk in parallel with
 * other lazy imports while the page is already interactive.
 */
import useSupabaseSync from '@/lib/useSupabaseSync';

export default function SupabaseSyncMounter() {
  useSupabaseSync();
  return null;
}
