'use client';

import { useMemo, useState } from 'react';
import { ArrowRight } from '@/components/icons';
import { CATALOG_TOOLS, TOOL_CATEGORIES, groupBySubcategory, type CatalogTool } from '@/lib/tools-catalog';
import { getRunner } from '@/lib/tools-runners';
import { useAppStore } from '@/lib/store';

export default function ToolsPage() {
  const { openTool } = useAppStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(TOOL_CATEGORIES[0]);

  // Filter by search query across all categories
  const filtered = useMemo(() => {
    if (!query.trim()) return CATALOG_TOOLS;
    const q = query.trim().toLowerCase();
    return CATALOG_TOOLS.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.subcategory.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }, [query]);

  // When searching, show all matching categories. When not, show only active.
  const toolsToShow = useMemo(() => {
    if (query.trim()) return filtered;
    return filtered.filter((t) => t.category === activeCategory);
  }, [filtered, activeCategory, query]);

  const subGroups = useMemo(() => groupBySubcategory(toolsToShow), [toolsToShow]);

  // Count tools per category for sidebar badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of CATALOG_TOOLS) counts[t.category] = (counts[t.category] || 0) + 1;
    return counts;
  }, []);

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
      <div style={{ marginBottom: 20 }}>
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

      {/* Category tabs (horizontal scroll) — hidden during search */}
      {!query.trim() && (
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap',
          marginBottom: 24,
        }}>
          {TOOL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 14px',
                  background: isActive ? '#1A1A1A' : '#F5F6F8',
                  color: isActive ? '#FFFFFF' : '#374151',
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'background 180ms, color 180ms',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#EFF1F4'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '#F5F6F8'; }}
              >
                <span>{cat}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  color: isActive ? 'rgba(255,255,255,0.6)' : '#9CA3AF',
                }}>
                  {categoryCounts[cat] || 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      {toolsToShow.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#9CA3AF',
        }}>
          По запросу «{query}» ничего не найдено
        </div>
      ) : (
        Object.entries(subGroups).map(([subcategory, tools]) => (
          <section key={subcategory} style={{ marginBottom: 28 }}>
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
          </section>
        ))
      )}

    </div>
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
