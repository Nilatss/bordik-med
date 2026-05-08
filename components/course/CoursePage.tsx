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

  // Auto-track time while course is open
  useStudyTimer(courseId);

  if (!course) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--md-sys-color-on-surface-variant)' }}>{t('course.notFound')}</p>
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
        <aside className="toc-sidebar" style={{
          position: 'sticky', top: 20,
          background: '#F5F6F8',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 16,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11,
            fontWeight: 600, color: '#888',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '4px 12px 10px',
          }}>
            {t('course.toc.title')}
          </p>
          {tabs.map((tab, i) => {
            // First topic visualised as «active» so the empty intro page
            // doesn't look stale — matches what the user will see right
            // after clicking «Начать обучение».
            const isFirst = i === 0;
            return (
              <div
                key={tab.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: isFirst ? '#FFFFFF' : 'transparent',
                  color: isFirst ? '#1A1A1A' : '#9CA3AF',
                  borderRadius: 10,
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  fontWeight: isFirst ? 600 : 500,
                  cursor: 'default',
                  boxShadow: isFirst ? '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.04)' : 'none',
                }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: '50%',
                  background: isFirst ? '#3B82F6' : '#E2E4EA',
                  color: isFirst ? '#FFF' : '#9CA3AF',
                  fontSize: 11.5, fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tab.short}
                </span>
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
