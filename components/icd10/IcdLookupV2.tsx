'use client';

/**
 * IcdLookup V2 — local-first архитектура с Web Worker + IndexedDB
 * + virtualized rendering. Используется для крупных ICD-датасетов
 * (МКБ-11 34k, ICD-10-CM 73k, etc.) где старая sync-prop модель
 * приводит к лагам на main thread.
 *
 * Архитектура:
 *   1. Web Worker (lib/icd-search/worker.ts) — держит данные,
 *      парсит JSON, строит индекс, выполняет поиск. Никогда не
 *      блокирует main thread.
 *   2. IndexedDB (через worker) — кэш parsed bank. 2-й визит =
 *      instant load из disk, без JSON.parse.
 *   3. @tanstack/react-virtual — рендер только видимых строк
 *      (5-15 одновременно), constant memory regardless of N.
 *   4. Lazy details — definitions грузятся только при клике
 *      на код (не входят в slim payload).
 */

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import Highlight from '@/components/ui/Highlight';
import { getIcdEngine } from '@/lib/icd-search/client';
import type { CodeDetails, SearchResult, SlimCode } from '@/lib/icd-search/worker';

interface Chapter {
  id: string;
  range: string;
  title: string;
}

interface Props {
  slimUrl: string;       // /icd11-slim.json
  detailsUrl?: string;   // /icd11-details.json (lazy)
  idbKey: string;        // 'icd11-mms-v3.2'
  hideHeading?: boolean;
}

const FLAT_PAGE = 200;
const CHAPTER_PAGE = 50;
const CHAPTER_CHUNK = 500;
const ROW_HEIGHT = 64; // approx height of CodeRow

