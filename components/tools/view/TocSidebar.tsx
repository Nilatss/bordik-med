/**
 * TocSidebar — sticky right-rail sidebar в ToolView'е («Содержание»)
 * с анимированным active-pill (layoutId).
 *
 * P1-CR-3 step 8/8 — extracted from ToolView.tsx.
 *
 * Identical visual treatment к TabbedLessonViewer's aside — same
 * background `#F5F6F8`, same `toc-tab` rounded-button с активной
 * подложкой.
 */
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import type { Tab } from '@/lib/tool-view/types';
import { TabIcon } from './TabIcon';

export function TocSidebar({ tabs, activeId, onSelect }: {
  tabs: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const t = useT();
  return (
    <aside className="toc-sidebar sticky top-5 bg-[#F5F6F8] rounded-[var(--md-sys-shape-corner-extra-large)] p-4 flex flex-col gap-1">
      <p className="font-[var(--font-body)] text-[11px] font-semibold text-[#888] uppercase tracking-[0.08em] pt-1 px-3 pb-2.5 m-0">
        {t('course.toc.title')}
      </p>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`toc-tab relative flex items-center gap-2.5 py-2.5 px-3 border-none rounded-[10px] cursor-pointer text-left font-[var(--font-body)] text-[13px] transition-colors duration-200 ${
              isActive ? 'is-active text-[#1A1A1A] font-semibold' : 'text-[#333] font-medium'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="tool-toc-active-pill"
                className="absolute inset-0 bg-white rounded-[10px] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.04)] z-0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-[1] flex shrink-0 transition-colors duration-200 ${isActive ? 'text-[#1A1A1A]' : 'text-[#6B7280]'}`}>
              <TabIcon name={tab.iconKey} size={16} />
            </span>
            <span className="relative z-[1] overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-1">
              {tab.short}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
