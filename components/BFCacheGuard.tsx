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
 *      in-memory React state showing they are still signed in — even
 *      though the cookie/session is gone.
 *
 * The `pageshow` event fires whenever a page is shown, including from
 * BFCache (`event.persisted === true`). We force a reload in that case so
 * the page re-fetches the auth state.
 *
 * Why we do NOT also check on regular page-show: a previous version
 * compared a Zustand-persisted "userEmail" snapshot against the auth
 * cookie and reloaded when they disagreed. That logic could fire on
 * every load if the localStorage snapshot was stale, producing an
 * infinite reload loop. Stale persistent identity is a UI concern best
 * handled where the user sees it (UserMenu re-renders as signed-out
 * once it observes no session) — not by hijacking page navigation.
 */
export function BFCacheGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPageShow = (e: PageTransitionEvent) => {
      // Only react to actual BFCache resumes. e.persisted === true means
      // the browser served a frozen page snapshot (back/forward nav from
      // a different origin or after a long pause). Reload once so React
      // re-mounts and re-checks the auth session.
      if (e.persisted) location.reload();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);
  return null;
}
