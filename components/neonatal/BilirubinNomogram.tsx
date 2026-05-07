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
      <ResultPanel
        bank={bank}
        gaWeeks={gaWeeks}
        hours={hours}
        tsbInput={tsbInput}
        unit={unit}
        risks={risks}
      />
      <ChartView
        bank={bank}
        gaWeeks={gaWeeks}
        hours={hours}
        tsbInput={tsbInput}
        unit={unit}
        risks={risks}
      />
      <SourcePanel bank={bank} />
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
      display: 'flex', flexDirection: 'column', gap: 14,
      padding: 16,
      background: '#F5F6F8',
      borderRadius: 12,
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
      }}>
        <Field label="GA, недели" hint="35–42">
          <input
            type="number" value={gaWeeks}
            onChange={(e) => setGaWeeks(e.target.value)}
            min={35} max={42} step={0.1}
            style={inputStyle}
          />
        </Field>
        <Field label="Возраст, часы жизни" hint="0–336 (14 сут)">
          <input
            type="number" value={hours}
            onChange={(e) => setHours(e.target.value)}
            min={0} max={336} step={1}
            style={inputStyle}
          />
        </Field>
        <Field label={`TSB, ${unit}`} hint="ваш замер">
          <input
            type="number" value={tsbInput}
            onChange={(e) => setTsbInput(e.target.value)}
            min={0} step={0.1}
            placeholder="—"
            style={inputStyle}
          />
        </Field>
        <Field label="Единицы">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['mg/dL', 'umol/L'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                style={{
                  flex: 1, padding: '10px 8px',
                  background: unit === u ? '#2563EB' : '#FFFFFF',
                  color: unit === u ? '#FFFFFF' : '#374151',
                  border: '1px solid',
                  borderColor: unit === u ? '#2563EB' : '#E5E7EB',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 600,
                  transition: 'all 150ms',
                }}
              >
                {u === 'mg/dL' ? 'mg/dL' : 'µmol/L'}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* Risk factors */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 600, color: '#6B7280',
          letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8,
        }}>
          Факторы риска нейротоксичности
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {bank.riskFactors.map((rf) => {
            const active = risks.has(rf.id);
            const isAuto = rf.id === 'ga_lt_38';
            return (
              <button
                key={rf.id}
                type="button"
                onClick={() => { if (!isAuto) toggle(rf.id); }}
                disabled={isAuto}
                title={isAuto ? 'Определяется автоматически по GA' : ''}
                style={{
                  padding: '6px 12px',
                  background: active ? '#FEF3C7' : '#FFFFFF',
                  color: active ? '#92400E' : '#374151',
                  border: '1px solid',
                  borderColor: active ? '#FDE68A' : '#E5E7EB',
                  borderRadius: 999,
                  cursor: isAuto ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12, fontWeight: 500,
                  opacity: isAuto ? 0.7 : 1,
                  transition: 'all 150ms',
                }}
              >
                {active ? '✓ ' : ''}{rf.label_ru}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontSize: 11, fontWeight: 600, color: '#6B7280',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span>{label}</span>
        {hint && <span style={{ fontWeight: 400, color: '#9CA3AF', textTransform: 'none', letterSpacing: 0 }}>{hint}</span>}
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
        padding: '14px 18px', background: '#FFFFFF',
        border: '1px dashed #E5E7EB', borderRadius: 12,
        color: '#9CA3AF', fontSize: 13,
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
      <div style={{
        padding: '14px 18px',
        background: toneBg,
        borderLeft: `4px solid ${toneAccent}`,
        borderRadius: 10,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: toneText,
          letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4, opacity: 0.85,
        }}>
          Рекомендация AAP 2022
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: toneText, fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
          {rec.label_ru}
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: toneText, opacity: 0.92, lineHeight: 1.55 }}>
          {rec.detail_ru}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
      }}>
        <Card label="Страт риска" value={STRATUM_LABEL_RU[computed.stratum]} small />
        <Card label={`Текущий TSB`} value={`${fmt(computed.tsbMgdl)} ${unit}`} />
        <Card label="Порог фототерапии" value={`${fmt(computed.ptThr)} ${unit}`} sub={`до порога ${rec.marginToPt > 0 ? '+' : ''}${rec.marginToPt.toFixed(1)} mg/dL`} />
        <Card label="Порог обменного" value={`${fmt(computed.exThr)} ${unit}`} sub={`до порога ${rec.marginToEx > 0 ? '+' : ''}${rec.marginToEx.toFixed(1)} mg/dL`} />
      </div>
    </div>
  );
}

