'use client';

import { useMemo } from 'react';
import { modules } from '@/lib/curriculum';

/* ════════════════════════════════════════════════════════════════
   BodyMap — anatomical mastery heatmap.
   Maps each curriculum course to one or more anatomical body
   systems via keyword matching on (title + description + tags),
   then visualises completion % as a colour-tinted region with a
   leader-line label, mirroring the reference fitness/medical apps.
   ════════════════════════════════════════════════════════════════ */

const ACCENT = '#3B82F6';

interface BodySystem {
  id: string;
  label: string;
  /** lowercase fragments matched against title+description+tags */
  keywords: string[];
  /** Anchor for the SVG dot on the silhouette */
  anchor: { x: number; y: number };
  /** Side the label sits on */
  side: 'left' | 'right';
  /** Y coordinate where the label sits (separately so labels don't overlap) */
  labelY: number;
  /** Highlight shape — a path drawn behind the silhouette to colour the region */
  region?: string;
}

/** SVG viewBox: 360 × 600 — fits on a stats card column. */
const VBW = 360;
const VBH = 600;

/* Labels alternate sides; labelY is staggered to avoid collisions. */
const SYSTEMS: BodySystem[] = [
  {
    id: 'brain',
    label: 'Мозг и нервы',
    keywords: ['невро', 'мозг', 'нейро', 'инсульт', 'эпилепс', 'деменц', 'паркинсон', 'память', 'когнит'],
    anchor: { x: 180, y: 60 },
    side: 'left', labelY: 60,
    region: 'M180,30 a30,32 0 1,0 0.1,0 z',
  },
  {
    id: 'psych',
    label: 'Психика',
    keywords: ['психиатр', 'психо', 'депресс', 'тревож', 'шизофрен', 'биполяр', 'ментал'],
    anchor: { x: 198, y: 56 },
    side: 'right', labelY: 60,
  },
  {
    id: 'eyes',
    label: 'Глаза и ЛОР',
    keywords: ['офтальм', 'глаз', 'зрени', 'лор', 'оторин', 'слух', 'ухо', 'нос'],
    anchor: { x: 168, y: 78 },
    side: 'left', labelY: 110,
  },
  {
    id: 'endocrine',
    label: 'Эндокринология',
    keywords: ['эндокрин', 'диабет', 'щитовид', 'гормон', 'гипоф', 'надпочеч', 'тирео'],
    anchor: { x: 192, y: 105 },
    side: 'right', labelY: 110,
    region: 'M170,98 q10,-12 20,0 q0,12 -10,18 q-10,-6 -10,-18 z',
  },
  {
    id: 'heart',
    label: 'Сердце и сосуды',
    keywords: ['кардио', 'серд', 'сосуд', 'артери', 'коронар', 'аритм', 'инфаркт', 'гипертен', 'давлени'],
    anchor: { x: 165, y: 165 },
    side: 'left', labelY: 165,
    region: 'M155,140 q-18,-2 -22,18 q0,30 47,38 q47,-8 47,-38 q-4,-20 -22,-18 q-12,2 -25,18 q-13,-16 -25,-18 z',
  },
  {
    id: 'lungs',
    label: 'Лёгкие',
    keywords: ['пульмо', 'легк', 'бронх', 'астм', 'хобл', 'пневмон', 'дыхан', 'респират'],
    anchor: { x: 215, y: 175 },
    side: 'right', labelY: 215,
  },
  {
    id: 'gi',
    label: 'Пищеварение',
    keywords: ['гастро', 'кишеч', 'желуд', 'пищевар', 'панкреат', 'жёлчн', 'желчн', 'диаре', 'запор'],
    anchor: { x: 180, y: 235 },
    side: 'left', labelY: 245,
    region: 'M150,210 q30,-8 60,0 q5,30 -10,55 q-20,8 -40,0 q-15,-25 -10,-55 z',
  },
  {
    id: 'liver',
    label: 'Печень',
    keywords: ['гепат', 'печен', 'цирроз', 'желч'],
    anchor: { x: 200, y: 215 },
    side: 'right', labelY: 270,
  },
  {
    id: 'kidney',
    label: 'Почки и моча',
    keywords: ['нефро', 'почеч', 'мочев', 'уролог', 'диализ', 'фильтрац'],
    anchor: { x: 155, y: 245 },
    side: 'left', labelY: 305,
  },
  {
    id: 'reproductive',
    label: 'Гинекология',
    keywords: ['акушер', 'гинекол', 'беремен', 'репродукт', 'роды', 'плод', 'матк'],
    anchor: { x: 180, y: 285 },
    side: 'right', labelY: 320,
    region: 'M158,265 q22,-4 44,0 q3,18 -8,28 q-15,4 -28,0 q-11,-10 -8,-28 z',
  },
  {
    id: 'msk',
    label: 'Кости и суставы',
    keywords: ['травма', 'ортопед', 'мышц', 'кост', 'сустав', 'ревмат', 'позвонк', 'остеопор'],
    anchor: { x: 145, y: 365 },
    side: 'left', labelY: 365,
  },
  {
    id: 'skin',
    label: 'Кожа',
    keywords: ['дермат', 'кож', 'экзем', 'псориаз', 'акне', 'меланом'],
    anchor: { x: 240, y: 250 },
    side: 'right', labelY: 380,
  },
  {
    id: 'blood',
    label: 'Кровь и иммунитет',
    keywords: ['гематол', 'кров', 'анеми', 'лейкоз', 'иммун', 'аллерг', 'инфекц', 'вакцин'],
    anchor: { x: 130, y: 200 },
    side: 'left', labelY: 425,
  },
  {
    id: 'pediatrics',
    label: 'Педиатрия',
    keywords: ['педиатр', 'дет', 'новорожд', 'младенч', 'грудничк'],
    anchor: { x: 220, y: 380 },
    side: 'right', labelY: 440,
  },
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
  region?: string;
}

