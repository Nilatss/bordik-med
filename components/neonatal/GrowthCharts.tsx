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

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type GrowthBank,
  type GrowthDataset,
  type GrowthParameter,
  type Sex,
  type ReferencePercentile,
  REFERENCE_PERCENTILES,
  PERCENTILE_TO_Z,
  PARAMETER_LABEL_RU,
  PARAMETER_UNIT,
  SEX_LABEL_RU,
  buildChartCurves,
  lmsAt,
  valueFromZ,
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

      <div className="neo-chart-split">
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
      gap: 10,
      padding: 18,
      background: '#F5F6F8',
      borderRadius: 14,
    }}>
      <ControlField label="Параметр">
        <BordikSelect
          value={parameter}
          onChange={(v) => setParameter(v as GrowthParameter)}
          options={dataset.parameters.map((p) => ({ value: p, label: PARAMETER_LABEL_RU[p] }))}
        />
      </ControlField>

      <ControlField label="Пол">
        <BordikSelect
          value={sex}
          onChange={(v) => setSex(v as Sex)}
          options={[
            { value: 'boys', label: SEX_LABEL_RU.boys },
            { value: 'girls', label: SEX_LABEL_RU.girls },
          ]}
        />
      </ControlField>

      <ControlField
        label={dataset.ageType === 'postmenstrual' ? 'PMA, недели' : 'Возраст, недели'}
        hint={`${dataset.ageMin}–${dataset.ageMax}`}
      >
        <BordikNumberInput
          value={age}
          onChange={setAge}
          min={dataset.ageMin}
          max={dataset.ageMax}
          step={0.1}
        />
      </ControlField>

      <ControlField
        label={`${PARAMETER_LABEL_RU[parameter]}, ${PARAMETER_UNIT[parameter]}`}
        hint="ваш замер"
      >
        <BordikNumberInput
          value={value}
          onChange={setValue}
          min={0}
          step={parameter === 'weight' ? 1 : 0.1}
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
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: '#6B7280',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {label}
      </span>
      {children}
      {hint && (
        <span style={{
          fontSize: 11, fontWeight: 400, color: '#9CA3AF',
          marginTop: 2,
        }}>
          {hint}
        </span>
      )}
    </label>
  );
}

/** Bordik-стайл инпут — белая pill-обёртка + focus ring через .bordik-search. */
function BordikNumberInput({
  value, onChange, min, max, step, placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
    type: 'number',
    value,
    onChange: (e) => onChange(e.target.value),
    inputMode: 'decimal',
    style: {
      width: '100%',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: 0,
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 500,
      color: '#111827',
    },
  };
  if (min !== undefined) inputProps.min = min;
  if (max !== undefined) inputProps.max = max;
  if (step !== undefined) inputProps.step = step;
  if (placeholder !== undefined) inputProps.placeholder = placeholder;
  return (
    <div className="bordik-search" style={{
      padding: '10px 12px',
      background: '#FFFFFF',
      borderRadius: 10,
      transition: 'background 140ms ease, box-shadow 140ms ease',
      minHeight: 40,
      display: 'flex', alignItems: 'center',
    }}>
      <input {...inputProps} />
    </div>
  );
}

/** Bordik-стайл select — кастомный chevron, такая же pill-обёртка. */
/** Полностью кастомный dropdown — native <option> нельзя стилизовать,
 *  браузер рендерит system-UI dropdown с белым фоном и синей подсветкой
 *  выбранной опции. Делаем через button + floating list. */
function BordikSelect({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Click-outside / Escape — закрыть dropdown
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8,
          padding: '10px 12px',
          minHeight: 40,
          background: '#FFFFFF',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 14, fontWeight: 500,
          color: '#111827',
          textAlign: 'left',
          boxShadow: open
            ? '0 0 0 1px #2563EB, 0 0 0 4px rgba(37, 99, 235, 0.14)'
            : 'none',
          transition: 'box-shadow 140ms ease',
        }}
      >
        <span>{current?.label ?? '—'}</span>
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 150ms ease',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul role="listbox" style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          margin: 0,
          padding: 4,
          listStyle: 'none',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.06)',
          zIndex: 20,
          maxHeight: 280,
          overflowY: 'auto',
        }}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  fontSize: 14, fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? '#1D4ED8' : '#374151',
                  background: isSelected ? '#EFF6FF' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 100ms ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#F5F6F8';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke="#1D4ED8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}


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

  const medianStr = `${result.M.toFixed(parameter === 'weight' ? 0 : 1)} ${PARAMETER_UNIT[parameter]}`;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* 2 метрики в один ряд: основная (Перцентиль, primary) + контекстная (Медиана) */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        <ResultCard
          label="Перцентиль"
          value={`P${formatPercentile(result.pct)}`}
          sub={`Z-score: ${result.z >= 0 ? '+' : ''}${result.z.toFixed(2)}`}
          accent
        />
        <ResultCard
          label="Норма (P50)"
          value={medianStr}
          sub={`для ${parseFloat(age).toFixed(1)} нед`}
        />
      </div>

      {/* Развёрнутая клиническая интерпретация */}
      <div style={{
        padding: '14px 16px',
        background: toneBg,
        borderLeft: `4px solid ${toneAccent}`,
        borderRadius: 10,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: toneText, opacity: 0.85,
          letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6,
        }}>
          Клиническая интерпретация
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
          color: toneText, letterSpacing: '-0.005em',
          lineHeight: 1.4, marginBottom: 8,
        }}>
          {result.interp.label}
        </div>
        <p style={{
          margin: 0, fontSize: 13, color: toneText, opacity: 0.92,
          lineHeight: 1.55,
        }}>
          {result.interp.detail}
        </p>
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: `1px solid ${toneAccent}33`,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: toneText, opacity: 0.7,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3,
          }}>
            Рекомендация
          </div>
          <div style={{
            fontSize: 12, color: toneText, opacity: 0.92, lineHeight: 1.55,
          }}>
            {result.interp.recommendation}
          </div>
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 10, color: toneText, opacity: 0.6,
          fontStyle: 'italic', lineHeight: 1.45,
        }}>
          Источник классификации: {result.interp.reference}
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

