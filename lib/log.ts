/**
 * P1-CQ-2 — structured logging with PII redaction.
 *
 * We deliberately do NOT pull in pino: the audit recommended it, but
 * pino's worker thread + transport setup is over-engineered for the
 * single Node runtime + Vercel Logs sink we have. Instead this is a
 * tiny zero-dep wrapper that:
 *
 *   - emits structured JSON (one event per line) via console.{log|warn|error}
 *     so Vercel Logs / Sentry log breadcrumbs keep working unchanged
 *   - REDACTS known-PII keys before logging (email, name, ip, *Token*,
 *     authorization, *.userId, etc.)
 *   - lets every API route do `log.info({ event: 'foo', userId, … })`
 *     without worrying which fields are sensitive
 *
 * Use:
 *   import { log } from '@/lib/log';
 *   log.info({ event: 'gemini_call', model: 'gemini-2.5-flash-lite', ms: 421 });
 *   log.warn({ event: 'rate_limited', identity: 'ip:abcd' });
 *   log.error({ event: 'rpc_failed', code: error.code });
 *
 * Forbidden: passing raw user input as a log value. Even after redaction
 * we don't want HTML / control chars in our log lines.
 */

const REDACT_KEYS = new Set([
  // identity
  'email', 'mail', 'name', 'username', 'userid', 'user_id',
  'phone', 'mobile',
  'ip', 'ip_address', 'ipaddr',
  // auth
  'token', 'access_token', 'refresh_token', 'session', 'cookie',
  'authorization', 'auth', 'apikey', 'api_key',
  'password', 'passwd', 'secret',
  // payment / id
  'card', 'cardnumber', 'cvv', 'iban', 'ssn', 'inn', 'snils',
]);

const REDACT_SUBSTRING = /(api[_-]?key|secret|token|password|authorization|cookie)/i;

const REDACTED = '[redacted]';

// Truncate any string we eventually print to 500 chars. Defends against
// log line bloat from a malicious payload.
const MAX_STR = 500;
const MAX_DEPTH = 4;

function isRedactKey(key: string): boolean {
  const k = key.toLowerCase();
  if (REDACT_KEYS.has(k)) return true;
  if (REDACT_SUBSTRING.test(k)) return true;
  return false;
}

function sanitizeValue(v: unknown, depth = 0): unknown {
  if (v == null) return v;
  if (typeof v === 'string') return v.length > MAX_STR ? v.slice(0, MAX_STR) + '…' : v;
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  if (typeof v === 'bigint') return String(v);
  if (Array.isArray(v)) {
    if (depth >= MAX_DEPTH) return `[array(${v.length})]`;
    return v.slice(0, 50).map((x) => sanitizeValue(x, depth + 1));
  }
  if (typeof v === 'object') {
    if (depth >= MAX_DEPTH) return '[object]';
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = isRedactKey(k) ? REDACTED : sanitizeValue(val, depth + 1);
    }
    return out;
  }
  // function, symbol, undefined — drop
  return undefined;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  event: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, ctx: LogContext): void {
  const sanitized = sanitizeValue(ctx) as Record<string, unknown>;
  const line = {
    ts: new Date().toISOString(),
    level,
    ...sanitized,
  };
  // Use the matching console method so Vercel Log Drain + Sentry
  // breadcrumbs see the right severity.
  const fn = level === 'error' ? console.error
           : level === 'warn'  ? console.warn
           : console.log;
  try {
    fn(JSON.stringify(line));
  } catch {
    // Circular reference — fall back to a minimal record.
    fn(JSON.stringify({ ts: line.ts, level, event: ctx.event, _serialise: 'failed' }));
  }
}

export const log = {
  debug: (ctx: LogContext) => {
    if (process.env.LOG_LEVEL === 'debug') emit('debug', ctx);
  },
  info:  (ctx: LogContext) => emit('info',  ctx),
  warn:  (ctx: LogContext) => emit('warn',  ctx),
  error: (ctx: LogContext) => emit('error', ctx),
};
