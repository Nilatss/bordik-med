import { NextRequest, NextResponse } from 'next/server';

/**
 * Per-request CSP nonce. Starts in REPORT-ONLY mode so we can collect a
 * week of CSP violation reports before flipping to enforcement.
 *
 * Why not enforce immediately:
 *   - Tailwind 4 + framer-motion 12 sometimes inject inline <style> tags
 *     that strict CSP would block. We need real-world telemetry on what
 *     reports show before tightening.
 *   - MediaPipe loads .wasm + .task model from CDN; the connect-src list
 *     might miss an undocumented endpoint in some locales.
 *
 * To enforce: change `Content-Security-Policy-Report-Only` to
 * `Content-Security-Policy` AND set up a /api/csp-report endpoint or
 * external service like report-uri.com.
 *
 * Skipped routes:
 *   - /_next/static/*  (Next.js bundles, never need CSP)
 *   - /_next/image     (Next.js image optimisation)
 *   - prefetch requests (CSP already validated on the prefetched page)
 */
export function middleware(req: NextRequest) {
  // Generate a fresh nonce per request. crypto.getRandomValues is available
  // in Edge runtime; we encode 16 random bytes as base64url.
  const nonce = generateNonce();

  // Origins we know we hit:
  //   - cdn.jsdelivr.net      MediaPipe WASM
  //   - storage.googleapis.com MediaPipe model files
  //   - generativelanguage.googleapis.com  Gemini API (server-side, but
  //     we add it for SW fetches too)
  //   - api.telegram.org      Feedback forwarding (server-only fetch but
  //     SW could intercept; whitelist for safety)
  //   - *.supabase.co         Auth + database (HTTPS + WSS)
  const cspParts = [
    `default-src 'self'`,
    // strict-dynamic + nonce: scripts loaded by trusted scripts inherit trust.
    // We keep 'unsafe-inline' as a fallback for older browsers - it is
    // ignored when nonce/strict-dynamic is supported.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' https://cdn.jsdelivr.net https://storage.googleapis.com`,
    // Tailwind 4 ships utility classes via inline <style>; cannot drop
    // 'unsafe-inline' for style-src without breaking the design system.
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self' data:`,
    `media-src 'self' blob:`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://storage.googleapis.com https://cdn.jsdelivr.net https://api.telegram.org`,
    `worker-src 'self' blob:`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ];

  // Forward the nonce to the rendering layer via header. Server Components
  // can read it via `headers().get('x-nonce')` and pass to <Script nonce>.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy-Report-Only', cspParts.join('; '));

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  // Same header on the response so the browser actually sees it
  res.headers.set('Content-Security-Policy-Report-Only', cspParts.join('; '));
  res.headers.set('x-nonce', nonce);
  return res;
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  // base64url, no padding (URL-safe)
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
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
