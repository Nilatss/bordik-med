'use client';

import { motion } from 'framer-motion';
import { getCourseById, getModuleForCourse } from '@/lib/curriculum';
import { getArticle } from '@/lib/content';
import { useStudyTimer } from '@/lib/useStudyTimer';
import { useAppStore } from '@/lib/store';
import CourseHeader from './CourseHeader';
import TabbedLessonViewer from './TabbedLessonViewer';
import PediatricCalculator from './PediatricCalculator';

interface CoursePageProps {
  courseId: string;
}

/** Walk the markdown for H3 headings — same logic TabbedLessonViewer uses to
 *  build tabs. Used here just to count topics on the intro card. */
function countTopics(md: string): number {
  if (!md) return 0;
  const matches = md.match(/^###\s+/gm);
  return matches ? matches.length : 0;
}

export default function CoursePage({ courseId }: CoursePageProps) {
  const course = getCourseById(courseId);
  const mod = getModuleForCourse(courseId);
  const startedCourses = useAppStore((s) => s.startedCourses);
  const startCourse = useAppStore((s) => s.startCourse);
  const completedCourses = useAppStore((s) => s.completedCourses);

  // Auto-track time while course is open
  useStudyTimer(courseId);

  if (!course) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>Курс не найден</p>
      </div>
    );
  }

  const content = getArticle(courseId, 'main') ?? '';
  const isPediatricCalc = courseId === '7.4';
  const isStarted = startedCourses.includes(courseId);
  const isCompleted = completedCourses.includes(courseId);
  const topics = countTopics(content);

  // Modules that don't have tests (e.g. career orientation is informational)
  const NO_TEST_MODULES = [102];
  const moduleId = parseInt(courseId.split('.')[0]);
  const hasTests = !NO_TEST_MODULES.includes(moduleId);

  // Once started (or already completed) — show the lesson viewer.
  if (isStarted || isCompleted) {
    return (
      <div>
        <CourseHeader courseId={courseId} />
        {isPediatricCalc && (
          <div style={{ marginBottom: 20 }}>
            <PediatricCalculator />
          </div>
        )}
        <TabbedLessonViewer content={content} courseId={courseId} showTests={hasTests} />
      </div>
    );
  }

  // Intro screen — header + a single CTA card with «Начать обучение» button.
  return (
    <div>
      <CourseHeader courseId={courseId} />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.1 }}
        style={{
          background: '#FFFFFF',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--space-6)',
          marginTop: 4,
          border: '1px solid #F0F1F5',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}
      >
        {/* Course summary */}
        <div>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 8,
          }}>
            Готовы начать?
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            color: '#1A1A1A', lineHeight: 1.25, letterSpacing: '-0.01em',
            marginBottom: 8,
          }}>
            {topics > 0
              ? `Курс содержит ${topics} ${topics === 1 ? 'тему' : topics < 5 ? 'темы' : 'тем'}.`
              : 'Курс готов к изучению.'}
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280',
            lineHeight: 1.55, maxWidth: 640,
          }}>
            После запуска вы перейдёте к материалу с пошаговой навигацией: каждая тема
            открывается отдельной вкладкой, а ваш прогресс автоматически сохраняется.
            {hasTests && ' В конце курса доступен тест для проверки знаний.'}
          </p>
        </div>

        {/* Stat row */}
        <div style={{
          display: 'grid', gap: 10,
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}>
          <StatPill label="Тем" value={topics > 0 ? String(topics) : '—'} />
          <StatPill label="Тесты" value={hasTests ? 'Да' : 'Нет'} />
          <StatPill label="Раздел" value={mod?.title ?? '—'} />
        </div>

        {/* Start CTA */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          paddingTop: 8, borderTop: '1px dashed #E5E7EB',
        }}>
          <button
            onClick={() => startCourse(courseId)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '12px 24px',
              fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 600,
              color: '#FFFFFF',
              background: '#1A1A1A',
              border: 'none', borderRadius: 999,
              cursor: 'pointer',
              transition: 'background 200ms cubic-bezier(0.2,0,0,1), transform 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2B2B2B';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1A1A1A';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Начать обучение
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1={5} y1={12} x2={19} y2={12} />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#F5F6F8',
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
      minWidth: 0,
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
        color: '#1A1A1A', lineHeight: 1.35,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  );
}
