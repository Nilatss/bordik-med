'use client';

/**
 * Графики роста новорождённых — Fenton 2013 для недоношенных.
 *
 * UI:
 *   - селектор стандарта (пока Fenton, в roadmap WHO 0-24mo + INTERGROWTH)
 *   - селектор параметра (вес / длина / окружность головы) — показывается
 *     только тот, для которого в датасете есть данные
 *   - селектор пола
 *   - ввод гестационного возраста (PMA, недели)
 *   - ввод измеренного значения
 *   - вывод: процентиль + Z-score + клиническая интерпретация
 *   - SVG-график: пять опорных кривых (P3/P10/P50/P90/P97) + точка пользователя
 *
 * Lazy-loaded JSON через fetch + force-cache; SW-кэш покрывает offline.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  type GrowthBank,
  type GrowthDataset,
  type GrowthParameter,
  type Sex,
  type ReferencePercentile,
  REFERENCE_PERCENTILES,
  PARAMETER_LABEL_RU,
  PARAMETER_UNIT,
  SEX_LABEL_RU,
  buildChartCurves,
  lmsAt,
  zScoreFromValue,
  percentileFromZ,
  interpretZ,
} from '@/lib/neonatal-growth';

const PERCENTILE_COLORS: Record<ReferencePercentile, string> = {
  3:  '#EF4444',
  10: '#F59E0B',
  50: '#2563EB',
  90: '#F59E0B',
  97: '#EF4444',
};

export default function GrowthCharts() {
  const [bank, setBank] = useState<GrowthBank | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [datasetKey, setDatasetKey] = useState<string>('fenton2013');
  const [parameter, setParameter] = useState<GrowthParameter>('weight');
  const [sex, setSex] = useState<Sex>('boys');
  const [age, setAge] = useState<string>('32');
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/neonatal-growth.json?v=0.1.0', { cache: 'force-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json: GrowthBank = await r.json();
        if (!cancelled) setBank(json);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div style={{
        padding: 24, borderRadius: 12, background: '#FEF2F2',
        border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить графики роста: {error}.
      </div>
    );
  }

  if (!bank) {
    return (
      <div style={{ padding: '8px 0' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 64, width: '100%', maxWidth: 480, borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 320, width: '100%', borderRadius: 12 }} />
      </div>
    );
  }

  const dataset: GrowthDataset | undefined = bank.datasets[datasetKey];
  if (!dataset) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <DatasetSelector
        bank={bank}
        active={datasetKey}
        onChange={(k) => {
          setDatasetKey(k);
          // Сбрасываем параметр если в новом датасете его нет
          const next = bank.datasets[k];
          if (next && !next.parameters.includes(parameter)) {
            setParameter(next.parameters[0] ?? 'weight');
          }
        }}
      />

      <ControlsPanel
        dataset={dataset}
        parameter={parameter}
        setParameter={setParameter}
        sex={sex}
        setSex={setSex}
        age={age}
        setAge={setAge}
        value={value}
        setValue={setValue}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(260px, 1fr)',
        gap: 16,
        alignItems: 'stretch',
      }}>
        <ChartView
          dataset={dataset}
          parameter={parameter}
          sex={sex}
          age={age}
          value={value}
        />
        <ResultPanel
          dataset={dataset}
          parameter={parameter}
          sex={sex}
          age={age}
          value={value}
        />
      </div>
    </div>
  );
}

function DatasetSelector({
  bank, active, onChange,
}: {
  bank: GrowthBank;
  active: string;
  onChange: (key: string) => void;
}) {
  const keys = Object.keys(bank.datasets);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {keys.map((k) => {
        const ds = bank.datasets[k];
        if (!ds) return null;
        const isActive = active === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            style={{
              padding: '8px 14px',
              background: isActive ? '#2563EB' : '#F5F6F8',
              color: isActive ? '#FFFFFF' : '#374151',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600,
              transition: 'background 150ms',
            }}
          >
            {ds.label_ru}
          </button>
        );
      })}
    </div>
  );
}

function ControlsPanel({
  dataset, parameter, setParameter, sex, setSex, age, setAge, value, setValue,
}: {
  dataset: GrowthDataset;
  parameter: GrowthParameter;
  setParameter: (p: GrowthParameter) => void;
  sex: Sex;
  setSex: (s: Sex) => void;
  age: string;
  setAge: (s: string) => void;
  value: string;
  setValue: (s: string) => void;
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12,
      padding: 16,
      background: '#F5F6F8',
      borderRadius: 12,
    }}>
      <ControlField label="Параметр">
        <select
          value={parameter}
          onChange={(e) => setParameter(e.target.value as GrowthParameter)}
          style={selectStyle}
        >
          {dataset.parameters.map((p) => (
            <option key={p} value={p}>{PARAMETER_LABEL_RU[p]}</option>
          ))}
        </select>
      </ControlField>

      <ControlField label="Пол">
        <select
          value={sex}
          onChange={(e) => setSex(e.target.value as Sex)}
          style={selectStyle}
        >
          <option value="boys">{SEX_LABEL_RU.boys}</option>
          <option value="girls">{SEX_LABEL_RU.girls}</option>
        </select>
      </ControlField>

      <ControlField
        label={dataset.ageType === 'postmenstrual' ? 'PMA, недели' : 'Возраст, недели'}
        hint={`${dataset.ageMin}–${dataset.ageMax}`}
      >
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min={dataset.ageMin}
          max={dataset.ageMax}
          step={0.1}
          style={inputStyle}
        />
      </ControlField>

      <ControlField
        label={`${PARAMETER_LABEL_RU[parameter]}, ${PARAMETER_UNIT[parameter]}`}
        hint="ваш замер"
      >
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          step={parameter === 'weight' ? 1 : 0.1}
          min={0}
          style={inputStyle}
          placeholder="—"
        />
      </ControlField>
    </div>
  );
}

function ControlField({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: '#6B7280',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span>{label}</span>
        {hint && <span style={{
          fontWeight: 400, color: '#9CA3AF', textTransform: 'none', letterSpacing: 0,
        }}>{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  color: '#1A1A1A',
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

function ResultPanel({
  dataset, parameter, sex, age, value,
}: {
  dataset: GrowthDataset;
  parameter: GrowthParameter;
  sex: Sex;
  age: string;
  value: string;
}) {
  const result = useMemo(() => {
    const ageNum = parseFloat(age);
    const valNum = parseFloat(value);
    if (!isFinite(ageNum) || !isFinite(valNum) || valNum <= 0) return null;

    const points = dataset.data[sex][parameter] ?? [];
    const lms = lmsAt(points, ageNum);
    if (!lms) return null;

    const z = zScoreFromValue(valNum, lms);
    const pct = percentileFromZ(z);
    const interp = interpretZ(z);
    return { z, pct, interp, M: lms.M };
  }, [dataset, parameter, sex, age, value]);

  if (!result) {
    return (
      <div style={{
        padding: '20px 18px', background: '#FFFFFF',
        border: '1px dashed #E5E7EB', borderRadius: 12,
        color: '#9CA3AF', fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', minHeight: 200,
      }}>
        Введите PMA и измеренное значение — рассчитаем перцентиль и Z-score.
      </div>
    );
  }

  const toneBg = {
    critical: '#FEF2F2',
    warning: '#FFFBEB',
    high: '#FFFBEB',
    ok: '#ECFDF5',
  }[result.interp.tone];
  const toneText = {
    critical: '#991B1B',
    warning: '#92400E',
    high: '#92400E',
    ok: '#065F46',
  }[result.interp.tone];
  const toneAccent = {
    critical: '#EF4444',
    warning: '#F59E0B',
    high: '#F59E0B',
    ok: '#10B981',
  }[result.interp.tone];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <ResultCard label="Перцентиль" value={`P${formatPercentile(result.pct)}`} sub={`Z-score = ${result.z.toFixed(2)}`} />
      <ResultCard label="Медиана (P50)" value={`${result.M.toFixed(parameter === 'weight' ? 0 : 1)}`} sub={PARAMETER_UNIT[parameter]} />
      <div style={{
        padding: '12px 14px',
        background: toneBg,
        borderLeft: `4px solid ${toneAccent}`,
        borderRadius: 10,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: toneText, opacity: 0.85,
          letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4,
        }}>
          Интерпретация
        </div>
        <div style={{
          fontSize: 14, fontWeight: 600, color: toneText,
          fontFamily: 'var(--font-display)', letterSpacing: '-0.005em',
          lineHeight: 1.35,
        }}>
          {result.interp.label}
        </div>
      </div>
    </div>
  );
}

function formatPercentile(p: number): string {
  if (p < 1) return p.toFixed(2);
  if (p < 10) return p.toFixed(1);
  if (p > 99) return p.toFixed(2);
  return Math.round(p).toString();
}

function ResultCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      padding: '12px 16px',
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#9CA3AF',
        letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
        color: '#111827', letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

/** Catmull-Rom через cubic Bezier — даёт плавную кривую через все точки.
 *  Используем для биологических кривых (рост, билирубин), где данные
 *  должны выглядеть как непрерывная функция, а не ломаная linear-интерполяция. */
