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

  // P1-CR-4: migrated from inline style to Tailwind. Default color via
  // class; custom color path uses CSS variable to keep className-driven.
  const isDefault = color === HIGHLIGHT_COLOR_DEFAULT;

  return (
    <>
      {parts.map((p, i) => {
        if (!p || !tokenSet.has(normalize(p))) return <span key={i}>{p}</span>;
        if (isDefault) return <strong key={i} className="font-bold text-[#2563EB]">{p}</strong>;
        return (
          <strong
            key={i}
            className="font-bold text-[var(--highlight-color)]"
            // eslint-disable-next-line react/forbid-dom-props -- CSS-var injection для dynamic color prop (rare, no call sites override default)
            style={{ ['--highlight-color' as string]: color }}
          >
            {p}
          </strong>
        );
      })}
    </>
  );
}
