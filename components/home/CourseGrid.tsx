'use client';

import { motion } from 'framer-motion';
import { getModuleById } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { ArrowRight, Check } from '@/components/icons';

export default function CourseGrid({ moduleId }: { moduleId: number }) {
  const { openCourse, completedCourses } = useAppStore();
  const mod = getModuleById(moduleId);

  if (!mod) return null;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--space-4)',
    }}>
      {mod.courses.map((course, i) => {
        const isCompleted = completedCourses.includes(course.id);

        return (
          <motion.button
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
            onClick={() => openCourse(course.id)}
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--md-sys-shape-corner-extra-large)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              transition: 'background 250ms cubic-bezier(0.2,0,0,1), transform 250ms cubic-bezier(0.2,0,0,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Badge — difficulty */}
            <span style={{
              display: 'inline-flex', alignSelf: 'flex-start',
              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500,
              padding: '3px var(--space-3)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              backgroundColor: isCompleted
                ? 'var(--md-sys-color-primary-container)'
                : 'var(--md-sys-color-surface-container-highest)',
              color: isCompleted
                ? 'var(--md-sys-color-primary)'
                : 'var(--md-sys-color-on-surface-variant)',
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
  );
}
