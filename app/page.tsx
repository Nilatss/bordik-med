'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
// Heavy module/course data lives in lib/curriculum.ts (~230 KB raw).
// Home doesn't need it — every value it actually consumes is
// precomputed at build time and lives in lib/curriculum-stats.ts:
//   - SECTIONS              12 sections meta (~3.6 KB)
//   - SECTION_TOTAL_COURSES drives "X / Y completed" without iterating modules
//   - SECTION_COURSE_IDS    Set-based per-section completed-count lookup
//   - MODULE_META           title + description + color for the module header
// Importing only `curriculum-stats.ts` keeps webpack from dragging
// `lib/curriculum.ts` (and the full course objects) into the home chunk.
import type { SectionId } from '@/lib/curriculum-types';
import {
  SECTIONS as sections,
  getSectionByIdFast as getSectionById,
  SECTION_TOTAL_COURSES,
  SECTION_COURSE_IDS,
  MODULE_META,
} from '@/lib/curriculum-stats';
import dynamic from 'next/dynamic';

// Supabase sync is lazy: the @supabase/* tree is heavy (50 KB gz) and
// 92% unused on anonymous home (Lighthouse). The mounter loads after
// hydration as its own async chunk — anonymous visitors skip it
// entirely, signed-in users get it concurrently with other lazy code.
const SupabaseSyncMounter = dynamic(
  () => import('@/components/SupabaseSyncMounter'),
  { ssr: false },
);
// ────────────────────────────────────────────────────────────────────
// Lazy-loaded route components.
// Only the home view (NewsFeed) and the always-visible chrome (Sidebar)
// load eagerly. Everything else is fetched on first navigation, which
// strips ~250 kB of JS off the initial bundle and dramatically improves
// time-to-interactive on slow devices and 3G connections.
// Each one ships a lightweight skeleton fallback so the user sees an
// immediate response on click instead of a blank screen during the
// chunk download.
// ────────────────────────────────────────────────────────────────────
function ViewLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
      <div className="lc-shimmer" style={{ height: 36, width: 240, borderRadius: 10 }} />
      <div className="lc-shimmer" style={{ height: 18, width: '60%', borderRadius: 6 }} />
      <div className="lc-shimmer" style={{ height: 120, width: '100%', borderRadius: 14, marginTop: 10 }} />
      <div className="lc-shimmer" style={{ height: 120, width: '100%', borderRadius: 14 }} />
      <div className="lc-shimmer" style={{ height: 120, width: '100%', borderRadius: 14 }} />
    </div>
  );
}

/**
 * Lightweight placeholder used for views that are temporarily parked in the
 * backlog (Profile, Home/NewsFeed). Renders a centred card with title +
 * description so the navigation remains functional but the actual feature
 * is hidden until we ship its update.
 */
