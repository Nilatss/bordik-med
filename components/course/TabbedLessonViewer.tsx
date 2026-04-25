'use client';

import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from '@/components/icons';
import TestPanel from './TestPanel';
import { CourseIllustration } from './CourseIllustrations';
import InlineQuiz from './InlineQuiz';
import DownloadableTable from './DownloadableTable';
import CourseProgressBar from './CourseProgressBar';

/**
 * Convert single-column tables that hold ℹ/⚠/📷/✓ callouts back into
 * blockquotes (so they render as styled callouts), and normalize dashes.
 * Multi-column tables are left untouched.
 */
function preprocessContent(md: string): string {
  // Replace em-dash / en-dash with hyphen
  let result = md.replace(/-/g, '-').replace(/-/g, '-');

  const lines = result.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
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
    while (j < lines.length && /^\|.+\|\s*$/.test(lines[j])) {
      tableLines.push(lines[j]);
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
      const firstEmoji = emojiMatch[1];
      const title = parts[0].replace(/^(ℹ|⚠|📷|✓|✅|🎯|💡)\s*/, '').trim();
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

function GlossaryView({ body }: { body: string }) {
  const { intro, terms } = parseGlossary(body);
  return (
    <div>
      {intro && (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#555',
          lineHeight: 1.65, marginBottom: 18,
        }}>
          {intro}
        </p>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 10,
      }}>
        {terms.map(({ term, def }, i) => (
          <div
            key={i}
            style={{
              background: '#F5F6F8',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
              color: '#1A1A1A', letterSpacing: '-0.01em', lineHeight: 1.3,
            }}>
              {term}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#4B5563',
              lineHeight: 1.55,
            }}>
              {def}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
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
    if (m) {
      foundFirstTerm = true;
      terms.push({ term: m[1].trim(), def: m[2].trim() });
    } else if (!foundFirstTerm) {
      intro.push(line);
    }
  }
  return { intro: intro.join(' '), terms };
}

const EMOJI_RE = /^(ℹ|⚠|📷|✓|✅|🎯|💡|i)\s*/;

/** Strip leading emoji/marker from the first text node of children tree. */
function stripLeadingEmoji(children: ReactNode): ReactNode {
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

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as { props: { children: ReactNode } }).props.children);
  }
  return '';
}

interface Props {
  content: string | null;
  courseId: string;
  showTests?: boolean;
}

export interface Tab {
  id: string;
  title: string;
  short: string;
  iconKey: string;
  body: string;
  kind?: 'tests' | 'selfcheck';
}

const TabIcon = ({ name, size = 16 }: { name: string; size?: number }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'intro':
      return (
        <svg {...common}>
          <path d="M12 2v6M4.93 4.93l4.24 4.24M2 12h6M4.93 19.07l4.24-4.24M12 22v-6M19.07 19.07l-4.24-4.24M22 12h-6M19.07 4.93l-4.24 4.24" />
        </svg>
      );
    case 'biology':
      return (
        <svg {...common}>
          <path d="M4 4c8 4 8 12 16 16M20 4c-8 4-8 12-16 16" />
          <path d="M6 6h4M14 6h4M6 18h4M14 18h4" />
        </svg>
      );
    case 'chemistry':
      return (
        <svg {...common}>
          <path d="M9 2v7.5L4 20a2 2 0 001.7 3h12.6a2 2 0 001.7-3L15 9.5V2" />
          <line x1="9" y1="2" x2="15" y2="2" />
          <line x1="8" y1="14" x2="16" y2="14" />
        </svg>
      );
    case 'physics':
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'math':
      return (
        <svg {...common}>
          <line x1="5" y1="5" x2="19" y2="5" />
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="5" y1="19" x2="19" y2="19" />
        </svg>
      );
    case 'psychology':
      return (
        <svg {...common}>
          <path d="M15.5 2A6.5 6.5 0 009 8.5c0 3 1.5 4.5 1.5 7v3A2.5 2.5 0 0013 21h.5A2.5 2.5 0 0016 18.5V16h1a2 2 0 002-2v-3a2 2 0 012-2 6.5 6.5 0 00-6.5-7z" />
        </svg>
      );
    case 'language':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
        </svg>
      );
    case 'learning':
      return (
        <svg {...common}>
          <path d="M22 10L12 4 2 10l10 6 10-6z" />
          <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
      );
    case 'glossary':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      );
    case 'tests':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9l2 2 4-4" />
          <line x1="8" y1="15" x2="16" y2="15" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
  }
};

