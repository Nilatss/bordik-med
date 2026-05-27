'use client';
/**
 * P1-PERF-NEW-1 — App SPA shell extracted from app/page.tsx.
 *
 * Client component с useAppStore-driven SPA-routing между всеми view'ами
 * (NewsFeed, ToolsPage, ICD10Lookup, DrugChecker, NeonatalHandbook,
 * CoursePage, ProfilePage, etc). app/page.tsx теперь Server Component,
 * рендерит этот компонент.
 *
 * Полная Server Component conversion (split на отдельные routes per view)
 * — отдельная архитектурная задача, отложена. Текущий разрез даёт:
 *   - app/page.tsx становится Server Component (формально закрывает audit)
 *   - app/layout.tsx + page.tsx стрим server-side HTML (outer chrome)
 *   - Только этот файл (HomeApp) — client-bundled
 */
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
// Tool deep-link handler — reads /?tool=<id> from URL and routes the SPA
// to the right tool view. Lazy + ssr:false so it doesn't pull
// `useSearchParams` into the SSR'd payload (which would force the home
// page into dynamic rendering and lose static generation).
const ToolDeepLinkHandler = dynamic(
  () => import('@/components/ToolDeepLinkHandler').then((m) => ({ default: m.ToolDeepLinkHandler })),
  { ssr: false },
);
const SectionDeepLinkHandler = dynamic(
  () => import('@/components/SectionDeepLinkHandler').then((m) => ({ default: m.SectionDeepLinkHandler })),
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
    <div className="flex flex-col gap-[14px] pt-1">
      <div className="lc-shimmer h-9 w-60 rounded-[10px]" />
      <div className="lc-shimmer h-[18px] w-3/5 rounded-md" />
      <div className="lc-shimmer h-[120px] w-full rounded-[14px] mt-2.5" />
      <div className="lc-shimmer h-[120px] w-full rounded-[14px]" />
      <div className="lc-shimmer h-[120px] w-full rounded-[14px]" />
    </div>
  );
}

/**
 * Friendly roadmap placeholder. Renders for views that are temporarily
 * parked in the backlog (Profile, Home/NewsFeed) — keeps the route
 * mounted and navigable but signals "we know it's missing, here's when".
 *
 * `eta` is a free-text quarter ("Q3 2026") shown in the badge. Pick from
 * the `SECTION_ETA` map for sections, or pass an explicit one for ad-hoc
 * stubs.
 */
