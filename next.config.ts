import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';
import withSerwistInit from '@serwist/next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const isDev = process.env.NODE_ENV === 'development';

/* ── Build extra precache entries from the content manifest ─────────
   `npm run build:content` writes data/manifest.json with per-file SHA
   revisions. We hand them to Serwist as `additionalPrecacheEntries` so
   the Service Worker downloads catalog.meta.json + content-manifest.json
   + a critical handful of tool detail JSONs at install time. Subsequent
   tool opens are then instant offline. */
const CRITICAL_TOOL_IDS = [
  'bmi', 'bsa-mosteller', 'cockcroft', 'ckd-epi', 'mdrd', 'gcs', 'apgar',
  'wells-pe', 'wells-dvt', 'curb65', 'qsofa', 'news2', 'chads-vasc',
  'has-bled', 'heart', 'meld', 'parkland', 'holliday-segar', 'aa-gradient',
  'anion-gap',
] as const;

function buildAdditionalPrecacheEntries(): { url: string; revision: string }[] {
  const manifestPath = path.resolve(__dirname, 'data', 'manifest.json');
  if (!fs.existsSync(manifestPath)) return [];
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
      catalogRev: string;
      searchRev: Record<string, string>;
      toolRevs: Record<string, string>;
    };
    const entries: { url: string; revision: string }[] = [
      { url: '/catalog.meta.json', revision: manifest.catalogRev },
      { url: '/content-manifest.json', revision: manifest.catalogRev },
    ];
    for (const [locale, rev] of Object.entries(manifest.searchRev ?? {})) {
      entries.push({ url: `/search-${locale}.json`, revision: rev });
    }
    for (const id of CRITICAL_TOOL_IDS) {
      const rev = manifest.toolRevs?.[id];
      if (rev) entries.push({ url: `/tools-data/${id}.json`, revision: rev });
    }

    // P1-PERF-NEW-6 — добавляем МКБ-10 slim (2.4MB) в precache.
    // Bordik — медицинская PWA для RU/UZ; МКБ-10 используется в каждой
    // консультации (диагноз → код). На холодной загрузке ICD-страницы
    // без precache: 2-3s до первого render'а через CacheFirst-fetch.
    // С precache: SW install увеличивается на 2.4MB (~3s на 4G), но
    // first ICD-paint = instant.
    //
    // НЕ добавляем icd11-slim/icd11-mms (4-14MB) — slow-3G install
    // выйдет за порог терпения юзера. icd10cm/cpcs/ca — niche для US/CA,
    // 1-time CacheFirst достаточно.
    if (fs.existsSync(path.resolve(__dirname, 'public', 'icd10-slim.json'))) {
      entries.push({
        url: '/icd10-slim.json',
        revision: manifest.catalogRev, // привязан к catalog version
      });
    }

    return entries;
  } catch {
    return [];
  }
}

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Disable SW in dev — hot reload clashes with precache
  disable: isDev,
  // Reload the page when a new SW takes over so users pick up fresh content
  reloadOnOnline: true,
  cacheOnNavigation: true,
  additionalPrecacheEntries: buildAdditionalPrecacheEntries(),
});

