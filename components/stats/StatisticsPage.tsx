'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { modules, sections as allSections, TOTAL_COURSES, getCourseById, getModuleForCourse, getSectionById } from '@/lib/curriculum';
import { useAppStore, formatStudyTime, getTotalStudyTime } from '@/lib/store';
import { MAX_TEST_LEVELS } from '@/lib/quiz';
import { RUNNER_KINDS } from '@/lib/tool-meta-data';
import { CATALOG_TOOLS } from '@/lib/tools-catalog';
import { content as courseContent } from '@/lib/content';
// BodyMap is kept in the codebase (./BodyMap.tsx) but not surfaced — backlog.

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
  const toolUsage           = useAppStore((s) => s.toolUsage);

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

  /* ─── Tool kinds breakdown — count tool opens grouped by runner kind ── */
  const toolKindStats = useMemo(() => buildToolKindStats(toolUsage), [toolUsage]);

  /* ─── Recent test attempts table (replaces «Tax Liabilities») */
  const recentAttempts = useMemo(() => {
    return Object.values(testAttempts)
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [testAttempts]);

  return (
    <div className="stats-page" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header bar — explicit z-index so the period dropdown isn't
           covered by KPI-row siblings (each motion.div creates its own
           stacking context via the entrance transform). */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0 }}
        style={{
          position: 'relative',
          zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700,
            color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: 4,
          }}>
            Статистика обучения
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
          }}>
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
                boxShadow: '0 12px 32px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
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
      </motion.div>

      {/* KPI cards row */}
      <div className="stats-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        {/* each KpiCard wrapped below carries its own stagger delay */}
        <KpiCard
          delay={60}
          label="Курсов пройдено"
          tip="Сколько курсов из общей программы вы уже завершили. Курс считается пройденным после успешной сдачи всех тестов."
          value={`${metrics.coursesDone}`}
          sub={`из ${metrics.coursesTotal}`}
          delta={metrics.completedPct > 0 ? `${metrics.completedPct}% от программы` : 'начни первый курс'}
          deltaPositive
          icon={<IconBook />}
        />
        <KpiCard
          delay={120}
          label="Тестов сдано"
          tip="Количество успешно сданных попыток из всех ваших тестов. В скобках — общее число попыток (включая неудачные)."
          value={`${metrics.passedTests}`}
          sub={`из ${metrics.totalAttempts} попыток`}
          delta={metrics.avgScore > 0 ? `средний балл ${metrics.avgScore}%` : 'нет попыток'}
          deltaPositive={metrics.avgScore >= 80}
          icon={<IconCheckCircle />}
        />
        <KpiCard
          delay={180}
          label="Время обучения"
          tip="Суммарное время, проведённое в курсах и инструментах. Считается, пока вкладка активна."
          value={formatStudyTime(metrics.studyTime).split(' ')[0]}
          sub={formatStudyTime(metrics.studyTime).split(' ').slice(1).join(' ') || ''}
          delta={metrics.studyTime > 0 ? 'продолжайте в том же темпе' : 'начните учиться'}
          deltaPositive
          icon={<IconClock />}
        />
      </div>

      {/* Activity heatmap */}
      <Section
        delay={240}
        title="Активность по дням"
        tip="Карта вашей активности за выбранный период. Каждая ячейка — один календарный день, цвет показывает сколько тестов вы сдали в этот день."
        subtitle={
          period === 'all'
            ? 'Активность за год — листайте между годами'
            : `${heatmap.totalActiveDays} дней с активностью · ${heatmap.totalSessions} сессий`
        }
      >
        {period === 'all'
          ? <YearHeatmap testAttempts={testAttempts} />
          : <Heatmap data={heatmap} period={period} />}
      </Section>

      {/* Bottom 2-col grid: Section progress hex | Recent attempts */}
      <div className="stats-2col" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
        gap: 14,
        width: '100%',
      }}>
        <Section
          delay={300}
          title="Прогресс по модулям"
          tip="Каждый шестигранник — один из модулей программы. Цвет показывает процент пройденных курсов в модуле: чем ярче — тем выше прогресс."
          subtitle={`Последние ${PERIOD_LABELS[period].toLowerCase()}`}
        >
          <SectionHex rows={sectionProgress} />
        </Section>

        <Section
          delay={360}
          title="Последние тесты"
          tip="Шесть последних попыток сдачи теста. Показан балл, дата и статус (пройден / не пройден)."
          subtitle="Шесть свежих попыток"
        >
          <RecentAttempts attempts={recentAttempts} />
        </Section>
      </div>

      {/* Tool kinds — separate row */}
      <Section
        delay={420}
        title="Использование инструментов"
        tip="Сколько раз вы открывали клинические калькуляторы и шкалы. Дробь справа от полосы — уникальные инструменты из общего числа доступных."
        subtitle="Счётчик открытий по типу инструмента"
      >
        <ToolKindsPanel stats={toolKindStats} />
      </Section>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   InfoTip — hover/focus tooltip rendered next to the (i) icon.
   Uses pure CSS visibility on hover/focus; no JS state, no layout shift
   (the tooltip is absolutely positioned so it doesn't push siblings).
   ════════════════════════════════════════════════════════════════ */
function InfoTip({ text }: { text: string }) {
  return (
    <span
      tabIndex={0}
      className="stats-infotip"
      aria-label={text}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'help',
        outline: 'none',
      }}
    >
      <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
        stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span className="stats-infotip__bubble" role="tooltip">{text}</span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   KPI Card — top row tiles like screenshot's Total Revenue etc.
   ════════════════════════════════════════════════════════════════ */
function KpiCard({ label, value, sub, delta, deltaPositive, icon, tip, delay = 0 }: {
  label: string; value: string; sub?: string;
  delta: string; deltaPositive: boolean;
  icon: React.ReactNode;
  tip?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: delay / 1000 }}
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0F1F5',
        borderRadius: 16,
        padding: 18,
        display: 'flex', flexDirection: 'column', gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
          fontWeight: 500,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          {label}
          {tip && <InfoTip text={tip} />}
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
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Section card — bottom blocks (Cash flow / Accounts / Tax)
   ════════════════════════════════════════════════════════════════ */
function Section({ title, subtitle, children, action, tip, delay = 0 }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  tip?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: delay / 1000 }}
      style={{
        background: '#FFFFFF',
        border: '1px solid #F0F1F5',
        borderRadius: 16,
        padding: 18,
        display: 'flex', flexDirection: 'column', gap: 14,
        minWidth: 0,
      }}
    >
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
            {tip && <InfoTip text={tip} />}
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
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Heatmap — replaces "Cash flow summary" calendar grid
   X-axis = day of period (1..N), Y-axis = hour band (0-6, 6-12, 12-18, 18-24).
   Intensity = number of test sessions in that bucket.
   ════════════════════════════════════════════════════════════════ */
