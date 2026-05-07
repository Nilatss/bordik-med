/**
 * P2-NEW-9 — Daily quota counter для Gemini API.
 *
 * Сценарий риска: Upstash sliding-window rate-limit ограничивает
 * burst (30/мин на IP, 60/мин на user), но НЕ ограничивает суточный
 * объём. Coordinated abuse через ботнет даёт ~30 IP × 60 мин × 24 ч
 * × 30 RPM = ~1.3M req/день, что выливается в платный тариф Gemini.
 *
 * Решение: глобальный hard cap по числу успешно отправленных запросов
 * к Gemini за календарный день. Ключ Upstash:
 *     gemini:quota:YYYY-MM-DD
 * INCR + EXPIRE 36h (не 24h — даём запас на UTC-переход).
 *
 * Поведение:
 *   - reserve()  — INCR ключ, проверяет cap. Если превысили — возвращает
 *     `{ ok: false }` и НЕ дёргаем Gemini.
 *   - Без Upstash (dev/preview): in-memory counter, reset каждые 24ч
 *     по wall-clock. Не идеально, но защищает от runaway loop в dev.
 *
 * Cap configurable через GEMINI_DAILY_CAP (default 50_000 — щедрый
 * для тестового deployment'а, но в 26 раз меньше worst-case ботнета).
 */

const DEFAULT_CAP = 50_000;

interface UpstashClientShape {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

let redis: UpstashClientShape | null = null;
let redisChecked = false;

async function getRedis(): Promise<UpstashClientShape | null> {
  if (redisChecked) return redis;
  redisChecked = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const { Redis } = await import('@upstash/redis');
    redis = new Redis({ url, token }) as unknown as UpstashClientShape;
    return redis;
  } catch {
    return null;
  }
}

function todayKey(): string {
  // UTC дата — мы не хотим, чтобы пользователь из разных tz видел
  // разные cap'ы. Calendar day по UTC простой и предсказуемый.
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm   = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd   = String(d.getUTCDate()).padStart(2, '0');
  return `gemini:quota:${yyyy}-${mm}-${dd}`;
}

// In-memory fallback. Сбрасываем при первом вызове после смены даты.
let memCounter = 0;
let memDay = '';

export interface QuotaDecision {
  ok: boolean;
  used: number;
  cap: number;
  /** True если превысили cap. */
  exceeded: boolean;
}

/**
 * Резервирует одну единицу квоты. Вызывать ДО fetch к Gemini —
 * если `ok: false`, fetch не делаем, возвращаем 503 клиенту.
 */
export async function reserveGeminiQuota(): Promise<QuotaDecision> {
  const cap = Number(process.env.GEMINI_DAILY_CAP) || DEFAULT_CAP;

  const r = await getRedis();
  if (r) {
    const key = todayKey();
    const used = await r.incr(key);
    // EXPIRE только при первом INCR (used === 1), чтобы не растягивать
    // TTL бесконечно. Если EXPIRE упадёт — невелика беда, ключ просто
    // переживёт сутки и сбросится сам при смене даты.
    if (used === 1) {
      try { await r.expire(key, 36 * 3600); } catch { /* best-effort */ }
    }
    const exceeded = used > cap;
    return { ok: !exceeded, used, cap, exceeded };
  }

  // Fallback: in-memory counter. Сбрасываем при смене UTC-даты.
  const day = todayKey();
  if (day !== memDay) {
    memDay = day;
    memCounter = 0;
  }
  memCounter += 1;
  const exceeded = memCounter > cap;
  return { ok: !exceeded, used: memCounter, cap, exceeded };
}
