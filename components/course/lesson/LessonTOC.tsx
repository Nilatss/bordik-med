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
      className={`toc-sidebar sticky top-5 bg-[#F5F6F8] rounded-[var(--md-sys-shape-corner-extra-large)] p-4 flex flex-col gap-1${collapsed ? ' is-collapsed' : ''}`}
    >
      {/* Mobile-only toggle header. Desktop CSS hides it. */}
      <button
        type="button"
        className="toc-toggle"
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
      >
        <span className="toc-toggle-label">
          <span className="font-[var(--font-body)] text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em]">
            {t('course.toc.title')}
          </span>
          <span className="font-[var(--font-body)] text-[13px] font-semibold text-[#1A1A1A]">
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
      <p className="toc-static-title font-[var(--font-body)] text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em] pt-1 px-3 pb-1.5">
        {t('course.toc.title')}
      </p>

      {/* TOC body — animated open/close on mobile. Desktop CSS keeps visible. */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="toc-body"
            className="toc-body overflow-hidden flex flex-col gap-1"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
          >
            {/* Live progress — striped green bar identical to the intro page */}
            {tabs.length > 1 && (() => {
              const pct = Math.round(((activeIndex + 1) / tabs.length) * 100);
              return (
                <div className="px-3 pb-2.5">
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
                  className={`toc-tab relative flex items-center gap-2.5 py-2.5 px-3 border-none rounded-[10px] cursor-pointer text-left font-[var(--font-body)] text-[13px] transition-colors duration-200 ${isActive ? 'is-active text-[#1A1A1A] font-semibold' : 'text-[#9CA3AF] font-medium'}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="toc-active-pill"
                      className="absolute inset-0 bg-white rounded-[10px] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] z-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-[1] inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[11.5px] font-bold transition-colors duration-200 ${isActive ? 'bg-[#3B82F6] text-white' : 'bg-[#E2E4EA] text-[#9CA3AF]'}`}>
                    {i + 1}
                  </span>
                  <span className="relative z-[1] overflow-hidden text-ellipsis whitespace-nowrap">
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
