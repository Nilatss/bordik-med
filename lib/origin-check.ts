/**
 * P2-SEC-4 — Origin allowlist for state-changing requests.
 *
 * SameSite=Lax cookies (Supabase default) defeat the trivial
 * cross-site POST CSRF, but they don't help against:
 *   - browser extensions running in our origin context
 *   - same-site sub-domain compromise
 *   - hand-crafted curl from a co-opted user session
 *
 * Adding an Origin allowlist gives us a second gate. Every state-
 * changing route handler should call `assertSameOrigin(req)` first.
 *
 * Allowed origins:
 *   - production (NEXT_PUBLIC_APP_URL or hardcoded fallback)
 *   - Vercel preview deployments (`*.vercel.app`)
 *   - localhost / 127.0.0.1 in development
 */

const PROD_ALLOWLIST = [
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ''),
  'https://bordik-med.vercel.app',
  'https://bordik.app',
  'https://www.bordik.app',
].filter((s): s is string => Boolean(s));

const PREVIEW_HOST_REGEX = /^https?:\/\/[a-z0-9-]+\.vercel\.app$/i;
const DEV_HOST_REGEX     = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

export interface OriginCheckResult {
  ok: boolean;
  /** When ok is false, the reason for logging. Never echoed to clients. */
  reason?: string;
}

export function checkOrigin(req: Request): OriginCheckResult {
  const origin = req.headers.get('origin');
  // Same-origin browser navigations and many programmatic same-origin
  // fetches OMIT the Origin header. We don't want to deny those.
  // Browsers always send Origin on cross-origin requests though, so
  // missing Origin = treated as same-origin = ok.
  if (!origin) return { ok: true };

  if (PROD_ALLOWLIST.includes(origin)) return { ok: true };
  if (PREVIEW_HOST_REGEX.test(origin)) return { ok: true };
  if (process.env.NODE_ENV !== 'production' && DEV_HOST_REGEX.test(origin)) return { ok: true };

  return { ok: false, reason: `disallowed-origin:${origin.slice(0, 100)}` };
}

/**
 * Convenience helper that returns a 403 Response when the origin is
 * not allowlisted. Use as:
 *
 *   const block = assertSameOrigin(req);
 *   if (block) return block;
 */
export function assertSameOrigin(req: Request): Response | null {
  const r = checkOrigin(req);
  if (r.ok) return null;
  console.warn('[origin-check] blocked', r.reason);
  return new Response(JSON.stringify({ ok: false, error: 'forbidden-origin' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
