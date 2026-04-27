'use client';

import React, {
  useMemo, useState, useRef, useEffect, useCallback,
  useDeferredValue, useTransition, startTransition,
} from 'react';
import { Virtuoso } from 'react-virtuoso';
// Per-row fade-in motion. We keep it on the row wrapper (not on every
// internal element) so Virtuoso recycle stays cheap — each card animates
// once when its row mounts; subsequent renders are a no-op.
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from '@/components/icons';
import { useT } from '@/lib/i18n';
import { CATALOG_TOOLS, TOOL_CATEGORIES, type CatalogTool } from '@/lib/tools-catalog';
import {
  TOOL_META,
  CATEGORY_COUNTS,
  SUBCATEGORY_COUNTS,
  COUNTRY_COUNTS,
  countryMatches,
  primaryCountriesFor,
} from '@/lib/tool-meta';
import { useAppStore } from '@/lib/store';
import EmojiOrFlag from '@/components/ui/EmojiOrFlag';

/* ════════════════════════════════════════════════════════════════
   Types
   ════════════════════════════════════════════════════════════════ */

type FilterKey = 'cat' | 'sub' | 'cou' | null;

// ─── Precomputed sort keys (module-scope, runs once on first import) ───
// `localeCompare('ru')` is ~100× slower than `<` on strings, so we bake
// lowercase (with numeric prefix stripped for categories) here and sort
// by plain string comparison in the filter pipeline.
const CATEGORY_SORT_KEY: Record<string, string> = Object.create(null);
for (const t of CATALOG_TOOLS) {
  if (!(t.category in CATEGORY_SORT_KEY)) {
    CATEGORY_SORT_KEY[t.category] = t.category.replace(/^\d+\.\s*/, '').toLowerCase();
  }
}
const TOOL_SORT_KEY: Record<string, string> = Object.create(null);
for (const t of CATALOG_TOOLS) {
  TOOL_SORT_KEY[t.id] = (t.subcategory + '\u0000' + t.title).toLowerCase();
}
// Module-scope constant for the header pill — previous inline
// `CATALOG_TOOLS.filter(...).length` ran on every ToolsPage render.
const READY_COUNT = CATALOG_TOOLS.filter(
  (t) => t.available || (TOOL_META[t.id]?.hasRunner ?? false)
).length;

interface FilterOption {
  value: string;
  count: number;
  /** Optional leading glyph (e.g. country flag emoji) rendered before the label. */
  flag?: string;
  /** Optional pretty label shown to the user (defaults to `value`). Used to
      strip internal "N. " numeric prefixes from categories without breaking
      filter identity. */
  label?: string;
}

/** Strips the leading "N. " numeric prefix from a category string. */
function stripCategoryNumber(label: string): string {
  return label.replace(/^\d+\.\s*/, '');
}

/** One logical row in the virtualised list. Three kinds:
 *  - category header  (h2 "Кардиология 42")
 *  - subcategory header (small uppercase pill "ШКАЛЫ · 8")
 *  - row of up to 3 cards
 *
 *  Rows also carry the enclosing category so we can build unique keys even
 *  when the same subcategory name ("Депрессия") occurs in multiple categories.
 */
type Row =
  | { kind: 'category'; category: string; count: number; key: string }
  | { kind: 'subcategory'; category: string; subcategory: string; count: number; key: string }
  | { kind: 'cards'; category: string; subcategory: string; tools: CatalogTool[]; key: string }
  | { kind: 'empty'; key: string };

/* ════════════════════════════════════════════════════════════════
   Filter popover - memoised
   ════════════════════════════════════════════════════════════════ */

