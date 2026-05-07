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

      <ResultPanel
        dataset={dataset}
        parameter={parameter}
        sex={sex}
        age={age}
        value={value}
      />

      <ChartView
        dataset={dataset}
        parameter={parameter}
        sex={sex}
        age={age}
        value={value}
      />
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
        padding: '14px 18px', background: '#FFFFFF',
        border: '1px dashed #E5E7EB', borderRadius: 12,
        color: '#9CA3AF', fontSize: 13,
      }}>
        Введите PMA и измеренное значение — рассчитаем процентиль и Z-score.
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

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12,
    }}>
      <ResultCard label="Перцентиль" value={`P${formatPercentile(result.pct)}`} sub={`Z = ${result.z.toFixed(2)}`} />
      <ResultCard label="Медиана (P50)" value={`${result.M.toFixed(parameter === 'weight' ? 0 : 1)}`} sub={PARAMETER_UNIT[parameter]} />
      <div style={{
        padding: '12px 16px',
        background: toneBg,
        borderRadius: 12,
        gridColumn: 'span 2',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: toneText, opacity: 0.8,
          letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4,
        }}>
          Интерпретация
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: toneText }}>
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
  const maxVal = Math.max(...allValues) * 1.05;

  // SVG layout
  const width = 720;
  const height = 360;
  const margin = { top: 16, right: 24, bottom: 36, left: 56 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xScale = (a: number) => ((a - minAge) / (maxAge - minAge)) * innerW;
  const yScale = (v: number) => innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const userAge = parseFloat(age);
  const userVal = parseFloat(value);
  const showUserPoint = isFinite(userAge) && isFinite(userVal) && userVal > 0
    && userAge >= minAge && userAge <= maxAge;

  // Y-axis ticks (5 evenly spaced)
  const yTicks = Array.from({ length: 5 }, (_, i) => minVal + (maxVal - minVal) * (i / 4));
  // X-axis ticks: every 4 weeks for Fenton, max 8 ticks
  const xStep = Math.ceil((maxAge - minAge) / 8 / 2) * 2;
  const xTicks: number[] = [];
  for (let a = Math.ceil(minAge / xStep) * xStep; a <= maxAge; a += xStep) {
    xTicks.push(a);
  }

  return (
    <div style={{
      padding: 16,
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      overflow: 'auto',
    }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: 480 }}
        role="img" aria-label={`График роста ${PARAMETER_LABEL_RU[parameter]}`}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid Y */}
          {yTicks.map((t, i) => (
            <g key={`y-${i}`}>
              <line
                x1={0} x2={innerW} y1={yScale(t)} y2={yScale(t)}
                stroke="#F0F1F5" strokeWidth={1}
              />
              <text
                x={-8} y={yScale(t)} dy="0.32em" textAnchor="end"
                fontSize={11} fill="#9CA3AF" fontFamily="var(--font-mono, ui-monospace)"
              >
                {parameter === 'weight' ? Math.round(t) : t.toFixed(1)}
              </text>
            </g>
          ))}
          {/* Grid X */}
          {xTicks.map((t, i) => (
            <g key={`x-${i}`}>
              <line
                x1={xScale(t)} x2={xScale(t)} y1={0} y2={innerH}
                stroke="#F0F1F5" strokeWidth={1}
              />
              <text
                x={xScale(t)} y={innerH + 18} textAnchor="middle"
                fontSize={11} fill="#9CA3AF" fontFamily="var(--font-mono, ui-monospace)"
              >
                {t}
              </text>
            </g>
          ))}

          {/* Reference curves */}
          {curves.map((c) => (
            <polyline
              key={c.percentile}
              fill="none"
              stroke={PERCENTILE_COLORS[c.percentile]}
              strokeWidth={c.percentile === 50 ? 2.2 : 1.4}
              strokeOpacity={c.percentile === 50 ? 1 : 0.7}
              strokeDasharray={c.percentile === 50 ? 'none' : '4 3'}
              points={c.points.map((p) => `${xScale(p.age)},${yScale(p.value)}`).join(' ')}
            />
          ))}

          {/* Curve labels (right edge) */}
          {curves.map((c) => {
            const last = c.points[c.points.length - 1];
            if (!last) return null;
            return (
              <text
                key={`label-${c.percentile}`}
                x={xScale(last.age) + 4}
                y={yScale(last.value)}
                dy="0.32em"
                fontSize={10}
                fill={PERCENTILE_COLORS[c.percentile]}
                fontFamily="var(--font-mono, ui-monospace)"
                fontWeight={c.percentile === 50 ? 700 : 600}
              >
                P{c.percentile}
              </text>
            );
          })}

          {/* User point */}
          {showUserPoint && (
            <g>
              <line
                x1={xScale(userAge)} x2={xScale(userAge)}
                y1={0} y2={innerH}
                stroke="#111827" strokeWidth={1} strokeDasharray="2 3" opacity={0.3}
              />
              <circle
                cx={xScale(userAge)} cy={yScale(userVal)}
                r={6} fill="#111827" stroke="#FFFFFF" strokeWidth={2}
              />
            </g>
          )}

          {/* Axis labels */}
          <text
            x={innerW / 2} y={innerH + 32} textAnchor="middle"
            fontSize={11} fill="#6B7280"
          >
            {dataset.ageType === 'postmenstrual' ? 'PMA' : 'Возраст'}, недели
          </text>
        </g>
      </svg>
    </div>
  );
}

