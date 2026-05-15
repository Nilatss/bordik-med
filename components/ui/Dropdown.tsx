'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { Option } from '@/lib/profile-options';
import EmojiOrFlag from './EmojiOrFlag';

interface DropdownProps {
  value: string;
  options: Option[];
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  onChange: (value: string) => void;
  align?: 'left' | 'right';
  width?: number | string;
}

export default function Dropdown({
  value, options, placeholder = '- выбрать -',
  searchable = false, searchPlaceholder = 'Поиск...',
  emptyLabel = 'Ничего не найдено',
  onChange, align = 'right', width,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selected = options.find((o) => o.value === value || o.label === value);
  const hasGroups = options.some((o) => !!o.group);

  // Unique groups in order of first appearance
  const groupOrder = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const o of options) {
      if (o.group && !seen.has(o.group)) {
        seen.add(o.group);
        list.push(o.group);
      }
    }
    return list;
  }, [options]);

  // Initialize collapsed state when opening: all collapsed except group of selected value.
  // If nothing selected - expand first group only (to give user an idea).
  useEffect(() => {
    if (!open || !hasGroups) return;
    setCollapsed((prev) => {
      // Only init on first open per session
      if (Object.keys(prev).length > 0) return prev;
      const next: Record<string, boolean> = {};
      const selectedGroup = selected?.group;
      const firstGroup = groupOrder[0];
      for (const g of groupOrder) {
        next[g] = !(g === selectedGroup || (!selectedGroup && g === firstGroup));
      }
      return next;
    });
  }, [open, hasGroups, selected, groupOrder]);

  const toggleGroup = (g: string) => {
    setCollapsed((prev) => ({ ...prev, [g]: !prev[g] }));
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, options]);

  const isSearching = query.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    if (searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, searchable]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((o) => !o);
  };

  const pick = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  // The container width is dynamic (number | string | undefined). We use a CSS
  // variable so the eslint forbid-dom-props rule has exactly one allowed
  // inline-style escape rather than a static `width: 100%` style attribute.
  const widthVar = typeof width === 'number' ? `${width}px` : (width ?? '100%');

  return (
    <div
      ref={wrapRef}
      className="relative w-[var(--dropdown-w)]"
      // eslint-disable-next-line react/forbid-dom-props -- dynamic width
      style={{ ['--dropdown-w' as string]: widthVar }}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        className={`w-full flex items-center gap-2 py-2 pr-3 pl-3.5 h-[38px] border-none rounded-lg cursor-pointer transition-colors duration-150 outline-none text-left font-[var(--font-body)] text-[13px] ${open ? 'bg-[#E8EAEF]' : 'bg-[#EEF0F3] hover:bg-[#E8EAEF]'}`}
      >
        {selected ? (
          <>
            {selected.emoji && <EmojiOrFlag emoji={selected.emoji} size={16} />}
            <span className="flex-1 text-[#1A1A1A] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
              {selected.label}
            </span>
          </>
        ) : (
          <span className="flex-1 text-[#9CA3AF] overflow-hidden text-ellipsis whitespace-nowrap">
            {placeholder}
          </span>
        )}
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <div
          className={`absolute top-[calc(100%+4px)] ${align === 'right' ? 'right-0' : 'left-0'} w-[340px] bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_12px_32px_rgba(0,0,0,0.10),0_4px_12px_rgba(0,0,0,0.05)] z-[100] overflow-hidden animate-[bordik-dropdown-fadein_160ms_cubic-bezier(0.2,0,0,1)]`}
          onClick={(e) => e.stopPropagation()}
        >
          {searchable && (
            <div className="p-2 border-b border-[#F3F4F6] bg-[#FAFAFB]">
              <div className={`flex items-center gap-2 py-[7px] px-2.5 rounded-lg transition-colors duration-150 ${searchFocus ? 'bg-[#E5E7EB]' : 'bg-[#EEF0F3]'}`}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke={searchFocus ? '#6B7280' : '#9CA3AF'} strokeWidth={2}
                  strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 transition-[stroke] duration-150">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  placeholder={searchPlaceholder}
                  className="flex-1 border-none outline-none bg-transparent font-[var(--font-body)] text-[13px] text-[#1A1A1A]"
                />
              </div>
            </div>
          )}
          <div className="max-h-[280px] overflow-y-auto [scrollbar-gutter:stable] p-1">
            {filtered.length === 0 ? (
              <div className="py-3 px-4 font-[var(--font-body)] text-[13px] text-[#9CA3AF] text-center">
                {emptyLabel}
              </div>
            ) : (
              filtered.map((opt, i) => {
                const isActive = selected?.value === opt.value;
                const prev = i > 0 ? filtered[i - 1] : null;
                const showHeader = opt.group && (!prev || prev.group !== opt.group);
                // When searching, all groups are expanded. Otherwise use `collapsed` state.
                const isGroupCollapsed = !isSearching && !!opt.group && !!collapsed[opt.group];

                // Count group items & selected-in-group to show in header badge
                const groupCount = opt.group
                  ? filtered.filter((o) => o.group === opt.group).length
                  : 0;

                return (
                  <div key={opt.value}>
                    {showHeader && opt.group && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(opt.group!)}
                        disabled={isSearching}
                        className={`w-full flex items-center gap-2 px-2.5 pt-2 pb-[5px] ${i === 0 ? 'pt-1.5 mt-0 border-t-0' : 'mt-1 border-t border-[#F3F4F6]'} bg-transparent border-none font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.06em] text-left rounded-none transition-colors duration-[120ms] ${isSearching ? 'cursor-default' : 'cursor-pointer hover:text-[#6B7280]'}`}
                      >
                        {!isSearching && (
                          <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                            className={`shrink-0 transition-transform duration-[160ms] ${isGroupCollapsed ? '-rotate-90' : ''}`}>
                            <polyline points="6,9 12,15 18,9" />
                          </svg>
                        )}
                        <span className="flex-1">{opt.group}</span>
                        <span className="py-px px-1.5 rounded-full bg-[#F3F4F6] text-[#9CA3AF] font-[var(--font-mono)] text-[9px] font-bold">
                          {groupCount}
                        </span>
                      </button>
                    )}
                    {!isGroupCollapsed && (
                      <button
                        type="button"
                        onClick={() => pick(opt.value)}
                        className={`w-full flex items-center gap-2.5 py-[9px] px-2.5 border-none rounded-lg cursor-pointer text-left font-[var(--font-body)] text-[13px] transition-colors duration-[120ms] ${isActive ? 'bg-[#F5F6F8] text-[#1A1A1A] font-semibold' : 'bg-transparent hover:bg-[#F9FAFB] text-[#374151] font-normal'}`}
                      >
                        {opt.emoji && <EmojiOrFlag emoji={opt.emoji} size={16} />}
                        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                          {opt.label}
                        </span>
                        {isActive && (
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                            stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
