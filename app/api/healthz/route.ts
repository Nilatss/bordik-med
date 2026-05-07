/**
 * Liveness probe for UptimeRobot / synthetic monitoring.
 *
 * Deliberately *shallow*: we do NOT ping Supabase or Gemini from this
 * endpoint. A healthz that depends on third parties is no longer a
 * liveness probe — it's a deep health check that can amplify outages
 * (every monitoring hit eats Supabase quota) and fire false positives
 * during routine upstream maintenance.
 *
 * Для deep-проверки (Upstash, Supabase и т.п.) используется отдельный
 * /api/readyz (kubernetes convention) с auth-gate'ом и таймаутом.
 * См. AUDIT_REPORT_2026-05-06 P2-3.
 */
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  // P3-SEC — убрали `sha` (VERCEL_GIT_COMMIT_SHA) и точный `env` —
  // information disclosure без необходимости. Для liveness достаточно
  // { ok, ts }. Vercel-side тоже отдаёт x-vercel-id если нужна
  // диагностика, по auth.
  return NextResponse.json(
    {
      ok: true,
      ts: Date.now(),
    },
    {
      headers: {
        'cache-control': 'no-store, max-age=0',
      },
    },
  );
}
