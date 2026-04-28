'use client';

import { useMemo } from 'react';
import { getModuleById } from '@/lib/curriculum';
import { useAppStore } from '@/lib/store';

const LEVELS = [
  { moduleId: 700, level: 1, title: 'Санинструктор', subtitle: 'Минимум для поля' },
  { moduleId: 701, level: 2, title: 'Парамедик', subtitle: 'Расширенная догоспитальная' },
  { moduleId: 702, level: 3, title: 'Военный врач', subtitle: 'Клиника + хирургия' },
  { moduleId: 703, level: 4, title: 'Реаниматолог', subtitle: 'Полная компетентность' },
];

interface ChartItem {
  label: string;
  courseId: string;
  x: number;
  y: number;
  moduleId: number;
  completed: boolean;
}

function getChartItems(completedCourses: string[]): ChartItem[] {
  const items: ChartItem[] = [];
  LEVELS.forEach((lvl) => {
    const mod = getModuleById(lvl.moduleId);
    if (!mod) return;
    mod.courses.forEach((course, i) => {
      const completed = completedCourses.includes(course.id);
      const baseX = (lvl.level - 1) * 2;
      const xOffset = (i / Math.max(mod.courses.length - 1, 1)) * 1.6;
      const baseY = course.difficulty === 'basic' ? 90 : course.difficulty === 'intermediate' ? 140 : 185;
      const yJitter = ((i * 17) % 5 - 2) * 8;
      items.push({
        label: course.title.length > 20 ? course.title.slice(0, 18) + '…' : course.title,
        courseId: course.id,
        x: baseX + xOffset,
        y: baseY + yJitter,
        moduleId: lvl.moduleId,
        completed,
      });
    });
  });
  return items;
}

const W = 2400;
const H = 420;
const PAD_L = 8;
const PAD_R = 40;
const Y_AXIS_W = 52;
const PAD_T = 20;
const PAD_B = 70;
const CHART_W = W - PAD_L - PAD_R;
const CHART_H = H - PAD_T - PAD_B;

const scaleX = (val: number) => PAD_L + (val / 8) * CHART_W;
const scaleY = (val: number) => PAD_T + CHART_H - ((val - 50) / 160) * CHART_H;

/* Simple collision resolver - nudge overlapping pills apart */
function resolveCollisions(items: { cx: number; cy: number; w: number }[]) {
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        if (!a || !b) continue;
        const overlapX = (a.w / 2 + b.w / 2 + 4) - Math.abs(a.cx - b.cx);
        const overlapY = 30 - Math.abs(a.cy - b.cy);
        if (overlapX > 0 && overlapY > 0) {
          const pushY = overlapY / 2 + 2;
          if (a.cy < b.cy) { a.cy -= pushY; b.cy += pushY; }
          else { a.cy += pushY; b.cy -= pushY; }
        }
      }
    }
  }
}