interface HeatmapData {
  cells: number[];          // session count per day (length = cols)
  bands: number[][];        // hour-band breakdown per day [cols][4]
  cols: number;
  totalActiveDays: number;
  totalSessions: number;
}

function buildHeatmap(testAttempts: Record<string, { timestamp: number }[]>, period: Period): HeatmapData {
  const today = new Date();
  // startTime = local midnight of column 0; days = column count.
  // Months align to the calendar — col 0 is the 1st of the current month,
  // col days-1 is the last day. Year aligns to 1 Jan / 31 Dec.
  let startTime: number;
  let days: number;
  if (period === 'week') {
    // Current ISO-style week: column 0 = Monday of this week, column 6 = Sunday.
    // Future days of the week are still rendered as empty cells.
    days = 7;
    const start = new Date(today);
    const dow = start.getDay();        // 0 = Sun .. 6 = Sat
    const offsetToMon = (dow + 6) % 7; // Mon → 0, Sun → 6
    start.setDate(start.getDate() - offsetToMon);
    start.setHours(0, 0, 0, 0);
    startTime = start.getTime();
  } else if (period === 'month') {
    days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    startTime = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0).getTime();
  } else {
    const yearStart = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
    const yearEnd   = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    days = Math.round((yearEnd.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    startTime = yearStart.getTime();
  }

  const cells: number[] = Array(days).fill(0);
  const bands: number[][] = Array.from({ length: days }, () => [0, 0, 0, 0]);
  const activeDays = new Set<number>();
  let totalSessions = 0;

  for (const list of Object.values(testAttempts)) {
    for (const a of list) {
      const offsetMs = a.timestamp - startTime;
      const col = Math.floor(offsetMs / (24 * 60 * 60 * 1000));
      if (col < 0 || col >= days) continue;
      const date = new Date(a.timestamp);
      const hour = date.getHours();
      const band =
        hour < 6 ? 0 :
        hour < 12 ? 1 :
        hour < 18 ? 2 : 3;
      cells[col] += 1;
      bands[col][band] += 1;
      activeDays.add(col);
      totalSessions += 1;
    }
  }

  return {
    cells,
    bands,
    cols: days,
    totalActiveDays: activeDays.size,
    totalSessions,
  };
}

function Heatmap({ data, period }: { data: HeatmapData; period: Period }) {
  const max = Math.max(1, ...data.cells);
  const [hovered, setHovered] = useState<number | null>(null);
  const today = new Date();

  // Resolve a calendar date for a given day index.
  const dateForCol = (col: number) => {
    if (period === 'month') {
      return new Date(today.getFullYear(), today.getMonth(), col + 1);
    }
    // week — col 0 is THIS week's Monday
    const monday = new Date(today);
    const dow = monday.getDay();
    const offsetToMon = (dow + 6) % 7;
    monday.setDate(monday.getDate() - offsetToMon);
    monday.setDate(monday.getDate() + col);
    return monday;
  };
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });

  // For the month view we render a calendar grid (7 cols × weeks rows) so
  // cells are big enough to read. Compute leading/trailing padding to align
  // the 1st of the month under its real weekday.
  const isCalendar = period === 'month';
  const monthFirstDow = isCalendar
    ? new Date(today.getFullYear(), today.getMonth(), 1).getDay()
    : 0;
  const leadingPad = isCalendar ? (monthFirstDow + 6) % 7 : 0; // Mon = 0
  const weeks = isCalendar ? Math.ceil((leadingPad + data.cols) / 7) : 1;
  const totalCells = isCalendar ? weeks * 7 : data.cols;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0,
      position: 'relative',
      overflow: 'visible',
    }}>
      {isCalendar ? (
        // ── Calendar grid (month view) ──
        // Cells stretch the full card width as wide rectangles — taller than
        // the year heatmap dots, but not square.
        <div style={{ width: '100%' }}>
          {/* Day-of-week header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF',
            paddingBottom: 4,
          }}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
              <span key={d} style={{ textAlign: 'center' }}>{d}</span>
            ))}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: '1fr',
            gap: 6,
          }}>
            {Array.from({ length: totalCells }).map((_, idx) => {
              const dayIdx = idx - leadingPad;
              const inMonth = dayIdx >= 0 && dayIdx < data.cols;
              const v = inMonth ? data.cells[dayIdx] : 0;
              const lvl = !inMonth ? -1
                : v === 0 ? 0
                : v >= max * 0.75 ? 4
                : v >= max * 0.5 ? 3
                : v >= max * 0.25 ? 2 : 1;
              const isHovered = hovered === dayIdx && inMonth;
              return (
                <div
                  key={idx}
                  onPointerEnter={inMonth ? () => setHovered(dayIdx) : undefined}
                  onPointerLeave={inMonth ? () => setHovered((c) => (c === dayIdx ? null : c)) : undefined}
                  className="stats-heat-cell"
                  style={{
                    height: 56,
                    background: lvl < 0 ? 'transparent' : HEATMAP_LEVELS[lvl],
                    borderRadius: 6,
                    cursor: inMonth ? 'default' : undefined,
                    outline: isHovered ? `2px solid ${ACCENT}` : 'none',
                    outlineOffset: isHovered ? 1 : 0,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                    padding: 4,
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: lvl >= 3 ? 'rgba(255,255,255,0.85)' : '#6B7280',
                  }}
                >
                  {inMonth ? dayIdx + 1 : ''}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // ── Week view — same visual as calendar but a single row of 7 cells.
        <div style={{ width: '100%' }}>
          {/* Day-of-week header — based on actual dates so order is correct
               regardless of which weekday "today" lands on. */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
            fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF',
            paddingBottom: 4,
          }}>
            {Array.from({ length: data.cols }).map((_, i) => {
              const d = dateForCol(i);
              const dow = d.toLocaleDateString('ru-RU', { weekday: 'short' });
              const cap = dow.charAt(0).toUpperCase() + dow.slice(1).replace('.', '');
              return (
                <span key={i} style={{ textAlign: 'center' }}>{cap}</span>
              );
            })}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
          }}>
            {data.cells.map((v, col) => {
              const lvl = v === 0 ? 0 :
                v >= max * 0.75 ? 4 :
                v >= max * 0.5 ? 3 :
                v >= max * 0.25 ? 2 : 1;
              const isHovered = hovered === col;
              const day = dateForCol(col).getDate();
              return (
                <div
                  key={col}
                  onPointerEnter={() => setHovered(col)}
                  onPointerLeave={() => setHovered((c) => (c === col ? null : c))}
                  className="stats-heat-cell"
                  style={{
                    height: 56,
                    background: HEATMAP_LEVELS[lvl],
                    borderRadius: 6,
                    cursor: 'default',
                    outline: isHovered ? `2px solid ${ACCENT}` : 'none',
                    outlineOffset: isHovered ? 1 : 0,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
                    padding: 4,
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: lvl >= 3 ? 'rgba(255,255,255,0.85)' : '#6B7280',
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom hover tooltip — date + simple "сделано N тестов" line. */}
      {hovered !== null && (() => {
        const col = hovered;
        const v = data.cells[col];
        const date = fmtDate(dateForCol(col));
        const testWord = v === 1 ? 'тест' : v < 5 ? 'теста' : 'тестов';
        // Tooltip horizontal anchor:
        //   calendar  → centred on the cell's weekday column (1..7)
        //   week strip → centred on the day in the linear strip
        const colPct = isCalendar
          ? (((leadingPad + col) % 7 + 0.5) / 7) * 100
          : ((col + 0.5) / data.cols) * 100;
        // Tooltip vertical anchor: above the row the cell lives in.
        const rowOfCell = isCalendar ? Math.floor((leadingPad + col) / 7) : 0;
        return (
          <div
            style={{
              position: 'absolute',
              left: `${colPct}%`,
              top: isCalendar ? `calc(${(rowOfCell / weeks) * 100}% - 4px)` : undefined,
              bottom: isCalendar ? undefined : 'calc(100% + 14px)',
              transform: isCalendar ? 'translate(-50%, -100%)' : 'translateX(-50%)',
              background: '#1A1A1A',
              color: '#F4F5F7',
              padding: '10px 14px',
              borderRadius: 8,
              fontFamily: 'var(--font-body)', fontSize: 12,
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08)',
              zIndex: 5,
            }}
          >
            <div style={{ fontWeight: 600 }}>{date}</div>
            <div style={{
              fontSize: 12,
              color: v > 0 ? '#F4F5F7' : '#9CA3AF',
              marginTop: 2,
            }}>
              {v === 0 ? 'нет активности' : `Сделано ${v} ${testWord}`}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   YearHeatmap — GitHub-style contribution graph for the "All time" view.
   7 rows (days of week), N columns (weeks). Year switcher below.
   ════════════════════════════════════════════════════════════════ */
function YearHeatmap({ testAttempts }: {
  testAttempts: Record<string, { timestamp: number }[]>;
}) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [hovered, setHovered] = useState<number | null>(null);

  // Pre-compute years that have at least one attempt + always current year.
  const availableYears = useMemo(() => {
    const set = new Set<number>([currentYear]);
    for (const list of Object.values(testAttempts)) {
      for (const a of list) set.add(new Date(a.timestamp).getFullYear());
    }
    return Array.from(set).sort();
  }, [testAttempts, currentYear]);

  const yearData = useMemo(() => {
    const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
    const yearEnd   = new Date(year, 11, 31, 23, 59, 59, 999);
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.round((yearEnd.getTime() - yearStart.getTime()) / dayMs) + 1;
    const counts = Array(days).fill(0);
    let total = 0;
    let activeDays = 0;
    for (const list of Object.values(testAttempts)) {
      for (const a of list) {
        const offset = a.timestamp - yearStart.getTime();
        if (offset < 0 || offset >= days * dayMs) continue;
        const di = Math.floor(offset / dayMs);
        if (counts[di] === 0) activeDays += 1;
        counts[di] += 1;
        total += 1;
      }
    }
    // Day-of-week of Jan 1 (0=Sun..6=Sat). We use Mon-first layout.
    const jan1 = yearStart.getDay();
    const leadingPad = (jan1 + 6) % 7; // Mon → 0
    const weeks = Math.ceil((days + leadingPad) / 7);
    return { counts, days, leadingPad, weeks, total, activeDays };
  }, [testAttempts, year]);

  const max = Math.max(1, ...yearData.counts);
  const monthLabels = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const dowLabels   = ['Пн', '', 'Ср', '', 'Пт', '', 'Вс'];

  // Build month-label positions: for each week column, what month does its
  // first cell belong to? Place a label at the FIRST week of that month.
  const monthOfWeek: (number | null)[] = useMemo(() => {
    const out: (number | null)[] = Array(yearData.weeks).fill(null);
    let lastMonth = -1;
    for (let w = 0; w < yearData.weeks; w++) {
      // Find first valid day in this week (cell index = w*7 - leadingPad)
      const firstDayIdx = w * 7 - yearData.leadingPad;
      if (firstDayIdx < 0 || firstDayIdx >= yearData.days) continue;
      const date = new Date(year, 0, 1 + firstDayIdx);
      const m = date.getMonth();
      if (m !== lastMonth) {
        out[w] = m;
        lastMonth = m;
      }
    }
    return out;
  }, [yearData, year]);

  const dayDate = (di: number) => {
    const d = new Date(year, 0, 1);
    d.setDate(d.getDate() + di);
    return d;
  };
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '24px minmax(0, 1fr)',
        columnGap: 6,
        position: 'relative',
        overflow: 'visible',
      }}>
        {/* Top-left empty + month labels row */}
        <div />
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${yearData.weeks}, minmax(0, 1fr))`,
          columnGap: 3,
          fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9CA3AF',
          marginBottom: 4,
        }}>
          {monthOfWeek.map((m, w) => (
            <span key={w} style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
              {m !== null ? monthLabels[m] : ''}
            </span>
          ))}
        </div>

        {/* Day-of-week labels */}
        <div style={{
          display: 'grid',
          gridTemplateRows: 'repeat(7, 1fr)',
          rowGap: 3,
          fontFamily: 'var(--font-mono)', fontSize: 9, color: '#9CA3AF',
        }}>
          {dowLabels.map((l, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {l}
            </span>
          ))}
        </div>

        {/* The 7×weeks cell grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${yearData.weeks}, minmax(0, 1fr))`,
          gridTemplateRows: 'repeat(7, 1fr)',
          gap: 3,
          gridAutoFlow: 'column',
          position: 'relative',
        }}>
          {Array.from({ length: yearData.weeks * 7 }).map((_, idx) => {
            const di = idx - yearData.leadingPad;
            const inYear = di >= 0 && di < yearData.days;
            const v = inYear ? yearData.counts[di] : 0;
            const lvl = !inYear ? -1
              : v === 0 ? 0
              : v >= max * 0.75 ? 4
              : v >= max * 0.5 ? 3
              : v >= max * 0.25 ? 2
              : 1;
            const isHovered = hovered === di && inYear;
            return (
              <div
                key={idx}
                onPointerEnter={inYear ? () => setHovered(di) : undefined}
                onPointerLeave={inYear ? () => setHovered((c) => (c === di ? null : c)) : undefined}
                className="stats-heat-cell"
                style={{
                  aspectRatio: '1 / 1',
                  background: lvl < 0 ? 'transparent' : HEATMAP_LEVELS[lvl],
                  borderRadius: 3,
                  cursor: inYear ? 'default' : undefined,
                  outline: isHovered ? `2px solid ${ACCENT}` : 'none',
                  outlineOffset: isHovered ? 1 : 0,
                }}
              />
            );
          })}

          {/* Tooltip */}
          {hovered !== null && (() => {
            const v = yearData.counts[hovered];
            const date = fmtDate(dayDate(hovered));
            // Compute the cell's column (week) for tooltip horizontal anchor
            const col = Math.floor((hovered + yearData.leadingPad) / 7);
            const colPct = ((col + 0.5) / yearData.weeks) * 100;
            const word = v === 1 ? 'тест' : v < 5 ? 'теста' : 'тестов';
            return (
              <div style={{
                position: 'absolute',
                left: `${colPct}%`,
                bottom: 'calc(100% + 8px)',
                transform: 'translateX(-50%)',
                background: '#1A1A1A',
                color: '#F4F5F7',
                padding: '10px 14px',
                borderRadius: 8,
                fontFamily: 'var(--font-body)', fontSize: 12,
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08)',
                zIndex: 5,
              }}>
                <div style={{ fontWeight: 600 }}>{date}</div>
                <div style={{
                  fontSize: 12,
                  color: v > 0 ? '#F4F5F7' : '#9CA3AF',
                  marginTop: 2,
                }}>
                  {v === 0 ? 'нет активности' : `Сделано ${v} ${word}`}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Year switcher + summary */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, paddingTop: 12, borderTop: '1px solid #F0F1F5',
        flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280',
        }}>
          <strong style={{ color: '#1A1A1A', fontWeight: 700 }}>{yearData.activeDays}</strong>
          {' '}{yearData.activeDays === 1 ? 'день' : yearData.activeDays < 5 ? 'дня' : 'дней'} активности
          {' · '}
          <strong style={{ color: '#1A1A1A', fontWeight: 700 }}>{yearData.total}</strong>
          {' '}{yearData.total === 1 ? 'тест' : yearData.total < 5 ? 'теста' : 'тестов'}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <YearArrow disabled={!availableYears.includes(year - 1) && year - 1 < availableYears[0]}
            onClick={() => setYear((y) => y - 1)} dir="prev" />
          {availableYears.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                background: y === year ? ACCENT : 'transparent',
                color:      y === year ? '#FFFFFF' : '#6B7280',
                transition: 'background 160ms, color 160ms',
              }}
            >
              {y}
            </button>
          ))}
          <YearArrow disabled={year + 1 > currentYear} onClick={() => setYear((y) => y + 1)} dir="next" />
        </div>
      </div>
    </div>
  );
}

