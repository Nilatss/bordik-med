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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-8)',
    }}>
      {stats.map((stat) => (
        <div key={stat.label} style={{
          background: '#F5F6F8',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          border: 'none',
          padding: 'var(--space-5)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            color: 'var(--md-sys-color-on-surface-variant)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 'var(--space-2)',
          }}>
            {stat.label}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              {stat.value}
            </span>
            {stat.sub && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}>
                {stat.sub}
              </span>
            )}
          </div>
          {stat.showBar && (
            <div style={{
              marginTop: 'var(--space-3)',
              height: 4,
              background: 'var(--md-sys-color-surface-container-highest)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
            }}>
              <div style={{
                height: '100%',
                background: 'var(--md-sys-color-primary)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                width: '100%',
                transformOrigin: 'left center',
                transform: `scaleX(${(stat.barPct ?? 0) / 100})`,
                transition: 'transform 300ms cubic-bezier(0.2,0,0,1)',
                willChange: 'transform',
              }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
