/**
 * In-memory token-bucket rate limiter.
 *
 * For Vercel: each isolate has its own memory, so this is *best-effort*.
 * It is enough to defeat abusive single-user loops, scripted scrapers,
 * and accidental client retry storms. For a hard, multi-instance limit
 * use Upstash Ratelimit + KV; this module is the cheap fallback until
 * we provision that.
 *
 * Usage:
 *   const rl = makeRateLimiter({ capacity: 30, refillPerSec: 30 / 60 });
 *   const allowed = rl(`user:${userId}`);
 *   if (!allowed.ok) return new Response('rate-limited', {
 *     status: 429,
 *     headers: { 'Retry-After': String(allowed.retryAfter) },
 *   });
 *
 * Identity: prefer authenticated user id. Fall back to a hash of
 * x-forwarded-for so a single shared NAT cannot trivially exhaust an
 * IP-only bucket on behalf of an attacker behind it.
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
 * otherwise a sha-256 hex of the first IP in x-forwarded-for. We only
 * use the hash inside the limiter store - it never leaves the process.
 */
export async function identifyRequest(
  req: Request,
  userId: string | null | undefined,
): Promise<string> {
  if (userId) return `u:${userId}`;
  const xff = req.headers.get('x-forwarded-for') ?? '';
  const ip = xff.split(',')[0]?.trim() || 'unknown';
  // Hash so the bucket key is a fixed length and IP doesn't sit in memory.
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const hex = Array.from(new Uint8Array(buf))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `ip:${hex}`;
}
