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

  const [gaWeeks, setGaWeeks] = useState<string>('39');
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
      <div style={{
        padding: 24, borderRadius: 12, background: '#FEF2F2',
        border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить нормы билирубина: {error}.
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 18,
      padding: 18,
      background: '#F5F6F8',
      borderRadius: 14,
    }}>
      {/* Section: Параметры пациента */}
      <div>
        <SectionLabel>Параметры пациента</SectionLabel>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 10,
        }}>
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
    <div style={{
      fontFamily: 'var(--font-display)',
      fontSize: 13, fontWeight: 600, color: '#111827',
      letterSpacing: '-0.005em',
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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
    <div role="tablist" style={{
      display: 'flex', gap: 2,
      padding: 4,
      background: '#FFFFFF',
      borderRadius: 10,
      minHeight: 40,
    }}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              background: isActive ? '#2563EB' : 'transparent',
              color: isActive ? '#FFFFFF' : '#6B7280',
              border: 'none',
              borderRadius: 7,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13, fontWeight: 600,
              letterSpacing: '0.01em',
              transition: 'background 140ms ease, color 140ms ease',
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#111827'; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#6B7280'; }}
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={hint}
      aria-pressed={active}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 13px',
        background: active ? '#EFF6FF' : '#FFFFFF',
        color: active ? '#1D4ED8' : disabled ? '#9CA3AF' : '#374151',
        border: 'none',
        borderRadius: 999,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 12, fontWeight: active ? 600 : 500,
        opacity: disabled && !active ? 0.65 : 1,
        transition: 'background 140ms ease, color 140ms ease',
      }}
      onMouseEnter={(e) => { if (!disabled && !active) e.currentTarget.style.background = '#EFF1F4'; }}
      onMouseLeave={(e) => { if (!disabled && !active) e.currentTarget.style.background = '#FFFFFF'; }}
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
      <div style={{
        padding: '20px 18px', background: '#FFFFFF',
        border: '1px dashed #E5E7EB', borderRadius: 12,
        color: '#9CA3AF', fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', minHeight: 240,
      }}>
        Введите GA, часы жизни и TSB — рассчитаем пороги фототерапии и обменного переливания + рекомендацию по AAP 2022.
      </div>
    );
  }

  const rec = decide(computed.tsbMgdl, computed.ptThr, computed.exThr);

  const factor = bank.units.conversionFactor;
  const fmt = (v: number): string => {
    if (unit === 'mg/dL') return v.toFixed(1);
    return Math.round(v * factor).toString();
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Главная рекомендация: тон + label + detail + rationale + reference */}
      <div style={{
        padding: '14px 16px',
        background: toneBg,
        borderLeft: `4px solid ${toneAccent}`,
        borderRadius: 10,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: toneText,
          letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6, opacity: 0.85,
        }}>
          Рекомендация AAP 2022
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16, fontWeight: 600,
          color: toneText, letterSpacing: '-0.005em',
          lineHeight: 1.4, marginBottom: 8,
        }}>
          {rec.label_ru}
        </div>
        <p style={{
          margin: 0, fontSize: 13, color: toneText, opacity: 0.92,
          lineHeight: 1.55,
        }}>
          {rec.detail_ru}
        </p>
        <div style={{
          marginTop: 10, paddingTop: 10,
          borderTop: `1px solid ${toneAccent}33`,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: toneText, opacity: 0.7,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3,
          }}>
            Почему так
          </div>
          <div style={{
            fontSize: 12, color: toneText, opacity: 0.92, lineHeight: 1.55,
          }}>
            {rec.rationale_ru}
          </div>
        </div>
        <div style={{
          marginTop: 8,
          fontSize: 10, color: toneText, opacity: 0.6,
          fontStyle: 'italic', lineHeight: 1.45,
        }}>
          Источник: {rec.reference}
        </div>
      </div>

      {/* 4 метрики в 2×2 grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
      }}>
        <Card label="Страт риска" value={STRATUM_LABEL_RU[computed.stratum]} small />
        <Card label="Текущий TSB" value={`${fmt(computed.tsbMgdl)} ${unit}`} accent />
        <Card label="Порог ФТ" value={`${fmt(computed.ptThr)} ${unit}`} sub={`Δ ${rec.marginToPt > 0 ? '+' : ''}${rec.marginToPt.toFixed(1)}`} />
        <Card label="Порог ОП" value={`${fmt(computed.exThr)} ${unit}`} sub={`Δ ${rec.marginToEx > 0 ? '+' : ''}${rec.marginToEx.toFixed(1)}`} />
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
        fontFamily: 'var(--font-display)',
        fontSize: small ? 13 : 18, fontWeight: 700,
        color: accent ? '#1E3A8A' : '#111827', letterSpacing: '-0.01em',
        lineHeight: 1.3,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontSize: 11, color: accent ? '#3B82F6' : '#6B7280', marginTop: 3,
          fontFamily: 'var(--font-mono, ui-monospace)',
        }}>
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
    <div style={{
      padding: '16px 18px 14px',
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'relative',
    }}>
      {/* Header — title + параграф + контекст */}
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
            Билирубин TSB ({unit}) по часам жизни
          </h3>
          <div style={{
            fontSize: 11, color: '#9CA3AF',
            letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600,
            fontFamily: 'var(--font-mono, ui-monospace)',
          }}>
            AAP 2022 · 0–168 ч
          </div>
        </div>
        <p style={{
          margin: 0, fontSize: 12, color: '#6B7280', lineHeight: 1.5,
        }}>
          Кривые отображают пороги для текущего страта риска. Точка пациента
          между ФТ и ОП — фототерапия; над ОП — обменное переливание.
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}
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
          <div className="neo-chart-tooltip" style={{
            left: `${tooltipLeftPct}%`,
            top: `${(margin.top / height) * 100 + 2}%`,
            transform: isRightHalf ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
            minWidth: 160,
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13, fontWeight: 600, color: '#111827',
              marginBottom: 8, letterSpacing: '-0.005em',
            }}>
              {Math.round(hoverHour)} ч жизни
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', flexShrink: 0 }} />
                <span style={{ color: '#6B7280', minWidth: 24 }}>ФТ</span>
                <span style={{ color: '#111827', fontWeight: 600, marginLeft: 'auto' }}>{fmt(ptV)} {unit}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', flexShrink: 0 }} />
                <span style={{ color: '#6B7280', minWidth: 24 }}>ОП</span>
                <span style={{ color: '#111827', fontWeight: 600, marginLeft: 'auto' }}>{fmt(exV)} {unit}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 16, justifyContent: 'center',
        fontSize: 11, color: '#6B7280',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 16, height: 2, background: '#2563EB', borderRadius: 1 }} />
          Фототерапия
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 16, height: 2, background: '#DC2626', borderRadius: 1, opacity: 0.85 }} />
          Обменное переливание
        </span>
      </div>
    </div>
  );
}

