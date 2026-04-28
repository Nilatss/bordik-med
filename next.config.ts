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

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // PWA / caching headers
  async headers() {
    return [
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
