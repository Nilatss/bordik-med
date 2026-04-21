'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useT, useLang } from '@/lib/i18n';
import { searchCourses } from '@/lib/curriculum';

type NavItem = 'home' | 'learning' | 'tests' | 'tools' | 'stats' | 'profile';

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
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  // Auto-close sidebar on initial mount if viewport is narrow (< 768 px).
  // Store default is `open: true` which is correct for desktop; mobile needs
  // it closed so the drawer doesn't overlay content on page load.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    if (mq.matches && useAppStore.getState().sidebarOpen) {
      useAppStore.setState({ sidebarOpen: false });
    }
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
    const all = searchCourses(q, 30);
    const available = all.filter((r) => UNLOCKED_SECTIONS.includes(r.module.sectionId));
    const locked = all.filter((r) => !UNLOCKED_SECTIONS.includes(r.module.sectionId));
    return { available, locked };
  }, [q]);

  const totalCourseResults = courseResults.available.length + courseResults.locked.length;

  const handleCoursePick = (courseId: string, sectionId: string) => {
    // Jump into learning flow at that course
    setActiveSection(sectionId as never);
    openCourse(courseId);
    setSearchQuery('');
  };

  const isSearching = q.length > 0;
  const hasResults = visibleGroups.length > 0 || totalCourseResults > 0;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            style={{
              position: 'fixed', inset: 0,
              background: 'var(--md-sys-color-scrim)', opacity: 0.32, zIndex: 40,
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
        {/* Logo */}
        <div style={{ padding: '20px 24px 0' }}>
          <img
            src="/logo-bordik.png"
            alt="Bordik"
            style={{ height: 28, width: 'auto', display: 'block' }}
          />
        </div>

        {/* Date + welcome */}
        <div style={{ padding: '24px 24px 16px' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
            color: '#6B7280', marginBottom: 8,
          }}>
            {new Date().toLocaleDateString(
              { ru: 'ru-RU', en: 'en-GB', kk: 'kk-KZ', uk: 'uk-UA' }[lang] || 'ru-RU',
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
                            {course.title}
                          </span>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 11, color: '#9CA3AF',
                          paddingLeft: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}>
                          {section?.title || module.title}
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
                        title="Курс станет доступен позже"
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
                            {course.title}
                          </span>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: 11, color: '#9CA3AF',
                          paddingLeft: 2,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}>
                          {section?.title || module.title}
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
