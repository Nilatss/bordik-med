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
import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst, ExpirationPlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,

  // Extra runtime-caching rules (on top of the Serwist defaults)
  runtimeCaching: [
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
        networkTimeoutSeconds: 3,
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
