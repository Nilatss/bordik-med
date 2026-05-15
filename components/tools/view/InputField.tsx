/**
 * Form-input rendering for ToolView calculators.
 *
 * P1-CR-3 step 3/8 — extracted from ToolView.tsx.
 *
 * Exports:
 *   - `InlineHintIcon` — small ℹ tooltip inside checkbox label
 *   - `LabelWithHint` — field label + ℹ tooltip
 *   - `SelectField` — collapsible radio group (PHQ-9 / GAD-7 style)
 *   - `InputField` — switches на checkbox / select / number; React.memo
 *     с custom equality игнорирующим onChange identity (parent передаёт
 *     fresh arrow-fn каждый render)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ToolInput } from '@/lib/tools-runners';

export function InlineHintIcon({ hint }: { hint: string }) {
  return (
    <span
      tabIndex={0}
      title={hint}
      onClick={(e) => e.preventDefault()}
      className="group relative inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white text-[#6B7280] cursor-help shrink-0"
    >
      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={12} cy={12} r={10}/>
        <line x1={12} y1={16} x2={12} y2={12}/>
        <line x1={12} y1={8} x2={12.01} y2={8}/>
      </svg>
      <span
        className="tool-tooltip absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white py-2 px-3 rounded-lg font-[var(--font-body)] text-xs font-normal leading-[1.4] whitespace-normal w-[220px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[10] shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
      >
        {hint}
      </span>
    </span>
  );
}

export function LabelWithHint({ label, hint }: { label: React.ReactNode; hint?: string | undefined }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <label className="font-[var(--font-body)] text-[13px] font-semibold text-[#374151]">
        {label}
      </label>
      {hint && (
        <span
          tabIndex={0}
          title={hint}
          className="group relative inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#F0F1F5] text-[#6B7280] cursor-help shrink-0"
        >
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10}/>
            <line x1={12} y1={16} x2={12} y2={12}/>
            <line x1={12} y1={8} x2={12.01} y2={8}/>
          </svg>
          <span
            className="tool-tooltip absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white py-2 px-3 rounded-lg font-[var(--font-body)] text-xs font-normal leading-[1.4] whitespace-normal w-[240px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-[10] shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
          >
            {hint}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * SelectField — collapsible radio-group для multi-option questions
 * (e.g. PHQ-9, GAD-7). После выбора, поле сворачивается в compact row
 * (вопрос + chosen answer). Click row → re-expand → можно сменить ответ.
 */
