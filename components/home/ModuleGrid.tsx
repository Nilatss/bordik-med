'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getModulesBySection } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { ArrowRight } from '@/components/icons';
import DifficultyFilter from './DifficultyFilter';

export default function ModuleGrid() {
  const { activeSection, openModule, completedCourses, difficultyFilter, setDifficultyFilter } = useAppStore();
  const sectionModules = activeSection ? getModulesBySection(activeSection) : [];
  const filter = difficultyFilter;

  const filteredModules = useMemo(() => {
    if (filter === 'all') return sectionModules;
    return sectionModules.filter((m) => m.courses.some((c) => c.difficulty === filter));
  }, [sectionModules, filter]);

  return (
    <>
      <DifficultyFilter value={filter} onChange={setDifficultyFilter} />
      {filteredModules.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 14,
          padding: '60px 20px',
          minHeight: 320,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#F5F6F8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
              color: '#1A1A1A', marginBottom: 4, letterSpacing: '-0.01em',
            }}>
              Модулей пока нет
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
              lineHeight: 1.5,
            }}>
              В этом разделе нет модулей с выбранным уровнем сложности. Попробуйте другой фильтр.
            </p>
          </div>
          <button
            onClick={() => setDifficultyFilter('all')}
            style={{
              padding: '8px 16px',
              background: '#1A1A1A', color: '#FFFFFF',
              border: 'none', borderRadius: 10,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              transition: 'background 180ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
          >
            Показать все модули
          </button>
        </div>
      ) : (
      <div className="rg-3" style={{ gap: 'var(--space-4)' }}>
      {filteredModules.map((mod, i) => {
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
              background: '#F5F6F8',
              borderRadius: 'var(--md-sys-shape-corner-extra-large)',
              border: 'none',
              overflow: 'hidden',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              transition: 'background 450ms cubic-bezier(0.22,1,0.36,1), transform 450ms cubic-bezier(0.22,1,0.36,1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F0F2F5';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F5F6F8';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Badge */}
            <span style={{
              display: 'inline-flex', alignSelf: 'flex-start',
              fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 500,
              padding: '4px var(--space-3)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              backgroundColor: '#FFFFFF',
              color: 'var(--md-sys-color-on-surface-variant)',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
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
      )}
    </>
  );
}
