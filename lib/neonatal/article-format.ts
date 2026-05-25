/**
 * Pure article-formatting helpers for the neonatal handbook.
 *
 * Extracted out of the 4900-LOC `components/neonatal/NeonatalHandbook.tsx`
 * so the logic is unit-testable without rendering the component. The
 * component imports `stripDuplicateArticleSections` from here.
 */

/**
 * stripDuplicateArticleSections — removes the trailing `## Источники`
 * and `## Калькуляторы Bordik` sections from an article's markdown body.
 *
 * Background: many articles in `neonatal-articles.json` end with these
 * two sections in the markdown content AND also populate the structured
 * `article.references[]` + `article.related_calculators[]` arrays. The
 * card renders the structured arrays as proper UI chips/lists below the
 * body, so the duplicate bottom blocks in the body would be shown TWICE
 * to the clinician (audit: 2026-05-19 user feedback on /articles).
 *
 * Strip rules — case-insensitive, matches both Cyrillic and Latin
 * variants seen in the data. Cuts from the first matching heading to
 * end-of-content. Falls back to the full content if no heading is
 * found, so it's safe on articles that legitimately don't include
 * these sections.
 */
export function stripDuplicateArticleSections(content: string): string {
  // Match `## Heading` on a line by itself (modulo trailing whitespace),
  // where Heading is exactly one of the dedup'd labels — must NOT continue
  // with more words ("## Источники инфекции" is a legitimate clinical
  // heading and stays). Multiline-mode `$` requires end-of-line after
  // the keyword. Then `[\s\S]*` consumes everything to end of content.
  const re = /\s*^##\s+(?:Источники|References?|Источник|Калькуляторы\s+Bordik|Related\s+calculators?)\s*$[\s\S]*$/im;
  return content.replace(re, '').trimEnd();
}
