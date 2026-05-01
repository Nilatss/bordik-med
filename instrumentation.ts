/**
 * Next.js instrumentation hook — runs once at server boot for both the
 * Node runtime (default) and the Edge runtime (proxy.ts, /api routes
 * with `runtime = 'edge'`).
 *
 * We use the runtime check to gate initialisation because the Sentry
 * SDK ships a different transport for Edge (uses fetch, not http) and
 * pulling the wrong one breaks the build.
 *
 * Client-side initialisation lives in `instrumentation-client.ts`
 * (Next 15+ convention).
 *
 * Why no Sentry on local dev:
 *   - Stack traces from a hot-reloaded dev server are noisy and
 *     uninteresting (most are React HMR artifacts).
 *   - We don't want to burn the free-tier quota during development.
 *   - When you actually need to test Sentry locally, set
 *     SENTRY_FORCE_ENABLE=1 in `.env.local`.
 */
import * as Sentry from '@sentry/nextjs';

const enableSentry =
  process.env.NODE_ENV === 'production' || process.env.SENTRY_FORCE_ENABLE === '1';

export async function register() {
  if (!enableSentry) return;

  // Common base config for both runtimes
  const base = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Sample 10% of transactions to stay well under the 10k/month free quota.
    // We can dial up later if traffic data is sparse.
    tracesSampleRate: 0.1,
    // Hide build- / deploy-related metadata that could embarrass us if leaked
    sendDefaultPii: false,
    // Don't capture spans for healthchecks
    ignoreTransactions: ['GET /api/healthz'],
    // Tag all events so we can filter Sentry UI by environment
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12),
  };

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init(base);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(base);
  }
}

/**
 * Captures errors thrown inside Server Components, Server Actions, route
 * handlers, and middleware/proxy. Without this hook, those errors would
 * surface only in the Vercel function logs and never reach Sentry.
 */
export const onRequestError = Sentry.captureRequestError;
