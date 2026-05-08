/**
 * P1-CR-3 (Icd10Lookup split, step 1/6) — pure-функции МКБ-10/-11 lookup.
 *
 * Pure utilities (никакого React-state). Извлечены из Icd10Lookup чтобы:
 *   1. Sub-компоненты могли импортировать без cycle
 *   2. Можно было unit-test'ить без mounting'а React tree
 */

import type { CodeEntry } from './types';

/**
 * Возвращает отображаемое название кода. Приоритет: title_ru > title.
 * Заодно убирает hierarchical markers вида "- " и "- - " из старого
 * simpleTabulation МКБ-11 экспорта (block-уровни приходят с префиксом).
 *
 * Важно: НЕ стрипаем `-α`, `-β` и т.п. — только последовательность
 * `(- )+` (дефис+пробел повторённое 1-3 раза) в самом начале.
 */
export function displayTitle(c: CodeEntry): string {
  const t = c.title_ru || c.title;
  return t.replace(/^(?:[-–—] ){1,3}/, '').trim();
}

/** Plural form для "кодов" в RU — для UI типа "Показать ещё 12 кодов". */
export function pluralCodes(n: number): string {
  const m100 = n % 100;
  const m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return 'кодов';
  if (m10 === 1) return 'код';
  if (m10 >= 2 && m10 <= 4) return 'кода';
  return 'кодов';
}

/* ── Constants ───────────────────────────────────────────────────── */

export const INITIAL_PER_CHAPTER = 50;
/** Размер chunk при подгрузке "Показать ещё". Не делаем больше чтобы DOM
 * рендер был < 100ms даже на слабых устройствах. Особенно критично для
 * МКБ-11 главы 0X (16 800 extension кодов). */
export const CHUNK_SIZE = 500;