function ComingSoonStub({ title, description }: { title: string; description: string }) {
  return (
    <div style={{
      minHeight: '50vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{
        maxWidth: 480, width: '100%',
        background: '#FFFFFF',
        border: '1px solid #F0F1F5',
        borderRadius: 18,
        padding: '28px 28px 30px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          background: '#EFF4FF',
          color: '#2563EB',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          Скоро
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.02em',
          marginBottom: 8,
        }}>
          {title}
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280',
          lineHeight: 1.6,
        }}>
          {description}
        </p>
      </div>
    </div>
  );
}
const ToolsPage = dynamic(() => import('@/components/tools/ToolsPage'), { ssr: false, loading: ViewLoading });
const ToolView = dynamic(() => import('@/components/tools/ToolView'), { ssr: false, loading: ViewLoading });
const ProfilePage = dynamic(() => import('@/components/profile/ProfilePage'), { ssr: false, loading: ViewLoading });
const StatisticsPage = dynamic(() => import('@/components/stats/StatisticsPage'), { ssr: false, loading: ViewLoading });
const TestsPage = dynamic(() => import('@/components/tests/TestsPage'), { ssr: false, loading: ViewLoading });
const CoursePage = dynamic(() => import('@/components/course/CoursePage'), { ssr: false, loading: ViewLoading });
// Module / course grids stay eager — they render alongside the section
// browser which is the hot path after the home feed.
import NewsFeed from '@/components/feed/NewsFeed';
import Sidebar from '@/components/layout/Sidebar';
// ModuleGrid + CourseGrid pull `getModulesBySection`/`getModuleById`
// from lib/curriculum.ts (~230 KB). They're only rendered when the
// user navigates into a section / module, never on initial home paint.
// Lazy-loading them keeps the curriculum data out of the home bundle.
const ModuleGrid = dynamic(() => import('@/components/home/ModuleGrid'), { ssr: false, loading: ViewLoading });
const CourseGrid = dynamic(() => import('@/components/home/CourseGrid'), { ssr: false, loading: ViewLoading });
import { ArrowLeft, ArrowRight } from '@/components/icons';
import { motion } from 'framer-motion';

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

  // Set lookup is O(1) per check; ~700 completedCourses × 12 sections
  // would be O(n*m) without it. Memoise once per render.
  const completedSet = new Set(completedCourses);

  const renderSection = (secId: SectionId, i: number) => {
    const sec = sections.find((s) => s.id === secId);
    if (!sec) return null;
    // Precomputed lookups (build-time) keep us from importing the full
    // modules array on home — drops ~200 KB raw / ~50 KB gz from the
    // initial chunk.
    const totalCourses = SECTION_TOTAL_COURSES[sec.id] ?? 0;
    const courseIdsInSection = SECTION_COURSE_IDS[sec.id] ?? [];
    let completedCount = 0;
    for (const cid of courseIdsInSection) {
      if (completedSet.has(cid)) completedCount++;
    }
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
                {completedCount > 0 ? `${pct}% пройдено` : `${totalCourses} курсов`}
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
          <div className="rg-3">
            {ids.map((id, i) => renderSection(id, i))}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ═══ Main ═══ */
export default function Home() {
  // Cross-device sync via lazy <SupabaseSyncMounter /> below — see the
  // top-of-file dynamic import. The mounter renders nothing visible;
  // it just calls useSupabaseSync() once Supabase code finishes
  // loading post-hydration.

  // Hide the pre-hydration skeleton (rendered in app/layout.tsx) as soon
  // as React's first effect runs. Two-phase fade:
  //   data-ready="1" → CSS opacity transition kicks in
  //   data-ready="2" → display:none after the fade so the skeleton stops
  //                    consuming layers / paint cycles.
  useEffect(() => {
    document.documentElement.dataset.ready = '1';
    const t = setTimeout(() => {
      document.documentElement.dataset.ready = '2';
    }, 250);
    return () => clearTimeout(t);
  }, []);

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
  // Module *header* metadata is precomputed in MODULE_META — title +
  // description + color. The full course list is rendered by the
  // already-lazy <CourseGrid> component, which can pull whatever
  // curriculum data it needs without affecting the home bundle.
  const mod = activeModuleId
    ? (MODULE_META[activeModuleId]
      ? { id: activeModuleId, ...MODULE_META[activeModuleId]! }
      : null)
    : null;

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

  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      <SupabaseSyncMounter />
      <Sidebar />
      <div
        className="app-main-wrap"
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          minWidth: 0, height: '100dvh',
          // Visually lift the main content over the sidebar — creates a soft card feel.
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
          background: '#FFFFFF',
          overflow: 'hidden', // clip inner main's scroll to the rounded corners
          boxShadow: '0 0 0 1px #F0F1F5',
        }}>
        {/* Mobile hamburger + title — only shown < 768px */}
        <div className="mobile-topbar">
          <button
            onClick={toggleSidebar}
            aria-label="Открыть меню"
            style={{
              padding: 8, background: 'transparent', border: 'none',
              borderRadius: 8, cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', color: '#1A1A1A',
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1={3} y1={6} x2={21} y2={6} />
              <line x1={3} y1={12} x2={21} y2={12} />
              <line x1={3} y1={18} x2={21} y2={18} />
            </svg>
          </button>
          <picture>
            <source srcSet="/logo-bordik.webp" type="image/webp" />
            <img src="/logo-bordik.png" alt="Bordik" style={{ height: 22, width: 'auto' }} />
          </picture>
        </div>
        <main id="main-content" style={{
          flex: 1, overflowY: 'auto', background: '#FFFFFF',
          display: 'flex', flexDirection: 'column',
        }}>
          <div className="app-main-inner">

          {/* Profile and Home (NewsFeed) views are parked in the backlog —
               original components are still imported and ready to swap back
               in once the feature work resumes. For now both views render a
               lightweight "coming soon" stub. */}
          {view === 'profile' && (
            <ComingSoonStub
              title="Профиль"
              description="Раздел временно отключён — мы доработаем его и вернём позже."
            />
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
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
                style={{ marginBottom: 'var(--space-5)' }}
              >
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
              </motion.div>
              <SectionCards onSelect={setActiveSection} />
            </div>
          )}

          {view === 'home' && (
            <ComingSoonStub
              title="Главная"
              description="Лента новостей вернётся после редизайна. Загляните в Обучение или Инструменты."
            />
          )}

          </div>

          {/* Powered-by footer — sticky-to-bottom via marginTop: auto.
               When content is short, the auto-margin eats the remaining
               vertical space and pushes the footer to the bottom of the
               viewport. When content is taller than viewport, the footer
               flows naturally at the very end of the scroll area. */}
          <footer style={{
            marginTop: 'auto',
            padding: '16px 24px',
            borderTop: '1px solid #F0F1F5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'var(--font-body)', fontSize: 12, color: '#9CA3AF',
            letterSpacing: '0.01em',
          }}>
            <span>Powered by</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
              color: '#1A1A1A', letterSpacing: '-0.01em',
            }}>
              Desli
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
