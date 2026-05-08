/**
 * TocSidebar — sticky right-rail sidebar в ToolView'е («Содержание»)
 * с анимированным active-pill (layoutId).
 *
 * P1-CR-3 step 8/8 — extracted from ToolView.tsx.
 *
 * Identical visual treatment к TabbedLessonViewer's aside — same
 * background `#F5F6F8`, same `toc-tab` rounded-button с активной
 * подложкой.
 */
import { motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import type { Tab } from '@/lib/tool-view/types';
import { TabIcon } from './TabIcon';

export function TocSidebar({ tabs, activeId, onSelect }: {
  tabs: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
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
        margin: 0,
      }}>
        {t('course.toc.title')}
      </p>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`toc-tab${isActive ? ' is-active' : ''}`}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              color: isActive ? '#1A1A1A' : '#333',
              border: 'none', borderRadius: 10,
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-body)', fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              transition: 'color 200ms ease',
            }}
          >
            {isActive && (
              <motion.span
                layoutId="tool-toc-active-pill"
                style={{
                  position: 'absolute', inset: 0,
                  background: '#FFFFFF',
                  borderRadius: 10,
                  boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.04)',
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span style={{
              position: 'relative', zIndex: 1,
              display: 'flex', flexShrink: 0,
              color: isActive ? '#1A1A1A' : '#6B7280',
              transition: 'color 200ms ease',
            }}>
              <TabIcon name={tab.iconKey} size={16} />
            </span>
            <span style={{
              position: 'relative', zIndex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              minWidth: 0, flex: 1,
            }}>
              {tab.short}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
