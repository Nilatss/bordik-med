/**
 * Lightweight metadata for tools - precomputed once at module load so
 * ToolsPage doesn't have to call getRunner() hundreds of times on every
 * filter change.
 *
 * IMPORTANT: this module must NOT import from './tools-runners' directly -
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
 * потом EU и так далее" - i.e. group then sort-within-group.
 */
/**
 * A recognised country / region prefix that appears on actual runner
 * `countries:` strings. Order controls filter sort; flag is the emoji
 * rendered next to the label.
 *
 * Aliases allow ONE canonical country to match multiple raw phrases in the
 * runner data (e.g. «UK», «NICE», «NHS England» — all map to
 * «Великобритания»). The canonical name is what the filter pill shows.
 */
interface CountryGroup {
  /** Display name in the filter (canonical country). */
  name: string;
  flag: string;
  order: number;
  /** Raw prefixes / fragments that belong to this country (case-insensitive). */
  aliases: string[];
}

const COUNTRY_GROUPS: CountryGroup[] = [
  { name: 'Международный', flag: '🌍', order: 1, aliases: ['международн', 'who', 'wfns', 'ilcor', 'ifcn', 'eortc', 'icd', 'iasp', 'iaea', 'ihi', 'wao', 'eaaci', 'niaid', 'fao', 'fip', 'irccm', 'pensa', 'aiim'] },
  { name: 'США', flag: '🇺🇸', order: 2, aliases: ['сша', 'us ', 'usa', 'aha', 'acc', 'asa', 'aafp', 'nccn', 'uspstf', 'fda', 'cdc', 'nih', 'nhlbi', 'ama', 'ads', 'asco', 'sts', 'svs', 'us dod', 'nata', 'aaem', 'acep', 'pts', 'rsna', 'napna'] },
  { name: 'ЕС', flag: '🇪🇺', order: 3, aliases: ['ес ', 'ес·', 'eu ', 'европ', 'esc', 'ers', 'ersa', 'esmo', 'eular', 'ebmt', 'ema', 'erc', 'esgo', 'esr'] },
  { name: 'Великобритания', flag: '🇬🇧', order: 4, aliases: ['великобритан', 'uk ', 'uk (', 'nice', 'nhs', 'bnf', 'bts', 'bsgr', 'bhs', 'bhivma', 'rcog'] },
  { name: 'Канада', flag: '🇨🇦', order: 5, aliases: ['канад', 'ccs', 'catch'] },
  { name: 'Австралия', flag: '🇦🇺', order: 6, aliases: ['австрал'] },
  { name: 'Новая Зеландия', flag: '🇳🇿', order: 7, aliases: ['новая зеланд'] },
  { name: 'Япония', flag: '🇯🇵', order: 8, aliases: ['япон', 'jcs'] },
  { name: 'Китай', flag: '🇨🇳', order: 9, aliases: ['кит'] },
  { name: 'Корея', flag: '🇰🇷', order: 10, aliases: ['корея', 'ktas'] },
  { name: 'Индия', flag: '🇮🇳', order: 11, aliases: ['инд', 'iap'] },
  { name: 'Германия', flag: '🇩🇪', order: 12, aliases: ['герман', 'awmf'] },
  { name: 'Франция', flag: '🇫🇷', order: 13, aliases: ['франц', 'has-'] },
  { name: 'Бразилия', flag: '🇧🇷', order: 14, aliases: ['бразил', 'pcdt'] },
  { name: 'Мексика', flag: '🇲🇽', order: 15, aliases: ['мексик', 'imss'] },
  { name: 'Испания', flag: '🇪🇸', order: 16, aliases: ['испан'] },
  { name: 'Италия', flag: '🇮🇹', order: 17, aliases: ['итал'] },
  { name: 'Швейцария', flag: '🇨🇭', order: 18, aliases: ['швейцар', 'smb'] },
  { name: 'Австрия', flag: '🇦🇹', order: 19, aliases: ['австр'] },
  { name: 'Нидерланды', flag: '🇳🇱', order: 20, aliases: ['нидер', 'nhg'] },
  { name: 'Скандинавия', flag: '🇳🇴', order: 21, aliases: ['скандинав', 'nordic'] },
  { name: 'Латинская Америка', flag: '🌎', order: 22, aliases: ['латинск', 'paho'] },
  { name: 'Саудовская Аравия', flag: '🇸🇦', order: 23, aliases: ['саудовск'] },
  { name: 'ASEAN', flag: '🌏', order: 24, aliases: ['asean', 'азия'] },
  { name: 'РФ', flag: '🇷🇺', order: 30, aliases: ['рф', 'россия', 'ru ', 'ru·', 'мз рф', 'мкб-10', 'ру-', 'фгос'] },
  { name: 'Казахстан', flag: '🇰🇿', order: 31, aliases: ['казахстан', 'мз рк'] },
  { name: 'СНГ / ЕАЭС', flag: '🌐', order: 32, aliases: ['снг', 'еаэс', 'cis'] },
];

