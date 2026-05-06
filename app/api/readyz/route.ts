/**
 * Deep readiness probe — kubernetes-style /readyz separate from /healthz.
 *
 * AUDIT_REPORT_2026-05-06 P2-3: rate-limit при отсутствии
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN молча падает
 * на in-memory token bucket per-isolate. На Vercel это ≈ 30 req/min ×
 * N isolates вместо ожидаемых 30/min глобально — финансовый риск
 * для Gemini-эндпоинтов. Нужен внешний health-check, чтобы заметить,
 * что в production развалились Upstash-учётки.
 *
 * /healthz остаётся «shallow» liveness probe (не пингует upstreams).
 * /readyz — deep check: PING Upstash. Возвращает 503 если:
 *   - в production Upstash не сконфигурирован
 *   - PING не отвечает за 3 сек
 *   - PING вернул ошибку
 *
 * В dev/preview без env vars — 200 с warning, не ломаем локалку.
 *
 * Auth gate: опциональный header `x-readyz-token: <secret>`. Если
 * env READYZ_TOKEN установлен — заголовок обязателен. Это защита
 * от внешних проб, которые могут жечь Upstash-кредиты.
 *
 * Использование: настроить UptimeRobot на /api/readyz с custom
 * header, alert при HTTP ≥ 500.
 */
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const PING_TIMEOUT_MS = 3000;

interface ReadyzResult {
  ok: boolean;
  upstash: 'ok' | 'missing-config' | 'timeout' | 'error';
  upstashLatencyMs?: number;
  ts: number;
  env: string;
  sha: string | null;
  reason?: string;
}

async function pingUpstash(): Promise<{ ok: boolean; latencyMs?: number; reason?: string }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return { ok: false, reason: 'missing-config' };
  }
  // Upstash REST: GET ${url}/ping → "PONG" (200).
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PING_TIMEOUT_MS);
  const t0 = Date.now();
  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/ping`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
      cache: 'no-store',
    });
    clearTimeout(t);
    const latencyMs = Date.now() - t0;
    if (!r.ok) {
      return { ok: false, latencyMs, reason: `http-${r.status}` };
    }
    // Upstash REST envelope: { result: "PONG" }. Не тратим время на парсинг
    // тела — успешный 200 + Authorization прошёл — этого достаточно.
    return { ok: true, latencyMs };
  } catch (e) {
    clearTimeout(t);
    const reason = (e as Error).name === 'AbortError' ? 'timeout' : ((e as Error).message ?? 'fetch-error');
    return { ok: false, reason };
  }
}

export async function GET(req: Request) {
  // Optional auth gate — preventing random probes from spending Upstash
  // credits. If READYZ_TOKEN is unset (dev/preview), skip the gate.
  const expectedToken = process.env.READYZ_TOKEN;
  if (expectedToken) {
    const provided = req.headers.get('x-readyz-token');
    if (provided !== expectedToken) {
      return new Response(null, { status: 404 }); // 404 — не утечь существование роута
    }
  }

  const env = process.env.VERCEL_ENV ?? 'development';
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null;
  const ping = await pingUpstash();

  // В production отсутствие Upstash — критическая регрессия (rate-limit
  // деградирует). В preview/dev — не блокируем работу.
  const isProd = env === 'production';

  let upstashStatus: ReadyzResult['upstash'];
  if (ping.ok) upstashStatus = 'ok';
  else if (ping.reason === 'missing-config') upstashStatus = 'missing-config';
  else if (ping.reason === 'timeout') upstashStatus = 'timeout';
  else upstashStatus = 'error';

  const ok = ping.ok || (!isProd && upstashStatus === 'missing-config');

  const body: ReadyzResult = {
    ok,
    upstash: upstashStatus,
    ts: Date.now(),
    env,
    sha,
    ...(typeof ping.latencyMs === 'number' ? { upstashLatencyMs: ping.latencyMs } : {}),
    ...(ping.reason ? { reason: ping.reason } : {}),
  };

  return NextResponse.json(body, {
    status: ok ? 200 : 503,
    headers: { 'cache-control': 'no-store, max-age=0' },
  });
}
