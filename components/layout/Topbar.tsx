'use client';

import { useAppStore } from '@/lib/store';
import { getCourseById, getModuleForCourse } from '@/lib/curriculum';
import { Menu } from '@/components/icons';

export default function Topbar() {
  const { currentCourseId, toggleSidebar, toggleProfile } = useAppStore();

  const course = currentCourseId ? getCourseById(currentCourseId) : null;
  const mod = currentCourseId ? getModuleForCourse(currentCourseId) : null;

  return (
    <header className="h-14 bg-white border-b border-[color:var(--md-sys-color-outline-variant)] flex items-center px-[var(--space-4)] gap-[var(--space-3)] shrink-0">
      {/* Hamburger (mobile) */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-[var(--space-2)] -ml-[var(--space-2)] bg-transparent border-none rounded-[var(--md-sys-shape-corner-full)] text-[color:var(--md-sys-color-on-surface-variant)] cursor-pointer flex items-center justify-center"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-[var(--space-2)] flex-1 min-w-0">
        {mod ? (
          <>
            <span className="py-0.5 px-[var(--space-2)] font-[var(--font-mono)] text-[0.625rem] font-semibold rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[color:var(--md-sys-color-on-surface-variant)] shrink-0">
              {mod.id}
            </span>
            <span className="text-[color:var(--md-sys-color-outline)] text-[length:var(--text-xs)] shrink-0">/</span>
            <span className="font-[var(--font-display)] text-[length:var(--text-sm)] font-medium text-[color:var(--md-sys-color-on-surface)] overflow-hidden text-ellipsis whitespace-nowrap">
              {course?.title}
            </span>
          </>
        ) : (
          <span className="font-[var(--font-display)] text-[length:var(--text-sm)] font-semibold text-[color:var(--md-sys-color-on-surface)] tracking-[0.02em]">
            IRON MED ACADEMY
          </span>
        )}
      </div>

      {/* Profile button */}
      <button
        onClick={toggleProfile}
        className="w-9 h-9 rounded-[var(--md-sys-shape-corner-full)] bg-[var(--md-sys-color-primary)] hover:opacity-85 border-none cursor-pointer flex items-center justify-center shrink-0 transition-opacity duration-200 ease-[cubic-bezier(0.2,0,0,1)]"
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21c0-3.87-3.58-7-8-7s-8 3.13-8 7" />
        </svg>
      </button>
    </header>
  );
}