/* ─────────────────────────────────────────────────────────────────
 * Baseline security headers applied to every response. CSP is set in
 * proxy.ts (per-request nonce; renamed from middleware.ts in Next 16);
 * everything else is static and lives
 * here.
 *
 * Notes:
 *   - HSTS preload requires holding `max-age >= 63072000` for 6 months
 *     and submission to hstspreload.org. Until then the directive is
 *     advisory but does not lock subdomains.
 *   - Permissions-Policy disables every powerful API by default. Camera
 *     stays at `self` because the proctoring flow needs it.
 *   - COEP `credentialless` enables SharedArrayBuffer (MediaPipe WASM
 *     threads) without breaking cross-origin <img>/OAuth popups the way
 *     `require-corp` does.
 * ───────────────────────────────────────────────────────────────── */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: [
      'camera=(self)',
      'microphone=(self)',
      'geolocation=()',
      'interest-cohort=()',
      'browsing-topics=()',
      'usb=()',
      'payment=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'serial=()',
      'bluetooth=()',
    ].join(', '),
  },
  { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
  { key: 'X-DNS-Prefetch-Control',       value: 'off' },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Hide server framework signature from response headers - small but free win
  poweredByHeader: false,
  // P3-PERF-NEW-4 — AVIF в дополнение к WebP. AVIF на ~30% меньше WebP
  // на cyrillic-content screenshots / illustrations / charts. Next/Image
  // отдаёт лучший формат, который понимает браузер (Accept header negotiation):
  // Chrome/Edge/Firefox/Safari 16.4+ → AVIF, старые Safari → WebP, IE → JPG.
  // Cost: build time увеличивается на ~5-10s (sharp кодирует AVIF медленнее
  // чем WebP), но это амортизируется кэшем .next/cache/images.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Source maps are generated ONLY when Sentry can actually upload + delete
  // them (i.e. SENTRY_AUTH_TOKEN is present). The wrapper's
  // `deleteSourcemapsAfterUpload: true` only runs as part of a successful
  // upload — so if the token is missing (a fork, a misconfigured preview),
  // emitting maps would leave readable .js.map files in the public bundle.
  // Gating on the token keeps prod source private in that case.
  productionBrowserSourceMaps: !!process.env.SENTRY_AUTH_TOKEN,
  // PWA / caching headers + global security baseline
  async headers() {
    return [
      // Apply security baseline to every route
      { source: '/:path*', headers: securityHeaders },
      // Service worker: extra CSP scoped to the worker file itself
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      // P1-SEC-2 — MediaPipe WASM self-hosted under /mediapipe/wasm.
      // Files are versioned by the package version we bake into the
      // build artifact, so they're effectively immutable and can be
      // cached aggressively. /mediapipe/wasm/integrity.json records the
      // sha384 of each shipped file as a build-time manifest (audit /
      // version-drift); it is NOT enforced at runtime (no SRI hook).
      {
        source: '/mediapipe/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // security.txt should be served as text/plain per RFC 9116
      {
        source: '/.well-known/security.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
};

// Bundle analyzer - opt-in via `ANALYZE=true npm run build`. Outputs HTML
// reports to .next/analyze/{client,server,edge}.html so we can see exactly
// which files end up in each route's chunk.
const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
});

/**
 * Sentry config wrapper. Must be the OUTERMOST wrapper so that Sentry's
 * webpack plugin runs after Serwist + bundle analyzer have decided what
 * to ship. The plugin uploads source maps at build time when
 * SENTRY_AUTH_TOKEN is present (Vercel prod / preview); on local dev
 * builds the upload step is silently skipped.
 */
export default withSentryConfig(analyzer(withSerwist(nextConfig)), {
  // Only forward env vars that are actually defined — exactOptionalPropertyTypes
  // refuses to pass `undefined` where the SDK expects a string.
  ...(process.env.SENTRY_ORG ? { org: process.env.SENTRY_ORG } : {}),
  ...(process.env.SENTRY_PROJECT ? { project: process.env.SENTRY_PROJECT } : {}),
  ...(process.env.SENTRY_AUTH_TOKEN ? { authToken: process.env.SENTRY_AUTH_TOKEN } : {}),

  // Suppress build-time logs unless on CI (keeps `npm run dev` quiet)
  silent: !process.env.CI,

  // Tunnel /monitoring -> Sentry ingest endpoint to bypass ad-blockers
  // that block the bare ingest hostname. Adds one Vercel function but
  // reliable error reporting is worth the small cost.
  tunnelRoute: '/monitoring',

  // Delete the source maps from the public bundle after Sentry has them.
  // Stack traces in Sentry UI stay readable; users hitting view-source
  // see minified code only.
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Upload sourcemaps for ALL client-side chunks, not just the ones
  // Sentry's heuristics consider relevant. Without this we got 21 build
  // warnings about "could not determine a source map reference" which
  // (combined with `deleteSourcemapsAfterUpload`) failed the Vercel build.
  widenClientFileUpload: true,

  // Webpack-specific Sentry options. The flat-level `disableLogger`
  // and `automaticVercelMonitors` options that lived here previously
  // were deprecated in @sentry/nextjs 10 — they were moved into a
  // nested `webpack` object so the same SentryBuildOptions surface can
  // configure both webpack and turbopack builds independently.
  webpack: {
    // Strip Sentry's internal `console.log` statements from production
    // bundles. Saves a kilobyte and avoids leaking SDK internals.
    treeshake: {
      removeDebugLogging: true,
    },
    // Skip the SDK's automatic generation of "Vercel monitor" cron
    // tasks — we don't use Vercel cron jobs.
    automaticVercelMonitors: false,
  },
});
