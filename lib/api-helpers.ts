/**
 * Общие helper'ы для API-routes.
 *
 * Закрывает P2-CR-7 из docs/code-review-2026-05.md — раньше каждый
 * route дублировал ~6 строк boilerplate'а:
 *   1. getSupabaseServerClient() → 503 если нет
 *   2. sb.auth.getUser() → 401 если нет user'а
 *   3. ручная Origin / Sec-Fetch-Site проверка для CSRF
 *   4. произвольный shape ошибки ({error}, {ok:false,error}, ...)
 *
 * Теперь:
 *   export const POST = (req: Request) => withAuthedSupabase(req, async (sb, user) => {
 *     // тут уже всё проверено: sb валиден, user не null, origin same-site
 *   });
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { apiError, type ApiErrorCode } from '@/lib/api-errors';

type ReqLike = Request | NextRequest;

/**
 * P1-SEC — origin-check для CSRF. Принимаем mutating-запросы только
 * из нашего же origin. Современные браузеры отправляют
 * `Sec-Fetch-Site: same-origin` для in-app fetch и `cross-site`/`none`
 * для атакующего origin (CSRF gadget). Fallback на `Origin` header.
 */
export function isSameOrigin(req: ReqLike): boolean {
  const sfs = req.headers.get('sec-fetch-site');
  if (sfs === 'same-origin' || sfs === 'same-site') return true;
  if (sfs && sfs !== 'same-origin' && sfs !== 'same-site') return false;
  // Fallback: старые браузеры без Sec-Fetch-Site
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

/**
 * Возвращает Response (403) если cross-origin, иначе null. Удобно
 * чейнить в начале handler'а:
 *   const blocked = assertSameOrigin(req); if (blocked) return blocked;
 */
export function assertSameOrigin(req: ReqLike): NextResponse | null {
  if (isSameOrigin(req)) return null;
  return apiError('forbidden-origin', 403);
}

/**
 * Wraps an authed handler. Гарантирует:
 *   - Same-origin request (CSRF guard)
 *   - Supabase backend настроен (503 если нет)
 *   - User authenticated (401 если нет)
 *
 * Handler получает уже-готовых `sb` и `user`. Шаблонный 503/401/403
 * boilerplate больше не нужен в каждой route.
 */
export async function withAuthedSupabase(
  req: ReqLike,
  handler: (sb: SupabaseClient, user: User) => Promise<NextResponse>,
): Promise<NextResponse> {
  // 1. CSRF guard
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;

  // 2. Supabase backend
  const sb = await getSupabaseServerClient();
  if (!sb) return apiError('backend-not-configured', 503);

  // 3. Auth
  const { data: { user }, error: userErr } = await sb.auth.getUser();
  if (userErr || !user) return apiError('unauthorized', 401);

  // 4. Run handler
  return handler(sb, user);
}

/**
 * Версия для public routes — same-origin guard, но без auth-требования.
 * Полезно для feedback / CSP-report endpoint'ов.
 */
export async function withSameOrigin(
  req: ReqLike,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const blocked = assertSameOrigin(req);
  if (blocked) return blocked;
  return handler();
}

/**
 * Authed + role-check. Принимает массив разрешённых ролей из
 * `app_metadata.editor_role`. 403 если роль не в списке.
 */
export async function withRole(
  req: ReqLike,
  allowedRoles: ReadonlyArray<string>,
  handler: (sb: SupabaseClient, user: User, role: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  return withAuthedSupabase(req, async (sb, user) => {
    const role = (user.app_metadata?.editor_role as string | undefined) ?? '';
    if (!allowedRoles.includes(role)) {
      return apiError('forbidden', 403);
    }
    return handler(sb, user, role);
  });
}

/**
 * JSON body parser с защитой от bad-JSON (часто атакующие шлют
 * malformed payload чтобы крашнуть handler с непойманным throw).
 */
export async function parseJsonBody<T = unknown>(
  req: ReqLike,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const data = (await req.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, response: apiError('bad-json', 400) };
  }
}

/** Re-export для удобства — чтобы routes не импортировали из 2 мест. */
export { apiError, apiOk } from '@/lib/api-errors';
export type { ApiErrorCode };
