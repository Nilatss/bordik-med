#!/usr/bin/env node
/**
 * Converts `**FORMULA = expr**` → `` `FORMULA = expr` `` inside the
 * "### Формула" / "### Формулы" / "### Расчёт" sections of every runner.
 *
 * Why: ToolView CSS (.lesson-content.tool-info p:has(> code:only-child))
 * renders a paragraph that contains only a code element as a styled
 * «ФОРМУЛА» callout (blue card). Bold text doesn't trigger that — so
 * formulas authored as **bold** look like plain bold paragraphs and the
 * formula tab loses its visual identity.
 *
 * Heuristic — only convert bolded text that contains a formula operator
 * (=, +, ×, ÷, ·, ≤, ≥, /). This avoids destroying ordinary `**bold**`
 * emphasis on words like «Формула:» that happen to live inside the same
 * section.
 *
 * Usage:  node scripts/fix-formula-bold-to-code.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'lib', 'runners');
const DRY = process.argv.includes('--dry');

const SECTION_RE = /(###\s+(?:Формул[аы]|Расч[её]т|Уравнение)[^\n\\]*)/i;
// Strict heuristic: must contain `=` AND look like a real equation. This
// avoids false-positives like **CRL (7-13+6 нед)** where the +/- are part
// of a gestational-age range, not arithmetic.
const FORMULA_OPS = /=/;

/**
 * Splits the info markdown into sections by `### ...` headings, returns
 * array of { heading, body }. Also handles escaped newlines (\\n) and raw
 * newlines (\n) — runners use both depending on whether `info:` is a
 * template literal or a regular string.
 */
function splitByHeadings(text, isEscaped) {
  const NL = isEscaped ? '\\n' : '\n';
  // Strip Windows CR so headings/regex behave consistently. We don't write
  // these strings back as-is — the source file's overall CRLF endings stay
  // intact since we only edit the inner info content here.
  const lines = (isEscaped ? text : text.replace(/\r/g, '')).split(NL);
  const sections = [];
  let current = { heading: '', lines: [] };
  for (const line of lines) {
    if (/^###\s+/.test(line)) {
      sections.push(current);
      current = { heading: line, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections.map((s) => ({ heading: s.heading, body: s.lines.join(NL) }));
}

function joinSections(sections, isEscaped) {
  const NL = isEscaped ? '\\n' : '\n';
  return sections
    .map((s) => (s.heading ? s.heading + NL + s.body : s.body))
    .join(NL);
}

function transformBody(body, isEscaped) {
  // Inside a TS template literal a literal backtick must be escaped as
  // `\\\``. So when we write back to the source file, the raw two-char
  // sequence `\\\`` is what produces a single backtick in the runtime
  // string (which is what markdown then sees as inline code).
  // For escaped string literals ("...") backticks need NO escape.
  const BT = isEscaped ? '`' : '\\`';

  // Step 1: Replace **FORMULA = expr** with backtick-wrapped FORMULA when
  // the inner content contains an `=` — heuristic to avoid destroying
  // ordinary bold on labels.
  let out = body.replace(/\*\*([^*\n]{2,200}?)\*\*/g, (full, inner) => {
    if (FORMULA_OPS.test(inner)) {
      return BT + inner.trim() + BT;
    }
    return full;
  });

  // Step 2: Split single-line `formula` + " - description" onto separate
  // paragraphs so the CSS rule p:has(> code:only-child) fires on the
  // formula paragraph alone.
  // The "code" wrapper here is BT (which may be \` or `).
  const codePat = isEscaped
    ? /`[^`\n\\]+`/.source
    : /\\`[^`\n\\]+\\`/.source;

  if (isEscaped) {
    out = out.replace(
      new RegExp(`(\\\\n|^)(${codePat})\\s+[-—–]\\s+([^\\\\\\n]+?)(?=\\\\n|$)`, 'g'),
      (_, lead, code, desc) => `${lead}${code}\\n\\n${desc}`
    );
  } else {
    out = out.replace(
      new RegExp(`(\\r?\\n|^)(${codePat})\\s+[-—–]\\s+([^\\r\\n]+?)(?=\\r?\\n|$)`, 'g'),
      (_, lead, code, desc) => `${lead}${code}\n\n${desc}`
    );
  }

  return out;
}

function fixInfoBlock(infoText, isEscaped) {
  if (!SECTION_RE.test(infoText)) return infoText;
  const sections = splitByHeadings(infoText, isEscaped);
  let changed = false;
  for (const s of sections) {
    if (/Формул[аы]|Расч[её]т|Уравнение/i.test(s.heading)) {
      const newBody = transformBody(s.body, isEscaped);
      if (newBody !== s.body) {
        s.body = newBody;
        changed = true;
      }
    }
  }
  return changed ? joinSections(sections, isEscaped) : infoText;
}

/** Locate an info: "..." or info: `...` block and return [start, end, content, isEscaped]. */
function findInfoBlock(src) {
  // Template literal first (info: `...`) — multiline, raw newlines
  const tplMatch = src.match(/\binfo:\s*`([\s\S]*?)`/);
  if (tplMatch) {
    return {
      content: tplMatch[1],
      start: tplMatch.index + tplMatch[0].indexOf('`') + 1,
      end: tplMatch.index + tplMatch[0].length - 1,
      isEscaped: false,
    };
  }
  // String literal info: "..." — escaped newlines (\\n)
  const strMatch = src.match(/\binfo:\s*"((?:[^"\\]|\\.)*)"/);
  if (strMatch) {
    return {
      content: strMatch[1],
      start: strMatch.index + strMatch[0].indexOf('"') + 1,
      end: strMatch.index + strMatch[0].length - 1,
      isEscaped: true,
    };
  }
  return null;
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts');
let modified = 0;
const changed = [];

for (const file of files) {
  const path = join(DIR, file);
  const src = readFileSync(path, 'utf8');
  if (!/Формул[аы]|Расч[её]т|Уравнение/i.test(src)) continue;
  const block = findInfoBlock(src);
  if (!block) continue;

  const newContent = fixInfoBlock(block.content, block.isEscaped);
  if (newContent === block.content) continue;

  const newSrc = src.slice(0, block.start) + newContent + src.slice(block.end);
  modified++;
  changed.push(file);
  if (!DRY) writeFileSync(path, newSrc);
  console.log(`${DRY ? '[dry]' : '✓'} ${file}`);
}

console.log(`\n${DRY ? 'Would modify' : 'Modified'}: ${modified} / ${files.length} runners`);
