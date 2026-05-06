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
  return NextResponse.json(
    {
      ok: true,
      ts: Date.now(),
      sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      env: process.env.VERCEL_ENV ?? 'development',
    },
    {
      headers: {
        'cache-control': 'no-store, max-age=0',
      },
    },
  );
}