function ResultCard({
  label, value, sub, accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div style={{
      padding: '12px 14px',
      background: accent ? '#EFF6FF' : '#FFFFFF',
      border: `1px solid ${accent ? '#BFDBFE' : '#E5E7EB'}`,
      borderRadius: 12,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: accent ? '#1D4ED8' : '#9CA3AF',
        letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
        color: accent ? '#1E3A8A' : '#111827', letterSpacing: '-0.02em',
        lineHeight: 1.15,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontSize: 11, color: accent ? '#3B82F6' : '#6B7280',
          marginTop: 4, fontFamily: 'var(--font-mono, ui-monospace)',
        }}>
          {sub}
        </div>
      )}
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
  const [hoverAge, setHoverAge] = useState<number | null>(null);

  if (curves.length === 0) return null;

  // Bounds from data
  const minAge = points[0]?.age ?? dataset.ageMin;
  const maxAge = points[points.length - 1]?.age ?? dataset.ageMax;
  const allValues = curves.flatMap((c) => c.points.map((p) => p.value));
  const minVal = Math.min(...allValues) * 0.92;
  const maxVal = Math.max(...allValues) * 1.06;

  // SVG layout — узкие margins для максимума plot-area
  const width = 560;
  const height = 320;
  const margin = { top: 16, right: 38, bottom: 36, left: 44 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xScale = (a: number) => ((a - minAge) / (maxAge - minAge)) * innerW;
  const yScale = (v: number) => innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const userAge = parseFloat(age);
  const userVal = parseFloat(value);
  const showUserPoint = isFinite(userAge) && isFinite(userVal) && userVal > 0
    && userAge >= minAge && userAge <= maxAge;

  // Y-axis ticks (5 равномерно)
  const yTicks = Array.from({ length: 5 }, (_, i) => minVal + (maxVal - minVal) * (i / 4));
  const xStep = Math.ceil((maxAge - minAge) / 7 / 2) * 2;
  const xTicks: number[] = [];
  for (let a = Math.ceil(minAge / xStep) * xStep; a <= maxAge; a += xStep) {
    xTicks.push(a);
  }

  // Y-formatter: вес — всегда кг с 1 знаком (раньше путались граммы и кг
  // на одной оси); длина / окружность головы — целые см
  const fmtY = (t: number): string => parameter === 'weight'
    ? `${(t / 1000).toFixed(1)} кг`
    : `${Math.round(t)} см`;

  return (
    <div style={{
      padding: '16px 18px 14px',
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative',
    }}>
      {/* Header — title + параметр + контекст */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8, marginBottom: 4,
        }}>
          <h3 style={{
            margin: 0,
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
            color: '#111827', letterSpacing: '-0.01em',
          }}>
            {PARAMETER_LABEL_RU[parameter]} по гестационному возрасту
          </h3>
          <div style={{
            fontSize: 11, color: '#9CA3AF',
            letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600,
            fontFamily: 'var(--font-mono, ui-monospace)',
          }}>
            {SEX_LABEL_RU[sex]} · {dataset.label_ru}
          </div>
        </div>
        <p style={{
          margin: 0, fontSize: 12, color: '#6B7280', lineHeight: 1.5,
        }}>
          Кривые показывают распределение значений среди здоровых сверстников.
          Перцентиль = % детей с показателем ниже этой линии.
        </p>
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
                x={-8} y={yScale(t)} dy="0.32em" textAnchor="end"
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

          {/* Reference curves — smooth Bezier
              Иерархия:
              - P50 — solid синий, 2.4px (медиана, primary)
              - P10/P90 — solid янтарный, 1.4px, opacity 0.7 (норма ±1 SD)
              - P3/P97 — пунктир красный, 1.3px, opacity 0.55 (граница внимания)
              Так визуально читается: solid линии = норма, пунктир = warning. */}
          {curves.map((c) => {
            const isMedian = c.percentile === 50;
            const isInner = c.percentile === 10 || c.percentile === 90;
            const path = smoothPath(c.points.map((p) => ({ x: xScale(p.age), y: yScale(p.value) })));
            return (
              <path
                key={c.percentile}
                d={path}
                fill="none"
                stroke={PERCENTILE_COLORS[c.percentile]}
                strokeWidth={isMedian ? 2.4 : isInner ? 1.4 : 1.3}
                strokeOpacity={isMedian ? 1 : isInner ? 0.7 : 0.55}
                strokeDasharray={isMedian || isInner ? 'none' : '4 3'}
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
                x={xScale(last.age) + 5}
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

          {/* Hover guide line + dots */}
          {hoverAge != null && (() => {
            const lms = lmsAt(points, hoverAge);
            if (!lms) return null;
            const hx = xScale(hoverAge);
            return (
              <g pointerEvents="none">
                <line x1={hx} x2={hx} y1={0} y2={innerH} stroke="#111827" strokeWidth={1} opacity={0.35} />
                {curves.map((c) => {
                  const v = valueFromZ(PERCENTILE_TO_Z[c.percentile], lms);
                  return (
                    <circle
                      key={`hover-${c.percentile}`}
                      cx={hx} cy={yScale(v)} r={c.percentile === 50 ? 4 : 3}
                      fill={PERCENTILE_COLORS[c.percentile]}
                      stroke="#FFFFFF" strokeWidth={1.5}
                    />
                  );
                })}
              </g>
            );
          })()}

          {/* Mouse capture overlay (transparent) */}
          <rect
            x={0} y={0} width={innerW} height={innerH}
            fill="transparent"
            onMouseMove={(e) => {
              const svg = e.currentTarget.ownerSVGElement;
              if (!svg) return;
              const ctm = svg.getScreenCTM();
              if (!ctm) return;
              const pt = svg.createSVGPoint();
              pt.x = e.clientX;
              pt.y = e.clientY;
              const local = pt.matrixTransform(ctm.inverse());
              const innerX = local.x - margin.left;
              const a = minAge + (innerX / innerW) * (maxAge - minAge);
              if (a >= minAge && a <= maxAge) setHoverAge(a);
              else setHoverAge(null);
            }}
            onMouseLeave={() => setHoverAge(null)}
          />

          {/* X-axis label */}
          <text
            x={innerW / 2} y={innerH + 30} textAnchor="middle"
            fontSize={10} fill="#6B7280" fontWeight={500}
            pointerEvents="none"
          >
            {dataset.ageType === 'postmenstrual' ? 'PMA' : 'Возраст'}, недели
          </text>
        </g>
      </svg>

      {/* Легенда — объясняет что значит каждая линия */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 18px',
        padding: '10px 12px',
        background: '#F9FAFB',
        borderRadius: 8,
        fontSize: 11.5, color: '#4B5563', lineHeight: 1.5,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 22, height: 2.5, background: PERCENTILE_COLORS[50], borderRadius: 1 }} />
          <strong style={{ color: '#111827', fontWeight: 600 }}>P50</strong>
          <span>— медиана, типичное значение</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 22, height: 2, background: PERCENTILE_COLORS[10], borderRadius: 1, opacity: 0.7 }} />
          <strong style={{ color: '#111827', fontWeight: 600 }}>P10–P90</strong>
          <span>— широкая норма (~80% сверстников)</span>
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block', width: 22, height: 0,
            borderTop: `2px dashed ${PERCENTILE_COLORS[3]}`,
            opacity: 0.7,
          }} />
          <strong style={{ color: '#111827', fontWeight: 600 }}>P3 / P97</strong>
          <span>— границы внимания (≤3% или ≥97% сверстников)</span>
        </span>
      </div>

      {/* Hover tooltip — HTML overlay над SVG */}
      {hoverAge != null && (() => {
        const lms = lmsAt(points, hoverAge);
        if (!lms) return null;
        const tooltipLeftPct = ((margin.left + xScale(hoverAge)) / width) * 100;
        const isRightHalf = tooltipLeftPct > 60;
        return (
          <div className="neo-chart-tooltip" style={{
            left: `${tooltipLeftPct}%`,
            top: `${(margin.top / height) * 100 + 2}%`,
            transform: isRightHalf ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13, fontWeight: 600, color: '#111827',
              marginBottom: 8, letterSpacing: '-0.005em',
            }}>
              {hoverAge.toFixed(1)} нед {dataset.ageType === 'postmenstrual' ? 'PMA' : ''}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {curves.map((c) => {
                const v = valueFromZ(PERCENTILE_TO_Z[c.percentile], lms);
                return (
                  <div key={c.percentile} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 12,
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: PERCENTILE_COLORS[c.percentile],
                      flexShrink: 0,
                    }} />
                    <span style={{ color: '#6B7280', minWidth: 32, fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 11 }}>
                      P{c.percentile}
                    </span>
                    <span style={{ color: '#111827', fontWeight: 600, marginLeft: 'auto' }}>
                      {parameter === 'weight' && v >= 1000 ? `${(v / 1000).toFixed(2)} кг` : `${v.toFixed(parameter === 'weight' ? 0 : 1)} ${PARAMETER_UNIT[parameter]}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

