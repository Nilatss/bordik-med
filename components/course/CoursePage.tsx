'use client';

import { getCourseById } from '@/lib/curriculum';
import { getArticle } from '@/lib/content';
import { useStudyTimer } from '@/lib/useStudyTimer';
import CourseHeader from './CourseHeader';
import TabbedLessonViewer from './TabbedLessonViewer';
import PediatricCalculator from './PediatricCalculator';

interface CoursePageProps {
  courseId: string;
}

export default function CoursePage({ courseId }: CoursePageProps) {
  const course = getCourseById(courseId);

  // Auto-track time while course is open (still counted for stats, just not shown here)
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

  // Modules that don't have tests (e.g. career orientation is informational)
  const NO_TEST_MODULES = [102];
  const moduleId = parseInt(courseId.split('.')[0]);
  const hasTests = !NO_TEST_MODULES.includes(moduleId);

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
