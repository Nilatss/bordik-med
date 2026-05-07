/**
 * Унифицированный формат API-ошибок.
 *
 * Закрывает P1-CR-8 — раньше routes возвращали 4 разных shape:
 *   { error: 'string' }
 *   { ok: false, error: 'string' }
 *   { ok: false, error: 'string', issues?: string[] }
 *   { ok: false, error: 'string', partial?: boolean, errors?: string[] }
 *
 * Теперь — один shape:
 *   ошибка: { ok: false, error: ApiErrorCode, ...extra }
 *   успех:  { ok: true, ...payload }
 *
 * Клиент пишет:
 *   const r = await fetch(...); const j = await r.json();
 *   if (!j.ok) showError(ERR_MESSAGES[j.error]);
 *
 * Все error-коды — kebab-case const-литералы в ERR. Не string-strings —
 * чтобы typo `unathorized` ловилось compile-time'ом.
 */
import { NextResponse } from 'next/server';

export const ERR = {
  // Auth
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  forbidden_origin: 'forbidden-origin',
  reviewer_required: 'reviewer-required',
  four_eye_violation: 'four-eye-violation',

  // Backend
  backend_not_configured: 'backend-not-configured',
  internal_error: 'internal-error',

  // Rate-limiting
  rate_limited: 'rate-limited',

  // Input validation
  bad_json: 'bad-json',
  bad_input: 'bad-input',
  field_not_allowed: 'field-not-allowed',
  patch_not_object: 'patch-not-object',
  unknown_action: 'unknown-action',

  // Domain
  bank_corrupted: 'bank-corrupted',
  not_found: 'not-found',
  conflict: 'conflict',

  // AI
  output_blocked: 'output-blocked',
  gemini_failed: 'gemini-failed',
} as const;

export type ApiErrorCode = (typeof ERR)[keyof typeof ERR];

/** Стандартный JSON error response. */
export function apiError(
  code: ApiErrorCode | string,
  status = 400,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(
    { ok: false, error: code, ...(extra ?? {}) },
    { status },
  );
}

/** Стандартный JSON success response. */
export function apiOk<T extends Record<string, unknown>>(
  data?: T,
  status = 200,
): NextResponse {
  return NextResponse.json({ ok: true, ...(data ?? {}) }, { status });
}

/**
 * Type-guard для клиентского кода:
 *   const j: ApiResponse<{ items: Item[] }> = await r.json();
 *   if (isApiError(j)) return showError(j.error);
 *   useItems(j.items);
 */
export interface ApiErrorResponse {
  ok: false;
  error: string;
  [extra: string]: unknown;
}
export type ApiOkResponse<T> = { ok: true } & T;
export type ApiResponse<T> = ApiOkResponse<T> | ApiErrorResponse;

export function isApiError(x: ApiResponse<unknown>): x is ApiErrorResponse {
  return x.ok === false;
}
