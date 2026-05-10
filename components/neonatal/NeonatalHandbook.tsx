'use client';

/**
 * Neonatal Handbook — 127 препаратов NICU dosing reference.
 * Источник: "Neonatal Dosage and Practical Guidelines Handbook 2nd Ed."
 * (Saudi Arabia, 2016) — Saleh Al-Alaiyan, Najwa Al-Ghamdi.
 *
 * UX: список препаратов с поиском + раскрываемая monograph card.
 * Каждая карточка содержит: brand, indications, dose с разбивкой по
 * gestational age, route, levels/metabolism, precautions, extemporaneous.
 *
 * Поскольку PDF column layout не позволяет 100% structured parsing,
 * UI gracefully показывает то что есть + fallback на full raw text.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import Highlight from '@/components/ui/Highlight';
import GrowthCharts from '@/components/neonatal/GrowthCharts';
import BilirubinNomogram from '@/components/neonatal/BilirubinNomogram';
import ResuscitationFlowchart from '@/components/neonatal/ResuscitationFlowchart';
import ApgarTimer from '@/components/neonatal/ApgarTimer';
import QuizRunner from '@/components/neonatal/QuizRunner';
import { ArrowRight } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface Drug {
  id: string;
  name_en: string;
  name_ru: string;
  brand: string;
  indications: string;
  dose: string;
  route: string;
  levels: string;
  precautions: string;
  extemporaneous: string;
  references: string;
  fullText: string;
}

interface Bank {
  version: string;
  lastUpdated: string;
  source: string;
  authors: string[];
  license: string;
  drugs: Drug[];
}

interface Guideline {
  id: string;
  title_en: string;
  title_ru: string;
  content: string;
  references: string[];
  category?: string;
}

interface GuidelineCategory {
  id: string;
  title_ru: string;
  title_en: string;
  order: number;
}

interface GuidelinesBank {
  version: string;
  lastUpdated: string;
  source: string;
  guidelines: Guideline[];
  categories?: GuidelineCategory[];
}

interface Calculator {
  id: string;
  title_ru: string;
  title_en: string;
  source: string;
  audit_id: string;
}

interface CalculatorGroup {
  id: string;
  title_ru: string;
  title_en: string;
  calculators: Calculator[];
}

interface CalculatorsBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  groups: CalculatorGroup[];
}

interface LabValue {
  name_ru: string;
  name_en: string;
  term: string;
  preterm: string;
  unit: string;
  notes: string;
}

interface LabGroup {
  id: string;
  title_ru: string;
  title_en: string;
  values: LabValue[];
}

interface LabBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  groups: LabGroup[];
}

interface Article {
  id: string;
  title_ru: string;
  title_en: string;
  topic: string;
  audience: string;
  level: string;
  summary: string;
  content: string;
  references: string[];
  related_calculators: string[];
}

interface ArticlesBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  articles: Article[];
}

interface LactDrug {
  id: string;
  name_ru: string;
  name_en: string;
  category: string;
  compatibility: 'compatible' | 'use_with_caution' | 'avoid';
  summary: string;
  details: string;
  monitoring: string;
  lactmed_url: string;
}

interface LactCategory {
  id: string;
  title_ru: string;
  title_en: string;
}

interface LactBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  categories: LactCategory[];
  drugs: LactDrug[];
}

interface NurseProcedureStep {
  title: string;
  items: string[];
}

interface NurseProcedure {
  id: string;
  title_ru: string;
  title_en: string;
  category: string;
  duration_min: number;
  audience: string;
  steps: NurseProcedureStep[];
  warnings: string[];
  references: string[];
}

interface NurseProceduresBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  procedures: NurseProcedure[];
}

type Tab = 'drugs' | 'guidelines' | 'calculators' | 'labs' | 'articles' | 'resuscitation' | 'lactmed' | 'quizzes' | 'nurse' | 'growth' | 'bilirubin';

export default function NeonatalHandbook() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [guidelines, setGuidelines] = useState<GuidelinesBank | null>(null);
  const [calculators, setCalculators] = useState<CalculatorsBank | null>(null);
  const [labs, setLabs] = useState<LabBank | null>(null);
  const [articles, setArticles] = useState<ArticlesBank | null>(null);
  const [lactmed, setLactmed] = useState<LactBank | null>(null);
  const [nurse, setNurse] = useState<NurseProceduresBank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  // Tab state is now driven by store.neonatalActiveTab (set from Sidebar
  // expandable submenu). Local sync via setTab keeps UI responsive while
  // syncing back to store + sessionStorage as defense-in-depth.
  const storeTab = useAppStore((s) => s.neonatalActiveTab);
  const setNeonatalActiveTab = useAppStore((s) => s.setNeonatalActiveTab);
  const tab: Tab = storeTab as Tab;
  const setTab = (next: Tab) => setNeonatalActiveTab(next as typeof storeTab);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.sessionStorage.setItem('bordik-neonatal-tab', tab); } catch { /* ignore */ }
  }, [tab]);

  // openTool from store — flips the app into ToolView while keeping
  // showNeonatal=true so closeTool returns user back here.
  const openTool = useAppStore((s) => s.openTool);

  // ApgarTimer fullscreen modal state — audit 1.9 closes timer UI gap.
  const [apgarTimerOpen, setApgarTimerOpen] = useState(false);

  // Quiz active flag — when QuizRunner enters fullscreen takeover (user
  // clicks a test card), we hide the page header / search / breadcrumb
  // for a clean exam-like UI. QuizRunner notifies via onActiveChange.
  const [quizActive, setQuizActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [drugsR, guidelinesR, calcR, labsR, articlesR, lactR, nurseR] = await Promise.all([
          fetch('/neonatal-monographs.json?v=2.8.0', { cache: 'force-cache' }),
          fetch('/neonatal-guidelines.json?v=1.5.0', { cache: 'force-cache' }),
          fetch('/neonatal-calculators.json?v=1.0.0', { cache: 'force-cache' }),
          fetch('/neonatal-lab-norms.json?v=1.1.0', { cache: 'force-cache' }),
          fetch('/neonatal-articles.json?v=1.6.0', { cache: 'force-cache' }),
          fetch('/neonatal-lactmed.json?v=1.0.0', { cache: 'force-cache' }),
          fetch('/neonatal-nurse-procedures.json?v=1.0.0', { cache: 'force-cache' }),
        ]);
        if (!drugsR.ok) throw new Error(`monographs ${drugsR.status}`);
        const drugsJson = await drugsR.json();
        const guidesJson = guidelinesR.ok ? await guidelinesR.json() : null;
        const calcJson = calcR.ok ? await calcR.json() : null;
        const labsJson = labsR.ok ? await labsR.json() : null;
        const articlesJson = articlesR.ok ? await articlesR.json() : null;
        const lactJson = lactR.ok ? await lactR.json() : null;
        const nurseJson = nurseR.ok ? await nurseR.json() : null;
        if (!cancelled) {
          setBank(drugsJson as Bank);
          if (guidesJson) setGuidelines(guidesJson as GuidelinesBank);
          if (calcJson) setCalculators(calcJson as CalculatorsBank);
          if (labsJson) setLabs(labsJson as LabBank);
          if (articlesJson) setArticles(articlesJson as ArticlesBank);
          if (lactJson) setLactmed(lactJson as LactBank);
          if (nurseJson) setNurse(nurseJson as NurseProceduresBank);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredDrugs = useMemo(() => {
    if (!bank) return [];
    const query = q.trim().toLowerCase();
    if (!query) return bank.drugs;
    return bank.drugs.filter((d) =>
      d.name_en.toLowerCase().includes(query)
      || d.name_ru.toLowerCase().includes(query)
      || d.brand.toLowerCase().includes(query)
      || d.fullText.toLowerCase().includes(query)
    );
  }, [bank, q]);

  const filteredGuidelines = useMemo(() => {
    if (!guidelines) return [];
    const query = q.trim().toLowerCase();
    if (!query) return guidelines.guidelines;
    return guidelines.guidelines.filter((g) =>
      g.title_en.toLowerCase().includes(query)
      || g.title_ru.toLowerCase().includes(query)
      || g.content.toLowerCase().includes(query)
    );
  }, [guidelines, q]);

  /**
   * Group filtered guidelines by category. Keeps category order from
   * `categories` map (order field). Empty groups are dropped. Anything
   * without a known category falls into 'other' bucket at the end.
   */
  const groupedGuidelines = useMemo(() => {
    if (!guidelines) return [];
    const cats = guidelines.categories ?? [];
    const sortedCats = [...cats].sort((a, b) => a.order - b.order);

    const buckets = new Map<string, { meta: GuidelineCategory; items: Guideline[] }>();
    for (const cat of sortedCats) {
      buckets.set(cat.id, { meta: cat, items: [] });
    }
    const otherMeta: GuidelineCategory = {
      id: 'other',
      title_ru: 'Прочие',
      title_en: 'Other',
      order: 99,
    };
    buckets.set('other', { meta: otherMeta, items: [] });

    for (const g of filteredGuidelines) {
      const catId = g.category && buckets.has(g.category) ? g.category : 'other';
      buckets.get(catId)?.items.push(g);
    }

    return Array.from(buckets.values()).filter((b) => b.items.length > 0);
  }, [guidelines, filteredGuidelines]);

  const filteredCalculators = useMemo(() => {
    if (!calculators) return [];
    const query = q.trim().toLowerCase();
    if (!query) return calculators.groups;
    return calculators.groups
      .map((g) => ({
        ...g,
        calculators: g.calculators.filter((c) =>
          c.title_ru.toLowerCase().includes(query)
          || c.title_en.toLowerCase().includes(query)
          || c.id.toLowerCase().includes(query)
          || c.source.toLowerCase().includes(query)
        ),
      }))
      .filter((g) => g.calculators.length > 0);
  }, [calculators, q]);

  const totalCalculators = useMemo(
    () => calculators?.groups.reduce((s, g) => s + g.calculators.length, 0) ?? 0,
    [calculators]
  );

  const filteredCalcCount = useMemo(
    () => filteredCalculators.reduce((s, g) => s + g.calculators.length, 0),
    [filteredCalculators]
  );

  const filteredLabs = useMemo(() => {
    if (!labs) return [];
    const query = q.trim().toLowerCase();
    if (!query) return labs.groups;
    return labs.groups
      .map((g) => ({
        ...g,
        values: g.values.filter((v) =>
          v.name_ru.toLowerCase().includes(query)
          || v.name_en.toLowerCase().includes(query)
          || v.notes.toLowerCase().includes(query)
        ),
      }))
      .filter((g) => g.values.length > 0);
  }, [labs, q]);

  const totalLabs = useMemo(
    () => labs?.groups.reduce((s, g) => s + g.values.length, 0) ?? 0,
    [labs]
  );

  const filteredLabsCount = useMemo(
    () => filteredLabs.reduce((s, g) => s + g.values.length, 0),
    [filteredLabs]
  );

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    const query = q.trim().toLowerCase();
    if (!query) return articles.articles;
    return articles.articles.filter((a) =>
      a.title_ru.toLowerCase().includes(query)
      || a.title_en.toLowerCase().includes(query)
      || a.summary.toLowerCase().includes(query)
      || a.content.toLowerCase().includes(query)
      || a.topic.toLowerCase().includes(query)
    );
  }, [articles, q]);

  const filteredLactmed = useMemo(() => {
    if (!lactmed) return [];
    const query = q.trim().toLowerCase();
    if (!query) return lactmed.drugs;
    return lactmed.drugs.filter((d) =>
      d.name_ru.toLowerCase().includes(query)
      || d.name_en.toLowerCase().includes(query)
      || d.summary.toLowerCase().includes(query)
      || d.details.toLowerCase().includes(query)
    );
  }, [lactmed, q]);

  /**
   * Group lactmed drugs by category in display order. Empty groups dropped.
   */
  const groupedLactmed = useMemo(() => {
    if (!lactmed) return [];
    const cats = lactmed.categories;
    const buckets = new Map<string, { meta: LactCategory; items: LactDrug[] }>();
    for (const cat of cats) buckets.set(cat.id, { meta: cat, items: [] });
    for (const drug of filteredLactmed) {
      buckets.get(drug.category)?.items.push(drug);
    }
    return Array.from(buckets.values()).filter((b) => b.items.length > 0);
  }, [lactmed, filteredLactmed]);

  const filteredNurse = useMemo(() => {
    if (!nurse) return [];
    const query = q.trim().toLowerCase();
    if (!query) return nurse.procedures;
    return nurse.procedures.filter((p) =>
      p.title_ru.toLowerCase().includes(query)
      || p.title_en.toLowerCase().includes(query)
      || p.category.toLowerCase().includes(query)
      || p.steps.some((s) => s.title.toLowerCase().includes(query) || s.items.some((it) => it.toLowerCase().includes(query)))
    );
  }, [nurse, q]);

  if (error) {
    return (
      <main style={{ padding: '24px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{
          padding: 24, borderRadius: 12, background: '#FEF2F2',
          border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
        }}>
          Не удалось загрузить справочник: {error}.
        </div>
      </main>
    );
  }

  if (!bank) {
    return (
      <main style={{ padding: '24px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{ padding: '8px 0' }}>
          <div className="lc-shimmer" style={{ height: 32, width: 280, borderRadius: 8, marginBottom: 16 }} />
          <div className="lc-shimmer" style={{ height: 16, width: '70%', borderRadius: 6, marginBottom: 24 }} />
          <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
          <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" style={{
      padding: 0,
      fontFamily: 'var(--font-body, system-ui)',
      color: 'var(--md-sys-color-on-surface, #1A1A1A)',
    }}>
      {/*
        Page header — скрывается когда tab='quizzes' и user открыл конкретный
        quiz (fullscreen exam-like takeover). QuizRunner notifies parent через
        onActiveChange callback → setQuizActive(true).
      */}
      {!(tab === 'quizzes' && quizActive) && (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        style={{ marginBottom: 24 }}
      >
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
          color: '#101010', margin: '0 0 8px', letterSpacing: '-0.02em',
        }}>
          Неонатология — справочник доз
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0, maxWidth: 720, lineHeight: 1.55 }}>
          {bank.drugs.length} препаратов NICU с дозированием по гестационному возрасту,
          путём введения, метаболизмом и предостережениями.
        </p>
      </motion.div>
      )}

      {/* Search — для табов с поиском; на growth/bilirubin/resuscitation не нужен.
          Также скрывается когда quiz active (clean exam UI). */}
      {!(tab === 'quizzes' && quizActive) && (tab === 'drugs' || tab === 'guidelines' || tab === 'calculators' || tab === 'labs' || tab === 'articles' || tab === 'lactmed' || tab === 'quizzes' || tab === 'nurse') && (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 }}
        className="bordik-search"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: '#F5F6F8',
          borderRadius: 12,
          maxWidth: 480,
          marginBottom: 18,
        }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
          stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Например: «Ампициллин», «Caffeine», «Surfactant»…'
          aria-label="Поиск препарата"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'inherit', fontSize: 14, color: '#1A1A1A',
          }}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="Очистить"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', fontSize: 16, padding: 0,
            }}
          >×</button>
        )}
      </motion.div>
      )}

      {/*
        Section breadcrumb header.
        Замена горизонтальных табов: navigation теперь живёт в Sidebar
        (раскрывающийся submenu под "Неонатология"). Здесь показываем
        текущий активный раздел + count для оrientation. Tabs strip
        DELETED — see git history before 2026-05-09 PR #30.
        Скрывается когда quiz active (exam UI takeover).
      */}
      {!(tab === 'quizzes' && quizActive) && (() => {
        const SECTION_META: Record<Tab, { label: string; count: number | null }> = {
          drugs: { label: 'Препараты', count: bank.drugs.length },
          calculators: { label: 'Калькуляторы', count: totalCalculators },
          guidelines: { label: 'Протоколы', count: guidelines?.guidelines.length ?? 0 },
          resuscitation: { label: 'Реанимация (4 региона)', count: 4 },
          articles: { label: 'Статьи', count: articles?.articles.length ?? 0 },
          lactmed: { label: 'ГВ / LactMed', count: lactmed?.drugs.length ?? 0 },
          quizzes: { label: 'Тесты', count: null },
          nurse: { label: 'Процедуры медсестры', count: nurse?.procedures.length ?? 0 },
          labs: { label: 'Лаб. нормы', count: totalLabs },
          growth: { label: 'Графики роста', count: null },
          bilirubin: { label: 'Билирубин', count: null },
        };
        const meta = SECTION_META[tab];
        return (
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8,
            paddingBottom: 14, marginBottom: 18,
            borderBottom: '1px solid #E5E7EB',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#1A1A1A',
              margin: 0,
            }}>
              {meta.label}
            </h2>
            {meta.count !== null && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 14, fontWeight: 700,
                color: '#9CA3AF',
              }}>
                {meta.count}
              </span>
            )}
          </div>
        );
      })()}

      {tab === 'drugs' ? (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredDrugs.length}</strong> из {bank.drugs.length}
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {filteredDrugs.map((d) => (
              <DrugCard
                key={d.id}
                drug={d}
                query={q}
                isOpen={openId === d.id}
                onToggle={() => setOpenId(openId === d.id ? null : d.id)}
              />
            ))}
            {filteredDrugs.length === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'guidelines' ? (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredGuidelines.length}</strong> из {guidelines?.guidelines.length ?? 0}
            {' · '}
            <span style={{ color: '#9CA3AF' }}>
              сгруппированы по разделам
            </span>
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {groupedGuidelines.map((group) => (
              <div key={group.meta.id}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1F2937',
                  margin: '0 0 12px',
                  letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'baseline', gap: 8,
                }}>
                  <span>{group.meta.title_ru}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    color: '#9CA3AF',
                  }}>
                    {group.items.length}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.items.map((g) => (
                    <GuidelineCard
                      key={g.id}
                      guideline={g}
                      query={q}
                      isOpen={openId === g.id}
                      onToggle={() => setOpenId(openId === g.id ? null : g.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {groupedGuidelines.length === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'calculators' ? (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredCalcCount}</strong> из {totalCalculators} калькуляторов
            {' · '}
            <span style={{ color: '#9CA3AF' }}>
              нажмите на карточку чтобы открыть калькулятор
            </span>
          </p>

          {/* Apgar Timer launcher — fullscreen timer для родзала, audit 1.9 */}
          <button
            onClick={() => setApgarTimerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              marginBottom: 16,
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Запустить Apgar Timer (родзал)
          </button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {filteredCalculators.map((group) => (
              <div key={group.id}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1F2937',
                  margin: '0 0 12px',
                  letterSpacing: '-0.01em',
                }}>
                  {group.title_ru}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gap: 'var(--space-3)',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  }}
                >
                  {group.calculators.map((calc) => (
                    <NeonatalCalcCard
                      key={calc.id}
                      calc={calc}
                      query={q}
                      subcategoryLabel={group.title_ru}
                      onOpen={openTool}
                    />
                  ))}
                </div>
              </div>
            ))}
            {filteredCalcCount === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'labs' ? (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredLabsCount}</strong> из {totalLabs} показателей
            {' · '}
            <span style={{ color: '#9CA3AF' }}>
              normal ranges: term + preterm columns
            </span>
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {filteredLabs.map((group) => (
              <div key={group.id}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1F2937',
                  margin: '0 0 10px',
                  letterSpacing: '-0.01em',
                }}>
                  {group.title_ru}
                </h3>
                <div style={{
                  background: '#F5F6F8',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                  {/*
                    Fixed column widths via <colgroup> + table-layout: fixed —
                    обеспечивает identical layout across all groups (без
                    "skating" колонок при разной длине контента в строках).
                    Total = 100 % (35 + 23 + 27 + 15).
                    Preterm column шире — там часто длинные значения типа
                    "133-145 (early days), 135-145 (after)".
                    Padding ячеек увеличен с 8/10 → 14/18 для better
                    breathing room; font-size 12.5 → 13.5 для readability.
                  */}
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13.5,
                    tableLayout: 'fixed',
                  }}>
                    <colgroup>
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '23%' }} />
                      <col style={{ width: '27%' }} />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                      <tr style={{ background: '#E5E7EB' }}>
                        <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Показатель</th>
                        <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Term</th>
                        <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Preterm</th>
                        <th style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Ед.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.values.map((v, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #E5E7EB' }}>
                          <td style={{ padding: '14px 18px', color: '#1A1A1A', fontWeight: 500, wordBreak: 'break-word', verticalAlign: 'top' }}>
                            {v.name_ru}
                            {v.notes && (
                              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.45 }}>
                                {v.notes}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#1A1A1A', wordBreak: 'break-word', verticalAlign: 'top' }}>{v.term}</td>
                          <td style={{ padding: '14px 18px', color: '#1A1A1A', wordBreak: 'break-word', verticalAlign: 'top' }}>{v.preterm}</td>
                          <td style={{ padding: '14px 18px', color: '#6B7280', fontFamily: 'var(--font-mono, monospace)', fontSize: 12, wordBreak: 'break-word', verticalAlign: 'top' }}>{v.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {filteredLabsCount === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'articles' ? (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredArticles.length}</strong> из {articles?.articles.length ?? 0} статей
            {' · '}
            <span style={{ color: '#9CA3AF' }}>
              кликните чтобы открыть полный текст
            </span>
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {filteredArticles.map((a) => (
              <ArticleCard
                key={a.id}
                article={a}
                query={q}
                isOpen={openId === a.id}
                onToggle={() => setOpenId(openId === a.id ? null : a.id)}
              />
            ))}
            {filteredArticles.length === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'resuscitation' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ResuscitationFlowchart />
        </motion.div>
      ) : tab === 'lactmed' ? (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredLactmed.length}</strong> из {lactmed?.drugs.length ?? 0} препаратов
            {' · '}
            <span style={{ color: '#9CA3AF' }}>
              совместимость с грудным вскармливанием (LactMed NCBI)
            </span>
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {groupedLactmed.map((group) => (
              <div key={group.meta.id}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1F2937',
                  margin: '0 0 12px',
                  letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'baseline', gap: 8,
                }}>
                  <span>{group.meta.title_ru}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    color: '#9CA3AF',
                  }}>
                    {group.items.length}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.items.map((d) => (
                    <LactCard
                      key={d.id}
                      drug={d}
                      query={q}
                      isOpen={openId === d.id}
                      onToggle={() => setOpenId(openId === d.id ? null : d.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {groupedLactmed.length === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'quizzes' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <QuizRunner query={q} onActiveChange={setQuizActive} />
        </motion.div>
      ) : tab === 'nurse' ? (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredNurse.length}</strong> из {nurse?.procedures.length ?? 0} процедур
            {' · '}
            <span style={{ color: '#9CA3AF' }}>
              bedside reference для медсестёр и фельдшеров
            </span>
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {filteredNurse.map((proc) => (
              <NurseProcedureCard
                key={proc.id}
                procedure={proc}
                isOpen={openId === proc.id}
                onToggle={() => setOpenId(openId === proc.id ? null : proc.id)}
              />
            ))}
            {filteredNurse.length === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'growth' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GrowthCharts />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <BilirubinNomogram />
        </motion.div>
      )}

      {/* Source / disclaimer panel — единый стиль с DrugChecker provenance.
          Скрывается на табе Тесты (panel описывает источники препаратов /
          графиков / билирубина — не релевантно для тестового раздела). */}
      {tab !== 'quizzes' && (
      <section
        aria-labelledby="neonatal-provenance"
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
        <h3 id="neonatal-provenance" style={{
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
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Препараты + протоколы</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            {bank.source} — {bank.drugs.length} препаратов NICU + 13 практических протоколов.
            <span style={{ color: '#6B7280', display: 'block', marginTop: 2, fontSize: 12 }}>
              Авторы: {bank.authors.join('; ')}
            </span>
          </dd>

          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Графики роста</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            Fenton TR, Kim JH. BMC Pediatrics 2013;13:59 — кривые для недоношенных 22–50 нед PMA.
            <span style={{ color: '#6B7280', display: 'block', marginTop: 2, fontSize: 12 }}>
              Лицензия: CC-BY 2.0 (open access)
            </span>
          </dd>

          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Билирубин</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            AAP 2022 — Kemper AR, Newman TB, Slaughter JL, et al. Pediatrics 2022;150(3):e2022058859. Пороги фототерапии и обменного переливания.
            <span style={{ color: '#6B7280', display: 'block', marginTop: 2, fontSize: 12 }}>
              Лицензия: AAP Clinical Practice Guideline (открыт для клинического использования)
            </span>
          </dd>
        </dl>

        <p role="note" style={{
          marginTop: 18, paddingTop: 16,
          borderTop: '1px solid #E5E7EB',
          fontSize: 12, color: '#6B7280', lineHeight: 1.55,
          margin: '18px 0 0',
        }}>
          <strong style={{ color: '#1A1A1A' }}>Не заменяет клиническое решение.</strong>{' '}
          Дозы у новорождённых критически зависят от гестационного возраста, дней жизни, веса,
          функции почек и печени. Графики роста — для пограничных случаев сверяйтесь с официальными
          LMS-таблицами производителя стандарта. Билирубин — для GA &lt; 35 нед, при острой
          энцефалопатии или пограничных значениях TSB сверяйтесь с локальными протоколами и
          руководством AAP 2022 в полном виде. Решение по конкретному пациенту принимает
          врач/клин-фармаколог/неонатолог.
        </p>
      </section>
      )}

      {/* ApgarTimer fullscreen modal — audit 1.9 */}
      {apgarTimerOpen && (
        <ApgarTimer onClose={() => setApgarTimerOpen(false)} />
      )}
    </main>
  );
}

function DrugCard({
  drug, query, isOpen, onToggle,
}: {
  drug: Drug;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const showStructured = !!(drug.brand || drug.dose || drug.precautions);

  return (
    <div style={{
      background: '#F5F6F8',
      border: isOpen ? '1px solid #E5E7EB' : 'none',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 150ms ease',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block', fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 600, color: '#1A1A1A',
            lineHeight: 1.35, letterSpacing: '-0.01em',
          }}>
            <Highlight text={drug.name_ru} query={query} />
            {drug.name_en !== drug.name_ru && (
              <span style={{ fontWeight: 400, color: '#6B7280', marginLeft: 6 }}>
                (<Highlight text={drug.name_en} query={query} />)
              </span>
            )}
          </span>
        </span>
        <span style={{
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
              background: '#FFFFFF',
              padding: '0 20px',
              fontSize: 13.5, lineHeight: 1.55, color: '#374151',
            }}>
              {showStructured ? (() => {
                // Собираем массив видимых блоков. Предосторожности всегда
                // последним блоком (визуально-важно: пользователь видит
                // их при скролле вниз, перед закрытием карточки), и с
                // жёлтым фоном для дополнительного выделения.
                const blocks: Array<{ key: string; label: string; value: string; tone?: 'warning' }> = [];
                if (drug.brand)          blocks.push({ key: 'brand',          label: 'Бренд',           value: drug.brand });
                if (drug.indications)    blocks.push({ key: 'indications',    label: 'Показания',       value: drug.indications });
                if (drug.dose)           blocks.push({ key: 'dose',           label: 'Доза',            value: drug.dose });
                if (drug.route)          blocks.push({ key: 'route',          label: 'Путь',            value: drug.route });
                if (drug.levels)         blocks.push({ key: 'levels',         label: 'Метаболизм',      value: drug.levels });
                if (drug.extemporaneous) blocks.push({ key: 'extemporaneous', label: 'Приготовление',   value: drug.extemporaneous });
                if (drug.references)     blocks.push({ key: 'references',     label: 'Источники',       value: drug.references });
                if (drug.precautions)    blocks.push({ key: 'precautions',    label: 'Предосторожности', value: drug.precautions, tone: 'warning' });
                return blocks.map((b, i) => (
                  <NeonatalDetailBlock
                    key={b.key}
                    label={b.label}
                    isLast={i === blocks.length - 1}
                    {...(b.tone ? { tone: b.tone } : {})}
                  >
                    {b.value}
                  </NeonatalDetailBlock>
                ));
              })() : (
                /* Если структурированных полей нет — показываем raw монограф
                 * как fallback. Большую простыню режем на смысловые блоки и
                 * отдаём в той же таблице, что и структурированные препараты. */
                <MonographFullText text={drug.fullText} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Чистит broken-glyph (�) и схлопывает пробелы. */
function sanitizeFieldText(s: string): string {
  return s
    .replace(/�/g, '÷')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Разбивает длинный текст на читаемые предложения/клаузы.
 *  Защищает медицинские сокращения (max., mg., hr., и т.д.) от
 *  ложных делений на границе предложения. */
function splitIntoSentences(raw: string): string[] {
  const ABBREV = ['max', 'min', 'mg', 'mcg', 'hr', 'hrs', 'kg', 'mL', 'wk', 'wks', 'q', 'approx', 'incl', 'excl', 'ca', 'cf', 'i.e', 'e.g', 'vs', 'no', 'Dr', 'Mr', 'Ms', 'St'];
  let s = raw;
  // Защищаем сокращения временным маркером §
  for (const a of ABBREV) {
    const escaped = a.replace(/\./g, '\\.');
    s = s.replace(new RegExp(`\\b${escaped}\\.`, 'g'), `${a}§`);
  }
  // Делим на границе предложения/клаузы: . или ; + пробел + заглавная
  const parts = s.split(/(?<=[.;])\s+(?=[A-ZА-Я0-9])/g)
    .map((p) => p.replace(/§/g, '.').trim())
    .filter(Boolean);
  return parts;
}

/** Рендер «значения» поля. Короткое — inline. Длинное (>120 знаков
 *  или несколько предложений) — список с буллетами для удобства чтения. */
function renderFieldValue(value: string): React.ReactNode {
  const clean = sanitizeFieldText(value);
  if (clean.length < 120) return clean;
  const parts = splitIntoSentences(clean);
  if (parts.length < 2) return clean;
  return (
    <ul style={{
      margin: 0, paddingLeft: 18,
      listStyle: 'disc',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {parts.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  );
}

/** Структурированный рендер raw-монографа: режем на смысловые блоки
 *  по ключевым медицинским секциям («Indications», «Dose», «Metabolism»,
 *  «Excretion», «Precautions», «Extemporaneous Preparation», «References»),
 *  потом каждый блок — на буллеты по предложениям. Содержимое не теряется. */
const MONOGRAPH_SECTIONS: Array<{ keys: RegExp; label: string; labelRu: string; tone?: 'warning' }> = [
  // Узкие совпадения: "Indications", "Mechanism", "Action of ..." — не "Use" в общем
  // (т.к. "Use within 4 hours" / "Use with caution" — это precautions/storage, не indications)
  { keys: /^(Indications?|Mechanism|Action of)\b/i, label: 'Indications & Mechanism', labelRu: 'Показания и механизм' },
  { keys: /^(Dose|Dosing|Dosage|Administration|PO|IV|IM)\b/i, label: 'Dose & Administration', labelRu: 'Доза и введение' },
  { keys: /^(Metabolism|Pharmacokinetics|Half-life|Clearance|Levels?)\b/i, label: 'Pharmacokinetics', labelRu: 'Фармакокинетика' },
  { keys: /^(Excretion|Elimination)\b/i, label: 'Excretion', labelRu: 'Выведение' },
  { keys: /^(Monitor(?:ing)?|CBC|Renal|Hepatic function)\b/i, label: 'Monitoring', labelRu: 'Мониторинг' },
  // "Use 25% albumin with caution", "Use with caution", "Avoid", "Causes" — все попадают сюда
  { keys: /^(Use with|Use \d|Use \w+ albumin|Precaution|Adverse|Warning|Contraindication|Causes|Avoid|May cause|Do not)\b/i, label: 'Precautions', labelRu: 'Предосторожности', tone: 'warning' },
  { keys: /^(Extemporaneous|Preparation|Reconstitution|Compounding|Stability|Storage|Use within|Stable for|Refrigerate|Discard)\b/i, label: 'Preparation', labelRu: 'Приготовление' },
  { keys: /^(References?|Bibliography|Source)\b/i, label: 'References', labelRu: 'Источники' },
];

interface MonographBlock {
  labelRu: string;
  label: string;
  tone?: 'warning';
  sentences: string[];
}

function structureMonograph(raw: string): MonographBlock[] {
  const clean = sanitizeFieldText(raw);
  const sentences = splitIntoSentences(clean);
  if (sentences.length === 0) return [];

  const blocks: MonographBlock[] = [];
  let current: MonographBlock = { labelRu: 'Описание', label: 'Description', sentences: [] };

  const sectionFor = (s: string): MonographBlock | null => {
    for (const sec of MONOGRAPH_SECTIONS) {
      if (sec.keys.test(s)) {
        const block: MonographBlock = { labelRu: sec.labelRu, label: sec.label, sentences: [] };
        if (sec.tone) block.tone = sec.tone;
        return block;
      }
    }
    return null;
  };

  for (const sent of sentences) {
    const next = sectionFor(sent);
    if (next && next.labelRu !== current.labelRu) {
      // Только переключаемся, если новая секция действительно отличается от текущей.
      // Иначе оставляем предложение в текущей секции (избегаем дублирования заголовков).
      if (current.sentences.length) blocks.push(current);
      current = next;
    }
    current.sentences.push(sent);
  }
  if (current.sentences.length) blocks.push(current);

  // Финальный merge: если две соседние секции с одинаковым labelRu — склеиваем
  // (бывает если между двумя одноимёнными секциями вклинилась короткая «Use ...»
  // фраза, отнесённая в Precautions, и потом снова Indications).
  const merged: MonographBlock[] = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (prev && prev.labelRu === b.labelRu) {
      prev.sentences.push(...b.sentences);
    } else {
      merged.push(b);
    }
  }
  return merged;
}

function MonographFullText({ text }: { text: string }) {
  const blocks = structureMonograph(text);
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((b, i) => (
        <NeonatalDetailBlock
          key={i}
          label={b.labelRu}
          isLast={i === blocks.length - 1}
          {...(b.tone === 'warning' ? { tone: 'warning' as const } : {})}
        >
          {b.sentences.join(' ')}
        </NeonatalDetailBlock>
      ))}
    </>
  );
}

/** Bordik-style блок: label слева (узкая колонка), content справа.
 *  Между блоками — горизонтальная разделительная полоса.
 *  warning-tone — жёлтый фон + контрастные цвета (для Предосторожностей). */
function NeonatalDetailBlock({
  label, tone = 'neutral', isLast = false, children,
}: {
  label: string;
  tone?: 'neutral' | 'warning';
  isLast?: boolean;
  children: React.ReactNode;
}) {
  const isWarning = tone === 'warning';
  return (
    <div className="neo-detail-row" style={{
      padding: isWarning ? '14px 16px' : '14px 0',
      margin: isWarning ? '6px -8px 0' : 0,
      background: isWarning ? '#FFFBEB' : 'transparent',
      border: isWarning ? '1px solid #FDE68A' : 'none',
      borderRadius: isWarning ? 10 : 0,
      borderBottom: isWarning
        ? '1px solid #FDE68A'
        : (isLast ? 'none' : '1px solid #F0F1F5'),
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: isWarning ? '#92400E' : '#9CA3AF',
        paddingTop: 1,
      }}>
        {label}
      </div>
      <div style={{
        color: isWarning ? '#78350F' : '#374151',
        fontSize: 13.5, lineHeight: 1.55,
      }}>
        {children}
      </div>
    </div>
  );
}

type Block =
  | { kind: 'step'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'formula'; text: string }
  | { kind: 'para'; text: string };

// Replace broken PDF glyphs (U+FFFD and similar) with a neutral placeholder.
// Original handbook used ÷, ×, →, − that pdftotext could not decode.
function sanitizePdfText(s: string): string {
  return s
    .replace(/�/g, '÷')      // best-guess: most � appear in division formulas
    .replace(/ /g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function isFormulaLine(s: string): boolean {
  // Lines with blanks, equals signs, or unit ratios — render in mono.
  return /_{2,}|\b(mg|mcg|mL|kg|g)\/(kg|day|min|hr|hour|mL)|=|×|÷/.test(s);
}

function parseGuidelineContent(raw: string): Block[] {
  const lines = raw.split('\n').map((l) => sanitizePdfText(l));
  const chunks: string[][] = [];
  let cur: string[] = [];
  for (const line of lines) {
    if (!line) {
      if (cur.length) { chunks.push(cur); cur = []; }
    } else {
      cur.push(line);
    }
  }
  if (cur.length) chunks.push(cur);

  const blocks: Block[] = [];
  const bulletRe = /^\s*(?:[-•*·]|\d+[.)]|[a-z][.)])\s+/i;
  const stepRe = /^STEP\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|\d+)\b/i;

  for (const chunk of chunks) {
    // Step heading like "STEP ONE" possibly with trailing words.
    if (chunk.length === 1 && chunk[0] && stepRe.test(chunk[0])) {
      blocks.push({ kind: 'step', text: chunk[0] });
      continue;
    }

    const allBullet = chunk.every((l) => bulletRe.test(l));
    if (allBullet && chunk.length >= 2) {
      blocks.push({ kind: 'list', items: chunk.map((l) => l.replace(bulletRe, '').trim()) });
      continue;
    }

    // Multi-line formula block: every line looks like a formula.
    if (chunk.length >= 1 && chunk.every(isFormulaLine)) {
      blocks.push({ kind: 'formula', text: chunk.join('\n') });
      continue;
    }

    const joined = chunk.join(' ').replace(/\s+/g, ' ').trim();
    const isHeading =
      chunk.length === 1 &&
      joined.length <= 80 &&
      (joined === joined.toUpperCase() || /:$/.test(joined)) &&
      !isFormulaLine(joined);
    if (isHeading) {
      blocks.push({ kind: 'heading', text: joined.replace(/:$/, '') });
      continue;
    }

    blocks.push({ kind: 'para', text: joined });
  }
  return blocks;
}

function GuidelineContent({ content }: { content: string }) {
  const blocks = parseGuidelineContent(content);
  return (
    <div style={{ fontSize: 13, lineHeight: 1.6, color: '#374151' }}>
      {blocks.map((b, i) => {
        if (b.kind === 'step') {
          return (
            <div key={i} style={{
              marginTop: i === 0 ? 0 : 18, marginBottom: 10,
              padding: '6px 10px',
              background: '#F3F4F6',
              borderLeft: '3px solid #6B7280',
              borderRadius: 4,
              fontFamily: 'var(--font-mono, ui-monospace)',
              fontSize: 11, fontWeight: 700,
              color: '#111827',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {b.text}
            </div>
          );
        }
        if (b.kind === 'heading') {
          return (
            <div key={i} style={{
              marginTop: i === 0 ? 0 : 14, marginBottom: 6,
              fontFamily: 'var(--font-display)',
              fontSize: 13, fontWeight: 700, color: '#111827',
              letterSpacing: '-0.005em',
            }}>
              {b.text}
            </div>
          );
        }
        if (b.kind === 'list') {
          return (
            <ul key={i} style={{
              margin: '0 0 12px', paddingLeft: 20,
              fontSize: 13, lineHeight: 1.6, color: '#374151',
            }}>
              {b.items.map((it, j) => (
                <li key={j} style={{ marginBottom: 4 }}>{it}</li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'formula') {
          return (
            <pre key={i} style={{
              margin: '0 0 12px',
              padding: '10px 12px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontFamily: 'var(--font-mono, ui-monospace)',
              fontSize: 12, lineHeight: 1.7,
              color: '#1F2937',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {b.text}
            </pre>
          );
        }
        return (
          <p key={i} style={{
            margin: '0 0 10px',
            fontSize: 13, lineHeight: 1.6, color: '#374151',
          }}>
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

function GuidelineCard({
  guideline, query, isOpen, onToggle,
}: {
  guideline: Guideline;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      background: '#F5F6F8',
      border: isOpen ? '1px solid #E5E7EB' : 'none',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 150ms ease',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
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
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
            color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
          }}>
            <Highlight text={guideline.title_ru} query={query} />
          </span>
          {guideline.title_en !== guideline.title_ru && (
            <span style={{
              display: 'block', marginTop: 3, fontSize: 12, color: '#6B7280',
            }}>
              <Highlight text={guideline.title_en} query={query} />
            </span>
          )}
        </span>
        <span style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
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
              padding: '18px 20px 20px',
              background: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
            }}>
              <GuidelineContent content={guideline.content} />
              {guideline.references.length > 0 && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
                  }}>
                    References
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#6B7280', lineHeight: 1.55 }}>
                    {guideline.references.map((ref, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{ref}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * NeonatalCalcCard — карточка калькулятора, визуально 1:1 с ToolCard
 * (см. components/tools/page/ToolCard.tsx). Клик вызывает store.openTool(id),
 * что переключает app в ToolView, сохраняя showNeonatal=true. После закрытия
 * пользователь возвращается на этот же таб «Калькуляторы».
 */
function NeonatalCalcCard({
  calc, subcategoryLabel, onOpen,
}: {
  calc: Calculator;
  query: string;
  subcategoryLabel: string;
  onOpen: (id: string) => void;
}) {
  const handleClick = useCallback(() => onOpen(calc.id), [onOpen, calc.id]);

  // Prefetch на hover/focus — same pattern как ToolCard. Тёплые chunks
  // (ToolView + tools-runners + per-tool runner) скрывают latency 150-300 ms.
  const handlePrefetch = useCallback(() => {
    import('@/components/tools/ToolView').catch(() => {});
    import('@/lib/tools-runners').catch(() => {});
    import('@/lib/runners')
      .then((m) => m.loadRunner(calc.id))
      .catch(() => { /* silent */ });
  }, [calc.id]);

  return (
    <button
      onClick={handleClick}
      onMouseEnter={(e) => {
        handlePrefetch();
        e.currentTarget.style.background = '#F0F2F5';
      }}
      onFocus={handlePrefetch}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
      style={{
        background: '#F5F6F8',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        border: 'none',
        padding: 'var(--space-5)',
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 160,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'background 300ms cubic-bezier(0.22,1,0.36,1)',
        contentVisibility: 'auto',
        containIntrinsicSize: '160px 220px',
      } as React.CSSProperties}
    >
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
            {subcategoryLabel}
          </span>
          {calc.audit_id && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 600,
              color: '#6B7280',
              whiteSpace: 'nowrap',
            }}>
              {calc.audit_id}
            </span>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--space-1)', lineHeight: 1.25,
        }}>
          {calc.title_ru}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
          color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {calc.source}
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
        marginTop: 'var(--space-3)', position: 'relative', zIndex: 1,
      }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
          color: 'var(--md-sys-color-on-surface)',
        }}>
          Открыть калькулятор
        </span>
        <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />
      </div>
    </button>
  );
}

function ArticleCard({
  article, query, isOpen, onToggle,
}: {
  article: Article;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      background: '#F5F6F8',
      border: isOpen ? '1px solid #E5E7EB' : 'none',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 150ms ease',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
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
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              <Highlight text={article.title_ru} query={query} />
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase', color: '#9CA3AF',
              padding: '2px 6px', background: '#FFFFFF', borderRadius: 4,
              border: '1px solid #E5E7EB',
            }}>
              {article.topic}
            </span>
          </span>
          <span style={{
            display: 'block', marginTop: 4, fontSize: 12, color: '#6B7280', lineHeight: 1.5,
          }}>
            <Highlight text={article.summary} query={query} />
          </span>
        </span>
        <span style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
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
              padding: '18px 20px 20px',
              background: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
            }}>
              <ArticleContent content={article.content} />
              {article.related_calculators.length > 0 && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
                  }}>
                    Связанные калькуляторы
                  </div>
                  <ul style={{
                    margin: 0, padding: 0, listStyle: 'none',
                    display: 'flex', flexWrap: 'wrap', gap: 6,
                  }}>
                    {article.related_calculators.map((calcId) => (
                      <li key={calcId}>
                        <a href={`/tools/${calcId}`} style={{
                          display: 'inline-block', padding: '4px 10px',
                          background: '#EEF2FF', color: '#4338CA',
                          borderRadius: 6, fontSize: 12, fontWeight: 500,
                          textDecoration: 'none',
                          border: '1px solid #E0E7FF',
                        }}>
                          {calcId}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {article.references.length > 0 && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
                  }}>
                    References
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#6B7280', lineHeight: 1.55 }}>
                    {article.references.map((ref, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{ref}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ArticleContent — render markdown-like text for articles.
 * Supports: ## headings, ### subheadings, **bold**, lists, tables, paragraphs.
 */
function ArticleContent({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);
  return (
    <div style={{ fontSize: 13.5, lineHeight: 1.65, color: '#1F2937' }}>
      {blocks.map((block, idx) => {
        if (block.startsWith('## ')) {
          return (
            <h3 key={idx} style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16, fontWeight: 700,
              color: '#111827', margin: '20px 0 8px',
              letterSpacing: '-0.01em',
            }}>
              {block.slice(3)}
            </h3>
          );
        }
        if (block.startsWith('### ')) {
          return (
            <h4 key={idx} style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14, fontWeight: 700,
              color: '#1F2937', margin: '16px 0 6px',
              letterSpacing: '-0.005em',
            }}>
              {block.slice(4)}
            </h4>
          );
        }
        if (block.startsWith('- ') || block.startsWith('* ')) {
          const items = block.split('\n').map((l) => l.replace(/^[-*]\s+/, ''));
          return (
            <ul key={idx} style={{ margin: '6px 0', paddingLeft: 22 }}>
              {items.map((it, i) => (
                <li key={i} style={{ marginBottom: 3 }}>
                  <FormattedText text={it} />
                </li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(block)) {
          const items = block.split('\n').map((l) => l.replace(/^\d+\.\s+/, ''));
          return (
            <ol key={idx} style={{ margin: '6px 0', paddingLeft: 22 }}>
              {items.map((it, i) => (
                <li key={i} style={{ marginBottom: 3 }}>
                  <FormattedText text={it} />
                </li>
              ))}
            </ol>
          );
        }
        if (block.startsWith('| ')) {
          const rows = block.split('\n').filter((l) => l.startsWith('|'));
          if (rows.length < 2) {
            return <p key={idx} style={{ margin: '8px 0' }}><FormattedText text={block} /></p>;
          }
          const headerCells = rows[0]?.split('|').map((c) => c.trim()).filter(Boolean) ?? [];
          const bodyRows = rows.slice(2).map((r) => r.split('|').map((c) => c.trim()).filter(Boolean));
          return (
            <div key={idx} style={{
              overflowX: 'auto', margin: '12px 0',
              borderRadius: 8, border: '1px solid #E5E7EB',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                <thead>
                  <tr style={{ background: '#F3F4F6' }}>
                    {headerCells.map((h, i) => (
                      <th key={i} style={{
                        padding: '8px 10px', textAlign: 'left',
                        fontWeight: 600, color: '#374151',
                        borderBottom: '1px solid #E5E7EB',
                      }}>
                        <FormattedText text={h} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr key={ri} style={{ borderTop: ri > 0 ? '1px solid #F3F4F6' : 'none' }}>
                      {row.map((c, ci) => (
                        <td key={ci} style={{ padding: '6px 10px', color: '#1F2937' }}>
                          <FormattedText text={c} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={idx} style={{ margin: '8px 0' }}>
            <FormattedText text={block} />
          </p>
        );
      })}
    </div>
  );
}

/**
 * FormattedText — handles inline **bold** and `code` formatting.
 */
function FormattedText({ text }: { text: string }) {
  const parts: Array<{ type: 'text' | 'bold' | 'code'; value: string }> = [];
  let buffer = text;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const boldMatch = /\*\*([^*]+)\*\*/.exec(buffer);
    const codeMatch = /`([^`]+)`/.exec(buffer);
    let nextMatch: RegExpExecArray | null = null;
    let kind: 'bold' | 'code' = 'bold';
    if (boldMatch && (!codeMatch || boldMatch.index < codeMatch.index)) {
      nextMatch = boldMatch;
      kind = 'bold';
    } else if (codeMatch) {
      nextMatch = codeMatch;
      kind = 'code';
    }
    if (!nextMatch) {
      if (buffer) parts.push({ type: 'text', value: buffer });
      break;
    }
    if (nextMatch.index > 0) {
      parts.push({ type: 'text', value: buffer.slice(0, nextMatch.index) });
    }
    parts.push({ type: kind, value: nextMatch[1] ?? '' });
    buffer = buffer.slice(nextMatch.index + nextMatch[0].length);
  }
  return (
    <>
      {parts.map((p, i) => {
        if (p.type === 'bold') return <strong key={i} style={{ fontWeight: 600, color: '#111827' }}>{p.value}</strong>;
        if (p.type === 'code') return (
          <code key={i} style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9em',
            background: '#F3F4F6',
            padding: '1px 4px',
            borderRadius: 3,
            color: '#7C2D12',
          }}>{p.value}</code>
        );
        return <span key={i}>{p.value}</span>;
      })}
    </>
  );
}

/**
 * LactCard — карточка LactMed-препарата с совместимостью грудного
 * вскармливания. 3 уровня compatibility: compatible (зелёный),
 * use_with_caution (жёлтый), avoid (красный).
 */
function LactCard({
  drug, query, isOpen, onToggle,
}: {
  drug: LactDrug;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const compatColors = {
    compatible: { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', label: 'Совместим' },
    use_with_caution: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', label: 'С осторожностью' },
    avoid: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', label: 'Избегать' },
  } as const;
  const colors = compatColors[drug.compatibility];

  return (
    <div style={{
      background: '#F5F6F8',
      border: isOpen ? '1px solid #E5E7EB' : 'none',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 150ms ease',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
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
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              <Highlight text={drug.name_ru} query={query} />
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: colors.text,
              background: colors.bg,
              padding: '2px 8px',
              borderRadius: 4,
              border: `1px solid ${colors.border}`,
            }}>
              {colors.label}
            </span>
          </span>
          <span style={{
            display: 'block', fontSize: 12, color: '#6B7280', lineHeight: 1.5,
          }}>
            <Highlight text={drug.summary} query={query} />
          </span>
        </span>
        <span style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
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
              padding: '14px 20px 18px',
              background: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              fontSize: 13.5, lineHeight: 1.55, color: '#1F2937',
            }}>
              <div style={{ marginBottom: 10 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: '#9CA3AF',
                }}>
                  Детали
                </span>
                <p style={{ margin: '4px 0 0' }}>{drug.details}</p>
              </div>
              {drug.monitoring && (
                <div style={{ marginBottom: 10 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF',
                  }}>
                    Мониторинг
                  </span>
                  <p style={{ margin: '4px 0 0' }}>{drug.monitoring}</p>
                </div>
              )}
              <div>
                <a
                  href={drug.lactmed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px',
                    background: '#EEF2FF',
                    color: '#4338CA',
                    borderRadius: 6,
                    fontSize: 12, fontWeight: 600,
                    textDecoration: 'none',
                    border: '1px solid #E0E7FF',
                  }}
                >
                  Открыть LactMed (NCBI)
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * NurseProcedureCard — bedside procedural reference card.
 * Audit Ж1-3 / З1-3 — closes nursing/feldsher content gap.
 */
function NurseProcedureCard({
  procedure, isOpen, onToggle,
}: {
  procedure: NurseProcedure;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      background: '#F5F6F8',
      border: isOpen ? '1px solid #E5E7EB' : 'none',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 150ms ease',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '14px 18px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              {procedure.title_ru}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase', color: '#9CA3AF',
              padding: '2px 6px', background: '#FFFFFF', borderRadius: 4,
              border: '1px solid #E5E7EB',
            }}>
              {procedure.category}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: '#6B7280',
              fontFamily: 'var(--font-mono)',
            }}>
              ~{procedure.duration_min} мин
            </span>
          </span>
        </span>
        <span style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
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
              padding: '14px 20px 18px',
              background: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
              fontSize: 13.5, lineHeight: 1.55, color: '#1F2937',
            }}>
              {procedure.steps.map((step, idx) => (
                <div key={idx} style={{ marginBottom: 14 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700,
                    color: '#1F2937',
                    marginBottom: 6,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      width: 22, height: 22,
                      background: '#2563EB',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {idx + 1}
                    </span>
                    {step.title}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 32, fontSize: 12.5, lineHeight: 1.55, color: '#374151' }}>
                    {step.items.map((it, i) => (
                      <li key={i} style={{ marginBottom: 3 }}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {procedure.warnings.length > 0 && (
                <div style={{
                  marginTop: 10,
                  padding: '12px 14px',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#991B1B', marginBottom: 6,
                  }}>
                    ⚠️ Предупреждения
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#991B1B', lineHeight: 1.55 }}>
                    {procedure.warnings.map((w, i) => (
                      <li key={i} style={{ marginBottom: 3 }}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {procedure.references.length > 0 && (
                <div style={{
                  marginTop: 14, paddingTop: 12, borderTop: '1px solid #E5E7EB',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 6,
                  }}>
                    References
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#6B7280', lineHeight: 1.55 }}>
                    {procedure.references.map((r, i) => (
                      <li key={i} style={{ marginBottom: 3 }}>{r}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

