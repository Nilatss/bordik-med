'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getModulesBySection, TOTAL_COURSES, getSectionById } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { Search, ChevronRight, Check } from '@/components/icons';

export default function Sidebar() {
  const {
    activeSection,
    currentCourseId,
    openCourse,
    completedCourses,
    openModules,
    toggleModule,
    sidebarOpen,
    toggleSidebar,
  } = useAppStore();

  const [search, setSearch] = useState('');

  const section = activeSection ? getSectionById(activeSection) : null;
  const sectionModules = activeSection ? getModulesBySection(activeSection) : [];

  const filteredModules = search.trim()
    ? sectionModules
        .map((m) => ({
          ...m,
          courses: m.courses.filter(
            (c) =>
              c.title.toLowerCase().includes(search.toLowerCase()) ||
              c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
          ),
        }))
        .filter((m) => m.courses.length > 0)
    : sectionModules;

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
        className="fixed md:sticky top-0 z-50"
        style={{
          width: 280,
          height: '100vh',
          background: '#FFFFFF',
          borderRight: '1px solid var(--md-sys-color-outline-variant)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 36, height: 36,
              borderRadius: 'var(--md-sys-shape-corner-medium)',
              background: 'var(--md-sys-color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'var(--md-sys-color-on-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>IM</span>
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', letterSpacing: '0.02em' }}>IRON MED</h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Academy</p>
            </div>
          </div>
        </div>

        {/* Current section label */}
        {section && (
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '3px var(--space-3)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: 'var(--md-sys-color-primary-container)',
            }}>
              {section.title}
            </span>
          </div>
        )}

        {/* Search */}
        <div style={{ padding: 'var(--space-2) var(--space-3)' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--md-sys-color-on-surface-variant)', display: 'flex' }}>
              <Search size={16} />
            </span>
            <input
              type="text" placeholder="Поиск курса..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'var(--md-sys-color-surface-container-high)',
                border: 'none', borderRadius: 'var(--md-sys-shape-corner-full)',
                paddingLeft: 'var(--space-10)', paddingRight: 'var(--space-3)',
                paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-2)',
                fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)',
                color: 'var(--md-sys-color-on-surface)', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Module tree */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-1) var(--space-2)', paddingBottom: 'var(--space-4)' }}>
          {filteredModules.map((mod) => {
            const isOpen = openModules.includes(mod.id);
            const completedCount = mod.courses.filter((c) => completedCourses.includes(c.id)).length;

            return (
              <div key={mod.id} style={{ marginBottom: 'var(--space-1)' }}>
                <button
                  onClick={() => toggleModule(mod.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-large)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    transition: 'background 200ms cubic-bezier(0.2,0,0,1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 600,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    background: 'var(--md-sys-color-surface-container-highest)',
                    padding: '1px 5px', borderRadius: 'var(--md-sys-shape-corner-extra-small)',
                    flexShrink: 0, minWidth: 20, textAlign: 'center',
                  }}>
                    {mod.courses.length}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--md-sys-color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                    {mod.title}
                  </span>
                  {completedCount > 0 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--md-sys-color-primary)', marginLeft: 'auto', flexShrink: 0 }}>
                      {completedCount}/{mod.courses.length}
                    </span>
                  )}
                  <span style={{
                    marginLeft: completedCount > 0 ? '0' : 'auto', flexShrink: 0,
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                    transition: 'transform 200ms cubic-bezier(0.2,0,0,1)',
                    color: 'var(--md-sys-color-on-surface-variant)', display: 'flex',
                  }}>
                    <ChevronRight size={14} />
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      {mod.courses.map((course) => {
                        const isActive = currentCourseId === course.id;
                        const isCompleted = completedCourses.includes(course.id);
                        return (
                          <button
                            key={course.id}
                            onClick={() => openCourse(course.id)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                              paddingLeft: 'var(--space-6)', paddingRight: 'var(--space-2)',
                              paddingTop: '6px', paddingBottom: '6px',
                              borderRadius: 'var(--md-sys-shape-corner-full)',
                              background: isActive ? 'var(--md-sys-color-secondary-container)' : 'transparent',
                              color: isActive ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
                              border: 'none', cursor: 'pointer', textAlign: 'left',
                              transition: 'background 200ms cubic-bezier(0.2,0,0,1)',
                            }}
                            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)'; }}
                            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                          >
                            {isCompleted ? (
                              <Check size={14} color="var(--md-sys-color-primary)" strokeWidth={2} />
                            ) : (
                              <div style={{ width: 14, height: 14, flexShrink: 0 }} />
                            )}
                            <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                              {course.title}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--md-sys-color-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--space-2)' }}>
            <span>Пройдено</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{completedCourses.length} / {TOTAL_COURSES}</span>
          </div>
          <div style={{ height: 4, background: 'var(--md-sys-color-surface-container-highest)', borderRadius: 'var(--md-sys-shape-corner-full)' }}>
            <div style={{ height: '100%', background: 'var(--md-sys-color-primary)', borderRadius: 'var(--md-sys-shape-corner-full)', width: `${(completedCourses.length / TOTAL_COURSES) * 100}%`, transition: 'width 300ms cubic-bezier(0.2,0,0,1)' }} />
          </div>
        </div>
      </motion.aside>
    </>
  );
}
