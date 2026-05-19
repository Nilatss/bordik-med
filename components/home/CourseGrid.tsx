'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getModuleById } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { ArrowRight, Check } from '@/components/icons';
import DifficultyFilter from './DifficultyFilter';

export default function CourseGrid({ moduleId }: { moduleId: number }) {
  // Audit P-1: atomic selectors.
  const openCourse = useAppStore((s) => s.openCourse);
  const completedCourses = useAppStore((s) => s.completedCourses);
  const difficultyFilter = useAppStore((s) => s.difficultyFilter);
  const setDifficultyFilter = useAppStore((s) => s.setDifficultyFilter);
  const mod = getModuleById(moduleId);
  const filter = difficultyFilter;

  const filteredCourses = useMemo(() => {
    if (!mod) return [];
    if (filter === 'all') return mod.courses;
    return mod.courses.filter((c) => c.difficulty === filter);
  }, [mod, filter]);

  if (!mod) return null;

  return (
    <>
      <DifficultyFilter value={filter} onChange={setDifficultyFilter} />
      {filteredCourses.length === 0 ? (
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
              Курсов пока нет
            </p>
            <p className="font-[var(--font-body)] text-[13px] text-[#6B7280] leading-[1.5]">
              Попробуйте выбрать другой уровень сложности - возможно, на этом уровне материалы ещё готовятся.
            </p>
          </div>
          <button
            onClick={() => setDifficultyFilter('all')}
            className="py-2 px-4 bg-[#1A1A1A] hover:bg-black text-white border-none rounded-[10px] cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms]"
          >
            Показать все курсы
          </button>
        </div>
      ) : (
        <div className="rg-3 gap-[var(--space-4)]">
      {filteredCourses.map((course, i) => {
        const isCompleted = completedCourses.includes(course.id);
        const badgeClass = isCompleted
          ? 'bg-[var(--md-sys-color-primary-container)] text-[color:var(--md-sys-color-primary)]'
          : 'bg-white text-[color:var(--md-sys-color-on-surface-variant)]';

        return (
          <motion.button
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.025, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
            onClick={() => openCourse(course.id)}
            className="bg-[#F5F6F8] hover:bg-[#F0F2F5] hover:-translate-y-px rounded-[var(--md-sys-shape-corner-extra-large)] border-none cursor-pointer text-left p-[var(--space-6)] flex flex-col gap-[var(--space-3)] transition-[background,transform] duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            {/* Badge - difficulty */}
            <span className={`inline-flex self-start font-[var(--font-mono)] text-[0.6875rem] font-medium py-1 px-[var(--space-3)] rounded-[var(--md-sys-shape-corner-full)] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] ${badgeClass}`}>
              {isCompleted ? '✓ Пройден' : course.difficulty === 'basic' ? 'Базовый' : course.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
            </span>

            {/* Title */}
            <h3 className="font-[var(--font-display)] text-[length:var(--text-base)] font-bold text-[color:var(--md-sys-color-on-surface)] leading-[1.3] tracking-[-0.01em]">
              {course.title}
            </h3>

            {/* Description */}
            <p className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.5] overflow-hidden flex-1 [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]">
              {course.description}
            </p>

            {/* Footer */}
            <div className="flex items-center gap-[var(--space-1)] mt-[var(--space-1)]">
              {isCompleted ? (
                <span className="font-[var(--font-body)] text-[length:var(--text-xs)] font-medium text-[color:var(--md-sys-color-primary)] flex items-center gap-[var(--space-1)]">
                  <Check size={14} /> Повторить <ArrowRight size={14} />
                </span>
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