function Card({ label, value, sub, small }: { label: string; value: string; sub?: string; small?: boolean }) {
  return (
    <div style={{
      padding: '12px 14px',
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
        fontFamily: 'var(--font-display)',
        fontSize: small ? 13 : 18, fontWeight: 700,
        color: '#111827', letterSpacing: '-0.01em',
        lineHeight: 1.3,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>{sub}</div>}
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

  // SVG layout
  const width = 720;
  const height = 360;
  const margin = { top: 16, right: 60, bottom: 36, left: 56 };
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

  const ptPoints = ptCurve.filter((p) => p.hour <= maxHour).map((p) => `${xScale(p.hour)},${yScale(transform(p.tsb))}`).join(' ');
  const exPoints = exCurve.filter((p) => p.hour <= maxHour).map((p) => `${xScale(p.hour)},${yScale(transform(p.tsb))}`).join(' ');

  return (
    <div style={{
      padding: 16,
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      overflow: 'auto',
    }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: 480 }}
        role="img" aria-label="График порогов AAP 2022">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid Y */}
          {yTicks.map((t, i) => (
            <g key={`y-${i}`}>
              <line x1={0} x2={innerW} y1={yScale(t)} y2={yScale(t)} stroke="#F0F1F5" strokeWidth={1} />
              <text x={-8} y={yScale(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="#9CA3AF" fontFamily="var(--font-mono, ui-monospace)">
                {unit === 'mg/dL' ? t.toFixed(0) : Math.round(t)}
              </text>
            </g>
          ))}
          {/* Grid X */}
          {xTickHours.map((h, i) => (
            <g key={`x-${i}`}>
              <line x1={xScale(h)} x2={xScale(h)} y1={0} y2={innerH} stroke="#F0F1F5" strokeWidth={1} />
              <text x={xScale(h)} y={innerH + 18} textAnchor="middle" fontSize={11} fill="#9CA3AF" fontFamily="var(--font-mono, ui-monospace)">
                {h}
              </text>
            </g>
          ))}

          {/* Phototherapy curve (blue) */}
          <polyline fill="none" stroke="#2563EB" strokeWidth={2.4} points={ptPoints} />
          {/* Exchange curve (red, dashed) */}
          <polyline fill="none" stroke="#DC2626" strokeWidth={2.2} strokeDasharray="6 4" points={exPoints} />

          {/* Curve labels (right edge) */}
          <text x={innerW + 6} y={yScale(transform(ptCurve[ptCurve.length - 1]?.tsb ?? 0))} dy="0.32em" fontSize={11} fill="#2563EB" fontFamily="var(--font-mono, ui-monospace)" fontWeight={700}>
            ФТ
          </text>
          <text x={innerW + 6} y={yScale(transform(exCurve[exCurve.length - 1]?.tsb ?? 0))} dy="0.32em" fontSize={11} fill="#DC2626" fontFamily="var(--font-mono, ui-monospace)" fontWeight={700}>
            ОП
          </text>

          {/* User point */}
          {showUserPoint && (
            <g>
              <line x1={xScale(userHour)} x2={xScale(userHour)} y1={0} y2={innerH} stroke="#111827" strokeWidth={1} strokeDasharray="2 3" opacity={0.3} />
              <circle cx={xScale(userHour)} cy={yScale(userTsbDisp)} r={6} fill="#111827" stroke="#FFFFFF" strokeWidth={2} />
            </g>
          )}

          {/* Axis labels */}
          <text x={innerW / 2} y={innerH + 32} textAnchor="middle" fontSize={11} fill="#6B7280">
            Часы жизни
          </text>
          <text x={-innerH / 2} y={-44} textAnchor="middle" fontSize={11} fill="#6B7280" transform="rotate(-90)">
            TSB, {unit}
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 18, justifyContent: 'center', marginTop: 8,
        fontSize: 12, color: '#6B7280',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 18, height: 2, background: '#2563EB' }} />
          Фототерапия
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 18, height: 2, background: '#DC2626' }} />
          Обменное переливание
        </span>
      </div>
    </div>
  );
}

function SourcePanel({ bank }: { bank: BilirubinBank }) {
  return (
    <section style={{
      padding: '16px 20px',
      background: '#F5F6F8',
      borderRadius: 12,
      fontSize: 12, color: '#6B7280', lineHeight: 1.55,
    }}>
      <div style={{ marginBottom: 6, fontSize: 11, fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Источник
      </div>
      <div style={{ color: '#374151', fontSize: 13 }}>{bank.source}</div>
      <div style={{ marginTop: 4 }}>{bank.license}</div>
      <div style={{ marginTop: 10, padding: '8px 12px', background: '#FFFBEB', borderRadius: 8, color: '#78350F', fontSize: 11 }}>
        Не заменяет клиническое решение. Для пациентов &lt; 35 нед GA, при острой энцефалопатии или пограничных значениях — сверяйтесь с локальными протоколами и руководством AAP 2022 в полном виде.
      </div>
    </section>
  );
}
