'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { modules, TOTAL_COURSES, getModuleForCourse, getSectionById, getCourseById } from '@/lib/curriculum';
import { useAppStore, formatStudyTime, getTotalStudyTime } from '@/lib/store';
import { MAX_TEST_LEVELS } from '@/lib/quiz';

/* ═══════════════════════════════════════════
   Card primitive
   ═══════════════════════════════════════════ */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#F5F6F8',
      border: 'none',
      borderRadius: 20,
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, action, iconBg, iconColor }: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: iconBg || '#FFFFFF',
          color: iconColor || '#1A1A1A',
          flexShrink: 0,
        }}>
          {icon}
        </span>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}

function ActionPill({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px',
      background: '#FFFFFF',
      border: 'none',
      borderRadius: 999,
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
      color: '#1A1A1A',
      boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
      transition: 'transform 180ms, box-shadow 180ms',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(16,24,40,0.08), 0 4px 10px rgba(16,24,40,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)';
      }}
    >
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   Minimalist SVG icons per curriculum section
   ═══════════════════════════════════════════ */
function SectionIcon({ sectionId, size = 18 }: { sectionId: string; size?: number }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (sectionId) {
    case 'fundamentals':
      return (<svg {...common}><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>);
    case 'biomedical':
      return (<svg {...common}><path d="M4 3v18M20 3v18M4 12c4-2 12-2 16 0M4 5c4-2 12-2 16 0M4 19c4-2 12-2 16 0" /></svg>);
    case 'clinical':
      return (<svg {...common}><path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /><line x1="12" y1="12" x2="12" y2="18" /><line x1="9" y1="15" x2="15" y2="15" /></svg>);
    case 'allied':
      return (<svg {...common}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>);
    case 'skills':
      return (<svg {...common}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>);
    case 'hss':
      return (<svg {...common}><path d="M3 22h18M4 22V9l8-5 8 5v13M9 22v-9h6v9" /></svg>);
    case 'threads':
      return (<svg {...common}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>);
    case 'frontier':
      return (<svg {...common}><path d="M12 2l2.09 6.41L21 9l-5 4.73L17.18 21 12 17.77 6.82 21 8 13.73 3 9l6.91-.59L12 2z" /></svg>);
    case 'business':
      return (<svg {...common}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>);
    case 'regulatory':
      return (<svg {...common}><path d="M12 3v18M3 7l9-4 9 4M5 7v5l7 3 7-3V7M5 21h14" /></svg>);
    case 'career':
      return (<svg {...common}><path d="M22 10L12 4 2 10l10 6 10-6z" /><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" /></svg>);
    case 'tech':
      return (<svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></svg>);
    default:
      return (<svg {...common}><circle cx="12" cy="12" r="10" /></svg>);
  }
}

const Icon = {
  bars: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  hourglass: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12v4c0 3-2 5-4 6 2 1 4 3 4 6v4H6v-4c0-3 2-5 4-6-2-1-4-3-4-6V2z" />
    </svg>
  ),
  lineChart: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,17 9,11 13,15 21,7" />
      <polyline points="14,7 21,7 21,14" />
    </svg>
  ),
  timer: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M9 3h6" />
    </svg>
  ),
  chat: (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  ),
  play: (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  ),
  pause: (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  ),
  stop: (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  reset: (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,4 1,10 7,10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════
   Study session timer - Start / Pause / Resume / Stop
   Saves finished sessions into a "_session" entry of studyTime
   ═══════════════════════════════════════════ */
type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

function useStudySessionTimer() {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  return {
    status, seconds,
    start: () => { setSeconds(0); setStatus('running'); },
    pause: () => setStatus('paused'),
    resume: () => setStatus('running'),
    stop: () => setStatus('done'),
    reset: () => { setSeconds(0); setStatus('idle'); },
  };
}

function formatTimer(sec: number): { h: string; m: string; s: string } {
  return {
    h: String(Math.floor(sec / 3600)).padStart(2, '0'),
    m: String(Math.floor((sec % 3600) / 60)).padStart(2, '0'),
    s: String(sec % 60).padStart(2, '0'),
  };
}

/* ═══════════════════════════════════════════
   1. Training Analysis - bar chart of courses per period
   ═══════════════════════════════════════════ */
function TrainingAnalysisCard({ totalCompleted, thisQuarter, weeklyAttempts, sectionIds }: {
  totalCompleted: number;
  thisQuarter: number;
  weeklyAttempts: number[];
  sectionIds: string[];
}) {
  const max = Math.max(1, ...weeklyAttempts);
  return (
    <Card>
      <CardHeader
        icon={Icon.bars}
        title="Анализ обучения"
        iconBg="#D1FAE5"
        iconColor="#047857"
        action={<ActionPill label="Подробнее" />}
      />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18 }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
            color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {totalCompleted} <span style={{ fontWeight: 500, color: '#9CA3AF' }}>{pluralize(totalCompleted, 'курс', 'курса', 'курсов')}</span>
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
            marginTop: 6, fontWeight: 500,
          }}>
            Завершено в этом квартале
          </p>
          {/* Active sections - minimalist icons, stacked circles with count */}
          {sectionIds.length > 0 ? (
            <div style={{
              marginTop: 16,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex' }}>
                {sectionIds.slice(0, 5).map((id, i) => (
                  <div key={id} style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#FFFFFF',
                    color: '#1A1A1A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginLeft: i === 0 ? 0 : -10,
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                  }}>
                    <SectionIcon sectionId={id} size={18} />
                  </div>
                ))}
                {sectionIds.length > 5 && (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                    marginLeft: -10,
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                  }}>
                    +{sectionIds.length - 5}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                  color: '#1A1A1A', letterSpacing: '-0.01em',
                }}>
                  {sectionIds.length} {pluralize(sectionIds.length, 'раздел', 'раздела', 'разделов')}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: 11, color: '#9CA3AF',
                }}>
                  в работе
                </span>
              </div>
            </div>
          ) : (
            <p style={{
              marginTop: 16,
              fontFamily: 'var(--font-body)', fontSize: 12, color: '#9CA3AF',
              fontStyle: 'italic',
            }}>
              Пока нет активности - пройдите первый тест
            </p>
          )}
        </div>
        {/* Bar chart */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 5,
          height: 80,
        }}>
          {weeklyAttempts.map((v, i) => {
            const pct = (v / max) * 100;
            const isLast = i === weeklyAttempts.length - 1;
            return (
              <div key={i} style={{
                width: 14,
                height: `${Math.max(10, pct)}%`,
                background: isLast ? '#10B981' : '#D1FAE5',
                borderRadius: 4,
                transition: 'height 400ms cubic-bezier(0.22,1,0.36,1)',
              }} />
            );
          })}
        </div>
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════
   2. Daily Work Hours - stacked bar
   ═══════════════════════════════════════════ */
