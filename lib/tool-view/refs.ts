/**
 * Reference / citation cleanup helpers for ToolView.
 *
 * P1-CR-3 step 5/8 — extracted from ToolView.tsx.
 *
 * Runner `reference` поля смешивают bibliographic citation с formula
 * details / doses / thresholds. Эти helpers separate их.
 */

/**
 * Full citation cleanup for the «Источник» tab body.
 * Keeps author + journal + year, strips formulas/doses/threshold values.
 * Year (4-digit) is preserved.
 */
export function cleanReference(ref: string): string {
  if (!ref) return '';
  // Remove obvious formulas like "= ... expr ..." / ": value threshold stuff"
  // but keep if the segment contains a 4-digit year.
  const segments = ref.split(/\.\s+/).map((s) => s.trim()).filter(Boolean);
  const keep: string[] = [];
  for (const seg of segments) {
    // Drop segments that are pure thresholds/formulas (no year, contain math/drug dosing)
    const hasYear = /\b(19|20)\d{2}\b/.test(seg);
    const isFormulaOrDose = /[×÷∑√=<>≤≥±]|\bмг\b|\bмл\b|\bкг\b|\bч\b|мг\/|мл\/|кг\/|мм рт/.test(seg);
    if (isFormulaOrDose && !hasYear) continue;
    // Inside a kept segment, still trim after formula markers
    const clean = seg.replace(/[:=][^.]*?([×÷=<>≤≥][^.]*)/, '').replace(/\s{2,}/g, ' ').trim();
    if (clean) keep.push(clean);
  }
  return keep.join('. ') + (keep.length ? '.' : '');
}

/**
 * Extract just the citation (author + optional year + journal) from the reference string.
 * Strip formulas, thresholds, drug doses и всё что isn't bibliographic.
 *
 * Examples:
 *   "Antman EM. JAMA 2000. TIMI Risk Score for UA/NSTEMI." → "Antman EM. JAMA 2000"
 *   "ВОЗ: <18.5 / 18.5-24.9 / 25-29.9 / ≥30. Азия: 23 и 27.5." → "ВОЗ"
 *   "Parkland (Baxter): 4 мл × %TBSA × кг Ringer за 24 ч..." → "Parkland (Baxter)"
 */
export function shortRef(ref: string): string {
  if (!ref) return '';
  // Split by sentence; citation usually первое предложение.
  // Keep только first sentence, потом strip content после: colon, equals, formula chars.
  let s = ref.split(/\.\s/)[0] ?? ref;

  // Remove anything after formula/value markers
  s = s.replace(/[:=].*$/, '')           // "ВОЗ: <18.5 / 18.5..." → "ВОЗ"
       .replace(/\s-\s.*$/, '')          // "Wells 2001 - алгоритм..." → "Wells 2001"
       .replace(/\s-\s.*$/, '');         // same with hyphen

  // If still contains formula characters, keep only up to first one
  const formulaMatch = s.match(/^(.+?)[×÷∑√=<>≤≥±][^.]*$/);
  if (formulaMatch && formulaMatch[1]) s = formulaMatch[1].trim();

  // Drop trailing punctuation and collapse whitespace
  s = s.replace(/[,;:\s]+$/, '').trim();

  // If looks like just a list of abbreviations without author, keep as-is but max 50 chars
  if (s.length > 50) s = s.slice(0, 50).replace(/[,\s]+$/, '') + '…';
  return s;
}
