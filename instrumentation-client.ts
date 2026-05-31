/**
 * Browser-side Sentry init. Loaded once before any user code runs.
 *
 * Privacy posture (medical platform — Bordik Med):
 *   - `sendDefaultPii: false` — Sentry's default PII collection is OFF.
 *     We don't ship cookies, IP, or browser-identifying headers.
 *   - `Sentry.replayIntegration` is NOT enabled — Session Replay would
 *     record screen content including any visible patient data, which
 *     would create a HIPAA / GDPR Art.9 problem.
 *   - `beforeSend` scrubs PII out of every event before it leaves the
 *     browser. Belt-and-braces with sendDefaultPii.
 *   - Breadcrumb URLs are stripped of query params (auth tokens, magic
 *     links, gemini api keys passing through).
 *
 * If you ever turn on session replay, gate it behind explicit user
 * consent recorded in `consent_records` (see supabase schema) and mask
 * EVERYTHING by default.
 */
import * as Sentry from '@sentry/nextjs';
import { isExtensionScriptError, isSwRejectionError } from './lib/sentry-filter';

const enableSentry =
  process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SENTRY_FORCE_ENABLE === '1';

if (enableSentry) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // 10% of transactions captured; we can dial up if data sparse
    tracesSampleRate: 0.1,
    // No session replay — see file header comment
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    integrations: [
      // Browser-tracing integration is added implicitly by the SDK
      // when tracesSampleRate > 0. We don't add Replay deliberately.
    ],
    sendDefaultPii: false,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 12),

    /**
     * Last-line PII scrubber. Runs synchronously before each event ships.
     * Returning null drops the event entirely.
     */
    beforeSend(event) {
      // 1. Drop user identity entirely — we never want emails / IDs in Sentry
      if (event.user) {
        delete event.user.email;
        delete event.user.username;
        delete event.user.ip_address;
        delete event.user.id;
      }

      // 2. Strip query params from URLs in request + breadcrumbs (tokens,
      //    Supabase magic-link codes, Gemini keys passed in URL by mistake)
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url);
          u.search = '';
          event.request.url = u.toString();
        } catch { /* malformed URL, leave as-is */ }
      }

      // 3. Strip cookies + auth headers from request
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-supabase-auth'];
        }
      }

      // 4. Walk breadcrumbs — same query-param stripping
      if (event.breadcrumbs) {
        for (const b of event.breadcrumbs) {
          if (b.data && typeof b.data.url === 'string') {
            try {
              const u = new URL(b.data.url, location.origin);
              u.search = '';
              b.data.url = u.toString();
            } catch { /* */ }
          }
          // Drop any breadcrumb that smells like email
          if (b.message && /[\w.+-]+@[\w-]+\.[\w.-]+/.test(b.message)) {
            b.message = b.message.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email-redacted]');
          }
        }
      }

      // 5. Scrub message itself for emails (in case React threw with
      //    something like "Cannot send to user@example.com")
      if (event.message) {
        event.message = event.message.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email-redacted]');
      }

      // Bug fix NEXTJS-1F / NEXTJS-19: drop errors whose entire call stack
      // is inside MetaMask's injected inpage.js — those are extension bugs,
      // not app bugs, and produce false-positive pages in the Sentry dashboard.
      if (isExtensionScriptError(event)) return null;

      // Bug fix NEXTJS-12: drop unhandled "Error: Rejected" that originates
      // from @serwist/window when navigator.serviceWorker.register() is denied
      // (incognito, CSP, quota). The app degrades gracefully; this rejection
      // leaks past PwaRegistrar's try/catch via a separate Serwist code path.
      if (isSwRejectionError(event)) return null;

      return event;
    },

    /**
     * Drop noise we never want to investigate.
     */
    ignoreErrors: [
      // Random network blips — not actionable
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      // Browser extensions throwing in our context
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Aborted fetches when user navigates away mid-request
      'AbortError',
      'The operation was aborted',
      // Bug fix NEXTJS-3: React RSC streaming fires "Connection closed." as an
      // unhandled rejection when the browser closes the streaming connection
      // (tab close, navigation away, network blip). This is Next.js internals
      // (react-server-dom-webpack), not app code — the user is already gone.
      'Connection closed.',
      // Belt-and-suspenders for MetaMask extension errors (NEXTJS-1F / NEXTJS-19)
      // The beforeSend frame-filter above handles the structural check; these
      // string matches handle the rare case where Sentry strips the stack.
      'Failed to connect to MetaMask',
      'MetaMask extension not found',
    ],
  });
}

/**
 * Required by Next.js App Router for the Sentry SDK to track navigation
 * transitions (router.push / router.replace).
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