const FilterDropdown = React.memo(function FilterDropdown({
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
                      {opt.label ?? opt.value}
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

/* ════════════════════════════════════════════════════════════════
   Memoised ToolCard. Drops onOpen prop - pulls openTool from the
   store with a shallow selector so parent re-renders don't break memo.
   ════════════════════════════════════════════════════════════════ */

/**
 * Context shared between ToolsPage and every ToolCard. Instead of each
 * card subscribing to `useAppStore` three times (openTool, toggleFav,
 * toolsFavourites), the parent subscribes ONCE and distributes via
 * context. With ~60 cards mounted this cuts store-selector runs by 3×,
 * and Zustand writes unrelated to favourites no longer wake up cards.
 */
interface ToolCardContextValue {
  openTool: (id: string) => void;
  toggleFav: (id: string) => void;
  favouriteSet: ReadonlySet<string>;
}
const ToolCardContext = React.createContext<ToolCardContextValue | null>(null);

// Cache per-tool country tags — parsed once per catalogue entry, reused
// on every ToolCard re-render. The raw countries string is immutable
// metadata; no need to re-parse on every render.
const toolCountriesCache: Record<string, { name: string; flag: string }[]> = Object.create(null);
function getToolCountries(toolId: string): { name: string; flag: string }[] {
  if (toolId in toolCountriesCache) return toolCountriesCache[toolId];
  const meta = TOOL_META[toolId];
  const result = primaryCountriesFor(meta?.countries);
  toolCountriesCache[toolId] = result;
  return result;
}

/**
 * Compact favourite-toggle for the card grid. Shares the amber/gold palette
 * with the in-tool FavouriteButton (TestPanel module-final pill colours):
 *   bg #FEF3C7, fg #D97706, border #FDE68A.
 * Adds the same star-pop + sparkle-burst animation on add - silent on remove.
 */
const CardFavButton = React.memo(function CardFavButton({
  isFavourite, onClick, ariaLabel,
}: {
  isFavourite: boolean;
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
}) {
  const [burstKey, setBurstKey] = useState(0);
  const handleClick = (e: React.MouseEvent) => {
    if (!isFavourite) setBurstKey((k) => k + 1);
    onClick(e);
  };
  const sparkles = useMemo(
    () => Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return { x: Math.cos(angle) * 20, y: Math.sin(angle) * 20 };
    }),
    [],
  );
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 480, damping: 22 }}
      style={{
        width: 26, height: 26, borderRadius: 8,
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: isFavourite ? '#FEF3C7' : '#FFFFFF',
        color: isFavourite ? '#D97706' : '#9CA3AF',
        border: isFavourite ? '1px solid #FDE68A' : '1px solid transparent',
        cursor: 'pointer', flexShrink: 0,
        overflow: 'visible',
        boxShadow: isFavourite
          ? '0 2px 6px rgba(217,119,6,0.18)'
          : '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
        transition: 'background 160ms, color 160ms, box-shadow 160ms, border-color 160ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isFavourite ? '#FDE68A' : '#F5F6F8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isFavourite ? '#FEF3C7' : '#FFFFFF';
      }}
    >
      <motion.span
        animate={isFavourite
          ? { scale: [0.6, 1.4, 1], rotate: [-90, 12, 0] }
          : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease: [0.05, 0.7, 0.1, 1] }}
        style={{ display: 'inline-flex' }}
      >
        <svg width={13} height={13} viewBox="0 0 24 24"
          fill={isFavourite ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={isFavourite ? 0 : 1.9}
          strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </motion.span>
      <AnimatePresence>
        {isFavourite && burstKey > 0 && sparkles.map((s, i) => (
          <motion.span
            key={`${burstKey}-${i}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
            animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.2 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.012 }}
            style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 4, height: 4, marginLeft: -2, marginTop: -2,
              borderRadius: '50%',
              background: i % 2 === 0 ? '#F59E0B' : '#FBBF24',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
});

const ToolCard = React.memo(function ToolCard({ tool }: { tool: CatalogTool }) {
  const t = useT();
  const ctx = React.useContext(ToolCardContext)!;
  const { openTool, toggleFav, favouriteSet } = ctx;
  const isFavourite = favouriteSet.has(tool.id);
  const meta = TOOL_META[tool.id];
  const available = tool.available || (meta?.hasRunner ?? false);
  const countries = getToolCountries(tool.id);

  const handleClick = useCallback(() => {
    if (available) openTool(tool.id);
  }, [available, openTool, tool.id]);

  const handleFavClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFav(tool.id);
  }, [toggleFav, tool.id]);

  // Warm the ToolView chunk on hover so clicking feels instant.
  const handlePrefetch = useCallback(() => {
    if (!available) return;
    import('@/components/tools/ToolView').catch(() => {});
    // also warm the runners module
    import('@/lib/tools-runners').catch(() => {});
  }, [available]);

  return (
    // Plain <button> instead of motion.button — Virtuoso recycles rows on
    // scroll, so each re-mount triggered a fresh fade-up animation per
    // card (60+ cards × framer-motion JS overhead = visible shimmer during
    // fast scroll). A single CSS fade on the parent list is enough; the
    // cards themselves render instantly now.
    <button
      onClick={handleClick}
      onMouseEnter={(e) => {
        handlePrefetch();
        if (available) e.currentTarget.style.background = '#F0F2F5';
      }}
      onFocus={handlePrefetch}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
      disabled={!available}
      style={{
        background: '#F5F6F8',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        border: 'none',
        padding: 'var(--space-5)', textAlign: 'left',
        cursor: available ? 'pointer' : 'not-allowed',
        opacity: available ? 1 : 0.48,
        position: 'relative', overflow: 'hidden', minHeight: 160,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'background 300ms cubic-bezier(0.22,1,0.36,1)',
        // Browser skips layout/paint for off-screen cards - zero visual diff.
        contentVisibility: 'auto',
        containIntrinsicSize: '160px 220px',
      } as React.CSSProperties}
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
          {t('tools.inDevelopment')}
        </div>
      )}

      <div style={{
        marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0,
          flexWrap: 'wrap',
        }}>
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
          {/* Country tags — same pill style as subcategory. The countries
              array is parsed once per tool id and cached (getToolCountries).
              We cap at 2 to keep the card tidy; extra regions show as «+N». */}
          {countries.length > 0 && (() => {
            const visible = countries.slice(0, 2);
            const extra = countries.length - visible.length;
            return (
              <>
                {visible.map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
                      background: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem', fontWeight: 500,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <EmojiOrFlag emoji={c.flag} size={12} />
                    {c.name}
                  </span>
                ))}
                {extra > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 8px', borderRadius: 999,
                    background: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem', fontWeight: 600,
                    color: '#6B7280',
                  }}>
                    +{extra}
                  </span>
                )}
              </>
            );
          })()}
        </div>
        {/* Favourite star — sits on the same row as the subcategory tag so
            it reads as a sibling UI element, not a floating overlay.
            Hidden on unavailable tools so it doesn't collide with the
            absolutely-positioned «Скоро» badge. */}
        {available && (
        <CardFavButton
          isFavourite={isFavourite}
          onClick={handleFavClick}
          ariaLabel={isFavourite ? t('tool.favorite.removeAria') : t('tool.favorite.addAria')}
        />
        )}
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
          {available ? t('tools.openTool') : t('tools.cardInDevelopment')}
        </span>
        {available && <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />}
      </div>
    </button>
  );
});

/* ════════════════════════════════════════════════════════════════
   Build a flat row model from the filtered/grouped tools.
   One row of up to 3 cards → matches the visual 3-col grid.
   ════════════════════════════════════════════════════════════════ */

/* Responsive column count. Hook below tracks viewport width and returns:
     3  → wide desktop (≥ 1400 px)   — big screens breathe
     2  → standard desktop / tablet  — cards stay comfortably wide
     1  → mobile (≤ 620 px)          — single column */
function useResponsiveCols(): number {
  const [cols, setCols] = React.useState(2);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1400) return 3;
      if (w >= 620) return 2;
      return 1;
    };
    setCols(compute());
    const onResize = () => setCols(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return cols;
}

function buildRows(
  byCategory: { category: string; tools: CatalogTool[] }[],
  COLS: number
): Row[] {
  const rows: Row[] = [];
  for (const { category, tools } of byCategory) {
    rows.push({ kind: 'category', category, count: tools.length, key: `c:${category}` });

    // Group by subcategory, preserving first-seen order (for stable UI).
    const order: string[] = [];
    const groups = new Map<string, CatalogTool[]>();
    for (const t of tools) {
      let arr = groups.get(t.subcategory);
      if (!arr) {
        arr = [];
        groups.set(t.subcategory, arr);
        order.push(t.subcategory);
      }
      arr.push(t);
    }

    for (const sub of order) {
      const arr = groups.get(sub)!;
      rows.push({ kind: 'subcategory', category, subcategory: sub, count: arr.length, key: `s:${category}:${sub}` });
      for (let i = 0; i < arr.length; i += COLS) {
        const slice = arr.slice(i, i + COLS);
        // Key includes first tool id + count — stable while filter result
        // order is stable. Avoids per-render .map().join() in computeItemKey.
        const key = `r:${category}:${sub}:${slice[0]?.id ?? ''}:${slice.length}`;
        rows.push({ kind: 'cards', category, subcategory: sub, tools: slice, key });
      }
    }
  }
  return rows;
}

/* ════════════════════════════════════════════════════════════════
   Row renderer for Virtuoso.
   ════════════════════════════════════════════════════════════════ */

function RenderedRow({ row, cols }: { row: Row; cols: number }) {
  if (row.kind === 'empty') return null;

  if (row.kind === 'category') {
    return (
      <div style={{ paddingTop: 14, paddingBottom: 2 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 18, letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          {stripCategoryNumber(row.category)}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
            color: '#9CA3AF',
          }}>
            {row.count}
          </span>
        </h2>
      </div>
    );
  }

  if (row.kind === 'subcategory') {
    return (
      <div style={{ paddingTop: 4 }}>
        <h3 style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 12,
        }}>
          {row.subcategory}
          <span style={{ marginLeft: 8, color: '#D1D5DB' }}>· {row.count}</span>
        </h3>
      </div>
    );
  }

  // Cards row - pad with invisible slots so the grid layout stays consistent.
  const padded = [...row.tools];
  while (padded.length < cols) padded.push(null as unknown as CatalogTool);
  return (
    <div className="tools-row-grid" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 'var(--space-3)',
      marginBottom: 12,
    }}>
      {padded.map((tool, idx) =>
        tool ? (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              // Stagger across cards in the same row so they cascade in.
              delay: idx * 0.04,
              duration: 0.3,
              ease: [0.05, 0.7, 0.1, 1],
            }}
            // Flex column so the inner <button> (default inline-block)
            // stretches to full width via cross-axis stretch — otherwise
            // cards collapse to intrinsic size and rows look broken.
            style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
          >
            <ToolCard tool={tool} />
          </motion.div>
        ) : (
          <div key={`ph-${idx}`} />
        )
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main page
   ════════════════════════════════════════════════════════════════ */

export default function ToolsPage() {
  const t = useT();
  // Filters + scroll + favourites — persisted in the global Zustand store so
  // leaving the tools page (into a tool or a course) and coming back does
  // NOT reset the user's chosen filter. This matches the UX expectation:
  // the list should feel like the same list, not a fresh page every time.
  const query = useAppStore((s) => s.toolsQuery);
  const setQuery = useAppStore((s) => s.setToolsQuery);
  const selectedCategories = useAppStore((s) => s.toolsCategories);
  const setSelectedCategories = useAppStore((s) => s.setToolsCategories);
  const selectedSubcategories = useAppStore((s) => s.toolsSubcategories);
  const setSelectedSubcategories = useAppStore((s) => s.setToolsSubcategories);
  const selectedCountries = useAppStore((s) => s.toolsCountries);
  const setSelectedCountries = useAppStore((s) => s.setToolsCountries);
  const onlyAvailable = useAppStore((s) => s.toolsOnlyAvailable);
  const setOnlyAvailable = useAppStore((s) => s.setToolsOnlyAvailable);

  const [openFilter, setOpenFilter] = useState<FilterKey>(null);
  const [, startFilterTransition] = useTransition();

  // Scroll restore (per-session only — store is NOT persisted to localStorage
  // for these two, see lib/store.ts partialize).
  const savedScrollIndex = useAppStore((s) => s.toolsScrollIndex);
  const savedScrollOffset = useAppStore((s) => s.toolsScrollOffset);
  const setScroll = useAppStore((s) => s.setToolsScroll);
  // Throttle scroll writes — Virtuoso fires `rangeChanged` on every scroll
  // frame. Writing to Zustand on every frame wakes up every subscriber
  // (including this page's own parent) and jank-ifies fast scrolling.
  // We batch the latest index+offset and flush at most every 250 ms.
  const scrollPendingRef = useRef<{ index: number; offset: number } | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const rangeChangedThrottled = useCallback((range: { startIndex: number }) => {
    const parent = document.querySelector('main') as HTMLElement | null;
    const offset = parent?.scrollTop ?? 0;
    scrollPendingRef.current = { index: range.startIndex, offset };
    if (scrollTimerRef.current != null) return;
    scrollTimerRef.current = window.setTimeout(() => {
      if (scrollPendingRef.current) {
        setScroll(scrollPendingRef.current.index, scrollPendingRef.current.offset);
        scrollPendingRef.current = null;
      }
      scrollTimerRef.current = null;
    }, 250);
  }, [setScroll]);
  useEffect(() => () => {
    // Flush on unmount so the last known position is not lost.
    if (scrollTimerRef.current != null) clearTimeout(scrollTimerRef.current);
    if (scrollPendingRef.current) setScroll(scrollPendingRef.current.index, scrollPendingRef.current.offset);
  }, [setScroll]);

  // Favourites — populated by the star toggle on every ToolCard.
  const favourites = useAppStore((s) => s.toolsFavourites);
  const favouriteSet = useMemo(() => new Set(favourites), [favourites]);
  const [onlyFavourites, setOnlyFavourites] = useState(false);
  // Actions the cards need — single subscription each, distributed via
  // context to avoid 3 selectors per card × ~60 visible cards.
  const openToolAction = useAppStore((s) => s.openTool);
  const toggleFavAction = useAppStore((s) => s.toggleFavouriteTool);
  const cardContextValue = useMemo(() => ({
    openTool: openToolAction,
    toggleFav: toggleFavAction,
    favouriteSet,
  }), [openToolAction, toggleFavAction, favouriteSet]);

  // Auto-disable the «Избранные» filter when the last favourite is removed.
  // Otherwise the list stays empty with no obvious way out — the toggle looks
  // active but the user already can't un-favourite it (there's nothing left
  // to un-favourite). Resetting here keeps the UI self-consistent.
  useEffect(() => {
    if (onlyFavourites && favouriteSet.size === 0) setOnlyFavourites(false);
  }, [onlyFavourites, favouriteSet.size]);

  // The page is scrolled by the outer <main> element (see app/page.tsx).
  // Virtuoso needs to watch that element for scroll events - otherwise it
  // never knows the user scrolled and stops rendering after the first batch.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = rootRef.current?.closest('main') as HTMLElement | null;
    if (el) setScrollParent(el);
  }, []);

  // Typing stays smooth; downstream filter recomputation uses the deferred value.
  const deferredQuery = useDeferredValue(query);

  // Warm the heavy ToolView chunk once the tools page is idle. First click
  // into a tool will be instant.
  useEffect(() => {
    const ric: any = (window as any).requestIdleCallback ?? ((cb: any) => setTimeout(cb, 500));
    const cic: any = (window as any).cancelIdleCallback ?? clearTimeout;
    const handle = ric(() => {
      import('@/components/tools/ToolView').catch(() => {});
    });
    return () => { cic(handle); };
  }, []);

  const totalFilters =
    selectedCategories.length + selectedSubcategories.length + selectedCountries.length + (onlyAvailable ? 1 : 0);

  // Stable setters for FilterDropdown.onOpen.
  const openCat = useCallback((v: boolean) => setOpenFilter(v ? 'cat' : null), []);
  const openSub = useCallback((v: boolean) => setOpenFilter(v ? 'sub' : null), []);
  const openCou = useCallback((v: boolean) => setOpenFilter(v ? 'cou' : null), []);

  // Wrap each filter setter in startTransition so a click doesn't
  // block the UI while the list recomputes.
  const setCats = useCallback((v: string[]) => {
    startFilterTransition(() => setSelectedCategories(v));
  }, []);
  const setSubs = useCallback((v: string[]) => {
    startFilterTransition(() => setSelectedSubcategories(v));
  }, []);
  const setCous = useCallback((v: string[]) => {
    startFilterTransition(() => setSelectedCountries(v));
  }, []);
  const setOnly = useCallback((v: boolean) => {
    startFilterTransition(() => setOnlyAvailable(v));
  }, []);

  // Apply filters (deferred so typing stays smooth).
  const filtered = useMemo(() => {
    let result: readonly CatalogTool[] = CATALOG_TOOLS;

    if (deferredQuery.trim()) {
      const q = deferredQuery.trim().toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subcategory.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length) {
      const set = new Set(selectedCategories);
      result = result.filter((t) => set.has(t.category));
    }
    if (selectedSubcategories.length) {
      const set = new Set(selectedSubcategories);
      result = result.filter((t) => set.has(t.subcategory));
    }
    if (selectedCountries.length) {
      // `selectedCountries` now contains PRIMARY country keys (e.g. "Канада"),
      // not raw labels. Match each tool's full country string against every
      // selected primary key via the prefix-aware helper.
      result = result.filter((t) => {
        const c = TOOL_META[t.id]?.countries;
        if (!c) return false;
        return selectedCountries.some((sel) => countryMatches(c, sel));
      });
    }
    if (onlyAvailable) {
      result = result.filter((t) => t.available || (TOOL_META[t.id]?.hasRunner ?? false));
    }
    if (onlyFavourites && favouriteSet.size > 0) {
      result = result.filter((t) => favouriteSet.has(t.id));
    }
    return result;
  }, [deferredQuery, selectedCategories, selectedSubcategories, selectedCountries, onlyAvailable, onlyFavourites, favouriteSet]);

  // Group by category. Categories are sorted alphabetically (ignoring the
  // leading "N. " numeric prefix). `localeCompare('ru')` is ~100× slower
  // than plain `<` — we precomputed lowercased sort keys ONCE at module
  // load (CATEGORY_SORT_KEY, TOOL_SORT_KEY) and compare those instead.
  const byCategory = useMemo(() => {
    const map = new Map<string, CatalogTool[]>();
    for (const t of filtered) {
      const arr = map.get(t.category);
      if (arr) arr.push(t);
      else map.set(t.category, [t]);
    }
    const cats = [...map.keys()].sort((a, b) => {
      const ka = CATEGORY_SORT_KEY[a] ?? a;
      const kb = CATEGORY_SORT_KEY[b] ?? b;
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    const out: { category: string; tools: CatalogTool[] }[] = [];
    for (const c of cats) {
      const arr = map.get(c);
      if (arr) {
        // Sort tools within each category by precomputed key.
        const sorted = [...arr].sort((x, y) => {
          const kx = TOOL_SORT_KEY[x.id];
          const ky = TOOL_SORT_KEY[y.id];
          return kx < ky ? -1 : kx > ky ? 1 : 0;
        });
        out.push({ category: c, tools: sorted });
      }
    }
    return out;
  }, [filtered]);

  // Responsive columns (3 ≥1400 / 2 ≥620 / 1 mobile) — rebuilds rows when
  // viewport width crosses a breakpoint so cards reflow naturally.
  const cols = useResponsiveCols();

  // Flatten into virtualised rows.
  const rows = useMemo(() => buildRows(byCategory, cols), [byCategory, cols]);

  const resetAll = useCallback(() => {
    startTransition(() => {
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      setSelectedCountries([]);
      setOnlyAvailable(false);
      setQuery('');
    });
  }, []);

  return (
    <ToolCardContext.Provider value={cardContextValue}>
    <div ref={rootRef} style={{ width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        style={{ marginBottom: 20 }}
      >
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.02em',
        }}>
          {t('tools.title')}
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280', lineHeight: 1.5,
        }}>
          {t('tools.subtitle', {
            ready: READY_COUNT,
            total: CATALOG_TOOLS.length,
            sections: TOOL_CATEGORIES.length,
          })}
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 }}
        style={{ marginBottom: 14 }}
      >
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
            placeholder={t('tools.search.placeholder')}
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
              aria-label={t('tools.clear')}
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
      </motion.div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.12 }}
        style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <FilterDropdown
          label={t('tools.filter.sections')}
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
          options={CATEGORY_COUNTS.map((o) => ({ ...o, label: stripCategoryNumber(o.value) }))}
          selected={selectedCategories}
          onChange={setCats}
          open={openFilter === 'cat'}
          onOpen={openCat}
          searchable
        />
        <FilterDropdown
          label={t('tools.filter.specialties')}
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V7a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2v-4"/><circle cx="17" cy="14" r="3"/></svg>}
          options={SUBCATEGORY_COUNTS}
          selected={selectedSubcategories}
          onChange={setSubs}
          open={openFilter === 'sub'}
          onOpen={openSub}
          searchable
        />
        <FilterDropdown
          label={t('tools.filter.countries')}
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></svg>}
          options={COUNTRY_COUNTS}
          selected={selectedCountries}
          onChange={setCous}
          open={openFilter === 'cou'}
          onOpen={openCou}
          searchable
        />

        <button
          onClick={() => setOnly(!onlyAvailable)}
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
          {t('tools.filter.onlyReady')}
        </button>

        <button
          onClick={() => setOnlyFavourites((v) => !v)}
          disabled={favouriteSet.size === 0}
          title={favouriteSet.size === 0 ? t('tools.favoritesEmptyHint') : undefined}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px',
            background: onlyFavourites ? '#1A1A1A' : '#F5F6F8',
            color: onlyFavourites ? '#FFFFFF' : favouriteSet.size === 0 ? '#B0B3BA' : '#374151',
            border: 'none', borderRadius: 999,
            cursor: favouriteSet.size === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
            transition: 'background 180ms, color 180ms',
          }}
          onMouseEnter={(e) => { if (!onlyFavourites && favouriteSet.size > 0) e.currentTarget.style.background = '#EFF1F4'; }}
          onMouseLeave={(e) => { if (!onlyFavourites && favouriteSet.size > 0) e.currentTarget.style.background = '#F5F6F8'; }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24"
            fill={onlyFavourites ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {t('tools.filter.favourites')}{favouriteSet.size > 0 ? ` · ${favouriteSet.size}` : ''}
        </button>

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
            {t('tools.resetAll')}
          </button>
        )}
      </motion.div>

      {totalFilters > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: '1px solid #F0F1F5',
        }}>
          {selectedCategories.map((c) => (
            <FilterChip key={`c-${c}`} label={stripCategoryNumber(c)}
              onRemove={() => setCats(selectedCategories.filter((x) => x !== c))} />
          ))}
          {selectedSubcategories.map((c) => (
            <FilterChip key={`s-${c}`} label={c}
              onRemove={() => setSubs(selectedSubcategories.filter((x) => x !== c))} />
          ))}
          {selectedCountries.map((c) => (
            <FilterChip key={`co-${c}`} label={c}
              onRemove={() => setCous(selectedCountries.filter((x) => x !== c))} />
          ))}
          {onlyAvailable && (
            <FilterChip label={t('tools.filter.onlyReady')} onRemove={() => setOnly(false)} />
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div style={{
          padding: '60px 20px', textAlign: 'center',
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#9CA3AF',
        }}>
          {t('tools.noResults')}
        </div>
      ) : (
        <Virtuoso
          // The real scroll container is <main> in app/page.tsx. Using
          // customScrollParent rather than useWindowScroll means Virtuoso
          // listens to scroll events on the right element and renders more
          // rows as the user scrolls. Keeps the native outer scroll - no
          // inner scrollbar is introduced, visuals stay identical.
          customScrollParent={scrollParent ?? undefined}
          data={rows}
          increaseViewportBy={{ top: 800, bottom: 1600 }}
          // Restore scroll position when coming back from a tool / course.
          // We persist the (row index, offset) pair and hand it to Virtuoso
          // on mount so the user lands exactly where they were.
          initialTopMostItemIndex={savedScrollIndex && savedScrollIndex < rows.length
            ? { index: savedScrollIndex, offset: savedScrollOffset, align: 'start' }
            : 0}
          rangeChanged={rangeChangedThrottled}
          // Keys are precomputed in buildRows so computeItemKey is O(1) —
          // no per-render string.join() across 500+ tool ids.
          computeItemKey={(_, row) => row.key}
          itemContent={(_, row) => <RenderedRow row={row} cols={cols} />}
        />
      )}
    </div>
    </ToolCardContext.Provider>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const t = useT();
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
        aria-label={t('tools.remove')}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/>
        </svg>
      </button>
    </span>
  );
}
