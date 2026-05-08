'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/lib/i18n';
import { safeUrlTransform, sanitizeSchema } from '@/lib/safe-markdown';
// P1-CR-3 — pure helpers вынесены в lib/course/. Уменьшает главный
// компонент с 890 LOC до ~600. См. также lesson-tabs.ts (Tab + splitIntoTabs).
import {
  preprocessContent,
  parseGlossary,
  stripLeadingEmoji,
  extractText,
} from '@/lib/course/lesson-utils';
import { splitIntoTabs, type Tab } from '@/lib/course/lesson-tabs';
import { BookOpen } from '@/components/icons';
import TestPanel from './TestPanel';
import { CourseIllustration } from './CourseIllustrations';
import InlineQuiz from './InlineQuiz';
import DownloadableTable from './DownloadableTable';
import CourseProgressBar from './CourseProgressBar';
import { TabIcon } from './lesson/TabIcon';

// Re-export для backward compatibility — CoursePage.tsx импортирует
// { splitIntoTabs, type Tab } отсюда.
export { splitIntoTabs, type Tab } from '@/lib/course/lesson-tabs';
export { parseGlossary } from '@/lib/course/lesson-utils';

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

interface Props {
  content: string | null;
  courseId: string;
  showTests?: boolean;
}

export default function TabbedLessonViewer({ content, courseId, showTests = true }: Props) {
  const t = useT();
  const tabs = useMemo(() => {
    const base = content ? splitIntoTabs(content) : [];
    if (showTests) {
      base.push({
        id: 'tests',
        title: t('course.toc.tabTests'),
        short: t('course.toc.tabTestsShort'),
        iconKey: 'tests', body: '', kind: 'tests',
      });
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, showTests]);
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');

  // P1-PERF-NEW-2 — memoize preprocessContent. Без useMemo функция
  // (em-dash replace + multi-pass scan по строкам таблиц) пересчитывалась
  // на каждом ре-рендере viewer'а (resize, hover state, scroll-tracking),
  // даже если активная вкладка не менялась. Тяжёлый кейс: lesson 'patient
  // safety' с 6 callout-таблицами ~70k chars, ~6ms на пересчёт ×30Hz =
  // 18% main-thread budget на анимациях.
  //
  // ВАЖНО: useMemo стоит ДО early-return'ов ниже (`if (!content)`,
  // `if (tabs.length <= 1)`), иначе rules-of-hooks ругается на
  // conditional hook-call. activeBody — '' для случаев, когда tab не
  // найден (defensive, не обязан рендериться).
  const activeBody = useMemo(() => {
    const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
    return active ? preprocessContent(active.body) : '';
  }, [tabs, activeId]);

  // TOC defaults: closed on mobile, open on desktop. A media-query listener
  // keeps the state in sync with viewport changes (resize / orientation).
  const [tocCollapsed, setTocCollapsed] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1025px)');
    setTocCollapsed(!mq.matches);
    const onChange = (e: MediaQueryListEvent) => setTocCollapsed(!e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Scroll to top of the topic content whenever the user switches tabs.
  // On mobile we want to land on the topic title (lesson-card), not on
  // the long course header — scroll the lesson-card into view at the top
  // of the visible viewport.
  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const isMobile = typeof window !== 'undefined'
      && window.matchMedia('(max-width: 1024px)').matches;
    if (isMobile) {
      const card = main.querySelector('.lesson-card');
      if (card) {
        const offset = (card as HTMLElement).offsetTop - 8;
        main.scrollTo({ top: offset, behavior: 'smooth' });
        return;
      }
    }
    main.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

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
            {t('course.contentNotReady.title')}
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
            color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6,
          }}>
            {t('course.contentNotReady.body')}
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
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeSanitize, sanitizeSchema]]} urlTransform={safeUrlTransform}>{content}</ReactMarkdown>
        </div>
      </div>
    );
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  // Defensive: tabs.length checked above means tabs[0] is defined, but
  // TS doesn't narrow that through ??. The early-return below pacifies
  // strict-index without changing runtime behaviour.
  if (!active) return null;
  const activeIndex = tabs.indexOf(active);
  const prevTab = tabs[activeIndex - 1];
  const nextTab = tabs[activeIndex + 1];

  return (
    <div className="rg-main-toc">
      {/* LEFT: Tab content. The previous fade+slide AnimatePresence kept the
           old content on screen for 250 ms while the new ReactMarkdown
           re-parsed and re-rendered (10–50 KB of markdown with a heavy
           custom component map) — that work blocked the main thread and
           caused other animations on the page (progress bar spring) to
           visibly stutter. Switching tabs instantly is far smoother. */}
      <div
        key={active.id}
        className="lesson-card"
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
              rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
              urlTransform={safeUrlTransform}
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

                  if (!isUseful) {
                    // Простые таблицы тоже оборачиваем в scroll-wrapper —
                    // на узких контентных колонках (когда рядом TOC-сайдбар)
                    // 4+ колонки иначе обрезаются справа.
                    return (
                      <div className="table-scroll">
                        <table>{children}</table>
                      </div>
                    );
                  }
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
                    : ((active?.title || '').replace(/^Тема\s+\d+\.?\s*/, '').split(/[--]/)[0] ?? '').trim();
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
              {activeBody}
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
      </div>

      {/* RIGHT: Tabs sidebar.
          On mobile the body is collapsed by default — header acts as a
          toggle that shows current topic + progress and expands the full
          list on tap. CSS keeps everything visible on desktop regardless. */}
      <aside
        className={`toc-sidebar${tocCollapsed ? ' is-collapsed' : ''}`}
        style={{
          position: 'sticky', top: 20,
          background: '#F5F6F8',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 16,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}
      >
        {/* Mobile-only toggle header. Desktop CSS hides it. */}
        <button
          type="button"
          className="toc-toggle"
          onClick={() => setTocCollapsed((v) => !v)}
          aria-expanded={!tocCollapsed}
        >
          <span className="toc-toggle-label">
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 11,
              fontWeight: 600, color: '#888',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {t('course.toc.title')}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              color: '#1A1A1A',
            }}>
              {active.short} · {activeIndex + 1}/{tabs.length}
            </span>
          </span>
          <span className="toc-toggle-chevron">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </button>

        {/* Desktop static label */}
        <p className="toc-static-title" style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          fontWeight: 600, color: '#888',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '4px 12px 6px',
        }}>
          {t('course.toc.title')}
        </p>

        {/* TOC body — animated open/close on mobile (the .is-collapsed CSS
            class controls visibility on desktop = always open). framer-motion
            animates height so the unfold matches the rest of the app. */}
        <AnimatePresence initial={false}>
          {!tocCollapsed && (
            <motion.div
              key="toc-body"
              className="toc-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 4 }}
            >
        {/* Live progress — striped green bar identical to the intro page */}
        {tabs.length > 1 && (() => {
          const pct = Math.round(((activeIndex + 1) / tabs.length) * 100);
          return (
            <div style={{ padding: '0 12px 10px' }}>
              <CourseProgressBar
                pct={pct}
                currentLabel={t('course.intro.topicN', { n: activeIndex + 1 })}
                endLabel={t('course.progress.ofTotal', { n: tabs.length })}
                startCaption={t('course.progress.start')}
                endCaption={t('course.progress.final')}
              />
            </div>
          );
        })()}
        {tabs.map((tab, i) => {
          const isActive = tab.id === active.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveId(tab.id);
                // Auto-collapse TOC on mobile so the user immediately sees
                // the topic content; on desktop the accordion stays open.
                if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches) {
                  setTocCollapsed(true);
                }
              }}
              className={`toc-tab${isActive ? ' is-active' : ''}`}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                color: isActive ? '#1A1A1A' : '#9CA3AF',
                border: 'none', borderRadius: 10,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--font-body)', fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                transition: 'color 200ms ease',
              }}
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
                {tab.short}
              </span>
            </button>
          );
        })}
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
