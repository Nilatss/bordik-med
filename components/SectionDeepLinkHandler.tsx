'use client';

/**
 * Handles `/?section=<id>` deep-links into the SPA.
 *
 * The Cmd-K palette "Разделы" results navigate to `/?section=<id>` via a
 * full reload, but nothing read the param — the user landed on the home
 * feed with their intent dropped. This handler (mirror of
 * ToolDeepLinkHandler) reads the param after hydration, opens the Learning
 * view at that curriculum section, and strips the param so the URL stays
 * clean for sharing / back-button.
 *
 * No-op when the param is missing or not a known section id.
 */
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import type { SectionId } from '@/lib/curriculum-types';

const VALID_SECTIONS = new Set<SectionId>([
  'fundamentals', 'biomedical', 'clinical', 'allied', 'skills', 'hss',
  'threads', 'frontier', 'business', 'regulatory', 'career', 'tech',
]);

export function SectionDeepLinkHandler() {
  const sp = useSearchParams();
  const setShowLearning = useAppStore((s) => s.setShowLearning);
  const setActiveSection = useAppStore((s) => s.setActiveSection);

  useEffect(() => {
    const id = sp.get('section');
    if (!id || !VALID_SECTIONS.has(id as SectionId)) return;
    // setShowLearning first (it resets activeSection), then open the section.
    setShowLearning(true);
    setActiveSection(id as SectionId);
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('section');
      window.history.replaceState(null, '', url.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run-once on mount; store actions are stable (mirrors ToolDeepLinkHandler).
  }, []);

  return null;
}
