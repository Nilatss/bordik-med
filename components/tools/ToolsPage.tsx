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
import { useT } from '@/lib/i18n';
import { useCatalog } from '@/lib/catalog-client';
import {
  buildCategoryCounts,
  buildSubcategoryCounts,
  buildCountryCounts,
  countryMatches,
} from '@/lib/tool-meta-helpers';
import { useToolSearch } from '@/lib/use-tool-search';
import { BulkOfflineDownload } from './BulkOfflineDownload';
import RecentToolsWidget from './RecentToolsWidget';

import { useAppStore } from '@/lib/store';
import type { CatalogTool, FilterKey, Row } from '@/lib/tools-page/types';
import { stripCategoryNumber, EMPTY_CATALOG } from '@/lib/tools-page/helpers';
import { FilterDropdown } from './page/FilterDropdown';
import { ToolCardContext } from './page/ToolCardContext';
import { useResponsiveCols } from './page/useResponsiveCols';
import { buildRows } from './page/buildRows';
import { RenderedRow } from './page/RenderedRow';
import { FilterChip } from './page/FilterChip';

/* FilterDropdown → ./page/FilterDropdown.tsx (P1-CR-3 step 2). */

/* ToolCardContext, CardFavButton, ToolCard → ./page/ (P1-CR-3 step 3). */
/* stripCategoryNumber, EMPTY_CATALOG, getToolCountries → lib/tools-page/helpers.ts (P1-CR-3 step 1). */