/** Split markdown by top-level `# ` headings into tabs. */
export function splitIntoTabs(md: string): Tab[] {
  const lines = md.split('\n');
  const tabs: Tab[] = [];
  let current: Tab | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current) {
      current.body = buffer.join('\n').trim();
      tabs.push(current);
    }
  };

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      flush();
      const title = h1[1].trim();
      // Skip "Что дальше?" / "Заключение" sections entirely
      if (/заключ|что дальше/i.test(title)) {
        current = null;
        buffer = [];
        continue;
      }
      // Pick icon key and shortname based on subject
      let iconKey = 'intro';
      let short = title;

      if (/введение/i.test(title)) {
        iconKey = 'intro';
        short = 'Введение';
      } else if (/глоссарий/i.test(title)) {
        iconKey = 'glossary';
        short = 'Глоссарий';
      } else if (/контроль|самопровер/i.test(title)) {
        iconKey = 'check';
        short = 'Самопроверка';
        current = { id: `t${tabs.length}`, title, short, iconKey, body: '', kind: 'selfcheck' };
        buffer = [];
        continue;
      } else if (/биолог/i.test(title)) {
        iconKey = 'biology';
        short = 'Биология';
      } else if (/хим/i.test(title)) {
        iconKey = 'chemistry';
        short = 'Химия';
      } else if (/физик/i.test(title)) {
        iconKey = 'physics';
        short = 'Физика';
      } else if (/математик|статист/i.test(title)) {
        iconKey = 'math';
        short = 'Математика';
      } else if (/психолог/i.test(title)) {
        iconKey = 'psychology';
        short = 'Психология';
      } else if (/англ|язык/i.test(title)) {
        iconKey = 'language';
        short = 'Английский';
      } else if (/учить|обуч/i.test(title)) {
        iconKey = 'learning';
        short = 'Как учиться';
      } else {
        // Fallback: take text after "Тема N. " and before " - "
        const m = title.match(/^Тема\s+\d+\.?\s*(.+)$/i);
        const rest = (m ? m[1] : title).split(/[--:]/)[0].trim();
        short = rest.length > 22 ? rest.slice(0, 20) + '…' : rest;
      }

      current = { id: `t${tabs.length}`, title, short, iconKey, body: '' };
      buffer = [];
    } else {
      if (!current) {
        // Content before first h1 - skip or collect as intro
        continue;
      }
      buffer.push(line);
    }
  }
  flush();
  return tabs;
}

