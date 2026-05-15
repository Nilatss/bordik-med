'use client';

import { useMemo } from 'react';
import { modules, TOTAL_COURSES } from '@/lib/curriculum';
import { useAppStore, formatStudyTime, getTotalStudyTime } from '@/lib/store';

export default function ProgressStats() {
  // Select only what we use - avoids re-render on every store mutation
  const completedCourses = useAppStore((s) => s.completedCourses);
  const studyTime        = useAppStore((s) => s.studyTime);

  const totalCompleted = completedCourses.length;
  const progress = Math.round((totalCompleted / TOTAL_COURSES) * 100);
  const totalTime = getTotalStudyTime(studyTime);

  // O(modules × courses) loop - memoise on the small slice that drives it
  const byDifficulty = useMemo(() => {
    const acc = { basic: 0, intermediate: 0, advanced: 0 };
    const completed = new Set(completedCourses);
    for (const mod of modules) {
      for (const course of mod.courses) {
        if (completed.has(course.id)) acc[course.difficulty]++;
      }
    }
    return acc;
  }, [completedCourses]);

  const stats = [
    { label: 'Общий прогресс', value: `${progress}%`, sub: `${totalCompleted}/${TOTAL_COURSES}`, showBar: true, barPct: progress },
    { label: 'Время обучения', value: totalTime > 0 ? formatStudyTime(totalTime) : '0 мин', sub: '' },
    { label: 'Средний', value: String(byDifficulty.intermediate), sub: 'курсов' },
    { label: 'Продвинутый', value: String(byDifficulty.advanced), sub: 'курсов' },
  ];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-[var(--space-4)] mb-[var(--space-8)]">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#F5F6F8] rounded-[var(--md-sys-shape-corner-extra-large)] border-none p-[var(--space-5)]">
          <p className="font-[var(--font-body)] text-[0.6875rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] uppercase tracking-[0.04em] mb-[var(--space-2)]">
            {stat.label}
          </p>
          <div className="flex items-baseline gap-[var(--space-2)]">
            <span className="font-[var(--font-display)] text-[length:var(--text-2xl)] font-bold text-[color:var(--md-sys-color-on-surface)] tracking-[-0.02em] leading-none">
              {stat.value}
            </span>
            {stat.sub && (
              <span className="font-[var(--font-mono)] text-[0.6875rem] text-[color:var(--md-sys-color-on-surface-variant)]">
                {stat.sub}
              </span>
            )}
          </div>
          {stat.showBar && (
            <div className="mt-[var(--space-3)] h-1 bg-[var(--md-sys-color-surface-container-highest)] rounded-[var(--md-sys-shape-corner-full)]">
              <div
                className="h-full bg-[var(--md-sys-color-primary)] rounded-[var(--md-sys-shape-corner-full)] w-full origin-left transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] [will-change:transform] [transform:scaleX(var(--bar-scale))]"
                // eslint-disable-next-line react/forbid-dom-props -- dynamic progress scale
                style={{ ['--bar-scale' as string]: String((stat.barPct ?? 0) / 100) }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
