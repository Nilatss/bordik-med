'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import { ArrowRight } from '@/components/icons';
import { CATALOG_TOOLS, TOOL_CATEGORIES, groupBySubcategory, type CatalogTool } from '@/lib/tools-catalog';
import { getRunner } from '@/lib/tools-runners';
import { useAppStore } from '@/lib/store';

/* ════════════════ Filter popover ════════════════ */

type FilterKey = 'cat' | 'sub' | 'cou' | null;

interface FilterOption {
  value: string;
  count: number;
}

function FilterDropdown({
  label, icon, options, selected, onChange, open, onOpen, searchable = false,
}: {
  label: string;
  icon: React.ReactNode;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  open: boolean;
  onOpen: (next: boolean) => void;
  searchable?: boolean;
}) {
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onOpen]);

  const count = selected.length;
  const filtered = q.trim()
    ? options.filter((o) => o.value.toLowerCase().includes(q.trim().toLowerCase()))
    : options;

  const toggle = (v: string) => {
    if (selected.includes(v)) onChange(selected.filter((s) => s !== v));
    else onChange([...selected, v]);
  };

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
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          background: '#FFFFFF',
          borderRadius: 14,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
          minWidth: 280, maxWidth: 360, maxHeight: 420,
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Optional search */}
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
                placeholder="Поиск..."
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-body)', fontSize: 13, color: '#1A1A1A',
                }}
                autoFocus
              />
            </div>
          )}

          {/* Options list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }}>
            {filtered.length === 0 ? (
              <div style={{
                padding: 20, textAlign: 'center',
                fontFamily: 'var(--font-body)', fontSize: 12, color: '#9CA3AF',
              }}>
                Ничего не найдено
              </div>
            ) : filtered.map((opt) => {
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
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {opt.value}
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

          {/* Footer */}
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
                Сбросить {label.toLowerCase()}
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
}

/* ════════════════ Main page ════════════════ */

