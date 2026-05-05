/**
 * Drug Interaction Checker — типы и хелперы.
 *
 * Phase 1 (K1 из аудита): 62 наиболее частых препарата русского рынка
 * + 83 ручкой выверенных пары взаимодействий. Каждое взаимодействие
 * имеет механизм, клиническое следствие, тактику и цитированные
 * источники (UpToDate Lexidrug, Stockley's 12th, ESC/AHA, FDA).
 *
 * Юр-режим: справочник, не медизделие. Жирный дисклеймер во всех
 * местах вывода. Не использовать как замену фарм-консультации
 * у конкретных пациентов.
 *
 * Phase 2: парсер ГРЛС → 200+ препаратов, все severity-уровни.
 */

export type Severity = 'contraindicated' | 'major' | 'moderate' | 'minor';

export interface Drug {
  id: string;
  name_ru: string;
  name_en: string;
  inn?: string;
  atc?: string;
  class_ru: string;
  aliases: string[];
}

export interface Interaction {
  drugA: string;
  drugB: string;
  severity: Severity;
  mechanism: string;
  effect: string;
  management: string;
  sources: string[];
  /** Кто верифицировал пару клинически. null = AI-синтез, требует
   *  ручного аудита клин-фармакологом перед коммерческим использованием.
   *  См. docs/specs/drug-interactions-verification.md */
  verified_by?: 'clinical_pharmacologist' | 'pharmacology_committee' | null;
  /** Дата последней верификации в формате YYYY-MM-DD. */
  verified_at?: string | null;
}

export interface DrugInteractionData {
  version: string;
  lastUpdated: string;
  sources: string[];
  drugs: Drug[];
  interactions: Interaction[];
}

/* ── Severity metadata ─────────────────────────────────────────── */

export const SEVERITY_META: Record<Severity, {
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  weight: number; // для сортировки (выше = опаснее)
}> = {
  contraindicated: {
    label: 'Противопоказано',
    color: '#991B1B',
    bg: '#FEE2E2',
    border: '#FCA5A5',
    description: 'Не назначать совместно. Угроза жизни или необратимого вреда.',
    weight: 4,
  },
  major: {
    label: 'Высокий риск',
    color: '#9A3412',
    bg: '#FFEDD5',
    border: '#FDBA74',
    description: 'Серьёзное взаимодействие. Требует мониторинга, коррекции дозы или замены.',
    weight: 3,
  },
  moderate: {
    label: 'Умеренный',
    color: '#92400E',
    bg: '#FEF3C7',
    border: '#FDE68A',
    description: 'Может потребоваться коррекция дозы или контроль показателей.',
    weight: 2,
  },
  minor: {
    label: 'Незначительный',
    color: '#1E40AF',
    bg: '#DBEAFE',
    border: '#BFDBFE',
    description: 'Клинически малозначимо при стандартном применении.',
    weight: 1,
  },
};

/* ── Public helpers ────────────────────────────────────────────── */

/**
 * Поиск всех взаимодействий для набора препаратов.
 * Каждая пара (A, B) проверяется в обе стороны. Возвращаем
 * найденные взаимодействия отсортированные по severity (опаснее
 * сверху), затем по имени первого препарата.
 */
export function findInteractions(
  selectedIds: string[],
  data: DrugInteractionData,
): Array<Interaction & { drugAName: string; drugBName: string }> {
  const set = new Set(selectedIds);
  const drugById = new Map(data.drugs.map((d) => [d.id, d]));
  const found: Array<Interaction & { drugAName: string; drugBName: string }> = [];

  for (const inter of data.interactions) {
    if (set.has(inter.drugA) && set.has(inter.drugB)) {
      const a = drugById.get(inter.drugA);
      const b = drugById.get(inter.drugB);
      if (!a || !b) continue;
      found.push({
        ...inter,
        drugAName: a.name_ru,
        drugBName: b.name_ru,
      });
    }
  }

  found.sort((x, y) => {
    const wd = SEVERITY_META[y.severity].weight - SEVERITY_META[x.severity].weight;
    if (wd !== 0) return wd;
    return x.drugAName.localeCompare(y.drugAName);
  });

  return found;
}

/**
 * Search drugs by name / INN / alias / ATC.
 * Score-based ranking: точное совпадение > startsWith > contains.
 */
export function searchDrugs(
  query: string,
  drugs: readonly Drug[],
  limit = 10,
): Drug[] {
  const q = query.trim().toLowerCase().replace(/ё/g, 'е');
  if (!q) return [];

  type Scored = { d: Drug; score: number };
  const scored: Scored[] = [];

  for (const d of drugs) {
    const ru = d.name_ru.toLowerCase().replace(/ё/g, 'е');
    const en = d.name_en.toLowerCase();
    const aliases = d.aliases.map((a) => a.toLowerCase().replace(/ё/g, 'е'));
    let score = 0;

    if (ru === q || en === q) score = 100;
    else if (ru.startsWith(q) || en.startsWith(q)) score = 80;
    else if (aliases.some((a) => a === q)) score = 90;
    else if (aliases.some((a) => a.startsWith(q))) score = 70;
    else if (ru.includes(q)) score = 40;
    else if (en.includes(q)) score = 35;
    else if (aliases.some((a) => a.includes(q))) score = 30;
    else continue;

    scored.push({ d, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.d.name_ru.localeCompare(b.d.name_ru);
  });

  return scored.slice(0, limit).map((s) => s.d);
}