function YearArrow({ disabled, onClick, dir }: {
  disabled: boolean; onClick: () => void; dir: 'prev' | 'next';
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Предыдущий год' : 'Следующий год'}
      style={{
        width: 26, height: 26, borderRadius: 999,
        background: 'transparent', border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#6B7280',
      }}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        {dir === 'prev'
          ? <polyline points="15 18 9 12 15 6" />
          : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
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
  /** Section has at least one course with actual lesson content written. */
  withContent: number;
}

function buildSectionProgress(completedCourses: string[]): SectionProgressRow[] {
  // Pre-seed every curriculum section so the hex map always shows ALL real
  // sections. `withContent` tracks how many courses in the section have
  // actual lesson body written — a section with `withContent === 0` is not
  // truly "available" for navigation even if courses are listed.
  const byId = new Map<string, { name: string; total: number; done: number; withContent: number }>();
  for (const s of allSections) {
    byId.set(s.id, { name: s.title, total: 0, done: 0, withContent: 0 });
  }
  for (const m of modules) {
    const sec = getSectionById(m.sectionId);
    if (!sec) continue;
    const slot = byId.get(sec.id) ?? { name: sec.title, total: 0, done: 0, withContent: 0 };
    for (const c of m.courses) {
      slot.total += 1;
      if (completedCourses.includes(c.id)) slot.done += 1;
      if (courseContent[c.id] && Object.keys(courseContent[c.id]).length > 0) {
        slot.withContent += 1;
      }
    }
    byId.set(sec.id, slot);
  }
  return Array.from(byId.entries())
    .map(([id, v]) => ({
      id, name: v.name, total: v.total, done: v.done, withContent: v.withContent,
      pct: v.total > 0 ? Math.round((v.done / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);
}

/* ────────────────────────────────────────────────────────────────
   SectionHex — honeycomb cluster visualisation, matches the
   reference Findeck/email "Performance" hexagon heatmap.
   Each hex = one curriculum section, colour intensity = % completion.
   Below the cluster: 3 summary metrics (% started / completed / avg).
   ────────────────────────────────────────────────────────────── */
function SectionHex({ rows }: { rows: SectionProgressRow[] }) {
  // Layout: tight cluster of 22 sections. We sort by completion desc and
  // place the most-complete sections in the centre (mirrors the reference's
  // hot core). Offset rows produce a real hex packing.
  // Pattern (rows of cols): 4-5-6-5-4-… giving a roughly diamond cluster.
  // Total slots = 22 — exactly the curriculum section count.
  const layout = useMemo(() => buildHexLayout(rows), [rows]);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const setShowStats = useAppStore((s) => s.setShowStats);
  // Clicking a hex must (a) close the Stats view and (b) navigate to the
  // section. setActiveSection alone wouldn't be enough — page.tsx prefers
  // `showStats` over `activeSection` when picking the view.
  const goToSection = (id: any) => {
    setShowStats(false);
    setActiveSection(id);
  };
  // Custom in-SVG tooltip — replaces the native browser bubble so we control
  // the dark-on-white styling and can show different copy for unavailable
  // (placeholder) tiles.
  const [hoveredCell, setHoveredCell] = useState<typeof layout.cells[number] | null>(null);

  // Aggregate stats — analogues of the reference's three % footer rows.
  const startedCount   = rows.filter((r) => r.done > 0).length;
  const completedCount = rows.filter((r) => r.pct >= 100).length;
  const avgPct = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length)
    : 0;

  if (rows.length === 0) {
    return <EmptyHint text="Прогресс появится после первого пройденного курса." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'stretch' }}>
      {/* Hex cluster */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        padding: '4px 0 8px',
      }}>
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          // overflow: visible so the tooltip foreignObject can extend past
          // the SVG viewBox without being clipped on narrow viewports.
          style={{ display: 'block', maxWidth: '100%', overflow: 'visible' }}
          // Single, reliable "leave" point — when the cursor exits the SVG
          // the hover state and tooltip clear. Per-cell pointerLeave was
          // unreliable: when scaled hexes overlap neighbours, leave events
          // race with enter events and the previous cell could stay marked
          // as hovered indefinitely.
          onPointerLeave={() => setHoveredCell(null)}
        >
          {/* Render unhovered cells first, then hovered last so it draws on top.
               (SVG has no z-index — paint order is the only way.)
               We compare by row.id rather than object reference so a stale
               hoveredCell from a previous layout never gets re-appended next
               to the new cell with the same id (would duplicate React keys). */}
          {(() => {
            const hoveredId = hoveredCell?.row.id ?? null;
            const renderOrder = hoveredId
              ? [
                  ...layout.cells.filter((c) => c.row.id !== hoveredId),
                  ...layout.cells.filter((c) => c.row.id === hoveredId),
                ]
              : layout.cells;
            return renderOrder.map((c) => {
              const isPlaceholder = c.row.id.startsWith('__ph');
              // A section is "available" only if at least one of its courses
              // has actual lesson content written. Curriculum config lists
              // many courses but most are still empty stubs — those sections
              // show as unavailable until content lands.
              const hasContent = c.row.withContent > 0;
              const sectionId = (isPlaceholder || !hasContent) ? null : (c.row.id as any);
              const interactive = !!sectionId;
              return (
                // Plain <g> — entrance/exit animations on hex cells caused
                // every cell to re-run its fade-in whenever hoveredCell
                // changed (state update → React re-renders the IIFE → motion
                // re-evaluates each child). Hover scale is now CSS-only;
                // no per-cell motion needed.
                <g
                  key={c.row.id}
                  onClick={interactive ? () => goToSection(sectionId) : undefined}
                  onPointerEnter={() => setHoveredCell(c)}
                  className={interactive ? 'stats-hex stats-hex--interactive' : 'stats-hex'}
                  // transform-origin in SVG user-space coords. transformBox: fill-box
                  // would re-anchor to bbox top-left and skew the hex sideways on
                  // scale; the default user-space behaviour is what we want here.
                  style={{
                    transformOrigin: `${c.cx}px ${c.cy}px`,
                    cursor: interactive ? 'pointer' : 'not-allowed',
                  }}
                >
                  <polygon
                    points={hexPoints(c.cx, c.cy, layout.size)}
                    fill={hexColor(c.row.pct)}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                  {c.row.pct > 0 && (
                    <text
                      x={c.cx}
                      y={c.cy + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontFamily="var(--font-mono)"
                      fontWeight={700}
                      fill={c.row.pct >= 50 ? '#FFFFFF' : ACCENT_DARK}
                      style={{ pointerEvents: 'none' }}
                    >
                      {c.row.pct}
                    </text>
                  )}
                </g>
              );
            });
          })()}

          {/* Custom hover tooltip — rendered last so it draws above hexes.
               Centred on the hovered hex; flips below the hex when there's
               no room above. Uses foreignObject so the bubble inherits site
               typography and wraps long section names. */}
          {hoveredCell && (() => {
            const isPlaceholder = hoveredCell.row.id.startsWith('__ph');
            const isEmpty = !isPlaceholder && hoveredCell.row.withContent === 0;
            const showAsUnavailable = isPlaceholder || isEmpty;
            const tipW = 200;
            const tipH = 56;
            // Centre horizontally on the hex. We don't clamp to the SVG
            // viewBox here because the SVG natural width can be much
            // smaller than the tooltip on a 12-cell cluster; clamping made
            // the tooltip overshoot to the right and clip on the left.
            // SVG has overflow: visible, so extending past the viewBox is OK.
            const tipX = hoveredCell.cx - tipW / 2;
            // Prefer above the hex; if there's no room, render below.
            const aboveY = hoveredCell.cy - layout.size - tipH - 8;
            const belowY = hoveredCell.cy + layout.size + 8;
            const tipY = aboveY >= 4 ? aboveY : belowY;
            return (
              <foreignObject
                x={tipX}
                y={tipY}
                width={tipW}
                height={tipH}
                pointerEvents="none"
                style={{ overflow: 'visible' }}
              >
                <div
                  // @ts-ignore - xmlns required for foreignObject HTML content
                  xmlns="http://www.w3.org/1999/xhtml"
                  className={`stats-hex-tip${showAsUnavailable ? ' stats-hex-tip--off' : ''}`}
                >
                  <div className="stats-hex-tip__title">
                    {isPlaceholder ? 'Модуль недоступен'
                      : isEmpty ? hoveredCell.row.name
                      : hoveredCell.row.name}
                  </div>
                  <div className="stats-hex-tip__sub">
                    {isPlaceholder ? 'Скоро появится'
                      : isEmpty ? 'Скоро появится'
                      : `${hoveredCell.row.pct}% · ${hoveredCell.row.done}/${hoveredCell.row.total}`}
                  </div>
                </div>
              </foreignObject>
            );
          })()}
        </svg>
      </div>

      {/* Summary stat row — three columns separated by faint dividers */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0, padding: '12px 0 4px',
        borderTop: '1px solid #F0F1F5',
      }}>
        <HexStat dotColor={ACCENT}      value={`${avgPct}%`}      label="Средний прогресс" />
        <HexStat dotColor="#7AA5FA"     value={`${startedCount}`} label="Модулей начато" border />
        <HexStat dotColor="#A8C7FF"     value={`${completedCount}`} label="Завершено модулей" />
      </div>

      {/* Top sections list — small, like the % rows under the hex chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {rows.slice(0, 4).map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 * i }}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: 'var(--font-body)', fontSize: 12,
              padding: '6px 0',
              borderTop: '1px solid #F8F9FB',
            }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: '#1A1A1A', fontWeight: 500,
              minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: hexColor(r.pct),
                flexShrink: 0,
              }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.pct}% {r.name}</span>
            </span>
            <span style={{
              color: '#9CA3AF', fontSize: 11,
              flexShrink: 0,
            }}>
              {r.done}/{r.total}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* Hex helpers ────────────────────────────────────────────────── */
interface HexCell {
  row: SectionProgressRow;
  cx: number;
  cy: number;
}
interface HexLayout {
  cells: HexCell[];
  width: number;
  height: number;
  size: number;
}

function patternFor(n: number): number[] {
  // Hand-tuned diamond clusters for common counts. Falls back to a generic
  // ceil(n / rowCount) distribution otherwise.
  switch (n) {
    case 1:  return [1];
    case 2:  return [2];
    case 3:  return [1, 2];
    case 4:  return [2, 2];
    case 5:  return [2, 3];
    case 6:  return [2, 3, 1];
    case 7:  return [3, 4];
    case 8:  return [3, 3, 2];
    case 9:  return [3, 3, 3];
    case 10: return [3, 4, 3];
    case 11: return [3, 4, 4];
    case 12: return [2, 3, 4, 3];
    case 13: return [3, 4, 3, 3];
    case 14: return [3, 4, 4, 3];
    case 22: return [4, 5, 4, 5, 4];
    default: {
      const rowCount = Math.max(2, Math.round(Math.sqrt(n * 0.9)));
      const result: number[] = [];
      let remaining = n;
      for (let i = 0; i < rowCount; i++) {
        const r = Math.ceil(remaining / (rowCount - i));
        result.push(r);
        remaining -= r;
      }
      return result;
    }
  }
}

function buildHexLayout(rows: SectionProgressRow[]): HexLayout {
  // Pointy-top hex math. Pattern adapts to the actual section count so we
  // never render filler "—" placeholders. Place most-complete row in the
  // centre, then expand outward.
  const ROW_PATTERN = patternFor(rows.length);
  const total = ROW_PATTERN.reduce((s, n) => s + n, 0);
  const padded = rows.slice(0, total);

  const sorted = [...padded].sort((a, b) => b.pct - a.pct);

  const size = 24;            // hex circumradius in px
  const w = Math.sqrt(3) * size;  // hex width
  const h = 2 * size;             // hex height
  const dy = 0.75 * h;            // vertical step between rows

  // Generate raw centre coords for the pattern, then sort by distance from
  // the centre of mass — that's where we'll place top-pct rows first.
  const slots: { cx: number; cy: number }[] = [];
  const maxCols = Math.max(...ROW_PATTERN);
  for (let r = 0; r < ROW_PATTERN.length; r++) {
    const cols = ROW_PATTERN[r];
    const offset = (maxCols - cols) * (w / 2);
    for (let c = 0; c < cols; c++) {
      slots.push({
        cx: offset + c * w + w / 2,
        cy: r * dy + h / 2,
      });
    }
  }

  const totalW = maxCols * w;
  const totalH = (ROW_PATTERN.length - 1) * dy + h;
  const cx0 = totalW / 2;
  const cy0 = totalH / 2;

  // Sort slots by distance from cluster centre asc.
  const ordered = slots
    .map((s, i) => ({ s, i, d: Math.hypot(s.cx - cx0, s.cy - cy0) }))
    .sort((a, b) => a.d - b.d);

  const cells: HexCell[] = ordered.map((o, i) => ({
    row: sorted[i],
    cx: o.s.cx,
    cy: o.s.cy,
  }));

  return { cells, width: totalW, height: totalH, size };
}

function hexPoints(cx: number, cy: number, size: number): string {
  // Pointy-top hexagon
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 90);
    pts.push(`${(cx + size * Math.cos(angle)).toFixed(2)},${(cy + size * Math.sin(angle)).toFixed(2)}`);
  }
  return pts.join(' ');
}

function hexColor(pct: number): string {
  // 5-step blue gradient from light grey to peak accent.
  if (pct <= 0)    return HEATMAP_LEVELS[0];
  if (pct < 25)    return HEATMAP_LEVELS[1];
  if (pct < 50)    return HEATMAP_LEVELS[2];
  if (pct < 75)    return HEATMAP_LEVELS[3];
  return HEATMAP_LEVELS[4];
}

function HexStat({ dotColor, value, label, border }: {
  dotColor: string; value: string; label: string; border?: boolean;
}) {
  return (
    <div style={{
      padding: '0 12px',
      borderLeft:  border ? '1px solid #F0F1F5' : 'none',
      borderRight: border ? '1px solid #F0F1F5' : 'none',
      textAlign: 'left',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
        color: '#1A1A1A', letterSpacing: '-0.01em',
      }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: dotColor,
        }} />
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 11, color: '#9CA3AF',
        marginTop: 2,
      }}>
        {label}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   ToolKindsPanel — open counters by runner kind.
   ────────────────────────────────────────────────────────────── */
interface ToolKindStats {
  total: number;
  byKind: { kind: string; label: string; count: number; uniq: number; total: number; pct: number }[];
  topTools: { id: string; title: string; count: number; kind: string }[];
}

function buildToolKindStats(usage: Record<string, number>): ToolKindStats {
  const KIND_LABELS: Record<string, string> = {
    calculator: 'Калькуляторы',
    score: 'Шкалы и опросники',
  };

  // Total available per kind from runner registry (denominator).
  const totalByKind: Record<string, number> = Object.create(null);
  for (const id of Object.keys(RUNNER_KINDS)) {
    const k = RUNNER_KINDS[id];
    totalByKind[k] = (totalByKind[k] ?? 0) + 1;
  }

  // User-side counts.
  const useByKind: Record<string, { count: number; uniq: Set<string> }> = Object.create(null);
  let total = 0;
  for (const [id, n] of Object.entries(usage)) {
    if (n <= 0) continue;
    const k = RUNNER_KINDS[id];
    if (!k) continue;
    const slot = useByKind[k] ?? { count: 0, uniq: new Set() };
    slot.count += n;
    slot.uniq.add(id);
    useByKind[k] = slot;
    total += n;
  }

  const byKind = Object.keys(totalByKind)
    .sort((a, b) => (useByKind[b]?.count ?? 0) - (useByKind[a]?.count ?? 0))
    .map((kind) => {
      const tot = totalByKind[kind] ?? 0;
      const u = useByKind[kind] ?? { count: 0, uniq: new Set<string>() };
      return {
        kind,
        label: KIND_LABELS[kind] ?? kind,
        count: u.count,
        uniq:  u.uniq.size,
        total: tot,
        pct:   tot > 0 ? Math.round((u.uniq.size / tot) * 100) : 0,
      };
    });

  // Build a quick id → title lookup once for the top-tools list.
  const topTools = Object.entries(usage)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => {
      const t = CATALOG_TOOLS.find((x) => x.id === id);
      return {
        id,
        title: t?.title ?? id,
        count,
        kind: RUNNER_KINDS[id] ?? 'calculator',
      };
    });

  return { total, byKind, topTools };
}

function ToolKindsPanel({ stats }: { stats: ToolKindStats }) {
  const openTool = useAppStore((s) => s.openTool);
  if (stats.total === 0) {
    return <EmptyHint text="Откройте любой инструмент — счётчики появятся здесь." />;
  }
  return (
    <div className="stats-toolkinds" style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
      gap: 18,
    }}>
      {/* Left — kinds breakdown as KPI-style cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        {stats.byKind.map((k, i) => {
          const tint = k.kind === 'calculator' ? ACCENT : '#7AA5FA';
          const tintBg = k.kind === 'calculator' ? ACCENT_BG : '#EFF4FF';
          return (
            <motion.div
              key={k.kind}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 * i }}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px minmax(0, 1fr)',
                columnGap: 12,
                rowGap: 8,
                alignItems: 'center',
                padding: '12px 14px',
                background: '#FFFFFF',
                border: '1px solid #F0F1F5',
                borderRadius: 12,
                minWidth: 0,
              }}
            >
              {/* Icon square — aligned with the title row only, not vertically
                   centered across the whole card. */}
              <span style={{
                gridRow: '1',
                width: 36, height: 36, borderRadius: 8,
                background: tintBg, color: tint,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {k.kind === 'calculator' ? <IconCalc /> : <IconScale />}
              </span>

              {/* Title row — just the kind label */}
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                color: '#1A1A1A', letterSpacing: '-0.005em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {k.label}
              </span>

              {/* Bar — full card width, under the title+icon row */}
              <div style={{
                gridColumn: '1 / span 2',
                height: 6, borderRadius: 999,
                background: '#F1F3F6', overflow: 'hidden', minWidth: 0,
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${k.pct}%` }}
                  transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1], delay: 0.12 + 0.05 * i }}
                  style={{ height: '100%', background: tint, borderRadius: 999 }}
                />
              </div>

              {/* Stats row UNDER the bar — opens on left, X из Y on right.
                   Numbers and surrounding text share the same size/font so
                   the row reads as one consistent line. */}
              <div style={{
                gridColumn: '1 / span 2',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                fontFamily: 'var(--font-body)', fontSize: 12,
                color: '#6B7280', minWidth: 0,
              }}>
                <span>
                  <strong style={{ color: '#1A1A1A', fontWeight: 700 }}>{k.count}</strong>
                  {' '}
                  {k.count === 1 ? 'открытие' : 'открытий'}
                </span>
                <span style={{ flexShrink: 0 }}>
                  <strong style={{ color: '#1A1A1A', fontWeight: 700 }}>{k.uniq}</strong>
                  {' из '}
                  <strong style={{ color: '#1A1A1A', fontWeight: 700 }}>{k.total}</strong>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right — Top tools list */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: '#FFFFFF',
        border: '1px solid #F0F1F5',
        borderRadius: 12,
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <div style={{
          padding: '12px 14px 8px',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          borderBottom: '1px solid #F4F5F8',
        }}>
          Топ открываемых инструментов
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {stats.topTools.map((t, i) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => openTool(t.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 * i }}
              whileHover={{ background: '#F8F9FB' }}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px minmax(0, 1fr) auto auto auto',
                columnGap: 10,
                alignItems: 'center',
                padding: '10px 14px',
                borderTop: i === 0 ? 'none' : '1px solid #F4F5F8',
                borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)', fontSize: 13,
                width: '100%',
                transition: 'background 160ms',
              }}
              aria-label={`Открыть инструмент: ${t.title}`}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: '#9CA3AF',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontSize: 10.5, fontWeight: 600, color: '#1A1A1A',
              }}>
                {t.title}
              </span>
              <KindPill kind={t.kind} />
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '2px 8px', borderRadius: 999,
                background: ACCENT_BG, color: ACCENT_DARK,
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              }}>
                ×{t.count}
              </span>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function KindPill({ kind }: { kind: string }) {
  const isCalc = kind === 'calculator';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999,
      background: isCalc ? '#EFF4FF' : '#F1F5FB',
      color:      isCalc ? ACCENT_DARK : '#475569',
      fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 600,
      letterSpacing: '0.005em', whiteSpace: 'nowrap',
    }}>
      {isCalc ? 'калькулятор' : 'шкала'}
    </span>
  );
}

function IconCalc() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="11" x2="8.01" y2="11" />
      <line x1="12" y1="11" x2="12.01" y2="11" />
      <line x1="16" y1="11" x2="16.01" y2="11" />
      <line x1="8" y1="15" x2="8.01" y2="15" />
      <line x1="12" y1="15" x2="12.01" y2="15" />
      <line x1="16" y1="15" x2="16.01" y2="15" />
      <line x1="8" y1="19" x2="16" y2="19" />
    </svg>
  );
}
function IconScale() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h18" />
      <path d="M6 7l-3 7a4 4 0 0 0 6 0l-3-7z" />
      <path d="M18 7l-3 7a4 4 0 0 0 6 0l-3-7z" />
      <path d="M12 3v18" />
      <path d="M9 21h6" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   Recent attempts table — replaces "Tax Liabilities"
   ════════════════════════════════════════════════════════════════ */
function RecentAttempts({ attempts }: { attempts: { courseId: string; testLevel: number; score: number; total: number; passed: boolean; timestamp: number }[] }) {
  const openCourse = useAppStore((s) => s.openCourse);
  if (attempts.length === 0) {
    return <EmptyHint text="Сданные тесты появятся здесь." />;
  }
  return (
    <div className="stats-attempts" style={{
      display: 'flex', flexDirection: 'column',
      background: '#FFFFFF',
      border: '1px solid #F0F1F5',
      borderRadius: 12,
      overflow: 'hidden',
      minWidth: 0,
    }}>
      {/* Column header — hidden on mobile, where each row stacks instead */}
      <div className="stats-attempts__head" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 56px 64px 100px',
        columnGap: 14,
        padding: '12px 14px',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        borderBottom: '1px solid #F4F5F8',
      }}>
        <span>Курс / Тест</span>
        <span>Балл</span>
        <span>Дата</span>
        <span style={{ justifySelf: 'end' }}>Статус</span>
      </div>

      {attempts.map((a, i) => {
        const course = getCourseById(a.courseId);
        const date = new Date(a.timestamp);
        const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        return (
          <motion.button
            key={a.timestamp + a.courseId + a.testLevel}
            type="button"
            onClick={() => course && openCourse(a.courseId)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 * i }}
            whileHover={{ background: '#F8F9FB' }}
            className="stats-attempts__row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 56px 64px 100px',
              columnGap: 14,
              alignItems: 'center',
              padding: '12px 14px',
              borderTop: '1px solid #F4F5F8',
              borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
              background: 'transparent',
              cursor: course ? 'pointer' : 'default',
              textAlign: 'left',
              fontFamily: 'var(--font-body)', fontSize: 12,
              width: '100%',
              transition: 'background 160ms',
            }}
            aria-label={course ? `Открыть курс: ${course.title}` : a.courseId}
          >
            {/* Course title + test level */}
            <span style={{
              minWidth: 0,
              display: 'flex', flexDirection: 'column', gap: 1,
            }}>
              <span style={{
                fontSize: 12, fontWeight: 600, color: '#1A1A1A',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {course?.title ?? a.courseId}
              </span>
              <span className="stats-attempts__sub-mobile" style={{
                fontSize: 11, color: '#9CA3AF',
                display: 'none',
              }}>
                {a.score}/{a.total} · {dateStr}
              </span>
            </span>

            {/* Score — matches Section Progress list size (12px) */}
            <span className="stats-attempts__score" style={{
              fontFamily: 'var(--font-body)', fontSize: 12,
              color: '#1A1A1A',
            }}>
              {a.score}/{a.total}
            </span>

            {/* Date */}
            <span className="stats-attempts__date" style={{
              fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280',
            }}>
              {dateStr}
            </span>

            {/* Status pill */}
            <span style={{
              justifySelf: 'end',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px',
              borderRadius: 999,
              background: a.passed ? '#DCFCE7' : '#FEF2F2',
              color:      a.passed ? '#15803D' : '#B91C1C',
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {a.passed ? 'Пройден' : 'Не пройден'}
            </span>
          </motion.button>
        );
      })}
    </div>
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