export function SelectField({ input, value, onChange }: {
  input: ToolInput;
  value: number | boolean | string | undefined;
  onChange: (v: number | boolean | string) => void;
}) {
  const options = input.options ?? [];
  const selected = options.find((o) => String(o.value) === String(value));
  // Track user-made choice vs default initialisation.
  const [userPicked, setUserPicked] = useState(false);
  // Manual toggle state: when user clicks the collapsed row to edit again.
  const [manualExpand, setManualExpand] = useState(false);

  // Collapse only when the user has actively picked an answer AND hasn't re-expanded.
  const collapsed = userPicked && !manualExpand && !!selected;

  const handlePick = (optValue: string | number) => {
    onChange(optValue);
    setUserPicked(true);
    setManualExpand(false);
  };

  return (
    <div>
      {/* Collapsed summary row — only rendered when field is collapsed */}
      <AnimatePresence initial={false} mode="wait">
        {collapsed && selected ? (
          <motion.button
            key="collapsed"
            type="button"
            onClick={() => setManualExpand(true)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 py-2.5 px-3.5 bg-[#F5F6F8] hover:bg-[#EFF1F4] border-none rounded-[12px] cursor-pointer text-left font-[var(--font-body)] text-sm text-[#1A1A1A] w-full transition-colors duration-150"
          >
            <span className="w-[18px] h-[18px] rounded-full bg-[#1A1A1A] flex items-center justify-center shrink-0">
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </span>
            <span className="flex-1 min-w-0 flex flex-col gap-px">
              <span className="text-xs text-[#6B7280] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                {input.label}
              </span>
              <span className="text-sm text-[#1A1A1A] font-semibold">
                {selected.label}
              </span>
            </span>
            {selected.points !== undefined && selected.points !== 0 && (
              <span className="font-[var(--font-mono)] text-[11px] font-bold text-[#6B7280] py-[3px] px-2 rounded-md bg-white">
                {selected.points > 0 ? '+' : ''}{selected.points}
              </span>
            )}
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
            }}
            className="overflow-hidden"
          >
            <div className="pb-0.5">
              <LabelWithHint label={input.label} hint={input.hint} />
              <div className="flex flex-col gap-[5px]">
                {options.map((opt) => {
                  const isSel = String(value) === String(opt.value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handlePick(opt.value)}
                      className={`flex items-center gap-3 py-[11px] px-3.5 border-none rounded-[12px] cursor-pointer text-left font-[var(--font-body)] text-sm text-[#1A1A1A] transition-colors duration-150 ${isSel ? 'bg-[#E8E9ED]' : 'bg-[#F5F6F8] hover:bg-[#EFF1F4]'}`}
                    >
                      <span className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center shrink-0">
                        {isSel && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
                        )}
                      </span>
                      <span className="flex-1 font-medium">{opt.label}</span>
                      {opt.points !== undefined && opt.points !== 0 && (
                        <span className="font-[var(--font-mono)] text-[11px] font-bold text-[#6B7280] py-[3px] px-2 rounded-md bg-white">
                          {opt.points > 0 ? '+' : ''}{opt.points}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * InputField — переключает между checkbox / select / number renders.
 *
 * React.memo с custom equality, который ИГНОРИРУЕТ `onChange` identity.
 * Parent передаёт fresh arrow-fn for `onChange` каждый render (closure
 * over `input.id`), так что default memo не помог бы. Мы re-render'имся
 * только когда определение input'а ИЛИ value реально меняется.
 */
export const InputField = React.memo(function InputField({ input, value, onChange }: {
  input: ToolInput;
  value: number | boolean | string | undefined;
  onChange: (v: number | boolean | string) => void;
}) {
  if (input.type === 'checkbox') {
    const checked = value === true;
    return (
      <label className={`flex items-center gap-3 py-[13px] px-4 rounded-[12px] cursor-pointer transition-colors duration-150 ${checked ? 'bg-[#E8E9ED]' : 'bg-[#F5F6F8]'}`}>
        <span className={`w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 ${checked ? 'bg-[#1A1A1A]' : 'bg-white'}`}>
          {checked && (
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          )}
        </span>
        <input
          type="checkbox" checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute opacity-0 w-0 h-0"
        />
        <span className="flex-1 font-[var(--font-body)] text-sm text-[#1A1A1A] font-medium leading-[1.4] inline-flex items-center gap-1.5">
          {input.label}
          {input.hint && <InlineHintIcon hint={input.hint} />}
        </span>
        {input.points !== undefined && input.points !== 0 && (
          <span className="font-[var(--font-mono)] text-[11px] font-bold text-[#6B7280] py-[3px] px-2 rounded-md bg-white shrink-0">
            {input.points > 0 ? '+' : ''}{input.points}
          </span>
        )}
      </label>
    );
  }

  if (input.type === 'select' && input.options) {
    return <SelectField input={input} value={value} onChange={onChange} />;
  }

  // Number input — with quick-value chips below
  const currentNum = typeof value === 'number' && !isNaN(value) ? value : null;
  return (
    <div>
      <LabelWithHint
        label={
          <>
            {input.label}
            {input.unit && (
              <span className="text-[#9CA3AF] font-normal ml-1.5">({input.unit})</span>
            )}
          </>
        }
        hint={input.hint}
      />
      <input
        type="number"
        value={(value as number) ?? ''}
        onChange={(e) => {
          const n = e.target.value === '' ? '' : Number(e.target.value);
          onChange(n as number);
        }}
        min={input.min} max={input.max} step={input.step ?? 'any'}
        // Short placeholder only — full clinical hint лежит в ℹ tooltip
        // рядом с label. Если у input'а есть min/max range — показываем его
        // ("0-100"); иначе fallback на unit, или empty.
        placeholder={
          typeof input.min === 'number' && typeof input.max === 'number'
            ? `${input.min} – ${input.max}${input.unit ? ' ' + input.unit : ''}`
            : input.unit || ''
        }
        className="w-full py-[13px] px-4 bg-[#F5F6F8] focus:bg-[#E8E9ED] border-none rounded-[12px] font-[var(--font-body)] text-[15px] text-[#1A1A1A] outline-none transition-colors duration-150"
      />
      {input.quickValues && input.quickValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {input.quickValues.map((qv) => {
            const isActive = currentNum === qv;
            return (
              <button
                key={qv}
                type="button"
                onClick={() => onChange(qv)}
                className={`py-[3px] px-2.5 border rounded-full cursor-pointer font-[var(--font-mono)] text-[11.5px] font-semibold transition-all duration-[120ms] leading-[1.4] ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                    : 'bg-white hover:bg-[#F5F6F8] text-[#6B7280] border-[#E5E7EB] hover:border-[#D1D5DB]'
                }`}
              >
                {qv}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}, (prev, next) => prev.input === next.input && prev.value === next.value);
