/**
 * Pure helpers for computing catalog meta. These take an array of catalog
 * items as input rather than importing CATALOG_TOOLS at module load - which
 * means callers can drive everything from the async-fetched catalog meta
 * (lib/catalog-client.ts) without dragging tools-catalog.ts into the bundle.
 *
 * The legacy lib/tool-meta.ts still exposes precomputed constants (used by
 * build scripts and a couple of pre-existing call sites) - this file exists
 * so the heavy ToolsPage / ToolView / StatisticsPage can avoid the
 * 150 KB tools-catalog.ts import entirely.
 */

import type { CatalogMetaItem } from './schemas/catalog';

/* ── Country grouping (was inline in tool-meta.ts) ────────────────── */

export interface CountryGroup {
  name: string;
  flag: string;
  order: number;
  aliases: string[];
}

export const COUNTRY_GROUPS: ReadonlyArray<CountryGroup> = [
  { name: 'Международный', flag: '🌍', order: 1, aliases: ['международ', 'who', 'международ.', 'kdigo', 'esc ', 'aha', 'esmo', 'who/iarc', 'фрс', 'ich-gcp'] },
  { name: 'США', flag: '🇺🇸', order: 2, aliases: ['сша', 'usa', 'us ', 'united states', 'fda', 'aap', 'acp', 'aaem', 'aans', 'acs', 'aspen', 'aacc', 'us ', 'aha/', 'asco', 'nccn', 'mayo', 'apa ', 'aap-', 'aacap', 'ash ', 'cdc', 'va ', 'sccm', 'tjc', 'pep', 'usp', 'idsa', 'astd'] },
  { name: 'Великобритания', flag: '🇬🇧', order: 3, aliases: ['велик', 'uk ', 'uk·', 'nhs', 'nice', 'rcog', 'rcs', 'rcp', 'rcgp', 'bsg', 'bsh', 'mhra', 'gmc', 'rcoa', 'rcr', 'bts', 'rcpsych'] },
  { name: 'Канада', flag: '🇨🇦', order: 4, aliases: ['канада', 'canada', 'catch', 'qxmd'] },
  { name: 'EU', flag: '🇪🇺', order: 5, aliases: ['ес ', 'eu ', 'eu·', 'eu-', 'esmo', 'esp ', 'eular', 'esicm', 'ema ', 'eortc', 'edqm', 'esa ', 'esge'] },
  { name: 'Германия', flag: '🇩🇪', order: 6, aliases: ['германия', 'german', 'awmf', 'rki ', 'pei '] },
  { name: 'Франция', flag: '🇫🇷', order: 7, aliases: ['франция', 'france', 'has ', 'sfar', 'sfm ', 'inca'] },
  { name: 'Италия', flag: '🇮🇹', order: 8, aliases: ['италия', 'italy', 'siaarti', 'aiom'] },
  { name: 'Испания', flag: '🇪🇸', order: 9, aliases: ['испания', 'spain', 'aemps', 'sec '] },
  { name: 'Швейцария', flag: '🇨🇭', order: 10, aliases: ['швейцария', 'swiss', 'swissmedic', 'sgp '] },
  { name: 'Польша', flag: '🇵🇱', order: 11, aliases: ['польша', 'poland', 'urpl '] },
  { name: 'Нидерланды', flag: '🇳🇱', order: 12, aliases: ['нидерланды', 'netherlands', 'cbg '] },
  { name: 'Скандинавия', flag: '🇸🇪', order: 13, aliases: ['швеция', 'норвегия', 'дания', 'финляндия', 'scand'] },
  { name: 'Австралия', flag: '🇦🇺', order: 14, aliases: ['австралия', 'australia', 'rch ', 'tga ', 'asbtr', 'racp'] },
  { name: 'Новая Зеландия', flag: '🇳🇿', order: 15, aliases: ['новая зеландия', 'new zealand', 'nz '] },
  { name: 'Япония', flag: '🇯🇵', order: 16, aliases: ['япония', 'japan', 'pmda'] },
  { name: 'Корея', flag: '🇰🇷', order: 17, aliases: ['корея', 'korea', 'mfds'] },
  { name: 'Китай', flag: '🇨🇳', order: 18, aliases: ['китай', 'china', 'chinese'] },
  { name: 'Индия', flag: '🇮🇳', order: 19, aliases: ['индия', 'india', 'cdsco'] },
  { name: 'Бразилия', flag: '🇧🇷', order: 20, aliases: ['бразилия', 'brazil', 'anvisa'] },
  { name: 'Мексика', flag: '🇲🇽', order: 21, aliases: ['мексика', 'mexico'] },
  { name: 'Аргентина', flag: '🇦🇷', order: 22, aliases: ['аргентина', 'argentina'] },
  { name: 'Саудовская Аравия', flag: '🇸🇦', order: 23, aliases: ['саудовск'] },
  { name: 'ASEAN', flag: '🌏', order: 24, aliases: ['asean', 'азия'] },
  { name: 'РФ', flag: '🇷🇺', order: 30, aliases: ['рф', 'россия', 'ru ', 'ru·', 'мз рф', 'мкб-10', 'ру-', 'фгос'] },
  { name: 'Казахстан', flag: '🇰🇿', order: 31, aliases: ['казахстан', 'мз рк'] },
  { name: 'СНГ / ЕАЭС', flag: '🌐', order: 32, aliases: ['снг', 'еаэс', 'cis'] },
];

