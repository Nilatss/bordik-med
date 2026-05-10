/// <reference lib="webworker" />
/**
 * Bordik service worker — powered by Serwist.
 *
 * Strategy:
 *   - Precache the Next.js build manifest (framework, CSS, fonts, main chunks)
 *   - StaleWhileRevalidate for per-runner lazy chunks → first hit goes to network,
 *     subsequent hits go to cache, and fresh copy is fetched in background.
 *   - NetworkFirst for HTML pages → always try fresh, fallback to cache offline.
 *   - CacheFirst for images + fonts → immutable URLs from Next static pipeline.
 *
 * Offline fallback: when a page fails to load, serve /~offline (Next app route).
 */
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkFirst, NetworkOnly, StaleWhileRevalidate, CacheFirst, ExpirationPlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * P1-PERF-1 — adaptive navigation timeout.
 *
 * Default 3s NetworkFirst trips early on slow-3G (UZ rural baseline:
 * 600-1200ms typical, 5s+ during congestion). Read the connection
 * effectiveType once at SW init and pick a saner timeout per network
 * class. We don't make this dynamic per-request because Serwist's
 * NetworkFirst constructor takes a static value.
 */
function networkTimeoutSeconds(): number {
  // navigator.connection is non-standard but available in Chromium
  // service workers. Safari returns undefined.
  const conn = (
    self as unknown as {
      navigator?: { connection?: { effectiveType?: string; saveData?: boolean } };
    }
  ).navigator?.connection;
  const eff = conn?.effectiveType;
  if (conn?.saveData) return 12;       // user opt-in, be patient
  if (eff === 'slow-2g' || eff === '2g') return 12;
  if (eff === '3g') return 6;
  return 3;                             // 4g / wifi / unknown
}

