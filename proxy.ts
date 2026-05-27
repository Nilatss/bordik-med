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
    // script-src strategy:
    //   We previously used `'strict-dynamic' 'nonce-${nonce}'`, which is
    //   the "modern" hardening pattern. It worked under Report-Only but
    //   broke production the moment we flipped to enforce: Next.js's
    //   framework script tags (the per-chunk imports under
    //   /_next/static/chunks/*.js) ship WITHOUT a nonce attribute. With
    //   strict-dynamic active, browsers honour ONLY nonce-tagged scripts
    //   and ignore 'self' / origin allowlists, so every Next chunk got
    //   blocked → React never booted → page rendered as raw HTML text.
    //
    //   Falling back to the classic 'self' + 'nonce' + 'unsafe-inline'
    //   triplet:
    //     - 'self' covers /_next/static/* (which we own anyway)
    //     - 'nonce-XYZ' lets us tag any inline scripts we render
    //       server-side ourselves (currently just the JSON-LD blob)
    //     - 'unsafe-inline' is a fallback for older browsers that do
    //       not honour nonce-source — modern browsers ignore it when a
    //       nonce IS present
    //   This is one notch less strict than strict-dynamic but identical
    //   in practice for our threat model (we don't ship third-party
    //   user-generated scripts).
    `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://storage.googleapis.com https://va.vercel-scripts.com`,
    // style-src does NOT include the per-request nonce.
    //
    // CSP3 rule: when BOTH a nonce AND 'unsafe-inline' appear in the
    // same source list, browsers ignore 'unsafe-inline' entirely and
    // require nonces on every <style> + every \`style="..."\` attribute.
    // React's `style={{...}}` JSX prop produces unnonced inline styles
    // and there's no API to add a nonce attribute to them — so the
    // moment you ship both keywords together, every inline style on
    // the page gets blocked. The visible result is a page rendered
    // with class names but zero inline geometry — exactly what we hit
    // in production after #19.
    //
    // We rely on 'unsafe-inline' because the codebase has hundreds of
    // `style={{...}}` JSX usages plus Tailwind 4's runtime <style>
    // blocks. The threat model here is XSS via injected style content
    // (low-impact compared to script injection), and the rest of the
    // CSP layer (nonce on script-src, 'self' default-src, frame-
    // ancestors 'none', etc.) already mitigates the realistic vectors.
    `style-src 'self' 'unsafe-inline'`,
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

export function generateNonce(): string {
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
