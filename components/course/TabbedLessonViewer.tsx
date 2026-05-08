'use client';

import { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { useT } from '@/lib/i18n';
import { safeUrlTransform, sanitizeSchema } from '@/lib/safe-markdown';
// P1-CR-3 — pure helpers + 7 sub-components вынесены в lib/course/ +
// components/course/lesson/. Главный компонент сжат с 890 LOC до ~150.
import { preprocessContent } from '@/lib/course/lesson-utils';
import { splitIntoTabs } from '@/lib/course/lesson-tabs';
import { BookOpen } from '@/components/icons';
import TestPanel from './TestPanel';
import InlineQuiz from './InlineQuiz';
import { GlossaryView } from './lesson/GlossaryView';
import { LessonHeader } from './lesson/LessonHeader';
import { LessonNavigation } from './lesson/LessonNavigation';
import { LessonContent } from './lesson/LessonContent';
import { LessonTOC } from './lesson/LessonTOC';

// Re-export для backward compatibility — CoursePage.tsx импортирует
// { splitIntoTabs, type Tab } отсюда.
export { splitIntoTabs, type Tab } from '@/lib/course/lesson-tabs';
export { parseGlossary } from '@/lib/course/lesson-utils';

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
        <LessonHeader iconKey={active.iconKey} title={active.title} />

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
          <LessonContent
            body={activeBody}
            tabContext={{ short: active.short, title: active.title }}
          />
        )}

        <LessonNavigation
          prevTab={prevTab}
          nextTab={nextTab}
          onSelect={setActiveId}
        />
      </div>

      {/* RIGHT: Tabs sidebar — see LessonTOC for behaviour notes. */}
      <LessonTOC
        tabs={tabs}
        activeId={active.id}
        collapsed={tocCollapsed}
        onToggleCollapse={() => setTocCollapsed((v) => !v)}
        onSelect={setActiveId}
        onCollapseAfterSelect={() => setTocCollapsed(true)}
      />
    </div>
  );
}
