'use client';

/**
 * Handles `/?tool=<id>` deep-links into the SPA.
 *
 * Visitors arriving from /tools/[id] landing pages (server-rendered for
 * SEO) click "Открыть калькулятор" which sends them to /?tool=<id>.
 * This handler reads the query param after hydration, calls the store's
 * `openTool` action, and strips the param from the URL so back-button
 * navigation behaves cleanly.
 *
 * No-op when the param is missing.
 */
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export function ToolDeepLinkHandler() {
  const sp = useSearchParams();
  const openTool = useAppStore((s) => s.openTool);

  useEffect(() => {
    const id = sp.get('tool');
    if (!id) return;
    // Validate against the same character set the static route accepts
    // — avoid weird inputs flowing into the store. The shape comes from
    // a real tool slug ([a-z0-9_-]).
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id)) return;
    openTool(id);
    // Clear the search param without triggering a full navigation so
    // useEffect doesn't re-fire and the URL stays clean for sharing.
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('tool');
      window.history.replaceState(null, '', url.toString());
    }
  // openTool from Zustand is a stable reference, sp.get only depends
  // on the search-params snapshot which is itself memoised by Next.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