function DailyHoursCard({ totalSeconds, studySec, testSec, reviewSec }: {
  totalSeconds: number;
  studySec: number;
  testSec: number;
  reviewSec: number;
}) {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const total = Math.max(1, studySec + testSec + reviewSec);
  const sPct = (studySec / total) * 100;
  const tPct = (testSec / total) * 100;
  const rPct = (reviewSec / total) * 100;

  return (
    <Card>
      <CardHeader
        icon={Icon.hourglass}
        title="Часы обучения"
        iconBg="#FEF3C7"
        iconColor="#B45309"
        action={<ActionPill label="Подробнее" />}
      />
      <p style={{
        fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
        color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1,
        marginBottom: 14,
      }}>
        {hours} <span style={{ fontWeight: 500, color: '#9CA3AF' }}>ч</span> {mins} <span style={{ fontWeight: 500, color: '#9CA3AF' }}>мин всего</span>
      </p>
      {/* Stacked bar */}
      <div style={{
        display: 'flex', gap: 4,
        height: 8, borderRadius: 999, overflow: 'hidden',
        marginBottom: 12,
      }}>
        <div style={{ width: `${sPct}%`, background: '#F59E0B' }} />
        <div style={{ width: `${tPct}%`, background: '#3B82F6' }} />
        <div style={{ width: `${rPct}%`, background: '#8B5CF6' }} />
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <LegendDot color="#F59E0B" label="Изучение" />
        <LegendDot color="#3B82F6" label="Тесты" />
        <LegendDot color="#8B5CF6" label="Повторение" />
      </div>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280', fontWeight: 500,
      }}>
        {label}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. Work Hour Analysis - line chart with period pills
   ═══════════════════════════════════════════ */
