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
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Highlight from '@/components/ui/Highlight';

interface Chapter {
  id: string;
  range: string;
  title: string;
}

interface CodeEntry {
  code: string;
  title: string;
  chapter: string;
  // Опциональные поля (используются для МКБ-11 после Phase 2 enrichment).
  title_ru?: string;
  definition?: string;
  longDefinition?: string;
  codingNote?: string;
  inclusion?: string[];
  exclusion?: string[];
}

/**
 * Возвращает отображаемое название кода. Приоритет: title_ru > title.
 * Заодно убирает hierarchical markers ("- ", "- - ") из simpleTabulation
 * экспорта МКБ-11.
 */
function displayTitle(c: CodeEntry): string {
  const t = c.title_ru || c.title;
  return t.replace(/^[-–—\s]+/, '').trim();
}

interface Props {
  chapters: Chapter[];
  codes: CodeEntry[];
  version: string;
  lastUpdated: string;
  source: string;
  /**
   * Если true — встроенный заголовок "МКБ-10" + подзаголовок не рендерится
   * (используется когда контейнер сам показывает rich-info-card, чтобы
   * не дублировать h2).
   */
  hideHeading?: boolean;
}

const INITIAL_PER_CHAPTER = 50;

export default function Icd10Lookup({ chapters, codes, version, lastUpdated, source, hideHeading = false }: Props) {
  const [q, setQ] = useState('');
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [chapterShowAll, setChapterShowAll] = useState<Set<string>>(new Set());
  /** Раскрытые коды — показывают definition / inclusion / exclusion панель. */
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());

  const toggleCode = (code: string) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };

  const isSearching = q.trim().length > 0 || activeChapter !== null;

  // Группировка для accordion-режима
  const codesByChapter = useMemo(() => {
    const map = new Map<string, CodeEntry[]>();
    for (const c of codes) {
      if (!map.has(c.chapter)) map.set(c.chapter, []);
      map.get(c.chapter)!.push(c);
    }
    return map;
  }, [codes]);

  // Flat filter + scoring для search-режима. Логика как в Cmd+K и
  // сайдбар-поиске: точные совпадения вверх, префиксы выше, includes
  // ниже. ё→е normalize чтобы «гипер» и «гипёр» были одним.
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase().replace(/ё/g, 'е');
    let pool = codes;
    if (activeChapter) pool = pool.filter((c) => c.chapter === activeChapter);
    if (!query) return pool;

    type Scored = { c: CodeEntry; score: number };
    const scored: Scored[] = [];
    for (const c of pool) {
      const code = c.code.toLowerCase();
      const title = displayTitle(c).toLowerCase().replace(/ё/g, 'е');
      let score = 0;
      // 100 — точное совпадение кода (I10 → I10)
      if (code === query) score = 100;
      // 80 — код начинается с query (I → I10, I20, I21...)
      else if (code.startsWith(query)) score = 80;
      // 60 — название начинается с query (гипер → гипертензия)
      else if (title.startsWith(query)) score = 60;
      // 40 — слово в названии начинается с query (после пробела)
      else if (title.includes(' ' + query)) score = 40;
      // 20 — substring (гипер → эссенциальная гипертензия)
      else if (title.includes(query)) score = 20;
      // 10 — substring в коде (редко: I.0 → I20.0, I21.0)
      else if (code.includes(query)) score = 10;
      else continue;
      scored.push({ c, score });
    }
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.c.code.localeCompare(b.c.code);
    });
    return scored.map((s) => s.c);
  }, [q, activeChapter, codes]);

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

  const toggleShowAll = (id: string) => {
    setChapterShowAll((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
            const showAll = chapterShowAll.has(ch.id);
            const visible = showAll ? list : list.slice(0, INITIAL_PER_CHAPTER);
            return (
              <ChapterAccordion
                key={ch.id}
                chapter={ch}
                count={list.length}
                isOpen={isOpen}
                onToggle={() => toggleChapter(ch.id)}
                visible={visible}
                hasMore={list.length > INITIAL_PER_CHAPTER}
                showAll={showAll}
                onToggleShowAll={() => toggleShowAll(ch.id)}
              />
            );
          })}
        </motion.div>
      ) : (
        <FlatList
          filtered={filtered}
          activeChapter={activeChapter}
          chapterById={chapterById}
          query={q.trim()}
        />
      )}

      {/* Provenance */}
      <section
        aria-labelledby="icd10-provenance"
        style={{
          marginTop: 32,
          padding: '20px 22px',
          background: '#F5F6F8',
          border: 'none',
          borderRadius: 14,
          fontSize: 13,
          color: '#4B5563',
          lineHeight: 1.55,
        }}
      >
        <h3
          id="icd10-provenance"
          style={{
            margin: '0 0 14px',
            fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 700, color: '#1A1A1A',
            letterSpacing: '-0.01em',
          }}
        >
          Источник и обновление
        </h3>
        <dl style={{
          margin: 0, display: 'grid',
          gridTemplateColumns: 'auto 1fr', columnGap: 18, rowGap: 10,
        }}>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Версия базы</dt>
          <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 12 }}>{version}</dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Обновлено</dt>
          <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 12 }}>{lastUpdated}</dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Источник</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>{source}</dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Покрытие</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            Все 22 главы + {codes.length} наиболее частых кодов. Полная база
            (~14 000 кодов) — <a href="/docs/CONTENT_ROADMAP.md" style={{ color: '#1A1A1A', textDecoration: 'underline', textUnderlineOffset: 2 }}>в дорожной карте</a>.
          </dd>
        </dl>
        <p
          role="note"
          style={{
            marginTop: 18, paddingTop: 16,
            borderTop: '1px solid #E5E7EB',
            fontSize: 12, color: '#6B7280', lineHeight: 1.5,
          }}
        >
          <strong style={{ color: '#1A1A1A' }}>Не заменяет клиническое суждение.</strong>{' '}
          Кодирование диагноза должно опираться на полный клинический контекст
          и официальные методические рекомендации Минздрава. Заметили ошибку
          или нужный код отсутствует — напишите через «Обратную связь».
        </p>
      </section>
    </main>
  );
}

