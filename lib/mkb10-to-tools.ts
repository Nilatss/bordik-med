/**
 * Обратный индекс МКБ-10 код → калькуляторы.
 *
 * Строится из SUBCATEGORY_TO_MKB10 + TOOL_MKB10_OVERRIDE на запуске
 * (вычисляется один раз, кэшируется в модуль). Один и тот же код может
 * указывать на N инструментов (например, I26.9 → Wells PE, Geneva, PESI,
 * sPESI, Age-adjusted D-dimer).
 *
 * Используется на /icd10 — в будущем при клике на код показываем
 * блок «Калькуляторы для этого диагноза». Сейчас helper готов и ждёт
 * UI-крючка.
 */

import { SUBCATEGORY_TO_MKB10, TOOL_MKB10_OVERRIDE } from './tool-relations';
import type { CatalogMetaItem } from './schemas/catalog';

let cache: Map<string, string[]> | null = null;

/**
 * Строит индекс mkb10Code → toolIds по полному каталогу.
 * Должен вызываться один раз при загрузке (на сервере или клиенте).
 */
export function buildMkb10ToolsIndex(catalog: readonly CatalogMetaItem[]): Map<string, string[]> {
  const idx = new Map<string, string[]>();
  for (const tool of catalog) {
    const fromOverride = TOOL_MKB10_OVERRIDE[tool.id];
    const fromSub = SUBCATEGORY_TO_MKB10[tool.subcategory] ?? [];
    const codes = fromOverride !== undefined ? fromOverride : fromSub;
    for (const code of codes) {
      const top = code.split('.')[0] ?? code;
      // Индексируем И полный код («I26.9»), И верхнеуровневый («I26»).
      // Это даёт гибкость: пользователь может искать по точному коду
      // или по 3-знаковой категории.
      for (const key of new Set([code, top])) {
        if (!idx.has(key)) idx.set(key, []);
        const list = idx.get(key)!;
        if (!list.includes(tool.id)) list.push(tool.id);
      }
    }
  }
  cache = idx;
  return idx;
}

/** Получить список tool-id для конкретного кода МКБ-10. */
export function toolsForMkb10(code: string): string[] {
  if (!cache) return [];
  // Точное совпадение приоритет
  const exact = cache.get(code);
  if (exact) return exact;
  // Иначе пробуем верхнеуровневый префикс
  const top = code.split('.')[0] ?? code;
  return cache.get(top) ?? [];
}
