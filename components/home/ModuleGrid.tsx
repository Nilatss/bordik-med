'use client';

import { motion } from 'framer-motion';
import { getModulesBySection } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { ArrowRight } from '@/components/icons';

export default function ModuleGrid() {
  const { activeSection, openModule, completedCourses } = useAppStore();
  const sectionModules = activeSection ? getModulesBySection(activeSection) : [];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--space-4)',
    }}>
      {sectionModules.map((mod, i) => {
        const completedCount = mod.courses.filter((c) => completedCourses.includes(c.id)).length;
        const progress = mod.courses.length > 0 ? (completedCount / mod.courses.length) * 100 : 0;

        return (
          <motion.button
            key={mod.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
            onClick={() => openModule(mod.id)}
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--md-sys-shape-corner-extra-large)',
              border: 'none',
              overflow: 'hidden',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              transition: 'background 250ms cubic-bezier(0.2,0,0,1), transform 250ms cubic-bezier(0.2,0,0,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--md-sys-color-surface-container-high)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Badge */}
            <span style={{
              display: 'inline-flex', alignSelf: 'flex-start',
              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500,
              padding: '3px var(--space-3)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              backgroundColor: 'var(--md-sys-color-surface-container-highest)',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>
              {mod.courses.length} курсов
            </span>

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)', lineHeight: 1.25, letterSpacing: '-0.01em',
            }}>
              {mod.title}
            </h3>

            {/* Description */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
              color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', flex: 1,
            }}>
              {mod.description}
            </p>

            {/* Footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 'var(--space-1)',
            }}>
              {completedCount > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: 1 }}>
                  <div style={{
                    flex: 1, maxWidth: 80, height: 3,
                    background: 'var(--md-sys-color-surface-container-highest)',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 'var(--md-sys-shape-corner-full)',
                      width: `${progress}%`, background: 'var(--md-sys-color-primary)',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--md-sys-color-primary)' }}>
                    {completedCount}/{mod.courses.length}
                  </span>
                </div>
              ) : (
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
                  color: 'var(--md-sys-color-on-surface-variant)',
                  display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
                }}>
                  Открыть <ArrowRight size={14} />
                </span>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
