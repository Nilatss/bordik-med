'use client';

/**
 * Drug Interaction Checker — главная UI.
 *
 * UX:
 *   - Поиск-инпут с автокомплитом препаратов
 *   - Селектед-чипы (можно удалять)
 *   - Поддерживается 2-30 препаратов одновременно
 *   - Результаты: список взаимодействий с цветовой кодировкой
 *     severity, расширяемые карточки с механизмом / эффектом /
 *     тактикой / источниками
 *   - Дисклеймер «не заменяет фарм-консультацию»
 *
 * Источники: UpToDate Lexidrug, Stockley's 12th, ESC/AHA guidelines,
 * FDA black box warnings, DrugBank Open Data.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type Drug,
  type DrugInteractionData,
  displayDrugName,
  findInteractions,
  searchDrugs,
  SEVERITY_META,
} from '@/lib/drug-interactions';
import { log } from '@/lib/log';

const MAX_DRUGS = 30;
const MIN_DRUGS = 2;

/**
 * Пресеты для empty-state — классические клинически-значимые
 * комбинации, которые врач может встретить в рутинной практике.
 * Клик по пресету — заполняет селект, мгновенно показывает результат.
 *
 * Подобраны так, чтобы покрыть весь диапазон severity и
 * продемонстрировать все 4 уровня клинического риска.
 */
const EMPTY_PRESETS: Array<{
  label: string;
  hint: string;
  severity: 'contraindicated' | 'major' | 'moderate' | 'minor';
  drugs: string[];
}> = [
  // Отсортировано по убыванию опасности:
  // contraindicated → major → moderate → minor.
  {
    label: 'Симвастатин + Кларитромицин',
    hint: 'Противопоказано: риск рабдомиолиза',
    severity: 'contraindicated',
    drugs: ['simvastatin', 'clarithromycin'],
  },
  {
    label: 'Варфарин + Амиодарон',
    hint: 'Классика: МНО ↑1.5-2 раза, риск кровотечения',
    severity: 'major',
    drugs: ['warfarin', 'amiodarone'],
  },
  {
    label: 'Клопидогрел + Омепразол',
    hint: 'Топ-проблема DAPT: эффект клопидогрела ↓47%',
    severity: 'major',
    drugs: ['clopidogrel', 'omeprazole'],
  },
  {
    label: 'Тройная антитромботическая',
    hint: 'Варфарин + Аспирин + Клопидогрел — после ОКС с ФП',
    severity: 'major',
    drugs: ['warfarin', 'aspirin', 'clopidogrel'],
  },
  {
    label: 'ИАПФ + Спиронолактон',
    hint: 'HFrEF-комбинация: контроль K+ обязателен',
    severity: 'moderate',
    drugs: ['enalapril', 'spironolactone'],
  },
  {
    label: 'Клопидогрел + Пантопразол',
    hint: 'Безопасный ИПП: minor (preferred выбор)',
    severity: 'minor',
    drugs: ['clopidogrel', 'pantoprazole'],
  },
];

/** Запись из CMS Drug Table (Table of Drugs and Chemicals).
 *  Каждая запись = subtance + 6 ICD-10-CM кодов для разных intent. */
interface DrugTableEntry {
  name: string;
  accidental?: string | null;
  intentional?: string | null;
  assault?: string | null;
  undetermined?: string | null;
  adverse?: string | null;
  underdosing?: string | null;
}

