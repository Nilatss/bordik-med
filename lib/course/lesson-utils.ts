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
export function preprocessContent(md: string): string {
  // Replace em-dash / en-dash with hyphen
  let result = md.replace(/-/g, '-').replace(/-/g, '-');

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

/** Parse a glossary block (plain-text "Term: description" lines) into cards data */
export function parseGlossary(body: string): { intro: string; terms: { term: string; def: string }[] } {
  const GLOSSARY_RE = /^([A-Za-zА-ЯЁа-яё0-9][A-Za-zА-ЯЁа-яё0-9 \-()/+]{1,40}):\s+(.+)$/;
  const lines = body.split('\n');
  const intro: string[] = [];
  const terms: { term: string; def: string }[] = [];
  let foundFirstTerm = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(GLOSSARY_RE);
    if (m && m[1] && m[2]) {
      foundFirstTerm = true;
      terms.push({ term: m[1].trim(), def: m[2].trim() });
    } else if (!foundFirstTerm) {
      intro.push(line);
    }
  }
  return { intro: intro.join(' '), terms };
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