/* useResponsiveCols, buildRows, RenderedRow → ./page/ (P1-CR-3 step 4). */

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
  const [bulkOpen, setBulkOpen] = useState(false);
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
  // setOnly callback удалён вместе с UI-кнопкой «Только готовые» (см. ниже).

  // Catalog arrives async via fetch /catalog.meta.json. Until it loads we
  // render skeleton placeholders below; treat as empty array for filter
  // pipeline so all hooks stay mounted in stable order.
  const tools = useCatalog() ?? EMPTY_CATALOG;

  // Sort keys are derived from the live catalog (used to be module-scope).
  const sortKeys = useMemo(() => {
    const cat: Record<string, string> = Object.create(null);
    const tool: Record<string, string> = Object.create(null);
    for (const t of tools) {
      if (!(t.category in cat)) {
        cat[t.category] = t.category.replace(/^\d+\.\s*/, '').toLowerCase();
      }
      tool[t.id] = (t.subcategory + '|' + t.title).toLowerCase();
    }
    return { cat, tool };
  }, [tools]);

  // MiniSearch results (null = index not ready or query empty - fall back
  // to substring match below). The index is fetched once on first keystroke
  // and cached. Subsequent searches are O(log n) with proper relevance,
  // typo tolerance and prefix matching.
  const searchHits = useToolSearch(deferredQuery);

  // Apply filters (deferred so typing stays smooth).
  const filtered = useMemo(() => {
    let result: readonly CatalogTool[] = tools;

    if (deferredQuery.trim()) {
      if (searchHits) {
        // MiniSearch ready - use ranked match
        result = result.filter((t) => searchHits.has(t.id));
      } else {
        // Index still loading or unavailable - fall back to substring scan
        const q = deferredQuery.trim().toLowerCase();
        result = result.filter((t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.subcategory.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      }
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
        if (!t.countries) return false;
        return selectedCountries.some((sel) => countryMatches(t.countries, sel));
      });
    }
    if (onlyAvailable) {
      result = result.filter((t) => t.available || t.hasRunner);
    }
    if (onlyFavourites && favouriteSet.size > 0) {
      result = result.filter((t) => favouriteSet.has(t.id));
    }
    return result;
  }, [tools, deferredQuery, searchHits, selectedCategories, selectedSubcategories, selectedCountries, onlyAvailable, onlyFavourites, favouriteSet]);

  // Group by category. Categories are sorted alphabetically (ignoring the
  // leading "N. " numeric prefix). `localeCompare('ru')` is ~100× slower
  // than plain `<`, so we use lowercased sort keys derived above.
  const byCategory = useMemo(() => {
    const map = new Map<string, CatalogTool[]>();
    for (const t of filtered) {
      const arr = map.get(t.category);
      if (arr) arr.push(t);
      else map.set(t.category, [t]);
    }
    const cats = [...map.keys()].sort((a, b) => {
      const ka = sortKeys.cat[a] ?? a;
      const kb = sortKeys.cat[b] ?? b;
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    const out: { category: string; tools: CatalogTool[] }[] = [];
    for (const c of cats) {
      const arr = map.get(c);
      if (arr) {
        // Sort tools within each category by precomputed key.
        const sorted = [...arr].sort((x, y) => {
          const kx = sortKeys.tool[x.id] ?? '';
          const ky = sortKeys.tool[y.id] ?? '';
          return kx < ky ? -1 : kx > ky ? 1 : 0;
        });
        out.push({ category: c, tools: sorted });
      }
    }
    return out;
  }, [filtered, sortKeys]);

  // Filter dropdown option lists - derived from tools.
  const categoryCounts = useMemo(() => buildCategoryCounts(tools), [tools]);
  const subcategoryCounts = useMemo(() => buildSubcategoryCounts(tools), [tools]);
  const countryCounts = useMemo(() => buildCountryCounts(tools), [tools]);
  // Header pill count
  const readyCount = useMemo(
    () => tools.filter((t) => t.available || t.hasRunner).length,
    [tools],
  );

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

  // Stable Virtuoso callbacks. Without these, every parent re-render handed
  // Virtuoso a new arrow-function for itemContent, which forced it to remount
  // every visible row. With useCallback bound to [cols] only, Virtuoso reuses
  // its row instances across hover, filter typing, scroll updates etc.
  const virtuosoComputeKey = useCallback((_: number, row: Row) => row.key, []);
  const virtuosoItemContent = useCallback(
    (_: number, row: Row) => <RenderedRow row={row} cols={cols} />,
    [cols],
  );

  return (
    <ToolCardContext.Provider value={cardContextValue}>
    <div ref={rootRef} className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        className="mb-5"
      >
        <h2 className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] mb-1.5 tracking-[-0.02em]">
          {t('tools.title')}
        </h2>
        <p className="font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.5]">
          {t('tools.subtitle', {
            ready: readyCount,
            total: tools.length,
            sections: categoryCounts.length,
          })}
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 }}
        className="mb-[14px]"
      >
        <div className="flex items-center gap-2.5 py-2.5 px-4 bg-[#F5F6F8] rounded-[12px] max-w-[480px]">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('tools.search.placeholder')}
            className="flex-1 border-none outline-none bg-transparent font-[var(--font-body)] text-sm text-[#1A1A1A]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="bg-transparent border-none p-0 cursor-pointer text-[#9CA3AF] flex"
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
        className="flex gap-2 flex-wrap items-center mb-5"
      >
        <FilterDropdown
          label={t('tools.filter.sections')}
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
          options={categoryCounts.map((o) => ({ ...o, label: stripCategoryNumber(o.value) }))}
          selected={selectedCategories}
          onChange={setCats}
          open={openFilter === 'cat'}
          onOpen={openCat}
          searchable
        />
        <FilterDropdown
          label={t('tools.filter.specialties')}
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V7a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2v-4"/><circle cx="17" cy="14" r="3"/></svg>}
          options={subcategoryCounts}
          selected={selectedSubcategories}
          onChange={setSubs}
          open={openFilter === 'sub'}
          onOpen={openSub}
          searchable
        />
        <FilterDropdown
          label={t('tools.filter.countries')}
          icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></svg>}
          options={countryCounts}
          selected={selectedCountries}
          onChange={setCous}
          open={openFilter === 'cou'}
          onOpen={openCou}
          searchable
        />

        {/* Фильтр «Только готовые» убран в коммите май-2026: в каталоге
            738/738 готовых, фильтр стал избыточным. setOnly+onlyAvailable
            оставлены в стейте/условиях фильтра — переиспользуем для
            возможных будущих неготовых записей; UI просто не показываем. */}

        <button
          onClick={() => setOnlyFavourites((v) => !v)}
          disabled={favouriteSet.size === 0}
          title={favouriteSet.size === 0 ? t('tools.favoritesEmptyHint') : undefined}
          className={`inline-flex items-center gap-1.5 py-[7px] px-3 border-none rounded-full font-[var(--font-body)] text-xs font-semibold transition-colors duration-[180ms] disabled:cursor-not-allowed ${
            onlyFavourites
              ? 'bg-[#1A1A1A] text-white cursor-pointer'
              : favouriteSet.size === 0
                ? 'bg-[#F5F6F8] text-[#B0B3BA]'
                : 'bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#374151] cursor-pointer'
          }`}
        >
          <svg width={12} height={12} viewBox="0 0 24 24"
            fill={onlyFavourites ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {t('tools.filter.favourites')}{favouriteSet.size > 0 ? ` · ${favouriteSet.size}` : ''}
        </button>

        {/* Bulk-cache trigger - downloads all available tool JSONs into the
            offline cache. Useful for medics about to enter a low-network area. */}
        <button
          onClick={() => setBulkOpen(true)}
          title="Сохранить все доступные инструменты для офлайн"
          className="inline-flex items-center gap-1.5 py-[7px] px-3 bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#374151] border-none rounded-full cursor-pointer font-[var(--font-body)] text-xs font-semibold transition-colors duration-[180ms]"
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Офлайн-пакет
        </button>

        {totalFilters > 0 && (
          <button
            onClick={resetAll}
            className="ml-auto inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-1.5 px-2.5 font-[var(--font-body)] text-xs font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/>
            </svg>
            {t('tools.resetAll')}
          </button>
        )}
      </motion.div>

      {totalFilters > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5 pb-4 border-b border-[#F0F1F5]">
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
            <FilterChip
              label={t('tools.filter.onlyReady')}
              onRemove={() => startFilterTransition(() => setOnlyAvailable(false))}
            />
          )}
        </div>
      )}

      {/* Виджет «Недавние» — top-5 последних использованных инструментов.
          Стоит после поиска и фильтр-бара (по фидбеку), невидим до
          первого open. P0-A6 из аудита. */}
      <RecentToolsWidget catalog={tools} onOpen={openToolAction} />

      {rows.length === 0 ? (
        <div className="py-[60px] px-5 text-center font-[var(--font-body)] text-sm text-[#9CA3AF]">
          {t('tools.noResults')}
        </div>
      ) : (
        <Virtuoso
          // The real scroll container is <main> in app/page.tsx. Using
          // customScrollParent rather than useWindowScroll means Virtuoso
          // listens to scroll events on the right element and renders more
          // rows as the user scrolls. Keeps the native outer scroll - no
          // inner scrollbar is introduced, visuals stay identical.
          {...(scrollParent && { customScrollParent: scrollParent })}
          data={rows}
          increaseViewportBy={{ top: 800, bottom: 1600 }}
          // Restore scroll position when coming back from a tool / course.
          // We persist the (row index, offset) pair and hand it to Virtuoso
          // on mount so the user lands exactly where they were.
          initialTopMostItemIndex={savedScrollIndex && savedScrollIndex < rows.length
            ? { index: savedScrollIndex, offset: savedScrollOffset, align: 'start' }
            : 0}
          rangeChanged={rangeChangedThrottled}
          // Keys are precomputed in buildRows so computeItemKey is O(1) -
          // no per-render string.join() across 500+ tool ids.
          computeItemKey={virtuosoComputeKey}
          itemContent={virtuosoItemContent}
        />
      )}
      {/* Bulk-cache modal mounted at the bottom; rendered via portal-like
          fixed-position div by the component itself. */}
      <BulkOfflineDownload
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        toolIds={tools.filter((t) => t.available || t.hasRunner).map((t) => t.id)}
      />
    </div>
    </ToolCardContext.Provider>
  );
}

/* FilterChip → ./page/FilterChip.tsx (P1-CR-3 step 5). */
