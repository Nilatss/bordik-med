/**
 * Markdown rendering for ToolView info-tabs.
 *
 * P1-CR-3 step 2/8 — extracted from ToolView.tsx.
 *
 * Includes:
 *   - `withSexBadges` — wrap ♂/♀ runs in coloured badge spans
 *   - `preprocessToolContent` — convert emoji-prefixed paragraphs into
 *     blockquotes (so they render as `.callout-*` styled cards)
 *   - `MemoisedMarkdown` — React-memoised wrapper around `react-markdown`
 *     with rehype-sanitize + safe URL transform
 *
 * Visual styling is in `globals.css` (`.callout-*`, `.sex-badge`,
 * `.table-scroll`). All callouts share the lesson-content visual language.
 */
import React, { useMemo, Children, isValidElement, cloneElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { safeUrlTransform, sanitizeSchema } from '@/lib/safe-markdown';

/**
 * Walk React children recursively. When a string contains ♂/♀, split and wrap
 * those symbols in coloured badge spans.
 */
export function withSexBadges(children: React.ReactNode): React.ReactNode {
  if (children == null) return children;
  if (typeof children === 'string') {
    if (!/[♂♀]/.test(children)) return children;
    const parts: React.ReactNode[] = [];
    let buffer = '';
    let keyCounter = 0;
    for (const ch of children) {
      if (ch === '♂' || ch === '♀') {
        if (buffer) { parts.push(buffer); buffer = ''; }
        parts.push(
          <span
            key={`sx-${keyCounter++}`}
            className={ch === '♂' ? 'sex-badge sex-m' : 'sex-badge sex-f'}
            aria-label={ch === '♂' ? 'мужчины' : 'женщины'}
          >{ch}</span>
        );
      } else {
        buffer += ch;
      }
    }
    if (buffer) parts.push(buffer);
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }
  if (Array.isArray(children)) {
    return children.map((c, i) => {
      const wrapped = withSexBadges(c);
      if (wrapped == null || typeof wrapped === 'string' || typeof wrapped === 'number') {
        return <React.Fragment key={i}>{wrapped}</React.Fragment>;
      }
      return <React.Fragment key={i}>{wrapped}</React.Fragment>;
    });
  }
  return children;
}

/**
 * Callout helpers — keep the visual language identical to course pages.
 * Source paragraphs that begin with ℹ, ⚠, ✓, 💡, 🎯, 📷 are transformed into
 * blockquotes and then rendered with the same `.callout-*` classes used in
 * lesson-content.
 */
export const CALLOUT_EMOJI_RE = /^(ℹ|⚠️|⚠|📷|✓|✅|🎯|💡)\s*/;

/** Convert paragraphs that start with a callout emoji into blockquotes. */
export function preprocessToolContent(md: string): string {
  if (!md) return md;
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    const m = line.match(/^([ℹ⚠✓✅🎯💡📷]|⚠️)\s*(.*)$/);
    // Only convert if this paragraph isn't already a blockquote / list / heading
    if (m && !line.startsWith('>') && !line.startsWith('#') && !line.startsWith('-')) {
      // Gather the paragraph (consecutive non-empty lines)
      const paraLines = [m[0]];
      i++;
      while (i < lines.length) {
        const li = lines[i];
        if (!li || li.trim() === '' || li.startsWith('#')
            || li.startsWith('|') || li.match(/^[ℹ⚠✓✅🎯💡📷]/)) break;
        paraLines.push(li);
        i++;
      }
      for (const p of paraLines) out.push('> ' + p);
      out.push(''); // blank line after blockquote
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

/** Strip leading emoji/marker from the first text node of a children tree. */
function stripLeadingEmoji(children: ReactNode): ReactNode {
  const arr = Children.toArray(children);
  for (let idx = 0; idx < arr.length; idx++) {
    const el = arr[idx];
    if (typeof el === 'string') {
      const stripped = el.replace(CALLOUT_EMOJI_RE, '');
      if (stripped !== el) { arr[idx] = stripped; return arr; }
      if (el.trim() === '') continue;
      return arr;
    }
    if (isValidElement(el)) {
      const props = (el as { props: { children: ReactNode } }).props;
      const newChildren = stripLeadingEmoji(props.children);
      if (newChildren !== props.children) {
        arr[idx] = cloneElement(el as React.ReactElement<{ children?: ReactNode }>, {}, newChildren);
        return arr;
      }
      return arr;
    }
  }
  return arr;
}

function extractTextFromChildren(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTextFromChildren).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractTextFromChildren((node as { props: { children: ReactNode } }).props.children);
  }
  return '';
}

/**
 * `react-markdown` component overrides. Post-processing: wrap ♂/♀ в coloured
 * badges; convert emoji-prefixed blockquotes into styled callouts matching
 * course layout. All visual styling в `globals.css` (`.callout-*`).
 */
const mdComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p>{withSexBadges(children)}</p>,
  li: ({ children }: { children?: React.ReactNode }) => <li>{withSexBadges(children)}</li>,
  td: ({ children }: { children?: React.ReactNode }) => <td>{withSexBadges(children)}</td>,
  th: ({ children }: { children?: React.ReactNode }) => <th>{withSexBadges(children)}</th>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong>{withSexBadges(children)}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em>{withSexBadges(children)}</em>,
  // Все таблицы оборачиваем в .table-scroll wrapper, чтобы 4+ колонки
  // не обрезались справа на узких контентных колонках.
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => {
    const text = extractTextFromChildren(children).trim();
    let className = 'callout';
    let icon = '', label = '';
    if (text.startsWith('ℹ')) { className += ' callout-info'; icon = 'ℹ'; label = 'Информация'; }
    else if (text.startsWith('⚠')) { className += ' callout-warning'; icon = '⚠'; label = 'Важно'; }
    else if (text.startsWith('✓') || text.startsWith('✅')) { className += ' callout-success'; icon = '✓'; label = 'Главное'; }
    else if (text.startsWith('🎯')) { className += ' callout-goal'; icon = '🎯'; label = 'Цель'; }
    else if (text.startsWith('💡')) { className += ' callout-tip'; icon = '💡'; label = 'Совет'; }
    return (
      <blockquote className={className}>
        {icon && (<div className="callout-label"><span>{label}</span></div>)}
        <div className="callout-body">{stripLeadingEmoji(children)}</div>
      </blockquote>
    );
  },
};

/**
 * Memoised markdown renderer for info tabs. `preprocessToolContent` does
 * string manipulation (10+ regex passes); without memoisation it ran on
 * every ToolView render, including calculator input changes.
 */
export const MemoisedMarkdown = React.memo(function MemoisedMarkdown({ body }: { body: string }) {
  const processed = useMemo(() => preprocessToolContent(body), [body]);
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, sanitizeSchema]]} urlTransform={safeUrlTransform} components={mdComponents}>
      {processed}
    </ReactMarkdown>
  );
});
