'use client';

/**
 * Hides the pre-hydration skeleton (#__app_skeleton in app/layout.tsx)
 * on every route, not just the home page.
 *
 * Two-phase fade matches the CSS in app/layout.tsx:
 *   data-ready="1" → opacity transition
 *   data-ready="2" → display:none after the fade
 *
 * Without this, routes that don't import app/page.tsx (e.g. /privacy,
 * /terms, /reset, /auth/*) sit behind the skeleton forever.
 */
import { useEffect } from 'react';

export function SkeletonHider() {
  useEffect(() => {
    document.documentElement.dataset.ready = '1';
    const t = setTimeout(() => {
      document.documentElement.dataset.ready = '2';
    }, 250);
    return () => clearTimeout(t);
  }, []);
  return null;
}
