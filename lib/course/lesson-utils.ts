/**
 * P1-CR-3 — Pure utility functions extracted from TabbedLessonViewer.
 *
 * Все функции в этом файле — pure (никаких React-зависимостей, только
 * string/markdown manipulation). Перенесены чтобы:
 *   1. Sub-components могли импортировать их без cycle через
 *      TabbedLessonViewer.tsx
 *   2. Tests можно писать без mounting React tree
 *   3. Главный компонент уменьшается с 890 LOC до ~200
 */

import type { ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

/**
 * Convert single-column tables that hold ℹ/⚠/📷/✓ callouts back into
 * blockquotes (so they render as styled callouts), and normalize dashes.
 * Multi-column tables are left untouched.
 */
/**
 * Convert a run of ≥3 consecutive `**Термин**: значение` lines into a
 * 2-column GFM table (Показатель | Значение).
 *
 * Why: markdown joins consecutive non-blank lines into ONE paragraph
 * (soft breaks → spaces), so a "reference values" appendix written as
 * 20 bold-term lines rendered as a single unreadable wall of text
 * (user report 2026-05-19: "что это за груда текста"). A table makes
 * each parameter scannable. Runs shorter than 3 are left alone — they
 * are usually inline emphasis inside prose, not a definition list.
 */
function convertDefinitionLists(md: string): string {
  const DEF_RE = /^\*\*(.+?)\*\*:\s*(.+?)\s*$/;
  const lines = md.split('\n');
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    // Collect a maximal run of consecutive definition lines.
    const run: { term: string; value: string }[] = [];
    let j = i;
    while (j < lines.length) {
      const m = (lines[j] ?? '').match(DEF_RE);
      if (!m || !m[1] || !m[2]) break;
      run.push({ term: m[1].trim(), value: m[2].trim() });
      j++;
    }
    if (run.length >= 3) {
      const esc = (s: string) => s.replace(/\|/g, '\\|');
      // Blank line before the table so markdown starts a fresh block.
      if (out.length > 0 && out[out.length - 1]?.trim() !== '') out.push('');
      out.push('| Показатель | Значение |');
      out.push('| --- | --- |');
      for (const { term, value } of run) {
        out.push(`| **${esc(term)}** | ${esc(value)} |`);
      }
      out.push(''); // blank line after the table
      i = j - 1;
      continue;
    }
    out.push(lines[i] ?? '');
  }
  return out.join('\n');
}

export function preprocessContent(md: string): string {
  // Normalize long dashes (em —, en –, horizontal bar ―, figure ‒, minus −)
  // to a plain hyphen. User request 2026-05-19: no long dashes anywhere on
  // the site. Numeric ranges (1990–2003) get a tight hyphen, prose dashes a
  // spaced hyphen. NOTE: a previous edit lost the literal dash chars from
  // this line (mojibake → "-".replace("-","-") no-op); restored explicitly.
  let result = md
    .replace(/(\d)\s*[‒–—―−]\s*(\d)/g, '$1-$2')
    .replace(/\s*[‒–—―−]\s*/g, ' - ');

  // Definition-list runs → tables (before callout/table detection below).
  result = convertDefinitionLists(result);

  const lines = result.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const next = lines[i + 1] ?? '';

    // Detect a table start: header row `| ... |` followed by separator `| --- | ... |`
    const isHeader = /^\|.+\|\s*$/.test(line) && /^\|\s*---/.test(next);
    if (!isHeader) {
      out.push(line);
      continue;
    }

    // Read full table block
    const tableLines: string[] = [line, next];
    let j = i + 2;
    while (j < lines.length) {
      const li = lines[j];
      if (!li || !/^\|.+\|\s*$/.test(li)) break;
      tableLines.push(li);
      j++;
    }
    // Column count from separator
    const sepCells = next.split('|').slice(1, -1);
    const colCount = sepCells.length;

    // Single column + first row contains ℹ/⚠/📷/✓ -> callout
    const headerText = line.replace(/^\|\s*|\s*\|$/g, '').trim();
    const emojiMatch = headerText.match(/^(ℹ|⚠|📷|✓|✅|🎯|💡)\s*(.*)$/);
    if (colCount === 1 && emojiMatch) {
      // Split title from body via <br>
      const parts = headerText.split(/<br>/i).map((s) => s.trim()).filter(Boolean);
      const firstEmoji = emojiMatch[1] ?? '';
      const title = (parts[0] ?? '').replace(/^(ℹ|⚠|📷|✓|✅|🎯|💡)\s*/, '').trim();
      // Unescape \| (used in source to protect pipes inside table cells) → |
      const unescape = (s: string) => s.replace(/\\\|/g, '|');
      const body = parts.slice(1).map(unescape).map((p) => {
        // If a line has ` | ` separators, it's a definition list - render as bullet list
        if (/ \| /.test(p) && !/^(Пример|Важно|Значит|Итог|Запомни)[:：]/i.test(p)) {
          const items = p.split(/ \| /).map((s) => s.trim()).filter(Boolean);
          if (items.length >= 2) {
            return items.map((it) => `- ${it}`).join('\n> ');
          }
        }
        // Bold leading keyword like "Пример:", "Значит:", "Итог:", "Запомни:" etc.
        return p.replace(/^(Пример|Важно|Значит|Итог|Запомни|Вывод|Ключевое|Правило|Формула|Факт|Совет|Внимание)([:：])\s*/i,
          '**$1$2** ');
      });
      const bqLines = [`${firstEmoji} **${title}**`, ...body];
      // Join with `>\n>` to create blank line between paragraphs inside blockquote
      out.push(bqLines.map((l) => '> ' + l).join('\n>\n'));
      out.push('');
      i = j - 1;
      continue;
    }

    // Regular table - keep as is
    for (const tl of tableLines) out.push(tl);
    i = j - 1;
  }

  return out.join('\n');
}

