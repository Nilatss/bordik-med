'use client';

/**
 * МКБ-10 lookup — поиск + просмотр кодов МКБ-10 по главам.
 *
 * UX (после фидбека май-2026):
 *   - Когда пользователь ничего не ищет (q === '') и нет активной главы —
 *     показываем accordion-список из 22 глав. Каждая глава схлопнута;
 *     клик раскрывает первые 50 кодов главы + кнопка «Показать ещё».
 *     Так база из 500+ кодов не вываливается простыней.
 *   - Когда пользователь начинает печатать или выбирает главу-пилл —
 *     переключаемся на flat-режим со всеми подходящими результатами.
 *
 * Поиск — линейный fuzzy на клиенте; при размере 500 кодов это занимает
 * <1 мс, MiniSearch не нужен.
 */
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Highlight from '@/components/ui/Highlight';
// P1-CR-3 — types + pure helpers вынесены в lib/icd10/. Уменьшает
// главный файл с 946 LOC до ~280 после полного split (6 шагов).
import type { Chapter, CodeEntry, IndexedCode } from '@/lib/icd10/types';
import {
  displayTitle,
  pluralCodes,
  INITIAL_PER_CHAPTER,
  CHUNK_SIZE,
} from '@/lib/icd10/utils';
import { ChapterPill } from './ChapterPill';
import { CodeRow } from './CodeRow';

interface Props {
  chapters: Chapter[];
  codes: CodeEntry[];
  /**
   * Если true — встроенный заголовок "МКБ-10" + подзаголовок не рендерится
   * (используется когда контейнер сам показывает rich-info-card, чтобы
   * не дублировать h2).
   */
  hideHeading?: boolean;
  /** Поля метаданных принимаются для совместимости со старыми callers,
   *  но больше не отображаются (provenance-блок убран по запросу). */
  version?: string;
  lastUpdated?: string;
  source?: string;
}

// IndexedCode + INITIAL_PER_CHAPTER + CHUNK_SIZE вынесены в lib/icd10/.

