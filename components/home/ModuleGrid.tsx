'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getModulesBySection } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { ArrowRight } from '@/components/icons';
import DifficultyFilter from './DifficultyFilter';

export default function ModuleGrid() {
  // Audit P-1: atomic selectors.
  const activeSection = useAppStore((s) => s.activeSection);
  const openModule = useAppStore((s) => s.openModule);
  const completedCourses = useAppStore((s) => s.completedCourses);
  const difficultyFilter = useAppStore((s) => s.difficultyFilter);
  const setDifficultyFilter = useAppStore((s) => s.setDifficultyFilter);
  const sectionModules = activeSection ? getModulesBySection(activeSection) : [];
  const filter = difficultyFilter;

  const filteredModules = useMemo(() => {
    if (filter === 'all') return sectionModules;
    return sectionModules.filter((m) => m.courses.some((c) => c.difficulty === filter));
  }, [sectionModules, filter]);

  return (
    <>
      <DifficultyFilter value={filter} onChange={setDifficultyFilter} />
      {filteredModules.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-[14px] py-[60px] px-5 min-h-[320px]">
          <div className="w-[72px] h-[72px] rounded-full bg-[#F5F6F8] flex items-center justify-center">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
          <div className="text-center max-w-[360px]">
            <p className="font-[var(--font-display)] text-base font-bold text-[#1A1A1A] mb-1 tracking-[-0.01em]">
              Модулей пока нет
            </p>
            <p className="font-[var(--font-body)] text-[13px] text-[#6B7280] leading-[1.5]">
              В этом разделе нет модулей с выбранным уровнем сложности. Попробуйте другой фильтр.
            </p>
          </div>
          <button
            onClick={() => setDifficultyFilter('all')}
            className="py-2 px-4 bg-[#1A1A1A] hover:bg-black text-white border-none rounded-[10px] cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms]"
          >
            Показать все модули
          </button>
        </div>
      ) : (
      <div className="rg-3 gap-[var(--space-4)]">
      {filteredModules.map((mod, i) => {
        const completedCount = mod.courses.filter((c) => completedCourses.includes(c.id)).length;
        const progress = mod.courses.length > 0 ? (completedCount / mod.courses.length) * 100 : 0;

        return (
          <motion.button
            key={mod.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
            onClick={() => openModule(mod.id)}
            className="bg-[#F5F6F8] hover:bg-[#F0F2F5] hover:-translate-y-px rounded-[var(--md-sys-shape-corner-extra-large)] border-none overflow-hidden cursor-pointer text-left p-[var(--space-6)] flex flex-col gap-[var(--space-3)] transition-[background,transform] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            {/* Badge */}
            <span className="inline-flex self-start font-[var(--font-mono)] text-[0.6875rem] font-medium py-1 px-[var(--space-3)] rounded-[var(--md-sys-shape-corner-full)] bg-white text-[color:var(--md-sys-color-on-surface-variant)] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)]">
              {mod.courses.length} курсов
            </span>

            {/* Title */}
            <h3 className="font-[var(--font-display)] text-[length:var(--text-lg)] font-bold text-[color:var(--md-sys-color-on-surface)] leading-[1.25] tracking-[-0.01em]">
              {mod.title}
            </h3>

            {/* Description */}
            <p
              className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.5] overflow-hidden flex-1 [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]"
            >
              {mod.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-[var(--space-1)]">
              {completedCount > 0 ? (
                <div className="flex items-center gap-[var(--space-2)] flex-1">
                  <div className="flex-1 max-w-[80px] h-[3px] bg-[var(--md-sys-color-surface-container-highest)] rounded-[var(--md-sys-shape-corner-full)]">
                    <div
                      className="h-full rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] w-[var(--progress)]"
                      // eslint-disable-next-line react/forbid-dom-props -- dynamic progress %
                      style={{ ['--progress' as string]: `${progress}%` }}
                    />
                  </div>
                  <span className="font-[var(--font-mono)] text-[0.625rem] text-[color:var(--md-sys-color-primary)]">
                    {completedCount}/{mod.courses.length}
                  </span>
                </div>
              ) : (
                <span className="font-[var(--font-body)] text-[length:var(--text-xs)] font-medium text-[color:var(--md-sys-color-on-surface-variant)] flex items-center gap-[var(--space-1)]">
                  Открыть <ArrowRight size={14} />
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
      </div>
      )}
    </>
  );
}