export function matchCountry(label: string): CountryGroup | null {
  const lower = label.toLowerCase().trim();
  for (const g of COUNTRY_GROUPS) {
    for (const alias of g.aliases) {
      if (lower.includes(alias)) return g;
    }
  }
  return null;
}

export function countryFlag(label: string): string {
  const g = matchCountry(label);
  return g ? g.flag : '🏳️';
}

export function primaryCountriesFor(raw: string | undefined | null): { name: string; flag: string }[] {
  const seen = new Set<string>();
  const out: { name: string; flag: string }[] = [];
  if (raw) {
    for (const part of raw.split('·')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const g = matchCountry(trimmed);
      if (!g) continue;
      if (seen.has(g.name)) continue;
      seen.add(g.name);
      out.push({ name: g.name, flag: g.flag });
    }
  }
  if (out.length === 0) {
    out.push({ name: 'Международный', flag: '🌍' });
  }
  return out;
}

export function countryMatches(raw: string | undefined | null, canonicalName: string): boolean {
  if (!raw) return canonicalName === 'Международный';
  let matched = false;
  for (const part of raw.split('·')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const g = matchCountry(trimmed);
    if (g) {
      matched = true;
      if (g.name === canonicalName) return true;
    }
  }
  if (!matched && canonicalName === 'Международный') return true;
  return false;
}

/* ── Aggregations driven by an explicit catalog array ─────────────── */

export interface CountedOption {
  value: string;
  count: number;
  flag?: string;
  label?: string;
}

/** Builds the СТРАНЫ filter options (canonical country name → tool count). */
export function buildCountryCounts(tools: ReadonlyArray<CatalogMetaItem>): CountedOption[] {
  const counts: Record<string, number> = Object.create(null);
  const flags: Record<string, string> = Object.create(null);
  const orders: Record<string, number> = Object.create(null);

  for (const t of tools) {
    const c = t.countries;
    const groups = new Set<string>();
    if (c) {
      for (const raw of c.split('·')) {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const g = matchCountry(trimmed);
        if (!g) continue;
        groups.add(g.name);
        flags[g.name] = g.flag;
        orders[g.name] = g.order;
      }
    }
    if (groups.size === 0 && t.hasRunner) {
      groups.add('Международный');
      flags['Международный'] = '🌍';
      orders['Международный'] = 1;
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
    .map(({ value, count, flag }) => ({
      value,
      count,
      ...(flag !== undefined && { flag }),
    }));
}

/** Subcategory filter options sorted by ru-locale alphabetic order. */
export function buildSubcategoryCounts(tools: ReadonlyArray<CatalogMetaItem>): CountedOption[] {
  const counts: Record<string, number> = Object.create(null);
  for (const t of tools) {
    counts[t.subcategory] = (counts[t.subcategory] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value, 'ru'));
}

function categorySortKey(label: string): string {
  return label.replace(/^\d+\.\s*/, '').toLowerCase();
}

/** Category filter options. Honours the predefined order array if given,
 *  falls back to alphabetic ordering by stripped category name. */
export function buildCategoryCounts(
  tools: ReadonlyArray<CatalogMetaItem>,
  knownOrder?: ReadonlyArray<string>,
): CountedOption[] {
  const counts: Record<string, number> = Object.create(null);
  for (const t of tools) {
    counts[t.category] = (counts[t.category] || 0) + 1;
  }
  const seen = new Set<string>();
  const ordered: CountedOption[] = [];
  if (knownOrder) {
    for (const c of knownOrder) {
      if (counts[c] != null) {
        ordered.push({ value: c, count: counts[c] || 0 });
        seen.add(c);
      }
    }
  }
  // Append any categories present in `tools` but missing from knownOrder
  for (const [value, count] of Object.entries(counts)) {
    if (!seen.has(value)) ordered.push({ value, count });
  }
  ordered.sort((a, b) => categorySortKey(a.value).localeCompare(categorySortKey(b.value), 'ru'));
  return ordered;
}

/** Module-stable list of distinct categories (sorted), derived from tools. */
export function buildCategoryList(tools: ReadonlyArray<CatalogMetaItem>): string[] {
  const seen = new Set<string>();
  for (const t of tools) seen.add(t.category);
  return Array.from(seen).sort((a, b) =>
    categorySortKey(a).localeCompare(categorySortKey(b), 'ru')
  );
}
