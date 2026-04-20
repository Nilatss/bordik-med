'use client';

import { useAppStore } from '@/lib/store';
import { sections, getSectionById, getModulesBySection, getModuleById, type SectionId } from '@/lib/curriculum';
import ProfilePage from '@/components/profile/ProfilePage';
import ToolsPage from '@/components/tools/ToolsPage';
import dynamic from 'next/dynamic';
// Lazy-load ToolView - its transitive import of tools-runners.ts is ~446 KB.
// Deferring it means the Tools list page opens fast; the heavy bundle is only
// fetched the first time the user opens a specific tool.
const ToolView = dynamic(() => import('@/components/tools/ToolView'), { ssr: false });
import StatisticsPage from '@/components/stats/StatisticsPage';
import NewsFeed from '@/components/feed/NewsFeed';
import TestsPage from '@/components/tests/TestsPage';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ModuleGrid from '@/components/home/ModuleGrid';
import CourseGrid from '@/components/home/CourseGrid';
import CoursePage from '@/components/course/CoursePage';
import { ArrowLeft, ArrowRight } from '@/components/icons';
import { motion } from 'framer-motion';
import { SectionIllustration } from '@/components/illustrations/SectionIllustrations';

const SECTION_BG: Record<SectionId, string> = {
  fundamentals: '#F5F6F8',
  biomedical: '#F5F6F8',
  clinical: '#F5F6F8',
  allied: '#F5F6F8',
  skills: '#F5F6F8',
  hss: '#F5F6F8',
  threads: '#F5F6F8',
  frontier: '#F5F6F8',
  business: '#F5F6F8',
  regulatory: '#F5F6F8',
  career: '#F5F6F8',
  tech: '#F5F6F8',
};

/* Back button reusable */
function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
        color: 'var(--md-sys-color-on-surface-variant)', background: 'transparent',
        border: 'none', cursor: 'pointer', marginBottom: 16,
        alignSelf: 'flex-start', padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--md-sys-shape-corner-small)',
        transition: 'background 200ms cubic-bezier(0.2,0,0,1)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E9ED'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}

/* Section cards */
const UNLOCKED_SECTIONS: SectionId[] = ['fundamentals'];

/** Grouping of sections into logical categories (order matters) */
const SECTION_CATEGORIES: { title: string; ids: SectionId[] }[] = [
  {
    title: 'Образование и подготовка',
    ids: ['fundamentals', 'career'],
  },
  {
    title: 'Клиническое ядро',
    ids: ['biomedical', 'clinical', 'skills'],
  },
  {
    title: 'Смежные направления',
    ids: ['allied', 'threads'],
  },
  {
    title: 'Здравоохранение как система',
    ids: ['hss', 'regulatory'],
  },
  {
    title: 'Инновации и бизнес',
    ids: ['frontier', 'business', 'tech'],
  },
];

