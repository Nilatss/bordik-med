'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getModuleById } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { ArrowRight, Check } from '@/components/icons';
import DifficultyFilter from './DifficultyFilter';

export default function CourseGrid({ moduleId }: { moduleId: number }) {
  const { openCourse, completedCourses, difficultyFilter, setDifficultyFilter } = useAppStore();
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
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 14,
          padding: '60px 20px',
          minHeight: 320,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#F5F6F8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
              color: '#1A1A1A', marginBottom: 4, letterSpacing: '-0.01em',
            }}>
              Курсов пока нет
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
              lineHeight: 1.5,
            }}>
              Попробуйте выбрать другой уровень сложности - возможно, на этом уровне материалы ещё готовятся.
            </p>
          </div>
          <button
            onClick={() => setDifficultyFilter('all')}
            style={{
              padding: '8px 16px',
              background: '#1A1A1A', color: '#FFFFFF',
              border: 'none', borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              transition: 'background 180ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
          >
            Показать все курсы
          </button>
        </div>
      ) : (
        <div className="rg-3" style={{ gap: 'var(--space-4)' }}>
      {filteredCourses.map((course, i) => {
        const isCompleted = completedCourses.includes(course.id);

        return (
          <motion.button
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 8) * 0.025, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
            onClick={() => openCourse(course.id)}
            style={{
              background: '#F5F6F8',
              borderRadius: 'var(--md-sys-shape-corner-extra-large)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              transition: 'background 450ms cubic-bezier(0.22,1,0.36,1), transform 450ms cubic-bezier(0.22,1,0.36,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F0F2F5';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5F6F8';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Badge - difficulty */}
            <span style={{
              display: 'inline-flex', alignSelf: 'flex-start',
              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500,
              padding: '4px var(--space-3)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              backgroundColor: isCompleted
                ? 'var(--md-sys-color-primary-container)'
                : '#FFFFFF',
              color: isCompleted
                ? 'var(--md-sys-color-primary)'
                : 'var(--md-sys-color-on-surface-variant)',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
            }}>
              {isCompleted ? '✓ Пройден' : course.difficulty === 'basic' ? 'Базовый' : course.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
            </span>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)', lineHeight: 1.3, letterSpacing: '-0.01em',
            }}>
              {course.title}
            </h3>

            {/* Description */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
              color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', flex: 1,
            }}>
              {course.description}
            </p>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
              marginTop: 'var(--space-1)',
            }}>
              {isCompleted ? (
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
                  color: 'var(--md-sys-color-primary)',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                }}>
                  <Check size={14} /> Повторить <ArrowRight size={14} />
                </span>
              ) : (
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                }}>
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
