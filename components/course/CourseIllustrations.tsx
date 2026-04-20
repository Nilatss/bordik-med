'use client';

/**
 * Inline SVG illustrations for course content callouts.
 * Keyed by illustration ID (e.g. "1.1.0" → IllustrationMap["1.1.0"]).
 * Each illustration is minimalist, stylised, and fits the clean UI.
 */

import type { ReactElement } from 'react';

const COLORS = {
  ink: '#1A1A1A',
  accent: '#1D4ED8',
  red: '#EF4444',
  green: '#10B981',
  purple: '#8B5CF6',
  amber: '#F59E0B',
  pink: '#EC4899',
  sky: '#0EA5E9',
  slate: '#475569',
  paper: '#F5F6F8',
};

const SvgFrame = ({ children, ratio = 'auto' }: { children: React.ReactNode; ratio?: string }) => (
  <svg viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg"
    style={{
      width: '100%', maxWidth: 600, height: 'auto',
      aspectRatio: ratio,
      display: 'block', margin: '0 auto',
    }}
  >
    <rect width="600" height="340" fill="#FAFBFC" rx="12" />
    {children}
  </svg>
);

/* #1.1.0 - Предметы → Медицина (паутина) */
const Subjects = (): ReactElement => (
  <SvgFrame>
    <circle cx="300" cy="170" r="46" fill={COLORS.ink} />
    <text x="300" y="175" textAnchor="middle" fill="#FFF" fontSize="14" fontWeight="700" fontFamily="var(--font-display)">МЕДИЦИНА</text>
    {[
      { angle: -90, label: 'Биология', color: COLORS.green },
      { angle: -30, label: 'Химия', color: COLORS.amber },
      { angle: 30, label: 'Физика', color: COLORS.accent },
      { angle: 90, label: 'Математика', color: COLORS.purple },
      { angle: 150, label: 'Психология', color: COLORS.pink },
      { angle: 210, label: 'Язык', color: COLORS.sky },
    ].map(({ angle, label, color }, i) => {
      const rad = (angle * Math.PI) / 180;
      const x = 300 + Math.cos(rad) * 130;
      const y = 170 + Math.sin(rad) * 110;
      return (
        <g key={i}>
          <line x1="300" y1="170" x2={x} y2={y} stroke="#CCC" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={x} cy={y} r="32" fill={color} opacity="0.12" />
          <circle cx={x} cy={y} r="32" fill="none" stroke={color} strokeWidth="1.6" />
          <text x={x} y={y + 4} textAnchor="middle" fill={color} fontSize="11" fontWeight="600" fontFamily="var(--font-body)">{label}</text>
        </g>
      );
    })}
  </SvgFrame>
);

/* #1.1.1 - Клетка */
const Cell = (): ReactElement => (
  <SvgFrame>
    {/* membrane */}
    <ellipse cx="300" cy="170" rx="240" ry="130" fill="none" stroke={COLORS.ink} strokeWidth="2" />
    <ellipse cx="300" cy="170" rx="240" ry="130" fill={COLORS.paper} opacity="0.6" />
    {/* nucleus */}
    <circle cx="300" cy="170" r="55" fill={COLORS.purple} opacity="0.18" />
    <circle cx="300" cy="170" r="55" fill="none" stroke={COLORS.purple} strokeWidth="1.8" />
    <circle cx="310" cy="160" r="15" fill={COLORS.purple} opacity="0.35" />
    <text x="300" y="240" textAnchor="middle" fontSize="11" fill={COLORS.purple} fontWeight="600">Ядро</text>
    {/* mitochondria */}
    {[[140, 120], [460, 130], [150, 220], [460, 230]].map(([x, y], i) => (
      <g key={`mt${i}`}>
        <ellipse cx={x} cy={y} rx="24" ry="12" fill={COLORS.red} opacity="0.2" />
        <ellipse cx={x} cy={y} rx="24" ry="12" fill="none" stroke={COLORS.red} strokeWidth="1.6" />
        <path d={`M${x - 18} ${y} Q${x - 8} ${y - 6} ${x} ${y} T${x + 18} ${y}`} fill="none" stroke={COLORS.red} strokeWidth="1" />
      </g>
    ))}
    <text x="140" y="95" textAnchor="middle" fontSize="10" fill={COLORS.red} fontWeight="600">Митохондрии</text>
    {/* ribosomes */}
    {[[240, 90], [360, 90], [240, 250], [360, 250]].map(([x, y], i) => (
      <circle key={`r${i}`} cx={x} cy={y} r="5" fill={COLORS.green} />
    ))}
    <text x="240" y="78" textAnchor="middle" fontSize="10" fill={COLORS.green} fontWeight="600">Рибосомы</text>
    {/* ER */}
    <path d="M 80 170 Q 120 140 160 170 T 240 170" fill="none" stroke={COLORS.sky} strokeWidth="2" />
    <text x="120" y="200" textAnchor="middle" fontSize="10" fill={COLORS.sky} fontWeight="600">ЭПС</text>
  </SvgFrame>
);