function SectionCards({ onSelect }: { onSelect: (id: SectionId) => void }) {
  const { completedCourses } = useAppStore();

  const renderSection = (secId: SectionId, i: number) => {
    const sec = sections.find((s) => s.id === secId);
    if (!sec) return null;
    const mods = getModulesBySection(sec.id);
    const totalCourses = mods.reduce((s, m) => s + m.courses.length, 0);
    const completedCount = mods.reduce((s, m) => s + m.courses.filter((c) => completedCourses.includes(c.id)).length, 0);
    const pct = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;
    const isUnlocked = UNLOCKED_SECTIONS.includes(sec.id);

    return (
          <motion.button
            key={sec.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: isUnlocked ? 1 : 0.48, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
            onClick={() => { if (isUnlocked) onSelect(sec.id); }}
            disabled={!isUnlocked}
            style={{
              background: SECTION_BG[sec.id],
              borderRadius: 'var(--md-sys-shape-corner-extra-large)',
              border: 'none',
              padding: 'var(--space-5)', textAlign: 'left',
              cursor: isUnlocked ? 'pointer' : 'not-allowed',
              opacity: isUnlocked ? 1 : 0.48,
              position: 'relative', overflow: 'hidden', minHeight: 160,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              transition: 'background 400ms cubic-bezier(0.22,1,0.36,1), transform 400ms cubic-bezier(0.22,1,0.36,1)',
            }}
            onMouseEnter={(e) => {
              if (isUnlocked) {
                e.currentTarget.style.background = '#F0F2F5';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = SECTION_BG[sec.id];
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* "Скоро" lock badge */}
            {!isUnlocked && (
              <div style={{
                position: 'absolute', top: 12, right: 12, zIndex: 2,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                background: '#1A1A1A',
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}>
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Скоро
              </div>
            )}

            <div style={{ marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
                background: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: completedCount > 0 ? 600 : 500,
                color: completedCount > 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              }}>
                {completedCount > 0 ? `${pct}% пройдено` : `${mods.length} модулей`}
              </span>
            </div>
            <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-1)', lineHeight: 1.25 }}>
                {sec.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {sec.description}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
                color: isUnlocked ? 'var(--md-sys-color-on-surface)' : '#9CA3AF',
              }}>
                {isUnlocked ? 'Начать обучение' : 'Раздел в разработке'}
              </span>
              {isUnlocked && <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />}
            </div>
          </motion.button>
    );
  };

  return (
    <div>
      {SECTION_CATEGORIES.map(({ title, ids }) => (
        <section key={title} style={{ marginBottom: 28 }}>
          <h3 style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 12,
          }}>
            {title}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-3)',
          }}>
            {ids.map((id, i) => renderSection(id, i))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ═══ Main ═══ */
export default function Home() {
  // Narrow selectors — the previous destructure `useAppStore()` subscribed
  // this component (and its whole subtree) to every store update, so
  // unrelated writes (scroll index, favourite toggle, search keystroke)
  // triggered a top-level re-render + cascade. Each field is selected
  // individually; React bails out when nothing this component reads changes.
  const activeSection = useAppStore((s) => s.activeSection);
  const activeModuleId = useAppStore((s) => s.activeModuleId);
  const currentCourseId = useAppStore((s) => s.currentCourseId);
  const showProfile = useAppStore((s) => s.showProfile);
  const showLearning = useAppStore((s) => s.showLearning);
  const showTools = useAppStore((s) => s.showTools);
  const showStats = useAppStore((s) => s.showStats);
  const showTests = useAppStore((s) => s.showTests);
  const activeToolId = useAppStore((s) => s.activeToolId);
  // Action refs — stable across the component's lifetime (Zustand returns
  // the same function reference), so picking them via `getState` once is
  // equivalent to a selector but without the subscription cost.
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const goHome = useAppStore((s) => s.goHome);
  const closeModule = useAppStore((s) => s.closeModule);
  const closeCourse = useAppStore((s) => s.closeCourse);
  const setShowLearning = useAppStore((s) => s.setShowLearning);
  const toggleProfile = useAppStore((s) => s.toggleProfile);

  const section = activeSection ? getSectionById(activeSection) : null;
  const mod = activeModuleId ? getModuleById(activeModuleId) : null;

  // views: profile | stats | tests | tool | tools | home | learning (sections) → section (modules) → module (courses) → course
  const view = showProfile ? 'profile'
    : showStats ? 'stats'
    : showTests ? 'tests'
    : (showTools && activeToolId) ? 'tool'
    : showTools ? 'tools'
    : currentCourseId ? 'course'
    : activeModuleId ? 'module'
    : activeSection ? 'section'
    : showLearning ? 'learning'
    : 'home';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, height: '100vh',
        // Visually lift the main content over the sidebar — creates a soft card feel.
        borderTopLeftRadius: 32,
        borderBottomLeftRadius: 32,
        background: '#FFFFFF',
        overflow: 'hidden', // clip inner main's scroll to the rounded corners
        boxShadow: '0 0 0 1px #F0F1F5',
      }}>
        <main style={{ flex: 1, overflowY: 'auto', background: '#FFFFFF' }}>
          <div style={{ padding: '20px 24px', minHeight: 'calc(100% - 48px)' }}>

          {view === 'profile' && (
            <ProfilePage />
          )}

          {/*
            ToolsPage stays mounted for both 'tools' and 'tool' views. When a
            specific tool is open we hide the list via CSS instead of
            unmounting - this avoids the costly remount (500+ ToolCards,
            filter memos) every time the user closes a tool. Zero visual
            change; the hidden subtree is inert and skipped by layout/paint.
          */}
          {(view === 'tools' || view === 'tool') && (
            <div style={{ display: view === 'tool' ? 'none' : 'block' }} aria-hidden={view === 'tool'}>
              <ToolsPage />
            </div>
          )}

          {view === 'tool' && activeToolId && (
            <ToolView toolId={activeToolId} />
          )}

          {view === 'stats' && (
            <StatisticsPage />
          )}

          {view === 'tests' && (
            <TestsPage />
          )}

          {view === 'course' && (
            <div>
              <BackButton onClick={closeCourse} label="Назад" />
              <CoursePage courseId={currentCourseId!} />
            </div>
          )}

          {view === 'module' && mod && (
            <div style={{ margin: '0' }}>
              <BackButton onClick={closeModule} label={section?.title || 'Назад'} />
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em',
                }}>
                  {mod.title}
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                  color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6, maxWidth: 'var(--content-max)',
                }}>
                  {mod.description}
                </p>
              </div>
              <CourseGrid moduleId={mod.id} />
            </div>
          )}

          {view === 'section' && section && (
            <div style={{ margin: '0' }}>
              <BackButton onClick={() => setShowLearning(true)} label="Все разделы" />
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em',
                }}>
                  {section.title}
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                  color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6, maxWidth: 'var(--content-max)',
                }}>
                  {section.description}
                </p>
              </div>
              {/* Roadmap removed - old structure. New curriculum has 12 sections. */}
              <ModuleGrid />
            </div>
          )}

          {view === 'learning' && (
            <div style={{ margin: '0' }}>
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-1)', letterSpacing: '-0.01em',
                }}>
                  Разделы обучения
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                  color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5,
                }}>
                  Выберите раздел для начала
                </p>
              </div>
              <SectionCards onSelect={setActiveSection} />
            </div>
          )}

          {view === 'home' && (
            <NewsFeed />
          )}

          </div>
        </main>
      </div>
    </div>
  );
}
