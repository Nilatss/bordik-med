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

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => onOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 12px',
          background: count > 0 || open ? '#1A1A1A' : '#F5F6F8',
          color: count > 0 || open ? '#FFFFFF' : '#374151',
          border: 'none', borderRadius: 999,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
          transition: 'background 180ms, color 180ms',
        }}
        onMouseEnter={(e) => { if (count === 0 && !open) e.currentTarget.style.background = '#EFF1F4'; }}
        onMouseLeave={(e) => { if (count === 0 && !open) e.currentTarget.style.background = '#F5F6F8'; }}
      >
        <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
        <span>{label}</span>
        {count > 0 && (
          <span style={{
            background: '#FFFFFF', color: '#1A1A1A',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            padding: '1px 6px', borderRadius: 999, minWidth: 18, textAlign: 'center',
          }}>{count}</span>
        )}
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 200ms', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)',
          // Auto-flip: open right of trigger by default; if that would
          // clip the viewport (rightmost filter button) we anchor to the
          // right edge of the trigger and open leftward instead.
          ...(anchorRight ? { right: 0 } : { left: 0 }),
          background: '#FFFFFF',
          borderRadius: 14,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
          minWidth: 280, maxWidth: 360, maxHeight: 420,
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {searchable && (
            <div style={{
              padding: '10px 12px',
              borderBottom: '1px solid #F0F1F5',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('common.search')}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-body)', fontSize: 13, color: '#1A1A1A',
                }}
                autoFocus
              />
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{
                padding: 20, textAlign: 'center',
                fontFamily: 'var(--font-body)', fontSize: 12, color: '#9CA3AF',
              }}>
                {t('nav.nothingFound')}
              </div>
            ) : filteredOptions.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px',
                    background: checked ? '#F5F6F8' : 'transparent',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                    width: '100%', textAlign: 'left',
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    color: '#1A1A1A',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={(e) => { if (!checked) e.currentTarget.style.background = '#FAFBFC'; }}
                  onMouseLeave={(e) => { if (!checked) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 4,
                    background: checked ? '#1A1A1A' : '#FFFFFF',
                    border: checked ? 'none' : '1.5px solid #D1D5DB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {checked && (
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    )}
                  </span>
                  <span style={{
                    flex: 1, minWidth: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {opt.flag && <EmojiOrFlag emoji={opt.flag} size={16} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Highlight text={opt.label ?? opt.value} query={deferredQ} />
                    </span>
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                    color: '#9CA3AF', padding: '1px 6px', borderRadius: 4,
                    background: '#F5F6F8',
                  }}>
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div style={{
              padding: '8px 12px',
              borderTop: '1px solid #F0F1F5',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <button
                onClick={() => onChange([])}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                  color: '#6B7280', padding: 0,
                }}
              >
                {t('tools.reset', { label: label.toLowerCase() })}
              </button>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: '#9CA3AF',
              }}>
                {selected.length} выбрано
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
