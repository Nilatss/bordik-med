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

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type Drug,
  type DrugInteractionData,
  displayDrugName,
  findInteractions,
  searchDrugs,
  SEVERITY_META,
} from '@/lib/drug-interactions';

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

  // Грузим базу с ?v= cache-bust для обхода SW precache.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/drug-interactions.json?v=0.9.0', { cache: 'no-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
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
      } catch { /* */ }
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

  const addDrug = (id: string) => {
    if (selected.includes(id) || selected.length >= MAX_DRUGS) return;
    setSelected([...selected, id]);
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeDrug = (id: string) => {
    setSelected(selected.filter((x) => x !== id));
  };

  const clearAll = () => {
    setSelected([]);
    setQuery('');
  };

  if (loadError) {
    return (
      <main id="main-content" style={{ padding: '40px 16px' }}>
        <p style={{ color: '#991B1B' }}>
          Не удалось загрузить базу взаимодействий: {loadError}
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main id="main-content" style={{ padding: '40px 16px' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 320, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 24 }} />
        <div className="lc-shimmer" style={{ height: 56, width: '100%', maxWidth: 480, borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 120, width: '100%', borderRadius: 14 }} />
      </main>
    );
  }

  return (
    <main
      id="main-content"
      style={{
        width: '100%',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--md-sys-color-on-surface, #1A1A1A)',
      }}
    >
      {/* Header — единый ритм с /tools (h2 28 + body 14 + 20 margin) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        style={{ marginBottom: 20 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginBottom: 10,
          padding: '3px 10px',
          background: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #FDE68A',
          borderRadius: 999,
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 10, fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          BETA · требует верификации
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.02em',
          margin: '0 0 6px',
        }}>
          Чекер взаимодействий
        </h2>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280', lineHeight: 1.5,
        }}>
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
        style={{ marginBottom: 24 }}
      >
        <div style={{
          padding: '10px 16px',
          background: '#F5F6F8',
          borderRadius: 12,
          display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
          minHeight: 44,
        }}>
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
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 6px 4px 12px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 999,
                  fontSize: 13, fontWeight: 500,
                  color: '#1A1A1A',
                }}
              >
                {displayDrugName(d)}
                <button
                  type="button"
                  onClick={() => removeDrug(id)}
                  aria-label={`Убрать ${displayDrugName(d)}`}
                  style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#F3F4F6', border: 'none',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#6B7280',
                  }}
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
            style={{
              flex: 1, minWidth: 200,
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#1A1A1A',
            }}
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
              style={{
                padding: '4px 10px',
                background: 'transparent', border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                color: '#6B7280',
              }}
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
              style={{
                marginTop: 6,
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                maxWidth: 600,
                overflow: 'hidden',
              }}
            >
              {suggestions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addDrug(d.id)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: 'block',
                      fontSize: 14, fontWeight: 600, color: '#1A1A1A',
                    }}>
                      {displayDrugName(d)}
                    </span>
                    <span style={{
                      display: 'block', marginTop: 2,
                      fontSize: 12, color: '#6B7280',
                    }}>
                      {d.class_ru || ''}
                      {(d.aliases?.length ?? 0) > 0 && ` · ${(d.aliases ?? []).slice(0, 3).join(', ')}`}
                    </span>
                  </span>
                  <span style={{ flexShrink: 0, color: '#9CA3AF' }}>
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
          {/* Hero CTA — компактная подсказка над пресетами */}
          <div style={{
            padding: '20px 22px',
            background: '#F5F6F8',
            borderRadius: 14,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#FFFFFF',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#2563EB',
              flexShrink: 0,
            }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.5 20.5L20 11a4.95 4.95 0 00-7-7L3.5 13.5a4.95 4.95 0 007 7z" />
                <path d="M8.5 8.5l7 7" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                margin: 0,
                fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                color: '#1A1A1A', letterSpacing: '-0.01em',
                lineHeight: 1.35,
              }}>
                Добавьте 2+ препарата для проверки
              </h3>
              <p style={{
                margin: '4px 0 0',
                fontSize: 13, color: '#6B7280', lineHeight: 1.55,
              }}>
                Введите названия в строке поиска выше. База —{' '}
                <strong style={{ color: '#1A1A1A' }}>{data.drugs.length}</strong> препаратов и{' '}
                <strong style={{ color: '#1A1A1A' }}>{data.interactions.length}</strong> взаимодействий.
              </p>
            </div>
          </div>

          {/* Готовые пресеты */}
          <div>
            <h3 style={{
              margin: '0 0 12px',
              fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 11, fontWeight: 700,
              color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Попробуйте классические комбинации
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 10,
            }}>
              {EMPTY_PRESETS.map((preset) => {
                const allExist = preset.drugs.every((id) => drugById.has(id));
                if (!allExist) return null;
                const sevMeta = SEVERITY_META[preset.severity];
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelected(preset.drugs)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
                      padding: '14px 16px 16px',
                      background: '#FFFFFF',
                      border: '1px solid #F0F1F5',
                      borderRadius: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background 160ms, border-color 160ms, transform 160ms',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F5F6F8';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#F0F1F5';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '2px 9px',
                      background: sevMeta.bg,
                      color: sevMeta.color,
                      border: 'none',
                      borderRadius: 999,
                      fontFamily: 'var(--font-mono, ui-monospace)',
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}>
                      {sevMeta.label}
                    </span>
                    <span style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                      color: '#1A1A1A', letterSpacing: '-0.01em', lineHeight: 1.35,
                    }}>
                      {preset.label}
                    </span>
                    <span style={{
                      display: 'block',
                      fontSize: 12, color: '#6B7280', lineHeight: 1.55,
                    }}>
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
          <div style={{
            padding: '16px 20px',
            background: interactions.length === 0 ? '#ECFDF5' : '#F5F6F8',
            border: 'none',
            borderRadius: 14,
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            {interactions.length === 0 ? (
              <>
                <span style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#10B981', color: '#FFFFFF',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span style={{ flex: 1, minWidth: 200 }}>
                  <strong style={{ display: 'block', fontSize: 15, color: '#065F46' }}>
                    Значимых взаимодействий не найдено
                  </strong>
                  <span style={{ fontSize: 12, color: '#047857', marginTop: 2, display: 'block' }}>
                    Это не означает полную безопасность — база ограничена {data.drugs.length} препаратами.
                    Сверьтесь с фарм-справочником у конкретного пациента.
                  </span>
                </span>
              </>
            ) : (
              <>
                <span style={{ flex: 1, minWidth: 200 }}>
                  <strong style={{ display: 'block', fontSize: 15, color: '#1A1A1A' }}>
                    Найдено взаимодействий: {interactions.length}
                  </strong>
                  <span style={{ fontSize: 12, color: '#6B7280', marginTop: 4, display: 'block' }}>
                    Препаратов: {selected.length} · пар проверено: {(selected.length * (selected.length - 1)) / 2}
                  </span>
                </span>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['contraindicated', 'major', 'moderate', 'minor'] as const).map((s) => {
                    if (summary[s] === 0) return null;
                    const meta = SEVERITY_META[s];
                    return (
                      <span
                        key={s}
                        style={{
                          padding: '4px 10px',
                          background: meta.bg, color: meta.color,
                          border: 'none',
                          borderRadius: 999,
                          fontFamily: 'var(--font-mono, ui-monospace)',
                          fontSize: 11, fontWeight: 700,
                          letterSpacing: '0.02em',
                        }}
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
            <ul style={{
              listStyle: 'none', padding: 0, margin: 0,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
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
                    style={{
                      background: '#F5F6F8',
                      border: 'none',
                      borderLeft: `3px solid ${meta.accent}`,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}
                  >
                    {hasDetails ? (
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : id)}
                        aria-expanded={isExpanded}
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'flex-start', gap: 14,
                          padding: '14px 18px',
                          background: 'transparent', border: 'none',
                          cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit',
                          transition: 'background 150ms',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <InteractionRowContent i={i} meta={meta} hasDetails={hasDetails} isExpanded={isExpanded} />
                      </button>
                    ) : (
                      <div
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 14,
                          padding: '14px 18px',
                        }}
                      >
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
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            padding: '0 0 0 0',
                            borderTop: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                          }}>
                            {/* Реальная HTML-таблица: парсеры/скринридеры
                                видят семантику, копируется через Ctrl+C
                                в Excel/Word как таблица. */}
                            <table style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: 13, color: '#374151', lineHeight: 1.55,
                            }}>
                              <tbody>
                                {i.mechanism && <DetailRow label="Механизм"  value={i.mechanism} />}
                                {i.management && <DetailRow label="Тактика"   value={i.management} bold />}
                                {i.sources && i.sources.length > 0 && (
                                  <DetailRow
                                    label="Источники"
                                    value={i.sources.join(' · ')}
                                    mono last
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
          style={{
            marginTop: 24,
            background: '#F5F6F8',
            border: 'none',
            borderLeft: '3px solid #2563EB',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => setShowPoisonCodes((v) => !v)}
            aria-expanded={showPoisonCodes}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '12px 16px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '2px 9px',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  border: 'none',
                  borderRadius: 999,
                  fontFamily: 'var(--font-mono, ui-monospace)',
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  ICD-10-CM
                </span>
              </span>
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                color: '#1A1A1A', letterSpacing: '-0.01em', lineHeight: 1.35,
              }}>
                Коды для отравлений и побочных действий
              </span>
              <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                По каждому из выбранных препаратов — 6 ICD-10-CM кодов (Случайное / Преднамеренное / Нападение / Неуточнённое / Побочное / Underdosing) для записи в карту пациента.
                <br />
                <span style={{ color: '#9CA3AF' }}>Source: CMS Table of Drugs and Chemicals (FY2026)</span>
              </span>
            </span>
            <span style={{
              flexShrink: 0,
              color: '#6B7280',
              transform: showPoisonCodes ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 200ms',
              marginTop: 6,
            }}>
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
                style={{ overflow: 'hidden' }}
              >
                <div style={{ borderTop: '1px solid #E5E7EB', background: '#FFFFFF', padding: '16px 18px' }}>
                  {!drugTable ? (
                    <div style={{ fontSize: 13, color: '#6B7280' }}>Загружаем CMS Drug Table…</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
                              {displayDrugName(drug)}
                            </div>
                            {matches.length === 0 ? (
                              <div style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>
                                Не найдено в CMS Table
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {matches.map((m, idx) => (
                                  <div key={idx} style={{
                                    background: '#F5F6F8', borderRadius: 8, padding: '10px 12px',
                                  }}>
                                    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>
                                      {m.name}
                                    </div>
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                      gap: 6,
                                      fontSize: 11,
                                    }}>
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
        <h3 id="dc-provenance" style={{
          margin: '0 0 14px',
          fontFamily: 'var(--font-display)',
          fontSize: 15, fontWeight: 700,
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
        }}>
          Источник и обновление
        </h3>
        <dl style={{
          margin: 0, display: 'grid',
          gridTemplateColumns: 'auto 1fr', columnGap: 18, rowGap: 10,
        }}>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Версия базы</dt>
          <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 12 }}>
            {data.version}
          </dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Обновлено</dt>
          <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 12 }}>
            {data.lastUpdated}
          </dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Источники</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            {data.sources.join(' · ')}
          </dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Покрытие</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            {data.drugs.length} препаратов · {data.interactions.length} пар
            (только clinically significant).
          </dd>
        </dl>

        <p role="note" style={{
          marginTop: 18, paddingTop: 16,
          borderTop: '1px solid #E5E7EB',
          fontSize: 12, color: '#6B7280', lineHeight: 1.55,
          margin: '18px 0 0',
        }}>
          <strong style={{ color: '#1A1A1A' }}>Не заменяет фарм-консультацию.</strong>{' '}
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
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '3px 10px',
          marginBottom: 8,
          background: meta.bg,
          color: meta.color,
          border: 'none',
          borderRadius: 999,
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 10, fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {meta.label}
        </span>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.01em', lineHeight: 1.35,
        }}>
          {i.drugAName} + {i.drugBName}
        </span>
        <span style={{
          display: 'block', marginTop: 4,
          fontSize: 13, color: '#4B5563', lineHeight: 1.5,
        }}>
          {i.effect ?? `Уровень риска: ${meta.label.toLowerCase()}. Детали уточните у клин-фармаколога.`}
        </span>
      </span>
      {hasDetails && (
        <span style={{
          flexShrink: 0,
          color: '#6B7280',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
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
      <div style={{
        padding: '6px 8px', background: '#FFFFFF', border: '1px solid #F0F1F5',
        borderRadius: 6, color: '#D1D5DB', fontSize: 10, textAlign: 'center',
      }}>
        <div>{label}</div>
        <div style={{ marginTop: 2 }}>—</div>
      </div>
    );
  }

  const handleCopy = (): void => {
    void navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? `${code} скопирован` : `Скопировать ${code}`}
      aria-live="polite"
      style={{
        position: 'relative',
        padding: '6px 8px',
        background: copied ? '#DCFCE7' : '#FFFFFF',
        border: `1px solid ${copied ? '#86EFAC' : '#DBEAFE'}`,
        borderRadius: 6, cursor: 'pointer', textAlign: 'center',
        fontFamily: 'inherit',
        transition: 'background 150ms, border-color 150ms',
      }}
    >
      <div style={{ fontSize: 10, color: copied ? '#15803D' : '#6B7280' }}>
        {copied ? 'Скопировано' : label}
      </div>
      <div style={{
        marginTop: 2, fontFamily: 'var(--font-mono, ui-monospace)',
        fontSize: 12, fontWeight: 700,
        color: copied ? '#15803D' : '#2563EB',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
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
  label, value, bold, mono, last,
}: { label: string; value: string; bold?: boolean; mono?: boolean; last?: boolean }) {
  const cellStyle: React.CSSProperties = {
    padding: '12px 18px',
    borderBottom: last ? 'none' : '1px solid #F0F1F5',
    verticalAlign: 'top',
    background: '#FFFFFF',
  };
  return (
    <tr>
      <th
        scope="row"
        style={{
          ...cellStyle,
          width: 1,
          whiteSpace: 'nowrap',
          textAlign: 'left',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 11, fontWeight: 700,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          background: '#F9FAFB',
        }}
      >
        {label}
      </th>
      <td
        style={{
          ...cellStyle,
          fontSize: 13, color: '#1A1A1A', lineHeight: 1.55,
          fontWeight: bold ? 600 : 400,
          fontFamily: mono ? 'var(--font-mono, ui-monospace)' : 'inherit',
        }}
      >
        {value}
      </td>
    </tr>
  );
}
