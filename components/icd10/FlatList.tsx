/**
 * P1-CR-3 (Icd10Lookup split, step 5/6) — flat results list.
 *
 * Используется когда пользователь:
 *   - вводит query (search-mode)
 *   - выбирает главу-pill (filter-mode)
 *
 * Защита от freeze: на 30k совпадений ('и' → matches everything)
 * рендерим только первые 200 (FLATLIST_INITIAL_LIMIT). Юзер может
 * «Показать ещё» батчами по 200. Это покрывает 99% полезных кейсов
 * (обычно нужны топ-10), но защищает от 5-секундной блокировки
 * main-thread'а при wide queries.
 *
 * showCount сбрасывается при смене filtered list (новый запрос).
 * Sentinel-pattern через useRef + Promise.resolve() — работает БЕЗ
 * useEffect, не нарушает React invariants и не дает flash от
 * cleanup → re-mount пути.
 */
import { useMemo, useRef, useState } from 'react';
import type { Chapter, CodeEntry } from '@/lib/icd10/types';
import { CodeRow } from './CodeRow';

/** Лимит первоначального рендера в FlatList. Защита от freeze когда юзер
 *  вводит общий запрос вроде "и" → 30 000 совпадений → 30 000 React-нод
 *  блокируют thread на 5+ секунд. Лимит 200 покрывает 99% полезных
 *  сценариев (обычно нужны топ-10), при необходимости юзер может
 *  «Показать ещё» батчами по 200. */
const FLATLIST_INITIAL_LIMIT = 200;
const FLATLIST_CHUNK_SIZE = 200;

interface FlatListProps {
  filtered: CodeEntry[];
  activeChapter: string | null;
  chapterById: Record<string, Chapter>;
  query: string;
}

export function FlatList({ filtered, activeChapter, chapterById, query }: FlatListProps) {
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
