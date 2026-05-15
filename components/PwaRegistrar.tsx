'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Registers the Serwist-generated service worker and manages its lifecycle.
 *
 * Update notification flow
 * ------------------------
 * Showing an "Update available" toast on every Service Worker swap is
 * noisy: every deploy generates a new SW hash, even cosmetic ones, so
 * users learned to ignore the prompt. We now gate the toast on a real
 * release-notes file (`public/release-notes.json`):
 *
 *   1. SW reports a waiting worker → we know there IS a code update.
 *   2. Fetch /release-notes.json (cache-busted), pick the topmost entry.
 *   3. Read `bordik-last-seen-release` from localStorage.
 *   4. If the entry's version is newer than the last-seen version, show
 *      the toast with the release headline + a "Что нового" link to the
 *      /releases page. Otherwise silently skip the toast and let the new
 *      SW activate on the next natural reload (closing the tab, etc.).
 *
 * Cosmetic deploys / hotfixes / infra-only changes should NOT add an
 * entry to release-notes.json — that's the whole point. Users only get
 * pinged when there's something for them to actually look at.
 */

interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  summary: string;
  changes: string[];
}

const LAST_SEEN_KEY = 'bordik-last-seen-release';

async function fetchLatestRelease(): Promise<ReleaseEntry | null> {
  try {
    // Cache-bust so the SW can't return a stale JSON: this fetch is
    // explicitly meant to discover NEW versions, not honour caches.
    const r = await fetch(`/release-notes.json?ts=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { releases?: ReleaseEntry[] };
    return data.releases?.[0] ?? null;
  } catch {
    return null;
  }
}

function readLastSeen(): string | null {
  try { return localStorage.getItem(LAST_SEEN_KEY); }
  catch { return null; }
}

function setLastSeen(version: string) {
  try { localStorage.setItem(LAST_SEEN_KEY, version); }
  catch { /* private mode etc. */ }
}

export default function PwaRegistrar() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  const [release, setRelease] = useState<ReleaseEntry | null>(null);

  const applyUpdate = useCallback(() => {
    if (!waitingSW) return;
    // Mark the release as seen BEFORE we activate — otherwise the
    // post-reload PwaRegistrar mount would re-show the toast for a
    // version the user just confirmed.
    if (release) setLastSeen(release.version);
    waitingSW.postMessage({ type: 'SKIP_WAITING' });
    setWaitingSW(null);
  }, [waitingSW, release]);

  const dismiss = useCallback(() => {
    // Dismissing also marks as seen — user explicitly chose to ignore
    // this release, no need to re-prompt on next page load.
    if (release) setLastSeen(release.version);
    setWaitingSW(null);
    setRelease(null);
  }, [release]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Serwist disables SW in dev — nothing to register
    if (process.env.NODE_ENV !== 'production') return;

    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const onWaiting = async (sw: ServiceWorker) => {
      // Decide whether we should actually show the toast based on
      // release-notes content vs last-seen version.
      const latest = await fetchLatestRelease();
      if (!latest) {
        // No release file or fetch failed → fall back to silent update.
        // Don't pester users with a noisy toast, but still let the new
        // SW take over on the next natural reload by leaving it waiting.
        return;
      }
      const lastSeen = readLastSeen();
      if (lastSeen === latest.version) {
        // User has already seen this release — skip the toast.
        return;
      }
      setRelease(latest);
      setWaitingSW(sw);
    };

    const onReady = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        // If there's a waiting worker right now (page reload while new SW is ready)
        if (reg.waiting) onWaiting(reg.waiting);

        // Listen for new SWs being installed
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              onWaiting(installing);
            }
          });
        });

        // Hourly background check
        checkInterval = setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      } catch (err) {
        // SW registration failed — app still works, just no offline cache
        console.warn('[PwaRegistrar] registration failed', err);
      }
    };

    // Reload once when new SW takes over
    let didRefresh = false;
    const onControllerChange = () => {
      if (didRefresh) return;
      didRefresh = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // P1-SEC-8 — admin kill-switch echoes a RELOAD message to every
    // controlled tab. Reload immediately, no toast, no UI.
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === 'RELOAD') {
        if (didRefresh) return;
        didRefresh = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);

    // Wait for the page to finish loading before kicking off SW registration
    // — keeps the critical render path clean.
    if (document.readyState === 'complete') {
      onReady();
    } else {
      window.addEventListener('load', onReady, { once: true });
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  if (!waitingSW || !release) return null;

  // Non-intrusive update prompt — bottom-right toast with release headline
  return (
    <div
      className="fixed bottom-5 right-5 z-[9998] bg-white rounded-[12px] pt-3 pr-3.5 pb-3 pl-4 shadow-[0_8px_24px_rgba(15,23,42,0.18)] flex items-center gap-3 max-w-[380px] font-[var(--font-body,system-ui,-apple-system,sans-serif)]"
      role="status"
    >
      <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] inline-flex items-center justify-center shrink-0">
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#1A1A1A] m-0 leading-[1.3]">
          {release.title}
        </p>
        <p className="text-xs text-[#6B7280] mt-0.5 mb-0 mx-0 leading-[1.3]">
          <a href="/releases" className="text-[#2563EB] underline">
            Что нового
          </a>
          {' · '}
          v{release.version}
        </p>
      </div>
      <button
        onClick={applyUpdate}
        className="py-1.5 px-3 rounded-lg bg-[#1A1A1A] hover:bg-black text-white border-none cursor-pointer text-xs font-semibold font-[inherit] shrink-0 transition-colors duration-150"
      >
        Обновить
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Закрыть"
        className="bg-transparent border-none cursor-pointer p-1 -ml-1 text-[#9CA3AF] leading-none text-base font-[inherit]"
      >
        ×
      </button>
    </div>
  );
}
