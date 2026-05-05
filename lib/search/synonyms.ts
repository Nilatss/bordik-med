/**
 * Synonym expansion for the global Cmd-K search.
 *
 * Source: data/search-synonyms.json — flat list of equivalence groups.
 * At runtime we flatten those into a Map<term, group[]> for O(1) lookup,
 * then take an incoming query and produce a space-joined "expanded query"
 * that MiniSearch can OR against.
 *
 * Why this lives in `lib/search/` and not in the search hook directly:
 *   - the synonym map is JSON (~5 KB) so it tree-shakes cleanly out of
 *     routes that don't open the palette
 *   - same expander is reused by ICD-10 search, calculator search, and
 *     any future entity that joins the global palette
 *
 * Locale: groups are intentionally mixed RU/Latin/EN — that's the whole
 * point. A user typing "MI" gets "инфаркт миокарда" results; typing
 * "ТГВ" gets "DVT" results. Lower-case + diacritic-insensitive.
 */

import raw from '@/data/search-synonyms.json';

const GROUPS: string[][] = (raw as { groups: string[][] }).groups;

// Flat lookup map. Each term in a group points to the same group array,
// so an O(1) lookup gives all synonyms incl. the original term.
const TERM_TO_GROUP = new Map<string, readonly string[]>();
for (const group of GROUPS) {
  const frozen = Object.freeze(group.map(normalize));
  for (const term of frozen) {
    TERM_TO_GROUP.set(term, frozen);
  }
}

/** Lowercase + collapse whitespace + strip basic punctuation. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ё]/g, 'е')           // ё→е normalisation
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Expand a free-text query into MiniSearch-friendly OR-joined token soup.
 *
 * Examples:
 *   "ТЭЛА"        → "тэла pe pulmonary embolism вте vte тромбоэмболия лёгочной артерии"
 *   "wells"       → "wells уэллс уэлс шкала уэллса"
 *   "инфаркт миокарда" → original phrase + STEMI + NSTEMI + AMI + MI etc.
 *
 * Multi-word queries: each token is expanded independently, then joined.
 * MiniSearch with `combineWith: 'OR'` treats this as «match any», which
 * is what we want for synonyms — but we still pass the original query
 * with `combineWith: 'AND'` first to bias toward strict matches.
 */
export function expandQuery(query: string): { strict: string; expanded: string } {
  const norm = normalize(query);
  if (!norm) return { strict: '', expanded: '' };

  // 1. Try whole-phrase match first (e.g. «инфаркт миокарда» as one key).
  const wholeGroup = TERM_TO_GROUP.get(norm);
  if (wholeGroup) {
    return { strict: norm, expanded: wholeGroup.join(' ') };
  }

  // 2. Token-level expansion. Each token contributes its synonym group
  //    (or itself if it has no group). Duplicates are deduplicated so the
  //    output stays small.
  const tokens = norm.split(' ');
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tok of tokens) {
    const group = TERM_TO_GROUP.get(tok);
    if (group) {
      for (const t of group) {
        if (!seen.has(t)) {
          seen.add(t);
          out.push(t);
        }
      }
    } else if (!seen.has(tok)) {
      seen.add(tok);
      out.push(tok);
    }
  }
  return { strict: norm, expanded: out.join(' ') };
}
