'use client';

/**
 * Reporter для метрики «время до результата» (P0-A8 из аудита).
 *
 * Замеряет: миллисекунды от `openTool(id)` (момент клика по инструменту)
 * до первого валидного compute-результата на экране. Это North Star
 * UX-метрика для медицинского приложения — у врача в дежурстве цель
 * <3 сек / <2 тапа до ответа (по бенчмарку MDCalc).
 *
 * Архитектурно:
 *   1) `lib/store.ts` openTool() сохраняет performance.now() в
 *      window.__bordikToolOpenedAt = { id, t }
 *   2) ToolView вызывает reportToolTimeToResult(id, kind) после
 *      первого успешного compute — мы читаем timestamp, считаем
 *      разницу, отправляем в Sentry с тегами
 *   3) Один отчёт на open: сбрасываем счётчик после отчёта,
 *      повторные computes на изменение input'а не дублируют событие
 *
 * Sampling: на p50 sampling 10 %, на «медленные» (>3 сек) 100 %.
 * Цель — собрать достаточно данных для p50/p95/p99 perf-дашборда без
 * перегрузки Sentry-квоты.
 */

import * as Sentry from '@sentry/nextjs';

const SLOW_THRESHOLD_MS = 3000; // = 3 сек, цель из аудита (Top-10 #10)
const HEALTHY_SAMPLE_RATE = 0.1;

interface OpenedAtRecord {
  id: string;
  t: number;
}

function deviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/iPad|tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function effectiveConnection(): string {
  type Conn = { effectiveType?: string; saveData?: boolean };
  const nav = typeof navigator !== 'undefined' ? (navigator as unknown as { connection?: Conn }) : null;
  return nav?.connection?.effectiveType ?? 'unknown';
}

/**
 * Отчёт о времени до результата.
 * Вызывать после первого успешного compute для конкретного инструмента.
 * Идемпотентен: повторные вызовы для того же id (без нового openTool)
 * ничего не делают.
 */
export function reportToolTimeToResult(
  id: string,
  kind: 'score' | 'calculator' | undefined,
): void {
  if (typeof window === 'undefined') return;

  const w = window as unknown as { __bordikToolOpenedAt?: OpenedAtRecord | undefined };
  const opened = w.__bordikToolOpenedAt;
  if (!opened || opened.id !== id) return;

  const ms = Math.round(performance.now() - opened.t);
  // Сбрасываем чтобы не отправить повторно при пересчёте на input change.
  delete w.__bordikToolOpenedAt;

  // Sampling: всегда отправляем «медленные» (>3 сек), небольшую долю
  // быстрых — для статистики p50.
  const isSlow = ms > SLOW_THRESHOLD_MS;
  const shouldSample = isSlow || Math.random() < HEALTHY_SAMPLE_RATE;
  if (!shouldSample) return;

  // Только в production. Dev-сборки имеют HMR-задержки и реальный perf
  // там не показателен — будет шумить в Sentry-фиде.
  if (process.env.NODE_ENV !== 'production') {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.debug('[tool-ttr]', { id, kind, ms });
    }
    return;
  }

  const tags: Record<string, string> = {
    'tool.id': id,
    'tool.kind': kind ?? 'unknown',
    'tool.rating': isSlow ? 'slow' : 'fast',
    device: deviceCategory(),
    connection: effectiveConnection(),
  };

  // Breadcrumb — оставляет след в любом будущем Sentry-событии
  // этой сессии (если ошибка случится позже, видим что ttr был N мс).
  Sentry.addBreadcrumb({
    category: 'tool-ttr',
    type: 'info',
    level: isSlow ? 'warning' : 'info',
    message: `${id}: ${ms} ms (${kind ?? '?'})`,
    data: { ms, id, kind },
  });

  Sentry.captureMessage(
    `tool-ttr · ${id} ${isSlow ? 'slow' : 'ok'} (${ms} ms)`,
    {
      level: isSlow ? 'warning' : 'info',
      tags,
      extra: { ms, id, kind },
      // Один Sentry-issue на (tool, rating) — не спамим тысячами
      // одинаковых событий, оставляем по группе для агрегации.
      fingerprint: ['tool-ttr', id, isSlow ? 'slow' : 'fast'],
    },
  );
}