/* #1.1.2 - Митоз */
const Mitosis = (): ReactElement => (
  <SvgFrame>
    {['Интерфаза', 'Профаза', 'Метафаза', 'Анафаза', 'Телофаза', 'Цитокинез'].map((phase, i) => {
      const x = 60 + i * 85;
      const y = 170;
      const colors = [COLORS.slate, COLORS.accent, COLORS.purple, COLORS.pink, COLORS.amber, COLORS.green];
      const c = colors[i];
      return (
        <g key={phase}>
          <circle cx={x} cy={y} r="32" fill={c} opacity="0.14" />
          <circle cx={x} cy={y} r="32" fill="none" stroke={c} strokeWidth="1.8" />
          {/* phase symbol */}
          {i === 0 && <circle cx={x} cy={y} r="10" fill={c} />}
          {i === 1 && [...Array(4)].map((_, k) => <line key={k} x1={x - 10} y1={y - 10 + k * 6} x2={x + 10} y2={y - 10 + k * 6} stroke={c} strokeWidth="2" />)}
          {i === 2 && <line x1={x} y1={y - 16} x2={x} y2={y + 16} stroke={c} strokeWidth="2" strokeDasharray="3 2" />}
          {i === 3 && (<><line x1={x - 10} y1={y - 8} x2={x - 18} y2={y - 14} stroke={c} strokeWidth="2" /><line x1={x + 10} y1={y - 8} x2={x + 18} y2={y - 14} stroke={c} strokeWidth="2" /></>)}
          {i === 4 && (<><circle cx={x - 8} cy={y} r="6" fill={c} /><circle cx={x + 8} cy={y} r="6" fill={c} /></>)}
          {i === 5 && (<><circle cx={x - 12} cy={y} r="10" fill="none" stroke={c} strokeWidth="2" /><circle cx={x + 12} cy={y} r="10" fill="none" stroke={c} strokeWidth="2" /></>)}
          <text x={x} y={y + 58} textAnchor="middle" fontSize="10" fill={c} fontWeight="600">{phase}</text>
          {i < 5 && <path d={`M ${x + 35} ${y} L ${x + 50} ${y}`} stroke="#BBB" strokeWidth="1.4" markerEnd="url(#arrow)" />}
        </g>
      );
    })}
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 Z" fill="#BBB" />
      </marker>
    </defs>
  </SvgFrame>
);

