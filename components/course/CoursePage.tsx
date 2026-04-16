'use client';

import { useAppStore, formatStudyTime } from '@/lib/store';
import { getCourseById } from '@/lib/curriculum';
import { getArticle } from '@/lib/content';
import { useStudyTimer } from '@/lib/useStudyTimer';
import CourseHeader from './CourseHeader';
import LessonViewer from './LessonViewer';
import PediatricCalculator from './PediatricCalculator';
import QuizPlaceholder from './QuizPlaceholder';

interface CoursePageProps {
  courseId: string;
}

export default function CoursePage({ courseId }: CoursePageProps) {
  const course = getCourseById(courseId);
  const studyTime = useAppStore((s) => s.studyTime[courseId] || 0);

  // Auto-track time while course is open
  useStudyTimer(courseId);

  if (!course) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>Курс не найден</p>
      </div>
    );
  }

  const content = getArticle(courseId, 'main');
  const isPediatricCalc = courseId === '7.4';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CourseHeader courseId={courseId} />
      {studyTime > 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)', alignSelf: 'flex-start',
          padding: '4px var(--space-3)',
          borderRadius: 'var(--md-sys-shape-corner-full)',
          background: 'var(--md-sys-color-surface-container-high)',
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          {formatStudyTime(studyTime)}
        </div>
      )}
      {isPediatricCalc && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <PediatricCalculator />
        </div>
      )}
      <LessonViewer content={content} />
      <div style={{ marginTop: 'var(--space-8)' }}>
        <QuizPlaceholder courseId={courseId} />
      </div>
    </div>
  );
}