/**
 * Returns the canonical country group a raw `countries:` phrase belongs to,
 * or `null` if none match. Using `null` (rather than a fallback bucket) is
 * intentional — it lets the filter exclude society/guideline-only phrases
 * like «NHS England», «USPSTF», «SVS», «WHO». They get rolled into the
 * country group that issued them (UK, US, International), not shown as
 * independent options.
 */
function matchCountry(label: string): CountryGroup | null {
  const lower = label.toLowerCase().trim();
  for (const g of COUNTRY_GROUPS) {
    for (const alias of g.aliases) {
      if (lower.includes(alias)) return g;
    }
  }
  return null;
}

function countryMeta(label: string): { group: number; flag: string } {
  const g = matchCountry(label);
  if (g) return { group: g.order, flag: g.flag };
  return { group: 999, flag: '🏳️' };
}

/** Flag lookup - used by the UI to render the flag next to each country. */
export function countryFlag(label: string): string {
  return countryMeta(label).flag;
}

/**
 * Precomputed aggregate country counts for the Страны filter.
 *
 * Strategy: the raw `countries` field on runners can contain many variants
 * of the same country («Канада», «Канада (CATCH)», «Канада / Международный
 * (QxMD…)»). We collapse all of them into a single PRIMARY country bucket
 * using the COUNTRY_GROUPS prefixes above. A tool may belong to more than
 * one bucket (e.g. «США · Международный» counts in both США and Международный).
 *
 * The value we store is the group's primary key (e.g. `"Канада"`), not the
 * raw label. The ToolsPage filter matches against this group key via
 * {@link countryMatches}.
 *
 * Sorted by group order.
 */
export const COUNTRY_COUNTS: { value: string; count: number; flag: string }[] = (() => {
  // Per-tool set of canonical country names (so we never double-count one
  // tool if its `countries` string has multiple phrases mapping to the
  // same country, e.g. «США · AHA · ACC» → 1× США).
  const counts: Record<string, number> = Object.create(null);
  const flags: Record<string, string> = Object.create(null);
  const orders: Record<string, number> = Object.create(null);

  for (const t of CATALOG_TOOLS) {
    const c = TOOL_META[t.id]?.countries;
    if (!c) continue;
    const groups = new Set<string>();
    for (const raw of c.split('·')) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const g = matchCountry(trimmed);
      if (!g) continue; // drop unknown organisation names — they pollute the filter
      groups.add(g.name);
      flags[g.name] = g.flag;
      orders[g.name] = g.order;
    }
    for (const name of groups) {
      counts[name] = (counts[name] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count, flag: flags[value], _order: orders[value] ?? 999 }))
    .sort((a, b) => {
      if (a._order !== b._order) return a._order - b._order;
      if (b.count !== a.count) return b.count - a.count;
      return a.value.localeCompare(b.value);
    })
    .map(({ value, count, flag }) => ({ value, count, flag }));
})();

/**
 * Extracts the primary canonical countries referenced by a tool's raw
 * `countries:` string. Returns them in the order they appear in the raw
 * string (deduplicated), each paired with its flag emoji for the UI.
 *
 * Used by ToolCard to render small country tags next to the subcategory,
 * so the user can see at a glance which region a tool comes from.
 */
export function primaryCountriesFor(raw: string | undefined): { name: string; flag: string }[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: { name: string; flag: string }[] = [];
  for (const part of raw.split('·')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const g = matchCountry(trimmed);
    if (!g) continue;
    if (seen.has(g.name)) continue;
    seen.add(g.name);
    out.push({ name: g.name, flag: g.flag });
  }
  return out;
}

/**
 * Returns true when a tool's raw `countries` string maps to the given
 * canonical country name from COUNTRY_COUNTS. Uses the same alias-based
 * match as the filter index, so selecting «Великобритания» matches
 * «UK (RCOG)», «NHS England», «NICE» etc.
 */
export function countryMatches(raw: string | undefined, canonicalName: string): boolean {
  if (!raw) return false;
  for (const part of raw.split('·')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const g = matchCountry(trimmed);
    if (g && g.name === canonicalName) return true;
  }
  return false;
}

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