export default function Icd10Lookup({ chapters, codes, hideHeading = false }: Props) {
  const [q, setQ] = useState('');
  /**
   * useDeferredValue: React помечает фильтрацию как low-priority work.
   * Input всегда обновляется мгновенно (high priority), а тяжёлый
   * filter job планируется на следующий idle. Лаг при печати исчезает.
   */
  const deferredQ = useDeferredValue(q);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  /**
   * Количество подгруженных chunk'ов сверх INITIAL_PER_CHAPTER для каждой
   * главы. По умолчанию 0 (видно только INITIAL_PER_CHAPTER кодов).
   * Каждый клик «Показать ещё» добавляет 1, что показывает +CHUNK_SIZE.
   */
  const [chapterChunks, setChapterChunks] = useState<Map<string, number>>(new Map());
  // Expand state раскрытых кодов хранится локально в каждом CodeRow
  // (useState внутри). Если в будущем понадобится "expand all" или
  // персистентность через URL — сюда вернём общий Set + контекст.

  const isSearching = q.trim().length > 0 || activeChapter !== null;
  /** Когда q отстал от deferredQ — означает что filter ещё не пересчитался.
   *  Используем для лёгкого «мерцания» опасити списка, чтобы юзер видел
   *  что результаты обновляются. */
  const isStale = q !== deferredQ;

  /**
   * Pre-build inverted index: для каждого кода кэшируем lowercased
   * code и title. Делается ОДИН раз при изменении codes (загрузке) —
   * вместо 34k toLowerCase()/replace() на каждый keystroke.
   *
   * На 34k codes: precompute ~50ms, search потом <5ms.
   */
  const indexed = useMemo<IndexedCode[]>(() => {
    const out: IndexedCode[] = [];
    for (const c of codes) {
      const display = displayTitle(c);
      out.push({
        ...c,
        _codeLc: c.code.toLowerCase(),
        _titleLc: display.toLowerCase().replace(/ё/g, 'е'),
      });
    }
    return out;
  }, [codes]);

  // Группировка для accordion-режима
  const codesByChapter = useMemo(() => {
    const map = new Map<string, IndexedCode[]>();
    for (const c of indexed) {
      if (!map.has(c.chapter)) map.set(c.chapter, []);
      map.get(c.chapter)!.push(c);
    }
    return map;
  }, [indexed]);

  // Flat filter + scoring для search-режима. Используем precomputed
  // _codeLc / _titleLc — без runtime toLowerCase на каждом keystroke.
  // useDeferredValue + indexed array → лаг при печати = 0.
  const filtered = useMemo(() => {
    const query = deferredQ.trim().toLowerCase().replace(/ё/g, 'е');
    let pool = indexed;
    if (activeChapter) pool = pool.filter((c) => c.chapter === activeChapter);
    if (!query) return pool;

    // Один проход с собственным scoring + сортировка через стабильную
    // вставку в bucket'ы. Бакеты по score (>>5x быстрее .sort на 34k).
    const buckets: IndexedCode[][] = [[], [], [], [], [], [], []];
    // Индексы: 0=100, 1=80, 2=60, 3=40, 4=20, 5=10, 6=other
    for (const c of pool) {
      const code = c._codeLc;
      const title = c._titleLc;
      let bIdx = -1;
      if (code === query) bIdx = 0;
      else if (code.startsWith(query)) bIdx = 1;
      else if (title.startsWith(query)) bIdx = 2;
      else if (title.includes(' ' + query)) bIdx = 3;
      else if (title.includes(query)) bIdx = 4;
      else if (code.includes(query)) bIdx = 5;
      if (bIdx === -1) continue;
      const bucket = buckets[bIdx];
      if (bucket) bucket.push(c);
    }
    // Внутри каждого bucket — сортируем по code (alphabetic).
    const out: IndexedCode[] = [];
    for (const bucket of buckets) {
      if (!bucket) continue;
      bucket.sort((a, b) => a.code.localeCompare(b.code));
      for (const c of bucket) out.push(c);
    }
    return out;
  }, [deferredQ, activeChapter, indexed]);

  const chapterById = useMemo(
    () => Object.fromEntries(chapters.map((c) => [c.id, c])) as Record<string, Chapter>,
    [chapters],
  );

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const loadMore = (id: string) => {
    setChapterChunks((prev) => {
      const next = new Map(prev);
      next.set(id, (next.get(id) ?? 0) + 1);
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

  return (
    <main
      id="main-content"
      style={{
        // width: 100% без max-width — точно так же, как у /tools.
        // Внешний app-main-inner уже даёт правильные отступы,
        // дополнительный max ограничивал контент и оставлял пустые
        // полосы по краям на широких экранах.
        width: '100%',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--md-sys-color-on-surface, #1A1A1A)',
      }}
    >
      {/* Standard staggered fade-in: header → search → pills → list.
          Тот же паттерн что и в /tools (см. ToolsPage.tsx). */}
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
            МКБ-10
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280', lineHeight: 1.5,
          }}>
            Справочник кодов: поиск по диагнозу или коду. Все 22 главы МКБ-10
            в редакции ВОЗ (русский перевод Минздрава).
          </p>
        </motion.div>
      )}

      {/* Search — F5F6F8 пилл с иконкой и кнопкой очистки */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 }}
        style={{ marginBottom: 14 }}
      >
        <div className="bordik-search" style={{
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
              flex: 1,
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#1A1A1A',
            }}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                cursor: 'pointer', color: '#9CA3AF',
                display: 'flex',
              }}
              aria-label="Очистить поиск"
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

      {/* Главы — фильтр-пиллы */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.12 }}
        style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <ChapterPill
          label="Все главы"
          count={codes.length}
          active={activeChapter === null && !q}
          onClick={() => { setActiveChapter(null); setQ(''); }}
        />
        {chapters.map((ch) => {
          const count = codesByChapter.get(ch.id)?.length ?? 0;
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

      {/* Поведение зависит от режима:
          - Browse: accordion по главам (q='' и activeChapter=null)
          - Filtered: flat-список с активной главой или поиском */}
      {!isSearching ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {chapters.map((ch) => {
            const list = codesByChapter.get(ch.id) ?? [];
            if (list.length === 0) return null;
            const isOpen = expandedChapters.has(ch.id);
            const chunks = chapterChunks.get(ch.id) ?? 0;
            const visibleCount = Math.min(
              INITIAL_PER_CHAPTER + chunks * CHUNK_SIZE,
              list.length,
            );
            const visible = list.slice(0, visibleCount);
            const remaining = list.length - visibleCount;
            return (
              <ChapterAccordion
                key={ch.id}
                chapter={ch}
                count={list.length}
                isOpen={isOpen}
                onToggle={() => toggleChapter(ch.id)}
                visible={visible}
                visibleCount={visibleCount}
                remaining={remaining}
                chunks={chunks}
                onLoadMore={() => loadMore(ch.id)}
                onCollapse={() => collapseChapter(ch.id)}
              />
            );
          })}
        </motion.div>
      ) : (
        <div style={{
          opacity: isStale ? 0.5 : 1,
          transition: 'opacity 120ms',
          pointerEvents: isStale ? 'none' : 'auto',
        }}>
          <FlatList
            filtered={filtered}
            activeChapter={activeChapter}
            chapterById={chapterById}
            query={deferredQ.trim()}
          />
        </div>
      )}

    </main>
  );
}

/* ── Inner components ────────────────────────────────────────────── */