/* #1.1.3 - ДНК двойная спираль */
const DNA = (): ReactElement => (
  <SvgFrame>
    {[...Array(11)].map((_, i) => {
      const y = 40 + i * 26;
      const phase = (i / 11) * Math.PI * 2;
      const x1 = 250 + Math.cos(phase) * 50;
      const x2 = 250 - Math.cos(phase) * 50;
      const isAT = i % 2 === 0;
      return (
        <g key={i}>
          <line x1={x1} y1={y} x2={x2} y2={y} stroke={isAT ? COLORS.accent : COLORS.red} strokeWidth="2" />
          <circle cx={x1} cy={y} r="5" fill={COLORS.amber} />
          <circle cx={x2} cy={y} r="5" fill={COLORS.amber} />
        </g>
      );
    })}
    {/* legend */}
    <g transform="translate(380, 100)">
      <rect x="-10" y="-10" width="180" height="140" fill="#FFF" stroke="#EEE" rx="8" />
      <text x="0" y="10" fontSize="12" fontWeight="700" fill={COLORS.ink}>Основания</text>
      <circle cx="10" cy="35" r="5" fill={COLORS.accent} />
      <text x="25" y="40" fontSize="11" fill={COLORS.slate}>A - T (2 связи)</text>
      <circle cx="10" cy="60" r="5" fill={COLORS.red} />
      <text x="25" y="65" fontSize="11" fill={COLORS.slate}>G - C (3 связи)</text>
      <circle cx="10" cy="90" r="5" fill={COLORS.amber} />
      <text x="25" y="95" fontSize="11" fill={COLORS.slate}>Фосфат + сахар</text>
    </g>
  </SvgFrame>
);

/* #1.1.4 - Системы органов */
const BodySystems = (): ReactElement => (
  <SvgFrame>
    {/* silhouette */}
    <g transform="translate(180, 40)">
      <circle cx="50" cy="30" r="25" fill="none" stroke={COLORS.ink} strokeWidth="1.8" />
      <path d="M 25 55 L 25 100 L 10 170 L 25 240 L 40 180 L 50 180 L 60 180 L 75 240 L 90 170 L 75 100 L 75 55 Z" fill="none" stroke={COLORS.ink} strokeWidth="1.8" />
      {/* heart */}
      <path d="M 45 100 C 40 95 33 95 33 103 C 33 110 45 120 45 120 C 45 120 57 110 57 103 C 57 95 50 95 45 100 Z" fill={COLORS.red} opacity="0.7" />
      {/* brain */}
      <circle cx="50" cy="25" r="12" fill={COLORS.accent} opacity="0.5" />
      {/* lungs */}
      <ellipse cx="35" cy="105" rx="8" ry="15" fill={COLORS.sky} opacity="0.4" />
      <ellipse cx="55" cy="105" rx="8" ry="15" fill={COLORS.sky} opacity="0.4" />
      {/* gut */}
      <path d="M 40 135 Q 50 145 60 135 Q 50 160 40 150 Q 50 170 60 155" fill="none" stroke={COLORS.green} strokeWidth="2" />
    </g>
    {/* legend */}
    <g transform="translate(320, 60)">
      {[
        { color: COLORS.accent, label: 'Нервная' },
        { color: COLORS.red, label: 'Кровеносная' },
        { color: COLORS.sky, label: 'Дыхательная' },
        { color: COLORS.green, label: 'Пищеварительная' },
        { color: COLORS.amber, label: 'Мочевыделительная' },
        { color: COLORS.slate, label: 'Опорно-двигательная' },
      ].map((it, i) => (
        <g key={i} transform={`translate(0, ${i * 32})`}>
          <circle cx="10" cy="10" r="8" fill={it.color} opacity="0.7" />
          <text x="28" y="15" fontSize="12" fill={COLORS.ink}>{it.label}</text>
        </g>
      ))}
    </g>
  </SvgFrame>
);

/* #1.1.5 - Органические соединения */
const OrganicCompounds = (): ReactElement => (
  <SvgFrame>
    {['Углеводы', 'Липиды', 'Белки', 'Нуклеиновые', 'Амины', 'Кислоты'].map((name, i) => {
      const x = 50 + (i % 3) * 180;
      const y = 60 + Math.floor(i / 3) * 130;
      const colors = [COLORS.amber, COLORS.red, COLORS.accent, COLORS.purple, COLORS.green, COLORS.pink];
      const c = colors[i];
      return (
        <g key={name}>
          <rect x={x} y={y} width="160" height="110" rx="10" fill={c} opacity="0.08" stroke={c} strokeWidth="1.5" />
          <circle cx={x + 40} cy={y + 45} r="14" fill={c} opacity="0.3" />
          <circle cx={x + 70} cy={y + 55} r="12" fill={c} opacity="0.3" />
          <circle cx={x + 50} cy={y + 70} r="10" fill={c} opacity="0.3" />
          <text x={x + 80} y={y + 100} textAnchor="middle" fontSize="12" fontWeight="700" fill={c}>{name}</text>
        </g>
      );
    })}
  </SvgFrame>
);

