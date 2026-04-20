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

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: width ?? '100%' }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px 8px 14px',
          height: 38,
          background: open ? '#E8EAEF' : '#EEF0F3',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'background 150ms',
          outline: 'none',
          textAlign: 'left',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = '#E8EAEF'; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = '#EEF0F3'; }}
      >
        {selected ? (
          <>
            {selected.emoji && <EmojiOrFlag emoji={selected.emoji} size={16} />}
            <span style={{ flex: 1, color: '#1A1A1A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected.label}
            </span>
          </>
        ) : (
          <span style={{ flex: 1, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {placeholder}
          </span>
        )}
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms',
          }}>
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {/* Menu */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: align === 'left' ? 0 : 'auto',
          right: align === 'right' ? 0 : 'auto',
          width: 340,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          boxShadow: '0 12px 32px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.05)',
          zIndex: 100,
          overflow: 'hidden',
          animation: 'bordik-dropdown-fadein 160ms cubic-bezier(0.2,0,0,1)',
        }}
        onClick={(e) => e.stopPropagation()}
        >
          {searchable && (
            <div style={{
              padding: 8, borderBottom: '1px solid #F3F4F6',
              background: '#FAFAFB',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px',
                background: searchFocus ? '#E5E7EB' : '#EEF0F3',
                borderRadius: 8,
                transition: 'background 150ms',
              }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke={searchFocus ? '#6B7280' : '#9CA3AF'} strokeWidth={2}
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, transition: 'stroke 150ms' }}>
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
                  style={{
                    flex: 1,
                    border: 'none', outline: 'none',
                    background: 'transparent',
                    fontFamily: 'var(--font-body)',
                    fontSize: 13, color: '#1A1A1A',
                  }}
                />
              </div>
            </div>
          )}
          <div style={{
            maxHeight: 280,
            overflowY: 'auto',
            scrollbarGutter: 'stable',
            padding: 4,
          }}>
            {filtered.length === 0 ? (
              <div style={{
                padding: '12px 16px',
                fontFamily: 'var(--font-body)', fontSize: 13, color: '#9CA3AF',
                textAlign: 'center',
              }}>
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
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: i === 0 ? '6px 10px 5px' : '8px 10px 5px',
                          marginTop: i === 0 ? 0 : 4,
                          borderTop: i === 0 ? 'none' : '1px solid #F3F4F6',
                          background: 'transparent',
                          border: 'none',
                          cursor: isSearching ? 'default' : 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10, fontWeight: 700,
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          textAlign: 'left',
                          borderRadius: 0,
                          transition: 'color 120ms',
                        }}
                        onMouseEnter={(e) => { if (!isSearching) e.currentTarget.style.color = '#6B7280'; }}
                        onMouseLeave={(e) => { if (!isSearching) e.currentTarget.style.color = '#9CA3AF'; }}
                      >
                        {!isSearching && (
                          <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                            style={{
                              transform: isGroupCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                              transition: 'transform 160ms',
                              flexShrink: 0,
                            }}>
                            <polyline points="6,9 12,15 18,9" />
                          </svg>
                        )}
                        <span style={{ flex: 1 }}>{opt.group}</span>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: 999,
                          background: '#F3F4F6',
                          color: '#9CA3AF',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 9, fontWeight: 700,
                        }}>
                          {groupCount}
                        </span>
                      </button>
                    )}
                    {!isGroupCollapsed && (
                      <button
                        type="button"
                        onClick={() => pick(opt.value)}
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 10px',
                          background: isActive ? '#F5F6F8' : 'transparent',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--font-body)', fontSize: 13,
                          color: isActive ? '#1A1A1A' : '#374151',
                          fontWeight: isActive ? 600 : 400,
                          transition: 'background 120ms',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = '#F9FAFB';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {opt.emoji && <EmojiOrFlag emoji={opt.emoji} size={16} />}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
