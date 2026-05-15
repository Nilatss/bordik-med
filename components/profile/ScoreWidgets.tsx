/**
 * P1-CR-3 (ProfilePage split, step 1/4) — score visualization widgets.
 *
 * Три связанных компонента:
 * - ScoreGauge — большой semi-circular gauge (240° arc) с numeric center
 *   + colored band label. Используется как hero-widget в profile page.
 * - MiniScore — маленький circular indicator (40×40px) с inner percent.
 *   Используется внутри MetricCard и независимо в других metric-rows.
 * - MetricCard — composite: MiniScore + title + description + impact-badge.
 *
 * Цветовая логика ScoreGauge:
 *   ≥80 → green (#2ECC71 / #E8F8F0 / #1E8449)
 *   ≥50 → amber (#F39C12 / #FEF5E7 / #B7950B)
 *   <50 → red   (#E74C3C / #FDEDEC / #C0392B)
 *
 * MiniScore + MetricCard принимают color/circleColor как prop —
 * caller сам выбирает цвет под domain (например, по типу метрики).
 */

interface ScoreGaugeProps {
  score: number;
  label: string;
}

export function ScoreGauge({ score, label }: ScoreGaugeProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const angle = (clampedScore / 100) * 240; // 240° arc
  const startAngle = 150; // start from bottom-left

  const r = 80;
  const cx = 100, cy = 100;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const bgStart = toRad(startAngle);
  const bgEnd = toRad(startAngle + 240);
  const valEnd = toRad(startAngle + angle);

  const arcPath = (start: number, end: number) => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const dotX = cx + r * Math.cos(valEnd);
  const dotY = cy + r * Math.sin(valEnd);

  const color = clampedScore >= 80 ? '#2ECC71' : clampedScore >= 50 ? '#F39C12' : '#E74C3C';
  const labelBg = clampedScore >= 80 ? '#E8F8F0' : clampedScore >= 50 ? '#FEF5E7' : '#FDEDEC';
  const labelColor = clampedScore >= 80 ? '#1E8449' : clampedScore >= 50 ? '#B7950B' : '#C0392B';

  return (
    <div className="flex flex-col items-center">
      <svg width={200} height={160} viewBox="0 0 200 200">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E74C3C" />
            <stop offset="50%" stopColor="#F39C12" />
            <stop offset="100%" stopColor="#2ECC71" />
          </linearGradient>
        </defs>
        <path d={arcPath(bgStart, bgEnd)} fill="none" stroke="#EAECF0" strokeWidth={12} strokeLinecap="round" />
        {clampedScore > 0 && (
          <path d={arcPath(bgStart, valEnd)} fill="none" stroke="url(#gaugeGrad)" strokeWidth={12} strokeLinecap="round" />
        )}
        {clampedScore > 0 && (
          <circle cx={dotX} cy={dotY} r={5} fill={color} stroke="#fff" strokeWidth={2} />
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="var(--font-display)" fontSize={42} fontWeight={700} fill="#1A1A1A">
          {clampedScore}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontFamily="var(--font-body)" fontSize={12} fill="#888">
          Bordik Score
        </text>
      </svg>
      <span
        className="-mt-2 py-1 px-[14px] rounded-[20px] bg-[var(--label-bg)] font-[var(--font-body)] text-xs font-semibold text-[var(--label-color)]"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic palette tied to score band
        style={{ ['--label-bg' as string]: labelBg, ['--label-color' as string]: labelColor }}
      >
        {label}
      </span>
    </div>
  );
}

interface MiniScoreProps {
  value: number;
  max: number;
  color: string;
}

export function MiniScore({ value, max, color }: MiniScoreProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const r = 16, stroke = 3;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="relative w-10 h-10 shrink-0">
      <svg width={40} height={40} viewBox="0 0 40 40" className="-rotate-90">
        <circle cx={20} cy={20} r={r} fill="none" stroke="#EAECF0" strokeWidth={stroke} />
        <circle cx={20} cy={20} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-[var(--font-display)] text-[11px] font-bold text-[#1A1A1A]">
        {pct}
      </span>
    </div>
  );
}

interface MetricCardProps {
  value: number;
  max: number;
  title: string;
  description: string;
  impact: string;
  impactColor: string;
  impactBg: string;
  circleColor: string;
}

export function MetricCard({
  value, max, title, description, impact, impactColor, impactBg, circleColor,
}: MetricCardProps) {
  return (
    <div className="flex items-center gap-4 py-4 px-5 bg-[#F5F6F8] rounded-[14px]">
      <MiniScore value={value} max={max} color={circleColor} />
      <div className="flex-1 min-w-0">
        <p className="font-[var(--font-display)] text-sm font-semibold text-[#1A1A1A]">
          {title}
        </p>
        <p className="font-[var(--font-body)] text-xs text-[#888] mt-0.5">
          {description}
        </p>
      </div>
      <span
        className="py-1 px-3 rounded-[20px] shrink-0 font-[var(--font-body)] text-[11px] font-semibold text-[var(--impact-color)] bg-[var(--impact-bg)]"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic palette per metric
        style={{ ['--impact-color' as string]: impactColor, ['--impact-bg' as string]: impactBg }}
      >
        {impact}
      </span>
    </div>
  );
}