export default function IcdLookupV2({
  slimUrl, detailsUrl, idbKey, hideHeading = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [loadingFromCache, setLoadingFromCache] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const deferredQ = useDeferredValue(q);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultLimit, setResultLimit] = useState(FLAT_PAGE);
  const [searchPending, setSearchPending] = useState(false);

  // Browse mode: per-chapter loaded codes (paginated)
  const [chapterCodes, setChapterCodes] = useState<Record<string, SlimCode[]>>({});
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [chapterChunks, setChapterChunks] = useState<Map<string, number>>(new Map());

  const isSearching = q.trim().length > 0 || activeChapter !== null;
  const isStale = q !== deferredQ;

  // ── Initial load ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const engine = getIcdEngine();
    setLoadingFromCache(true);
    void (async () => {
      try {
        const r = await fetch(slimUrl, { cache: 'force-cache' });
        if (!r.ok) throw new Error(`Slim fetch ${r.status}`);
        const bank = (await r.json()) as { chapters: Chapter[] };
        if (cancelled) return;
        // chapters заранее (для UI) + worker сам прогрузит remaining
        setChapters(bank.chapters);

        const stats = await engine.loadSlim(slimUrl, idbKey);
        if (cancelled) return;
        const counts = await engine.getChapterCounts();
        if (cancelled) return;
        setChapterCounts(counts);
        setLoaded(true);
        setLoadingFromCache(stats.fromCache);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, [slimUrl, idbKey]);

  // ── Search via worker ─────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const trimmed = deferredQ.trim();
    if (!trimmed && !activeChapter) {
      setResults([]);
      setSearchPending(false);
      return;
    }
    let cancelled = false;
    setSearchPending(true);
    const engine = getIcdEngine();
    void engine.search(trimmed, activeChapter, FLAT_PAGE * 5).then((res) => {
      if (cancelled) return;
      setResults(res);
      setSearchPending(false);
      setResultLimit(FLAT_PAGE);
    });
    return () => { cancelled = true; };
  }, [loaded, deferredQ, activeChapter]);

  // ── Browse: load codes for opened chapter ─────────────────────────
  const ensureChapterLoaded = useCallback(async (id: string, want: number) => {
    const have = chapterCodes[id]?.length ?? 0;
    if (have >= want) return;
    const engine = getIcdEngine();
    const next = await engine.getChapterCodes(id, 0, want);
    setChapterCodes((prev) => ({ ...prev, [id]: next }));
  }, [chapterCodes]);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        void ensureChapterLoaded(id, CHAPTER_PAGE);
      }
      return next;
    });
  };

  const loadMoreInChapter = (id: string) => {
    setChapterChunks((prev) => {
      const next = new Map(prev);
      const newChunks = (next.get(id) ?? 0) + 1;
      next.set(id, newChunks);
      void ensureChapterLoaded(id, CHAPTER_PAGE + newChunks * CHAPTER_CHUNK);
      return next;
    });
  };

  const collapseChapter = (id: string) => {
    setChapterChunks((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  // ── Lazy load details bundle on first code expansion ─────────────
  const detailsLoadedRef = useRef(false);
  const triggerDetailsLoad = useCallback(() => {
    if (detailsLoadedRef.current || !detailsUrl) return;
    detailsLoadedRef.current = true;
    const engine = getIcdEngine();
    void engine.loadDetails(detailsUrl);
  }, [detailsUrl]);

  // ── Loading UI ────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{
        padding: 24, borderRadius: 12, background: '#FEF2F2',
        border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить справочник: {error}.
      </div>
    );
  }

  if (!loaded) {
    return (
      <div style={{ padding: '8px 0' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 24 }} />
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
      </div>
    );
  }

  const visibleResults = results.slice(0, resultLimit);
  const remainingResults = results.length - resultLimit;

  return (
    <main id="main-content" style={{
      width: '100%',
      fontFamily: 'var(--font-body, system-ui)',
      color: 'var(--md-sys-color-on-surface, #1A1A1A)',
    }}>
      {!hideHeading && (
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
            Поиск
          </h2>
        </motion.div>
      )}

      {/* Search input */}
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
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Например: "I10", "гипертензия", "пневмония"…'
            aria-label="Поиск кода или диагноза"
            inputMode="search"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: 'inherit', fontSize: 14, color: '#1A1A1A',
            }}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="Очистить поиск"
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#9CA3AF', fontSize: 16, padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>
        {loadingFromCache && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, paddingLeft: 16 }}>
            ⚡ загружено из кэша (instant)
          </div>
        )}
      </motion.div>

      {/* Chapter pills */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.12 }}
        style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          marginBottom: 18,
        }}
      >
        <ChapterPill
          label="Все главы"
          count={Object.values(chapterCounts).reduce((a, b) => a + b, 0)}
          active={activeChapter === null && !q.trim()}
          onClick={() => { setActiveChapter(null); setQ(''); }}
        />
        {chapters.map((ch) => {
          const count = chapterCounts[ch.id] ?? 0;
          if (count === 0) return null;
          return (
            <ChapterPill
              key={ch.id}
              label={`${ch.id} · ${ch.range}`}
              count={count}
              active={activeChapter === ch.id}
              onClick={() => setActiveChapter(activeChapter === ch.id ? null : ch.id)}
            />
          );
        })}
      </motion.div>

      {/* Browse / Search modes */}
      {!isSearching ? (
        <BrowseView
          chapters={chapters}
          chapterCounts={chapterCounts}
          chapterCodes={chapterCodes}
          expandedChapters={expandedChapters}
          chapterChunks={chapterChunks}
          onToggleChapter={toggleChapter}
          onLoadMore={loadMoreInChapter}
          onCollapse={collapseChapter}
          onCodeExpand={triggerDetailsLoad}
        />
      ) : (
        <div style={{
          opacity: isStale || searchPending ? 0.5 : 1,
          transition: 'opacity 120ms',
        }}>
          <ResultsView
            results={visibleResults}
            total={results.length}
            remaining={remainingResults}
            query={deferredQ.trim()}
            onLoadMore={() => setResultLimit((r) => r + FLAT_PAGE)}
            onCodeExpand={triggerDetailsLoad}
          />
        </div>
      )}
    </main>
  );
}

// ─── BrowseView ──────────────────────────────────────────────────────

function BrowseView({
  chapters, chapterCounts, chapterCodes, expandedChapters,
  chapterChunks, onToggleChapter, onLoadMore, onCollapse, onCodeExpand,
}: {
  chapters: Chapter[];
  chapterCounts: Record<string, number>;
  chapterCodes: Record<string, SlimCode[]>;
  expandedChapters: Set<string>;
  chapterChunks: Map<string, number>;
  onToggleChapter: (id: string) => void;
  onLoadMore: (id: string) => void;
  onCollapse: (id: string) => void;
  onCodeExpand: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.18 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      {chapters.map((ch) => {
        const total = chapterCounts[ch.id] ?? 0;
        if (total === 0) return null;
        const isOpen = expandedChapters.has(ch.id);
        const chunks = chapterChunks.get(ch.id) ?? 0;
        const wantLoaded = 50 + chunks * 500;
        const codes = chapterCodes[ch.id] ?? [];
        const visible = codes.slice(0, Math.min(wantLoaded, total));
        const remaining = total - visible.length;
        return (
          <ChapterAccordion
            key={ch.id}
            chapter={ch}
            count={total}
            isOpen={isOpen}
            onToggle={() => onToggleChapter(ch.id)}
            visible={visible}
            visibleCount={visible.length}
            remaining={remaining}
            chunks={chunks}
            onLoadMore={() => onLoadMore(ch.id)}
            onCollapse={() => onCollapse(ch.id)}
            onCodeExpand={onCodeExpand}
          />
        );
      })}
    </motion.div>
  );
}

