'use client';
/**
 * P1-CR-3 step 7/7 — Lesson TOC sidebar (table of contents).
 *
 * Mobile: collapsible с toggle-button показывающий current topic + index.
 * Desktop: всегда expanded (toc-static-title visible, toggle hidden via CSS).
 *
 * Active tab помечен:
 * - белый pill background через motion.span с layoutId='toc-active-pill'
 *   (smooth spring animation между переключениями)
 * - синий 3B82F6 кружок с index, белый текст
 * - text color #1A1A1A vs #9CA3AF inactive
 *
 * При клике на mobile (<= 1024px) auto-collapse'ит TOC — чтобы юзер
 * сразу увидел content без скрола.
 *
 * Live progress bar (CourseProgressBar) показывает % completion
 * (currentIndex+1 из total).
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '@/lib/i18n';
import type { Tab } from '@/lib/course/lesson-tabs';
import CourseProgressBar from '../CourseProgressBar';

interface LessonTOCProps {
  tabs: Tab[];
  activeId: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: (tabId: string) => void;
  onCollapseAfterSelect: () => void;
}

export function LessonTOC({
  tabs,
  activeId,
  collapsed,
  onToggleCollapse,
  onSelect,
  onCollapseAfterSelect,
}: LessonTOCProps) {
  const t = useT();
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  if (!active) return null;
  const activeIndex = tabs.indexOf(active);

  return (
    <aside
      className={`toc-sidebar${collapsed ? ' is-collapsed' : ''}`}
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
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
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

      {/* TOC body — animated open/close on mobile. Desktop CSS keeps visible. */}
      <AnimatePresence initial={false}>
        {!collapsed && (
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
                    onSelect(tab.id);
                    // Auto-collapse TOC on mobile so the user immediately sees
                    // the topic content; on desktop the accordion stays open.
                    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches) {
                      onCollapseAfterSelect();
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
  );
}
