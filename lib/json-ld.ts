/**
 * Serialise a JSON-LD object for safe embedding inside an inline
 * `<script type="application/ld+json">` via `dangerouslySetInnerHTML`.
 *
 * `JSON.stringify` alone is NOT safe here: if any string value contains the
 * sequence `</script>` (or a lone `<`), the browser's HTML parser ends the
 * script element early and treats the remainder as markup — a stored-XSS
 * vector whenever any field is attacker-influenced (drug names, article
 * titles, ICD descriptions, tool inputs reflected into structured data).
 *
 * We escape the three HTML-significant characters plus the two Unicode line
 * terminators that are legal in JSON strings but break an inline `<script>`
 * (U+2028 / U+2029). The output stays valid JSON — JSON parsers read the
 * `\uXXXX` escapes back to the original characters — so search engines still
 * consume the structured data correctly.
 */
export function jsonLdHtml(data: unknown): string {
  // U+2028 LINE SEPARATOR / U+2029 PARAGRAPH SEPARATOR: legal inside JSON
  // strings but terminate an inline <script>. Built via fromCharCode so the
  // raw code points never appear literally in this source file.
  const LS = String.fromCharCode(0x2028);
  const PS = String.fromCharCode(0x2029);
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(LS).join('\\u2028')
    .split(PS).join('\\u2029');
}
