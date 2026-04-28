'use client';

import { useMemo } from 'react';
import { modules } from '@/lib/curriculum';

/* ════════════════════════════════════════════════════════════════
   BodyMap — anatomical mastery heatmap.

   Visual base: a static muscle-anatomy illustration of front + back
   body views (saved at /public/body-anatomy.png — 1400×1680). Each
   curriculum course is matched against a body-system keyword set
   and the system completion % is rendered as a leader-line label
   pointing at the relevant region of the figure.
   ════════════════════════════════════════════════════════════════ */

const ACCENT = '#3B82F6';

interface BodySystem {
  id: string;
  label: string;
  /** lowercase fragments matched against title+description+tags */
  keywords: string[];
  /** Anchor for the dot on the silhouette — viewBox coords (0..VBW × 0..VBH) */
  anchor: { x: number; y: number };
  /** Side the label sits on */
  side: 'left' | 'right';
  /** Y coordinate where the label sits (manual stagger to avoid overlap) */
  labelY: number;
}

/** SVG viewBox — exact pixel dimensions of /public/body-anatomy.png. */
const VBW = 1400;
const VBH = 1680;

/* Anchor positions tuned to the muscle-anatomy poster:
     Front body  ≈ centre x 490, span y 220..1620, torso x 380..600
     Back  body  ≈ centre x 985, span y 220..1620, torso x 880..1090
   Each label sits on the SAME side as its anchor — no leader line ever
   crosses through the figure. Front-body anchors → labels on the left,
   back-body anchors → labels on the right. */
const SYSTEMS: BodySystem[] = [
  // ── Front body — left-side labels ──
  { id: 'brain',        label: 'Мозг и нервы',
    keywords: ['невро','мозг','нейро','инсульт','эпилепс','деменц','паркинсон','когнит'],
    anchor: { x: 490, y: 280 }, side: 'left',  labelY: 130 },

  { id: 'eyes',         label: 'Глаза и ЛОР',
    keywords: ['офтальм','глаз','зрени','лор','оторин','слух','ухо','нос'],
    anchor: { x: 470, y: 330 }, side: 'left',  labelY: 280 },

  { id: 'heart',        label: 'Сердце и сосуды',
    keywords: ['кардио','серд','сосуд','артери','коронар','аритм','инфаркт','гипертен','давлени'],
    anchor: { x: 490, y: 540 }, side: 'left',  labelY: 430 },

  { id: 'lungs',        label: 'Лёгкие',
    keywords: ['пульмо','легк','бронх','астм','хобл','пневмон','дыхан','респират'],
    anchor: { x: 430, y: 540 }, side: 'left',  labelY: 580 },

  { id: 'gi',           label: 'Пищеварение',
    keywords: ['гастро','кишеч','желуд','пищевар','панкреат','жёлчн','желчн','диаре','запор'],
    anchor: { x: 490, y: 780 }, side: 'left',  labelY: 730 },

  { id: 'liver',        label: 'Печень',
    keywords: ['гепат','печен','цирроз','желч'],
    anchor: { x: 560, y: 720 }, side: 'left',  labelY: 880 },

  { id: 'reproductive', label: 'Гинекология',
    keywords: ['акушер','гинекол','беремен','репродукт','роды','плод','матк'],
    anchor: { x: 490, y: 1010 }, side: 'left',  labelY: 1030 },

  // ── Back body — right-side labels ──
  { id: 'psych',        label: 'Психика',
    keywords: ['психиатр','психо','депресс','тревож','шизофрен','биполяр','ментал'],
    anchor: { x: 985, y: 280 }, side: 'right', labelY: 130 },

  { id: 'endocrine',    label: 'Эндокринология',
    keywords: ['эндокрин','диабет','щитовид','гормон','гипоф','надпочеч','тирео'],
    anchor: { x: 985, y: 400 }, side: 'right', labelY: 280 },

  { id: 'skin',         label: 'Кожа',
    keywords: ['дермат','кож','экзем','псориаз','акне','меланом'],
    anchor: { x: 1060, y: 540 }, side: 'right', labelY: 430 },

  { id: 'blood',        label: 'Кровь и иммунитет',
    keywords: ['гематол','кров','анеми','лейкоз','иммун','аллерг','инфекц','вакцин'],
    anchor: { x: 985, y: 600 }, side: 'right', labelY: 580 },

  { id: 'kidney',       label: 'Почки и моча',
    keywords: ['нефро','почеч','мочев','уролог','диализ','фильтрац'],
    anchor: { x: 985, y: 800 }, side: 'right', labelY: 730 },

  { id: 'pediatrics',   label: 'Педиатрия',
    keywords: ['педиатр','дет','новорожд','младенч','грудничк'],
    anchor: { x: 985, y: 980 }, side: 'right', labelY: 880 },

  { id: 'msk',          label: 'Кости и суставы',
    keywords: ['травма','ортопед','мышц','кост','сустав','ревмат','позвонк','остеопор'],
    anchor: { x: 945, y: 1180 }, side: 'right', labelY: 1030 },
];

