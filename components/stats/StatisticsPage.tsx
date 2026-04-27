'use client';

import { useMemo, useState } from 'react';
import { modules, TOTAL_COURSES, getCourseById, getModuleForCourse, getSectionById } from '@/lib/curriculum';
import { useAppStore, formatStudyTime, getTotalStudyTime } from '@/lib/store';
import { MAX_TEST_LEVELS } from '@/lib/quiz';

/* ════════════════════════════════════════════════════════════════
   Statistics — dashboard rebuilt to match the Findeck reference.
   Blue accent (#3B82F6) replaces the screenshot's green so it stays
   consistent with our primary action buttons.
   ════════════════════════════════════════════════════════════════ */

const ACCENT = '#3B82F6';
const ACCENT_DARK = '#2563EB';
const ACCENT_BG = '#EFF4FF';
const ACCENT_BORDER = '#DBE7FF';

const HEATMAP_LEVELS = [
  '#F1F3F6',  // 0 — none
  '#DBE7FF',  // 1 — light
  '#A8C7FF',  // 2 — medium
  '#7AA5FA',  // 3 — strong
  ACCENT,     // 4 — peak
];

/* ─── Period selector ─────────────────────────────────────────── */
type Period = 'month' | 'week' | 'all';
const PERIOD_LABELS: Record<Period, string> = {
  month: 'Этот месяц',
  week:  'Последние 7 дней',
  all:   'Всё время',
};

/* ════════════════════════════════════════════════════════════════
   Top-level page
   ════════════════════════════════════════════════════════════════ */
