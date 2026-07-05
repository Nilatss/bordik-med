'use client';

/**
 * Bilirubin Nomogram (AAP 2022) — decision support для гипербилирубинемии у
 * новорождённых ≥ 35 нед GA. Возраст 0–336 ч (14 сут).
 *
 * UI:
 *   - GA в неделях
 *   - часы жизни
 *   - TSB в mg/dL или μmol/L (переключатель единиц)
 *   - чекбоксы факторов риска нейротоксичности (AAP 2022)
 *   - страт высчитывается автоматически по GA + рискам
 *   - порог фототерапии и обменного переливания на текущий час
 *   - рекомендация: clear / monitor / phototherapy / intensive / exchange
 *   - SVG-график: 2 пороговые кривые (PT синяя, exchange красная) + точка пользователя
 */

import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  type BilirubinBank,
  type RiskStratum,
  STRATUM_LABEL_RU,
  classifyStratum,
  thresholdAt,
  decide,
  convert,
} from '@/lib/neonatal-bilirubin';

type Unit = 'mg/dL' | 'umol/L';

export default function BilirubinNomogram() {
  const [bank, setBank] = useState<BilirubinBank | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [gaWeeks, setGaWeeks] = useState<string>(() => {
    // Pre-seed gestational age from the shared patient context if set.
    const ga = useAppStore.getState().patientContext.gaWeeks;
    return ga > 0 ? String(ga) : '39';
  });
  const [hours, setHours] = useState<string>('48');
  const [tsbInput, setTsbInput] = useState<string>('');
  const [unit, setUnit] = useState<Unit>('mg/dL');
  const [risks, setRisks] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/neonatal-bilirubin.json?v=0.1.0', { cache: 'force-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json: BilirubinBank = await r.json();
        if (!cancelled) setBank(json);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Авто-добавление/убирание ga_lt_38 в зависимости от введённого GA
  useEffect(() => {
    const ga = parseFloat(gaWeeks);
    if (!isFinite(ga)) return;
    setRisks((prev) => {
      const next = new Set(prev);
      if (ga < 38) next.add('ga_lt_38');
      else next.delete('ga_lt_38');
      return next;
    });
  }, [gaWeeks]);

  if (error) {
    return (
      <div className="p-6 rounded-[12px] bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
        Не удалось загрузить нормы билирубина: {error}.
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

  return (
    <div className="flex flex-col gap-[18px]">
      <ControlsPanel
        bank={bank}
        gaWeeks={gaWeeks}
        setGaWeeks={setGaWeeks}
        hours={hours}
        setHours={setHours}
        tsbInput={tsbInput}
        setTsbInput={setTsbInput}
        unit={unit}
        setUnit={setUnit}
        risks={risks}
        setRisks={setRisks}
      />
      <div className="neo-chart-split">
        <ChartView
          bank={bank}
          gaWeeks={gaWeeks}
          hours={hours}
          tsbInput={tsbInput}
          unit={unit}
          risks={risks}
        />
        <ResultPanel
          bank={bank}
          gaWeeks={gaWeeks}
          hours={hours}
          tsbInput={tsbInput}
          unit={unit}
          risks={risks}
        />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function ControlsPanel({
  bank, gaWeeks, setGaWeeks, hours, setHours, tsbInput, setTsbInput,
  unit, setUnit, risks, setRisks,
}: {
  bank: BilirubinBank;
  gaWeeks: string; setGaWeeks: (s: string) => void;
  hours: string;   setHours: (s: string) => void;
  tsbInput: string; setTsbInput: (s: string) => void;
  unit: Unit; setUnit: (u: Unit) => void;
  risks: Set<string>; setRisks: (r: Set<string>) => void;
}) {
  const toggle = (id: string): void => {
    const next = new Set(risks);
    if (next.has(id)) next.delete(id); else next.add(id);
    setRisks(next);
  };

  return (
    <div className="flex flex-col gap-[18px] p-[18px] bg-[#F5F6F8] rounded-[14px]">
      {/* Section: Параметры пациента */}
      <div>
        <SectionLabel>Параметры пациента</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2.5">
          <Field label="GA, недели" hint="35–42">
            <BordikNumberInput
              value={gaWeeks}
              onChange={setGaWeeks}
              min={35} max={42} step={0.1}
            />
          </Field>
          <Field label="Часы жизни" hint="0–336 (14 сут)">
            <BordikNumberInput
              value={hours}
              onChange={setHours}
              min={0} max={336} step={1}
            />
          </Field>
          <Field label={`TSB, ${unit === 'mg/dL' ? 'mg/dL' : 'µmol/L'}`} hint="ваш замер">
            <BordikNumberInput
              value={tsbInput}
              onChange={setTsbInput}
              min={0} step={0.1}
              placeholder="—"
            />
          </Field>
          <Field label="Единицы">
            <SegmentedControl
              value={unit}
              onChange={setUnit}
              options={[
                { value: 'mg/dL', label: 'mg/dL' },
                { value: 'umol/L', label: 'µmol/L' },
              ]}
            />
          </Field>
        </div>
      </div>

      {/* Section: Факторы риска */}
      <div>
        <SectionLabel>Факторы риска нейротоксичности</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {bank.riskFactors.map((rf) => {
            const active = risks.has(rf.id);
            const isAuto = rf.id === 'ga_lt_38';
            return (
              <RiskChip
                key={rf.id}
                label={rf.label_ru}
                active={active}
                disabled={isAuto}
                hint={isAuto ? 'Определяется автоматически по GA' : ''}
                onClick={() => { if (!isAuto) toggle(rf.id); }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-[var(--font-display)] text-[13px] font-semibold text-[#111827] tracking-[-0.005em] mb-2.5">
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

/** Bordik-стайл инпут: серый pill-фон, focus-ring через .bordik-search.
 *  Поведение синхронно с полями поиска по всему проекту. */
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

/** Сегментированный переключатель — pill-обёртка с двумя кнопками внутри.
 *  Высота 40px чтобы совпадать с input/select. */
function SegmentedControl<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div role="tablist" className="flex gap-0.5 p-1 bg-white rounded-[10px] min-h-10">
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 px-2.5 border-none rounded-[7px] cursor-pointer font-[inherit] text-[13px] font-semibold tracking-[0.01em] transition-colors duration-[140ms] ${
              isActive
                ? 'bg-[#2563EB] text-white'
                : 'bg-transparent text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Bordik-стайл chip для toggle факторов риска. Серый по умолчанию,
 *  жёлтый когда активен, приглушённый при disabled. */
function RiskChip({
  label, active, disabled, hint, onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  hint: string;
  onClick: () => void;
}) {
  const stateClass = active
    ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold opacity-100'
    : disabled
      ? 'bg-white text-[#9CA3AF] font-medium opacity-65'
      : 'bg-white hover:bg-[#EFF1F4] text-[#374151] font-medium opacity-100';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 py-[7px] px-[13px] border-none rounded-full font-[inherit] text-xs transition-colors duration-[140ms] ${
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${stateClass}`}
    >
      {active && (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {label}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────

interface Computed {
  hour: number;
  tsbMgdl: number;
  stratum: RiskStratum;
  ptThr: number;
  exThr: number;
}

function computeAll(
  bank: BilirubinBank,
  gaWeeks: string,
  hours: string,
  tsbInput: string,
  unit: Unit,
  risks: Set<string>,
): Computed | null {
  const ga = parseFloat(gaWeeks);
  const h = parseFloat(hours);
  const tsbRaw = parseFloat(tsbInput);
  if (!isFinite(ga) || !isFinite(h) || !isFinite(tsbRaw) || tsbRaw <= 0) return null;
  const tsbMgdl = unit === 'mg/dL' ? tsbRaw : convert(tsbRaw, 'umol/L', 'mg/dL', bank.units.conversionFactor);
  const stratum = classifyStratum(ga, Array.from(risks));
  const ptThr = thresholdAt(bank.thresholds.phototherapy[stratum], h);
  const exThr = thresholdAt(bank.thresholds.exchange[stratum], h);
  if (ptThr == null || exThr == null) return null;
  return { hour: h, tsbMgdl, stratum, ptThr, exThr };
}

function ResultPanel({
  bank, gaWeeks, hours, tsbInput, unit, risks,
}: {
  bank: BilirubinBank;
  gaWeeks: string; hours: string; tsbInput: string; unit: Unit; risks: Set<string>;
}) {
  const computed = useMemo(() => computeAll(bank, gaWeeks, hours, tsbInput, unit, risks), [bank, gaWeeks, hours, tsbInput, unit, risks]);

  if (!computed) {
    return (
      <div className="py-5 px-[18px] bg-white border border-dashed border-[#E5E7EB] rounded-[12px] text-[#9CA3AF] text-[13px] flex items-center justify-center text-center min-h-[240px]">
        Введите GA, часы жизни и TSB — рассчитаем пороги фототерапии и обменного переливания + рекомендацию по AAP 2022.
      </div>
    );
  }

  const factor = bank.units.conversionFactor;
  const fmt = (v: number): string => {
    if (unit === 'mg/dL') return v.toFixed(1);
    return Math.round(v * factor).toString();
  };
  const rec = decide(computed.tsbMgdl, computed.ptThr, computed.exThr, unit, fmt);

  const toneBg = {
    ok: '#ECFDF5',
    monitor: '#EFF6FF',
    warning: '#FFFBEB',
    critical: '#FEF2F2',
  }[rec.tone];
  const toneText = {
    ok: '#065F46',
    monitor: '#1E40AF',
    warning: '#92400E',
    critical: '#991B1B',
  }[rec.tone];
  const toneAccent = {
    ok: '#10B981',
    monitor: '#3B82F6',
    warning: '#F59E0B',
    critical: '#EF4444',
  }[rec.tone];

  return (
    <div className="flex flex-col gap-3">
      {/* Главная рекомендация: тон + label + detail + rationale + reference */}
      <div
        className="py-[14px] px-4 bg-[var(--tone-bg)] border-l-4 border-[var(--tone-accent)] rounded-[10px]"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic tone palette
        style={{
          ['--tone-bg' as string]: toneBg,
          ['--tone-accent' as string]: toneAccent,
        }}
      >
        <div
          className="text-[11px] font-bold tracking-[0.04em] uppercase mb-1.5 opacity-85 text-[var(--tone-text)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text
          style={{ ['--tone-text' as string]: toneText }}
        >
          Рекомендация AAP 2022
        </div>
        <div
          className="font-[var(--font-display)] text-base font-semibold tracking-[-0.005em] leading-[1.4] mb-2 text-[var(--tone-text)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text
          style={{ ['--tone-text' as string]: toneText }}
        >
          {rec.label_ru}
        </div>
        <p
          className="m-0 text-[13px] opacity-90 leading-[1.55] text-[var(--tone-text)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text
          style={{ ['--tone-text' as string]: toneText }}
        >
          {rec.detail_ru}
        </p>
        <div
          className="mt-2.5 pt-2.5 border-t border-[var(--tone-divider)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone divider
          style={{ ['--tone-divider' as string]: `${toneAccent}33` }}
        >
          <div
            className="text-[10px] font-bold opacity-70 tracking-[0.06em] uppercase mb-[3px] text-[var(--tone-text)]"
            // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text
            style={{ ['--tone-text' as string]: toneText }}
          >
            Почему так
          </div>
          <div
            className="text-xs opacity-90 leading-[1.55] text-[var(--tone-text)]"
            // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text
            style={{ ['--tone-text' as string]: toneText }}
          >
            {rec.rationale_ru}
          </div>
        </div>
        <div
          className="mt-2 text-[10px] opacity-60 italic leading-[1.45] text-[var(--tone-text)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic tone text
          style={{ ['--tone-text' as string]: toneText }}
        >
          Источник: {rec.reference}
        </div>
      </div>

      {/* Иерархия:
            1. Страт риска — узкий полноширинный contextual pill (Tier C)
            2. Текущий TSB — primary metric, accent blue, full width (Tier A)
            3. Порог ФТ + Порог ОП — secondary metrics в 2 колонки (Tier B) */}
      <div className="flex flex-col gap-2">
        {/* Tier C — стратум как inline-context */}
        <div className="py-2 px-3 bg-[#F5F6F8] rounded-lg flex items-baseline gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-[#9CA3AF] tracking-[0.06em] uppercase font-[var(--font-mono,ui-monospace)]">
            Страт риска
          </span>
          <span className="text-xs font-medium text-[#374151] leading-[1.4]">
            {STRATUM_LABEL_RU[computed.stratum]}
          </span>
        </div>

        {/* Tier A — текущий TSB как primary */}
        <div className="py-[14px] px-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[12px]">
          <div className="text-[11px] font-semibold text-[#1D4ED8] tracking-[0.04em] uppercase mb-1">
            Текущий TSB
          </div>
          <div className="font-[var(--font-display)] text-[28px] font-bold text-[#1E3A8A] tracking-[-0.02em] leading-[1.1]">
            {fmt(computed.tsbMgdl)} <span className="text-base font-semibold opacity-65">{unit}</span>
          </div>
        </div>

        {/* Tier B — пороги в 2 колонки */}
        <div className="grid grid-cols-2 gap-2">
          <Card
            label="Порог фототерапии"
            value={`${fmt(computed.ptThr)} ${unit}`}
            sub={`до порога: ${rec.marginToPt > 0 ? '+' : ''}${fmt(rec.marginToPt)} ${unit}`}
          />
          <Card
            label="Порог обменного"
            value={`${fmt(computed.exThr)} ${unit}`}
            sub={`до порога: ${rec.marginToEx > 0 ? '+' : ''}${fmt(rec.marginToEx)} ${unit}`}
          />
        </div>
      </div>
    </div>
  );
}

function Card({
  label, value, sub, small, accent,
}: {
  label: string;
  value: string;
  sub?: string;
  small?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={`py-3 px-3.5 rounded-[12px] border ${accent ? 'bg-[#EFF6FF] border-[#BFDBFE]' : 'bg-white border-[#E5E7EB]'}`}>
      <div className={`text-[11px] font-semibold tracking-[0.04em] uppercase mb-1 ${accent ? 'text-[#1D4ED8]' : 'text-[#9CA3AF]'}`}>
        {label}
      </div>
      <div className={`font-[var(--font-display)] font-bold tracking-[-0.01em] leading-[1.3] ${small ? 'text-[13px]' : 'text-lg'} ${accent ? 'text-[#1E3A8A]' : 'text-[#111827]'}`}>
        {value}
      </div>
      {sub && (
        <div className={`text-[11px] mt-[3px] font-[var(--font-mono,ui-monospace)] ${accent ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────

function ChartView({
  bank, gaWeeks, hours, tsbInput, unit, risks,
}: {
  bank: BilirubinBank;
  gaWeeks: string; hours: string; tsbInput: string; unit: Unit; risks: Set<string>;
}) {
  const ga = parseFloat(gaWeeks);
  const stratum = isFinite(ga) ? classifyStratum(ga, Array.from(risks)) : 'ge38_norisk';
  const ptCurve = bank.thresholds.phototherapy[stratum];
  const exCurve = bank.thresholds.exchange[stratum];
  const [hoverHour, setHoverHour] = useState<number | null>(null);

  const factor = bank.units.conversionFactor;
  const transform = (v: number): number => unit === 'mg/dL' ? v : v * factor;

  const minHour = 0;
  const maxHour = 168; // показываем 7 суток — основной интервал фототерапии
  const allValues = [
    ...ptCurve.filter((p) => p.hour <= maxHour).map((p) => transform(p.tsb)),
    ...exCurve.filter((p) => p.hour <= maxHour).map((p) => transform(p.tsb)),
  ];
  const minVal = 0;
  const maxVal = Math.max(...allValues) * 1.08;

  // SVG layout — компактнее (было 720×360, теперь 560×320)
  const width = 560;
  const height = 320;
  const margin = { top: 28, right: 48, bottom: 40, left: 52 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const xScale = (h: number) => ((h - minHour) / (maxHour - minHour)) * innerW;
  const yScale = (v: number) => innerH - ((v - minVal) / (maxVal - minVal)) * innerH;

  const userHour = parseFloat(hours);
  const userTsbRaw = parseFloat(tsbInput);
  const userTsbDisp = isFinite(userTsbRaw) ? userTsbRaw : NaN;
  const showUserPoint = isFinite(userHour) && isFinite(userTsbDisp) && userTsbDisp > 0
    && userHour >= minHour && userHour <= maxHour;

  const yTicks = Array.from({ length: 6 }, (_, i) => minVal + (maxVal - minVal) * (i / 5));
  const xTickHours = [0, 24, 48, 72, 96, 120, 144, 168];

  // Catmull-Rom plumber через cubic Bezier (плавные кривые)
  const smoothPath = (pts: Array<{ x: number; y: number }>): string => {
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
  };

  const ptPath = smoothPath(ptCurve.filter((p) => p.hour <= maxHour).map((p) => ({ x: xScale(p.hour), y: yScale(transform(p.tsb)) })));
  const exPath = smoothPath(exCurve.filter((p) => p.hour <= maxHour).map((p) => ({ x: xScale(p.hour), y: yScale(transform(p.tsb)) })));

  return (
    <div className="pt-4 px-[18px] pb-[14px] bg-white border border-[#E5E7EB] rounded-[12px] flex flex-col gap-3 relative">
      {/* Header — title + параграф + контекст */}
      <div>
        <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
          <h3 className="m-0 font-[var(--font-display)] text-base font-semibold text-[#111827] tracking-[-0.01em]">
            Билирубин TSB ({unit}) по часам жизни
          </h3>
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.04em] uppercase font-semibold font-[var(--font-mono,ui-monospace)]">
            AAP 2022 · 0–168 ч
          </div>
        </div>
        <p className="m-0 text-xs text-[#6B7280] leading-[1.5]">
          Кривые отображают пороги для текущего страта риска. Точка пациента
          между ФТ и ОП — фототерапия; над ОП — обменное переливание.
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto"
        role="img" aria-label="График порогов AAP 2022">
        <defs>
          <linearGradient id="bili-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Plot area */}
          <rect x={0} y={0} width={innerW} height={innerH} fill="url(#bili-bg)" rx={4} />

          {/* Grid Y */}
          {yTicks.map((t, i) => (
            <g key={`y-${i}`}>
              <line x1={0} x2={innerW} y1={yScale(t)} y2={yScale(t)} stroke="#EAECEF" strokeWidth={1} strokeDasharray={i === 0 || i === yTicks.length - 1 ? 'none' : '2 4'} />
              <text x={-10} y={yScale(t)} dy="0.32em" textAnchor="end" fontSize={10} fill="#9CA3AF">
                {unit === 'mg/dL' ? t.toFixed(0) : Math.round(t)}
              </text>
            </g>
          ))}
          {/* Grid X */}
          {xTickHours.map((h, i) => (
            <g key={`x-${i}`}>
              <line x1={xScale(h)} x2={xScale(h)} y1={0} y2={innerH} stroke="#EAECEF" strokeWidth={1} strokeDasharray="2 4" />
              <text x={xScale(h)} y={innerH + 16} textAnchor="middle" fontSize={10} fill="#9CA3AF">
                {h}
              </text>
            </g>
          ))}

          {/* Smooth curves */}
          <path d={ptPath} fill="none" stroke="#2563EB" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          <path d={exPath} fill="none" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" />

          {/* Curve labels (right edge) */}
          <text x={innerW + 6} y={yScale(transform(ptCurve[ptCurve.length - 1]?.tsb ?? 0))} dy="0.32em" fontSize={9} fill="#2563EB" fontFamily="var(--font-mono, ui-monospace)" fontWeight={700}>
            ФТ
          </text>
          <text x={innerW + 6} y={yScale(transform(exCurve[exCurve.length - 1]?.tsb ?? 0))} dy="0.32em" fontSize={9} fill="#DC2626" fontFamily="var(--font-mono, ui-monospace)" fontWeight={700}>
            ОП
          </text>

          {/* User point */}
          {showUserPoint && (
            <g>
              <line x1={xScale(userHour)} x2={xScale(userHour)} y1={0} y2={innerH} stroke="#111827" strokeWidth={1} strokeDasharray="2 3" opacity={0.25} />
              <line x1={0} x2={innerW} y1={yScale(userTsbDisp)} y2={yScale(userTsbDisp)} stroke="#111827" strokeWidth={1} strokeDasharray="2 3" opacity={0.25} />
              <circle cx={xScale(userHour)} cy={yScale(userTsbDisp)} r={9} fill="#111827" opacity={0.12} />
              <circle cx={xScale(userHour)} cy={yScale(userTsbDisp)} r={5} fill="#111827" stroke="#FFFFFF" strokeWidth={2} />
            </g>
          )}

          {/* Hover guide + dots */}
          {hoverHour != null && (() => {
            const ptV = thresholdAt(ptCurve, hoverHour);
            const exV = thresholdAt(exCurve, hoverHour);
            if (ptV == null || exV == null) return null;
            const hx = xScale(hoverHour);
            return (
              <g pointerEvents="none">
                <line x1={hx} x2={hx} y1={0} y2={innerH} stroke="#111827" strokeWidth={1} opacity={0.35} />
                <circle cx={hx} cy={yScale(transform(ptV))} r={4} fill="#2563EB" stroke="#FFFFFF" strokeWidth={1.5} />
                <circle cx={hx} cy={yScale(transform(exV))} r={4} fill="#DC2626" stroke="#FFFFFF" strokeWidth={1.5} />
              </g>
            );
          })()}

          {/* Mouse capture overlay */}
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
              const h = minHour + (innerX / innerW) * (maxHour - minHour);
              if (h >= minHour && h <= maxHour) setHoverHour(h);
              else setHoverHour(null);
            }}
            onMouseLeave={() => setHoverHour(null)}
          />

          {/* Axis labels */}
          <text x={innerW / 2} y={innerH + 32} textAnchor="middle" fontSize={10} fill="#6B7280" fontWeight={500} pointerEvents="none">
            Часы жизни
          </text>
        </g>
      </svg>

      {/* Hover tooltip */}
      {hoverHour != null && (() => {
        const ptV = thresholdAt(ptCurve, hoverHour);
        const exV = thresholdAt(exCurve, hoverHour);
        if (ptV == null || exV == null) return null;
        const tooltipLeftPct = ((margin.left + xScale(hoverHour)) / width) * 100;
        const isRightHalf = tooltipLeftPct > 60;
        const fmt = (v: number): string => unit === 'mg/dL' ? v.toFixed(1) : Math.round(v * factor).toString();
        return (
          <div
            className={`neo-chart-tooltip min-w-[160px] left-[var(--tt-left)] top-[var(--tt-top)] ${isRightHalf ? '-translate-x-[calc(100%+12px)]' : 'translate-x-3'}`}
            // eslint-disable-next-line react/forbid-dom-props -- dynamic tooltip position via CSS-var
            style={{
              ['--tt-left' as string]: `${tooltipLeftPct}%`,
              ['--tt-top' as string]: `${(margin.top / height) * 100 + 2}%`,
            }}
          >
            <div className="font-[var(--font-display)] text-[13px] font-semibold text-[#111827] mb-2 tracking-[-0.005em]">
              {Math.round(hoverHour)} ч жизни
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />
                <span className="text-[#6B7280] min-w-[24px]">ФТ</span>
                <span className="text-[#111827] font-semibold ml-auto">{fmt(ptV)} {unit}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                <span className="text-[#6B7280] min-w-[24px]">ОП</span>
                <span className="text-[#111827] font-semibold ml-auto">{fmt(exV)} {unit}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div className="flex gap-4 justify-center text-[11px] text-[#6B7280]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-[#2563EB] rounded-[1px]" />
          Фототерапия
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 bg-[#DC2626] rounded-[1px] opacity-85" />
          Обменное переливание
        </span>
      </div>
    </div>
  );
}

