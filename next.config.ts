import type { NextConfig } from 'next';
import path from 'path';
import withSerwistInit from '@serwist/next';

const isDev = process.env.NODE_ENV === 'development';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Disable SW in dev — hot reload clashes with precache
  disable: isDev,
  // Reload the page when a new SW takes over so users pick up fresh content
  reloadOnOnline: true,
  cacheOnNavigation: true,
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

export default withSerwist(nextConfig);
