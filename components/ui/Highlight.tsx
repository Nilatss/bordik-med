'use client';

/**
 * Highlight — выделение совпадений поиска в синем (#2563EB).
 *
 * Единый паттерн для всех мест где есть поиск (sidebar, Cmd+K,
 * фильтр-дропдауны, /icd10, диагнозы и т.д.). Используем везде —
 * не дублировать логику highlighting в каждом компоненте.
 *
 * Особенности:
 *   - case-insensitive matching
 *   - ё ↔ е нормализация (при поиске «гипер» подсвечивает и
 *     «гипертензия» и «гипёртензия»)
 *   - Поддержка multi-token (через пробел): «острый бронх» подсвечивает
 *     отдельно «острый» и «бронх» в любом порядке
 *   - Безопасный escape regex-метасимволов в query
 *
 * Пример:
 *   <Highlight text="Эссенциальная гипертензия" query="гипер" />
 *   → renders: «Эссенциальная **гипер**тензия» (синий жирный)
 *
 * Стиль выделения изолирован в одном месте — если хотим поменять цвет
 * подсветки на жёлтый/зелёный, делаем это здесь и оно меняется везде.
 */

import React from 'react';

interface Props {
  text: string;
  query: string;
  /** Цвет подсветки. По умолчанию — наш брендовый синий. */
  color?: string;
}

const HIGHLIGHT_COLOR_DEFAULT = '#2563EB';

/** Нормализация: lowercase + ё→е для устойчивого матчинга. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/ё/g, 'е');
}

export default function Highlight({ text, query, color = HIGHLIGHT_COLOR_DEFAULT }: Props) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;

  const escaped = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const splitter = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(splitter);

  // Множество нормализованных токенов для O(1) проверки matched
  const tokenSet = new Set(tokens.map(normalize));

  return (
    <>
      {parts.map((p, i) =>
        p && tokenSet.has(normalize(p))
          ? <strong key={i} style={{ fontWeight: 700, color }}>{p}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}
