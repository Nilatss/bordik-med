/**
 * P1-CR-3 (Icd10Lookup split, step 1/6) — типы для МКБ-10/-11 lookup.
 *
 * Вынесено отдельно из components/icd10/Icd10Lookup.tsx чтобы
 * sub-компоненты (ChapterAccordion, FlatList, CodeRow, DetailBlock,
 * ChapterPill) могли импортировать их без cycle через главный файл.
 */

export interface Chapter {
  id: string;
  range: string;
  title: string;
}

export interface CodeEntry {
  code: string;
  title: string;
  chapter: string;
  // Опциональные поля (используются для МКБ-11 после Phase 2 enrichment).
  title_ru?: string;
  definition?: string;
  longDefinition?: string;
  codingNote?: string;
  inclusion?: string[];
  exclusion?: string[];
  // Унаследованные от родителя (если у кода нет своих) — pre-computed
  // в build-step для МКБ-11 residual подкодов.
  inheritedDefinition?: string;
  inheritedLongDefinition?: string;
  inheritedInclusion?: string[];
  inheritedFrom?: string;
}

/** Внутренний lookup-record: исходный CodeEntry + precomputed lowercased
 *  поля для быстрого поиска без runtime-стоимости на каждый keystroke. */
export interface IndexedCode extends CodeEntry {
  _codeLc: string;     // lowercased code
  _titleLc: string;    // lowercased displayTitle (с ё→е normalization)
}
