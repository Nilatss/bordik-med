/**
 * Rate limiter — Upstash-backed when configured, in-memory fallback
 * otherwise.
 *
 * The audit's P0-SEC-3 finding: an in-memory token bucket on Vercel is
 * effectively `30/min × N isolates ≈ 150-300/min` because each cold
 * start gets a fresh empty store. For a Gemini-backed endpoint where
 * each call burns real Google Cloud Billing dollars, that's a financial
 * risk, not just a UX risk.
 *
 * Solution: when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
 * are set, we use `@upstash/ratelimit` sliding window over Redis —
 * truly shared across all isolates. When they are not set (local dev,
 * preview without secrets), we silently fall back to the legacy
 * in-memory token bucket so the endpoint still works in development.
 *
 * `makeRateLimiter()` keeps the original sync API for callers that
 * don't want to refactor. `identifyAndLimit()` is the new async API
 * that prefers the Upstash path when available.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

interface LimiterOptions {
  /** Max tokens in the bucket. */
  capacity: number;
  /** Tokens added per second. */
  refillPerSec: number;
}

interface Decision {
  ok: boolean;
  /** Seconds until at least one token is available again. 0 if ok. */
  retryAfter: number;
}

const STORES = new WeakMap<object, Map<string, Bucket>>();

export function makeRateLimiter(opts: LimiterOptions) {
  // Use a unique sentinel object as the WeakMap key so each call site
  // gets an isolated store - we don't want the diagnostic limiter
  // sharing buckets with the feedback limiter.
  const sentinel: object = {};
  STORES.set(sentinel, new Map());

  return function decide(key: string): Decision {
    const store = STORES.get(sentinel)!;
    const now = Date.now();
    const b = store.get(key);
    if (!b) {
      store.set(key, { tokens: opts.capacity - 1, updatedAt: now });
      return { ok: true, retryAfter: 0 };
    }
    const elapsedSec = (now - b.updatedAt) / 1000;
    const refilled = Math.min(opts.capacity, b.tokens + elapsedSec * opts.refillPerSec);
    if (refilled < 1) {
      const need = 1 - refilled;
      const retryAfter = Math.ceil(need / opts.refillPerSec);
      // Don't write back - keep the original updatedAt so refill keeps
      // ticking. Otherwise a tight retry loop pegs the timestamp.
      return { ok: false, retryAfter };
    }
    store.set(key, { tokens: refilled - 1, updatedAt: now });
    return { ok: true, retryAfter: 0 };
  };
}

/**
 * Best-effort identity for a request: authenticated user id if present,
 * otherwise a sha-256 hex of the trusted client IP. We hash so the
 * bucket key is fixed length and the raw IP never leaves the process.
 *
 * P1-SEC-Е fix: we now prefer `x-vercel-forwarded-for` (server-set on
 * Vercel, untamperable) and fall back to the LAST hop of
 * `x-forwarded-for` rather than the first. Taking the first hop lets a
 * client that controls a proxy-of-its-own write whatever it wants into
 * the limiter key; the last hop is the most-trusted entry.
 */
