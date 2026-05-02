import { NextRequest, NextResponse } from 'next/server';

/**
 * Per-request CSP nonce.
 *
 * Now in **enforce** mode by default. The previous Report-Only stance
 * was a runway for collecting violation reports before tightening; with
 * the third-party allowlist below we have full coverage of every
 * cross-origin endpoint the app actually hits in production. If a new
 * endpoint surfaces, the violation still POSTs to `/api/csp-report` so
 * we can extend this list and ship a fix.
 *
 * Emergency rollback
 * ------------------
 * If a CSP misconfiguration breaks production, set the env var
 * `CSP_REPORT_ONLY=1` in Vercel (no redeploy needed — the next request
 * picks it up because `proxy` runs at the edge per request). The header
 * downgrades to `Content-Security-Policy-Report-Only` which lets the
 * browser still load every resource but log violations to our endpoint.
 *
 * Skipped routes (matcher at the bottom of this file):
 *   - /_next/static/*  (Next.js bundles, immutable, no CSP needed)
 *   - /_next/image     (Next.js image optimiser)
 *   - prefetch requests (CSP already validated on the prefetched page)
 */
export function proxy(req: NextRequest) {
  // Generate a fresh nonce per request. crypto.getRandomValues is available
  // in Edge runtime; we encode 16 random bytes as base64url.
  const nonce = generateNonce();

  // Origins we hit at runtime — verified against `npm run check:leaks`
  // + Sentry breadcrumbs from staging:
  //
  //   - *.supabase.co + wss              auth, db reads/writes, realtime
  //   - generativelanguage.googleapis.com Gemini API (server-side calls
  //                                       but SW could intercept; allowed)
  //   - storage.googleapis.com           MediaPipe .task / .tflite model
  //                                       files (loaded into wasm worker)
  //   - api.telegram.org                 Feedback bot forwarding
  //   - *.upstash.io                     Upstash Redis REST (server-side)
  //   - *.sentry.io + *.ingest.de.sentry.io
  //                                      Error tracking. /monitoring tunnel
  //                                      stays the primary path; this is a
  //                                      fallback for browsers/extensions
  //                                      that block the rewrite.
  //   - va.vercel-scripts.com,
  //     vitals.vercel-insights.com       Vercel Analytics + Speed Insights
  //                                      script + beacon endpoints.
  //
  // P1-SEC-2: cdn.jsdelivr.net was removed when MediaPipe WASM moved
  // to self-hosted /mediapipe/wasm.
  const connectSrc = [
    `'self'`,
    `https://*.supabase.co`,
    `wss://*.supabase.co`,
    `https://generativelanguage.googleapis.com`,
    `https://storage.googleapis.com`,
    `https://api.telegram.org`,
    `https://*.upstash.io`,
    `https://*.sentry.io`,
    `https://*.ingest.sentry.io`,
    `https://*.ingest.de.sentry.io`,
    `https://va.vercel-scripts.com`,
    `https://vitals.vercel-insights.com`,
  ].join(' ');

  const cspParts = [
    `default-src 'self'`,
    // strict-dynamic + nonce: scripts loaded by trusted scripts inherit
    // trust. We keep 'unsafe-inline' as a fallback for browsers that
    // don't honour strict-dynamic — they ignore the nonce + strict-dynamic
    // and fall back to 'unsafe-inline'. Modern browsers honour the nonce
    // path and ignore 'unsafe-inline'.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https://storage.googleapis.com https://va.vercel-scripts.com`,
    // Tailwind 4 ships utility classes via inline <style>; we can't
    // drop 'unsafe-inline' for style-src without breaking the design
    // system. The nonce is still emitted for any <style> we render
    // server-side ourselves.
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `media-src 'self' blob:`,
    `connect-src ${connectSrc}`,
    `worker-src 'self' blob:`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
    // Violations are POSTed to /api/csp-report (legacy) and the
    // Reporting API endpoint of the same name (modern browsers).
    `report-uri /api/csp-report`,
    `report-to csp-endpoint`,
  ];

  // Pick the header name based on the env-flag rollback escape hatch.
  // The flag is read from process.env on every invocation because the
  // edge runtime evaluates it per request.
  const headerName = process.env.CSP_REPORT_ONLY === '1'
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';
  const cspValue = cspParts.join('; ');

  // Forward the nonce to the rendering layer via header. Server Components
  // can read it via `headers().get('x-nonce')` and pass to <Script nonce>.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set(headerName, cspValue);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  // Same header on the response so the browser actually sees it
  res.headers.set(headerName, cspValue);
  res.headers.set('x-nonce', nonce);
  // Reporting API: declares the named endpoint referenced in `report-to`.
  res.headers.set(
    'Reporting-Endpoints',
    'csp-endpoint="/api/csp-report"',
  );
  return res;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // base64url, no padding (URL-safe)
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i] ?? 0);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const config = {
  // Skip Next assets and prefetches - those don't need a fresh nonce.
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