function ChapterAccordion({
  chapter, count, isOpen, onToggle,
  visible, visibleCount, remaining, chunks, onLoadMore, onCollapse,
}: {
  chapter: Chapter;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  visible: CodeEntry[];
  visibleCount: number;
  remaining: number;
  chunks: number;
  onLoadMore: () => void;
  onCollapse: () => void;
}) {
  return (
    <div style={{
      background: '#F5F6F8',
      border: 'none',
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
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{
          flex: '0 0 auto',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 11, fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 999,
          // Soft-blue badge на сером (#F5F6F8) фоне карточки —
          // белый fill держит бейдж читаемым, синий текст соотносится
          // с активной фильтр-пиллой и подсветкой кодов.
          background: '#FFFFFF',
          color: '#2563EB',
          border: '1px solid #DBEAFE',
          letterSpacing: '0.04em',
          minWidth: 60, textAlign: 'center',
        }}>
          {chapter.id}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontSize: 14, fontWeight: 600, color: '#1A1A1A',
            lineHeight: 1.35,
          }}>
            {chapter.title}
          </span>
          <span style={{
            display: 'block', marginTop: 2,
            fontSize: 12, color: '#9CA3AF',
            fontFamily: 'var(--font-mono, ui-monospace)',
          }}>
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
            <div style={{
              borderTop: '1px solid #E5E7EB',
              padding: '8px 0',
            }}>
              {visible.map((c) => (
                <CodeRow key={c.code} code={c} />
              ))}
              {/* Pagination footer: подгружает по CHUNK_SIZE кодов за клик.
                  Защищает от freeze при огромных главах (МКБ-11 0X = 16k). */}
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
                        transition: 'background 150ms, border-color 150ms',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#DBEAFE';
                        e.currentTarget.style.borderColor = '#BFDBFE';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#EFF6FF';
                        e.currentTarget.style.borderColor = '#DBEAFE';
                      }}
                    >
                      {`Показать ещё ${Math.min(CHUNK_SIZE, remaining)} (показано ${visibleCount} из ${count})`}
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
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E5E7EB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F5F6F8';
                      }}
                    >
                      Свернуть до {INITIAL_PER_CHAPTER}
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

// Highlight вынесен в @/components/ui/Highlight (импорт сверху файла).
// Используем общий компонент чтобы стиль/логика подсветки были
// одинаковыми во всех местах поиска платформы.

/** Лимит первоначального рендера в FlatList. Защита от freeze когда юзер
 *  вводит общий запрос вроде "и" → 30 000 совпадений → 30 000 React-нод
 *  блокируют thread на 5+ секунд. Лимит 200 покрывает 99% полезных
 *  сценариев (обычно нужны топ-10), при необходимости юзер может
 *  «Показать ещё» батчами по 200. */
const FLATLIST_INITIAL_LIMIT = 200;
const FLATLIST_CHUNK_SIZE = 200;

function FlatList({
  filtered, activeChapter, chapterById, query,
}: {
  filtered: CodeEntry[];
  activeChapter: string | null;
  chapterById: Record<string, Chapter>;
  query: string;
}) {
  // Локальный state — сбрасывается при изменении filtered (новый поиск).
  const [showCount, setShowCount] = useState(FLATLIST_INITIAL_LIMIT);
  // useMemo чтобы не пересоздавать массив на каждом ре-рендере.
  const visible = useMemo(
    () => filtered.slice(0, showCount),
    [filtered, showCount],
  );
  // Сбрасываем счётчик когда меняется список (новый запрос).
  // Используем useEffect через filtered.length sentinel — debounced
  // через useDeferredValue, не вызывает лишних ре-рендеров.
  const lastLenRef = useRef(filtered.length);
  if (lastLenRef.current !== filtered.length) {
    lastLenRef.current = filtered.length;
    if (showCount !== FLATLIST_INITIAL_LIMIT) {
      // Async чтобы не нарушать React invariants (no setState during render).
      Promise.resolve().then(() => setShowCount(FLATLIST_INITIAL_LIMIT));
    }
  }
  const remaining = filtered.length - showCount;

  return (
    <>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B7280' }}>
        {activeChapter ? (
          <>
            <strong style={{ color: '#1A1A1A' }}>Глава {activeChapter}: {chapterById[activeChapter]?.title}</strong>
            {' '}· найдено <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong>
          </>
        ) : (
          <>Найдено: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong></>
        )}
      </p>
      {filtered.length === 0 ? (
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
      ) : (
        <>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {visible.map((c) => (
              <CodeRow key={c.code} code={c} query={query} variant="card" />
            ))}
          </div>
          {remaining > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setShowCount((s) => s + FLATLIST_CHUNK_SIZE)}
                style={{
                  padding: '10px 18px',
                  background: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  color: '#2563EB',
                  transition: 'background 150ms, border-color 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#DBEAFE';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#EFF6FF';
                  e.currentTarget.style.borderColor = '#DBEAFE';
                }}
              >
                Показать ещё {Math.min(FLATLIST_CHUNK_SIZE, remaining)} (осталось {remaining})
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// CodeRow вынесен в ./CodeRow.tsx
// DetailBlock вынесен в ./DetailBlock.tsx
// ChapterPill вынесен в ./ChapterPill.tsx
// pluralCodes вынесен в lib/icd10/utils.ts
