/**
 * FilterDropdown — popover-style multi-select filter (categories /
 * subcategories / countries) для ToolsPage.
 *
 * P1-CR-3 step 2/6 — extracted from ToolsPage.tsx.
 *
 * Features:
 *   - Auto-flip: opens left of trigger if would clip viewport на правом краю.
 *   - Optional searchable input — фильтрует options.
 *   - Reset-all + count chip когда выбраны элементы.
 *   - React.memo для стабильности при перерисовках родителя.
 */
import React, { useState, useRef, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { useT } from '@/lib/i18n';
import EmojiOrFlag from '@/components/ui/EmojiOrFlag';
import Highlight from '@/components/ui/Highlight';
import type { FilterOption } from '@/lib/tools-page/types';

interface FilterDropdownProps {
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  open: boolean;
  onOpen: (next: boolean) => void;
  searchable?: boolean;
}

export const FilterDropdown = React.memo(function FilterDropdown({
  label, icon, options, selected, onChange, open, onOpen, searchable = false,
}: FilterDropdownProps) {
  const t = useT();
  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q);
  const ref = useRef<HTMLDivElement | null>(null);
  // Anchor side for the floating panel — measured from the trigger's
  // viewport position when the dropdown opens. If the panel would clip on
  // the right edge, we anchor to the right of the trigger so it opens
  // leftward instead. Prevents page-overflow / horizontal-scroll bug.
  const [anchorRight, setAnchorRight] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onOpen]);

  // Decide which side of the trigger the panel should be anchored to.
  // 360 px = panel max-width; 16 px buffer.
  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const PANEL_W = 360;
    const overflowRight = rect.left + PANEL_W + 16 > window.innerWidth;
    setAnchorRight(overflowRight);
  }, [open]);

  const count = selected.length;
  const filteredOptions = useMemo(() => {
    if (!deferredQ.trim()) return options;
    const needle = deferredQ.trim().toLowerCase();
    return options.filter((o) => o.value.toLowerCase().includes(needle));
  }, [deferredQ, options]);

  const toggle = useCallback((v: string) => {
    if (selected.includes(v)) onChange(selected.filter((s) => s !== v));
    else onChange([...selected, v]);
  }, [selected, onChange]);

  const buttonStateClass = count > 0 || open
    ? 'bg-[#1A1A1A] text-white'
    : 'bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#374151]';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => onOpen(!open)}
        className={`inline-flex items-center gap-1.5 py-[7px] px-3 border-none rounded-full cursor-pointer font-[var(--font-body)] text-xs font-semibold transition-colors duration-[180ms] ${buttonStateClass}`}
      >
        <span className="flex shrink-0">{icon}</span>
        <span>{label}</span>
        {count > 0 && (
          <span className="bg-white text-[#1A1A1A] font-[var(--font-mono)] text-[10px] font-bold py-px px-1.5 rounded-full min-w-[18px] text-center">{count}</span>
        )}
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+8px)] ${anchorRight ? 'right-0' : 'left-0'} bg-white rounded-[14px] shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.06)] min-w-[280px] max-w-[360px] max-h-[420px] z-50 flex flex-col overflow-hidden`}
        >
          {searchable && (
            <div className="py-2.5 px-3 border-b border-[#F0F1F5] flex items-center gap-2">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('common.search')}
                className="flex-1 border-none outline-none bg-transparent font-[var(--font-body)] text-[13px] text-[#1A1A1A]"
                autoFocus
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-1.5">
            {filteredOptions.length === 0 ? (
              <div className="p-5 text-center font-[var(--font-body)] text-xs text-[#9CA3AF]">
                {t('nav.nothingFound')}
              </div>
            ) : filteredOptions.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className={`flex items-center gap-2.5 py-2 px-2.5 border-none rounded-lg cursor-pointer w-full text-left font-[var(--font-body)] text-[13px] text-[#1A1A1A] transition-colors duration-[120ms] ${checked ? 'bg-[#F5F6F8]' : 'bg-transparent hover:bg-[#FAFBFC]'}`}
                >
                  <span className={`w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 ${checked ? 'bg-[#1A1A1A] border-none' : 'bg-white border-[1.5px] border-[#D1D5DB]'}`}>
                    {checked && (
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    )}
                  </span>
                  <span className="flex-1 min-w-0 inline-flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    {opt.flag && <EmojiOrFlag emoji={opt.flag} size={16} />}
                    <span className="overflow-hidden text-ellipsis">
                      <Highlight text={opt.label ?? opt.value} query={deferredQ} />
                    </span>
                  </span>
                  <span className="font-[var(--font-mono)] text-[10px] font-semibold text-[#9CA3AF] py-px px-1.5 rounded bg-[#F5F6F8]">
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div className="py-2 px-3 border-t border-[#F0F1F5] flex justify-between items-center">
              <button
                onClick={() => onChange([])}
                className="bg-transparent border-none cursor-pointer font-[var(--font-body)] text-xs font-medium text-[#6B7280] p-0"
              >
                {t('tools.reset', { label: label.toLowerCase() })}
              </button>
              <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
                {selected.length} выбрано
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
