'use client';

import { modules, sections, getModulesBySection, TOTAL_COURSES } from '@/lib/curriculum';
import { useAppStore, formatStudyTime, getTotalStudyTime } from '@/lib/store';

export default function ProfilePage() {
  const { completedCourses, studyTime } = useAppStore();

  const totalCompleted = completedCourses.length;
  const totalTime = getTotalStudyTime(studyTime);
  const progress = Math.round((totalCompleted / TOTAL_COURSES) * 100);

  // Per-section breakdown
  const sectionStats = sections.map((sec) => {
    const mods = getModulesBySection(sec.id);
    const total = mods.reduce((s, m) => s + m.courses.length, 0);
    const completed = mods.reduce(
      (s, m) => s + m.courses.filter((c) => completedCourses.includes(c.id)).length, 0
    );
    const time = mods.reduce(
      (s, m) => s + m.courses.reduce((cs, c) => cs + (studyTime[c.id] || 0), 0), 0
    );
    return { ...sec, total, completed, time, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  // AI assessment (placeholder)
  const assessmentLevel = progress >= 80 ? 'Продвинутый' : progress >= 40 ? 'Средний' : progress >= 10 ? 'Начинающий' : 'Новичок';

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-8)',
        marginBottom: 'var(--space-6)',
        textAlign: 'center',
      }}>
        {/* Avatar placeholder */}
        <div style={{
          width: 72, height: 72, borderRadius: 'var(--md-sys-shape-corner-full)',
          background: 'var(--md-sys-color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-4)',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
            fontWeight: 700, color: 'var(--md-sys-color-on-primary)',
          }}>IM</span>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
          fontWeight: 700, color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--space-1)',
        }}>
          Профиль ученика
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          Iron Med Academy
        </p>

        {/* Overall stats */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 'var(--space-8)',
          marginTop: 'var(--space-6)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
              {progress}%
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Прогресс
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
              {totalCompleted}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Курсов
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
              {totalTime > 0 ? formatStudyTime(totalTime) : '0'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Время
            </div>
          </div>
        </div>
      </div>

      {/* AI Assessment */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)',
          fontWeight: 700, color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--space-3)',
        }}>
          Оценка ИИ
        </h3>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          padding: 'var(--space-4)',
          background: 'var(--md-sys-color-primary-container)',
          borderRadius: 'var(--md-sys-shape-corner-large)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--md-sys-shape-corner-medium)',
            background: 'var(--md-sys-color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)',
              fontWeight: 700, color: 'var(--md-sys-color-on-primary-container)',
            }}>
              Уровень: {assessmentLevel}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
              color: 'var(--md-sys-color-on-primary-container)', opacity: 0.8,
              marginTop: 'var(--space-1)',
            }}>
              {progress < 10
                ? 'Начните изучение курсов для получения оценки'
                : progress < 40
                  ? 'Продолжайте обучение для повышения уровня компетенции'
                  : progress < 80
                    ? 'Хороший прогресс. Углубляйте знания в продвинутых разделах'
                    : 'Отличная подготовка. Рекомендуем экспертные и специализированные модули'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-6)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)',
          fontWeight: 700, color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--space-4)',
        }}>
          Прогресс по разделам
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {sectionStats.map((sec) => (
            <div key={sec.id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
              padding: 'var(--space-3) 0',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 'var(--space-1)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)',
                    fontWeight: 600, color: 'var(--md-sys-color-on-surface)',
                  }}>
                    {sec.title}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                  }}>
                    {sec.completed}/{sec.total}
                  </span>
                </div>
                <div style={{
                  height: 4, background: 'var(--md-sys-color-surface-container-highest)',
                  borderRadius: 'var(--md-sys-shape-corner-full)',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 'var(--md-sys-shape-corner-full)',
                    width: `${sec.pct}%`,
                    background: sec.pct > 0 ? 'var(--md-sys-color-primary)' : 'transparent',
                    transition: 'width 300ms cubic-bezier(0.2,0,0,1)',
                  }} />
                </div>
                {sec.time > 0 && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.625rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginTop: 'var(--space-1)', display: 'block',
                  }}>
                    {formatStudyTime(sec.time)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
