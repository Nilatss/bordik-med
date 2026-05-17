'use client';

/**
 * PatientContextBar — sticky widget на /neonatology содержащий 3 базовых
 * параметра ребёнка (weight grams / gestational age weeks / postnatal day),
 * которые требуются ВО МНОЖЕСТВЕ калькуляторов:
 *
 *   • Apgar — не нужен (только клиническая оценка)
 *   • Bili-2022 — GA + postnatal hours/day
 *   • Fluid — weight + postnatal day
 *   • GIR — weight + glucose
 *   • Fenton growth — weight + GA
 *   • Resuscitation doses — weight
 *   • Surfactant — weight
 *   • UVC/UAC line depth — weight + GA
 *   • TPN — weight
 *   • Enteral feed — weight
 *
 * Клиницист вводит данные ОДИН РАЗ за дежурство, и они auto-fill
 * во все совместимые калькуляторы. Это primary anti-repetition UX
 * для /neonatology (audit suggestion).
 *
 * Persistance: через lib/store.ts patientContext + 24h TTL — данные
 * предыдущего пациента не утекают на следующего, но переключения
 * между табами /neonatology не сбрасывают контекст.
 *
 * Layout: sticky top, compact card, expandable details on click.
 * Default «collapsed» pill показывает текущие значения коротко
 * (например «1450 g · 32 нед · день 3»), click — expand inputs.
 */

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function PatientContextBar(): React.JSX.Element {
  const ctx = useAppStore((s) => s.patientContext);
  const setCtx = useAppStore((s) => s.setPatientContext);
  const clearCtx = useAppStore((s) => s.clearPatientContext);

  // Expanded inputs only when user clicks. Collapsed pill shows summary.
  const [expanded, setExpanded] = useState(false);

  // Local input state — keeps the input fields responsive without
  // committing every keystroke to the store (which would touch
  // localStorage + bump patientContextSetAt). Commit on blur or Enter.
  const [weightStr, setWeightStr] = useState(String(ctx.weightG || ''));
  const [gaStr, setGaStr] = useState(String(ctx.gaWeeks || ''));
  const [dayStr, setDayStr] = useState(String(ctx.postnatalDay || ''));

  // Sync local state from store (e.g. if cleared elsewhere or rehydrated).
  useEffect(() => {
    setWeightStr(String(ctx.weightG || ''));
    setGaStr(String(ctx.gaWeeks || ''));
    setDayStr(String(ctx.postnatalDay || ''));
  }, [ctx.weightG, ctx.gaWeeks, ctx.postnatalDay]);

  const commit = (): void => {
    const w = parseInt(weightStr, 10);
    const ga = parseFloat(gaStr);
    const day = parseInt(dayStr, 10);
    setCtx({
      weightG: Number.isFinite(w) ? w : 0,
      gaWeeks: Number.isFinite(ga) ? ga : 0,
      postnatalDay: Number.isFinite(day) ? day : 0,
    });
  };

  const hasAny = ctx.weightG > 0 || ctx.gaWeeks > 0 || ctx.postnatalDay > 0;

  return (
    <div
      role="region"
      aria-label="Контекст пациента"
      className="sticky top-2 z-20 mb-4 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.04)] print-hide"
    >
      {!expanded ? (
        // ── COLLAPSED: summary pill ────────────────────────────────────
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer text-left bg-transparent hover:bg-[#F9FAFB] border-0 rounded-xl transition-[background-color] duration-150"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="font-[var(--font-mono)] text-[10.5px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] shrink-0">
              Пациент
            </span>
            {hasAny ? (
              <span className="text-[13px] text-[#1A1A1A] font-medium truncate">
                {ctx.weightG > 0 && <>{ctx.weightG} г</>}
                {ctx.weightG > 0 && (ctx.gaWeeks > 0 || ctx.postnatalDay > 0) && <span className="text-[#9CA3AF]"> · </span>}
                {ctx.gaWeeks > 0 && <>{ctx.gaWeeks} нед</>}
                {ctx.gaWeeks > 0 && ctx.postnatalDay > 0 && <span className="text-[#9CA3AF]"> · </span>}
                {ctx.postnatalDay > 0 && <>день {ctx.postnatalDay}</>}
              </span>
            ) : (
              <span className="text-[13px] text-[#9CA3AF] italic">
                Задать вес, GA, день жизни — auto-fill в калькуляторы
              </span>
            )}
          </span>
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      ) : (
        // ── EXPANDED: 3 inputs + actions ───────────────────────────────
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-[var(--font-mono)] text-[10.5px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF]">
              Контекст пациента
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Свернуть"
              className="shrink-0 text-[#9CA3AF] hover:text-[#1A1A1A] transition-colors"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2.5">
            <ContextField
              label="Вес, г"
              hint="0–10 000"
              value={weightStr}
              onChange={setWeightStr}
              onBlur={commit}
              inputProps={{ min: 0, max: 10000, step: 10 }}
            />
            <ContextField
              label="GA, недели"
              hint="22–44"
              value={gaStr}
              onChange={setGaStr}
              onBlur={commit}
              inputProps={{ min: 22, max: 44, step: 0.1 }}
            />
            <ContextField
              label="День жизни"
              hint="0 = роды"
              value={dayStr}
              onChange={setDayStr}
              onBlur={commit}
              inputProps={{ min: 0, max: 365, step: 1 }}
            />
          </div>
          {hasAny && (
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  clearCtx();
                  setWeightStr('');
                  setGaStr('');
                  setDayStr('');
                }}
                className="px-3 py-1.5 text-[11.5px] font-semibold text-[#6B7280] hover:text-[#B91C1C] bg-transparent hover:bg-[#FEF2F2] border-0 rounded-md transition-colors cursor-pointer"
              >
                Сбросить
              </button>
            </div>
          )}
          <p className="mt-3 pt-3 border-t border-[#F0F1F5] text-[11px] text-[#9CA3AF] leading-[1.5]">
            Auto-fill в калькуляторы (Bili-2022, Fluid, GIR, Fenton, Resus
            doses, Surfactant, UVC/UAC, TPN). Очищается автоматически через 24 ч.
          </p>
        </div>
      )}
    </div>
  );
}

function ContextField({
  label, hint, value, onChange, onBlur, inputProps,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (s: string) => void;
  onBlur: () => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}): React.JSX.Element {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10.5px] font-semibold text-[#6B7280] tracking-[0.04em] uppercase">
        {label}
      </span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
        placeholder="—"
        className="bordik-search px-3 py-1.5 bg-[#F5F6F8] border-0 rounded-md outline-none font-[var(--font-mono,monospace)] text-sm font-semibold text-[#1A1A1A] placeholder:text-[#9CA3AF] placeholder:font-normal"
        {...inputProps}
      />
      <span className="text-[10px] text-[#9CA3AF]">{hint}</span>
    </label>
  );
}
