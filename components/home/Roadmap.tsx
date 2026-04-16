'use client';

import { getModuleById } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';
import { Check } from '@/components/icons';

const LEVELS = [
  { moduleId: 700, level: 1, title: 'Санинструктор', subtitle: 'Минимум для поля', color: '#27ae60' },
  { moduleId: 701, level: 2, title: 'Парамедик', subtitle: 'Расширенная догоспитальная', color: '#2980b9' },
  { moduleId: 702, level: 3, title: 'Военный врач', subtitle: 'Клиника + хирургия', color: '#8e44ad' },
  { moduleId: 703, level: 4, title: 'Реаниматолог', subtitle: 'Полная компетентность', color: '#c0392b' },
];

export default function Roadmap() {
  const { completedCourses, openModule } = useAppStore();

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 'var(--md-sys-shape-corner-extra-large)',
      padding: 'var(--space-6)',
      marginBottom: 'var(--space-6)',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700,
        color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-2)',
      }}>
        Дорожная карта
      </h3>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
        color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--space-6)',
      }}>
        Уровни профессии от санинструктора до реаниматолога
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: 19, top: 24, bottom: 24,
          width: 2, background: 'var(--md-sys-color-outline-variant)',
        }} />

        {LEVELS.map((lvl, i) => {
          const mod = getModuleById(lvl.moduleId);
          if (!mod) return null;

          const totalCourses = mod.courses.length;
          const completed = mod.courses.filter(c => completedCourses.includes(c.id)).length;
          const pct = totalCourses > 0 ? Math.round((completed / totalCourses) * 100) : 0;
          const isDone = pct === 100;
          const isActive = pct > 0 && pct < 100;

          return (
            <button
              key={lvl.moduleId}
              onClick={() => openModule(lvl.moduleId)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)',
                padding: 'var(--space-4) 0',
                background: 'transparent', border: 'none', cursor: 'pointer',
                textAlign: 'left', position: 'relative', zIndex: 1,
              }}
            >
              {/* Circle indicator */}
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--md-sys-shape-corner-full)',
                background: isDone ? lvl.color : isActive ? '#FFFFFF' : 'var(--md-sys-color-surface-container-highest)',
                border: isActive ? `2px solid ${lvl.color}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isDone ? (
                  <Check size={20} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)',
                    fontWeight: 700, color: isActive ? lvl.color : 'var(--md-sys-color-on-surface-variant)',
                  }}>
                    {lvl.level}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)',
                  fontWeight: 700, color: 'var(--md-sys-color-on-surface)',
                  marginBottom: 'var(--space-1)',
                }}>
                  {lvl.title}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  marginBottom: 'var(--space-2)',
                }}>
                  {lvl.subtitle}
                </div>

                {/* Progress bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{
                    flex: 1, maxWidth: 120, height: 4,
                    background: 'var(--md-sys-color-surface-container-highest)',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 'var(--md-sys-shape-corner-full)',
                      width: `${pct}%`, backgroundColor: lvl.color,
                      transition: 'width 300ms cubic-bezier(0.2,0,0,1)',
                    }} />
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                    color: pct > 0 ? lvl.color : 'var(--md-sys-color-on-surface-variant)',
                  }}>
                    {completed}/{totalCourses}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
