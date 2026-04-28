'use client';

import { useEffect } from 'react';

/**
 * Guards against the BFCache (back-forward cache) leaking a logged-in
 * page state after sign-out.
 *
 * Scenario:
 *   1. User signs in, opens any page.
 *   2. User signs out (or is signed out by token expiry).
 *   3. User clicks browser BACK.
 *   4. The browser may serve the previous page from BFCache, complete with
 *      in-memory React state showing they are still signed in - even
 *      though the cookie/session is gone.
 *
 * The `pageshow` event fires whenever a page is shown, including from
 * BFCache (event.persisted === true). We force a reload in that case so
 * the page re-fetches the auth state.
 *
 * Mounted once at the root layout level. Zero render output, zero perf
 * impact in normal navigation.
 */
/**
 * P1-SEC-9 — synchronous correlation check between Zustand-persisted
 * "user is logged in" snapshot and the live Supabase auth cookie. If
 * Zustand still says signed-in but the cookie is gone (session expired
 * during BFCache stay), force a reload — async signOut would not run
 * before the page paints from BFCache.
 */
function hasSupabaseAuthCookie(): boolean {
  try {
    return /(?:^|;\s*)sb-[^=]+-auth-token\b/.test(document.cookie ?? '');
  } catch { return false; }
}

function persistedSnapshotHasUser(): boolean {
  try {
    const raw = localStorage.getItem('ironmed-progress')
             ?? localStorage.getItem('bordik-progress');
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> } | null;
    const s = parsed?.state ?? {};
    // We persist *user fields* (email/name) but never the auth token.
    // If any of them are non-empty, the cached UI thinks the user is
    // signed in.
    return Boolean(
      (s.userEmail && typeof s.userEmail === 'string' && s.userEmail.length > 0) ||
      (s.userName  && typeof s.userName  === 'string' && s.userName.length  > 0),
    );
  } catch { return false; }
}

export function BFCacheGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) {
        // Normal navigation — only re-check the auth/state correlation,
        // don't reload eagerly.
        if (persistedSnapshotHasUser() && !hasSupabaseAuthCookie()) {
          location.reload();
        }
        return;
      }
      // BFCache hit. The page has been frozen with potentially stale
      // auth state. We MUST reload to revalidate.
      location.reload();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
  return null;
}
