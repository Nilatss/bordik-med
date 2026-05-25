'use client';

import { getCourseById, getModuleForCourse } from '@/lib/curriculum';
import { getArticle } from '@/lib/content';
import { useStudyTimer } from '@/lib/useStudyTimer';
import { useAppStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import CourseHeader from './CourseHeader';
import TabbedLessonViewer, { splitIntoTabs, type Tab } from './TabbedLessonViewer';
import PediatricCalculator from './PediatricCalculator';
import IntroCard from './IntroCard';
import IntroTocSidebar from './IntroTocSidebar';

interface CoursePageProps {
  courseId: string;
}

export default function CoursePage({ courseId }: CoursePageProps) {
  const t = useT();
  const course = getCourseById(courseId);
  const mod = getModuleForCourse(courseId);
  const startedCourses = useAppStore((s) => s.startedCourses);
  const startCourse = useAppStore((s) => s.startCourse);
  const completedCourses = useAppStore((s) => s.completedCourses);
  const readTopics = useAppStore((s) => s.readTopics);

  // Auto-track time while course is open
  useStudyTimer(courseId);

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[length:var(--text-sm)] text-[color:var(--md-sys-color-on-surface-variant)]">{t('course.notFound')}</p>
      </div>
    );
  }

  const content = getArticle(courseId, 'main') ?? '';
  const isPediatricCalc = courseId === '7.4';
  const isStarted = startedCourses.includes(courseId);
  const isCompleted = completedCourses.includes(courseId);

  // Same tab list the lesson viewer will build — used here to show the TOC
  // and progress bar on the intro screen so the layout doesn't shift when
  // the user clicks «Начать обучение».
  const NO_TEST_MODULES = [102];
  const moduleId = parseInt(courseId.split('.')[0] ?? '0');
  const hasTests = !NO_TEST_MODULES.includes(moduleId);
  const tabs: Tab[] = (() => {
    const base = content ? splitIntoTabs(content) : [];
    if (hasTests) {
      base.push({
        id: 'tests',
        title: t('course.toc.tabTests'),
        short: t('course.toc.tabTestsShort'),
        iconKey: 'tests', body: '', kind: 'tests',
      });
    }
    return base;
  })();
  const totalTopics = tabs.length;
  const progressPct = isCompleted ? 100 : isStarted ? 0 : 0; // viewer manages live progress

  // Build «Тема N» / topic count plural via i18n
  const titleN = totalTopics > 0
    ? t('course.intro.descN', { n: totalTopics })
    : t('course.intro.ready');
  const introBody = `${t('course.intro.body')}${hasTests ? ' ' + t('course.intro.bodyTests') : ''}`;

  // Once started (or already completed) — show the lesson viewer (it has its
  // own identical TOC sidebar so layout continuity is preserved).
  if (isStarted || isCompleted) {
    const contentTabIds = tabs.filter((tb) => tb.id !== 'tests').map((tb) => tb.id);
    const readSet = new Set(readTopics[courseId] ?? []);
    const readCount = contentTabIds.filter((id) => readSet.has(id)).length;
    const readPct = isCompleted
      ? 100
      : contentTabIds.length > 0 ? Math.round((readCount / contentTabIds.length) * 100) : 0;
    return (
      <div>
        <CourseHeader courseId={courseId} />
        {!isCompleted && contentTabIds.length > 0 && (
          <div className="mb-4 px-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-[var(--font-mono)] text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#9CA3AF]">
                Прогресс чтения
              </span>
              <span className="text-[12px] text-[#6B7280] font-medium">{readCount} / {contentTabIds.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#EEF0F4] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#16A34A] transition-[width] duration-300"
                // eslint-disable-next-line react/forbid-dom-props -- dynamic width tied to reading progress
                style={{ width: `${readPct}%` }}
              />
            </div>
          </div>
        )}
        {isPediatricCalc && (
          <div className="mb-5">
            <PediatricCalculator />
          </div>
        )}
        <TabbedLessonViewer content={content} courseId={courseId} showTests={hasTests} />
      </div>
    );
  }

  // Intro screen — same rg-main-toc grid as the viewer, so the TOC sidebar
  // doesn't disappear when learning starts. Progress bar above the CTA.
  return (
    <div>
      <CourseHeader courseId={courseId} />
      <div className="rg-main-toc">
        {/* LEFT: intro card + start CTA */}
        <IntroCard
          titleN={titleN}
          introBody={introBody}
          totalTopics={totalTopics}
          hasTests={hasTests}
          sectionTitle={mod?.title ?? '—'}
          progressPct={progressPct}
          onStart={() => startCourse(courseId)}
        />

        {/* RIGHT: TOC sidebar — same look as in TabbedLessonViewer so the
            layout stays put when the user starts. All items inactive (dimmed). */}
        <IntroTocSidebar tabs={tabs} />
      </div>
    </div>
  );
}