interface BodySystemStats {
  id: string;
  label: string;
  total: number;
  done: number;
  pct: number;
  anchor: { x: number; y: number };
  side: 'left' | 'right';
  labelY: number;
}

function buildBodyStats(completedCourses: string[]): BodySystemStats[] {
  const completedSet = new Set(completedCourses);

  const stats: BodySystemStats[] = SYSTEMS.map((s) => ({
    id: s.id, label: s.label, anchor: s.anchor, side: s.side, labelY: s.labelY,
    total: 0, done: 0, pct: 0,
  }));
  const indexById: Record<string, number> = Object.create(null);
  stats.forEach((s, i) => { indexById[s.id] = i; });

  for (const m of modules) {
    for (const c of m.courses) {
      const hay = (
        c.title + ' ' + c.description + ' ' +
        (c.tags?.join(' ') ?? '') + ' ' + m.title
      ).toLowerCase();
      for (const s of SYSTEMS) {
        if (s.keywords.some((kw) => hay.includes(kw))) {
          const idx = indexById[s.id];
          const slot = idx !== undefined ? stats[idx] : undefined;
          if (slot) {
            slot.total += 1;
            if (completedSet.has(c.id)) slot.done += 1;
          }
        }
      }
    }
  }

  for (const s of stats) {
    s.pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
  }
  return stats;
}

/** Map % to dot/label colour. */
function regionColor(pct: number): string {
  if (pct <= 0)  return '#CBD5E1';
  if (pct < 25)  return '#A8C7FF';
  if (pct < 50)  return '#7AA5FA';
  if (pct < 75)  return ACCENT;
  return '#1D4ED8';
}

export function BodyMap({ completedCourses }: { completedCourses: string[] }) {
  const stats = useMemo(() => buildBodyStats(completedCourses), [completedCourses]);

  const avg = stats.length
    ? Math.round(stats.reduce((s, x) => s + x.pct, 0) / stats.length)
    : 0;
  const startedSystems  = stats.filter((s) => s.done > 0).length;
  const masteredSystems = stats.filter((s) => s.pct >= 75).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0, padding: '4px 0 12px',
        borderBottom: '1px solid #F0F1F5',
      }}>
        <BodyStat dotColor={ACCENT}    value={`${avg}%`}            label="Средний охват" />
        <BodyStat dotColor="#7AA5FA"   value={`${startedSystems}`}  label="Систем затронуто" border />
        <BodyStat dotColor="#A8C7FF"   value={`${masteredSystems}`} label="Освоено систем" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          width="100%"
          style={{ maxWidth: 640, display: 'block' }}
          role="img"
          aria-label="Карта систем тела по уровню освоения"
        >
          {/* Body anatomy poster */}
          <image
            href="/body-anatomy.webp"
            x={0} y={0} width={VBW} height={VBH}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* Anchor dots + leader lines + labels */}
          {stats.map((s) => {
            const col = regionColor(s.pct);
            const labelX = s.side === 'left' ? 24  : VBW - 24;
            const elbowX = s.side === 'left' ? 180 : VBW - 180;
            const dot = s.anchor;
            const ly = s.labelY;
            // Leader line meets the label at the SAME Y as the category title,
            // so the line visually "underlines" the system name. Title text uses
            // dominantBaseline="middle" to centre vertically on this Y.
            return (
              <g key={s.id}>
                <line
                  x1={dot.x} y1={dot.y}
                  x2={elbowX} y2={ly}
                  stroke="rgba(100, 116, 139, 0.55)"
                  strokeWidth={2}
                />
                <line
                  x1={elbowX} y1={ly}
                  x2={s.side === 'left' ? labelX + 6 : labelX - 6} y2={ly}
                  stroke="rgba(100, 116, 139, 0.55)"
                  strokeWidth={2}
                />
                {/* soft halo for active systems */}
                {s.pct > 0 && (
                  <circle
                    cx={dot.x} cy={dot.y} r={18}
                    fill="none" stroke={col} strokeOpacity={0.22} strokeWidth={4}
                  />
                )}
                <circle
                  cx={dot.x} cy={dot.y} r={9}
                  fill={col}
                  stroke="#FFFFFF"
                  strokeWidth={3}
                />

                <text
                  x={labelX}
                  y={ly}
                  fontSize={22}
                  fontFamily="var(--font-body)"
                  fontWeight={700}
                  fill="#1A1A1A"
                  textAnchor={s.side === 'left' ? 'start' : 'end'}
                  dominantBaseline="middle"
                  style={{ letterSpacing: '-0.005em' }}
                >
                  {s.label}
                </text>
                <text
                  x={labelX}
                  y={ly + 24}
                  fontSize={18}
                  fontFamily="var(--font-mono)"
                  fontWeight={700}
                  fill={s.pct > 0 ? col : '#9CA3AF'}
                  textAnchor={s.side === 'left' ? 'start' : 'end'}
                  dominantBaseline="middle"
                >
                  {s.pct}% · {s.done}/{s.total}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function BodyStat({ dotColor, value, label, border }: {
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
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor }} />
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