export default function TabbedLessonViewer({ content, courseId, showTests = true }: Props) {
  const tabs = useMemo(() => {
    const base = content ? splitIntoTabs(content) : [];
    if (showTests) {
      base.push({
        id: 'tests', title: 'Тесты по курсу', short: 'Тесты',
        iconKey: 'tests', body: '', kind: 'tests',
      });
    }
    return base;
  }, [content, showTests]);
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');

  if (!content) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 'var(--content-max)', padding: 'var(--space-8)' }}>
          <div style={{
            color: 'var(--md-sys-color-on-surface-variant)',
            marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'center',
          }}>
            <BookOpen size={40} strokeWidth={1} />
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 500,
            color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-2)',
          }}>
            Контент готовится
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6,
          }}>
            Статья для этого курса ещё не добавлена. Она появится здесь по мере наполнения.
          </p>
        </div>
      </div>
    );
  }

  // No tabs? Just render content as single article
  if (tabs.length <= 1) {
    return (
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div className="lesson-content" style={{ maxWidth: 'var(--content-max)' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const activeIndex = tabs.indexOf(active);
  const prevTab = tabs[activeIndex - 1];
  const nextTab = tabs[activeIndex + 1];

  return (
    <div className="rg-main-toc">
      {/* LEFT: Tab content — fade + slide on tab change */}
      <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
        style={{
        background: '#FFFFFF',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-6)',
        minHeight: 300,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 16, paddingBottom: 16,
          borderBottom: '1px solid #F0F0F0',
        }}>
          <span style={{ display: 'flex', color: '#1A1A1A' }}>
            <TabIcon name={active.iconKey} size={24} />
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.01em',
          }}>
            {active.title}
          </h2>
        </div>

        {active.kind === 'tests' ? (
          <TestPanel courseId={courseId} />
        ) : active.kind === 'selfcheck' ? (
          <InlineQuiz
            source={active.body}
            courseId={courseId}
            onNavigateToTab={(shortOrIcon) => {
              const target = tabs.find(
                (t) => t.short.toLowerCase() === shortOrIcon.toLowerCase() ||
                       t.iconKey === shortOrIcon
              );
              if (target) setActiveId(target.id);
            }}
          />
        ) : active.iconKey === 'glossary' ? (
          <GlossaryView body={active.body} />
        ) : (
          <div className="lesson-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children, node }) => {
                  const theadNode = (node as any)?.children?.find?.((c: any) => c.tagName === 'thead');
                  const thRow = theadNode?.children?.find?.((c: any) => c.tagName === 'tr');
                  const headersRaw: string[] = thRow?.children
                    ?.filter((c: any) => c.tagName === 'th')
                    ?.map((c: any) => extractText(c.children as never)) || [];
                  const headers = headersRaw.map((h) => h.toLowerCase());
                  const tbodyNode = (node as any)?.children?.find?.((c: any) => c.tagName === 'tbody');
                  const rowCount = tbodyNode?.children?.filter?.((c: any) => c.tagName === 'tr').length || 0;
                  const colCount = headers.length;

                  // Useful table criteria - show PDF button if ANY of:
                  // 1) Header contains reference/science keywords
                  // 2) Table is large (3+ cols AND 4+ rows) - likely reference data
                  const USEFUL_KEYWORDS = [
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
                    'вещество', 'элемент', 'реакци', 'соединени', 'ph\b',
                    // методы и процессы
                    'метод', 'процесс', 'применени', 'лечени', 'терапи',
                    // статистика / единицы
                    'единиц', 'размер', 'масштаб',
                  ];
                  const hasKeyword = headers.some((h) =>
                    USEFUL_KEYWORDS.some((kw) => new RegExp(kw).test(h))
                  );
                  const isLarge = colCount >= 3 && rowCount >= 4;
                  const isUseful = hasKeyword || isLarge;

                  if (!isUseful) return <table>{children}</table>;
                  // Build a descriptive title: "<Tab> - Col1 / Col2 / Col3"
                  const headerLabel = headersRaw.length > 0
                    ? headersRaw
                        .slice(0, 3)
                        .map((h) => h.trim())
                        .map((h) => h.charAt(0).toUpperCase() + h.slice(1))
                        .join(' / ')
                    : '';
                  const contextTitle = active?.short && active.short !== 'Введение'
                    ? active.short
                    : (active?.title || '').replace(/^Тема\s+\d+\.?\s*/, '').split(/[--]/)[0].trim();
                  const title = [contextTitle, headerLabel].filter(Boolean).join(' - ')
                    || headerLabel
                    || 'Справочная таблица';
                  return (
                    <DownloadableTable title={title}>
                      <table>{children}</table>
                    </DownloadableTable>
                  );
                },
                blockquote: ({ children }) => {
                  const text = extractText(children).trim();
                  let className = 'callout';
                  let icon = '';
                  let label = '';
                  if (text.startsWith('ℹ')) {
                    className += ' callout-info';
                    icon = 'ℹ';
                    label = 'Информация';
                  } else if (text.startsWith('⚠')) {
                    className += ' callout-warning';
                    icon = '⚠';
                    label = 'Важно';
                  } else if (text.startsWith('📷')) {
                    className += ' callout-image';
                    icon = '📷';
                    label = 'Иллюстрация';
                    const idMatch = text.match(/#(\d+\.\d+\.\d+)/);
                    const illustrationId = idMatch ? idMatch[1] : null;
                    return (
                      <blockquote className={className}>
                        <div className="callout-label">
                          <span>{label}</span>
                        </div>
                        {illustrationId && <CourseIllustration id={illustrationId} />}
                      </blockquote>
                    );
                  } else if (text.startsWith('✓') || text.startsWith('✅')) {
                    className += ' callout-success';
                    icon = '✓';
                    label = 'Главное';
                  } else if (text.startsWith('🎯')) {
                    className += ' callout-goal';
                    icon = '🎯';
                    label = 'Цель';
                  } else if (text.startsWith('💡')) {
                    className += ' callout-tip';
                    icon = '💡';
                    label = 'Совет';
                  }
                  return (
                    <blockquote className={className}>
                      {icon && (
                        <div className="callout-label">
                          <span>{label}</span>
                        </div>
                      )}
                      <div className="callout-body">{stripLeadingEmoji(children)}</div>
                    </blockquote>
                  );
                },
              }}
            >
              {preprocessContent(active.body)}
            </ReactMarkdown>
          </div>
        )}

        {/* Prev / Next */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', gap: 12,
          marginTop: 32, paddingTop: 20,
          borderTop: '1px solid #F0F0F0',
        }}>
          {prevTab ? (
            <button
              onClick={() => setActiveId(prevTab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 16px',
                background: '#F5F6F8', color: '#1A1A1A',
                border: 'none', borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                transition: 'background 180ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
            >
              ← {prevTab.short}
            </button>
          ) : <span />}
          {nextTab ? (
            <button
              onClick={() => setActiveId(nextTab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 16px',
                background: '#3B82F6', color: '#FFF',
                border: 'none', borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                transition: 'background 180ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#3B82F6'; }}
            >
              {nextTab.short} →
            </button>
          ) : null}
        </div>
      </motion.div>
      </AnimatePresence>

      {/* RIGHT: Tabs sidebar */}
      <aside className="toc-sidebar" style={{
        position: 'sticky', top: 20,
        background: '#F5F6F8',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 16,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          fontWeight: 600, color: '#888',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '4px 12px 6px',
        }}>
          Содержание
        </p>

        {/* Live progress — striped green bar identical to the intro page */}
        {tabs.length > 1 && (() => {
          const pct = Math.round(((activeIndex + 1) / tabs.length) * 100);
          return (
            <div style={{ padding: '0 12px 10px' }}>
              <CourseProgressBar
                pct={pct}
                currentLabel={`Тема ${activeIndex + 1}`}
                endLabel={`из ${tabs.length}`}
                startCaption="Старт"
                endCaption="Финал"
              />
            </div>
          );
        })()}
        {tabs.map((t, i) => {
          const isActive = t.id === active.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: 'transparent',
                color: isActive ? '#1A1A1A' : '#9CA3AF',
                border: 'none', borderRadius: 10,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--font-body)', fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#E8E9ED'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {isActive && (
                <motion.span
                  layoutId="toc-active-pill"
                  style={{
                    position: 'absolute', inset: 0,
                    background: '#FFFFFF',
                    borderRadius: 10,
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.04)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span style={{
                position: 'relative', zIndex: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: isActive ? '#3B82F6' : '#E2E4EA',
                color: isActive ? '#FFF' : '#9CA3AF',
                fontSize: 11.5, fontWeight: 700,
                transition: 'background 200ms ease, color 200ms ease',
              }}>
                {i + 1}
              </span>
              <span style={{
                position: 'relative', zIndex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {t.short}
              </span>
            </button>
          );
        })}
      </aside>
    </div>
  );
}
