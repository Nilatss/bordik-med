/**
 * Lightweight metadata for tools — precomputed once at module load so
 * ToolsPage doesn't have to call getRunner() hundreds of times on every
 * filter change.
 *
 * IMPORTANT: this module must NOT import from './tools-runners' directly —
 * that file is ~446 KB (all clinical info markdown) and pulling it into the
 * ToolsPage bundle adds hundreds of milliseconds of parse time on entry.
 * Instead it uses the generated `tool-meta-data.ts` which carries only the
 * runner id list and country strings (~2 KB).
 *
 * Regenerate `tool-meta-data.ts` via `scripts/build-tool-meta.ts` whenever
 * the runners file changes.
 */

import { CATALOG_TOOLS, TOOL_CATEGORIES } from './tools-catalog';
import { RUNNER_IDS, RUNNER_COUNTRIES } from './tool-meta-data';

export interface ToolMeta {
  hasRunner: boolean;
  countries?: string;
}

const RUNNER_SET: Set<string> = new Set(RUNNER_IDS);

/** Populated once at module load. O(n) up-front, O(1) lookup. */
export const TOOL_META: Record<string, ToolMeta> = (() => {
  const meta: Record<string, ToolMeta> = Object.create(null);
  for (const t of CATALOG_TOOLS) {
    const has = RUNNER_SET.has(t.id);
    meta[t.id] = {
      hasRunner: has,
      countries: has ? RUNNER_COUNTRIES[t.id] : undefined,
    };
  }
  return meta;
})();

/** Fast membership check without hitting the heavy runner map. */
export function hasRunner(toolId: string): boolean {
  return RUNNER_SET.has(toolId);
}

/** Fast country string lookup. */
export function toolCountries(toolId: string): string | undefined {
  return RUNNER_COUNTRIES[toolId];
}

/**
 * Map of country-group prefixes → flag emoji and sort priority.
 * Prefixes are matched case-insensitively as a startsWith against the raw
 * label. Lower `order` number = higher up in the filter dropdown.
 *
 * Why groups: the catalogue has labels like "США", "США (FDA)" and
 * "Международный (KDIGO)" that should cluster together instead of being
 * ranked purely by count. The user asked for "США и всё дальше по США,
 * потом EU и так далее" — i.e. group then sort-within-group.
 */
const COUNTRY_GROUPS: { prefix: string; flag: string; order: number }[] = [
  { prefix: 'Международный', flag: '🌍', order: 1 },
  { prefix: 'США',           flag: '🇺🇸', order: 2 },
  { prefix: 'ЕС',            flag: '🇪🇺', order: 3 },
  { prefix: 'EU',            flag: '🇪🇺', order: 3 },
  { prefix: 'Великобритания',flag: '🇬🇧', order: 4 },
  { prefix: 'Канада',        flag: '🇨🇦', order: 5 },
  { prefix: 'Австралия',     flag: '🇦🇺', order: 6 },
  { prefix: 'Япония',        flag: '🇯🇵', order: 7 },
  { prefix: 'Китай',         flag: '🇨🇳', order: 8 },
  { prefix: 'Индия',         flag: '🇮🇳', order: 9 },
  { prefix: 'Германия',      flag: '🇩🇪', order: 10 },
  { prefix: 'Франция',       flag: '🇫🇷', order: 11 },
  { prefix: 'Корея',         flag: '🇰🇷', order: 12 },
  { prefix: 'Латинская',     flag: '🌎', order: 20 },
  { prefix: 'РФ',            flag: '🇷🇺', order: 21 },
  { prefix: 'СНГ',           flag: '🌐', order: 22 },
];

function countryMeta(label: string): { group: number; flag: string } {
  for (const g of COUNTRY_GROUPS) {
    if (label.startsWith(g.prefix)) return { group: g.order, flag: g.flag };
  }
  return { group: 999, flag: '🏳️' };
}

/** Flag lookup — used by the UI to render the flag next to each country. */
export function countryFlag(label: string): string {
  return countryMeta(label).flag;
}

/**
 * Precomputed aggregate country counts (for the Страны filter).
 * Sorted: (1) by group order (International, US, EU, UK …),
 *         (2) within a group by count desc,
 *         (3) tiebreak by label ascending.
 */
export const COUNTRY_COUNTS: { value: string; count: number; flag: string }[] = (() => {
  const counts: Record<string, number> = Object.create(null);
  for (const t of CATALOG_TOOLS) {
    const c = TOOL_META[t.id]?.countries;
    if (!c) continue;
    for (const raw of c.split('·')) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      counts[trimmed] = (counts[trimmed] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([value, count]) => {
      const meta = countryMeta(value);
      return { value, count, flag: meta.flag, _group: meta.group };
    })
    .sort((a, b) => {
      if (a._group !== b._group) return a._group - b._group;
      if (b.count !== a.count) return b.count - a.count;
      return a.value.localeCompare(b.value);
    })
    .map(({ value, count, flag }) => ({ value, count, flag }));
})();

/** Precomputed subcategory counts. */
export const SUBCATEGORY_COUNTS: { value: string; count: number }[] = (() => {
  const counts: Record<string, number> = Object.create(null);
  for (const t of CATALOG_TOOLS) {
    counts[t.subcategory] = (counts[t.subcategory] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value));
})();

/** Precomputed category counts (preserve TOOL_CATEGORIES order). */
export const CATEGORY_COUNTS: { value: string; count: number }[] = (() => {
  const counts: Record<string, number> = Object.create(null);
  for (const t of CATALOG_TOOLS) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }
  return TOOL_CATEGORIES.map((c) => ({ value: c, count: counts[c] || 0 }));
})();