export default function StatisticsPage() {
  const completedCourses    = useAppStore((s) => s.completedCourses);
  const completedModules    = useAppStore((s) => s.completedModules);
  const courseTestProgress  = useAppStore((s) => s.courseTestProgress);
  const testAttempts        = useAppStore((s) => s.testAttempts);
  const studyTime           = useAppStore((s) => s.studyTime);
  const userName            = useAppStore((s) => s.userName);

  const [period, setPeriod] = useState<Period>('month');
  const [periodOpen, setPeriodOpen] = useState(false);

  /* ─── Aggregated metrics ─────────────────────────────────────── */
  const metrics = useMemo(() => {
    const totalSeconds = getTotalStudyTime(studyTime);
    const allAttempts  = Object.values(testAttempts).flat();
    const passedAttempts = allAttempts.filter((a) => a.passed).length;
    const avgScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allAttempts.length)
      : 0;

    const completedPct = TOTAL_COURSES > 0
      ? Math.round((completedCourses.length / TOTAL_COURSES) * 100)
      : 0;

    return {
      coursesDone:   completedCourses.length,
      coursesTotal:  TOTAL_COURSES,
      completedPct,
      passedTests:   passedAttempts,
      totalAttempts: allAttempts.length,
      avgScore,
      studyTime:     totalSeconds,
      modulesDone:   completedModules.length,
      modulesTotal:  modules.length,
    };
  }, [completedCourses, completedModules, testAttempts, studyTime]);

  /* ─── Activity heatmap data: map study attempts → day grid ──── */
  const heatmap = useMemo(() => buildHeatmap(testAttempts, period), [testAttempts, period]);

  /* ─── Section progress (replaces «Accounts overview» bars) ─── */
  const sectionProgress = useMemo(() => buildSectionProgress(completedCourses), [completedCourses]);

  /* ─── Recent test attempts table (replaces «Tax Liabilities») */
  const recentAttempts = useMemo(() => {
    return Object.values(testAttempts)
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [testAttempts]);

  return (
    <div className="stats-page" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700,
            color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: 4,
          }}>
            Статистика обучения
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: '#9CA3AF' }}>📊</span>
            Аналитика прогресса{userName ? ` — ${userName}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Period dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPeriodOpen((v) => !v)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                color: '#1A1A1A',
              }}
            >
              {PERIOD_LABELS[period]}
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'transform 200ms', transform: periodOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {periodOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#FFFFFF',
                borderRadius: 12,
                boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
                minWidth: 180,
                padding: 4,
                zIndex: 30,
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                    style={{
                      padding: '8px 12px',
                      background: p === period ? ACCENT_BG : 'transparent',
                      color: p === period ? ACCENT_DARK : '#1A1A1A',
                      border: 'none', borderRadius: 8,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: 13,
                      fontWeight: p === period ? 600 : 500,
                      textAlign: 'left',
                    }}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            disabled
            title="Скоро будет доступно"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              background: ACCENT,
              color: '#FFFFFF',
              border: 'none', borderRadius: 10,
              cursor: 'not-allowed', opacity: 0.55,
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Экспорт
          </button>
        </div>
      </div>

      {/* KPI cards row */}
      <div className="stats-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        <KpiCard
          label="Курсов пройдено"
          value={`${metrics.coursesDone}`}
          sub={`из ${metrics.coursesTotal}`}
          delta={metrics.completedPct > 0 ? `${metrics.completedPct}% от программы` : 'начни первый курс'}
          deltaPositive
          icon={<IconBook />}
        />
        <KpiCard
          label="Тестов сдано"
          value={`${metrics.passedTests}`}
          sub={`из ${metrics.totalAttempts} попыток`}
          delta={metrics.avgScore > 0 ? `средний балл ${metrics.avgScore}%` : 'нет попыток'}
          deltaPositive={metrics.avgScore >= 80}
          icon={<IconCheckCircle />}
        />
        <KpiCard
          label="Время обучения"
          value={formatStudyTime(metrics.studyTime).split(' ')[0]}
          sub={formatStudyTime(metrics.studyTime).split(' ').slice(1).join(' ') || ''}
          delta={metrics.studyTime > 0 ? 'продолжайте в том же темпе' : 'начните учиться'}
          deltaPositive
          icon={<IconClock />}
        />
      </div>

      {/* Activity heatmap */}
      <Section title="Активность по часам" subtitle={`${heatmap.totalActiveDays} дней с активностью · ${heatmap.totalSessions} сессий`}>
        <Heatmap data={heatmap} />
      </Section>

      {/* Bottom 2-col grid: Section progress | Recent attempts */}
      <div className="stats-2col" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
        gap: 14,
        width: '100%',
      }}>
        <Section title="Прогресс по разделам" subtitle="Завершённость каждого блока программы">
          <SectionProgress rows={sectionProgress} />
        </Section>

        <Section title="Последние тесты" subtitle="Шесть свежих попыток">
          <RecentAttempts attempts={recentAttempts} />
        </Section>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   KPI Card — top row tiles like screenshot's Total Revenue etc.
   ════════════════════════════════════════════════════════════════ */
function KpiCard({ label, value, sub, delta, deltaPositive, icon }: {
  label: string; value: string; sub?: string;
  delta: string; deltaPositive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F0F1F5',
      borderRadius: 16,
      padding: 18,
      display: 'flex', flexDirection: 'column', gap: 10,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
          fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          {label}
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
        <span style={{
          width: 30, height: 30, borderRadius: 8,
          background: ACCENT_BG, color: ACCENT_DARK,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1.05,
        }}>
          {value}
        </span>
        {sub && (
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#9CA3AF',
            fontWeight: 500,
          }}>
            {sub}
          </span>
        )}
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px',
          borderRadius: 999,
          background: deltaPositive ? '#ECFDF5' : '#FEF2F2',
          color: deltaPositive ? '#047857' : '#B91C1C',
          fontWeight: 600,
        }}>
          {deltaPositive ? '↑' : '↓'}
        </span>
        {delta}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Section card — bottom blocks (Cash flow / Accounts / Tax)
   ════════════════════════════════════════════════════════════════ */
function Section({ title, subtitle, children, action }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F0F1F5',
      borderRadius: 16,
      padding: 18,
      display: 'flex', flexDirection: 'column', gap: 14,
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
            color: '#1A1A1A', letterSpacing: '-0.01em',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {title}
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </h3>
          {subtitle && (
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 12, color: '#9CA3AF',
              marginTop: 2,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Heatmap — replaces "Cash flow summary" calendar grid
   X-axis = day of period (1..N), Y-axis = hour band (0-6, 6-12, 12-18, 18-24).
   Intensity = number of test sessions in that bucket.
   ════════════════════════════════════════════════════════════════ */
interface HeatmapData {
  cells: number[][]; // [4 rows][N cols]
  cols: number;      // days in current period
  totalActiveDays: number;
  totalSessions: number;
}

function buildHeatmap(testAttempts: Record<string, { timestamp: number }[]>, period: Period): HeatmapData {
  const now = Date.now();
  let days: number;
  if (period === 'week') days = 7;
  else if (period === 'month') days = 31;
  else days = 31; // 'all' falls back to last month for visual readability

  const cells: number[][] = Array.from({ length: 4 }, () => Array(days).fill(0));
  const activeDays = new Set<number>();
  let totalSessions = 0;

  // Iterate every attempt; bucket into (day-from-end, hour-band)
  for (const list of Object.values(testAttempts)) {
    for (const a of list) {
      const ageMs = now - a.timestamp;
      const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
      if (ageDays < 0 || ageDays >= days) continue;
      const col = days - 1 - ageDays;
      const date = new Date(a.timestamp);
      const hour = date.getHours();
      const row =
        hour < 6 ? 0 :
        hour < 12 ? 1 :
        hour < 18 ? 2 : 3;
      cells[row][col] += 1;
      activeDays.add(col);
      totalSessions += 1;
    }
  }

  return {
    cells,
    cols: days,
    totalActiveDays: activeDays.size,
    totalSessions,
  };
}

function Heatmap({ data }: { data: HeatmapData }) {
  const max = Math.max(1, ...data.cells.flat());
  const labels = ['00–06', '06–12', '12–18', '18–24'];

  // Day-axis tick density: show every 1 for ≤7 cols, every 5 for 31 cols.
  const tickEvery = data.cols <= 7 ? 1 : 5;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '54px 1fr',
      gap: 8,
      overflowX: 'auto',
    }}>
      {/* Y-axis labels */}
      <div style={{
        display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF',
        gap: 6, paddingTop: 4, paddingBottom: 28,
      }}>
        {labels.map((l) => <span key={l}>{l}</span>)}
      </div>

      {/* Grid + bottom day axis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{
          display: 'grid',
          gridTemplateRows: `repeat(4, 1fr)`,
          gridTemplateColumns: `repeat(${data.cols}, minmax(14px, 1fr))`,
          gap: 4,
          minWidth: data.cols > 14 ? Math.max(420, data.cols * 14) : undefined,
        }}>
          {/* Iterate top-to-bottom = row 3 (18-24) first visually */}
          {[3, 2, 1, 0].flatMap((row) =>
            data.cells[row].map((v, col) => {
              const lvl = v === 0 ? 0 :
                v >= max * 0.75 ? 4 :
                v >= max * 0.5 ? 3 :
                v >= max * 0.25 ? 2 : 1;
              return (
                <div
                  key={`${row}-${col}`}
                  title={v > 0 ? `${v} тест${v === 1 ? '' : v < 5 ? 'а' : 'ов'}` : 'нет активности'}
                  style={{
                    aspectRatio: '1 / 1',
                    background: HEATMAP_LEVELS[lvl],
                    borderRadius: 4,
                    transition: 'background 200ms',
                    cursor: 'default',
                  }}
                />
              );
            })
          )}
        </div>

        {/* Day axis */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.cols}, minmax(14px, 1fr))`,
          gap: 4,
          fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9CA3AF',
        }}>
          {Array.from({ length: data.cols }).map((_, i) => (
            <span key={i} style={{ textAlign: 'center' }}>
              {i % tickEvery === 0 ? data.cols - i : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Section progress bars — replaces "Accounts overview"
   ════════════════════════════════════════════════════════════════ */
interface SectionProgressRow {
  id: string;
  name: string;
  total: number;
  done: number;
  pct: number;
}

function buildSectionProgress(completedCourses: string[]): SectionProgressRow[] {
  // Aggregate: section.id → { total, done }
  const byId = new Map<string, { name: string; total: number; done: number }>();
  for (const m of modules) {
    const sec = getSectionById(m.sectionId);
    if (!sec) continue;
    const slot = byId.get(sec.id) ?? { name: sec.title, total: 0, done: 0 };
    slot.total += m.courses.length;
    slot.done  += m.courses.filter((c) => completedCourses.includes(c.id)).length;
    byId.set(sec.id, slot);
  }
  return Array.from(byId.entries())
    .map(([id, v]) => ({
      id, name: v.name, total: v.total, done: v.done,
      pct: v.total > 0 ? Math.round((v.done / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6); // top 6 to keep card compact
}

function SectionProgress({ rows }: { rows: SectionProgressRow[] }) {
  if (rows.length === 0) {
    return <EmptyHint text="Прогресс появится после первого пройденного курса." />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {rows.map((r) => (
        <div key={r.id}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            fontFamily: 'var(--font-body)', fontSize: 13,
            marginBottom: 6,
          }}>
            <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{r.name}</span>
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>
              {r.done}/{r.total} · <strong style={{ color: '#1A1A1A' }}>{r.pct}%</strong>
            </span>
          </div>
          <div style={{
            height: 8, borderRadius: 999, background: '#F1F3F6',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${r.pct}%`,
              background: ACCENT,
              borderRadius: 999,
              transition: 'width 400ms ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Recent attempts table — replaces "Tax Liabilities"
   ════════════════════════════════════════════════════════════════ */
function RecentAttempts({ attempts }: { attempts: { courseId: string; testLevel: number; score: number; total: number; passed: boolean; timestamp: number }[] }) {
  if (attempts.length === 0) {
    return <EmptyHint text="Сданные тесты появятся здесь." />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 0.7fr 0.9fr 0.7fr',
        gap: 8, padding: '4px 10px',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        <span>Курс / Тест</span>
        <span>Балл</span>
        <span>Дата</span>
        <span style={{ textAlign: 'right' }}>Статус</span>
      </div>
      {attempts.map((a) => {
        const course = getCourseById(a.courseId);
        const date = new Date(a.timestamp);
        const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        return (
          <div key={a.timestamp + a.courseId + a.testLevel} style={{
            display: 'grid', gridTemplateColumns: '2fr 0.7fr 0.9fr 0.7fr',
            gap: 8, padding: '10px',
            background: '#F8F9FB', borderRadius: 10,
            fontFamily: 'var(--font-body)', fontSize: 12.5,
            color: '#1A1A1A',
            alignItems: 'center',
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 600 }}>{course?.title ?? a.courseId}</span>
              <span style={{ color: '#9CA3AF', marginLeft: 6 }}>· Тест {a.testLevel}</span>
            </span>
            <span style={{ fontWeight: 600 }}>{a.score}/{a.total}</span>
            <span style={{ color: '#6B7280' }}>{dateStr}</span>
            <span style={{ textAlign: 'right' }}>
              <StatusPill passed={a.passed} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ passed }: { passed: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px',
      borderRadius: 999,
      background: passed ? '#DCFCE7' : '#FEF2F2',
      color:      passed ? '#166534' : '#B91C1C',
      fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
    }}>
      {passed ? '✓' : '✗'} {passed ? 'Пройден' : 'Не пройден'}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   Empty-state hint
   ════════════════════════════════════════════════════════════════ */
function EmptyHint({ text }: { text: string }) {
  return (
    <div style={{
      padding: '24px 16px', textAlign: 'center',
      fontFamily: 'var(--font-body)', fontSize: 13, color: '#9CA3AF',
      lineHeight: 1.5,
      background: '#F8F9FB',
      borderRadius: 10,
    }}>
      {text}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Inline icons
   ════════════════════════════════════════════════════════════════ */
function IconBook() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconCheckCircle() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