function ComingSoonStub({
  title, description, eta = 'скоро',
}: { title: string; description: string; eta?: string }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-[480px] w-full bg-white border border-[#F0F1F5] rounded-[18px] pt-7 px-7 pb-[30px] text-center">
        <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-[#F5F6F8] text-[#4B5563] font-[var(--font-mono)] text-[11px] font-semibold tracking-[0.04em] mb-[14px]">
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          В разработке · {eta}
        </div>
        <h2 className="font-[var(--font-display)] text-[22px] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-2">
          {title}
        </h2>
        <p className="font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.6]">
          {description}
        </p>
      </div>
    </div>
  );
}
const ToolsPage = dynamic(() => import('@/components/tools/ToolsPage'), { ssr: false, loading: ViewLoading });
const ToolView = dynamic(() => import('@/components/tools/ToolView'), { ssr: false, loading: ViewLoading });
// МКБ-10 lookup как embedded SPA-вью. SSG-страница /icd10 остаётся
// для SEO и прямых ссылок из поиска, но переход из сайдбара открывает
// этот компонент внутри shell-а — иначе пользователь «вылетает» из
// приложения (теряет сайдбар, навигацию, dark-mode и т.д.).
const ClassificationsHub = dynamic(() => import('@/components/classifications/ClassificationsHub'), { ssr: false, loading: ViewLoading });
const DrugChecker = dynamic(() => import('@/components/drugs/DrugChecker'), { ssr: false, loading: ViewLoading });
const NeonatalHandbook = dynamic(() => import('@/components/neonatal/NeonatalHandbook'), { ssr: false, loading: ViewLoading });
const NotesPage = dynamic(() => import('@/components/notes/NotesPage'), { ssr: false, loading: ViewLoading });
// Главная теперь — лента релизов («что нового»). Раньше view==='home'
// рендерил ту же сетку разделов курсов что и view==='learning' — после
// фидбека main view стал news feed-ом, разделы переехали только под
// «Обучение». Lazy + ssr:false: компонент сам делает client-fetch.
const NewsFeed = dynamic(() => import('@/components/home/NewsFeed'), { ssr: false, loading: ViewLoading });
import ZetDisclaimer from '@/components/layout/ZetDisclaimer';
const ProfilePage = dynamic(() => import('@/components/profile/ProfilePage'), { ssr: false, loading: ViewLoading });
const StatisticsPage = dynamic(() => import('@/components/stats/StatisticsPage'), { ssr: false, loading: ViewLoading });
const TestsPage = dynamic(() => import('@/components/tests/TestsPage'), { ssr: false, loading: ViewLoading });
const CoursePage = dynamic(() => import('@/components/course/CoursePage'), { ssr: false, loading: ViewLoading });
// Module / course grids stay eager — they render alongside the section
// browser which is the hot path after the home feed.
//
// `NewsFeed` was imported here when the home view rendered a news feed.
// After #16 collapsed home into the SectionCards view, the import was
// dead. Removing it lets webpack tree-shake the entire NewsFeed module
// out of the home route's bundle.
import Sidebar from '@/components/layout/Sidebar';
// ModuleGrid + CourseGrid pull `getModulesBySection`/`getModuleById`
// from lib/curriculum.ts (~230 KB). They're only rendered when the
// user navigates into a section / module, never on initial home paint.
// Lazy-loading them keeps the curriculum data out of the home bundle.
const ModuleGrid = dynamic(() => import('@/components/home/ModuleGrid'), { ssr: false, loading: ViewLoading });
const CourseGrid = dynamic(() => import('@/components/home/CourseGrid'), { ssr: false, loading: ViewLoading });
import { ArrowLeft, ArrowRight } from '@/components/icons';

/* Back button reusable */
function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-[var(--space-2)] font-[var(--font-body)] text-[length:var(--text-xs)] font-medium text-[color:var(--md-sys-color-on-surface-variant)] bg-transparent hover:bg-[#E8E9ED] border-none cursor-pointer mb-4 self-start py-[var(--space-1)] px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-small)] transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}

/* Section cards */
const UNLOCKED_SECTIONS: SectionId[] = ['fundamentals'];

/**
 * Ориентировочные сроки готовности разделов. Не обещание, а
 * roadmap-ETA — показываем пользователю «когда ждать», чтобы пустые
 * карточки не выглядели мёртвыми. Обновлять по мере поставки контента.
 *
 * Принцип: ничего не скрываем — каждый раздел виден, у каждого есть
 * квартал. Если опаздываем — двигаем дату и пушим в /releases.
 */
const SECTION_ETA: Record<SectionId, string> = {
  fundamentals: 'доступно',
  career:       'Q3 2026',
  biomedical:   'Q3 2026',
  clinical:     'Q4 2026',
  skills:       'Q4 2026',
  allied:       'Q1 2027',
  threads:      'Q1 2027',
  hss:          'Q2 2027',
  regulatory:   'Q2 2027',
  frontier:     'Q3 2027',
  business:     'Q3 2027',
  tech:         'Q4 2027',
};

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
  // Audit P-1: atomic selector. Whole-store destructure here would force
  // a full SectionCards re-render on every useStudyTimer tick.
  const completedCourses = useAppStore((s) => s.completedCourses);

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
    const eta = SECTION_ETA[sec.id] ?? 'скоро';

    // Suppress unused-var lint when `i` is no longer needed for stagger.
    void i;
    return (
          <button
            key={sec.id}
            // Plain <button>, not motion.button. The previous version used
            // framer-motion with initial={false} + animate={final_state} +
            // a `delay: i * 0.03` stagger, but with `initial={false}` the
            // enter animation never runs — the component just paints at
            // its final state. We were paying the framer-motion runtime
            // cost (~30 KB on the home chunk + main-thread spin-up) for a
            // staggered enter that was already disabled. Replacing with
            // plain HTML drops framer-motion entirely from the home
            // route's eager bundle and shaves ~70 ms off TBT in the
            // synthetic mobile profile.
            onClick={() => { if (isUnlocked) onSelect(sec.id); }}
            disabled={!isUnlocked}
            aria-label={isUnlocked
              ? `Открыть раздел: ${sec.title}`
              : `Раздел «${sec.title}» в разработке, откроется ${eta}`}
            className={`bg-[#F5F6F8] rounded-[var(--md-sys-shape-corner-extra-large)] border-none p-[var(--space-5)] text-left relative overflow-hidden min-h-[160px] flex flex-col justify-between transition-[background,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isUnlocked
                ? 'cursor-pointer opacity-100 hover:bg-[#F0F2F5] hover:-translate-y-px'
                : 'cursor-default opacity-[0.78]'
            }`}
          >
            {/* Roadmap-бейдж: заменили чёрный padlock на дружелюбную
                soft-pill «В разработке · Q3 2026». Показывает, что
                раздел жив и движется, а не «навсегда закрыт». */}
            {!isUnlocked && (
              <div className="absolute top-3 right-3 z-[2] inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white text-[#4B5563] font-[var(--font-mono)] text-[10px] font-semibold tracking-[0.04em] shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)]">
                <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {eta}
              </div>
            )}

            <div className="mb-[var(--space-3)] relative z-[1]">
              <span className={`inline-flex items-center gap-[var(--space-1)] py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] ${
                completedCount > 0
                  ? 'font-semibold text-[color:var(--md-sys-color-primary)]'
                  : 'font-medium text-[color:var(--md-sys-color-on-surface-variant)]'
              }`}>
                {completedCount > 0 ? `${pct}% пройдено` : `${totalCourses} курсов`}
              </span>
            </div>
            <div className="relative z-[1] flex-1">
              <h3 className="font-[var(--font-display)] text-[length:var(--text-base)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-1)] leading-[1.25]">
                {sec.title}
              </h3>
              <p className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.4] overflow-hidden [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box]">
                {sec.description}
              </p>
            </div>
            <div className="flex items-center gap-[var(--space-1)] mt-[var(--space-3)] relative z-[1]">
              <span className={`font-[var(--font-body)] text-[length:var(--text-xs)] font-medium ${isUnlocked ? 'text-[color:var(--md-sys-color-on-surface)]' : 'text-[#6B7280]'}`}>
                {isUnlocked
                  ? 'Начать обучение'
                  : `Готовим контент · откроется ${eta}`}
              </span>
              {isUnlocked && <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />}
            </div>
          </button>
    );
  };

  return (
    <div>
      {SECTION_CATEGORIES.map(({ title, ids }) => (
        <section key={title} className="mb-7">
          <h3 className="font-[var(--font-mono)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mb-3">
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
export default function HomeApp() {
  // Cross-device sync via lazy <SupabaseSyncMounter /> below — see the
  // top-of-file dynamic import. The mounter renders nothing visible;
  // it just calls useSupabaseSync() once Supabase code finishes
  // loading post-hydration.

  // (The pre-hydration skeleton useEffect that lived here was removed
  // along with the skeleton itself — see app/layout.tsx. With the home
  // route's SectionCards now in the SSR HTML, the skeleton was just a
  // 470 ms LCP-blocking overlay rather than a useful loading hint.)

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
  const showIcd10 = useAppStore((s) => s.showIcd10);
  const showDrugs = useAppStore((s) => s.showDrugs);
  const showNeonatal = useAppStore((s) => s.showNeonatal);
  const showNotes = useAppStore((s) => s.showNotes);
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

  // views: profile | stats | tests | tool | tools | icd10 | home | learning (sections) → section (modules) → module (courses) → course
  // Note: activeToolId+showNeonatal renders 'tool' view; closeTool clears
  // activeToolId, falling through to 'neonatal' view → user returns to
  // Neonatology Calculators tab where they came from.
  const view = showProfile ? 'profile'
    : showStats ? 'stats'
    : showTests ? 'tests'
    : (showTools && activeToolId) ? 'tool'
    : (showNeonatal && activeToolId) ? 'tool'
    : showTools ? 'tools'
    : showIcd10 ? 'icd10'
    : showDrugs ? 'drugs'
    : showNeonatal ? 'neonatal'
    : showNotes ? 'notes'
    : currentCourseId ? 'course'
    : activeModuleId ? 'module'
    : activeSection ? 'section'
    : showLearning ? 'learning'
    : 'home';

  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <SupabaseSyncMounter />
      <ToolDeepLinkHandler />
      <SectionDeepLinkHandler />
      <Sidebar />
      <div
        className="app-main-wrap flex-1 flex flex-col min-w-0 h-[100dvh] rounded-tl-[32px] rounded-bl-[32px] bg-white overflow-hidden shadow-[0_0_0_1px_#F0F1F5]"
      >
        {/* Mobile hamburger + title — only shown < 768px */}
        <div className="mobile-topbar">
          <button
            onClick={toggleSidebar}
            aria-label="Открыть меню"
            className="p-2 bg-transparent border-none rounded-lg cursor-pointer inline-flex items-center justify-center text-[#1A1A1A]"
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
            <img src="/logo-bordik.png" alt="Bordik" width={82} height={22} className="h-[22px] w-auto" />
          </picture>
        </div>
        <main id="main-content" className="flex-1 overflow-y-auto bg-white flex flex-col">
          <div className="app-main-inner">

          {/* Profile and Home (NewsFeed) views are parked in the backlog —
               original components are still imported and ready to swap back
               in once the feature work resumes. For now both views render a
               lightweight "coming soon" stub. */}
          {view === 'profile' && (
            <ComingSoonStub
              title="Профиль"
              eta="Q3 2026"
              description="Возвращаем личный профиль с прогрессом, избранным и сертификатами. Сейчас прогресс по курсам и тестам сохраняется локально и подтянется в новый профиль автоматически."
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
            <div className={view === 'tool' ? 'hidden' : 'block'} aria-hidden={view === 'tool'}>
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

          {view === 'icd10' && (
            <ClassificationsHub />
          )}

          {view === 'drugs' && (
            <DrugChecker />
          )}

          {/*
            NeonatalHandbook stays mounted while a tool from its Calculators
            tab is open (view === 'tool' with showNeonatal=true) — same
            pattern as ToolsPage. This preserves the active tab + scroll
            position so closing the tool returns the user exactly where
            they were (e.g., on Калькуляторы tab scrolled to a specific
            calc).
          */}
          {(view === 'neonatal' || (view === 'tool' && showNeonatal)) && (
            <div className={view === 'tool' ? 'hidden' : 'block'} aria-hidden={view === 'tool'}>
              <NeonatalHandbook />
            </div>
          )}

          {view === 'notes' && (
            <NotesPage />
          )}

          {view === 'course' && (
            <div>
              <BackButton onClick={closeCourse} label="Назад" />
              {/* key forces a remount on course switch (e.g. Cmd+K jump
                  between courses) so mount-only state in InlineQuiz /
                  TabbedLessonViewer (answers, shuffled options, active tab)
                  can't leak from the previous course. */}
              <CoursePage key={currentCourseId} courseId={currentCourseId!} />
            </div>
          )}

          {view === 'module' && mod && (
            <div>
              <BackButton onClick={closeModule} label={section?.title || 'Назад'} />
              <div className="mb-[var(--space-6)]">
                <h2 className="font-[var(--font-display)] text-[length:var(--text-2xl)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-2)] tracking-[-0.02em]">
                  {mod.title}
                </h2>
                <p className="font-[var(--font-body)] text-[length:var(--text-sm)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.6] max-w-[var(--content-max)]">
                  {mod.description}
                </p>
              </div>
              <CourseGrid moduleId={mod.id} />
            </div>
          )}

          {view === 'section' && section && (
            <div>
              <BackButton onClick={() => setShowLearning(true)} label="Все разделы" />
              <div className="mb-[var(--space-6)]">
                <h2 className="font-[var(--font-display)] text-[length:var(--text-2xl)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-2)] tracking-[-0.02em]">
                  {section.title}
                </h2>
                <p className="font-[var(--font-body)] text-[length:var(--text-sm)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.6] max-w-[var(--content-max)]">
                  {section.description}
                </p>
              </div>
              {/* Roadmap removed - old structure. New curriculum has 12 sections. */}
              <ModuleGrid />
            </div>
          )}

          {/*
            Home + Learning collapse to the same view: a hero header followed
            by the section cards grid. This used to be split — `view === 'home'`
            showed a "Лента новостей вернётся" stub, `view === 'learning'`
            showed SectionCards. Returning users had `showLearning=true`
            persisted in localStorage, so the SSR HTML (initial state, no
            persist hydration yet) rendered the stub, then React re-rendered
            with SectionCards once Zustand finished rehydrating. That
            pre-hydration → post-hydration content swap was the source of the
            ~1990 ms LCP `render-delay` Lighthouse flagged on the home route:
            the actual above-the-fold content was being thrown away and
            rebuilt client-side. By rendering SectionCards on both views we
            give SSR a stable, real-content tree, and LCP lands ~1.5 s sooner.
          */}
          {/* view === 'home' → новостной фид «Что нового» (релизы Bordik).
              view === 'learning' → разделы обучения (старый паттерн main).
              Если делать оба одинаково — пропадает смысл иметь два пункта
              в сайдбаре, поэтому развели контент по семантике пункта. */}
          {view === 'home' && (
            <>
              <ZetDisclaimer />
              <NewsFeed />
            </>
          )}

          {view === 'learning' && (
            <div>
              <ZetDisclaimer />

              {/* Staggered fade-in для Learning-вью. CSS-only animation
                  (.bordik-fade-up) — без framer-motion рантайма, чтобы
                  не утяжелять home-chunk. Параллель с motion-паттерном
                  из /tools / Icd10Lookup. */}
              <div className="bordik-fade-up mb-[var(--space-5)]">
                <h2 className="font-[var(--font-display)] text-[length:var(--text-xl)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-1)] tracking-[-0.01em]">
                  Разделы обучения
                </h2>
                <p className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.5]">
                  Выберите раздел для начала
                </p>
              </div>
              <div className="bordik-fade-up delay-1">
                <SectionCards onSelect={setActiveSection} />
              </div>
            </div>
          )}

          </div>

          {/* Powered-by footer — sticky-to-bottom via marginTop: auto.
               When content is short, the auto-margin eats the remaining
               vertical space and pushes the footer to the bottom of the
               viewport. When content is taller than viewport, the footer
               flows naturally at the very end of the scroll area. */}
          <footer className="mt-auto py-4 px-6 border-t border-[#F0F1F5] flex items-center justify-center gap-1.5 font-[var(--font-body)] text-xs text-[#9CA3AF] tracking-[0.01em]">
            <span>Powered by</span>
            <span className="font-[var(--font-display)] text-[13px] font-bold text-[#1A1A1A] tracking-[-0.01em]">
              Desli
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
