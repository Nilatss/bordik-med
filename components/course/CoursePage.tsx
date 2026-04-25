'use client';

import { motion } from 'framer-motion';
import { getCourseById, getModuleForCourse } from '@/lib/curriculum';
import { getArticle } from '@/lib/content';
import { useStudyTimer } from '@/lib/useStudyTimer';
import { useAppStore } from '@/lib/store';
import CourseHeader from './CourseHeader';
import TabbedLessonViewer, { splitIntoTabs, type Tab } from './TabbedLessonViewer';
import PediatricCalculator from './PediatricCalculator';

interface CoursePageProps {
  courseId: string;
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

  // Same tab list the lesson viewer will build — used here to show the TOC
  // and progress bar on the intro screen so the layout doesn't shift when
  // the user clicks «Начать обучение».
  const NO_TEST_MODULES = [102];
  const moduleId = parseInt(courseId.split('.')[0]);
  const hasTests = !NO_TEST_MODULES.includes(moduleId);
  const tabs: Tab[] = (() => {
    const base = content ? splitIntoTabs(content) : [];
    if (hasTests) {
      base.push({
        id: 'tests', title: 'Тесты по курсу', short: 'Тесты',
        iconKey: 'tests', body: '', kind: 'tests',
      });
    }
    return base;
  })();
  const totalTopics = tabs.length;
  const progressPct = isCompleted ? 100 : isStarted ? 0 : 0; // viewer manages live progress

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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 }}
          style={{
            background: '#FFFFFF',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            padding: 'var(--space-6)',
            border: '1px solid #F0F1F5',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}
        >
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
              {totalTopics > 0
                ? `Курс содержит ${totalTopics} ${totalTopics === 1 ? 'тему' : totalTopics < 5 ? 'темы' : 'тем'}.`
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
            <StatPill label="Тем" value={totalTopics > 0 ? String(totalTopics) : '—'} />
            <StatPill label="Тесты" value={hasTests ? 'Да' : 'Нет'} />
            <StatPill label="Раздел" value={mod?.title ?? '—'} />
          </div>

          {/* Progress bar */}
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 6,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Прогресс курса
              </span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                color: '#6B7280',
              }}>
                {progressPct}%
              </span>
            </div>
            <div style={{
              height: 8, borderRadius: 999, background: '#E2E4EA',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: '#3B82F6',
                borderRadius: 999,
                transition: 'width 300ms ease',
              }} />
            </div>
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
                background: '#3B82F6',
                border: 'none', borderRadius: 999,
                cursor: 'pointer',
                transition: 'background 200ms cubic-bezier(0.2,0,0,1), transform 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2563EB';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#3B82F6';
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
            Содержание
          </p>
          {tabs.map((t, i) => (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: 'transparent',
                color: '#9CA3AF',
                borderRadius: 10,
                fontFamily: 'var(--font-body)', fontSize: 13,
                fontWeight: 500,
                cursor: 'default',
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: '50%',
                background: '#E2E4EA', color: '#6B7280',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.short}
              </span>
            </div>
          ))}
        </aside>
      </div>
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