function buildBodyStats(completedCourses: string[]): BodySystemStats[] {
  const completedSet = new Set(completedCourses);

  const stats: BodySystemStats[] = SYSTEMS.map((s) => ({
    id: s.id, label: s.label, anchor: s.anchor, side: s.side, labelY: s.labelY, region: s.region,
    total: 0, done: 0, pct: 0,
  }));
  const indexById: Record<string, number> = Object.create(null);
  stats.forEach((s, i) => { indexById[s.id] = i; });

  for (const m of modules) {
    for (const c of m.courses) {
      // Build a lowercase haystack once per course.
      const hay = (
        c.title + ' ' +
        c.description + ' ' +
        (c.tags?.join(' ') ?? '') + ' ' +
        m.title
      ).toLowerCase();

      // A course can belong to several systems (e.g. cardiology + lungs).
      for (const s of SYSTEMS) {
        if (s.keywords.some((kw) => hay.includes(kw))) {
          const slot = stats[indexById[s.id]];
          slot.total += 1;
          if (completedSet.has(c.id)) slot.done += 1;
        }
      }
    }
  }

  for (const s of stats) {
    s.pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
  }
  return stats;
}

/** Map % to fill colour (heat scale: cool blue → warm accent). */
function regionColor(pct: number): { fill: string; stroke: string } {
  if (pct <= 0)  return { fill: 'rgba(59, 130, 246, 0.04)',  stroke: 'rgba(148, 163, 184, 0.5)' };
  if (pct < 25)  return { fill: 'rgba(168, 199, 255, 0.45)', stroke: 'rgba(122, 165, 250, 0.85)' };
  if (pct < 50)  return { fill: 'rgba(122, 165, 250, 0.55)', stroke: 'rgba(59, 130, 246, 0.9)' };
  if (pct < 75)  return { fill: 'rgba(59, 130, 246, 0.65)',  stroke: '#2563EB' };
  return            { fill: 'rgba(37, 99, 235, 0.75)',       stroke: '#1D4ED8' };
}

