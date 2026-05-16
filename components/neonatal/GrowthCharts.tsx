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
      <div className="p-6 rounded-[12px] bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
        Не удалось загрузить графики роста: {error}.
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="py-2">
        <div className="lc-shimmer h-7 w-60 rounded-lg mb-[14px]" />
        <div className="lc-shimmer h-16 w-full max-w-[480px] rounded-[12px] mb-3" />
        <div className="lc-shimmer h-[320px] w-full rounded-[12px]" />
      </div>
    );
  }

  const dataset: GrowthDataset | undefined = bank.datasets[datasetKey];
  if (!dataset) return null;

  return (
    <div className="flex flex-col gap-[18px]">
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
    <div className="flex gap-2 flex-wrap">
      {keys.map((k) => {
        const ds = bank.datasets[k];
        if (!ds) return null;
        const isActive = active === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={`py-2 px-3.5 border-none rounded-full cursor-pointer font-[inherit] text-[13px] font-semibold transition-colors duration-150 ${
              isActive ? 'bg-[#2563EB] text-white' : 'bg-[#F5F6F8] text-[#374151]'
            }`}
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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2.5 p-[18px] bg-[#F5F6F8] rounded-[14px]">
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
    <label className="flex flex-col gap-[5px]">
      <span className="text-[11px] font-semibold text-[#6B7280] tracking-[0.04em] uppercase">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[11px] font-normal text-[#9CA3AF] mt-0.5">
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
    className: 'w-full bg-transparent border-none outline-none p-0 font-[inherit] text-sm font-medium text-[#111827]',
  };
  if (min !== undefined) inputProps.min = min;
  if (max !== undefined) inputProps.max = max;
  if (step !== undefined) inputProps.step = step;
  if (placeholder !== undefined) inputProps.placeholder = placeholder;
  return (
    <div className="bordik-search py-2.5 px-3 bg-white rounded-[10px] transition-[background,box-shadow] duration-[140ms] min-h-10 flex items-center">
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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 py-2.5 px-3 min-h-10 bg-white border-none rounded-[10px] cursor-pointer font-[inherit] text-sm font-medium text-[#111827] text-left transition-shadow duration-[140ms] ${open ? 'shadow-[0_0_0_1px_#2563EB,0_0_0_4px_rgba(37,99,235,0.14)]' : ''}`}
      >
        <span>{current?.label ?? '—'}</span>
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul role="listbox" className="absolute top-[calc(100%+4px)] left-0 right-0 m-0 p-1 list-none bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_8px_24px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)] z-20 max-h-[280px] overflow-y-auto">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`py-2 px-2.5 rounded-md text-sm cursor-pointer flex items-center justify-between transition-colors duration-100 ${
                  isSelected
                    ? 'font-semibold text-[#1D4ED8] bg-[#EFF6FF]'
                    : 'font-medium text-[#374151] bg-transparent hover:bg-[#F5F6F8]'
                }`}
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
      <div className="py-5 px-[18px] bg-white border border-dashed border-[#E5E7EB] rounded-[12px] text-[#9CA3AF] text-[13px] flex items-center justify-center text-center min-h-[200px]">
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
    <div className="flex flex-col gap-3">
      {/* 2 метрики в один ряд: основная (Перцентиль, primary) + контекстная (Медиана) */}
      <div className="grid grid-cols-2 gap-2.5">
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
      <div
        className="py-[14px] px-4 bg-[var(--tone-bg)] border-l-4 border-[var(--tone-accent)] rounded-[10px]"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic tone palette
        style={{
          ['--tone-bg' as string]: toneBg,
          ['--tone-accent' as string]: toneAccent,
        }}
      >
        <div
          className="text-[11px] font-bold opacity-85 tracking-[0.04em] uppercase mb-1.5 text-[var(--tone-text)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text color
          style={{ ['--tone-text' as string]: toneText }}
        >
          Клиническая интерпретация
        </div>
        <div
          className="font-[var(--font-display)] text-[15px] font-semibold tracking-[-0.005em] leading-[1.4] mb-2 text-[var(--tone-text)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text color
          style={{ ['--tone-text' as string]: toneText }}
        >
          {result.interp.label}
        </div>
        <p
          className="m-0 text-[13px] opacity-90 leading-[1.55] text-[var(--tone-text)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text color
          style={{ ['--tone-text' as string]: toneText }}
        >
          {result.interp.detail}
        </p>
        <div
          className="mt-2.5 pt-2.5 border-t border-[var(--tone-divider)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone divider with alpha
          style={{ ['--tone-divider' as string]: `${toneAccent}33` }}
        >
          <div
            className="text-[10px] font-bold opacity-70 tracking-[0.06em] uppercase mb-[3px] text-[var(--tone-text)]"
            // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text color
            style={{ ['--tone-text' as string]: toneText }}
          >
            Рекомендация
          </div>
          <div
            className="text-xs opacity-90 leading-[1.55] text-[var(--tone-text)]"
            // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text color
            style={{ ['--tone-text' as string]: toneText }}
          >
            {result.interp.recommendation}
          </div>
        </div>
        <div
          className="mt-2 text-[10px] opacity-60 italic leading-[1.45] text-[var(--tone-text)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text color
          style={{ ['--tone-text' as string]: toneText }}
        >
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
    <div className={`py-3 px-3.5 rounded-[12px] border ${accent ? 'bg-[#EFF6FF] border-[#BFDBFE]' : 'bg-white border-[#E5E7EB]'}`}>
      <div className={`text-[11px] font-semibold tracking-[0.04em] uppercase mb-1 ${accent ? 'text-[#1D4ED8]' : 'text-[#9CA3AF]'}`}>
        {label}
      </div>
      <div className={`font-[var(--font-display)] text-[22px] font-bold tracking-[-0.02em] leading-[1.15] ${accent ? 'text-[#1E3A8A]' : 'text-[#111827]'}`}>
        {value}
      </div>
      {sub && (
        <div className={`text-[11px] mt-1 font-[var(--font-mono,ui-monospace)] ${accent ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`}>
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
    <div className="pt-4 px-[18px] pb-[14px] bg-white border border-[#E5E7EB] rounded-[12px] flex flex-col gap-3 relative">
      {/* Header — title + параметр + контекст */}
      <div>
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
          <h3 className="m-0 font-[var(--font-display)] text-base font-semibold text-[#111827] tracking-[-0.01em]">
            {PARAMETER_LABEL_RU[parameter]} по гестационному возрасту
          </h3>
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.04em] uppercase font-semibold font-[var(--font-mono,ui-monospace)]">
            {SEX_LABEL_RU[sex]} · {dataset.label_ru}
          </div>
        </div>
        <p className="m-0 text-xs text-[#6B7280] leading-[1.5]">
          Кривые показывают распределение значений среди здоровых сверстников.
          Перцентиль = % детей с показателем ниже этой линии.
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto"
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
      <div className="flex flex-wrap gap-x-[18px] gap-y-2 py-2.5 px-3 bg-[#F9FAFB] rounded-lg text-[11.5px] text-[#4B5563] leading-[1.5]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-[22px] h-[2.5px] rounded-[1px] bg-[var(--legend-color)]"
            // eslint-disable-next-line react/forbid-dom-props -- legend swatch palette
            style={{ ['--legend-color' as string]: PERCENTILE_COLORS[50] }}
          />
          <strong className="text-[#111827] font-semibold">P50</strong>
          <span>— медиана, типичное значение</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-[22px] h-0.5 rounded-[1px] opacity-70 bg-[var(--legend-color)]"
            // eslint-disable-next-line react/forbid-dom-props -- legend swatch palette
            style={{ ['--legend-color' as string]: PERCENTILE_COLORS[10] }}
          />
          <strong className="text-[#111827] font-semibold">P10–P90</strong>
          <span>— широкая норма (~80% сверстников)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-[22px] h-0 opacity-70 border-t-2 border-dashed border-[var(--legend-color)]"
            // eslint-disable-next-line react/forbid-dom-props -- legend swatch palette
            style={{ ['--legend-color' as string]: PERCENTILE_COLORS[3] }}
          />
          <strong className="text-[#111827] font-semibold">P3 / P97</strong>
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
          <div
            className={`neo-chart-tooltip left-[var(--tt-left)] top-[var(--tt-top)] ${isRightHalf ? '-translate-x-[calc(100%+12px)]' : 'translate-x-3'}`}
            // eslint-disable-next-line react/forbid-dom-props -- dynamic hover tooltip position via CSS-var
            style={{
              ['--tt-left' as string]: `${tooltipLeftPct}%`,
              ['--tt-top' as string]: `${(margin.top / height) * 100 + 2}%`,
            }}
          >
            <div className="font-[var(--font-display)] text-[13px] font-semibold text-[#111827] mb-2 tracking-[-0.005em]">
              {hoverAge.toFixed(1)} нед {dataset.ageType === 'postmenstrual' ? 'PMA' : ''}
            </div>
            <div className="flex flex-col gap-1">
              {curves.map((c) => {
                const v = valueFromZ(PERCENTILE_TO_Z[c.percentile], lms);
                return (
                  <div key={c.percentile} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 bg-[var(--curve-color)]"
                      // eslint-disable-next-line react/forbid-dom-props -- dynamic curve color
                      style={{ ['--curve-color' as string]: PERCENTILE_COLORS[c.percentile] }}
                    />
                    <span className="text-[#6B7280] min-w-[32px] font-[var(--font-mono,ui-monospace)] text-[11px]">
                      P{c.percentile}
                    </span>
                    <span className="text-[#111827] font-semibold ml-auto">
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