/* #1.1.6 - pH шкала */
const pHScale = (): ReactElement => (
  <SvgFrame>
    <defs>
      <linearGradient id="phGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="35%" stopColor="#F59E0B" />
        <stop offset="55%" stopColor="#FDE047" />
        <stop offset="65%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <rect x="40" y="140" width="520" height="40" rx="20" fill="url(#phGrad)" />
    {[
      { ph: 1.5, label: 'Желудок', y: 110 },
      { ph: 2, label: 'Лимон', y: 80 },
      { ph: 5, label: 'Кофе', y: 110 },
      { ph: 7.4, label: 'Кровь', y: 80 },
      { ph: 9, label: 'Мыло', y: 110 },
      { ph: 12, label: 'Хлорка', y: 80 },
    ].map(({ ph, label, y }, i) => {
      const x = 40 + (ph / 14) * 520;
      return (
        <g key={i}>
          <line x1={x} y1={y + 15} x2={x} y2="140" stroke={COLORS.ink} strokeWidth="1" />
          <circle cx={x} cy={y} r="18" fill="#FFF" stroke={COLORS.ink} strokeWidth="1.5" />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={COLORS.ink}>{ph}</text>
          <text x={x} y={y - 22} textAnchor="middle" fontSize="10" fill={COLORS.slate}>{label}</text>
        </g>
      );
    })}
    {[0, 7, 14].map((n, i) => (
      <text key={i} x={40 + (n / 14) * 520} y="210" textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.ink}>{n}</text>
    ))}
    <text x="40" y="240" fontSize="11" fill={COLORS.red}>Кислота</text>
    <text x="300" y="240" textAnchor="middle" fontSize="11" fill={COLORS.green}>Нейтральная</text>
    <text x="560" y="240" textAnchor="end" fontSize="11" fill={COLORS.accent}>Щёлочь</text>
  </SvgFrame>
);

/* #1.1.7 - Сердце + гидравлика */
const Circulation = (): ReactElement => (
  <SvgFrame>
    {/* heart as pump */}
    <path d="M 260 130 C 240 100 200 100 200 140 C 200 180 260 220 260 220 C 260 220 320 180 320 140 C 320 100 280 100 260 130 Z" fill={COLORS.red} opacity="0.2" stroke={COLORS.red} strokeWidth="2" />
    <text x="260" y="175" textAnchor="middle" fontSize="12" fontWeight="700" fill={COLORS.red}>Сердце</text>
    <text x="260" y="190" textAnchor="middle" fontSize="9" fill={COLORS.slate}>насос</text>
    {/* artery */}
    <path d="M 320 140 Q 420 120 480 90" fill="none" stroke={COLORS.red} strokeWidth="10" strokeLinecap="round" />
    <text x="420" y="80" textAnchor="middle" fontSize="10" fill={COLORS.red} fontWeight="600">Артерии · 120/80</text>
    {/* capillaries */}
    <g stroke={COLORS.purple} strokeWidth="1">
      {[...Array(8)].map((_, i) => (
        <line key={i} x1={470 + i * 12} y1="100" x2={480 + i * 15} y2="150" />
      ))}
    </g>
    <text x="530" y="175" textAnchor="middle" fontSize="10" fill={COLORS.purple} fontWeight="600">Капилляры · ~25</text>
    {/* veins */}
    <path d="M 480 200 Q 420 230 320 220" fill="none" stroke={COLORS.accent} strokeWidth="10" strokeLinecap="round" />
    <text x="420" y="250" textAnchor="middle" fontSize="10" fill={COLORS.accent} fontWeight="600">Вены · ~0</text>
    <text x="300" y="290" textAnchor="middle" fontSize="10" fill={COLORS.slate}>Давление (мм рт.ст.)</text>
  </SvgFrame>
);

