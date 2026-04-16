'use client';

import { useAppStore } from '@/lib/store';
import { sections, getSectionById, getModulesBySection, getModuleById, type SectionId } from '@/lib/curriculum';
import ProfilePage from '@/components/profile/ProfilePage';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ModuleGrid from '@/components/home/ModuleGrid';
import CourseGrid from '@/components/home/CourseGrid';
import ProgressStats from '@/components/home/ProgressStats';
import CoursePage from '@/components/course/CoursePage';
import Roadmap from '@/components/home/Roadmap';
import { ArrowLeft, ArrowRight } from '@/components/icons';
import { SectionIllustration } from '@/components/illustrations/SectionIllustrations';

const SECTION_BG: Record<SectionId, string> = {
  basic: '#F7F4F2', advanced: '#F0F3F8', expert: '#F5F1F8',
  expansion: '#F0F6F2', territories: '#F5F4EF', frontiers: '#EEF3F7',
  calculators: '#F3F3F3', subjects: '#F2F0F5',
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
        border: 'none', cursor: 'pointer', marginBottom: 'var(--space-4)',
        alignSelf: 'flex-start', padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--md-sys-shape-corner-small)',
        transition: 'background 200ms cubic-bezier(0.2,0,0,1)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}

/* Section cards */
function SectionCards({ onSelect }: { onSelect: (id: SectionId) => void }) {
  const { completedCourses } = useAppStore();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
      {sections.map((sec) => {
        const mods = getModulesBySection(sec.id);
        const totalCourses = mods.reduce((s, m) => s + m.courses.length, 0);
        const completedCount = mods.reduce((s, m) => s + m.courses.filter((c) => completedCourses.includes(c.id)).length, 0);
        const pct = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;
        return (
          <button key={sec.id} onClick={() => onSelect(sec.id)} style={{
            background: SECTION_BG[sec.id], borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            border: 'none', padding: 'var(--space-5)', textAlign: 'left', cursor: 'pointer',
            position: 'relative', overflow: 'hidden', minHeight: 160,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            transition: 'transform 200ms cubic-bezier(0.2,0,0,1)',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.7, pointerEvents: 'none' }}>
              <SectionIllustration sectionId={sec.id} />
            </div>
            <div style={{ marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
                padding: '3px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
                background: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: completedCount > 0 ? 600 : 500,
                color: completedCount > 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: completedCount > 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-tertiary)' }} />
                {completedCount > 0 ? `${pct}% пройдено` : `${mods.length} модулей`}
              </span>
            </div>
            <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-1)', lineHeight: 1.25 }}>
                {sec.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '75%' }}>
                {sec.description}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
                Начать обучение
              </span>
              <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ═══ Main ═══ */
export default function Home() {
  const { activeSection, activeModuleId, setActiveSection, goHome, closeModule, currentCourseId, closeCourse, showProfile, toggleProfile } = useAppStore();
  const section = activeSection ? getSectionById(activeSection) : null;
  const mod = activeModuleId ? getModuleById(activeModuleId) : null;

  // 5 views: profile | home → section (modules) → module (courses) → course
  const view = showProfile ? 'profile' : currentCourseId ? 'course' : activeModuleId ? 'module' : activeSection ? 'section' : 'home';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>

          {view === 'profile' && (
            <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
              <BackButton onClick={toggleProfile} label="Назад" />
              <ProfilePage />
            </div>
          )}

          {view === 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
              <BackButton onClick={closeCourse} label="Назад" />
              <CoursePage courseId={currentCourseId!} />
            </div>
          )}

          {view === 'module' && mod && (
            <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
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
            <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
              <BackButton onClick={goHome} label="Все разделы" />
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
              {activeSection === 'subjects' && <Roadmap />}
              <ModuleGrid />
            </div>
          )}

          {view === 'home' && (
            <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
              <ProgressStats />
              <div style={{
                background: '#FFFFFF', borderRadius: 'var(--md-sys-shape-corner-extra-large)',
                padding: 'var(--space-6)',
              }}>
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
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
