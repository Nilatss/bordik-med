'use client';

import { motion } from 'framer-motion';
import { getCourseById, getModuleForCourse } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { Check } from '@/components/icons';

const DIFFICULTY_LABELS: Record<string, string> = {
  basic: 'Базовый',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

interface CourseHeaderProps {
  courseId: string;
}

export default function CourseHeader({ courseId }: CourseHeaderProps) {
  const { completedCourses, markCompleted, unmarkCompleted } = useAppStore();

  const course = getCourseById(courseId);
  const mod = getModuleForCourse(courseId);
  if (!course || !mod) return null;

  const isCompleted = completedCourses.includes(courseId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
      style={{ marginBottom: 'var(--space-8)' }}
    >
      {/* Tags */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        gap: 'var(--space-2)', marginBottom: 'var(--space-4)',
      }}>
        <span style={{
          padding: '3px var(--space-3)',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          borderRadius: 'var(--md-sys-shape-corner-full)',
          backgroundColor: 'var(--md-sys-color-surface-container-highest)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          {DIFFICULTY_LABELS[course.difficulty]}
        </span>
        {course.tags.map((tag) => (
          <span key={tag} style={{
            padding: '3px var(--space-3)',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            color: 'var(--md-sys-color-on-surface-variant)',
            background: 'var(--md-sys-color-surface-container)',
            borderRadius: 'var(--md-sys-shape-corner-full)',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Title — large, bold, same as section cards */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        color: 'var(--md-sys-color-on-surface)',
        marginBottom: 'var(--space-3)',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}>
        {course.title}
      </h1>

      {/* Description — medium gray, relaxed */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--md-sys-color-on-surface-variant)',
        marginBottom: 'var(--space-6)',
        maxWidth: 'var(--content-max)',
        lineHeight: 1.7,
      }}>
        {course.description}
      </p>

      {/* Complete toggle — rounded full pill */}
      {!isCompleted ? (
        <button
          onClick={() => markCompleted(courseId)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: '0 var(--space-6)', height: 44,
            borderRadius: 'var(--md-sys-shape-corner-full)',
            background: 'var(--md-sys-color-primary)',
            color: 'var(--md-sys-color-on-primary)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
            letterSpacing: '0.01em',
            transition: 'opacity 200ms cubic-bezier(0.2,0,0,1)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          <Check size={18} />
          Отметить пройденным
        </button>
      ) : (
        <button
          onClick={() => unmarkCompleted(courseId)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: '0 var(--space-6)', height: 44,
            borderRadius: 'var(--md-sys-shape-corner-full)',
            background: 'var(--md-sys-color-surface-container-high)',
            color: 'var(--md-sys-color-primary)',
            border: '1px solid var(--md-sys-color-outline-variant)',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
            transition: 'background 200ms cubic-bezier(0.2,0,0,1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--md-sys-color-error-container)';
            e.currentTarget.style.color = 'var(--md-sys-color-error)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
            e.currentTarget.style.color = 'var(--md-sys-color-primary)';
            e.currentTarget.style.borderColor = 'var(--md-sys-color-outline-variant)';
          }}
        >
          <Check size={18} />
          Пройден
        </button>
      )}
    </motion.div>
  );
}