/* #1.1.8 - Масштабы */
const Scales = (): ReactElement => (
  <SvgFrame>
    <line x1="40" y1="170" x2="560" y2="170" stroke={COLORS.ink} strokeWidth="2" />
    {[
      { x: 60, label: 'Волос', sub: '70 мкм', color: COLORS.amber },
      { x: 160, label: 'Эритроцит', sub: '7 мкм', color: COLORS.red },
      { x: 260, label: 'Бактерия', sub: '1 мкм', color: COLORS.green },
      { x: 360, label: 'Вирус', sub: '100 нм', color: COLORS.purple },
      { x: 460, label: 'Белок', sub: '10 нм', color: COLORS.accent },
      { x: 540, label: 'ДНК', sub: '2 нм', color: COLORS.pink },
    ].map(({ x, label, sub, color }, i) => (
      <g key={i}>
        <line x1={x} y1="165" x2={x} y2="175" stroke={COLORS.ink} strokeWidth="1.5" />
        <circle cx={x} cy="130" r={Math.max(4, 20 - i * 2.5)} fill={color} opacity="0.7" />
        <text x={x} y="195" textAnchor="middle" fontSize="11" fontWeight="600" fill={COLORS.ink}>{label}</text>
        <text x={x} y="210" textAnchor="middle" fontSize="9" fill={COLORS.slate}>{sub}</text>
      </g>
    ))}
    <text x="40" y="260" fontSize="10" fill={COLORS.slate}>Световой микроскоп видит ≥ 0.2 мкм</text>
    <text x="40" y="278" fontSize="10" fill={COLORS.slate}>Электронный микроскоп видит ≥ 0.1 нм</text>
  </SvgFrame>
);

/* #1.1.9 - Потенциал действия */
const ActionPotential = (): ReactElement => (
  <SvgFrame>
    {/* axes */}
    <line x1="60" y1="280" x2="560" y2="280" stroke={COLORS.ink} strokeWidth="1.5" />
    <line x1="60" y1="40" x2="60" y2="280" stroke={COLORS.ink} strokeWidth="1.5" />
    <text x="300" y="305" textAnchor="middle" fontSize="11" fill={COLORS.slate}>Время (мс)</text>
    <text x="30" y="160" fontSize="11" fill={COLORS.slate} transform="rotate(-90 30 160)" textAnchor="middle">мВ</text>
    {/* rest line */}
    <line x1="60" y1="230" x2="560" y2="230" stroke="#DDD" strokeWidth="1" strokeDasharray="3 3" />
    <text x="65" y="245" fontSize="10" fill={COLORS.slate}>-70 мВ (покой)</text>
    {/* waveform */}
    <path d="M 60 230 L 200 230 C 230 230 240 60 270 60 L 300 60 C 330 60 360 230 400 240 L 430 240 L 560 230"
      fill="none" stroke={COLORS.accent} strokeWidth="3" />
    {/* phases */}
    <text x="150" y="222" fontSize="10" fill={COLORS.slate}>Покой</text>
    <text x="255" y="50" fontSize="10" fill={COLORS.red} fontWeight="600">+40 (деполяризация)</text>
    <text x="380" y="120" fontSize="10" fill={COLORS.green} fontWeight="600">Реполяризация</text>
    <text x="480" y="260" fontSize="10" fill={COLORS.purple}>Гиперполяризация</text>
  </SvgFrame>
);

/* #1.1.10 - Биопсихосоциальная модель */
const BioPsychoSocial = (): ReactElement => (
  <SvgFrame>
    <g opacity="0.55">
      <circle cx="240" cy="140" r="90" fill={COLORS.red} />
      <circle cx="360" cy="140" r="90" fill={COLORS.accent} />
      <circle cx="300" cy="230" r="90" fill={COLORS.green} />
    </g>
    <text x="200" y="90" fontSize="13" fontWeight="700" fill={COLORS.red}>Био</text>
    <text x="190" y="110" fontSize="10" fill={COLORS.slate}>Генетика, физиология</text>
    <text x="380" y="90" fontSize="13" fontWeight="700" fill={COLORS.accent}>Психо</text>
    <text x="380" y="110" fontSize="10" fill={COLORS.slate}>Стресс, когниция</text>
    <text x="260" y="300" fontSize="13" fontWeight="700" fill={COLORS.green}>Социо</text>
    <text x="240" y="320" fontSize="10" fill={COLORS.slate}>Семья, работа, культура</text>
    <text x="300" y="185" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFF">Болезнь</text>
  </SvgFrame>
);