export default function ToolsPage() {
  const { openTool } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [openFilter, setOpenFilter] = useState<FilterKey>(null);

  const tools = CATALOG_TOOLS;

  // Unique countries extracted from runner.countries
  const countryOptions = useMemo<FilterOption[]>(() => {
    const counts: Record<string, number> = {};
    for (const t of tools) {
      const runner = getRunner(t.id);
      if (!runner?.countries) continue;
      const list = runner.countries.split(/[·,]/).map((s) => s.trim()).filter(Boolean);
      for (const c of list) counts[c] = (counts[c] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }, [tools]);

  const categoryOptions = useMemo<FilterOption[]>(() => {
    const counts: Record<string, number> = {};
    for (const t of tools) counts[t.category] = (counts[t.category] || 0) + 1;
    return TOOL_CATEGORIES.map((c) => ({ value: c, count: counts[c] || 0 }));
  }, [tools]);

  const subcategoryOptions = useMemo<FilterOption[]>(() => {
    const counts: Record<string, number> = {};
    for (const t of tools) counts[t.subcategory] = (counts[t.subcategory] || 0) + 1;
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [tools]);

  const totalFilters =
    selectedCategories.length + selectedSubcategories.length + selectedCountries.length + (onlyAvailable ? 1 : 0);

  // Apply all filters
  const filtered = useMemo(() => {
    let result = tools;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subcategory.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length) result = result.filter((t) => selectedCategories.includes(t.category));
    if (selectedSubcategories.length) result = result.filter((t) => selectedSubcategories.includes(t.subcategory));
    if (selectedCountries.length) {
      result = result.filter((t) => {
        const runner = getRunner(t.id);
        if (!runner?.countries) return false;
        return selectedCountries.some((c) => runner.countries!.includes(c));
      });
    }
    if (onlyAvailable) result = result.filter((t) => t.available || getRunner(t.id) !== null);
    return result;
  }, [tools, query, selectedCategories, selectedSubcategories, selectedCountries, onlyAvailable]);

  // Group results by category → subcategory
  const byCategory = useMemo(() => {
    const map = new Map<string, CatalogTool[]>();
    for (const t of filtered) {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    }
    // Keep TOOL_CATEGORIES order
    return TOOL_CATEGORIES.filter((c) => map.has(c)).map((c) => ({ category: c, tools: map.get(c)! }));
  }, [filtered]);

  const resetAll = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedCountries([]);
    setOnlyAvailable(false);
    setQuery('');
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.02em',
        }}>
          Инструменты
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280', lineHeight: 1.5,
        }}>
          Полный каталог клинических калькуляторов, шкал, классификаторов и протоколов — {CATALOG_TOOLS.length}+ инструментов по {TOOL_CATEGORIES.length} разделам.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: '#F5F6F8',
          borderRadius: 12,
          maxWidth: 480,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск: BMI, GCS, CHA₂DS₂-VASc, MELD..."
            style={{
              flex: 1,
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#1A1A1A',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                cursor: 'pointer', color: '#9CA3AF',
                display: 'flex',
              }}
              aria-label="Очистить"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        marginBottom: 20,
      }}>
        <FilterDropdown
          label="Разделы"
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
          options={categoryOptions}
          selected={selectedCategories}
          onChange={setSelectedCategories}
          open={openFilter === 'cat'}
          onOpen={(v) => setOpenFilter(v ? 'cat' : null)}
          searchable
        />
        <FilterDropdown
          label="Специализации"
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V7a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2v-4"/><circle cx="17" cy="14" r="3"/></svg>}
          options={subcategoryOptions}
          selected={selectedSubcategories}
          onChange={setSelectedSubcategories}
          open={openFilter === 'sub'}
          onOpen={(v) => setOpenFilter(v ? 'sub' : null)}
          searchable
        />
        <FilterDropdown
          label="Страны"
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></svg>}
          options={countryOptions}
          selected={selectedCountries}
          onChange={setSelectedCountries}
          open={openFilter === 'cou'}
          onOpen={(v) => setOpenFilter(v ? 'cou' : null)}
          searchable
        />

        {/* "Только готовые" toggle */}
        <button
          onClick={() => setOnlyAvailable(!onlyAvailable)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px',
            background: onlyAvailable ? '#1A1A1A' : '#F5F6F8',
            color: onlyAvailable ? '#FFFFFF' : '#374151',
            border: 'none', borderRadius: 999,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
            transition: 'background 180ms, color 180ms',
          }}
          onMouseEnter={(e) => { if (!onlyAvailable) e.currentTarget.style.background = '#EFF1F4'; }}
          onMouseLeave={(e) => { if (!onlyAvailable) e.currentTarget.style.background = '#F5F6F8'; }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Только готовые
        </button>

        {/* Reset all */}
        {totalFilters > 0 && (
          <button
            onClick={resetAll}
            style={{
              marginLeft: 'auto',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: '6px 10px',
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
              color: '#6B7280',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1A1A1A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/>
            </svg>
            Сбросить всё
          </button>
        )}
      </div>

      {/* Selected chips (removable) */}
      {totalFilters > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: '1px solid #F0F1F5',
        }}>
          {selectedCategories.map((c) => (
            <FilterChip key={`c-${c}`} label={c} onRemove={() => setSelectedCategories((s) => s.filter((x) => x !== c))} />
          ))}
          {selectedSubcategories.map((c) => (
            <FilterChip key={`s-${c}`} label={c} onRemove={() => setSelectedSubcategories((s) => s.filter((x) => x !== c))} />
          ))}
          {selectedCountries.map((c) => (
            <FilterChip key={`co-${c}`} label={c} onRemove={() => setSelectedCountries((s) => s.filter((x) => x !== c))} />
          ))}
          {onlyAvailable && (
            <FilterChip label="Только готовые" onRemove={() => setOnlyAvailable(false)} />
          )}
        </div>
      )}

      {/* Results — grouped by category, then by subcategory */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#9CA3AF',
        }}>
          Ничего не найдено по заданным фильтрам
        </div>
      ) : (
        byCategory.map(({ category, tools: catTools }) => {
          const subGroups = groupBySubcategory(catTools);
          return (
            <section key={category} style={{ marginBottom: 32 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
                color: '#1A1A1A', marginBottom: 18, letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'baseline', gap: 8,
              }}>
                {category}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                  color: '#9CA3AF',
                }}>
                  {catTools.length}
                </span>
              </h2>

              {Object.entries(subGroups).map(([subcategory, tools]) => (
                <div key={subcategory} style={{ marginBottom: 24 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
                    marginBottom: 12,
                  }}>
                    {subcategory}
                    <span style={{ marginLeft: 8, color: '#D1D5DB' }}>· {tools.length}</span>
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-3)',
                  }}>
                    {tools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        onOpen={() => openTool(tool.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 6px 5px 12px',
      background: '#EEF2FF',
      color: '#1E3A8A',
      border: 'none', borderRadius: 999,
      fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          background: 'transparent', border: 'none', padding: 0,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#4F46E5',
          width: 16, height: 16, borderRadius: '50%',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#C7D2FE'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        aria-label="Убрать"
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/>
        </svg>
      </button>
    </span>
  );
}

function ToolCard({ tool, onOpen }: { tool: CatalogTool; onOpen: () => void }) {
  // Available if either flagged or has a working runner
  const hasRunner = getRunner(tool.id) !== null;
  const available = tool.available || hasRunner;
  return (
    <button
      onClick={available ? onOpen : undefined}
      disabled={!available}
      style={{
        background: '#F5F6F8',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        border: 'none',
        padding: 'var(--space-5)', textAlign: 'left',
        cursor: available ? 'pointer' : 'not-allowed',
        opacity: available ? 1 : 0.62,
        position: 'relative', overflow: 'hidden', minHeight: 160,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'background 400ms cubic-bezier(0.22,1,0.36,1), transform 400ms cubic-bezier(0.22,1,0.36,1)',
      }}
      onMouseEnter={(e) => {
        if (available) {
          e.currentTarget.style.background = '#F0F2F5';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#F5F6F8';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {!available && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          background: '#1A1A1A',
          color: '#FFFFFF',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          Скоро
        </div>
      )}

      <div style={{ marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
          padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem', fontWeight: 500,
          color: 'var(--md-sys-color-on-surface-variant)',
        }}>
          {tool.subcategory}
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--space-1)', lineHeight: 1.25,
        }}>
          {tool.title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
          color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {tool.description}
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
        marginTop: 'var(--space-3)', position: 'relative', zIndex: 1,
      }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
          color: available ? 'var(--md-sys-color-on-surface)' : '#9CA3AF',
        }}>
          {available ? 'Открыть инструмент' : 'В разработке'}
        </span>
        {available && <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />}
      </div>
    </button>
  );
}