type Period = '5D' | '2W' | '1M' | '6M' | '1Y';
const PERIOD_POINTS: Record<Period, number> = {
  '5D': 5, '2W': 14, '1M': 30, '6M': 26, '1Y': 12,
};
const PERIOD_LABELS: Record<Period, string> = {
  '5D': '5Д', '2W': '2Н', '1M': '1М', '6M': '6М', '1Y': '1Г',
};
const PERIOD_FULL: Record<Period, string> = {
  '5D': 'За 5 дней',
  '2W': 'За 2 недели',
  '1M': 'За месяц',
  '6M': 'За полгода',
  '1Y': 'За год',
};
const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function formatBucketLabel(period: Period, idx: number, total: number): string {
  const now = new Date();
  if (period === '5D' || period === '2W') {
    const daysAgo = total - 1 - idx;
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()}`;
  }
  if (period === '1M') {
    const daysAgo = total - 1 - idx;
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return `${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()}`;
  }
  if (period === '6M') {
    const daysAgo = Math.floor(((total - 1 - idx) * 180) / total);
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return `${d.getDate()} ${MONTHS[d.getMonth()].toLowerCase()}`;
  }
  // 1Y - monthly buckets
  const monthsAgo = total - 1 - idx;
  const d = new Date(now);
  d.setMonth(d.getMonth() - monthsAgo);
  return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function formatHoursShort(sec: number): string {
  if (sec < 60) return '< 1 мин';
  if (sec < 3600) return `${Math.round(sec / 60)} мин`;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

function WorkHourAnalysisCard({ data }: {
  data: Record<Period, number[]>;
}) {
  const [period, setPeriod] = useState<Period>('1M');
  const series = data[period];
  const max = Math.max(1, ...series);
  // Period-specific total (sum of series)
  const periodTotalSec = series.reduce((s, v) => s + v, 0);
  const hours = Math.floor(periodTotalSec / 3600);
  const mins = Math.floor((periodTotalSec % 3600) / 60);
  const highlightIdx = Math.floor(series.length * 0.55);
  const width = 480, height = 120, padding = { top: 16, bottom: 12, left: 8, right: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const step = chartW / Math.max(1, series.length - 1);

  const points = series.map((v, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartH - (v / max) * chartH;
    return { x, y };
  });
  // Smooth Catmull-Rom → Bezier path
  const smoothPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
    const tension = 0.22;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    return d;
  };
  const path = smoothPath(points);
  const areaPath = `${path} L ${points[points.length - 1]?.x ?? 0} ${padding.top + chartH} L ${points[0]?.x ?? 0} ${padding.top + chartH} Z`;
  const hi = points[highlightIdx];

  return (
    <Card>
      <CardHeader
        icon={Icon.lineChart}
        title="Анализ времени обучения"
        iconBg="#EDE9FE"
        iconColor="#6D28D9"
        action={<ActionPill label="Все данные" />}
      />
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14,
        marginBottom: 14,
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 8,
          }}>
            {PERIOD_FULL[period]}
          </p>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
            color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {periodTotalSec === 0 ? (
              <span style={{ color: '#9CA3AF' }}>Нет активности</span>
            ) : hours > 0 ? (
              <>
                {hours}<span style={{ color: '#9CA3AF', fontWeight: 500 }}> ч </span>
                {mins}<span style={{ color: '#9CA3AF', fontWeight: 500 }}> мин</span>
              </>
            ) : (
              <>
                {mins}<span style={{ color: '#9CA3AF', fontWeight: 500 }}> мин</span>
              </>
            )}
          </p>
        </div>
        {/* Period pills inline on the right */}
        <div style={{
          display: 'flex', gap: 4,
          background: '#FFFFFF', borderRadius: 10, padding: 4,
          width: 'fit-content',
          flexShrink: 0,
        }}>
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '5px 12px',
              background: period === p ? '#2A2A2A' : 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
              color: period === p ? '#FFFFFF' : '#6B7280',
              transition: 'all 180ms',
            }}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* horizontal guides */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={padding.left} x2={width - padding.right}
              y1={padding.top + chartH * f}
              y2={padding.top + chartH * f}
              stroke="#F0F1F5" strokeWidth={1} strokeDasharray="3 3"
            />
          ))}
          {/* area */}
          <defs>
            <linearGradient id="stats-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#stats-area)" />
          {/* line */}
          <path d={path} fill="none" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 2px 3px rgba(139,92,246,0.15))' }}
          />
          {/* highlight point */}
          {hi && (
            <>
              <circle cx={hi.x} cy={hi.y} r={7} fill="#FFFFFF" opacity={0.9} />
              <circle cx={hi.x} cy={hi.y} r={4.5} fill="#FFFFFF" stroke="#8B5CF6" strokeWidth={2} />
            </>
          )}
        </svg>
        {/* Tooltip over highlighted point */}
        {hi && series[highlightIdx] > 0 && (
          <div style={{
            position: 'absolute',
            left: `${(hi.x / width) * 100}%`,
            top: `${(hi.y / height) * 100}%`,
            transform: 'translate(-50%, -130%)',
            background: '#2A2A2A',
            border: 'none',
            borderRadius: 8,
            padding: '5px 10px',
            fontFamily: 'var(--font-display), var(--font-body)',
            fontSize: 11, fontWeight: 600,
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            letterSpacing: '-0.01em',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6, marginRight: 6 }}>
              {formatBucketLabel(period, highlightIdx, series.length)}
            </span>
            {formatHoursShort(series[highlightIdx])}
          </div>
        )}
      </div>

    </Card>
  );
}

/* ═══════════════════════════════════════════
   4. Time Tracker - current session + previous tasks
   ═══════════════════════════════════════════ */
function TimeTrackerCard({ recentCourses, onSessionEnd }: {
  recentCourses: { id: string; title: string; section: string; time: string }[];
  onSessionEnd: (seconds: number) => void;
}) {
  const timer = useStudySessionTimer();
  const { h, m, s } = formatTimer(timer.seconds);

  const STATUS_LABEL: Record<TimerStatus, string> = {
    idle: 'Ожидание',
    running: 'Идёт сессия',
    paused: 'На паузе',
    done: 'Сессия сохранена',
  };

  const handleStop = () => {
    // Завершить = авто-сохранение (если сессия ≥ 10 сек) + переход в done
    if (timer.seconds >= 10) {
      onSessionEnd(timer.seconds);
    }
    timer.stop();
  };

  const handleNewSession = () => {
    timer.reset();
  };

  return (
    <Card>
      <CardHeader
        icon={Icon.timer}
        title="Таймер обучения"
        iconBg="#DBEAFE"
        iconColor="#1D4ED8"
        action={
          <button
            style={{
              padding: '6px 12px',
              background: '#FFFFFF', border: 'none',
              borderRadius: 999, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              color: '#6B7280',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              transition: 'transform 180ms, box-shadow 180ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(16,24,40,0.08), 0 4px 10px rgba(16,24,40,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)';
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1,4 1,10 7,10" />
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            История
          </button>
        }
      />
      {/* Current session */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 14,
        padding: '18px 16px',
        marginBottom: 14,
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: timer.status === 'running' ? '#1D4ED8' : '#9CA3AF',
          textAlign: 'center',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 10,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', gap: 6,
        }}>
          {timer.status === 'running' && (
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#1D4ED8',
              animation: 'bordik-pulse 3.5s ease-in-out infinite',
            }} />
          )}
          {STATUS_LABEL[timer.status]}
        </p>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', textAlign: 'center',
          letterSpacing: '-0.02em', lineHeight: 1,
          marginBottom: 16,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {h}:{m}<span style={{ color: '#9CA3AF' }}>:{s}</span>
        </p>

        {/* Buttons change based on status */}
        {timer.status === 'idle' && (
          <button
            onClick={timer.start}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#2A2A2A',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              color: '#FFFFFF',
              transition: 'background 180ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1F2937'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#2A2A2A'; }}
          >
            <span style={{ color: '#FFFFFF', display: 'flex' }}>{Icon.play}</span>
            Начать обучение
          </button>
        )}

        {(timer.status === 'running' || timer.status === 'paused') && (
          <div style={{ display: 'flex', gap: 8 }}>
            {timer.status === 'running' ? (
              <button
                onClick={timer.pause}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#F5F6F8', border: 'none', borderRadius: 10,
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  color: '#1A1A1A',
                  transition: 'background 180ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
              >
                <span style={{ color: '#1A1A1A', display: 'flex' }}>{Icon.pause}</span>
                Пауза
              </button>
            ) : (
              <button
                onClick={timer.resume}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#F5F6F8', border: 'none', borderRadius: 10,
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  color: '#1A1A1A',
                  transition: 'background 180ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
              >
                <span style={{ color: '#1A1A1A', display: 'flex' }}>{Icon.play}</span>
                Продолжить
              </button>
            )}
            <button
              onClick={handleStop}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#FEF2F2',
                border: 'none', borderRadius: 10,
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                color: '#B91C1C',
                transition: 'background 180ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; }}
            >
              <span style={{ color: '#B91C1C', display: 'flex' }}>{Icon.stop}</span>
              Завершить
            </button>
          </div>
        )}

        {timer.status === 'done' && (
          <button
            onClick={handleNewSession}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#F5F6F8',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              color: '#1A1A1A',
              transition: 'background 180ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
          >
            <span style={{ color: '#1A1A1A', display: 'flex' }}>{Icon.play}</span>
            Новая сессия
          </button>
        )}
      </div>
      {/* Previous tasks */}
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 10,
      }}>
        Недавние курсы
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {recentCourses.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 12, color: '#9CA3AF',
            padding: '8px 0',
          }}>
            Пока нет пройденных курсов
          </p>
        ) : recentCourses.slice(0, 3).map((c, i) => {
          return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: '#FFFFFF',
              color: '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                color: '#1A1A1A', lineHeight: 1.3,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {c.title}
              </p>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9CA3AF',
                marginTop: 3, fontWeight: 500,
              }}>
                {c.time}
              </p>
            </div>
          </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════
   5. Daily Feedback - mood + comment
   ═══════════════════════════════════════════ */
function FeedbackCard() {
  const [mood, setMood] = useState<number | null>(null);
  const [text, setText] = useState('');
  const MOODS = ['😔', '🙁', '😐', '🙂', '😄'];

  return (
    <Card>
      <CardHeader
        icon={Icon.chat}
        title="Настроение дня"
        iconBg="#FCE7F3"
        iconColor="#BE185D"
        action={
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 12, color: '#9CA3AF',
            fontWeight: 500,
          }}>
            Вопрос
          </span>
        }
      />
      {/* Numbered circle */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: '#FCE7F3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
          color: '#BE185D',
        }}>
          01
        </span>
      </div>
      <p style={{
        textAlign: 'center',
        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
        color: '#1A1A1A', letterSpacing: '-0.01em',
        marginBottom: 6,
      }}>
        Как прошёл сегодняшний день обучения?
      </p>
      <p style={{
        textAlign: 'center',
        fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280', fontWeight: 500,
        marginBottom: 14,
      }}>
        Поделитесь настроением - это поможет нам понять
      </p>
      {/* Mood faces */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: 8,
        marginBottom: 12,
      }}>
        {MOODS.map((m, i) => {
          const isSel = mood === i;
          return (
            <button
              key={i}
              onClick={() => setMood(i)}
              style={{
                flex: 1,
                padding: '10px 0',
                background: isSel ? '#FCE7F3' : '#FFFFFF',
                border: isSel ? '1.5px solid #F9A8D4' : '1.5px solid transparent',
                borderRadius: 10,
                cursor: 'pointer',
                fontSize: 22,
                transition: 'background 180ms, border-color 180ms',
              }}
            >
              {m}
            </button>
          );
        })}
      </div>
      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Расскажите, почему!"
        rows={2}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#FFFFFF',
          border: 'none',
          borderRadius: 10,
          fontFamily: 'var(--font-body)', fontSize: 13,
          color: '#1A1A1A',
          outline: 'none',
          resize: 'none',
          marginBottom: 12,
        }}
      />
      <button style={{
        width: '100%',
        padding: '11px 16px',
        background: '#2A2A2A',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
        transition: 'background 180ms',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1F2937'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#2A2A2A'; }}
      >
        Следующий вопрос
      </button>
    </Card>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function StatisticsPage() {
  const {
    completedCourses, studyTime, testAttempts, courseTestProgress, userName,
    addStudyTime,
  } = useAppStore();

  const totalSec = getTotalStudyTime(studyTime);
  const allScores = Object.values(testAttempts).flat();

  // ═══ Training analysis - weekly attempts for last 8 weeks ═══
  const weeklyAttempts = useMemo(() => {
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const bins = Array(8).fill(0);
    for (const a of allScores) {
      const diff = now - a.timestamp;
      const weekIdx = 7 - Math.floor(diff / weekMs);
      if (weekIdx >= 0 && weekIdx < 8) bins[weekIdx]++;
    }
    return bins;
  }, [allScores]);

  // ═══ Daily hours breakdown (real) ═══
  // testSec  = number of test attempts × average duration (~4 minutes per attempt is typical)
  // reviewSec = time spent on courses where user has already passed max level (re-attempts)
  // studySec = remaining studyTime
  const AVG_TEST_SECONDS = 240; // 4 minutes - realistic average for a 20-question test
  const testAttemptsCount = allScores.length;
  const testSec = Math.min(totalSec, testAttemptsCount * AVG_TEST_SECONDS);

  const reviewSec = useMemo(() => {
    let s = 0;
    for (const [courseId, sec] of Object.entries(studyTime)) {
      // Time spent on completed courses counts as "review"
      if (completedCourses.includes(courseId)) {
        // Attribute 30% of time on completed courses to review (after initial pass)
        s += sec * 0.3;
      }
    }
    return Math.round(Math.min(s, totalSec - testSec));
  }, [studyTime, completedCourses, totalSec, testSec]);

  const studySec = Math.max(0, totalSec - testSec - reviewSec);

  // ═══ Line chart - real daily activity (tests + study sessions) ═══
  const lineData = useMemo<Record<Period, number[]>>(() => {
    const now = new Date();
    // Helper: bin timestamps into N-day-wide buckets covering the last `days` days
    const buildBins = (days: number, points: number): number[] => {
      const bucketMs = (days * 24 * 60 * 60 * 1000) / points;
      const bins = Array(points).fill(0);
      const endMs = now.getTime();
      const startMs = endMs - days * 24 * 60 * 60 * 1000;
      // Add test-attempt time (4 min per attempt)
      for (const a of allScores) {
        if (a.timestamp < startMs) continue;
        const idx = Math.min(points - 1, Math.floor((a.timestamp - startMs) / bucketMs));
        if (idx >= 0) bins[idx] += AVG_TEST_SECONDS;
      }
      // Distribute study time by spreading each course's total over its attempt dates
      // (heuristic: if no attempts yet, attribute to most recent bucket)
      const attemptsByCourse: Record<string, number[]> = {};
      for (const a of allScores) {
        attemptsByCourse[a.courseId] = attemptsByCourse[a.courseId] || [];
        attemptsByCourse[a.courseId].push(a.timestamp);
      }
      for (const [cid, sec] of Object.entries(studyTime)) {
        const ts = attemptsByCourse[cid];
        if (!ts || ts.length === 0) {
          // Put entire time in most recent bucket
          bins[points - 1] += sec;
          continue;
        }
        const perAttempt = sec / ts.length;
        for (const t of ts) {
          if (t < startMs) continue;
          const idx = Math.min(points - 1, Math.floor((t - startMs) / bucketMs));
          if (idx >= 0) bins[idx] += perAttempt;
        }
      }
      return bins;
    };
    return {
      '5D': buildBins(5, 5),
      '2W': buildBins(14, 14),
      '1M': buildBins(30, 30),
      '6M': buildBins(180, 26),
      '1Y': buildBins(365, 12),
    };
  }, [studyTime, allScores]);

  // ═══ Recent courses - real titles, sorted by most recent activity ═══
  const recentCourses = useMemo(() => {
    // Build map: courseId → lastActivity timestamp (max of test attempts OR "had studyTime")
    const lastActivity: Record<string, number> = {};
    for (const a of allScores) {
      lastActivity[a.courseId] = Math.max(lastActivity[a.courseId] || 0, a.timestamp);
    }
    // Courses with studyTime but no attempts → use current session fallback
    for (const cid of Object.keys(studyTime)) {
      if (!(cid in lastActivity)) lastActivity[cid] = 0;
    }
    return Object.entries(studyTime)
      .sort(([aId], [bId]) => (lastActivity[bId] || 0) - (lastActivity[aId] || 0))
      .slice(0, 3)
      .map(([id, sec]) => {
        const course = getCourseById(id);
        const mod = getModuleForCourse(id);
        const section = mod ? getSectionById(mod.sectionId) : undefined;
        return {
          id,
          title: course?.title || `Курс ${id}`,
          section: section?.title || mod?.title || '',
          time: formatStudyTime(sec),
        };
      });
  }, [studyTime, allScores]);

  // ═══ Active section IDs - sections where user has ANY activity ═══
  const activeSectionIds = useMemo(() => {
    const ids = new Set<string>();
    const addCourse = (cid: string) => {
      const mod = getModuleForCourse(cid);
      if (mod) ids.add(mod.sectionId);
    };
    for (const cid of completedCourses) addCourse(cid);
    for (const cid of Object.keys(studyTime)) addCourse(cid);
    for (const a of allScores) addCourse(a.courseId);
    return Array.from(ids);
  }, [completedCourses, studyTime, allScores]);

  // ═══ "This quarter" - courses completed in last 3 months ═══
  const thisQuarterCompleted = useMemo(() => {
    // We don't track completion timestamps explicitly, so approximate:
    // a course is "completed this quarter" if user has a passing level-5 attempt in the last 90 days
    const quarterMs = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const recentCompletions = new Set<string>();
    for (const a of allScores) {
      if (a.passed && a.testLevel === MAX_TEST_LEVELS && (now - a.timestamp) <= quarterMs) {
        recentCompletions.add(a.courseId);
      }
    }
    // Fallback: if no attempt history (old data), count all completed courses
    if (recentCompletions.size === 0 && completedCourses.length > 0) {
      return completedCourses.length;
    }
    return recentCompletions.size;
  }, [allScores, completedCourses]);

  return (
    <div
      className="stats-page"
      style={{ width: '100%', overflow: 'hidden' }}
    >
      {/* 2-column grid */}
      <div className="stats-2col" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)',
        gap: 12,
        width: '100%',
      }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TrainingAnalysisCard
            totalCompleted={thisQuarterCompleted}
            thisQuarter={thisQuarterCompleted}
            weeklyAttempts={weeklyAttempts}
            sectionIds={activeSectionIds}
          />
          <DailyHoursCard
            totalSeconds={totalSec}
            studySec={studySec}
            testSec={testSec}
            reviewSec={reviewSec}
          />
          <WorkHourAnalysisCard data={lineData} />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TimeTrackerCard
            recentCourses={recentCourses}
            onSessionEnd={(sec) => addStudyTime('_session', sec)}
          />
          <FeedbackCard />
        </div>
      </div>
    </div>
  );
}
