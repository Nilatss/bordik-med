'use client';

import { useAppStore } from '@/lib/store';
import { getCourseById, getModuleForCourse } from '@/lib/curriculum';
import { Menu } from '@/components/icons';

export default function Topbar() {
  const { currentCourseId, toggleSidebar, toggleProfile } = useAppStore();

  const course = currentCourseId ? getCourseById(currentCourseId) : null;
  const mod = currentCourseId ? getModuleForCourse(currentCourseId) : null;

  return (
    <header style={{
      height: 56,
      background: '#FFFFFF',
      borderBottom: '1px solid var(--md-sys-color-outline-variant)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-4)',
      gap: 'var(--space-3)',
      flexShrink: 0,
    }}>
      {/* Hamburger (mobile) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden"
        style={{
          padding: 'var(--space-2)',
          marginLeft: 'calc(var(--space-2) * -1)',
          background: 'transparent', border: 'none',
          borderRadius: 'var(--md-sys-shape-corner-full)',
          color: 'var(--md-sys-color-on-surface-variant)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1, minWidth: 0 }}>
        {mod ? (
          <>
            <span style={{
              padding: '2px var(--space-2)', fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 600,
              borderRadius: 'var(--md-sys-shape-corner-extra-small)',
              backgroundColor: 'var(--md-sys-color-surface-container-highest)',
              color: 'var(--md-sys-color-on-surface-variant)', flexShrink: 0,
            }}>
              {mod.id}
            </span>
            <span style={{ color: 'var(--md-sys-color-outline)', fontSize: 'var(--text-xs)', flexShrink: 0 }}>/</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 500,
              color: 'var(--md-sys-color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {course?.title}
            </span>
          </>
        ) : (
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600,
            color: 'var(--md-sys-color-on-surface)', letterSpacing: '0.02em',
          }}>
            IRON MED ACADEMY
          </span>
        )}
      </div>

      {/* Profile button */}
      <button
        onClick={toggleProfile}
        style={{
          width: 36, height: 36,
          borderRadius: 'var(--md-sys-shape-corner-full)',
          background: 'var(--md-sys-color-primary)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'opacity 200ms cubic-bezier(0.2,0,0,1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21c0-3.87-3.58-7-8-7s-8 3.13-8 7" />
        </svg>
      </button>
    </header>
  );
}