/** Parse a glossary block into cards data.
 *
 * Two source formats are recognised:
 *   1. `Term: description`            — colon-separated plain text
 *   2. `- **Term** (etymology) — def` — markdown bullet with a bold term,
 *      optional parenthetical etymology, em-dash definition (the format
 *      used by the imported довузовые courses). The term keeps just the
 *      bold text; the etymology + definition become the card body and may
 *      contain inline markdown (`*italic*`) rendered by the view.
 *
 * Leading non-term lines → `intro`, trailing non-term lines → `outro`
 * (so a closing paragraph after the term list isn't dropped — that would
 * silently lose author content). Both render as markdown in the view.
 */
export function parseGlossary(body: string): { intro: string; outro: string; terms: { term: string; def: string }[] } {
  const COLON_RE = /^([A-Za-zА-ЯЁа-яё0-9][A-Za-zА-ЯЁа-яё0-9 \-()/+]{1,40}):\s+(.+)$/;
  const BULLET_RE = /^[-*]\s+\*\*(.+?)\*\*\s*(.*)$/;
  const lines = body.split('\n');
  const intro: string[] = [];
  const outro: string[] = [];
  const terms: { term: string; def: string }[] = [];
  let foundFirstTerm = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // Skip a leaked module footer line ("- Конец Модуля 1.2 -") if present.
    if (/^-\s*Конец Модуля/i.test(line)) continue;

    const bullet = line.match(BULLET_RE);
    if (bullet && bullet[1]) {
      foundFirstTerm = true;
      const term = bullet[1].trim();
      // Strip a leading em-dash from the remainder so "— def" → "def".
      const def = (bullet[2] ?? '').replace(/^[—–-]\s*/, '').trim();
      terms.push({ term, def });
      continue;
    }
    const colon = line.match(COLON_RE);
    if (colon && colon[1] && colon[2]) {
      foundFirstTerm = true;
      terms.push({ term: colon[1].trim(), def: colon[2].trim() });
      continue;
    }
    // Non-term prose: before the first term it's intro, after it's outro.
    if (foundFirstTerm) outro.push(line);
    else intro.push(line);
  }
  return { intro: intro.join(' '), outro: outro.join(' '), terms };
}

export const EMOJI_RE = /^(ℹ|⚠|📷|✓|✅|🎯|💡|i)\s*/;

/** Strip leading emoji/marker from the first text node of children tree. */
export function stripLeadingEmoji(children: ReactNode): ReactNode {
  const arr = Children.toArray(children);
  for (let i = 0; i < arr.length; i++) {
    const el = arr[i];
    if (typeof el === 'string') {
      const stripped = el.replace(EMOJI_RE, '');
      if (stripped !== el) {
        arr[i] = stripped;
        return arr;
      }
      if (el.trim() === '') continue;
      return arr;
    }
    if (isValidElement(el)) {
      const props = (el as { props: { children: ReactNode } }).props;
      const newChildren = stripLeadingEmoji(props.children);
      if (newChildren !== props.children) {
        arr[i] = cloneElement(el as React.ReactElement<{ children?: ReactNode }>, {}, newChildren);
        return arr;
      }
      return arr;
    }
  }
  return arr;
}

/** Recursively extract text content from a React node tree. */
export function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children: ReactNode } }).props.children);
  }
  return '';
}

/**
 * "Useful table" keyword list — a table whose header row matches one of
 * these gets a PDF-download button (see CLAUDE.md → "Стандарты продукта
 * → PDF-скачивание таблиц"). Callers lowercase headers before matching.
 */
export const USEFUL_TABLE_KEYWORDS = [
  // словари / термины
  'корень', 'префикс', 'суффикс', 'термин', 'аббревиат', 'обозначени',
  // нормы и значения
  'норма', 'референс', 'диапазон', 'показател',
  // препараты
  'препарат', 'дозировк', 'доза', 'лекарств', 'действующ',
  // формулы / классификации
  'формула', 'классификаци', 'стадия', 'стадии', 'шкала', 'балл', 'градац',
  // симптомы / диагнозы
  'симптом', 'синдром', 'критери', 'признак',
  'этиологи', 'патоген', 'заболеван', 'болезн', 'диагноз', 'диагностик',
  // анатомия / физиология
  'орган', 'систем', 'функция', 'роль', 'структур', 'ткань',
  // химия / физика
  'вещество', 'элемент', 'реакци', 'соединени', 'ph\\b',
  // методы и процессы
  'метод', 'процесс', 'применени', 'лечени', 'терапи',
  // статистика / единицы
  'единиц', 'размер', 'масштаб',
];

/** True if any header matches one of USEFUL_TABLE_KEYWORDS. `headers`
 *  should already be lowercased by the caller — matching is regex-based
 *  (not a plain substring check) so patterns like 'ph\\b' work. */
export function hasUsefulTableKeyword(headers: string[]): boolean {
  return headers.some((h) => USEFUL_TABLE_KEYWORDS.some((kw) => new RegExp(kw).test(h)));
}