export default function DrugChecker() {
  const [data, setData] = useState<DrugInteractionData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drugTable, setDrugTable] = useState<DrugTableEntry[] | null>(null);
  const [showPoisonCodes, setShowPoisonCodes] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // P2-PERF-NEW-2 — drug-interactions JSON (~15MB) парсим в Web Worker
  // через lib/json-worker, чтобы JSON.parse не блокировал UI на ~500ms
  // (заметно на mid-range mobile при cold load). Fallback на main-thread
  // если Worker недоступен (SSR / older browsers).
  //
  // FIX 2026-05-08: реальный размер файла 15.4MB (не 2.5MB как я
  // ошибочно предположил по устаревшему комментарию). Полагаемся на
  // worker default DEFAULT_MAX_BYTES = 50MB — даёт запас на 3x growth.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const url = '/drug-interactions.json?v=0.9.0';
        let json: unknown;
        if (typeof Worker !== 'undefined') {
          const { fetchJsonInWorker } = await import('@/lib/json-worker/client');
          json = await fetchJsonInWorker(url);
        } else {
          const { fetchJsonOnMain } = await import('@/lib/json-worker/client');
          json = await fetchJsonOnMain(url);
        }
        if (!cancelled) setData(json as DrugInteractionData);
      } catch (e) {
        if (!cancelled) setLoadError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Lazy-load Drug Table только когда юзер раскрывает секцию.
  useEffect(() => {
    if (!showPoisonCodes || drugTable) return;
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/icd10cm-drug-table.json?v=1.0.0', { cache: 'force-cache' });
        if (!r.ok) return;
        const json = (await r.json()) as DrugTableEntry[];
        if (!cancelled) setDrugTable(json);
      } catch (e) {
        // Audit B-9: surface silently-swallowed fetch failures.
        log.warn({ event: 'icd10_drug_table_fetch_failed', error: String(e).slice(0, 200) });
      }
    })();
    return () => { cancelled = true; };
  }, [showPoisonCodes, drugTable]);

  const drugById = useMemo(
    () => (data ? new Map(data.drugs.map((d) => [d.id, d])) : new Map<string, Drug>()),
    [data],
  );

  const suggestions = useMemo(() => {
    if (!data || !query.trim()) return [];
    return searchDrugs(query, data.drugs, 8).filter((d) => !selected.includes(d.id));
  }, [data, query, selected]);

  const interactions = useMemo(() => {
    if (!data || selected.length < 2) return [];
    return findInteractions(selected, data);
  }, [data, selected]);

  const summary = useMemo(() => {
    const s = { contraindicated: 0, major: 0, moderate: 0, minor: 0 };
    for (const i of interactions) s[i.severity]++;
    return s;
  }, [interactions]);

  // Audit B-3: functional updaters protect against stale-closure races
  // when the user clicks several suggestions in rapid succession (or
  // hits Enter twice). Pre-fix, each handler captured `selected` from
  // the render that created it; the second click would see the OLD
  // selected[] from the first handler's closure and overwrite the just-
  // appended drug. In a medication-interaction checker, a dropped drug
  // = a missed interaction, so this isn't just polish.
  const addDrug = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.includes(id) || prev.length >= MAX_DRUGS) return prev;
      return [...prev, id];
    });
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  const removeDrug = useCallback((id: string) => {
    setSelected((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelected([]);
    setQuery('');
  }, []);

  if (loadError) {
    return (
      <main id="main-content" className="py-10 px-4">
        <p className="text-[#991B1B]">
          Не удалось загрузить базу взаимодействий: {loadError}
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main id="main-content" className="py-10 px-4">
        <div className="lc-shimmer h-7 w-[320px] rounded-lg mb-3.5" />
        <div className="lc-shimmer h-4 w-[60%] rounded-md mb-6" />
        <div className="lc-shimmer h-14 w-full max-w-[480px] rounded-xl mb-3" />
        <div className="lc-shimmer h-[120px] w-full rounded-[14px]" />
      </main>
    );
  }

  return (
    <main
      id="main-content"
      className="w-full font-[var(--font-body,system-ui)] text-[var(--md-sys-color-on-surface,#1A1A1A)]"
    >
      {/* Header — единый ритм с /tools (h2 28 + body 14 + 24 margin) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-1.5 mb-2.5 px-2.5 py-[3px] bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] rounded-full font-[var(--font-mono,ui-monospace)] text-[10px] font-bold tracking-[0.04em] uppercase">
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          BETA · требует верификации
        </div>
        <h2 className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] tracking-[-0.02em] mt-0 mb-1.5">
          Чекер взаимодействий
        </h2>
        <p className="m-0 font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.5]">
          Проверка совместимости лекарств. Введите 2–{MAX_DRUGS} препарата —
          получите список парных взаимодействий с механизмом, клиническим
          следствием и тактикой.
        </p>
      </motion.div>

      {/* Search input + selected pills — единый pill-pattern с /tools */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 }}
        className="mb-6"
      >
        <div className="bordik-search px-4 py-2.5 bg-[#F5F6F8] rounded-xl flex flex-wrap gap-2 items-center min-h-[44px]">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          {selected.map((id) => {
            const d = drugById.get(id);
            if (!d) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-white border border-[#E5E7EB] rounded-full text-[13px] font-medium text-[#1A1A1A]"
              >
                {displayDrugName(d)}
                <button
                  type="button"
                  onClick={() => removeDrug(id)}
                  aria-label={`Убрать ${displayDrugName(d)}`}
                  className="w-5 h-5 rounded-full bg-[#F3F4F6] border-0 inline-flex items-center justify-center cursor-pointer text-[#6B7280]"
                >
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </span>
            );
          })}

          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={selected.length === 0
              ? 'Например: «Варфарин», «Амиодарон», «Клопидогрел»'
              : selected.length < MAX_DRUGS ? 'Добавить ещё препарат…' : 'Достигнут максимум'}
            disabled={selected.length >= MAX_DRUGS}
            className="flex-1 min-w-[200px] border-0 outline-none bg-transparent font-[var(--font-body)] text-sm text-[#1A1A1A]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && suggestions[0]) {
                e.preventDefault();
                addDrug(suggestions[0].id);
              }
              if (e.key === 'Escape') {
                setShowSuggestions(false);
                setQuery('');
              }
            }}
          />

          {selected.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="px-2.5 py-1 bg-transparent border-0 cursor-pointer font-[var(--font-body)] text-xs font-semibold text-[#6B7280]"
            >
              Очистить
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5 bg-white border border-[#E5E7EB] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] max-w-[600px] overflow-hidden"
            >
              {suggestions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addDrug(d.id)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-transparent hover:bg-[#EFF6FF] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-[120ms]"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-[#1A1A1A]">
                      {displayDrugName(d)}
                    </span>
                    <span className="block mt-0.5 text-xs text-[#6B7280]">
                      {d.class_ru || ''}
                      {(d.aliases?.length ?? 0) > 0 && ` · ${(d.aliases ?? []).slice(0, 3).join(', ')}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-[#9CA3AF]">
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Empty state — пресеты + статистика */}
      {selected.length < MIN_DRUGS && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.12 }}
        >
          {/* Hero CTA — две карточки рядом + подсказка снизу */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3 mb-3">
            {/* Card 1: «Как начать» */}
            <div className="px-5 py-[18px] bg-[#F5F6F8] rounded-[14px] flex items-start gap-3.5">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-white inline-flex items-center justify-center text-[#2563EB] shrink-0">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-[#9CA3AF] tracking-[0.06em] uppercase mb-1">
                  Шаг 1
                </div>
                <h3 className="m-0 font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.4]">
                  Добавьте 2+ препарата
                </h3>
                <p className="mt-1 mb-0 text-[13px] text-[#6B7280] leading-[1.5]">
                  В строке поиска выше. По русскому, английскому или торговому названию.
                </p>
              </div>
            </div>

            {/* Card 2: База знаний */}
            <div className="px-5 py-[18px] bg-[#F5F6F8] rounded-[14px] flex items-start gap-3.5">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-white inline-flex items-center justify-center text-[#2563EB] shrink-0">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v14a9 3 0 0 0 18 0V5" />
                  <path d="M3 12a9 3 0 0 0 18 0" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-[#9CA3AF] tracking-[0.06em] uppercase mb-1">
                  База
                </div>
                <h3 className="m-0 font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.4]">
                  {data.drugs.length.toLocaleString('ru-RU')} препаратов · {data.interactions.length.toLocaleString('ru-RU')} пар
                </h3>
                <p className="mt-1 mb-0 text-[13px] text-[#6B7280] leading-[1.5]">
                  Stockley&apos;s, UpToDate Lexidrug, ESC/AHA Guidelines, FDA.
                </p>
              </div>
            </div>
          </div>

          {/* Inline hint */}
          <div className="flex items-center gap-2 px-3.5 py-2 text-[#6B7280] text-xs leading-[1.5] mb-8">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Не нашли препарат? Попробуйте классические комбинации ниже или поищите по EN-названию.</span>
          </div>

          {/* Готовые пресеты */}
          <div>
            <h3 className="mt-0 mb-4 font-[var(--font-mono,ui-monospace)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
              Попробуйте классические комбинации
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3">
              {EMPTY_PRESETS.map((preset) => {
                const allExist = preset.drugs.every((id) => drugById.has(id));
                if (!allExist) return null;
                const sevMeta = SEVERITY_META[preset.severity];
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelected(preset.drugs)}
                    className="flex flex-col items-start gap-2 p-4 bg-white hover:bg-[#F5F6F8] border border-[#F0F1F5] hover:border-[#E5E7EB] hover:-translate-y-px rounded-xl cursor-pointer text-left font-[inherit] transition-[background-color,border-color,transform] duration-[160ms]"
                  >
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 bg-[var(--sev-bg)] text-[var(--sev-color)] border-0 rounded-full font-[var(--font-mono,ui-monospace)] text-[10px] font-bold tracking-[0.04em] uppercase whitespace-nowrap"
                      // eslint-disable-next-line react/forbid-dom-props -- severity palette per preset
                      style={{ ['--sev-bg' as string]: sevMeta.bg, ['--sev-color' as string]: sevMeta.color }}
                    >
                      {sevMeta.label}
                    </span>
                    <span className="block font-[var(--font-display)] text-sm font-bold text-[#1A1A1A] tracking-[-0.01em] leading-[1.35]">
                      {preset.label}
                    </span>
                    <span className="block text-xs text-[#6B7280] leading-[1.55]">
                      {preset.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary + interactions list */}
      {selected.length >= MIN_DRUGS && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.12 }}
        >
          {/* Summary card */}
          <div className={`px-6 py-4 border-0 rounded-[14px] mb-6 flex items-center gap-4 flex-wrap ${
            interactions.length === 0 ? 'bg-[#ECFDF5]' : 'bg-[#F5F6F8]'
          }`}>
            {interactions.length === 0 ? (
              <>
                <span className="w-9 h-9 rounded-[10px] bg-[#10B981] text-white inline-flex items-center justify-center shrink-0">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="flex-1 min-w-[200px]">
                  <strong className="block text-[15px] text-[#065F46]">
                    Значимых взаимодействий не найдено
                  </strong>
                  <span className="text-xs text-[#047857] mt-0.5 block">
                    Это не означает полную безопасность — база ограничена {data.drugs.length} препаратами.
                    Сверьтесь с фарм-справочником у конкретного пациента.
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="flex-1 min-w-[200px]">
                  <strong className="block text-[15px] text-[#1A1A1A]">
                    Найдено взаимодействий: {interactions.length}
                  </strong>
                  <span className="text-xs text-[#6B7280] mt-1 block">
                    Препаратов: {selected.length} · пар проверено: {(selected.length * (selected.length - 1)) / 2}
                  </span>
                </span>
                <span className="flex gap-1.5 flex-wrap">
                  {(['contraindicated', 'major', 'moderate', 'minor'] as const).map((s) => {
                    if (summary[s] === 0) return null;
                    const meta = SEVERITY_META[s];
                    return (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-[var(--sev-bg)] text-[var(--sev-color)] border-0 rounded-full font-[var(--font-mono,ui-monospace)] text-[11px] font-bold tracking-[0.02em]"
                        // eslint-disable-next-line react/forbid-dom-props -- per-severity palette
                        style={{ ['--sev-bg' as string]: meta.bg, ['--sev-color' as string]: meta.color }}
                      >
                        {meta.label}: {summary[s]}
                      </span>
                    );
                  })}
                </span>
              </>
            )}
          </div>

          {/* Interactions list */}
          {interactions.length > 0 && (
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {interactions.map((i, idx) => {
                const meta = SEVERITY_META[i.severity];
                const id = `${i.drugA}__${i.drugB}`;
                // Карточка expandable только если есть детали для раскрытия
                // (mechanism, management, или нестандартные sources).
                // Для DDInter pairs (только severity) — non-expandable.
                const hasDetails = !!(i.mechanism || i.management
                  || (i.sources && i.sources.length && i.sources[0] !== 'DDInter'));
                const isExpanded = hasDetails && expandedId === id;
                return (
                  <motion.li
                    key={id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1], delay: 0.04 * idx }}
                    className="bg-[#F5F6F8] border border-[#E5E7EB] border-l-[3px] border-l-[var(--sev-accent)] rounded-[14px] overflow-hidden"
                     
                    style={{ ['--sev-accent' as string]: meta.accent }}
                  >
                    {hasDetails ? (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : id)}
                        aria-expanded={isExpanded}
                        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
                      >
                        <InteractionRowContent i={i} meta={meta} hasDetails={hasDetails} isExpanded={isExpanded} />
                      </button>
                    ) : (
                      <div className="flex items-start gap-3.5 px-[18px] py-3.5">
                        <InteractionRowContent i={i} meta={meta} hasDetails={hasDetails} isExpanded={false} />
                      </div>
                    )}

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] },
                            opacity: { duration: 0.18 },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[#E5E7EB] bg-white">
                            {/* Реальная HTML-таблица: парсеры/скринридеры
                                видят семантику, копируется через Ctrl+C
                                в Excel/Word как таблица. */}
                            <table className="w-full border-collapse text-[13px] text-[#374151] leading-[1.55]">
                              <tbody>
                                {i.mechanism && <DetailRow label="Механизм"  value={i.mechanism} />}
                                {i.management && <DetailRow label="Тактика"   value={i.management} />}
                                {i.sources && i.sources.length > 0 && (
                                  <DetailRow
                                    label="Источники"
                                    value={i.sources.join(' · ')}
                                    last
                                  />
                                )}
                              </tbody>
                            </table>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}

      {/* ICD-10-CM Poisoning codes — справочные коды для МКБ кодирования */}
      {selected.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1], delay: 0.1 }}
          className="mt-6 bg-[#F5F6F8] border border-[#E5E7EB] border-l-[3px] border-l-[#2563EB] rounded-[14px] overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setShowPoisonCodes((v) => !v)}
            aria-expanded={showPoisonCodes}
            className="w-full flex items-start gap-3.5 px-4 py-3 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
          >
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border-0 rounded-full font-[var(--font-mono,ui-monospace)] text-[10px] font-bold tracking-[0.04em] uppercase whitespace-nowrap">
                  ICD-10-CM
                </span>
              </span>
              <span className="block font-[var(--font-display)] text-base font-semibold text-[#111827] tracking-[-0.01em] leading-[1.4]">
                Коды для отравлений и побочных действий
              </span>
              <span className="block mt-1 text-[13px] text-[#6B7280] leading-[1.55]">
                По каждому из выбранных препаратов — 6 ICD-10-CM кодов (Случайное / Преднамеренное / Нападение / Неуточнённое / Побочное / Underdosing) для записи в карту пациента.
              </span>
              <span className="block mt-1.5 text-[11px] text-[#9CA3AF] tracking-[0.02em]">
                Source: CMS Table of Drugs and Chemicals (FY2026)
              </span>
            </span>
            <span
              className={`shrink-0 text-[#6B7280] transition-transform duration-200 mt-1.5 ${
                showPoisonCodes ? 'rotate-180' : 'rotate-0'
              }`}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          <AnimatePresence initial={false}>
            {showPoisonCodes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] },
                  opacity: { duration: 0.18 },
                }}
                className="overflow-hidden"
              >
                <div className="border-t border-[#E5E7EB] bg-white px-[18px] py-4">
                  {!drugTable ? (
                    <div className="text-[13px] text-[#6B7280]">Загружаем CMS Drug Table…</div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {selected.map((id) => {
                        const drug = drugById.get(id);
                        if (!drug) return null;
                        const enName = drug.name_en?.toLowerCase().trim() || '';
                        const ruName = drug.name_ru?.toLowerCase().trim() || '';
                        // Match drug table entries by EN name (slim — last word in path)
                        const matches = drugTable.filter((dt) => {
                          const name = dt.name.toLowerCase();
                          // Match if last segment === EN name or contains it
                          const segments = name.split(',').map((s) => s.trim());
                          const last = segments[segments.length - 1] ?? '';
                          return enName && (last === enName || last.startsWith(enName + ' ') || segments.includes(enName))
                            || (ruName && segments.includes(ruName));
                        }).slice(0, 5);
                        return (
                          <div key={id}>
                            <div className="font-[var(--font-display)] text-sm font-semibold text-[#111827] tracking-[-0.005em] mb-2">
                              {displayDrugName(drug)}
                            </div>
                            {matches.length === 0 ? (
                              <div className="text-xs text-[#9CA3AF] italic">
                                Не найдено в CMS Table
                              </div>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                {matches.map((m, idx) => (
                                  <div key={idx} className="bg-[#F5F6F8] rounded-lg px-3 py-2.5">
                                    <div className="text-[11px] text-[#9CA3AF] mb-1.5 tracking-[0.02em]">
                                      {m.name}
                                    </div>
                                    <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-1.5 text-[11px]">
                                      <PoisonCell label="Случайное"     code={m.accidental} />
                                      <PoisonCell label="Преднамеренное" code={m.intentional} />
                                      <PoisonCell label="Нападение"     code={m.assault} />
                                      <PoisonCell label="Неуточнённое"  code={m.undetermined} />
                                      <PoisonCell label="Побочное"      code={m.adverse} />
                                      <PoisonCell label="Underdosing"   code={m.underdosing} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {/* Provenance + disclaimer — единый стиль с /icd10 и /tools */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.18 }}
        aria-labelledby="dc-provenance"
        className="mt-8 px-[22px] py-5 bg-[#F5F6F8] border-0 rounded-[14px] text-[13px] text-[#4B5563] leading-[1.55]"
      >
        <h3 id="dc-provenance" className="mt-0 mb-3.5 font-[var(--font-display)] text-[15px] font-bold text-[#1A1A1A] tracking-[-0.01em]">
          Источник и обновление
        </h3>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-[18px] gap-y-2.5">
          <dt className="text-[#9CA3AF] text-xs">Версия базы</dt>
          <dd className="m-0 text-[#1A1A1A] font-[var(--font-mono,ui-monospace)] text-xs">
            {data.version}
          </dd>
          <dt className="text-[#9CA3AF] text-xs">Обновлено</dt>
          <dd className="m-0 text-[#1A1A1A] font-[var(--font-mono,ui-monospace)] text-xs">
            {data.lastUpdated}
          </dd>
          <dt className="text-[#9CA3AF] text-xs">Источники</dt>
          <dd className="m-0 text-[#1A1A1A]">
            {data.sources.join(' · ')}
          </dd>
          <dt className="text-[#9CA3AF] text-xs">Покрытие</dt>
          <dd className="m-0 text-[#1A1A1A]">
            {data.drugs.length} препаратов · {data.interactions.length} пар
            (только clinically significant).
          </dd>
        </dl>

        <p role="note" className="mt-[18px] mb-0 pt-4 border-t border-[#E5E7EB] text-xs text-[#6B7280] leading-[1.55]">
          <strong className="text-[#1A1A1A]">Не заменяет фарм-консультацию.</strong>{' '}
          Решение по конкретному пациенту принимает врач/клин-фармаколог, опираясь
          на полный клинический контекст, инструкции производителей (ГРЛС Минздрава)
          и индивидуальные особенности пациента (ХБП, печёночная функция,
          генетический полиморфизм CYP, возраст, сопутствующие болезни). Заметили
          ошибку или нужное взаимодействие отсутствует — напишите через «Обратную связь».
        </p>
      </motion.section>
    </main>
  );
}

/** Тело строки взаимодействия (одинаково для button и div вариантов). */
function InteractionRowContent({
  i, meta, hasDetails, isExpanded,
}: {
  i: { drugAName: string; drugBName: string; effect?: string };
  meta: { label: string; bg: string; color: string; border: string };
  hasDetails: boolean;
  isExpanded: boolean;
}) {
  return (
    <>
      <span className="flex-1 min-w-0">
        <span
          className="inline-flex items-center px-2.5 py-[3px] mb-2.5 bg-[var(--sev-bg)] text-[var(--sev-color)] border-0 rounded-full font-[var(--font-mono,ui-monospace)] text-[10px] font-bold tracking-[0.04em] uppercase whitespace-nowrap"
          // eslint-disable-next-line react/forbid-dom-props -- severity palette injected from meta
          style={{ ['--sev-bg' as string]: meta.bg, ['--sev-color' as string]: meta.color }}
        >
          {meta.label}
        </span>
        <span className="block font-[var(--font-display)] text-base font-semibold text-[#111827] tracking-[-0.01em] leading-[1.4]">
          {i.drugAName} + {i.drugBName}
        </span>
        <span className="block mt-1 text-[13px] text-[#6B7280] leading-[1.55]">
          {i.effect ?? `Уровень риска: ${meta.label.toLowerCase()}. Детали уточните у клин-фармаколога.`}
        </span>
      </span>
      {hasDetails && (
        <span
          className={`shrink-0 text-[#6B7280] transition-transform duration-200 mt-1 ${
            isExpanded ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      )}
    </>
  );
}

/** Кликабельная ячейка с ICD-10-CM кодом — копирует код в clipboard.
 *  Визуальный фидбек: 1.2с показываем галочку + «Скопировано», чтобы
 *  пользователь видел что клик отработал. */
function PoisonCell({ label, code }: { label: string; code?: string | null | undefined }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!code) {
    return (
      <div className="px-2 py-1.5 bg-white border border-[#F0F1F5] rounded-md text-[#D1D5DB] text-[10px] text-center">
        <div>{label}</div>
        <div className="mt-0.5">—</div>
      </div>
    );
  }

  const handleCopy = (): void => {
    void navigator.clipboard?.writeText(code)
      .then(() => {
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? `${code} скопирован` : `Скопировать ${code}`}
      aria-live="polite"
      className={`relative px-2.5 py-2 rounded-lg cursor-pointer text-center font-[inherit] transition-[background-color,border-color] duration-150 border ${
        copied ? 'bg-[#DCFCE7] border-[#86EFAC]' : 'bg-white border-[#DBEAFE]'
      }`}
    >
      <div className={`text-[11px] font-medium ${copied ? 'text-[#15803D]' : 'text-[#6B7280]'}`}>
        {copied ? 'Скопировано' : label}
      </div>
      <div className={`mt-[3px] font-[var(--font-mono,ui-monospace)] text-[13px] font-bold inline-flex items-center gap-1 tracking-[0.01em] ${
        copied ? 'text-[#15803D]' : 'text-[#2563EB]'
      }`}>
        {copied && (
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {code}
      </div>
    </button>
  );
}

/**
 * Строка таблицы деталей взаимодействия (Механизм / Тактика / Источники).
 * Реальная семантика <tr><th><td> — для скринридеров и copy-в-Excel.
 * Last row не имеет нижней рамки.
 */
function DetailRow({
  label, value, last,
}: { label: string; value: string; last?: boolean }) {
  // Padding + vertical-align + base bg shared across both cells.
  // Last row drops the bottom border.
  const cellBase = `px-[18px] py-3 align-top ${last ? '' : 'border-b border-b-[#F0F1F5]'}`;
  return (
    <tr>
      <th
        scope="row"
        className={`${cellBase} w-px whitespace-nowrap text-left font-[inherit] text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.06em] bg-[#F9FAFB]`}
      >
        {label}
      </th>
      <td className={`${cellBase} bg-white text-[13px] text-[#1A1A1A] leading-[1.55] font-normal font-[inherit]`}>
        {value}
      </td>
    </tr>
  );
}
