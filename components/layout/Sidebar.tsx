'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
// framer-motion removed in 2026-04-28 perf pass — replaced with pure
// CSS transitions in app/globals.css (.sidebar-overlay, .sidebar-drawer,
// .feedback-modal-overlay, .feedback-modal-card). Saves ~80 kB raw / 30
// kB gz from the home critical path bundle.
import { useAppStore } from '@/lib/store';
import { useT, useLang } from '@/lib/i18n';
// `searchCourses` references the full 230 KB modules array from
// lib/curriculum.ts. Importing it eagerly forces Sidebar (which mounts
// on every route) to drag the curriculum data into the home bundle.
// Instead we dynamically import on first non-empty query — UX cost is
// a ~50-200 ms one-time chunk download on the user's first search.
import type { SearchableCourse } from '@/lib/curriculum';
// CATALOG_TOOLS (172 kB) is dynamically imported below — lazy until the
// user actually starts searching while on the Tools view.
import type { CatalogTool } from '@/lib/tools-catalog';
import nextDynamic from 'next/dynamic';
import Highlight from '@/components/ui/Highlight';

// UserMenu pulls @supabase (~50 kB gz). Lazy-loading it stops Sidebar
// (which is eager on every route) from dragging Supabase into the
// initial home bundle. The visual placeholder during chunk download
// is just the existing avatar circle from the static SVG below.
const UserMenu = nextDynamic(() => import('./UserMenu'), { ssr: false });

type NavItem = 'home' | 'learning' | 'tests' | 'tools' | 'icd10' | 'drugs' | 'neonatal' | 'stats' | 'profile';

// Highlight вынесен в `components/ui/Highlight.tsx` — единый паттерн
// для всех мест поиска (sidebar, Cmd+K, фильтры, /icd10).
// Если нужна подсветка в новом месте — используем тот же компонент.

