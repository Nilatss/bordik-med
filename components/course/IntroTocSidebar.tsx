/**
 * IntroTocSidebar — the right-side TOC shown on the course intro screen.
 *
 * Mirrors the look of the TOC sidebar inside TabbedLessonViewer so the
 * layout doesn't shift when the user clicks "Начать обучение". All items
 * appear inactive except the first, which is visualised as the next
 * destination (matches what user sees post-start).
 *
 * Extracted from CoursePage.tsx (P1-CR-3 god-component split).
 */
'use client';

import { useT } from '@/lib/i18n';
import type { Tab } from './TabbedLessonViewer';

interface IntroTocSidebarProps {
  tabs: Tab[];
}

export default function IntroTocSidebar({ tabs }: IntroTocSidebarProps) {
  const t = useT();

  return (
    <aside className="toc-sidebar" style={{
      position: 'sticky', top: 20,
      background: '#F5F6F8',
      borderRadius: 'var(--md-sys-shape-corner-extra-large)',
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 11,
        fontWeight: 600, color: '#888',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        padding: '4px 12px 10px',
      }}>
        {t('course.toc.title')}
      </p>
      {tabs.map((tab, i) => {
        // First topic visualised as «active» so the empty intro page
        // doesn't look stale — matches what the user will see right
        // after clicking «Начать обучение».
        const isFirst = i === 0;
        return (
          <div
            key={tab.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: isFirst ? '#FFFFFF' : 'transparent',
              color: isFirst ? '#1A1A1A' : '#9CA3AF',
              borderRadius: 10,
              fontFamily: 'var(--font-body)', fontSize: 13,
              fontWeight: isFirst ? 600 : 500,
              cursor: 'default',
              boxShadow: isFirst ? '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.04)' : 'none',
            }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, borderRadius: '50%',
              background: isFirst ? '#3B82F6' : '#E2E4EA',
              color: isFirst ? '#FFF' : '#9CA3AF',
              fontSize: 11.5, fontWeight: 700, flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tab.short}
            </span>
          </div>
        );
      })}
    </aside>
  );
}
