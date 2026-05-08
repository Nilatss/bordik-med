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
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: '50%',
        background: '#FFFFFF', color: '#6B7280',
        cursor: 'help', flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const tip = e.currentTarget.querySelector('.tool-tooltip') as HTMLElement | null;
        if (tip) tip.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        const tip = e.currentTarget.querySelector('.tool-tooltip') as HTMLElement | null;
        if (tip) tip.style.opacity = '0';
      }}
    >
      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={12} cy={12} r={10}/>
        <line x1={12} y1={16} x2={12} y2={12}/>
        <line x1={12} y1={8} x2={12.01} y2={8}/>
      </svg>
      <span
        className="tool-tooltip"
        style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A1A1A', color: '#FFFFFF',
          padding: '8px 12px', borderRadius: 8,
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 400,
          lineHeight: 1.4, whiteSpace: 'normal',
          width: 220,
          opacity: 0, pointerEvents: 'none',
          transition: 'opacity 150ms',
          zIndex: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        {hint}
      </span>
    </span>
  );
}

export function LabelWithHint({ label, hint }: { label: React.ReactNode; hint?: string | undefined }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <label style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
        color: '#374151',
      }}>
        {label}
      </label>
      {hint && (
        <span
          tabIndex={0}
          title={hint}
          style={{
            position: 'relative',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 16, height: 16, borderRadius: '50%',
            background: '#F0F1F5', color: '#6B7280',
            cursor: 'help', flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            const tip = e.currentTarget.querySelector('.tool-tooltip') as HTMLElement | null;
            if (tip) tip.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            const tip = e.currentTarget.querySelector('.tool-tooltip') as HTMLElement | null;
            if (tip) tip.style.opacity = '0';
          }}
        >
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10}/>
            <line x1={12} y1={16} x2={12} y2={12}/>
            <line x1={12} y1={8} x2={12.01} y2={8}/>
          </svg>
          <span
            className="tool-tooltip"
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
              transform: 'translateX(-50%)',
              background: '#1A1A1A', color: '#FFFFFF',
              padding: '8px 12px', borderRadius: 8,
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 400,
              lineHeight: 1.4, whiteSpace: 'normal',
              width: 240,
              opacity: 0, pointerEvents: 'none',
              transition: 'opacity 150ms',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
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
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: '#F5F6F8',
              border: 'none',
              borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#1A1A1A',
              width: '100%',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </span>
            <span style={{
              flex: 1, minWidth: 0,
              display: 'flex', flexDirection: 'column', gap: 1,
            }}>
              <span style={{
                fontSize: 12, color: '#6B7280', fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {input.label}
              </span>
              <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 600 }}>
                {selected.label}
              </span>
            </span>
            {selected.points !== undefined && selected.points !== 0 && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: '#6B7280', padding: '3px 8px', borderRadius: 6,
                background: '#FFFFFF',
              }}>
                {selected.points > 0 ? '+' : ''}{selected.points}
              </span>
            )}
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0 }}>
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
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: 2 }}>
              <LabelWithHint label={input.label} hint={input.hint} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {options.map((opt) => {
                  const isSel = String(value) === String(opt.value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handlePick(opt.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px',
                        background: isSel ? '#E8E9ED' : '#F5F6F8',
                        border: 'none',
                        borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = '#EFF1F4'; }}
                      onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = '#F5F6F8'; }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isSel && (
                          <span style={{
                            width: 10, height: 10, borderRadius: '50%', background: '#1A1A1A',
                          }} />
                        )}
                      </span>
                      <span style={{ flex: 1, fontWeight: 500 }}>{opt.label}</span>
                      {opt.points !== undefined && opt.points !== 0 && (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                          color: '#6B7280', padding: '3px 8px', borderRadius: 6,
                          background: '#FFFFFF',
                        }}>
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
      <label style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px',
        background: checked ? '#E8E9ED' : '#F5F6F8',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'background 150ms',
      }}>
        <span style={{
          width: 20, height: 20, borderRadius: 6,
          background: checked ? '#1A1A1A' : '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
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
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          flex: 1, fontFamily: 'var(--font-body)', fontSize: 14,
          color: '#1A1A1A', fontWeight: 500, lineHeight: 1.4,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          {input.label}
          {input.hint && <InlineHintIcon hint={input.hint} />}
        </span>
        {input.points !== undefined && input.points !== 0 && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: '#6B7280', padding: '3px 8px', borderRadius: 6,
            background: '#FFFFFF', flexShrink: 0,
          }}>
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
              <span style={{ color: '#9CA3AF', fontWeight: 400, marginLeft: 6 }}>({input.unit})</span>
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
        style={{
          width: '100%', padding: '13px 16px',
          background: '#F5F6F8', border: 'none',
          borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 15,
          color: '#1A1A1A', outline: 'none',
          transition: 'background 150ms',
        }}
        onFocus={(e) => { e.currentTarget.style.background = '#E8E9ED'; }}
        onBlur={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
      />
      {input.quickValues && input.quickValues.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 4,
          marginTop: 8,
        }}>
          {input.quickValues.map((qv) => {
            const isActive = currentNum === qv;
            return (
              <button
                key={qv}
                type="button"
                onClick={() => onChange(qv)}
                style={{
                  padding: '3px 10px',
                  background: isActive ? '#1A1A1A' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  border: `1px solid ${isActive ? '#1A1A1A' : '#E5E7EB'}`,
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600,
                  transition: 'all 120ms',
                  lineHeight: 1.4,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F5F6F8';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
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