export async function identifyRequest(
  req: Request,
  userId: string | null | undefined,
): Promise<string> {
  if (userId) return `u:${userId}`;
  const xvff = req.headers.get('x-vercel-forwarded-for');
  const xff  = req.headers.get('x-forwarded-for');
  const raw  = xvff ?? xff ?? '';
  // Last comma-separated hop is the closest trusted edge.
  const ip = raw.split(',').map((s) => s.trim()).filter(Boolean).pop() ?? 'unknown';
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const hex = Array.from(new Uint8Array(buf))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ip:${hex}`;
}

/**
 * Async limiter that uses Upstash sliding-window when configured, and
 * the in-memory token bucket otherwise. Recommended for new code.
 *
 * Returns `{ ok, retryAfter, headers }`. `headers` includes the
 * standard `X-RateLimit-*` triplet so callers can pass them straight
 * back to the client.
 */
interface UpstashLimiterShape {
  limit(key: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }>;
}

let upstashIp: UpstashLimiterShape | null = null;
let upstashUser: UpstashLimiterShape | null = null;
let upstashChecked = false;

async function loadUpstashLimiters(): Promise<{ ip: UpstashLimiterShape; user: UpstashLimiterShape } | null> {
  if (upstashChecked) {
    return upstashIp && upstashUser ? { ip: upstashIp, user: upstashUser } : null;
  }
  upstashChecked = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import('@upstash/ratelimit'),
      import('@upstash/redis'),
    ]);
    const redis = new Redis({ url, token });
    const ephemeral = new Map();
    upstashIp = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      prefix: 'rl:ip',
      ephemeralCache: ephemeral,
      analytics: true,
    }) as unknown as UpstashLimiterShape;
    upstashUser = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      prefix: 'rl:user',
      ephemeralCache: ephemeral,
      analytics: true,
    }) as unknown as UpstashLimiterShape;
    return { ip: upstashIp, user: upstashUser };
  } catch (err) {
    // P2-NEW-2 — Upstash init fail в production = деградация rate-limit'а
    // до in-memory token bucket (30/мин × N isolates). Финансовый риск
    // для Gemini-эндпоинтов (см. P0-SEC-3 в audit). Раньше тут был
    // голый console.warn, который терялся в Vercel-логах и не алёртил.
    // Теперь captureException → Sentry-issue + log.error для structured
    // logs. Не блокируем работу (fallback продолжает обслуживать).
    try {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureException(err, {
        level: 'warning',
        tags: { component: 'rate-limit', subsystem: 'upstash' },
        extra: { phase: 'init' },
      });
    } catch { /* sentry import failed → skip, не падаем */ }
    console.warn('[rate-limit] Upstash init failed, falling back to in-memory', err);
    return null;
  }
}

// In-memory fallbacks (kept warm across calls).
const fallbackIp   = makeRateLimiter({ capacity: 30, refillPerSec: 30 / 60 });
const fallbackUser = makeRateLimiter({ capacity: 60, refillPerSec: 60 / 60 });

export interface LimitDecision {
  ok: boolean;
  retryAfter: number;
  headers: Record<string, string>;
}

export async function identifyAndLimit(
  req: Request,
  userId: string | null | undefined,
): Promise<LimitDecision> {
  const ident = await identifyRequest(req, userId);
  const upstash = await loadUpstashLimiters();
  if (upstash) {
    const limiter = userId ? upstash.user : upstash.ip;
    try {
      const r = await limiter.limit(ident);
      const retryAfter = Math.max(0, Math.ceil((r.reset - Date.now()) / 1000));
      return {
        ok: r.success,
        retryAfter,
        headers: {
          'X-RateLimit-Limit':     String(r.limit),
          'X-RateLimit-Remaining': String(r.remaining),
          'X-RateLimit-Reset':     String(Math.floor(r.reset / 1000)),
          ...(r.success ? {} : { 'Retry-After': String(retryAfter) }),
        },
      };
    } catch (err) {
      // P2-NEW-2 — per-request Upstash failure (network glitch, quota,
      // 5xx). Раньше падало tihi — без алёрта в Sentry. Теперь capture
      // + degrade в in-memory bucket вместо 500-ошибки клиенту.
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.captureException(err, {
          level: 'warning',
          tags: { component: 'rate-limit', subsystem: 'upstash' },
          extra: { phase: 'limit', ident: ident.slice(0, 32) },
        });
      } catch { /* skip */ }
      console.warn('[rate-limit] Upstash limit() failed, degrading to in-memory', err);
      // Fall through to in-memory path below.
    }
  }
  const limiter = userId ? fallbackUser : fallbackIp;
  const d = limiter(ident);
  return {
    ok: d.ok,
    retryAfter: d.retryAfter,
    headers: d.ok ? {} : { 'Retry-After': String(d.retryAfter) },
  };
}