const NAV_TIMEOUT_S = networkTimeoutSeconds();

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST ?? [],
  // CRITICAL: keep both false. With skipWaiting + clientsClaim true, every
  // background update auto-activates and silently RELOADS the page (via
  // controllerchange). Users see "the site refreshed for no reason while I
  // was reading", which is what they reported. The PwaRegistrar shows a
  // dismissable toast - the user explicitly clicks "Обновить", we then
  // postMessage SKIP_WAITING and the page reloads on their terms.
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: true,

  // Extra runtime-caching rules (on top of the Serwist defaults)
  runtimeCaching: [
    // ── /api/* must NEVER be cached. These responses are auth-coupled
    // (Bearer cookies, JWT, per-user data) and a stale cache hit after
    // fullLogout could leak the previous user's data on a shared device.
    // NetworkOnly forwards every call directly to the network.
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/'),
      handler: new NetworkOnly(),
    },
    // ── Auth callback and Supabase OAuth flows must also bypass cache.
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && (
        url.pathname.startsWith('/auth/') ||
        url.pathname.startsWith('/account/')
      ),
      handler: new NetworkOnly(),
    },
    // ── Catalog metadata + search index. NetworkFirst with a fast cache
    // fallback so users get fresh content online and instant offline reads.
    // The build script regenerates these on every deploy, so the network
    // copy always carries the latest revision.
    {
      matcher: ({ url }) => (
        url.pathname === '/catalog.meta.json' ||
        url.pathname === '/content-manifest.json' ||
        url.pathname === '/release-notes.json' ||
        /^\/search-[a-z]{2}\.json$/.test(url.pathname)
      ),
      handler: new StaleWhileRevalidate({
        cacheName: 'bordik-catalog',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // ── Self-hosted MediaPipe WASM. CacheFirst forever (versioned via
    // package + sha-pinned by /mediapipe/wasm/integrity.json).
    {
      matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/mediapipe/'),
      handler: new CacheFirst({
        cacheName: 'bordik-mediapipe',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // ── Per-tool detail JSON. CacheFirst so opening a tool offline is
    // instant. New revisions land via deploy + new content-manifest.json.
    {
      matcher: ({ url }) => url.pathname.startsWith('/tools-data/'),
      handler: new CacheFirst({
        cacheName: 'bordik-tool-detail',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 1000,
            maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // ── ICD classifications (МКБ-10, МКБ-11). Покрывает все варианты:
    // -mms, -mms-ext, -starter, -slim, -details, -search.
    // CacheFirst после первой загрузки = instant + offline.
    // Cache bust через query string ?v=X.Y.Z в коде клиента.
    //
    // Также покрывает все Neonatology Module JSONs (audit issue 1.11):
    //   neonatal-monographs, -guidelines, -growth, -bilirubin (existing)
    //   neonatal-calculators, -lab-norms, -articles, -lactmed (added 2026-05-09)
    // Полная offline-поддержка раздела Неонатология — данные кэшируются
    // CacheFirst, через query ?v=X.Y.Z bust для invalidation на deploy.
    {
      matcher: ({ url }) => (
        /^\/icd1[01](?:cm|pcs|ca|gm|am)?(-(?:mms(?:-ext)?|starter|slim|details|search|drug-table|neoplasm|index))?\.json$/.test(url.pathname)
        || url.pathname === '/neonatal-monographs.json'
        || url.pathname === '/neonatal-guidelines.json'
        || url.pathname === '/neonatal-growth.json'
        || url.pathname === '/neonatal-bilirubin.json'
        || url.pathname === '/neonatal-calculators.json'
        || url.pathname === '/neonatal-lab-norms.json'
        || url.pathname === '/neonatal-articles.json'
        || url.pathname === '/neonatal-lactmed.json'
        || url.pathname === '/neonatal-quizzes.json'
        || url.pathname === '/neonatal-nurse-procedures.json'
      ),
      handler: new CacheFirst({
        cacheName: 'bordik-icd',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 180 * 24 * 60 * 60, // 180 days
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Per-runner lazy chunks (heavy SWR cache so tools load instantly once opened)
    {
      matcher: /\/_next\/static\/chunks\/.*\.(js|css)$/i,
      handler: new StaleWhileRevalidate({
        cacheName: 'bordik-runner-chunks',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Static images (logo, icons, illustrations)
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: new CacheFirst({
        cacheName: 'bordik-images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
            purgeOnQuotaError: true,
          }),
        ],
      }),
    },
    // Fonts (immutable URLs)
    {
      matcher: /\.(?:woff2?|ttf|otf|eot)$/i,
      handler: new CacheFirst({
        cacheName: 'bordik-fonts',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },
    // HTML navigations — network-first, fall back to cache/offline page
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'bordik-pages',
        networkTimeoutSeconds: NAV_TIMEOUT_S,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },
    // Everything else — fall back to Serwist defaults
    ...defaultCache,
  ],

  // When a navigation request fails completely → serve the offline route.
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();

// Explicit handler for the toast "Обновить" button. PwaRegistrar posts
// { type: 'SKIP_WAITING' } to the waiting worker - we activate it on demand,
// which fires controllerchange in the page and triggers the user-initiated
// reload. Without this listener the toast button does nothing.
self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // P1-SEC-8 — emergency SW kill-switch. Used when a buggy SW lands
  // and users need to be forced off it. Triggered by /admin/sw-kill
  // page (or any privileged surface). Steps:
  //   1. skipWaiting so the new SW (or no-SW state) wins immediately.
  //   2. clear all runtime caches so we don't serve stale content.
  //   3. tell every live tab to reload.
  if (event.data.type === 'FORCE_UPDATE_AND_RELOAD') {
    void (async () => {
      try { await self.skipWaiting(); } catch {/* */}
      try {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      } catch {/* */}
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      for (const c of clients) {
        c.postMessage({ type: 'RELOAD' });
      }
    })();
    return;
  }
});

/* ── Background Sync drain (Chrome/Edge/Samsung; falls through on iOS) ──
   When the page registers `sync.register('sync-progress')` while offline,
   the browser fires this event as soon as connectivity returns - even if
   the page tab has been closed in the meantime. We post each queued
   payload back through /api/sync; whatever the page-side `online` listener
   couldn't handle (because the tab was gone), this picks up.

   The queue itself lives in `localStorage` on the page side. We can't read
   localStorage from a SW, so we instead message all clients and ask one of
   them to do the flush. If no clients are alive, the page's next `online`
   listener flush will do it. Net-net: at-most-once delivery, idempotent on
   the server, no work duplicated. */
interface BgSyncEvent extends ExtendableEvent {
  tag: string;
}
self.addEventListener('sync', ((event: BgSyncEvent) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil((async () => {
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      for (const c of clients) {
        c.postMessage({ type: 'SYNC_PROGRESS_FLUSH' });
      }
    })());
    return;
  }

  // P1-UX-3 — fullLogout failed offline; retry the global signOut
  // through any live client. We can't read the auth cookie/session from
  // the SW directly, so we ping the page and let it call signOut again.
  if (event.tag === 'logout-retry') {
    event.waitUntil((async () => {
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      for (const c of clients) {
        c.postMessage({ type: 'LOGOUT_RETRY' });
      }
    })());
    return;
  }
}) as EventListener);
