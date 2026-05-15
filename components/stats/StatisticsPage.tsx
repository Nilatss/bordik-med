'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modules, sections as allSections, TOTAL_COURSES, getCourseById, getModuleForCourse, getSectionById } from '@/lib/curriculum';
import { useAppStore, formatStudyTime, getTotalStudyTime } from '@/lib/store';
import { MAX_TEST_LEVELS } from '@/lib/quiz';
import { RUNNER_KINDS } from '@/lib/tool-meta-data';
import { useCatalog, type CatalogMetaItem } from '@/lib/catalog-client';
import { content as courseContent } from '@/lib/content';
import { ProgressDashboard } from '@/components/neonatal/NeonatalHandbook';
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

const HEATMAP_LEVELS: readonly string[] = [
  '#F1F3F6',  // 0 — none
  '#DBE7FF',  // 1 — light
  '#A8C7FF',  // 2 — medium
  '#7AA5FA',  // 3 — strong
  ACCENT,     // 4 — peak
];
const HEATMAP_FALLBACK = '#F1F3F6';

// Pre-mapped Tailwind classes for the 5 heatmap intensities — lets us use
// className instead of inline style for the static palette. Index -1 is the
// out-of-range padding cell (rendered transparent).
const HEATMAP_BG_CLASS: readonly string[] = [
  'bg-[#F1F3F6]',  // 0 — none
  'bg-[#DBE7FF]',  // 1 — light
  'bg-[#A8C7FF]',  // 2 — medium
  'bg-[#7AA5FA]',  // 3 — strong
  'bg-[#3B82F6]',  // 4 — peak (ACCENT)
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
  const startedCourses      = useAppStore((s) => s.startedCourses);

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
  const sectionProgress = useMemo(
    () => buildSectionProgress(completedCourses, startedCourses, testAttempts),
    [completedCourses, startedCourses, testAttempts],
  );

  /* ─── Tool kinds breakdown — count tool opens grouped by runner kind ── */
  const catalog = useCatalog();
  const toolKindStats = useMemo(
    () => buildToolKindStats(toolUsage, catalog),
    [toolUsage, catalog],
  );

  /* ─── Recent test attempts table (replaces «Tax Liabilities») */
  const recentAttempts = useMemo(() => {
    return Object.values(testAttempts)
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 6);
  }, [testAttempts]);

  return (
    <div className="stats-page flex flex-col gap-[18px]">
      {/* Header bar — explicit z-index so the period dropdown isn't
           covered by KPI-row siblings (each motion.div creates its own
           stacking context via the entrance transform). */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0 }}
        className="relative z-30 flex items-center justify-between gap-3 flex-wrap"
      >
        <div>
          <h1 className="font-[var(--font-display)] text-[26px] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-1">
            Статистика обучения
          </h1>
          <p className="font-[var(--font-body)] text-[13px] text-[#6B7280]">
            Аналитика прогресса{userName ? ` — ${userName}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period dropdown */}
          <div className="relative">
            <button
              onClick={() => setPeriodOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-[10px] cursor-pointer font-[var(--font-body)] text-[13px] font-semibold text-[#1A1A1A]"
            >
              {PERIOD_LABELS[period]}
              <svg
                width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform duration-200 ${periodOpen ? 'rotate-180' : 'rotate-0'}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {periodOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 bg-white rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.05)] min-w-[180px] p-1 z-30 flex flex-col gap-0.5">
                {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setPeriodOpen(false); }}
                    className={`px-3 py-2 border-0 rounded-lg cursor-pointer font-[var(--font-body)] text-[13px] text-left ${
                      p === period
                        ? 'bg-[#EFF4FF] text-[#2563EB] font-semibold'
                        : 'bg-transparent text-[#1A1A1A] font-medium'
                    }`}
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white border-0 rounded-[10px] cursor-not-allowed opacity-[0.55] font-[var(--font-body)] text-[13px] font-semibold"
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
      <div className="stats-kpi-row grid grid-cols-[repeat(3,minmax(0,1fr))] gap-4">
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
          value={formatStudyTime(metrics.studyTime).split(' ')[0] ?? ''}
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1] }}
          >
            {period === 'all'
              ? <YearHeatmap testAttempts={testAttempts} />
              : <Heatmap data={heatmap} period={period} />}
          </motion.div>
        </AnimatePresence>
      </Section>

      {/* Bottom 2-col grid: Section progress hex | Recent attempts */}
      <div className="stats-2col grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-3.5 w-full">
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

      {/* Neonatology quiz progress — moved here from /neonatology tab (audit H2). */}
      <Section
        delay={480}
        title="Прогресс по тестам неонатологии"
        tip="Сводка по 22 неонатологическим тестам: сколько пройдено хоть раз, сколько сдано (≥70 %), средний балл и рекомендации что повторить."
        subtitle="Самопроверка по разделу /neonatology"
      >
        <ProgressDashboard bank={null} quizzesBank={null} />
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
      className="stats-infotip relative inline-flex items-center justify-center cursor-help outline-none"
      aria-label={text}
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
      className="bg-white border border-[#F0F1F5] rounded-2xl p-[18px] flex flex-col gap-2.5 min-w-0"
    >
      <div className="flex items-center justify-between">
        <span className="font-[var(--font-body)] text-[13px] text-[#6B7280] font-medium inline-flex items-center gap-1.5">
          {label}
          {tip && <InfoTip text={tip} />}
        </span>
        <span className="w-[30px] h-[30px] rounded-lg bg-[#EFF4FF] text-[#2563EB] inline-flex items-center justify-center">
          {icon}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] tracking-[-0.02em] leading-[1.05]">
          {value}
        </span>
        {sub && (
          <span className="font-[var(--font-body)] text-[13px] text-[#9CA3AF] font-medium">
            {sub}
          </span>
        )}
      </div>

      <div className="inline-flex items-center gap-1.5 font-[var(--font-body)] text-xs text-[#6B7280]">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${
          deltaPositive ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FEF2F2] text-[#B91C1C]'
        }`}>
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
      className="bg-white border border-[#F0F1F5] rounded-2xl p-[18px] flex flex-col gap-3.5 min-w-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[var(--font-display)] text-base font-bold text-[#1A1A1A] tracking-[-0.01em] inline-flex items-center gap-1.5">
            {title}
            {tip && <InfoTip text={tip} />}
          </h3>
          {subtitle && (
            <p className="font-[var(--font-body)] text-xs text-[#9CA3AF] mt-0.5">
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
      cells[col] = (cells[col] ?? 0) + 1;
      const row = bands[col];
      if (row) row[band] = (row[band] ?? 0) + 1;
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
    <div className="flex flex-col gap-2 min-w-0 relative overflow-visible">
      {isCalendar ? (
        // ── Calendar grid (month view) ──
        // Cells stretch the full card width as wide rectangles — taller than
        // the year heatmap dots, but not square.
        <div className="w-full">
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 gap-1.5 font-[var(--font-mono)] text-[10px] text-[#9CA3AF] pb-1">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
              <span key={d} className="text-center">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr gap-1.5">
            {Array.from({ length: totalCells }).map((_, idx) => {
              const dayIdx = idx - leadingPad;
              const inMonth = dayIdx >= 0 && dayIdx < data.cols;
              const v = inMonth ? (data.cells[dayIdx] ?? 0) : 0;
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
                  className={`stats-heat-cell h-14 rounded-md flex items-start justify-end p-1 font-[var(--font-mono)] text-[10px] ${
                    lvl < 0 ? 'bg-transparent' : HEATMAP_BG_CLASS[lvl]
                  } ${inMonth ? 'cursor-default' : ''} ${
                    isHovered ? 'outline outline-2 outline-offset-1 outline-[#3B82F6]' : ''
                  } ${lvl >= 3 ? 'text-white/[0.85]' : 'text-[#6B7280]'}`}
                >
                  {inMonth ? dayIdx + 1 : ''}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // ── Week view — same visual as calendar but a single row of 7 cells.
        <div className="w-full">
          {/* Day-of-week header — based on actual dates so order is correct
               regardless of which weekday "today" lands on. */}
          <div className="grid grid-cols-7 gap-1.5 font-[var(--font-mono)] text-[10px] text-[#9CA3AF] pb-1">
            {Array.from({ length: data.cols }).map((_, i) => {
              const d = dateForCol(i);
              const dow = d.toLocaleDateString('ru-RU', { weekday: 'short' });
              const cap = dow.charAt(0).toUpperCase() + dow.slice(1).replace('.', '');
              return (
                <span key={i} className="text-center">{cap}</span>
              );
            })}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
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
                  className={`stats-heat-cell h-14 rounded-md cursor-default flex items-start justify-end p-1 font-[var(--font-mono)] text-[10px] ${
                    HEATMAP_BG_CLASS[lvl]
                  } ${
                    isHovered ? 'outline outline-2 outline-offset-1 outline-[#3B82F6]' : ''
                  } ${lvl >= 3 ? 'text-white/[0.85]' : 'text-[#6B7280]'}`}
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
        const v = data.cells[col] ?? 0;
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
            className={`absolute left-[var(--tt-left)] bg-[#1A1A1A] text-[#F4F5F7] px-3.5 py-2.5 rounded-lg font-[var(--font-body)] text-xs leading-[1.4] whitespace-nowrap pointer-events-none shadow-[0_12px_32px_rgba(15,23,42,0.18),0_4px_12px_rgba(15,23,42,0.08)] z-[5] ${
              isCalendar
                ? 'top-[var(--tt-top)] -translate-x-1/2 -translate-y-full'
                : 'bottom-[calc(100%+14px)] -translate-x-1/2'
            }`}
            // eslint-disable-next-line react/forbid-dom-props -- dynamic tooltip position based on hovered cell
            style={{
              ['--tt-left' as string]: `${colPct}%`,
              ...(isCalendar ? { ['--tt-top' as string]: `calc(${(rowOfCell / weeks) * 100}% - 4px)` } : {}),
            }}
          >
            <div className="font-semibold">{date}</div>
            <div className={`text-xs mt-0.5 ${v > 0 ? 'text-[#F4F5F7]' : 'text-[#9CA3AF]'}`}>
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
    <div className="flex flex-col gap-2.5">
      {/* Grid */}
      <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-x-1.5 relative overflow-visible">
        {/* Top-left empty + month labels row */}
        <div />
        <div
          className="grid gap-x-[3px] font-[var(--font-mono)] text-[10px] text-[#9CA3AF] mb-1"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic column count = yearData.weeks
          style={{ gridTemplateColumns: `repeat(${yearData.weeks}, minmax(0, 1fr))` }}
        >
          {monthOfWeek.map((m, w) => (
            <span key={w} className="text-left whitespace-nowrap">
              {m !== null ? monthLabels[m] : ''}
            </span>
          ))}
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-rows-7 gap-y-[3px] font-[var(--font-mono)] text-[9px] text-[#9CA3AF]">
          {dowLabels.map((l, i) => (
            <span key={i} className="flex items-center">
              {l}
            </span>
          ))}
        </div>

        {/* The 7×weeks cell grid */}
        <div
          className="grid grid-rows-7 gap-[3px] grid-flow-col relative"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic column count = yearData.weeks
          style={{ gridTemplateColumns: `repeat(${yearData.weeks}, minmax(0, 1fr))` }}
        >
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
                className={`stats-heat-cell aspect-square rounded-[3px] ${
                  lvl < 0 ? 'bg-transparent' : HEATMAP_BG_CLASS[lvl]
                } ${inYear ? 'cursor-default' : ''} ${
                  isHovered ? 'outline outline-2 outline-offset-1 outline-[#3B82F6]' : ''
                }`}
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
              <div
                className="absolute left-[var(--tt-left)] bottom-[calc(100%+8px)] -translate-x-1/2 bg-[#1A1A1A] text-[#F4F5F7] px-3.5 py-2.5 rounded-lg font-[var(--font-body)] text-xs leading-[1.4] whitespace-nowrap pointer-events-none shadow-[0_12px_32px_rgba(15,23,42,0.18),0_4px_12px_rgba(15,23,42,0.08)] z-[5]"
                // eslint-disable-next-line react/forbid-dom-props -- dynamic horizontal position from hovered week
                style={{ ['--tt-left' as string]: `${colPct}%` }}
              >
                <div className="font-semibold">{date}</div>
                <div className={`text-xs mt-0.5 ${v > 0 ? 'text-[#F4F5F7]' : 'text-[#9CA3AF]'}`}>
                  {v === 0 ? 'нет активности' : `Сделано ${v} ${word}`}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Year switcher + summary */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#F0F1F5] flex-wrap">
        <div className="font-[var(--font-body)] text-xs text-[#6B7280]">
          <strong className="text-[#1A1A1A] font-bold">{yearData.activeDays}</strong>
          {' '}{yearData.activeDays === 1 ? 'день' : yearData.activeDays < 5 ? 'дня' : 'дней'} активности
          {' · '}
          <strong className="text-[#1A1A1A] font-bold">{yearData.total}</strong>
          {' '}{yearData.total === 1 ? 'тест' : yearData.total < 5 ? 'теста' : 'тестов'}
        </div>

        <div className="inline-flex items-center gap-1">
          <YearArrow disabled={!availableYears.includes(year - 1) && (availableYears[0] !== undefined && year - 1 < availableYears[0])}
            onClick={() => setYear((y) => y - 1)} dir="prev" />
          {availableYears.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={`px-2.5 py-1 rounded-full border-0 cursor-pointer font-[var(--font-mono)] text-xs font-bold transition-[background-color,color] duration-150 ${
                y === year ? 'bg-[#3B82F6] text-white' : 'bg-transparent text-[#6B7280]'
              }`}
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
      className={`w-[26px] h-[26px] rounded-full bg-transparent border-0 inline-flex items-center justify-center text-[#6B7280] ${
        disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer opacity-100'
      }`}
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
  /** Courses the user has interacted with (started / attempted / completed). */
  started: number;
  pct: number;
  /** Section has at least one course with actual lesson content written. */
  withContent: number;
}

function buildSectionProgress(
  completedCourses: string[],
  startedCourses: string[],
  testAttempts: Record<string, { courseId: string }[]>,
): SectionProgressRow[] {
  // A course counts as "started" if any of:
  //   • the user clicked «Начать обучение» (in startedCourses)
  //   • the user has at least one test attempt for it
  //   • the course is already completed
  const startedSet = new Set<string>([
    ...startedCourses,
    ...completedCourses,
    // testAttempts is keyed as `${courseId}-${testLevel}` and the entries
    // also carry the courseId — split keys to harvest course ids.
    ...Object.keys(testAttempts).map((k) => k.split('-').slice(0, -1).join('-')),
  ]);

  const byId = new Map<string, { name: string; total: number; done: number; started: number; withContent: number }>();
  for (const s of allSections) {
    byId.set(s.id, { name: s.title, total: 0, done: 0, started: 0, withContent: 0 });
  }
  for (const m of modules) {
    const sec = getSectionById(m.sectionId);
    if (!sec) continue;
    const slot = byId.get(sec.id) ?? { name: sec.title, total: 0, done: 0, started: 0, withContent: 0 };
    for (const c of m.courses) {
      slot.total += 1;
      if (completedCourses.includes(c.id)) slot.done += 1;
      if (startedSet.has(c.id)) slot.started += 1;
      const cc = courseContent[c.id];
      if (cc && Object.keys(cc).length > 0) {
        slot.withContent += 1;
      }
    }
    byId.set(sec.id, slot);
  }
  return Array.from(byId.entries())
    .map(([id, v]) => ({
      id, name: v.name, total: v.total, done: v.done, started: v.started,
      withContent: v.withContent,
      pct: v.total > 0 ? Math.round((v.done / v.total) * 100) : 0,
    }))
    // Sort: highest pct first, but among ties show "started" sections before untouched ones
    .sort((a, b) => b.pct - a.pct || b.started - a.started);
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
  const startedCount   = rows.filter((r) => r.started > 0).length;
  const completedCount = rows.filter((r) => r.pct >= 100).length;
  const avgPct = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length)
    : 0;

  if (rows.length === 0) {
    return <EmptyHint text="Прогресс появится после первого пройденного курса." />;
  }

  return (
    <div className="flex flex-col gap-3.5 items-stretch">
      {/* Hex cluster */}
      <div className="flex justify-center pt-1 pb-2">
        <svg
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          // overflow: visible so the tooltip foreignObject can extend past
          // the SVG viewBox without being clipped on narrow viewports.
          className="block max-w-full overflow-visible"
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
                  className={`${interactive ? 'stats-hex stats-hex--interactive cursor-pointer' : 'stats-hex cursor-not-allowed'} [transform-origin:var(--hex-origin)]`}
                  // transform-origin in SVG user-space coords. transformBox: fill-box
                  // would re-anchor to bbox top-left and skew the hex sideways on
                  // scale; the default user-space behaviour is what we want here.
                  // eslint-disable-next-line react/forbid-dom-props -- dynamic SVG transform-origin per cell
                  style={{ ['--hex-origin' as string]: `${c.cx}px ${c.cy}px` }}
                >
                  <polygon
                    points={hexPoints(c.cx, c.cy, layout.size)}
                    fill={hexColor(c.row.pct, c.row.started > 0)}
                    stroke={c.row.started > 0 && c.row.pct === 0 ? ACCENT : '#FFFFFF'}
                    strokeWidth={c.row.started > 0 && c.row.pct === 0 ? 2 : 2}
                    strokeDasharray={c.row.started > 0 && c.row.pct === 0 ? '4 3' : undefined}
                  />
                  {(c.row.pct > 0 || c.row.started > 0) && (
                    <text
                      x={c.cx}
                      y={c.cy + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fontFamily="var(--font-mono)"
                      fontWeight={700}
                      fill={c.row.pct >= 50 ? '#FFFFFF' : ACCENT_DARK}
                      className="pointer-events-none"
                    >
                      {c.row.pct === 0 ? '·' : c.row.pct}
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
                className="overflow-visible"
              >
                <div
                  // @ts-expect-error — xmlns required for foreignObject HTML content (React-DOM types don't include it on div)
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
                      : hoveredCell.row.pct === 0 && hoveredCell.row.started > 0
                        ? `Начат · ${hoveredCell.row.started}/${hoveredCell.row.total}`
                        : `${hoveredCell.row.pct}% · ${hoveredCell.row.done}/${hoveredCell.row.total}`}
                  </div>
                </div>
              </foreignObject>
            );
          })()}
        </svg>
      </div>

      {/* Summary stat row — three columns separated by faint dividers */}
      <div className="grid grid-cols-3 gap-0 pt-3 pb-1 border-t border-[#F0F1F5]">
        <HexStat dotColor={ACCENT}      value={`${avgPct}%`}      label="Средний прогресс" />
        <HexStat dotColor="#7AA5FA"     value={`${startedCount}`} label="Модулей начато" border />
        <HexStat dotColor="#A8C7FF"     value={`${completedCount}`} label="Завершено модулей" />
      </div>

      {/* Top sections list — small, like the % rows under the hex chart */}
      <div className="flex flex-col gap-1">
        {rows.slice(0, 4).map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 * i }}
            className="flex justify-between items-center font-[var(--font-body)] text-xs py-1.5 border-t border-[#F8F9FB]"
          >
            <span className="inline-flex items-center gap-2 text-[#1A1A1A] font-medium min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              <span
                className="w-2 h-2 rounded-full shrink-0 bg-[var(--dot-color)]"
                // eslint-disable-next-line react/forbid-dom-props -- dynamic per-row palette
                style={{ ['--dot-color' as string]: hexColor(r.pct, r.started > 0) }}
              />
              <span className="overflow-hidden text-ellipsis">{r.pct}% {r.name}</span>
            </span>
            <span className="text-[#9CA3AF] text-[11px] shrink-0 inline-flex items-center gap-1.5">
              {r.started > 0 && r.done < r.started && (
                <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#2563EB] px-1.5 py-px rounded-full bg-[#EFF4FF]">
                  начат
                </span>
              )}
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
    if (cols === undefined) continue;
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

  const cells: HexCell[] = [];
  for (let i = 0; i < ordered.length; i++) {
    const slot = ordered[i];
    const row = sorted[i];
    if (slot && row) cells.push({ row, cx: slot.s.cx, cy: slot.s.cy });
  }

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

function hexColor(pct: number, started?: boolean): string {
  // 5-step blue gradient from light grey to peak accent.
  // Sections with 0% but already STARTED get a faint accent tint instead
  // of plain grey so they're visibly distinct from untouched modules.
  const get = (i: number) => HEATMAP_LEVELS[i] ?? HEATMAP_FALLBACK;
  if (pct <= 0)    return started ? get(1) : get(0);
  if (pct < 25)    return get(1);
  if (pct < 50)    return get(2);
  if (pct < 75)    return get(3);
  return get(4);
}

function HexStat({ dotColor, value, label, border }: {
  dotColor: string; value: string; label: string; border?: boolean;
}) {
  return (
    <div
      className={`px-3 text-left ${
        border ? 'border-l border-r border-[#F0F1F5]' : ''
      }`}
    >
      <div className="flex items-center gap-1.5 font-[var(--font-display)] font-bold text-lg text-[#1A1A1A] tracking-[-0.01em]">
        <span
          className="w-2.5 h-2.5 rounded-full bg-[var(--hexstat-dot)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic dot palette per stat
          style={{ ['--hexstat-dot' as string]: dotColor }}
        />
        {value}
      </div>
      <div className="font-[var(--font-body)] text-[11px] text-[#9CA3AF] mt-0.5">
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

function buildToolKindStats(
  usage: Record<string, number>,
  catalog: readonly CatalogMetaItem[] | null,
): ToolKindStats {
  const KIND_LABELS: Record<string, string> = {
    calculator: 'Калькуляторы',
    score: 'Шкалы и опросники',
  };

  // Total available per kind from runner registry (denominator).
  const totalByKind: Record<string, number> = Object.create(null);
  for (const id of Object.keys(RUNNER_KINDS)) {
    const k = RUNNER_KINDS[id];
    if (!k) continue;
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
      const t = catalog?.find((x) => x.id === id);
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
    <div className="stats-toolkinds grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-[18px]">
      {/* Left — kinds breakdown as KPI-style cards */}
      <div className="flex flex-col gap-2.5 min-w-0">
        {stats.byKind.map((k, i) => {
          const isCalc = k.kind === 'calculator';
          return (
            <motion.div
              key={k.kind}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 * i }}
              className="grid grid-cols-[36px_minmax(0,1fr)] gap-x-3 gap-y-2 items-center px-3.5 py-3 bg-white border border-[#F0F1F5] rounded-xl min-w-0"
            >
              {/* Icon square — aligned with the title row only, not vertically
                   centered across the whole card. */}
              <span
                className={`row-start-1 w-9 h-9 rounded-lg inline-flex items-center justify-center shrink-0 ${
                  isCalc ? 'bg-[#EFF4FF] text-[#3B82F6]' : 'bg-[#EFF4FF] text-[#7AA5FA]'
                }`}
              >
                {isCalc ? <IconCalc /> : <IconScale />}
              </span>

              {/* Title row — just the kind label */}
              <span className="font-[var(--font-body)] text-sm font-semibold text-[#1A1A1A] tracking-[-0.005em] overflow-hidden text-ellipsis whitespace-nowrap">
                {k.label}
              </span>

              {/* Bar — full card width, under the title+icon row */}
              <div className="col-span-2 h-1.5 rounded-full bg-[#F1F3F6] overflow-hidden min-w-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${k.pct}%` }}
                  transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1], delay: 0.12 + 0.05 * i }}
                  className={`h-full rounded-full ${isCalc ? 'bg-[#3B82F6]' : 'bg-[#7AA5FA]'}`}
                />
              </div>

              {/* Stats row UNDER the bar — opens on left, X из Y on right.
                   Numbers and surrounding text share the same size/font so
                   the row reads as one consistent line. */}
              <div className="col-span-2 flex justify-between items-baseline font-[var(--font-body)] text-xs text-[#6B7280] min-w-0">
                <span>
                  <strong className="text-[#1A1A1A] font-bold">{k.count}</strong>
                  {' '}
                  {k.count === 1 ? 'открытие' : 'открытий'}
                </span>
                <span className="shrink-0">
                  <strong className="text-[#1A1A1A] font-bold">{k.uniq}</strong>
                  {' из '}
                  <strong className="text-[#1A1A1A] font-bold">{k.total}</strong>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Right — Top tools list */}
      <div className="flex flex-col bg-white border border-[#F0F1F5] rounded-xl overflow-hidden min-w-0">
        <div className="px-3.5 pt-3 pb-2 font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] border-b border-[#F4F5F8]">
          Топ открываемых инструментов
        </div>
        <div className="flex flex-col">
          {stats.topTools.map((t, i) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => openTool(t.id)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1], delay: 0.05 * i }}
              whileHover={{ background: '#F8F9FB' }}
              className={`grid grid-cols-[24px_minmax(0,1fr)_auto_auto_auto] gap-x-2.5 items-center px-3.5 py-2.5 border-x-0 border-b-0 bg-transparent cursor-pointer text-left font-[var(--font-body)] text-[13px] w-full transition-[background-color] duration-150 ${
                i === 0 ? 'border-t-0' : 'border-t border-t-[#F4F5F8]'
              }`}
              aria-label={`Открыть инструмент: ${t.title}`}
            >
              <span className="font-[var(--font-mono)] text-[11px] font-bold text-[#9CA3AF]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] font-semibold text-[#1A1A1A]">
                {t.title}
              </span>
              <KindPill kind={t.kind} />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EFF4FF] text-[#2563EB] font-[var(--font-mono)] text-[11px] font-bold">
                ×{t.count}
              </span>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="#9CA3AF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0">
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
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-[var(--font-body)] text-[10.5px] font-semibold tracking-[0.005em] whitespace-nowrap ${
        isCalc ? 'bg-[#EFF4FF] text-[#2563EB]' : 'bg-[#F1F5FB] text-[#475569]'
      }`}
    >
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
    <div className="stats-attempts flex flex-col bg-white border border-[#F0F1F5] rounded-xl overflow-hidden min-w-0">
      {/* Column header — hidden on mobile, where each row stacks instead */}
      <div className="stats-attempts__head grid grid-cols-[minmax(0,1fr)_56px_64px_110px] gap-x-3.5 px-3.5 py-3 font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] border-b border-[#F4F5F8]">
        <span>Курс / Тест</span>
        <span>Балл</span>
        <span>Дата</span>
        <span className="justify-self-start">Статус</span>
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
            className={`stats-attempts__row grid grid-cols-[minmax(0,1fr)_56px_64px_110px] gap-x-3.5 items-center px-3.5 py-3 border-t border-x-0 border-b-0 border-t-[#F4F5F8] bg-transparent text-left font-[var(--font-body)] text-xs w-full transition-[background-color] duration-150 ${
              course ? 'cursor-pointer' : 'cursor-default'
            }`}
            aria-label={course ? `Открыть курс: ${course.title}` : a.courseId}
          >
            {/* Course title + test level */}
            <span className="min-w-0 flex flex-col gap-px">
              <span className="text-xs font-semibold text-[#1A1A1A] overflow-hidden text-ellipsis whitespace-nowrap">
                {course?.title ?? a.courseId}
              </span>
              <span className="stats-attempts__sub-mobile text-[11px] text-[#9CA3AF] hidden">
                {a.score}/{a.total} · {dateStr}
              </span>
            </span>

            {/* Score — matches Section Progress list size (12px) */}
            <span className="stats-attempts__score font-[var(--font-body)] text-xs text-[#1A1A1A]">
              {a.score}/{a.total}
            </span>

            {/* Date */}
            <span className="stats-attempts__date font-[var(--font-body)] text-xs text-[#6B7280]">
              {dateStr}
            </span>

            {/* Status pill */}
            <span className={`justify-self-start inline-flex items-center gap-1 px-2.5 py-px rounded-full font-[var(--font-body)] text-[11px] font-semibold whitespace-nowrap ${
              a.passed ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEF2F2] text-[#B91C1C]'
            }`}>
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
    <div className="px-4 py-6 text-center font-[var(--font-body)] text-[13px] text-[#9CA3AF] leading-[1.5] bg-[#F8F9FB] rounded-[10px]">
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