export function BodyMap({ completedCourses }: { completedCourses: string[] }) {
  const stats = useMemo(() => buildBodyStats(completedCourses), [completedCourses]);

  // Avg mastery + studied count for the summary line
  const avg = stats.length
    ? Math.round(stats.reduce((s, x) => s + x.pct, 0) / stats.length)
    : 0;
  const startedSystems = stats.filter((s) => s.done > 0).length;
  const masteredSystems = stats.filter((s) => s.pct >= 75).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary stats — same visual as SectionHex */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0, padding: '4px 0 12px',
        borderBottom: '1px solid #F0F1F5',
      }}>
        <BodyStat dotColor={ACCENT}    value={`${avg}%`}            label="Средний охват" />
        <BodyStat dotColor="#7AA5FA"   value={`${startedSystems}`}  label="Систем затронуто" border />
        <BodyStat dotColor="#A8C7FF"   value={`${masteredSystems}`} label="Освоено систем" />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 12,
        justifyItems: 'center',
      }}>
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          width="100%"
          style={{ maxWidth: 460, display: 'block' }}
        >
          {/* Subtle radial backdrop */}
          <defs>
            <radialGradient id="body-bg" cx="50%" cy="40%" r="60%">
              <stop offset="0%"  stopColor="#F4F8FF" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x={0} y={0} width={VBW} height={VBH} fill="url(#body-bg)" />

          {/* Region overlays — rendered behind silhouette */}
          {stats.filter((s) => s.region).map((s) => {
            const col = regionColor(s.pct);
            return (
              <path
                key={`r-${s.id}`}
                d={s.region}
                fill={col.fill}
                stroke={col.stroke}
                strokeWidth={1.2}
                strokeDasharray={s.pct === 0 ? '3 3' : 'none'}
              />
            );
          })}

          {/* Body silhouette (front view, simplified) */}
          <BodySilhouette />

          {/* Anchor dots + leader lines + labels */}
          {stats.map((s, i) => {
            const col = regionColor(s.pct);
            const labelX = s.side === 'left' ? 30 : VBW - 30;
            const elbowX = s.side === 'left' ? 90 : VBW - 90;
            const dot = s.anchor;
            // Stable y for each label so they don't collide:
            // distribute vertically by index/2 within their side.
            const ly = s.labelY;
            return (
              <g key={s.id}>
                <line
                  x1={dot.x} y1={dot.y}
                  x2={elbowX} y2={ly}
                  stroke="rgba(148, 163, 184, 0.55)"
                  strokeWidth={1}
                />
                <line
                  x1={elbowX} y1={ly}
                  x2={s.side === 'left' ? labelX + 6 : labelX - 6} y2={ly}
                  stroke="rgba(148, 163, 184, 0.55)"
                  strokeWidth={1}
                />
                <circle
                  cx={dot.x} cy={dot.y} r={4.5}
                  fill={col.stroke}
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
                <text
                  x={labelX}
                  y={ly - 4}
                  fontSize={10.5}
                  fontFamily="var(--font-body)"
                  fontWeight={600}
                  fill="#1A1A1A"
                  textAnchor={s.side === 'left' ? 'start' : 'end'}
                  style={{ letterSpacing: '-0.005em' }}
                >
                  {s.label}
                </text>
                <text
                  x={labelX}
                  y={ly + 11}
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                  fontWeight={700}
                  fill={s.pct > 0 ? col.stroke : '#9CA3AF'}
                  textAnchor={s.side === 'left' ? 'start' : 'end'}
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

/* ────────────────────────────────────────────────────────────────
   Body silhouette — front view, stylised. Pure path strokes,
   no fills (keeps the regions readable behind it).
   ────────────────────────────────────────────────────────────── */
function BodySilhouette() {
  const stroke = '#94A3B8';
  const sw = 1.4;
  return (
    <g
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.85}
    >
      {/* Head */}
      <ellipse cx="180" cy="60" rx="30" ry="34" />
      {/* Neck */}
      <path d="M165,90 q15,12 30,0" />
      <path d="M168,93 v18" />
      <path d="M192,93 v18" />
      {/* Shoulders + torso outline */}
      <path d="
        M168,111
        q-30,4 -55,18
        q-8,18 -8,42
        l-8,80
        q-2,4 -1,8
        l-2,40
        l-6,40
      " />
      <path d="
        M192,111
        q30,4 55,18
        q8,18 8,42
        l8,80
        q2,4 1,8
        l2,40
        l6,40
      " />
      {/* Pelvis line */}
      <path d="M120,290 q60,10 120,0" />
      {/* Legs split */}
      <path d="
        M140,290
        l-6,90
        l-4,90
        l-2,80
        q4,8 12,8
        q8,0 12,-8
        l-2,-80
        l-2,-90
        l4,-90
      " />
      <path d="
        M220,290
        l6,90
        l4,90
        l2,80
        q-4,8 -12,8
        q-8,0 -12,-8
        l2,-80
        l2,-90
        l-4,-90
      " />
      {/* Inner torso muscle hint (very light) */}
      <path
        d="M155,115 q25,8 50,0"
        opacity={0.4}
      />
      <path
        d="M180,115 v160"
        opacity={0.25}
      />
      {/* Pec hint */}
      <path d="M150,135 q15,18 30,18 q15,0 30,-18" opacity={0.35} />
      {/* Abdominal hints */}
      <path d="M158,180 q22,-4 44,0" opacity={0.3} />
      <path d="M158,205 q22,-4 44,0" opacity={0.3} />
      <path d="M160,230 q20,-4 40,0" opacity={0.3} />
    </g>
  );
}
