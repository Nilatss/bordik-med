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
export function BFCacheGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // BFCache hit. Reload to revalidate auth + drop any stale state.
        location.reload();
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
  return null;
}