// ─── ResultsView (virtualized) ───────────────────────────────────────

function ResultsView({
  results, total, remaining, query, onLoadMore, onCodeExpand,
}: {
  results: SearchResult[];
  total: number;
  remaining: number;
  query: string;
  onLoadMore: () => void;
  onCodeExpand: () => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  if (results.length === 0) {
    return (
      <div style={{
        padding: '32px 16px',
        background: '#F5F6F8',
        borderRadius: 12,
        textAlign: 'center',
        color: '#6B7280',
        fontSize: 14,
      }}>
        Ничего не найдено. Попробуйте другой запрос или сбросьте фильтр главы.
      </div>
    );
  }

  return (
    <>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B7280' }}>
        Найдено: <strong style={{ color: '#1A1A1A' }}>{total}</strong>
        {remaining > 0 && (
          <span style={{ color: '#9CA3AF' }}>
            {' '}· показано первых <strong style={{ color: '#1A1A1A' }}>{results.length}</strong>
          </span>
        )}
      </p>
      {/* Виртуализированный контейнер: render only visible rows */}
      <div
        ref={parentRef}
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          position: 'relative',
          contain: 'strict',
        }}
      >
        <div style={{ height: virtualizer.getTotalSize(), width: '100%', position: 'relative' }}>
          {virtualizer.getVirtualItems().map((vrow) => {
            const r = results[vrow.index]!;
            return (
              <div
                key={r.code}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '100%',
                  transform: `translateY(${vrow.start}px)`,
                  paddingBottom: 8,
                }}
              >
                <CodeRow code={r} query={query} variant="card" onCodeExpand={onCodeExpand} />
              </div>
            );
          })}
        </div>
      </div>
      {remaining > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <button
            type="button"
            onClick={onLoadMore}
            style={{
              padding: '10px 18px',
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              color: '#2563EB',
            }}
          >
            Показать ещё {Math.min(FLAT_PAGE, remaining)} (осталось {remaining})
          </button>
        </div>
      )}
    </>
  );
}

// ─── ChapterAccordion ────────────────────────────────────────────────