/* #1.1.11 - Кривая забывания Эббингауза */
const EbbinghausCurve = (): ReactElement => (
  <SvgFrame>
    <line x1="60" y1="280" x2="560" y2="280" stroke={COLORS.ink} strokeWidth="1.5" />
    <line x1="60" y1="40" x2="60" y2="280" stroke={COLORS.ink} strokeWidth="1.5" />
    <text x="300" y="305" textAnchor="middle" fontSize="11" fill={COLORS.slate}>Время (дни)</text>
    <text x="30" y="160" fontSize="11" fill={COLORS.slate} transform="rotate(-90 30 160)" textAnchor="middle">Память %</text>
    {/* without review */}
    <path d="M 60 50 Q 110 180 200 230 T 560 270" fill="none" stroke={COLORS.red} strokeWidth="2.5" />
    <text x="400" y="265" fontSize="10" fill={COLORS.red} fontWeight="600">Без повторений</text>
    {/* with review - sawtooth */}
    <path d="M 60 50 Q 90 120 120 180 L 130 80 Q 160 130 200 170 L 210 70 Q 260 120 320 150 L 330 60 Q 400 110 470 130 L 480 55 Q 520 90 560 110"
      fill="none" stroke={COLORS.green} strokeWidth="2.5" />
    <text x="330" y="50" fontSize="10" fill={COLORS.green} fontWeight="600">С повторениями</text>
    {/* intervals */}
    {[
      { x: 120, label: '1 д' },
      { x: 210, label: '3 д' },
      { x: 330, label: '7 д' },
      { x: 480, label: '30 д' },
    ].map(({ x, label }, i) => (
      <g key={i}>
        <line x1={x} y1="278" x2={x} y2="284" stroke={COLORS.ink} strokeWidth="1" />
        <text x={x} y="295" textAnchor="middle" fontSize="9" fill={COLORS.slate}>{label}</text>
      </g>
    ))}
  </SvgFrame>
);

// Image-based illustrations (PNG files in /public/course/100-1/)
const imageMap: Record<string, { src: string; alt: string }> = {
  '1.1.1': { src: '/course/100-1/cell.png', alt: 'Строение клетки' },
  '1.1.2': { src: '/course/100-1/mitosis.png', alt: 'Фазы митоза' },
  '1.1.3': { src: '/course/100-1/dna.png', alt: 'Строение ДНК' },
  '1.1.4': { src: '/course/100-1/body-systems.png', alt: 'Системы органов человека' },
  '1.1.5': { src: '/course/100-1/organic-compounds.png', alt: 'Органические соединения' },
  '1.1.6': { src: '/course/100-1/ph-scale.png', alt: 'Шкала pH' },
  '1.1.7': { src: '/course/100-1/circulation.png', alt: 'Кровообращение и давление' },
  '1.1.8': { src: '/course/100-1/scales.png', alt: 'Размеры: от волоса до ДНК' },
  '1.1.9': { src: '/course/100-1/action-potential.png', alt: 'Потенциал действия' },
  '1.1.10': { src: '/course/100-1/biopsychosocial.png', alt: 'Биопсихосоциальная модель болезни' },
};

// SVG-based illustrations (kept for topics that don't have real images yet)
// Note: '1.1.0' intentionally removed - no illustration for Введение.
const illustrationMap: Record<string, () => ReactElement> = {
  '1.1.11': EbbinghausCurve,
};

export function CourseIllustration({ id }: { id: string }) {
  const img = imageMap[id];
  const Cmp = illustrationMap[id];
  if (!img && !Cmp) return null;
  return (
    <div style={{
      margin: '14px 0',
      borderRadius: 12,
      overflow: 'hidden',
      background: '#FAFBFC',
      border: '1px solid #EAECEF',
      padding: 12,
    }}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.src}
          alt={img.alt}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
        />
      ) : Cmp ? (
        <Cmp />
      ) : null}
    </div>
  );
}