/* ── Inner components ────────────────────────────────────────────── */

function ChapterAccordion({
  chapter, count, isOpen, onToggle,
  visible, hasMore, showAll, onToggleShowAll,
}: {
  chapter: Chapter;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  visible: CodeEntry[];
  hasMore: boolean;
  showAll: boolean;
  onToggleShowAll: () => void;
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
              {hasMore && (
                <button
                  type="button"
                  onClick={onToggleShowAll}
                  style={{
                    margin: '8px 18px',
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
                  {showAll
                    ? `Свернуть до первых ${INITIAL_PER_CHAPTER}`
                    : `Показать все ${count} кодов главы`}
                </button>
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

function FlatList({
  filtered, activeChapter, chapterById, query,
}: {
  filtered: CodeEntry[];
  activeChapter: string | null;
  chapterById: Record<string, Chapter>;
  query: string;
}) {
  return (
    <>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B7280' }}>
        Найдено: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong>
        {activeChapter ? <> · Глава {activeChapter}: {chapterById[activeChapter]?.title}</> : null}
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
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {filtered.map((c) => (
            <CodeRow key={c.code} code={c} query={query} variant="card" />
          ))}
        </div>
      )}
    </>
  );
}

function CodeRow({
  code, query, variant = 'compact',
}: {
  code: CodeEntry;
  query?: string;
  variant?: 'compact' | 'card';
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!(code.definition || code.longDefinition || code.codingNote
    || (code.inclusion && code.inclusion.length)
    || (code.exclusion && code.exclusion.length));
  const isCard = variant === 'card';
  const titleText = displayTitle(code);

  // Compact (внутри ChapterAccordion) и Card (в FlatList search results) —
  // одна и та же модель, но разная плотность.
  const containerStyle: React.CSSProperties = isCard ? {
    background: '#FFFFFF',
    border: '1px solid #F0F1F5',
    borderRadius: 14,
    overflow: 'hidden',
    transition: 'border-color 150ms, background 150ms',
  } : {
    transition: 'background 120ms',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: isCard ? '14px 20px' : '10px 20px',
    background: 'transparent',
    border: 'none',
    width: '100%',
    cursor: hasDetails ? 'pointer' : 'default',
    textAlign: 'left',
    fontFamily: 'inherit',
    color: 'inherit',
  };

  const TitleNode = query
    ? <Highlight text={titleText} query={query} />
    : titleText;

  return (
    <div
      style={containerStyle}
      onMouseEnter={(e) => {
        if (isCard) {
          e.currentTarget.style.background = '#F5F6F8';
          e.currentTarget.style.borderColor = '#E2E4EA';
        } else {
          e.currentTarget.style.background = '#F5F6F8';
        }
      }}
      onMouseLeave={(e) => {
        if (isCard) {
          e.currentTarget.style.background = '#FFFFFF';
          e.currentTarget.style.borderColor = '#F0F1F5';
        } else {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <button
        type="button"
        onClick={() => { if (hasDetails) setExpanded((v) => !v); }}
        aria-expanded={hasDetails ? expanded : undefined}
        style={headerStyle}
      >
        <span style={{
          flex: '0 0 80px',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontWeight: 700, fontSize: isCard ? 13 : 13, color: '#2563EB',
          letterSpacing: '0.02em',
        }}>
          {query ? <Highlight text={code.code} query={query} /> : code.code}
        </span>
        <span style={{
          flex: 1, fontSize: isCard ? 14 : 13.5,
          color: '#1A1A1A', lineHeight: 1.45,
        }}>
          {TitleNode}
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
        {hasDetails && (
          <span style={{
            flex: '0 0 auto',
            color: '#9CA3AF',
            fontSize: 12,
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 150ms',
            display: 'inline-flex',
          }} aria-hidden>
            ▶
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {hasDetails && expanded && (
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
              {code.definition && (
                <DetailBlock label="Определение">
                  {code.definition}
                </DetailBlock>
              )}
              {code.longDefinition && code.longDefinition !== code.definition && (
                <DetailBlock label="Описание">
                  {code.longDefinition}
                </DetailBlock>
              )}
              {code.codingNote && (
                <DetailBlock label="Заметка по кодированию" tone="warning">
                  {code.codingNote}
                </DetailBlock>
              )}
              {code.inclusion && code.inclusion.length > 0 && (
                <DetailBlock label="Включает">
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {code.inclusion.map((x, i) => <li key={i}>{x}</li>)}
                  </ul>
                </DetailBlock>
              )}
              {code.exclusion && code.exclusion.length > 0 && (
                <DetailBlock label="Не включает (исключения)">
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {code.exclusion.map((x, i) => <li key={i}>{x}</li>)}
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
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: tone === 'warning' ? '#92400E' : '#9CA3AF',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        color: tone === 'warning' ? '#78350F' : '#374151',
      }}>
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
      style={{
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '7px 12px',
        // Активная — синяя (тон совпадает с soft-blue badge номера
        // главы), неактивная — стандартный серый F5F6F8 чип.
        background: active ? '#2563EB' : '#F5F6F8',
        color: active ? '#FFFFFF' : '#374151',
        border: '1px solid transparent',
        borderColor: active ? '#2563EB' : 'transparent',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'background 180ms, color 180ms, border-color 180ms',
        boxShadow: active ? '0 1px 2px rgba(37,99,235,0.18)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (active) e.currentTarget.style.background = '#1D4ED8';
        else e.currentTarget.style.background = '#EFF1F4';
      }}
      onMouseLeave={(e) => {
        if (active) e.currentTarget.style.background = '#2563EB';
        else e.currentTarget.style.background = '#F5F6F8';
      }}
    >
      <span>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono, ui-monospace)',
        fontSize: 10, fontWeight: 700,
        color: active ? 'rgba(255,255,255,0.78)' : '#9CA3AF',
        letterSpacing: '0.02em',
      }}>
        {count}
      </span>
    </button>
  );
}

function pluralCodes(n: number): string {
  const m100 = n % 100;
  const m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return 'кодов';
  if (m10 === 1) return 'код';
  if (m10 >= 2 && m10 <= 4) return 'кода';
  return 'кодов';
}