function smoothPath(pts: Array<{ x: number; y: number }>): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0]!.x} ${pts[0]!.y}`;
  if (pts.length === 2) return `M ${pts[0]!.x} ${pts[0]!.y} L ${pts[1]!.x} ${pts[1]!.y}`;
  const tension = 0.5;
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function ChartView({
  dataset, parameter, sex, age, value,
}: {
  dataset: GrowthDataset;
  parameter: GrowthParameter;
  sex: Sex;
  age: string;
  value: string;
}) {
  const points = dataset.data[sex][parameter] ?? [];
  const curves = useMemo(() => buildChartCurves(points), [points]);

  if (curves.length === 0) return null;

  // Bounds from data
  const minAge = points[0]?.age ?? dataset.ageMin;
  const maxAge = points[points.length - 1]?.age ?? dataset.ageMax;
  const allValues = curves.flatMap((c) => c.points.map((p) => p.value));
  const minVal = Math.min(...allValues) * 0.92;
  const maxVal = Math.max(...allValues) * 1.06;

  // SVG layout — компактнее (было 720×360, теперь 560×320)
  const width = 560;
  const height = 320;
  const margin = { top: 24, right: 44, bottom: 40, left: 52 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xScale = (a: number) => ((a - minAge) / (maxAge - minAge)) * innerW;
  const yScale = (v: number) => innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const userAge = parseFloat(age);
  const userVal = parseFloat(value);
  const showUserPoint = isFinite(userAge) && isFinite(userVal) && userVal > 0
    && userAge >= minAge && userAge <= maxAge;

  // Y-axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => minVal + (maxVal - minVal) * (i / 4));
  const xStep = Math.ceil((maxAge - minAge) / 7 / 2) * 2;
  const xTicks: number[] = [];
  for (let a = Math.ceil(minAge / xStep) * xStep; a <= maxAge; a += xStep) {
    xTicks.push(a);
  }

  const fmtY = (t: number): string => parameter === 'weight'
    ? (t >= 1000 ? `${(t / 1000).toFixed(1)} кг` : `${Math.round(t)}`)
    : t.toFixed(0);

  return (
    <div style={{
      padding: '14px 16px 12px',
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
          color: '#111827', letterSpacing: '-0.01em',
        }}>
          {PARAMETER_LABEL_RU[parameter]} ({PARAMETER_UNIT[parameter]})
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
          {SEX_LABEL_RU[sex]} · {dataset.label_ru}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}
        role="img" aria-label={`График ${PARAMETER_LABEL_RU[parameter]}`}>
        <defs>
          <linearGradient id="growth-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Plot area background */}
          <rect x={0} y={0} width={innerW} height={innerH} fill="url(#growth-bg)" rx={4} />

          {/* Grid Y */}
          {yTicks.map((t, i) => (
            <g key={`y-${i}`}>
              <line
                x1={0} x2={innerW} y1={yScale(t)} y2={yScale(t)}
                stroke="#EAECEF" strokeWidth={1} strokeDasharray={i === 0 || i === yTicks.length - 1 ? 'none' : '2 4'}
              />
              <text
                x={-10} y={yScale(t)} dy="0.32em" textAnchor="end"
                fontSize={10} fill="#9CA3AF"
              >
                {fmtY(t)}
              </text>
            </g>
          ))}
          {/* Grid X */}
          {xTicks.map((t, i) => (
            <g key={`x-${i}`}>
              <line
                x1={xScale(t)} x2={xScale(t)} y1={0} y2={innerH}
                stroke="#EAECEF" strokeWidth={1} strokeDasharray="2 4"
              />
              <text
                x={xScale(t)} y={innerH + 16} textAnchor="middle"
                fontSize={10} fill="#9CA3AF"
              >
                {t}
              </text>
            </g>
          ))}

          {/* Reference curves — smooth Bezier */}
          {curves.map((c) => {
            const isMedian = c.percentile === 50;
            const path = smoothPath(c.points.map((p) => ({ x: xScale(p.age), y: yScale(p.value) })));
            return (
              <path
                key={c.percentile}
                d={path}
                fill="none"
                stroke={PERCENTILE_COLORS[c.percentile]}
                strokeWidth={isMedian ? 2.2 : 1.2}
                strokeOpacity={isMedian ? 1 : 0.55}
                strokeDasharray={isMedian ? 'none' : '3 3'}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Curve labels (right edge) */}
          {curves.map((c) => {
            const last = c.points[c.points.length - 1];
            if (!last) return null;
            const isMedian = c.percentile === 50;
            return (
              <text
                key={`label-${c.percentile}`}
                x={xScale(last.age) + 6}
                y={yScale(last.value)}
                dy="0.32em"
                fontSize={9}
                fill={PERCENTILE_COLORS[c.percentile]}
                fontFamily="var(--font-mono, ui-monospace)"
                fontWeight={isMedian ? 700 : 600}
              >
                P{c.percentile}
              </text>
            );
          })}

          {/* User point — пунктирная линия + кружок с halo */}
          {showUserPoint && (
            <g>
              <line
                x1={xScale(userAge)} x2={xScale(userAge)}
                y1={0} y2={innerH}
                stroke="#111827" strokeWidth={1} strokeDasharray="2 3" opacity={0.25}
              />
              <line
                x1={0} x2={innerW}
                y1={yScale(userVal)} y2={yScale(userVal)}
                stroke="#111827" strokeWidth={1} strokeDasharray="2 3" opacity={0.25}
              />
              <circle cx={xScale(userAge)} cy={yScale(userVal)} r={9} fill="#111827" opacity={0.12} />
              <circle cx={xScale(userAge)} cy={yScale(userVal)} r={5} fill="#111827" stroke="#FFFFFF" strokeWidth={2} />
            </g>
          )}

          {/* X-axis label */}
          <text
            x={innerW / 2} y={innerH + 32} textAnchor="middle"
            fontSize={10} fill="#6B7280" fontWeight={500}
          >
            {dataset.ageType === 'postmenstrual' ? 'PMA' : 'Возраст'}, недели
          </text>
        </g>
      </svg>
    </div>
  );
}

