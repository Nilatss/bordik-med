import type { NextConfig } from 'next';
import fs from 'fs';
import path from 'path';
import withSerwistInit from '@serwist/next';
import withBundleAnalyzer from '@next/bundle-analyzer';

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
 * middleware.ts (per-request nonce); everything else is static and lives
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
  productionBrowserSourceMaps: false,
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
      // cached aggressively. Hashes in /mediapipe/wasm/integrity.json
      // give us a verifiable supply-chain pin.
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

export default analyzer(withSerwist(nextConfig));
