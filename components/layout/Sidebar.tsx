'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useT, useLang } from '@/lib/i18n';
import { searchCourses } from '@/lib/curriculum';
// CATALOG_TOOLS (172 kB) is dynamically imported below — lazy until the
// user actually starts searching while on the Tools view.
import type { CatalogTool } from '@/lib/tools-catalog';

type NavItem = 'home' | 'learning' | 'tests' | 'tools' | 'stats' | 'profile';

/** Render `text` with all case-insensitive occurrences of `query` wrapped in
 *  <strong> for bold highlight. Used in search results. */
function Highlight({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;
  const escaped = tokens
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  // Splitter regex (capturing) — produces alternating non-match / match parts
  const splitter = new RegExp(`(${escaped})`, 'gi');
  // Stateless matcher — used to decide which slot is a match (avoids the
  // .test() lastIndex pitfall when /g is set).
  const matcher = new RegExp(`^(?:${escaped})$`, 'i');
  const parts = text.split(splitter);
  return (
    <>
      {parts.map((p, i) =>
        p && matcher.test(p)
          ? <strong key={i} style={{ fontWeight: 700, color: '#1A1A1A' }}>{p}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}

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
    goHome,
    setShowLearning,
    setShowTools,
    setShowStats,
    setShowTests,
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
          : (activeSection || showLearning)
            ? 'learning'
            : 'home';

  const handleNav = (item: NavItem) => {
    if (item === 'home') goHome();
    else if (item === 'profile') toggleProfile();
    else if (item === 'learning') setShowLearning(true);
    else if (item === 'tests') setShowTests(true);
    else if (item === 'tools') setShowTools(true);
    else if (item === 'stats') setShowStats(true);
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
      keywords: ['инструменты', 'калькулятор', 'tools', 'calculator', 'бми', 'bmi', 'справочник', 'мкб'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
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
    { id: 'main',     title: t('nav.group.main'),    items: ['home', 'learning', 'tests'] },
    { id: 'services', title: t('nav.group.services'),items: ['tools'] },
    { id: 'account',  title: t('nav.group.account'), items: ['stats', 'profile'] },
  ];

  // Filter by search
  const q = searchQuery.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((id) =>
          navItems[id].label.toLowerCase().includes(q) ||
          navItems[id].keywords.some((k) => k.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, lang]);

  // Course search results - all, grouped by availability
  const UNLOCKED_SECTIONS = ['fundamentals'];
  const courseResults = useMemo(() => {
    if (!q || q.length < 2) return { available: [], locked: [] };
    // Context-aware: if user is browsing a specific section, boost hits
    // from that section so the most relevant ones surface to the top.
    const all = searchCourses(q, 30, activeSection ?? undefined);
    const available = all.filter((r) => UNLOCKED_SECTIONS.includes(r.module.sectionId));
    const locked = all.filter((r) => !UNLOCKED_SECTIONS.includes(r.module.sectionId));
    return { available, locked };
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
          NOTE: framer-motion's `animate` overrides the inline style, so the
          opacity MUST be set via animate — otherwise the backdrop renders
          as pure black (scrim #000000 at opacity: 1) and hides main content. */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            style={{
              position: 'fixed', inset: 0,
              background: 'var(--md-sys-color-scrim)', zIndex: 40,
            }}
            className="md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
        className="app-sidebar-aside fixed md:sticky top-0 z-50"
        style={{
          width: 280,
          height: '100vh',
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
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                            padding: '11px 16px',
                            borderRadius: 12,
                            background: isActive ? '#E2E4EA' : 'transparent',
                            border: 'none', cursor: 'pointer',
                            transition: 'background 150ms ease',
                          }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#E8E9ED'; }}
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
      </motion.aside>
    </>
  );
}
