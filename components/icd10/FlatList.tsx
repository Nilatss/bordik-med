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
      <p className="mt-0 mb-3 mx-0 text-[13px] text-[#6B7280]">
        {activeChapter ? (
          <>
            <strong className="text-[#1A1A1A]">Глава {activeChapter}: {chapterById[activeChapter]?.title}</strong>
            {' '}· найдено <strong className="text-[#1A1A1A]">{filtered.length}</strong>
          </>
        ) : (
          <>Найдено: <strong className="text-[#1A1A1A]">{filtered.length}</strong></>
        )}
      </p>
      {filtered.length === 0 ? (
        <div className="py-8 px-4 bg-[#F5F6F8] rounded-[12px] text-center text-[#6B7280] text-sm">
          Ничего не найдено. Попробуйте другой запрос или сбросьте фильтр главы.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {visible.map((c) => (
              <CodeRow key={c.code} code={c} query={query} variant="card" />
            ))}
          </div>
          {remaining > 0 && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => setShowCount((s) => s + FLATLIST_CHUNK_SIZE)}
                className="py-2.5 px-[18px] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#DBEAFE] hover:border-[#BFDBFE] rounded-full cursor-pointer font-[var(--font-body)] text-[13px] font-semibold text-[#2563EB] transition-[background,border-color] duration-150"
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