interface NavDef {
  id: NavItem;
  label: string;
  keywords: string[];
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const t = useT();
  const lang = useLang();
  const {
    activeSection,
    showProfile,
    showLearning,
    showTools,
    showStats,
    showTests,
    showIcd10,
    showDrugs,
    showNeonatal,
    goHome,
    setShowLearning,
    setShowTools,
    setShowStats,
    setShowTests,
    setShowIcd10,
    setShowDrugs,
    setShowNeonatal,
    toggleProfile,
    sidebarOpen,
    toggleSidebar,
    openCourse,
    setActiveSection,
    openTool,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  // Sidebar opens on desktop by default, stays closed on mobile.
  // Store default is `false`; we flip it to `true` here on ≥ 768 px.
  // Running in useEffect is fine — first paint shows no sidebar on any width
  // (avoids the mobile flash), and desktop users get it back immediately.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    if (mq.matches) {
      useAppStore.setState({ sidebarOpen: true });
    }
    // Keep sidebar in sync when viewport crosses the breakpoint (resize / rotate).
    const onChange = (e: MediaQueryListEvent) => {
      useAppStore.setState({ sidebarOpen: e.matches });
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeNav: NavItem = showProfile
    ? 'profile'
    : showStats
      ? 'stats'
      : showTests
        ? 'tests'
        : showTools
          ? 'tools'
          : showIcd10
            ? 'icd10'
            : showDrugs
              ? 'drugs'
              : showNeonatal
                ? 'neonatal'
                : (activeSection || showLearning)
                  ? 'learning'
                  : 'home';

  const handleNav = (item: NavItem) => {
    if (item === 'home') goHome();
    else if (item === 'profile') toggleProfile();
    else if (item === 'learning') setShowLearning(true);
    else if (item === 'tests') setShowTests(true);
    else if (item === 'tools') setShowTools(true);
    else if (item === 'icd10') setShowIcd10(true);
    else if (item === 'drugs') setShowDrugs(true);
    else if (item === 'neonatal') setShowNeonatal(true);
    else if (item === 'stats') setShowStats(true);
    // Auto-close drawer on mobile so the user actually sees the destination.
    // Profile is a modal panel that overlays the sidebar - closing the
    // sidebar there would hide the modal too, so we leave it alone.
    if (item !== 'profile' && typeof window !== 'undefined' &&
        window.matchMedia('(max-width: 768px)').matches) {
      useAppStore.setState({ sidebarOpen: false });
    }
  };

  /* Prefetch the heavy chunks on hover/focus so they're already cached
   * by the time the user actually clicks. Each lazy route lives in its
   * own webpack chunk; calling the import() now forces the browser to
   * fetch+parse it in the background. Idempotent — repeat hovers are
   * cheap. */
  const prefetched = useState(() => new Set<NavItem>())[0];
  const prefetch = (item: NavItem) => {
    if (prefetched.has(item)) return;
    prefetched.add(item);
    switch (item) {
      case 'tools':    void import('@/components/tools/ToolsPage'); break;
      case 'tests':    void import('@/components/tests/TestsPage'); break;
      case 'stats':    void import('@/components/stats/StatisticsPage'); break;
      case 'profile':  void import('@/components/profile/ProfilePage'); break;
      case 'icd10':    void import('@/components/classifications/ClassificationsHub'); break;
      case 'drugs':    void import('@/components/drugs/DrugChecker'); break;
      case 'neonatal': void import('@/components/neonatal/NeonatalHandbook'); break;
      case 'learning': /* no chunk — sections render in app/page.tsx */ break;
      case 'home':     /* eager */ break;
    }
  };

  const navItems: Record<NavItem, NavDef> = {
    home: {
      id: 'home',
      label: t('nav.home'),
      keywords: ['главная', 'home', 'старт', 'dashboard'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    learning: {
      id: 'learning',
      label: t('nav.learning'),
      keywords: ['обучение', 'курсы', 'модули', 'learning', 'courses', 'уроки'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
    },
    tests: {
      id: 'tests',
      label: t('nav.tests'),
      keywords: ['тесты', 'тест', 'экзамен', 'tests', 'exam', 'quiz', 'проверка'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
          <polyline points="9,14 11,16 15,12" />
        </svg>
      ),
    },
    tools: {
      id: 'tools',
      label: t('nav.tools'),
      keywords: ['инструменты', 'калькулятор', 'tools', 'calculator', 'бми', 'bmi'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    icd10: {
      id: 'icd10',
      label: 'Классификации',
      keywords: ['классификации', 'classifications', 'мкб', 'мкб-10', 'мкб-11', 'icd', 'icd10', 'icd-10', 'icd-11', 'icd-10-cm', 'icd-10-pcs', 'icd-10-ca', 'icd-10-gm', 'icd-10-am', 'диагноз', 'код', 'справочник', 'classification', 'международная классификация'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      ),
    },
    drugs: {
      id: 'drugs',
      label: 'Взаимодействия',
      keywords: ['взаимодействия', 'лекарства', 'препараты', 'drug', 'interaction', 'interactions', 'фарма', 'фармакология', 'совместимость', 'варфарин', 'амиодарон', 'клопидогрел'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.5 20.5L20 11a4.95 4.95 0 00-7-7L3.5 13.5a4.95 4.95 0 007 7z" />
          <path d="M8.5 8.5l7 7" />
        </svg>
      ),
    },
    neonatal: {
      id: 'neonatal',
      label: 'Неонатология',
      keywords: ['неонатология', 'неонатальный', 'неонатал', 'новорождённые', 'новорожденные', 'нику', 'nicu', 'neonatal', 'newborn', 'infant', 'preterm', 'недоношенные', 'педиатр'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h.01" />
          <path d="M15 12h.01" />
          <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
          <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
        </svg>
      ),
    },
    stats: {
      id: 'stats',
      label: t('nav.stats'),
      keywords: ['статистика', 'stats', 'statistics', 'прогресс', 'активность', 'активити', 'analytics'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    profile: {
      id: 'profile',
      label: t('nav.profile'),
      keywords: ['профиль', 'настройки', 'profile', 'settings', 'аккаунт'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 10-16 0" />
        </svg>
      ),
    },
  };

  const groups: NavGroup[] = [
    { id: 'main',     title: t('nav.group.main'),     items: ['home', 'profile'] },
    { id: 'study',    title: t('nav.group.study'),    items: ['learning', 'tests', 'stats'] },
    { id: 'services', title: t('nav.group.services'), items: ['tools', 'icd10', 'drugs', 'neonatal'] },
  ];

  // Filter by search
  const q = searchQuery.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    if (!q) return groups;
    // Word-prefix match: разбиваем label/keyword по пробелам и дефисам
    // и проверяем, что хотя бы одно слово начинается с query. Раньше
    // использовался .includes(q) — для 'ка' он ловил подстроки в
    // 'аккаунт', 'проверка', 'статистика', 'фармакология' и т.д.,
    // поэтому в сайдбаре висели ВСЕ nav-разделы.
    const wordPrefixMatch = (text: string): boolean => {
      const t = text.toLowerCase();
      if (t.startsWith(q)) return true;
      // Слова разделяются пробелами, дефисами и слэшами — учитываем все три,
      // чтобы 'classifications' и 'мкб-10' матчились по 'мкб', 'icd' и т.п.
      return t.split(/[\s\-/]+/).some((w) => w.startsWith(q));
    };
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((id) =>
          wordPrefixMatch(navItems[id].label) ||
          navItems[id].keywords.some((k) => wordPrefixMatch(k))
        ),
      }))
      .filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, lang]);

  // Course search results — async-loaded curriculum module on first
  // non-empty query. State holds the latest result; first input has a
  // ~50-200 ms download delay, subsequent inputs are instant.
  const UNLOCKED_SECTIONS = ['fundamentals'];
  const searchModuleRef = useRef<{
    searchCourses: (q: string, limit?: number, preferSection?: string) => SearchableCourse[];
  } | null>(null);
  const [courseResults, setCourseResults] = useState<{
    available: SearchableCourse[];
    locked: SearchableCourse[];
  }>({ available: [], locked: [] });

  useEffect(() => {
    if (!q || q.length < 2) {
      setCourseResults({ available: [], locked: [] });
      return;
    }
    let cancelled = false;
    (async () => {
      if (!searchModuleRef.current) {
        // Dynamic import — first call costs a chunk fetch, after that
        // the function reference is cached on the ref.
        const mod = await import('@/lib/curriculum');
        searchModuleRef.current = { searchCourses: mod.searchCourses };
      }
      if (cancelled) return;
      const all = searchModuleRef.current.searchCourses(q, 30, activeSection ?? undefined);
      const available = all.filter((r) => UNLOCKED_SECTIONS.includes(r.module.sectionId));
      const locked = all.filter((r) => !UNLOCKED_SECTIONS.includes(r.module.sectionId));
      if (!cancelled) setCourseResults({ available, locked });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, activeSection]);

  // Tools search — context-aware: only fires when user is on the Tools view.
  // CATALOG_TOOLS is lazy-imported the first time someone actually searches,
  // so the 172-kB tool catalog doesn't sit in the home-page bundle.
  const [toolCatalog, setToolCatalog] = useState<CatalogTool[] | null>(null);
  useEffect(() => {
    if (!q || q.length < 2 || !showTools || toolCatalog) return;
    let cancelled = false;
    import('@/lib/tools-catalog').then((m) => {
      if (!cancelled) setToolCatalog(m.CATALOG_TOOLS);
    });
    return () => { cancelled = true; };
  }, [q, showTools, toolCatalog]);

  const toolResults = useMemo<CatalogTool[]>(() => {
    if (!q || q.length < 2 || !showTools || !toolCatalog) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored: { item: CatalogTool; score: number }[] = [];
    for (const t of toolCatalog) {
      const hay = `${t.title} ${t.description} ${t.category} ${t.subcategory}`.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (!hay.includes(tok)) { score = -1; break; }
        if (t.title.toLowerCase().startsWith(tok)) score += 6;
        if (t.title.toLowerCase().includes(tok)) score += 3;
        score += 1;
      }
      if (score > 0) {
        if (t.available) score += 2; // available tools first
        scored.push({ item: t, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 12).map((s) => s.item);
  }, [q, showTools, toolCatalog]);

  const totalCourseResults = courseResults.available.length + courseResults.locked.length;

  const handleCoursePick = (courseId: string, sectionId: string) => {
    // Set section first (for breadcrumbs), then open course. openCourse
    // already clears all other top-level view flags so we don't need to.
    setActiveSection(sectionId as never);
    openCourse(courseId);
    setSearchQuery('');
    // Auto-close drawer on mobile so the user actually sees the destination
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      useAppStore.setState({ sidebarOpen: false });
    }
  };

  const handleToolPick = (toolId: string) => {
    // openTool already flips into Tools view + clears other flags.
    openTool(toolId);
    setSearchQuery('');
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      useAppStore.setState({ sidebarOpen: false });
    }
  };

  const isSearching = q.length > 0;
  const hasResults = visibleGroups.length > 0 || totalCourseResults > 0 || toolResults.length > 0;

  return (
    <>
      {/* Mobile overlay — dimming backdrop behind the drawer.
          Pure CSS opacity transition (was framer-motion). The wrapper is
          always rendered; `pointer-events: none` plus `opacity: 0` keeps
          it from intercepting clicks when the drawer is closed. */}
      <div
        className="sidebar-overlay md:hidden"
        data-open={sidebarOpen ? 'true' : 'false'}
        onClick={toggleSidebar}
        aria-hidden={!sidebarOpen}
      />

      <aside
        className="app-sidebar-aside sidebar-drawer fixed md:sticky top-0 z-50"
        data-open={sidebarOpen ? 'true' : 'false'}
        style={{
          width: 280,
          height: '100dvh',
          background: '#F0F1F5',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Logo — WebP first (55 kB), PNG fallback (53 kB) for any
            browsers that somehow can't handle WebP in 2026. */}
        <div style={{ padding: '20px 24px 0' }}>
          <picture>
            <source srcSet="/logo-bordik.webp" type="image/webp" />
            <img
              src="/logo-bordik.png"
              alt="Bordik"
              style={{ height: 28, width: 'auto', display: 'block' }}
            />
          </picture>
        </div>

        {/* Date + welcome */}
        <div style={{ padding: '24px 24px 16px' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
            color: '#6B7280', marginBottom: 8,
          }}>
            {new Date().toLocaleDateString(
              { ru: 'ru-RU', en: 'en-GB', uz: 'uz-UZ' }[lang] || 'ru-RU',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </p>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
            color: '#1A1A1A', lineHeight: 1.15, letterSpacing: '-0.02em',
            whiteSpace: 'pre-line',
          }}>
            {t('sidebar.welcome')}
          </p>
        </div>

        {/* Search - matches nav item size */}
        <div style={{ padding: '0 12px 12px' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 16px',
              background: searchFocus ? '#E8E9ED' : '#E2E4EA',
              borderRadius: 12,
              transition: 'background 150ms',
            }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
              stroke={searchFocus ? '#555' : '#8B8F96'} strokeWidth={1.8}
              strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, transition: 'stroke 150ms' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder={t('nav.search')}
              style={{
                flex: 1, minWidth: 0,
                border: 'none', outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-body)', fontSize: 14.5,
                color: '#1A1A1A',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'transparent', border: 'none', padding: 0,
                  cursor: 'pointer', color: '#8B8F96',
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                }}
                aria-label="Clear"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation - grouped + course search results */}
        <nav style={{
          padding: '0 12px',
          flex: 1,
          overflowY: 'auto',
          scrollbarGutter: 'stable',
        }}>
          {isSearching && !hasResults ? (
            <div style={{
              padding: '20px 16px',
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#9CA3AF',
              textAlign: 'center',
            }}>
              {t('nav.nothingFound')}
            </div>
          ) : (
            <>
              {/* Nav groups */}
              {visibleGroups.map((group, gi) => (
                <div key={group.id} style={{ marginBottom: gi < visibleGroups.length - 1 ? 12 : 10 }}>
                  <p style={{
                    padding: '6px 16px 6px',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {group.title}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {group.items.map((id) => {
                      const item = navItems[id];
                      const isActive = activeNav === id;
                      return (
                        <button
                          key={id}
                          onClick={() => handleNav(id)}
                          onFocus={() => prefetch(id)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                            padding: '11px 16px',
                            borderRadius: 12,
                            background: isActive ? '#E2E4EA' : 'transparent',
                            border: 'none', cursor: 'pointer',
                            transition: 'background 150ms ease',
                          }}
                          onMouseEnter={(e) => {
                            prefetch(id);
                            if (!isActive) e.currentTarget.style.background = '#E8E9ED';
                          }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span style={{
                            display: 'flex',
                            color: isActive ? '#1A1A1A' : '#999',
                          }}>
                            {item.icon}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-body)', fontSize: 14.5,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? '#1A1A1A' : '#777',
                          }}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Tool results — only when user is on the Tools page */}
              {isSearching && toolResults.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <p style={{
                    padding: '6px 16px 6px',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>{t('nav.group.tools')}</span>
                    <span style={{
                      padding: '1px 6px', borderRadius: 999,
                      background: '#E2E4EA', color: '#6B7280',
                      fontSize: 9, fontWeight: 700,
                    }}>
                      {toolResults.length}
                    </span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {toolResults.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => tool.available && handleToolPick(tool.id)}
                        disabled={!tool.available}
                        style={{
                          width: '100%',
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                          gap: 2,
                          padding: '9px 14px',
                          borderRadius: 10,
                          background: 'transparent',
                          border: 'none',
                          cursor: tool.available ? 'pointer' : 'not-allowed',
                          opacity: tool.available ? 1 : 0.55,
                          textAlign: 'left',
                          transition: 'background 150ms',
                        }}
                        onMouseEnter={(e) => {
                          if (tool.available) e.currentTarget.style.background = '#E8E9ED';
                        }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                          color: '#1A1A1A',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}>
                          <Highlight text={tool.title} query={q} />
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 11, color: '#9CA3AF',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}>
                          <Highlight text={tool.subcategory} query={q} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Course results - available */}
              {isSearching && courseResults.available.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <p style={{
                    padding: '6px 16px 6px',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>{t('nav.group.coursesAvailable')}</span>
                    <span style={{
                      padding: '1px 6px', borderRadius: 999,
                      background: '#E2E4EA', color: '#6B7280',
                      fontSize: 9, fontWeight: 700,
                    }}>
                      {courseResults.available.length}
                    </span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {courseResults.available.map(({ course, module, section }) => (
                      <button
                        key={course.id}
                        onClick={() => handleCoursePick(course.id, module.sectionId)}
                        style={{
                          width: '100%',
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                          gap: 2,
                          padding: '9px 14px',
                          borderRadius: 10,
                          background: 'transparent',
                          border: 'none', cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 150ms',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E9ED'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          width: '100%',
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                            color: '#6B7280',
                            padding: '1px 5px', borderRadius: 4,
                            background: '#E2E4EA',
                            flexShrink: 0,
                          }}>
                            {course.id}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                            color: '#1A1A1A',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            flex: 1, minWidth: 0,
                          }}>
                            <Highlight text={course.title} query={q} />
                          </span>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 11, color: '#9CA3AF',
                          paddingLeft: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}>
                          <Highlight text={section?.title || module.title} query={q} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Course results - coming soon (locked) */}
              {isSearching && courseResults.locked.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <p style={{
                    padding: '10px 16px 6px',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderTop: courseResults.available.length > 0 ? '1px solid #E2E4EA' : 'none',
                    marginTop: courseResults.available.length > 0 ? 6 : 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>{t('nav.group.coursesSoon')}</span>
                    <span style={{
                      padding: '1px 6px', borderRadius: 999,
                      background: '#1A1A1A', color: '#FFFFFF',
                      fontSize: 9, fontWeight: 700,
                    }}>
                      {courseResults.locked.length}
                    </span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {courseResults.locked.map(({ course, module, section }) => (
                      <div
                        key={course.id}
                        style={{
                          width: '100%',
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                          gap: 2,
                          padding: '9px 14px',
                          borderRadius: 10,
                          background: 'transparent',
                          cursor: 'not-allowed',
                          textAlign: 'left',
                          opacity: 0.7,
                        }}
                        title={t('sidebar.courseSoonTooltip')}
                      >
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          width: '100%',
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                            color: '#9CA3AF',
                            padding: '1px 5px', borderRadius: 4,
                            background: '#ECEEF2',
                            flexShrink: 0,
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                          }}>
                            <svg width={8} height={8} viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            {course.id}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                            color: '#6B7280',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            flex: 1, minWidth: 0,
                          }}>
                            <Highlight text={course.title} query={q} />
                          </span>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 11, color: '#9CA3AF',
                          paddingLeft: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}>
                          <Highlight text={section?.title || module.title} query={q} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </nav>
        {/* Feedback / suggestion box - sits above the user menu in the
            previously empty bottom space. Opens a modal where the user
            can send a short message; submission opens a mailto: with the
            text prefilled so we get the email in our inbox. */}
        <FeedbackBlock t={t} />
        {/* App version - small muted text centered under the feedback section. */}
        <p style={{
          margin: '0 0 8px',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500,
          color: '#9CA3AF', letterSpacing: '0.04em',
          textAlign: 'center',
        }}>
          {t('sidebar.version', { version: '0.1.0' })}
        </p>
        {/* User menu — login state at the bottom of the sidebar */}
        <UserMenu />
      </aside>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Feedback block — sits at the bottom of the sidebar between the nav
   and the UserMenu. Click → modal with textarea + file attachments →
   POST /api/feedback → server forwards to Telegram via Bot API.
   File limits enforced both client-side (UX) and server-side (safety):
   5 files, 5 MB each.
   ────────────────────────────────────────────────────────────────── */
const FEEDBACK_MAX_FILES      = 5;
const FEEDBACK_MAX_FILE_BYTES = 5 * 1024 * 1024;

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FeedbackBlock({ t }: { t: (k: string, vars?: Record<string, string | number>) => string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setError(null);
    const next = [...files];
    for (let i = 0; i < incoming.length; i++) {
      const f = incoming.item(i);
      if (!f) continue;
      if (f.size > FEEDBACK_MAX_FILE_BYTES) {
        setError(t('sidebar.feedback.errFileTooLarge', { name: f.name }));
        continue;
      }
      if (next.length >= FEEDBACK_MAX_FILES) {
        setError(t('sidebar.feedback.errTooManyFiles'));
        break;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const reset = () => {
    setOpen(false);
    setText('');
    setFiles([]);
    setSent(false);
    setSending(false);
    setError(null);
  };

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('text', body);
      for (const f of files) fd.append('file', f, f.name);
      const r = await fetch('/api/feedback', { method: 'POST', body: fd });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || !json.ok) {
        const code = (json && json.error) || `http-${r.status}`;
        if (code === 'feedback-not-configured') {
          setError(t('sidebar.feedback.errNotConfigured'));
        } else if (code === 'too-many-files') {
          setError(t('sidebar.feedback.errTooManyFiles'));
        } else if (code === 'file-too-large') {
          setError(t('sidebar.feedback.errFileTooLarge', { name: json.name ?? '' }));
        } else {
          setError(t('sidebar.feedback.errSendFailed'));
        }
        setSending(false);
        return;
      }
      setSent(true);
      setTimeout(reset, 1500);
    } catch {
      setError(t('sidebar.feedback.errNetwork'));
      setSending(false);
    }
  };

  return (
    <>
      {/* Same visual language as nav items: section header + flat
          transparent button with hover grey, neutral icon. */}
      <div style={{ padding: '4px 12px 12px', marginTop: 4 }}>
        <p style={{
          padding: '6px 16px 6px',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          margin: 0,
        }}>
          {t('sidebar.feedback.section')}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('sidebar.feedback.title')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '11px 16px',
            borderRadius: 12,
            background: 'transparent',
            border: 'none', cursor: 'pointer',
            transition: 'background 150ms ease',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E9ED'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ display: 'flex', color: '#999', flexShrink: 0 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 14.5, fontWeight: 400,
            color: '#777',
          }}>
            {t('sidebar.feedback.title')}
          </span>
        </button>
      </div>

      {open && (
        <div
          className="feedback-modal-overlay"
          onClick={() => !sending && setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            className="feedback-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 460,
              background: '#FFFFFF', borderRadius: 16,
              padding: '24px 24px 20px',
              boxShadow: '0 24px 48px rgba(15,23,42,0.24)',
            }}
          >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#F5F6F8', color: '#6B7280',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(16,24,40,0.06)',
                }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </span>
                <h3 style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                  color: '#1A1A1A', letterSpacing: '-0.01em',
                }}>
                  {t('sidebar.feedback.modalTitle')}
                </h3>
              </div>
              <p style={{
                margin: '0 0 14px',
                fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
                lineHeight: 1.5,
              }}>
                {t('sidebar.feedback.modalDescription')}
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('sidebar.feedback.placeholder')}
                disabled={sending}
                rows={5}
                style={{
                  width: '100%', resize: 'vertical', minHeight: 120,
                  padding: '12px 14px',
                  borderRadius: 12, border: 'none',
                  background: '#F5F6F8',
                  fontFamily: 'var(--font-body)', fontSize: 13.5, color: '#1A1A1A',
                  lineHeight: 1.5,
                  outline: 'none',
                  boxShadow: 'inset 0 0 0 1px transparent',
                  transition: 'box-shadow 150ms, background 150ms',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px #1A1A1A';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'inset 0 0 0 1px transparent';
                  e.currentTarget.style.background = '#F5F6F8';
                }}
              />

              {/* Hidden file input + visible "Прикрепить" trigger.
                  Multiple selection allowed. Limited client-side to keep
                  the UI honest about what server will accept. */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.txt,.log,.json,.csv"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
              <div style={{
                marginTop: 12,
                display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
              }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || files.length >= FEEDBACK_MAX_FILES}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 10,
                    background: '#F5F6F8',
                    color: files.length >= FEEDBACK_MAX_FILES ? '#9CA3AF' : '#1A1A1A',
                    border: 'none',
                    cursor: sending || files.length >= FEEDBACK_MAX_FILES ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => {
                    if (!sending && files.length < FEEDBACK_MAX_FILES) {
                      e.currentTarget.style.background = '#E8E9ED';
                    }
                  }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                  {t('sidebar.feedback.attach')}
                </button>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#9CA3AF',
                }}>
                  {t('sidebar.feedback.attachHint', {
                    count: files.length,
                    max: FEEDBACK_MAX_FILES,
                  })}
                </span>
              </div>

              {/* File chips */}
              {files.length > 0 && (
                <ul style={{
                  margin: '10px 0 0', padding: 0, listStyle: 'none',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px',
                      background: '#F5F6F8',
                      borderRadius: 8,
                    }}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                        stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0 }}>
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span style={{
                        flex: 1, minWidth: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-body)', fontSize: 12.5, color: '#1A1A1A',
                      }}>
                        {f.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#9CA3AF',
                        flexShrink: 0,
                      }}>
                        {formatBytes(f.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        disabled={sending}
                        aria-label={t('sidebar.feedback.removeFile')}
                        style={{
                          padding: 4, borderRadius: 6,
                          background: 'transparent', border: 'none',
                          color: '#6B7280',
                          cursor: sending ? 'not-allowed' : 'pointer',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'background 150ms, color 150ms',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E9ED'; e.currentTarget.style.color = '#1A1A1A'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
                      >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Error message */}
              {error && (
                <p style={{
                  margin: '10px 0 0',
                  padding: '8px 10px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                  fontFamily: 'var(--font-body)', fontSize: 12, color: '#991B1B',
                  lineHeight: 1.5,
                }}>
                  {error}
                </p>
              )}

              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: 8,
                marginTop: 14,
              }}>
                <button
                  type="button"
                  onClick={() => !sending && reset()}
                  disabled={sending}
                  style={{
                    padding: '9px 16px', borderRadius: 10,
                    background: 'transparent', border: 'none',
                    color: '#6B7280', cursor: sending ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  }}
                >
                  {t('sidebar.feedback.cancel')}
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={sending || !text.trim()}
                  style={{
                    padding: '9px 18px', borderRadius: 10,
                    background: sent ? '#10B981' : (!text.trim() ? '#E2E4EA' : '#3B82F6'),
                    color: !text.trim() && !sent ? '#9CA3AF' : '#FFFFFF',
                    border: 'none',
                    cursor: sending || !text.trim() ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    transition: 'background 180ms',
                    minWidth: 110,
                  }}
                  onMouseEnter={(e) => {
                    if (!sending && !sent && text.trim()) e.currentTarget.style.background = '#2563EB';
                  }}
                  onMouseLeave={(e) => {
                    if (!sending && !sent && text.trim()) e.currentTarget.style.background = '#3B82F6';
                  }}
                >
                  {sent ? t('sidebar.feedback.sent') : sending ? t('sidebar.feedback.sending') : t('sidebar.feedback.send')}
                </button>
              </div>
          </div>
        </div>
      )}
    </>
  );
}