function ChapterAccordion({
  chapter, count, isOpen, onToggle, visible, visibleCount, remaining,
  chunks, onLoadMore, onCollapse, onCodeExpand,
}: {
  chapter: Chapter;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  visible: SlimCode[];
  visibleCount: number;
  remaining: number;
  chunks: number;
  onLoadMore: () => void;
  onCollapse: () => void;
  onCodeExpand: () => void;
}) {
  return (
    <div style={{
      background: '#F5F6F8',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          background: 'transparent',
          border: 'none', cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
          color: 'inherit',
        }}
      >
        <span style={{
          flex: '0 0 auto', minWidth: 32,
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 11, fontWeight: 700,
          color: '#2563EB',
          background: '#EFF6FF',
          border: '1px solid #DBEAFE',
          padding: '4px 8px', borderRadius: 999,
          textAlign: 'center',
        }}>
          {chapter.id}
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.35 }}>
            {chapter.title}
          </span>
          <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: '#9CA3AF', fontFamily: 'var(--font-mono, ui-monospace)' }}>
            {chapter.range} · {count} {pluralCodes(count)}
          </span>
        </span>
        <span style={{
          flex: '0 0 auto',
          color: '#6B7280',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] },
              opacity: { duration: 0.18 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid #E5E7EB', padding: '8px 0' }}>
              {visible.map((c) => (
                <CodeRow key={c.code} code={c} variant="compact" onCodeExpand={onCodeExpand} />
              ))}
              {(remaining > 0 || chunks > 0) && (
                <div style={{ display: 'flex', gap: 8, padding: '8px 18px 4px', flexWrap: 'wrap' }}>
                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={onLoadMore}
                      style={{
                        padding: '8px 14px',
                        background: '#EFF6FF',
                        border: '1px solid #DBEAFE',
                        borderRadius: 999,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                        color: '#2563EB',
                      }}
                    >
                      Показать ещё {Math.min(500, remaining)} (показано {visibleCount} из {count})
                    </button>
                  )}
                  {chunks > 0 && (
                    <button
                      type="button"
                      onClick={onCollapse}
                      style={{
                        padding: '8px 14px',
                        background: '#F5F6F8',
                        border: '1px solid #E5E7EB',
                        borderRadius: 999,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                        color: '#6B7280',
                      }}
                    >
                      Свернуть до 50
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CodeRow ──────────────────────────────────────────────────────────

function CodeRow({
  code, query, variant = 'compact', onCodeExpand,
}: {
  code: SlimCode | SearchResult;
  query?: string;
  variant?: 'compact' | 'card';
  onCodeExpand?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<CodeDetails | null>(null);
  const [hasDetails, setHasDetails] = useState<boolean | null>(null);

  const isCard = variant === 'card';
  const titleText = code.title;

  const handleClick = useCallback(async () => {
    if (!expanded) {
      onCodeExpand?.();
      // Try to fetch details
      const engine = getIcdEngine();
      const d = await engine.getDetails(code.code);
      const has = d !== null && Object.keys(d).length > 0;
      setHasDetails(has);
      if (has) setDetails(d);
      // Только если есть details — раскрываем
      if (has) setExpanded(true);
    } else {
      setExpanded(false);
    }
  }, [expanded, code.code, onCodeExpand]);

  const containerStyle: React.CSSProperties = isCard ? {
    background: '#FFFFFF',
    border: '1px solid #F0F1F5',
    borderRadius: 14,
    overflow: 'hidden',
    transition: 'border-color 150ms, background 150ms',
  } : {
    transition: 'background 120ms',
  };

  return (
    <div style={containerStyle}>
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={expanded}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: isCard ? '14px 20px' : '10px 20px',
          background: 'transparent',
          border: 'none',
          width: '100%',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
          color: 'inherit',
        }}
      >
        <span style={{
          flex: '0 0 80px',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontWeight: 700, fontSize: isCard ? 13 : 12.5, color: '#2563EB',
          letterSpacing: '0.02em',
        }}>
          {query ? <Highlight text={code.code} query={query} /> : code.code}
        </span>
        <span style={{
          flex: 1, fontSize: isCard ? 14 : 13.5,
          color: '#1A1A1A', lineHeight: 1.45,
        }}>
          {query ? <Highlight text={titleText} query={query} /> : titleText}
        </span>
        {isCard && (
          <span style={{
            flex: '0 0 auto',
            fontFamily: 'var(--font-mono, ui-monospace)',
            fontSize: 11, fontWeight: 700,
            color: '#2563EB',
            background: '#EFF6FF',
            border: '1px solid #DBEAFE',
            padding: '2px 8px', borderRadius: 999,
            whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
          }}>
            {code.chapter}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && details && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.22, ease: [0.05, 0.7, 0.1, 1] },
              opacity: { duration: 0.16 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '14px 20px 18px',
              background: isCard ? '#FAFBFC' : '#FFFFFF',
              borderTop: '1px solid #F0F1F5',
              fontSize: 13.5, lineHeight: 1.55, color: '#374151',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {details.definition && (
                <DetailBlock label="Определение">{details.definition}</DetailBlock>
              )}
              {details.longDefinition && details.longDefinition !== details.definition && (
                <DetailBlock label="Описание">{details.longDefinition}</DetailBlock>
              )}
              {!details.definition && details.inheritedDefinition && (
                <DetailBlock label={`Определение (от родителя ${details.inheritedFrom ?? ''})`}>
                  {details.inheritedDefinition}
                </DetailBlock>
              )}
              {details.codingNote && (
                <DetailBlock label="Заметка по кодированию" tone="warning">
                  {details.codingNote}
                </DetailBlock>
              )}
              {details.inclusion && details.inclusion.length > 0 && (
                <DetailBlock label="Включает">
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {details.inclusion.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </DetailBlock>
              )}
              {details.exclusion && details.exclusion.length > 0 && (
                <DetailBlock label="Не включает (исключения)">
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {details.exclusion.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </DetailBlock>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailBlock({
  label, tone = 'neutral', children,
}: {
  label: string;
  tone?: 'neutral' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: tone === 'warning' ? '#92400E' : '#9CA3AF',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ color: tone === 'warning' ? '#78350F' : '#374151' }}>
        {children}
      </div>
    </div>
  );
}

function ChapterPill({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px',
        background: active ? '#2563EB' : '#F5F6F8',
        color: active ? '#FFFFFF' : '#1A1A1A',
        border: 'none', borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.02em',
        transition: 'background 150ms, color 150ms',
      }}
    >
      <span>{label}</span>
      <span style={{
        fontSize: 10, fontWeight: 700,
        opacity: active ? 0.85 : 0.55,
      }}>
        {count}
      </span>
    </button>
  );
}

function pluralCodes(n: number): string {
  const tail = n % 100;
  if (tail >= 11 && tail <= 14) return 'кодов';
  const last = n % 10;
  if (last === 1) return 'код';
  if (last >= 2 && last <= 4) return 'кода';
  return 'кодов';
}