export default function Roadmap() {
  const completedCourses = useAppStore((s) => s.completedCourses);
  const openCourse       = useAppStore((s) => s.openCourse);

  // Position + collision resolution is O(n²) with 8 passes - very heavy.
  // Memoise on the only input that affects layout (completion state).
  const positioned = useMemo(() => {
    const items = getChartItems(completedCourses).map((item) => {
      const textLen = item.label.length * 5.8 + 20;
      const pillW = Math.min(Math.max(textLen, 60), 170);
      return { ...item, cx: scaleX(item.x), cy: scaleY(item.y), w: pillW };
    });
    const chartLeft = PAD_L;
    const chartRight = PAD_L + (W - PAD_L - PAD_R);
    const clamp = () => {
      for (const p of items) {
        const half = p.w / 2;
        if (p.cx - half < chartLeft)  p.cx = chartLeft + half + 6;
        if (p.cx + half > chartRight) p.cx = chartRight - half - 6;
        if (p.cy - 13 < PAD_T)        p.cy = PAD_T + 13 + 4;
        if (p.cy + 13 > PAD_T + CHART_H) p.cy = PAD_T + CHART_H - 13 - 4;
      }
    };
    clamp();
    resolveCollisions(items);
    clamp();
    return items;
  }, [completedCourses]);

  const yTickLabels = [50, 100, 150, 200];
  const yGridLines = [100, 150, 200];

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 'var(--md-sys-shape-corner-extra-large)',
      padding: 'var(--space-6)',
      marginBottom: 'var(--space-6)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)', marginBottom: 'var(--space-1)',
        }}>
          Дорожная карта
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}>
            Уровни профессии от санинструктора до реаниматолога
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginLeft: 'auto' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: '0.625rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--md-sys-color-primary)' }} />
              Пройдено
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontSize: '0.625rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DFE2E8' }} />
              Не начато
            </span>
          </div>
        </div>
      </div>

      {/* Chart - fixed Y axis + scrollable content */}
      <div style={{ display: 'flex', position: 'relative' }}>
        {/* Fixed Y axis */}
        <div style={{ flexShrink: 0, width: Y_AXIS_W }}>
          <svg width={Y_AXIS_W} height={H} viewBox={`0 0 ${Y_AXIS_W} ${H}`} style={{ display: 'block' }}>
            {/* Y axis title */}
            <text
              x={12} y={PAD_T + CHART_H / 2}
              textAnchor="middle" fontSize={9} fill="#A0A5B0" fontFamily="var(--font-mono)"
              transform={`rotate(-90, 12, ${PAD_T + CHART_H / 2})`}
            >
              Сложность
            </text>
            {/* Y tick labels */}
            {yTickLabels.map((tick) => (
              <text key={tick} x={Y_AXIS_W - 6} y={scaleY(tick) + 3} textAnchor="end" fontSize={9} fill="#A0A5B0" fontFamily="var(--font-mono)">
                {tick}
              </text>
            ))}
          </svg>
        </div>

        {/* Scrollable chart */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', paddingBottom: 4 }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', minWidth: W }}>

            {/* Gradient definition */}
            <defs>
              <linearGradient id="chartBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F8F9FC" />
                <stop offset="50%" stopColor="#F2F4F8" />
                <stop offset="100%" stopColor="#ECEEF4" />
              </linearGradient>
            </defs>

            {/* Chart area background */}
            <rect x={PAD_L} y={PAD_T} width={CHART_W} height={CHART_H} rx={16} fill="url(#chartBg)" />

            {/* Horizontal grid lines */}
            {yGridLines.map((tick) => (
              <line
                key={tick}
                x1={PAD_L} y1={scaleY(tick)} x2={PAD_L + CHART_W} y2={scaleY(tick)}
                stroke="#E4E6EB" strokeWidth={1} strokeDasharray="3 3"
              />
            ))}

            {/* Vertical level separators */}
            {[1, 2, 3].map((i) => (
              <line
                key={i}
                x1={scaleX(i * 2)} y1={PAD_T}
                x2={scaleX(i * 2)} y2={PAD_T + CHART_H}
                stroke="#E4E6EB" strokeWidth={1} strokeDasharray="3 3"
              />
            ))}

            {/* Course pills */}
            {positioned.map((item, i) => {
              const pillH = 26;
              return (
                <g
                  key={`${item.moduleId}-${i}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => openCourse(item.courseId)}
                >
                  {item.completed && (
                    <rect
                      x={item.cx - item.w / 2 + 1}
                      y={item.cy - pillH / 2 + 2}
                      width={item.w}
                      height={pillH}
                      rx={pillH / 2}
                      fill="rgba(26,107,90,0.15)"
                    />
                  )}
                  <rect
                    x={item.cx - item.w / 2}
                    y={item.cy - pillH / 2}
                    width={item.w}
                    height={pillH}
                    rx={pillH / 2}
                    fill={item.completed ? '#1A6B5A' : '#E8EBF0'}
                  />
                  <text
                    x={item.cx}
                    y={item.cy + 3.5}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={500}
                    fontFamily="var(--font-body)"
                    fill={item.completed ? '#FFFFFF' : '#4B5563'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}

            {/* X axis arrow */}
            <line
              x1={PAD_L} y1={PAD_T + CHART_H + 10}
              x2={PAD_L + CHART_W - 4} y2={PAD_T + CHART_H + 10}
              stroke="#C8CBD2" strokeWidth={1.5}
            />
            <polygon
              points={`${PAD_L + CHART_W - 4},${PAD_T + CHART_H + 6} ${PAD_L + CHART_W + 4},${PAD_T + CHART_H + 10} ${PAD_L + CHART_W - 4},${PAD_T + CHART_H + 14}`}
              fill="#C8CBD2"
            />

            {/* X axis level labels */}
            {LEVELS.map((lvl, i) => (
              <g key={i}>
                <text
                  x={scaleX((lvl.level - 1) * 2 + 0.8)} y={H - 28}
                  textAnchor="middle" fontSize={14} fontWeight={700} fill="#1A1A1A"
                  fontFamily="var(--font-display)"
                >
                  {lvl.title}
                </text>
                <text
                  x={scaleX((lvl.level - 1) * 2 + 0.8)} y={H - 12}
                  textAnchor="middle" fontSize={10} fill="#8A8F9C"
                  fontFamily="var(--font-body)"
                >
                  {lvl.subtitle}
                </text>
              </g>
            ))}

            {/* X axis label */}
            <text
              x={PAD_L + CHART_W} y={PAD_T + CHART_H + 26}
              textAnchor="end" fontSize={9} fill="#A0A5B0" fontFamily="var(--font-mono)"
            >
              Уровень →
            </text>

          </svg>
        </div>

        {/* Left fade gradient overlay */}
        <div style={{
          position: 'absolute', top: 0, left: Y_AXIS_W, bottom: 0, width: 40,
          background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.9))',
          pointerEvents: 'none', zIndex: 1,
        }} />
        {/* Right fade gradient overlay */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 60,
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9))',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}
