/**
 * IntroTocSidebar — the right-side TOC shown on the course intro screen.
 *
 * Mirrors the look of the TOC sidebar inside TabbedLessonViewer so the
 * layout doesn't shift when the user clicks "Начать обучение". All items
 * appear inactive except the first, which is visualised as the next
 * destination (matches what user sees post-start).
 *
 * Extracted from CoursePage.tsx (P1-CR-3 god-component split).
 */
'use client';

import { useT } from '@/lib/i18n';
import type { Tab } from './TabbedLessonViewer';

interface IntroTocSidebarProps {
  tabs: Tab[];
}

export default function IntroTocSidebar({ tabs }: IntroTocSidebarProps) {
  const t = useT();

  return (
    <aside className="toc-sidebar sticky top-5 bg-[#F5F6F8] rounded-[var(--md-sys-shape-corner-extra-large)] p-4 flex flex-col gap-1">
      <p className="font-[var(--font-body)] text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em] pt-1 px-3 pb-2.5">
        {t('course.toc.title')}
      </p>
      {tabs.map((tab, i) => {
        // First topic visualised as «active» so the empty intro page
        // doesn't look stale — matches what the user will see right
        // after clicking «Начать обучение».
        const isFirst = i === 0;
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-2.5 py-2.5 px-3 rounded-[10px] font-[var(--font-body)] text-[13px] cursor-default ${
              isFirst
                ? 'bg-white text-[#1A1A1A] font-semibold shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)]'
                : 'bg-transparent text-[#9CA3AF] font-medium'
            }`}
          >
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11.5px] font-bold shrink-0 ${
              isFirst ? 'bg-[#3B82F6] text-white' : 'bg-[#E2E4EA] text-[#9CA3AF]'
            }`}>
              {i + 1}
            </span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {tab.short}
            </span>
          </div>
        );
      })}
    </aside>
  );
}
