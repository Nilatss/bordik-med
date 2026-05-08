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

// P2-NEW-3 — раньше regex был `[a-z0-9-]+\.vercel\.app$` — пропускал
// ЛЮБОЙ vercel preview-домен из любой команды. Сузили до префикса
// `bordik-med-` (наши preview deploys имеют вид
// bordik-med-git-<branch>-<team>.vercel.app), плюс отдельная dev
// preview-форма bordik-med-<hash>-<team>.vercel.app.
const PREVIEW_HOST_REGEX = /^https?:\/\/bordik-med-[a-z0-9-]+\.vercel\.app$/i;
const DEV_HOST_REGEX     = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

export interface OriginCheckResult {
  ok: boolean;
  /** When ok is false, the reason for logging. Never echoed to clients. */
  reason?: string;
}

export function checkOrigin(req: Request): OriginCheckResult {
  const origin = req.headers.get('origin');

  // P3-NEW-5 — Sec-Fetch-Site backup. Современные браузеры (Chrome 76+,
  // Safari 16.4+, Firefox 90+) отправляют этот header на ВСЕ запросы,
  // включая same-origin XHR/fetch без явного Origin. Значения:
  //   - "same-origin" — точно тот же scheme+host+port (надёжный сигнал)
  //   - "same-site"   — eTLD+1 совпадает (например, sub.bordik.app)
  //   - "cross-site"  — другой сайт (CSRF-кандидат)
  //   - "none"        — direct user activation (адресная строка, bookmark)
  // Добавляем как secondary-проверку: если Origin отсутствует НО
  // Sec-Fetch-Site = "cross-site", всё равно блокируем. Если Origin
  // есть и проходит allowlist, Sec-Fetch-Site не учитываем (allowlist —
  // primary trust signal).
  const sfs = req.headers.get('sec-fetch-site');

  // Same-origin browser navigations and many programmatic same-origin
  // fetches OMIT the Origin header. We don't want to deny those —
  // если sec-fetch-site явно говорит cross-site, тогда блокируем.
  if (!origin) {
    if (sfs === 'cross-site') {
      return { ok: false, reason: `sfs-cross-site` };
    }
    return { ok: true };
  }

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
