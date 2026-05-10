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
import { FilterDropdown } from '@/components/tools/page/FilterDropdown';
import EmojiOrFlag from '@/components/ui/EmojiOrFlag';
import { countryMatches, matchCountry } from '@/lib/tool-meta-helpers';
import type { FilterOption } from '@/lib/tools-page/types';

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
  /** Регионы, к которым relevant протокол. Auto-derived из references
   *  (см. scripts/tag-protocols-by-region.py). Используется для filter UI. */
  regions?: string[];
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

// =================== Educational extension (Table 3.Д) ===================

interface ClinicalCase {
  id: string;
  title_ru: string;
  title_en: string;
  topic: string;
  level: 'basic' | 'intermediate' | 'advanced';
  vignette: string;
  presenting_features: string[];
  differential: string[];
  management: string[];
  pearls: string[];
  references: string[];
}

interface ClinicalCasesBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  topics: { id: string; title_ru: string }[];
  levels: { id: string; title_ru: string }[];
  cases: ClinicalCase[];
}

interface CommonMistake {
  id: string;
  title_ru: string;
  title_en: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  mistake: string;
  why_it_happens: string;
  correct_approach: string;
  consequence: string;
  references: string[];
}

interface CommonMistakesBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  categories: { id: string; title_ru: string }[];
  severities: { id: string; title_ru: string }[];
  mistakes: CommonMistake[];
}

interface ChecklistSection {
  title: string;
  items: string[];
}

interface ProcedureChecklist {
  id: string;
  title_ru: string;
  title_en: string;
  category: string;
  estimated_minutes: number;
  audience: string;
  indications: string[];
  sections: ChecklistSection[];
  references: string[];
}

interface ProcedureChecklistsBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  categories: { id: string; title_ru: string }[];
  checklists: ProcedureChecklist[];
}

interface ProcedureVideo {
  id: string;
  title_ru: string;
  title_en: string;
  description: string;
  source: string;
  source_type: string;
  url: string;
  category: string;
  duration_min: number;
  tags: string[];
}

interface ProcedureVideosBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  categories: { id: string; title_ru: string }[];
  videos: ProcedureVideo[];
}

interface AtlasEntry {
  id: string;
  title_ru: string;
  title_en: string;
  description: string;
  key_findings: string[];
  source: string;
  source_type: string;
  url: string;
  category: string;
}

interface AtlasBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  categories: { id: string; title_ru: string }[];
  atlas: AtlasEntry[];
}

type Tab ='drugs' | 'guidelines' | 'calculators' | 'labs' | 'articles' | 'resuscitation' | 'lactmed' | 'quizzes' | 'nurse' | 'growth' | 'bilirubin' | 'cases' | 'mistakes' | 'checklists' | 'videos' | 'atlas' | 'progress' | 'favorites' | 'drugcalc' | 'search' | 'notes';

export default function NeonatalHandbook() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [guidelines, setGuidelines] = useState<GuidelinesBank | null>(null);
  const [calculators, setCalculators] = useState<CalculatorsBank | null>(null);
  const [labs, setLabs] = useState<LabBank | null>(null);
  const [articles, setArticles] = useState<ArticlesBank | null>(null);
  const [lactmed, setLactmed] = useState<LactBank | null>(null);
  const [nurse, setNurse] = useState<NurseProceduresBank | null>(null);
  const [cases, setCases] = useState<ClinicalCasesBank | null>(null);
  const [mistakes, setMistakes] = useState<CommonMistakesBank | null>(null);
  const [checklists, setChecklists] = useState<ProcedureChecklistsBank | null>(null);
  const [videos, setVideos] = useState<ProcedureVideosBank | null>(null);
  const [atlas, setAtlas] = useState<AtlasBank | null>(null);
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

  // Country filter on Калькуляторы tab — same pattern что у ToolsPage
  // (pure-functional buildCountryCounts + countryMatches over calc.source).
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryFilterOpen, setCountryFilterOpen] = useState(false);

  // Region filter на Протоколы tab — фильтрует по guideline.regions[]
  // (auto-tagged from references). Mirror UI pattern.
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [regionFilterOpen, setRegionFilterOpen] = useState(false);

  // Quiz active flag — when QuizRunner enters fullscreen takeover (user
  // clicks a test card), we hide the page header / search / breadcrumb
  // for a clean exam-like UI. QuizRunner notifies via onActiveChange.
  const [quizActive, setQuizActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [drugsR, guidelinesR, calcR, labsR, articlesR, lactR, nurseR, casesR, mistakesR, checklistsR, videosR, atlasR] = await Promise.all([
          fetch('/neonatal-monographs.json?v=2.9.0', { cache: 'force-cache' }),
          fetch('/neonatal-guidelines.json?v=1.9.0', { cache: 'force-cache' }),
          fetch('/neonatal-calculators.json?v=1.0.0', { cache: 'force-cache' }),
          fetch('/neonatal-lab-norms.json?v=1.1.0', { cache: 'force-cache' }),
          fetch('/neonatal-articles.json?v=2.1.0', { cache: 'force-cache' }),
          fetch('/neonatal-lactmed.json?v=1.1.0', { cache: 'force-cache' }),
          fetch('/neonatal-nurse-procedures.json?v=1.2.0', { cache: 'force-cache' }),
          fetch('/neonatal-clinical-cases.json?v=1.3.0', { cache: 'force-cache' }),
          fetch('/neonatal-common-mistakes.json?v=1.3.0', { cache: 'force-cache' }),
          fetch('/neonatal-procedure-checklists.json?v=1.2.0', { cache: 'force-cache' }),
          fetch('/neonatal-procedure-videos.json?v=1.2.0', { cache: 'force-cache' }),
          fetch('/neonatal-atlas.json?v=1.3.0', { cache: 'force-cache' }),
        ]);
        if (!drugsR.ok) throw new Error(`monographs ${drugsR.status}`);
        const drugsJson = await drugsR.json();
        const guidesJson = guidelinesR.ok ? await guidelinesR.json() : null;
        const calcJson = calcR.ok ? await calcR.json() : null;
        const labsJson = labsR.ok ? await labsR.json() : null;
        const articlesJson = articlesR.ok ? await articlesR.json() : null;
        const lactJson = lactR.ok ? await lactR.json() : null;
        const nurseJson = nurseR.ok ? await nurseR.json() : null;
        const casesJson = casesR.ok ? await casesR.json() : null;
        const mistakesJson = mistakesR.ok ? await mistakesR.json() : null;
        const checklistsJson = checklistsR.ok ? await checklistsR.json() : null;
        const videosJson = videosR.ok ? await videosR.json() : null;
        const atlasJson = atlasR.ok ? await atlasR.json() : null;
        if (!cancelled) {
          setBank(drugsJson as Bank);
          if (guidesJson) setGuidelines(guidesJson as GuidelinesBank);
          if (calcJson) setCalculators(calcJson as CalculatorsBank);
          if (labsJson) setLabs(labsJson as LabBank);
          if (articlesJson) setArticles(articlesJson as ArticlesBank);
          if (lactJson) setLactmed(lactJson as LactBank);
          if (nurseJson) setNurse(nurseJson as NurseProceduresBank);
          if (casesJson) setCases(casesJson as ClinicalCasesBank);
          if (mistakesJson) setMistakes(mistakesJson as CommonMistakesBank);
          if (checklistsJson) setChecklists(checklistsJson as ProcedureChecklistsBank);
          if (videosJson) setVideos(videosJson as ProcedureVideosBank);
          if (atlasJson) setAtlas(atlasJson as AtlasBank);
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
    return guidelines.guidelines.filter((g) => {
      // Search query фильтр
      if (query
        && !g.title_en.toLowerCase().includes(query)
        && !g.title_ru.toLowerCase().includes(query)
        && !g.content.toLowerCase().includes(query)) return false;
      // Region фильтр — protocol должен пересекаться хотя бы с одним
      // selected region. Если selectedRegions пусто — показываем всё.
      if (selectedRegions.length > 0) {
        const protoRegions = g.regions ?? ['Международный'];
        const hit = selectedRegions.some((sel) => protoRegions.includes(sel));
        if (!hit) return false;
      }
      return true;
    });
  }, [guidelines, q, selectedRegions]);

  // Region counts — derived from ALL protocols (не отфильтрованные),
  // чтобы dropdown показывал full picture сколько в каждом регионе.
  const guidelineRegionCounts = useMemo<FilterOption[]>(() => {
    if (!guidelines) return [];
    const counts: Record<string, number> = Object.create(null);
    const flags: Record<string, string> = {
      'РФ': '🇷🇺',
      'США': '🇺🇸',
      'Европа': '🇪🇺',
      'Узбекистан': '🇺🇿',
      'Международный': '🌍',
    };
    const order: Record<string, number> = {
      'Международный': 1,
      'США': 2,
      'Европа': 3,
      'РФ': 4,
      'Узбекистан': 5,
    };
    for (const g of guidelines.guidelines) {
      const regions = g.regions ?? ['Международный'];
      for (const r of regions) counts[r] = (counts[r] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count, flag: flags[value], _order: order[value] ?? 99 }))
      .sort((a, b) => {
        if (a._order !== b._order) return a._order - b._order;
        return b.count - a.count;
      })
      .map(({ value, count, flag }) => ({
        value, count,
        ...(flag !== undefined && { flag }),
      }));
  }, [guidelines]);

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
    return calculators.groups
      .map((g) => ({
        ...g,
        calculators: g.calculators.filter((c) => {
          if (query
            && !c.title_ru.toLowerCase().includes(query)
            && !c.title_en.toLowerCase().includes(query)
            && !c.id.toLowerCase().includes(query)
            && !c.source.toLowerCase().includes(query)) return false;
          // Country filter — same pattern as ToolsPage (countryMatches на raw
          // source string). Если ни одного матча — calculator скрыт.
          if (selectedCountries.length > 0) {
            const hit = selectedCountries.some((sel) => countryMatches(c.source, sel));
            if (!hit) return false;
          }
          return true;
        }),
      }))
      .filter((g) => g.calculators.length > 0);
  }, [calculators, q, selectedCountries]);

  // Country counts — derived from all calculators, not the filtered set, чтобы
  // user видел сколько калькуляторов из каждой страны (а не сколько прошло
  // текущий поиск).
  const calcCountryCounts = useMemo<FilterOption[]>(() => {
    if (!calculators) return [];
    const counts: Record<string, number> = Object.create(null);
    const flags: Record<string, string> = Object.create(null);
    const orders: Record<string, number> = Object.create(null);
    for (const g of calculators.groups) {
      for (const c of g.calculators) {
        const seen = new Set<string>();
        for (const part of (c.source ?? '').split(/[·•;,]/)) {
          const trimmed = part.trim();
          if (!trimmed) continue;
          const cg = matchCountry(trimmed);
          if (!cg || seen.has(cg.name)) continue;
          seen.add(cg.name);
          counts[cg.name] = (counts[cg.name] ?? 0) + 1;
          flags[cg.name] = cg.flag;
          orders[cg.name] = cg.order;
        }
        if (seen.size === 0) {
          // Default fallback like ToolsPage
          counts.Международный = (counts.Международный ?? 0) + 1;
          flags.Международный = '🌍';
          orders.Международный = 1;
        }
      }
    }
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count, flag: flags[value], _order: orders[value] ?? 999 }))
      .sort((a, b) => {
        if (a._order !== b._order) return a._order - b._order;
        if (b.count !== a.count) return b.count - a.count;
        return a.value.localeCompare(b.value);
      })
      .map(({ value, count, flag }) => ({
        value, count,
        ...(flag !== undefined && { flag }),
      }));
  }, [calculators]);

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
      {!(tab === 'quizzes' && quizActive) && (tab === 'drugs' || tab === 'guidelines' || tab === 'calculators' || tab === 'labs' || tab === 'articles' || tab === 'lactmed' || tab === 'quizzes' || tab === 'nurse' || tab === 'cases' || tab === 'mistakes' || tab === 'checklists' || tab === 'videos' || tab === 'atlas') && (
      <motion.div
        role="search"
        aria-label={
          tab === 'drugs' ? 'Поиск по препаратам'
            : tab === 'guidelines' ? 'Поиск по протоколам'
            : tab === 'calculators' ? 'Поиск по калькуляторам'
            : tab === 'labs' ? 'Поиск по лабораторным нормам'
            : tab === 'articles' ? 'Поиск по статьям'
            : tab === 'lactmed' ? 'Поиск по LactMed'
            : tab === 'quizzes' ? 'Поиск по тестам'
            : tab === 'nurse' ? 'Поиск по процедурам'
            : 'Поиск'
        }
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
          stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Например: «Ампициллин», «Caffeine», «Surfactant»…'
          aria-label={
            tab === 'drugs' ? 'Поиск препарата'
              : tab === 'guidelines' ? 'Поиск протокола'
              : tab === 'calculators' ? 'Поиск калькулятора'
              : tab === 'labs' ? 'Поиск лабораторной нормы'
              : tab === 'articles' ? 'Поиск статьи'
              : tab === 'lactmed' ? 'Поиск препарата LactMed'
              : tab === 'quizzes' ? 'Поиск теста'
              : tab === 'nurse' ? 'Поиск процедуры'
              : 'Поиск'
          }
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'inherit', fontSize: 14, color: '#1A1A1A',
          }}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="Очистить поле поиска"
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
          // Educational extension (audit Table 3.Д). Counts заполняются
          // когда соответствующий JSON загрузился (см. fetch блок).
          cases: { label: 'Клинические случаи', count: cases?.cases.length ?? null },
          mistakes: { label: 'Типичные ошибки', count: mistakes?.mistakes.length ?? null },
          checklists: { label: 'Чек-листы процедур', count: checklists?.checklists.length ?? null },
          videos: { label: 'Видео процедур', count: videos?.videos.length ?? null },
          atlas: { label: 'Атласы', count: atlas?.atlas.length ?? null },
          // Personal / progress tabs (PR #45 — F1, F2, F3)
          progress: { label: 'Прогресс обучения', count: null },
          favorites: { label: 'Избранное', count: null },
          drugcalc: { label: 'Дозы по весу', count: null },
          search: { label: 'Глобальный поиск', count: null },
          notes: { label: 'Мои заметки', count: null },
        };
        const meta = SECTION_META[tab];
        return (
          <div
            role="navigation"
            aria-label="Текущий раздел"
            style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              paddingBottom: 14, marginBottom: 18,
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <h2
              aria-current="page"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22, fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
                margin: 0,
              }}
            >
              {meta.label}
            </h2>
            {meta.count !== null && (
              <span
                aria-label={`всего ${meta.count}`}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14, fontWeight: 700,
                  color: '#9CA3AF',
                }}
              >
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

          {/* Region filter — позволяет показать только протоколы РФ /
              США / Европы / Узбекистана / Международные. Mirror UI
              калькуляторов; теги region берутся из guideline.regions[]
              auto-derived from references. */}
          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
            marginBottom: 16,
          }}>
            <FilterDropdown
              label="Регионы"
              icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></svg>}
              options={guidelineRegionCounts}
              selected={selectedRegions}
              onChange={setSelectedRegions}
              open={regionFilterOpen}
              onOpen={setRegionFilterOpen}
              searchable
            />
            {selectedRegions.length > 0 && (
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                фильтр: {selectedRegions.join(', ')}
              </span>
            )}
          </div>

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

          {/* Filter row: country dropdown (same pattern как у ToolsPage) +
              Apgar Timer launcher на одной строке. */}
          <div style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
            marginBottom: 16,
          }}>
            <FilterDropdown
              label="Страны"
              icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></svg>}
              options={calcCountryCounts}
              selected={selectedCountries}
              onChange={setSelectedCountries}
              open={countryFilterOpen}
              onOpen={setCountryFilterOpen}
              searchable
            />
            <button
              type="button"
              onClick={() => setApgarTimerOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
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
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Запустить Apgar Timer (родзал)
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {filteredCalculators.map((group) => (
              <div key={group.id}>
                {/* Section header — visually 1:1 с RenderedRow.kind="category"
                    из ToolsPage: display-font 17/700, маленький mono count
                    справа цвета #9CA3AF. */}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#1A1A1A',
                  margin: '0 0 18px',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                }}>
                  {group.title_ru}
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#9CA3AF',
                  }}>
                    {group.calculators.length}
                  </span>
                </h3>
                <div className="rg-3">
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
      ) : tab === 'bilirubin' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <BilirubinNomogram />
        </motion.div>
      ) : tab === 'cases' ? (
        <ClinicalCasesView bank={cases} query={q} openId={openId} setOpenId={setOpenId} />
      ) : tab === 'mistakes' ? (
        <CommonMistakesView bank={mistakes} query={q} openId={openId} setOpenId={setOpenId} />
      ) : tab === 'checklists' ? (
        <ChecklistsView bank={checklists} query={q} openId={openId} setOpenId={setOpenId} />
      ) : tab === 'videos' ? (
        <VideosView bank={videos} query={q} />
      ) : tab === 'atlas' ? (
        <AtlasView bank={atlas} query={q} openId={openId} setOpenId={setOpenId} />
      ) : tab === 'progress' ? (
        <ProgressDashboard bank={null /* will read localStorage */} quizzesBank={null} />
      ) : tab === 'favorites' ? (
        <FavoritesView />
      ) : tab === 'drugcalc' ? (
        <DrugDoseCalculator />
      ) : tab === 'search' ? (
        <GlobalSearchView
          drugs={bank?.drugs ?? []}
          guidelines={guidelines?.guidelines ?? []}
          articles={articles?.articles ?? []}
          cases={cases?.cases ?? []}
          mistakes={mistakes?.mistakes ?? []}
          checklists={checklists?.checklists ?? []}
          videos={videos?.videos ?? []}
          atlas={atlas?.atlas ?? []}
          lactmed={lactmed?.drugs ?? []}
          nurse={nurse?.procedures ?? []}
          onJumpToTab={setTab}
        />
      ) : tab === 'notes' ? (
        <PersonalNotesView />
      ) : null}

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
  const panelId = `drug-panel-${drug.id}`;
  const labelText = drug.name_en !== drug.name_ru
    ? `${drug.name_ru} (${drug.name_en})`
    : drug.name_ru;

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
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть ${labelText}` : `Развернуть ${labelText}`}
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
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
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
        <span aria-hidden="true" style={{
          color: '#6B7280',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`${labelText}: подробности`}
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
  // Warning row выглядит так же как neutral (тот же grid / padding / border-bottom),
  // но получает амбер-цвет label-а и тонкий ⚠ маркер. Никаких yellow-box BG,
  // negative margins или border-radius — это разрушало гармонию остальных полей
  // и читалось как inline-callout вместо органичной строки данных.
  return (
    <div className="neo-detail-row" style={{
      padding: '14px 0',
      borderBottom: isLast ? 'none' : '1px solid #F0F1F5',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: isWarning ? '#B45309' : '#9CA3AF',
        paddingTop: 1,
      }}>
        {isWarning && (
          <svg
            aria-hidden="true" focusable="false"
            width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4}
            strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
        {label}
      </div>
      <div style={{
        color: '#374151',
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
  const panelId = `guideline-panel-${guideline.id}`;
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
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть протокол: ${guideline.title_ru}` : `Развернуть протокол: ${guideline.title_ru}`}
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
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              <Highlight text={guideline.title_ru} query={query} />
            </span>
            {/* Region chips — visualise каждый region из guideline.regions[].
                Mirror NeonatalCalcCard: max 3 visible, +N overflow. */}
            {guideline.regions && guideline.regions.length > 0 && (() => {
              const flagMap: Record<string, string> = {
                'РФ': '🇷🇺',
                'США': '🇺🇸',
                'Европа': '🇪🇺',
                'Узбекистан': '🇺🇿',
                'Международный': '🌍',
              };
              const visible = guideline.regions.slice(0, 3);
              const extra = guideline.regions.length - visible.length;
              return (
                <>
                  {visible.map((r) => (
                    <span
                      key={r}
                      title={r}
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
                      <EmojiOrFlag emoji={flagMap[r] ?? '🏳️'} size={12} />
                      {r}
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
          </span>
          {guideline.title_en !== guideline.title_ru && (
            <span style={{
              display: 'block', marginTop: 3, fontSize: 12, color: '#6B7280',
            }}>
              <Highlight text={guideline.title_en} query={query} />
            </span>
          )}
        </span>
        <span aria-hidden="true" style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Протокол: ${guideline.title_ru}`}
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

  // Country chips — derive from calc.source string. Mirrors ToolCard pattern
  // (max 2 visible + «+N» overflow chip). Source может содержать несколько
  // источников через ";" / "," / "·" — splittwitwlk на любой из них.
  const countries = useMemo(() => {
    const seen = new Set<string>();
    const out: { name: string; flag: string }[] = [];
    for (const part of (calc.source ?? '').split(/[·•;,]/)) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const g = matchCountry(trimmed);
      if (!g || seen.has(g.name)) continue;
      seen.add(g.name);
      out.push({ name: g.name, flag: g.flag });
    }
    return out;
  }, [calc.source]);

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
      type="button"
      onClick={handleClick}
      onMouseEnter={(e) => {
        handlePrefetch();
        e.currentTarget.style.background = '#F0F2F5';
      }}
      onFocus={handlePrefetch}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
      aria-label={`Открыть калькулятор: ${calc.title_ru}. Категория: ${subcategoryLabel}.${calc.audit_id ? ` Audit ID: ${calc.audit_id}.` : ''} Источник: ${calc.source}`}
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
          {/* Single short pill (mirrors ToolCard subcategory chip).
              audit_id (e.g. "A1", "A24/A25") is the natural short label;
              full group title is already shown in the section heading above. */}
          {calc.audit_id && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
              padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
            }}>
              {calc.audit_id}
            </span>
          )}
          {/* Country chips — макс. 2 видимых, overflow через «+N» (1:1 ToolCard). */}
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
  const panelId = `article-panel-${article.id}`;
  return (
    <div style={{
      background: '#F5F6F8',
      border: isOpen ? '1px solid #E5E7EB' : 'none',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 150ms ease',
      position: 'relative',
    }}>
      {/* Favorite star — absolutely positioned, sibling of toggle button (avoids nested-button HTML invalid).
          Top-right above chevron. Click stopPropagation в самом StarButton. */}
      <div style={{ position: 'absolute', top: 12, right: 50, zIndex: 2 }}>
        <FavoriteStarButton id={`article:${article.id}`} type="article" title={article.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть статью: ${article.title_ru}` : `Развернуть статью: ${article.title_ru}. Тема: ${article.topic}`}
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
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
          {/* Collapsed header матчит GuidelineCard: только title + topic pill.
              Сводка (article.summary) перенесена внутрь раскрытой панели как
              лид-абзац — мирror «подробнее» pattern из протоколов. */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              <Highlight text={article.title_ru} query={query} />
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {article.topic}
            </span>
          </span>
        </span>
        <span aria-hidden="true" style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Статья: ${article.title_ru}`}
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
              {/* Лид: краткая сводка статьи (бывший collapsed-summary).
                  Mirrors протокольный intro — visually distinct paragraph
                  выше основного содержимого. */}
              {article.summary && (
                <p style={{
                  margin: '0 0 16px',
                  paddingBottom: 14,
                  borderBottom: '1px solid #F0F1F5',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#4B5563',
                  fontWeight: 400,
                }}>
                  <Highlight text={article.summary} query={query} />
                </p>
              )}
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
                          display: 'inline-flex', alignItems: 'center',
                          padding: '4px var(--space-2)',
                          borderRadius: 'var(--md-sys-shape-corner-full)',
                          background: '#FFFFFF',
                          boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem', fontWeight: 500,
                          color: '#4338CA',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          textDecoration: 'none',
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
  const panelId = `lact-panel-${drug.id}`;

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
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть LactMed: ${drug.name_ru}` : `Развернуть LactMed: ${drug.name_ru}. Совместимость с грудным вскармливанием: ${colors.label}.`}
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
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
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
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 600,
              color: colors.text,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
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
        <span aria-hidden="true" style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`LactMed: ${drug.name_ru}`}
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
              fontSize: 13.5, lineHeight: 1.6, color: '#1F2937',
            }}>
              {/* Лид-абзац (summary) — то же что было в свернутой карточке. */}
              {drug.summary && (
                <p style={{
                  margin: '0 0 16px',
                  paddingBottom: 14,
                  borderBottom: '1px solid #F0F1F5',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: '#4B5563',
                }}>
                  <Highlight text={drug.summary} query={query} />
                </p>
              )}

              {/* Структурированные секции через ту же neo-detail-row grid,
                  что и в DrugCard — лейбл слева, content справа,
                  тонкие divider'ы между секциями. */}
              {drug.details && (
                <NeonatalDetailBlock label="Клинические детали">
                  <Highlight text={drug.details} query={query} />
                </NeonatalDetailBlock>
              )}
              {drug.monitoring && (
                <NeonatalDetailBlock label="Мониторинг ребёнка">
                  <Highlight text={drug.monitoring} query={query} />
                </NeonatalDetailBlock>
              )}

              {/* Footer: link на LactMed + disclaimer. Кнопка теперь
                  design-system-style (white BG + soft shadow). */}
              <div style={{
                marginTop: 16,
                display: 'flex', alignItems: 'center',
                flexWrap: 'wrap', gap: 12,
              }}>
                <a
                  href={drug.lactmed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Открыть статью LactMed (NCBI) по препарату ${drug.name_ru}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 12.5, fontWeight: 600,
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Открыть статью на LactMed (NCBI)
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true" focusable="false">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <span style={{
                  fontSize: 11, color: '#9CA3AF', lineHeight: 1.4,
                  flex: 1, minWidth: 200,
                }}>
                  Резюме адаптировано из LactMed (NIH, public domain).
                  Не заменяет клиническое решение.
                </span>
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
  const panelId = `nurse-panel-${procedure.id}`;
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
        aria-controls={panelId}
        aria-label={isOpen
          ? `Свернуть процедуру: ${procedure.title_ru}`
          : `Развернуть процедуру: ${procedure.title_ru}. Категория: ${procedure.category}. Длительность около ${procedure.duration_min} минут.`
        }
        style={{
          width: '100%',
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '14px 18px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
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
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
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
        <span aria-hidden="true" style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Процедура: ${procedure.title_ru}`}
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
                  marginTop: 14, paddingTop: 12,
                  borderTop: '1px solid #F0F1F5',
                }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#B45309', marginBottom: 6,
                  }}>
                    <svg
                      aria-hidden="true" focusable="false"
                      width={11} height={11} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2.4}
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Предупреждения
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#374151', lineHeight: 1.55 }}>
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

/**
 * EducationPlaceholder — временный shell для разделов Таблицы 3.Д пока
 * их content + cards собираются (T2-T6). Будет removed когда все 5
 * educational sub-tabs получат dedicated card components.
 */
function EducationPlaceholder({
  tab,
}: {
  tab: 'cases' | 'mistakes' | 'checklists' | 'videos' | 'atlas';
}) {
  const meta: Record<typeof tab, { title: string; subtitle: string }> = {
    cases:      { title: 'Клинические случаи',  subtitle: 'Виньетки с разбором: презентация, ключевые находки, дифференциальный диагноз, тактика, обучающие points.' },
    mistakes:   { title: 'Типичные ошибки',     subtitle: 'Распространённые pitfalls в неонатологии — что пошло не так, почему, и как избежать.' },
    checklists: { title: 'Чек-листы процедур',  subtitle: 'Step-by-step чек-листы для UAC/UVC, интубации, LP, surfactant, заменного переливания и других процедур.' },
    videos:     { title: 'Видео процедур',      subtitle: 'Подборка видеоматериалов от AAP, NRP, ESPNIC и других авторитетных источников.' },
    atlas:      { title: 'Атласы',              subtitle: 'Справочник изображений — кожа, рентген, нейросонография, ROP-стадии и др.' },
  };
  const m = meta[tab];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: '24px 20px',
        background: '#F5F6F8',
        borderRadius: 14,
        border: '1px dashed #D1D5DB',
        textAlign: 'center',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 17, fontWeight: 700,
        color: '#1A1A1A',
        marginBottom: 6,
        letterSpacing: '-0.01em',
      }}>
        {m.title}
      </div>
      <p style={{
        margin: '0 auto 12px',
        maxWidth: 520,
        fontSize: 13.5, lineHeight: 1.55,
        color: '#6B7280',
      }}>
        {m.subtitle}
      </p>
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '4px var(--space-2)',
        borderRadius: 'var(--md-sys-shape-corner-full)',
        background: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem', fontWeight: 600,
        color: '#9CA3AF',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        В разработке
      </span>
    </motion.div>
  );
}

// ============================================================================
// T2 — Clinical Cases (Таблица 3.Д2)
// ============================================================================

const CLINICAL_TOPIC_LABELS: Record<string, string> = {
  respiratory: 'Респираторная',
  cardiopulmonary: 'Сердечно-лёгочная',
  neuro: 'Неврология',
  infection: 'Инфекции',
  gastro: 'ЖКТ',
  metabolic: 'Метаболизм',
  hepatic: 'Гепатобилиарная',
  screening: 'Скрининг',
};

function ClinicalCasesView({
  bank, query, openId, setOpenId,
}: {
  bank: ClinicalCasesBank | null;
  query: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    if (!q) return bank.cases;
    return bank.cases.filter((c) =>
      c.title_ru.toLowerCase().includes(q)
      || c.title_en.toLowerCase().includes(q)
      || c.vignette.toLowerCase().includes(q)
      || c.topic.toLowerCase().includes(q)
    );
  }, [bank, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ClinicalCase[]>();
    for (const c of filtered) {
      const label = CLINICAL_TOPIC_LABELS[c.topic] ?? c.topic;
      const arr = map.get(label) ?? [];
      arr.push(c);
      map.set(label, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!bank) {
    return (
      <div>
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 160, width: '100%', borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> из {bank.cases.length} кейсов
        {' · '}
        <span style={{ color: '#9CA3AF' }}>сгруппированы по системе</span>
      </p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 700,
              color: '#1A1A1A',
              margin: '0 0 18px',
              letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              {label}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11, fontWeight: 600,
                color: '#9CA3AF',
              }}>
                {items.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((c) => (
                <ClinicalCaseCard
                  key={c.id}
                  caseEntry={c}
                  query={query}
                  isOpen={openId === c.id}
                  onToggle={() => setOpenId(openId === c.id ? null : c.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{
            padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
            textAlign: 'center', color: '#6B7280', fontSize: 14,
          }}>
            Ничего не найдено.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ClinicalCaseCard({
  caseEntry, query, isOpen, onToggle,
}: {
  caseEntry: ClinicalCase;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const c = caseEntry;
  const panelId = `case-panel-${c.id}`;
  const levelLabel = c.level === 'basic' ? 'Базовый' : c.level === 'advanced' ? 'Продвинутый' : 'Средний';
  return (
    <div style={{
      background: '#F5F6F8',
      border: isOpen ? '1px solid #E5E7EB' : 'none',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 150ms ease',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 12, right: 50, zIndex: 2 }}>
        <FavoriteStarButton id={`case:${c.id}`} type="case" title={c.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть кейс: ${c.title_ru}` : `Развернуть кейс: ${c.title_ru}. Уровень: ${levelLabel}.`}
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
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              <Highlight text={c.title_ru} query={query} />
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {levelLabel}
            </span>
          </span>
        </span>
        <span aria-hidden="true" style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Кейс: ${c.title_ru}`}
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
              fontSize: 13.5, lineHeight: 1.6, color: '#1F2937',
            }}>
              {/* Виньетка — первый блок (контекст случая) */}
              <p style={{
                margin: '0 0 16px',
                paddingBottom: 14,
                borderBottom: '1px solid #F0F1F5',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#374151',
                fontStyle: 'italic',
              }}>
                <Highlight text={c.vignette} query={query} />
              </p>

              <CaseSection label="Ключевые находки" items={c.presenting_features} />
              <CaseSection label="Дифференциальный диагноз" items={c.differential} />
              <CaseSection label="Тактика" items={c.management} ordered />
              <CaseSection label="Pearls (запомнить)" items={c.pearls} tone="pearl" />

              {c.references.length > 0 && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
                  }}>
                    References
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#6B7280', lineHeight: 1.55 }}>
                    {c.references.map((ref, i) => (
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
 * CaseSection — uniform секция-блок внутри ClinicalCaseCard expanded view.
 * Используется для presenting features / differential / management / pearls.
 *
 * tone='pearl' даёт subtle amber accent на label (mirror Precautions
 * pattern из DrugCard) — pearls = take-home points, важно выделить.
 */
function CaseSection({
  label, items, ordered, tone,
}: {
  label: string;
  items: string[];
  ordered?: boolean;
  tone?: 'pearl';
}) {
  if (items.length === 0) return null;
  const ListTag: 'ol' | 'ul' = ordered ? 'ol' : 'ul';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: tone === 'pearl' ? '#B45309' : '#9CA3AF',
        marginBottom: 6,
      }}>
        {tone === 'pearl' && (
          <svg
            aria-hidden="true" focusable="false"
            width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4}
            strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        {label}
      </div>
      <ListTag style={{
        margin: 0, paddingLeft: 22,
        display: 'flex', flexDirection: 'column', gap: 4,
        fontSize: 13, lineHeight: 1.55, color: '#374151',
      }}>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ListTag>
    </div>
  );
}

// ============================================================================
// T3 — Common Mistakes (Таблица 3.Д6)
// ============================================================================

const MISTAKE_CATEGORY_LABELS: Record<string, string> = {
  resuscitation: 'Реанимация',
  respiratory: 'Респираторная',
  thermoregulation: 'Терморегуляция',
  nutrition: 'Питание',
  medication: 'Медикаменты',
  metabolic: 'Метаболизм',
  infection: 'Инфекции',
  neuro: 'Неврология',
  hepatic: 'Гепатобилиарная',
  screening: 'Скрининг',
};

function CommonMistakesView({
  bank, query, openId, setOpenId,
}: {
  bank: CommonMistakesBank | null;
  query: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    if (!q) return bank.mistakes;
    return bank.mistakes.filter((m) =>
      m.title_ru.toLowerCase().includes(q)
      || m.title_en.toLowerCase().includes(q)
      || m.mistake.toLowerCase().includes(q)
      || m.correct_approach.toLowerCase().includes(q)
      || m.category.toLowerCase().includes(q)
    );
  }, [bank, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommonMistake[]>();
    for (const m of filtered) {
      const label = MISTAKE_CATEGORY_LABELS[m.category] ?? m.category;
      const arr = map.get(label) ?? [];
      arr.push(m);
      map.set(label, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!bank) {
    return (
      <div>
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 160, width: '100%', borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> из {bank.mistakes.length} ошибок
        {' · '}
        <span style={{ color: '#9CA3AF' }}>сгруппированы по системе</span>
      </p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 700,
              color: '#1A1A1A',
              margin: '0 0 18px',
              letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              {label}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11, fontWeight: 600,
                color: '#9CA3AF',
              }}>
                {items.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((m) => (
                <CommonMistakeCard
                  key={m.id}
                  mistakeEntry={m}
                  query={query}
                  isOpen={openId === m.id}
                  onToggle={() => setOpenId(openId === m.id ? null : m.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{
            padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
            textAlign: 'center', color: '#6B7280', fontSize: 14,
          }}>
            Ничего не найдено.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function CommonMistakeCard({
  mistakeEntry, query, isOpen, onToggle,
}: {
  mistakeEntry: CommonMistake;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const m = mistakeEntry;
  const panelId = `mistake-panel-${m.id}`;
  // Severity color на text only (наш стандартный pattern):
  // high — красный, medium — амбер, low — нейтральный grey.
  const sevColor = m.severity === 'high' ? '#DC2626'
    : m.severity === 'medium' ? '#B45309'
    : '#6B7280';
  const sevLabel = m.severity === 'high' ? 'Высокая'
    : m.severity === 'medium' ? 'Средняя'
    : 'Низкая';
  return (
    <div style={{
      background: '#F5F6F8',
      border: isOpen ? '1px solid #E5E7EB' : 'none',
      borderRadius: 14,
      overflow: 'hidden',
      transition: 'border-color 150ms ease',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 12, right: 50, zIndex: 2 }}>
        <FavoriteStarButton id={`mistake:${m.id}`} type="mistake" title={m.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть: ${m.title_ru}` : `Развернуть: ${m.title_ru}. Тяжесть последствий: ${sevLabel}.`}
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
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              <Highlight text={m.title_ru} query={query} />
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 600,
              color: sevColor,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {sevLabel}
            </span>
          </span>
        </span>
        <span aria-hidden="true" style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Ошибка: ${m.title_ru}`}
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
              fontSize: 13.5, lineHeight: 1.6, color: '#1F2937',
            }}>
              <MistakeBlock label="Что часто делают неправильно" text={m.mistake} />
              <MistakeBlock label="Почему ошибка типична" text={m.why_it_happens} />
              <MistakeBlock label="Как должно быть" text={m.correct_approach} tone="ok" />
              <MistakeBlock label="Последствия ошибки" text={m.consequence} tone="warning" />

              {m.references.length > 0 && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
                  }}>
                    References
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#6B7280', lineHeight: 1.55 }}>
                    {m.references.map((ref, i) => (
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
 * MistakeBlock — uniform секция-блок внутри CommonMistakeCard expanded view.
 *   tone='ok' даёт green accent на label (correct approach).
 *   tone='warning' — amber accent + ⚠ icon (consequence).
 */
function MistakeBlock({
  label, text, tone,
}: {
  label: string;
  text: string;
  tone?: 'ok' | 'warning';
}) {
  const labelColor = tone === 'ok' ? '#059669'
    : tone === 'warning' ? '#B45309'
    : '#9CA3AF';
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: labelColor,
        marginBottom: 6,
      }}>
        {tone === 'warning' && (
          <svg
            aria-hidden="true" focusable="false"
            width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4}
            strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
        {tone === 'ok' && (
          <svg
            aria-hidden="true" focusable="false"
            width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4}
            strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {label}
      </div>
      <p style={{
        margin: 0,
        fontSize: 13.5, lineHeight: 1.55, color: '#374151',
      }}>
        {text}
      </p>
    </div>
  );
}

// ============================================================================
// T4 — Procedure Checklists (Таблица 3.Д5)
// ============================================================================

const CHECKLIST_CATEGORY_LABELS: Record<string, string> = {
  vascular_access: 'Сосудистый доступ',
  respiratory: 'Респираторные',
  neuro: 'Неврологические',
  hepatic: 'Гепатобилиарные',
  resuscitation: 'Реанимация',
};

function ChecklistsView({
  bank, query, openId, setOpenId,
}: {
  bank: ProcedureChecklistsBank | null;
  query: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    if (!q) return bank.checklists;
    return bank.checklists.filter((c) =>
      c.title_ru.toLowerCase().includes(q)
      || c.title_en.toLowerCase().includes(q)
      || c.indications.some((i) => i.toLowerCase().includes(q))
      || c.category.toLowerCase().includes(q)
    );
  }, [bank, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProcedureChecklist[]>();
    for (const c of filtered) {
      const label = CHECKLIST_CATEGORY_LABELS[c.category] ?? c.category;
      const arr = map.get(label) ?? [];
      arr.push(c);
      map.set(label, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!bank) {
    return (
      <div>
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 160, width: '100%', borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> из {bank.checklists.length} чек-листов
        {' · '}
        <span style={{ color: '#9CA3AF' }}>прогресс сохраняется на устройстве</span>
      </p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 700,
              color: '#1A1A1A',
              margin: '0 0 18px',
              letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              {label}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11, fontWeight: 600,
                color: '#9CA3AF',
              }}>
                {items.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((c) => (
                <ChecklistCard
                  key={c.id}
                  checklist={c}
                  query={query}
                  isOpen={openId === c.id}
                  onToggle={() => setOpenId(openId === c.id ? null : c.id)}
                />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
            textAlign: 'center', color: '#6B7280', fontSize: 14,
          }}>
            Ничего не найдено.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ChecklistCard({
  checklist, query, isOpen, onToggle,
}: {
  checklist: ProcedureChecklist;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const c = checklist;
  const panelId = `checklist-panel-${c.id}`;
  // Прогресс хранится в localStorage. Ключ — bordik-neonatal-checklist-<id>.
  // Map item-key (section_idx:item_idx) → bool checked.
  const [progress, setProgress] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = window.localStorage.getItem(`bordik-neonatal-checklist-${c.id}`);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(`bordik-neonatal-checklist-${c.id}`, JSON.stringify(progress)); } catch { /* ignore */ }
  }, [c.id, progress]);

  const toggleItem = (key: string) =>
    setProgress((prev) => ({ ...prev, [key]: !prev[key] }));
  const resetAll = () => setProgress({});

  // Подсчёт прогресса для UI display.
  const totalItems = c.sections.reduce((s, sec) => s + sec.items.length, 0);
  const doneItems = c.sections.reduce(
    (s, sec, si) => s + sec.items.reduce(
      (s2, _it, ii) => s2 + (progress[`${si}:${ii}`] ? 1 : 0), 0,
    ), 0,
  );
  const percent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

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
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть чек-лист: ${c.title_ru}` : `Развернуть чек-лист: ${c.title_ru}. Длительность ~${c.estimated_minutes} минут.`}
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
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              <Highlight text={c.title_ru} query={query} />
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
              whiteSpace: 'nowrap',
            }}>
              ~{c.estimated_minutes} мин
            </span>
            {percent > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '4px var(--space-2)',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                background: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: 600,
                color: percent === 100 ? '#059669' : '#2563EB',
                whiteSpace: 'nowrap',
              }}>
                {doneItems}/{totalItems} · {percent}%
              </span>
            )}
          </span>
        </span>
        <span aria-hidden="true" style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Чек-лист: ${c.title_ru}`}
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
              fontSize: 13.5, lineHeight: 1.55, color: '#1F2937',
            }}>
              {/* Audience + indications */}
              <div style={{
                marginBottom: 16,
                paddingBottom: 14,
                borderBottom: '1px solid #F0F1F5',
              }}>
                <div style={{
                  fontSize: 12, color: '#6B7280', marginBottom: 6,
                }}>
                  <strong style={{ color: '#1A1A1A' }}>Аудитория:</strong> {c.audience}
                </div>
                {c.indications.length > 0 && (
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    <strong style={{ color: '#1A1A1A' }}>Показания:</strong>
                    <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                      {c.indications.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sections с интерактивными checkbox */}
              {c.sections.map((sec, si) => (
                <div key={si} style={{ marginBottom: 18 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF',
                    marginBottom: 8,
                  }}>
                    {sec.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sec.items.map((it, ii) => {
                      const key = `${si}:${ii}`;
                      const checked = !!progress[key];
                      return (
                        <label
                          key={ii}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            padding: '8px 10px',
                            background: checked ? '#ECFDF5' : '#F9FAFB',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'background 150ms',
                            fontSize: 13.5,
                            color: checked ? '#065F46' : '#1F2937',
                            textDecoration: checked ? 'line-through' : 'none',
                            opacity: checked ? 0.75 : 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleItem(key)}
                            style={{
                              flexShrink: 0,
                              marginTop: 3,
                              width: 16, height: 16,
                              accentColor: '#059669',
                              cursor: 'pointer',
                            }}
                          />
                          <span style={{ lineHeight: 1.5 }}>{it}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Reset button + references */}
              <div style={{
                marginTop: 14, paddingTop: 14, borderTop: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12,
              }}>
                <button
                  type="button"
                  onClick={resetAll}
                  aria-label="Сбросить прогресс чек-листа"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                    border: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: 12.5, fontWeight: 600,
                    color: '#1A1A1A',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Сбросить прогресс
                </button>
                <span style={{ fontSize: 11, color: '#9CA3AF', flex: 1 }}>
                  Прогресс сохраняется локально в браузере. Не заменяет
                  институциональный чек-лист.
                </span>
              </div>

              {c.references.length > 0 && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
                  }}>
                    References
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#6B7280', lineHeight: 1.55 }}>
                    {c.references.map((ref, i) => (
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



// ============================================================================
// T5 — Procedure Videos (Таблица 3.Д3)
// ============================================================================

const VIDEO_CATEGORY_LABELS: Record<string, string> = {
  resuscitation: 'Реанимация',
  respiratory: 'Респираторные',
  vascular_access: 'Сосудистый доступ',
  neuro: 'Неврологические',
  thermal: 'Терморегуляция',
  screening: 'Скрининг',
  examination: 'Осмотр',
  feeding: 'Питание / лактация',
  developmental: 'Развитие',
  hepatic: 'Гепатобилиарные',
};

const VIDEO_SOURCE_TYPE_LABELS: Record<string, string> = {
  youtube_official: 'YouTube · официальный канал',
  who_official: 'WHO',
  nejm: 'NEJM',
};

function VideosView({
  bank, query,
}: {
  bank: ProcedureVideosBank | null;
  query: string;
}) {
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    if (!q) return bank.videos;
    return bank.videos.filter((v) =>
      v.title_ru.toLowerCase().includes(q)
      || v.title_en.toLowerCase().includes(q)
      || v.description.toLowerCase().includes(q)
      || v.tags.some((t) => t.toLowerCase().includes(q))
      || v.source.toLowerCase().includes(q)
    );
  }, [bank, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProcedureVideo[]>();
    for (const v of filtered) {
      const label = VIDEO_CATEGORY_LABELS[v.category] ?? v.category;
      const arr = map.get(label) ?? [];
      arr.push(v);
      map.set(label, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!bank) {
    return (
      <div>
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 160, width: '100%', borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> из {bank.videos.length} видео
        {' · '}
        <span style={{ color: '#9CA3AF' }}>линки на authoritative источники (AAP, WHO, NEJM, EFCNI и др.)</span>
      </p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 700,
              color: '#1A1A1A',
              margin: '0 0 18px',
              letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              {label}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11, fontWeight: 600,
                color: '#9CA3AF',
              }}>
                {items.length}
              </span>
            </h3>
            <div className="rg-3">
              {items.map((v) => (
                <ProcedureVideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
            textAlign: 'center', color: '#6B7280', fontSize: 14,
          }}>
            Ничего не найдено.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ProcedureVideoCard({ video }: { video: ProcedureVideo }) {
  const v = video;
  const sourceLabel = VIDEO_SOURCE_TYPE_LABELS[v.source_type] ?? v.source_type;
  return (
    <a
      href={v.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Открыть видео: ${v.title_ru}. Источник: ${v.source}. Длительность ~${v.duration_min} минут.`}
      style={{
        display: 'flex', flexDirection: 'column',
        background: '#F5F6F8',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-5)',
        textDecoration: 'none',
        color: 'inherit',
        minHeight: 180,
        transition: 'background 300ms cubic-bezier(0.22,1,0.36,1)',
        contentVisibility: 'auto',
        containIntrinsicSize: '180px 240px',
      } as React.CSSProperties}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F2F5'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
    >
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 'var(--space-3)',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem', fontWeight: 500,
          color: 'var(--md-sys-color-on-surface-variant)',
          whiteSpace: 'nowrap',
        }}>
          ~{v.duration_min} мин
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem', fontWeight: 500,
          color: 'var(--md-sys-color-on-surface-variant)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
        }}>
          {sourceLabel}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-base)', fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--space-1)', lineHeight: 1.25,
        }}>
          {v.title_ru}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--md-sys-color-on-surface-variant)',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          margin: 0,
        }}>
          {v.description}
        </p>
      </div>
      <div style={{
        marginTop: 'var(--space-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
      }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)', fontWeight: 500,
          color: 'var(--md-sys-color-on-surface)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {v.source}
        </span>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" focusable="false"
          style={{ flexShrink: 0, color: 'var(--md-sys-color-on-surface)' }}>
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
    </a>
  );
}


// ============================================================================
// T6 — Atlas (Таблица 3.Д4)
// ============================================================================

const ATLAS_CATEGORY_LABELS: Record<string, string> = {
  respiratory_imaging: 'Лёгкие — визуализация',
  abdominal_imaging: 'Живот — визуализация',
  neuroimaging: 'Нейровизуализация',
  vascular_imaging: 'Сосуды / catheters',
  skin: 'Кожа',
  ROP: 'ROP',
  examination: 'Клинический осмотр',
};

const ATLAS_SOURCE_TYPE_LABELS: Record<string, string> = {
  radiopaedia: 'Radiopaedia (CC BY)',
  who_official: 'WHO',
  nejm: 'NEJM',
  stanford: 'Stanford Medicine',
  icrop: 'ICROP / AAO',
};

function AtlasView({
  bank, query, openId, setOpenId,
}: {
  bank: AtlasBank | null;
  query: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    if (!q) return bank.atlas;
    return bank.atlas.filter((a) =>
      a.title_ru.toLowerCase().includes(q)
      || a.title_en.toLowerCase().includes(q)
      || a.description.toLowerCase().includes(q)
      || a.key_findings.some((k) => k.toLowerCase().includes(q))
      || a.source.toLowerCase().includes(q)
    );
  }, [bank, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, AtlasEntry[]>();
    for (const a of filtered) {
      const label = ATLAS_CATEGORY_LABELS[a.category] ?? a.category;
      const arr = map.get(label) ?? [];
      arr.push(a);
      map.set(label, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!bank) {
    return (
      <div>
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 160, width: '100%', borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> из {bank.atlas.length} атласов
        {' · '}
        <span style={{ color: '#9CA3AF' }}>линки на authoritative источники (Radiopaedia, NEJM, AAP)</span>
      </p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 700,
              color: '#1A1A1A',
              margin: '0 0 18px',
              letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              {label}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11, fontWeight: 600,
                color: '#9CA3AF',
              }}>
                {items.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((a) => (
                <AtlasCard
                  key={a.id}
                  entry={a}
                  query={query}
                  isOpen={openId === a.id}
                  onToggle={() => setOpenId(openId === a.id ? null : a.id)}
                />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
            textAlign: 'center', color: '#6B7280', fontSize: 14,
          }}>
            Ничего не найдено.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function AtlasCard({
  entry, query, isOpen, onToggle,
}: {
  entry: AtlasEntry;
  query: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const a = entry;
  const panelId = `atlas-panel-${a.id}`;
  const sourceLabel = ATLAS_SOURCE_TYPE_LABELS[a.source_type] ?? a.source_type;
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
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть атлас: ${a.title_ru}` : `Развернуть атлас: ${a.title_ru}. Источник: ${a.source}.`}
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
        <span aria-hidden="true" style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
            }}>
              <Highlight text={a.title_ru} query={query} />
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px var(--space-2)',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 500,
              color: 'var(--md-sys-color-on-surface-variant)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {sourceLabel}
            </span>
          </span>
        </span>
        <span aria-hidden="true" style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-label={`Атлас: ${a.title_ru}`}
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
              fontSize: 13.5, lineHeight: 1.6, color: '#1F2937',
            }}>
              <p style={{
                margin: '0 0 16px',
                paddingBottom: 14,
                borderBottom: '1px solid #F0F1F5',
                fontSize: 14, lineHeight: 1.55,
                color: '#4B5563',
              }}>
                <Highlight text={a.description} query={query} />
              </p>

              {a.key_findings.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF',
                    marginBottom: 6,
                  }}>
                    Ключевые находки
                  </div>
                  <ul style={{
                    margin: 0, paddingLeft: 22,
                    fontSize: 13, lineHeight: 1.55, color: '#374151',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    {a.key_findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{
                marginTop: 16,
                display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12,
              }}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Открыть атлас: ${a.title_ru} на ${a.source}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 12.5, fontWeight: 600,
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Открыть на {a.source}
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true" focusable="false">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
                <span style={{
                  fontSize: 11, color: '#9CA3AF', flex: 1,
                  lineHeight: 1.4, minWidth: 200,
                }}>
                  Изображения остаются в источнике для соблюдения copyright.
                  Не клиническое заключение.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ============================================================================
// F1 — Quiz Progress Dashboard (Таблица 3.Е3-Е4)
// ============================================================================

interface QuizSnapshot {
  id: string;
  title: string;
  topic: string;
  level: string;
  bankSize: number;
  attempts: number;
  bestScore: number;
  bestPercent: number;
  passed: boolean;
  seenIndices: number[];
  lastAttempt?: number;
}

const TOPIC_LABELS_DASHBOARD: Record<string, string> = {
  resuscitation: 'Реанимация',
  respiratory: 'Респираторная',
  hepatic: 'Гепатобилиарная',
  infection: 'Инфекции',
  neuro: 'Неврология',
  gastro: 'ЖКТ + питание',
  metabolic: 'Метаболизм',
  screening: 'Скрининги',
};

function ProgressDashboard({ bank: _bank, quizzesBank: _quizzesBank }: { bank: unknown; quizzesBank: unknown }) {
  void _bank; void _quizzesBank;
  const [quizzes, setQuizzes] = useState<{ id: string; title_ru: string; topic: string; level: string; questions: unknown[] }[] | null>(null);
  const [progress, setProgress] = useState<Record<string, { selected: Record<number, number>; submitted: boolean; score: number; playOrder?: number[]; seenIndices?: number[] }>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/neonatal-quizzes.json?v=1.3.0', { cache: 'force-cache' });
        if (!r.ok) return;
        const json = await r.json();
        if (!cancelled) setQuizzes(json.quizzes);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('bordik-neonatal-quiz-state');
      if (raw) setProgress(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const snapshots: QuizSnapshot[] = useMemo(() => {
    if (!quizzes) return [];
    return quizzes.map((q) => {
      const st = progress[q.id];
      const bankSize = q.questions.length;
      const seen = st?.seenIndices ?? [];
      const score = st?.score ?? 0;
      const displayCount = Math.min(10, bankSize);
      const percent = displayCount > 0 ? Math.round((score / displayCount) * 100) : 0;
      const passed = percent >= 70 && (st?.submitted ?? false);
      return {
        id: q.id,
        title: q.title_ru,
        topic: q.topic,
        level: q.level,
        bankSize,
        attempts: seen.length > 0 || st?.submitted ? Math.max(1, Math.ceil(seen.length / displayCount)) : 0,
        bestScore: score,
        bestPercent: percent,
        passed,
        seenIndices: seen,
      };
    });
  }, [quizzes, progress]);

  const stats = useMemo(() => {
    const attempted = snapshots.filter((s) => s.attempts > 0);
    const passed = snapshots.filter((s) => s.passed);
    const avgPercent = attempted.length > 0
      ? Math.round(attempted.reduce((a, s) => a + s.bestPercent, 0) / attempted.length)
      : 0;
    return {
      total: snapshots.length,
      attempted: attempted.length,
      passed: passed.length,
      avgPercent,
    };
  }, [snapshots]);

  const byTopic = useMemo(() => {
    const map = new Map<string, { total: number; attempted: number; passed: number }>();
    for (const s of snapshots) {
      const cur = map.get(s.topic) ?? { total: 0, attempted: 0, passed: 0 };
      cur.total += 1;
      if (s.attempts > 0) cur.attempted += 1;
      if (s.passed) cur.passed += 1;
      map.set(s.topic, cur);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [snapshots]);

  const suggestions = useMemo(() => {
    // Recommend up to 3: not-yet-attempted first, then lowest-scored, then unseen-questions remaining
    const notAttempted = snapshots.filter((s) => s.attempts === 0);
    const lowScored = snapshots.filter((s) => s.attempts > 0 && !s.passed).sort((a, b) => a.bestPercent - b.bestPercent);
    const partialCoverage = snapshots.filter((s) => s.attempts > 0 && s.seenIndices.length < s.bankSize).sort((a, b) => (b.bankSize - b.seenIndices.length) - (a.bankSize - a.seenIndices.length));
    const out = [...notAttempted, ...lowScored, ...partialCoverage];
    const seen = new Set<string>();
    return out.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    }).slice(0, 3);
  }, [snapshots]);

  if (!quizzes) {
    return (
      <div>
        <div className="lc-shimmer" style={{ height: 120, width: '100%', borderRadius: 14, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 200, width: '100%', borderRadius: 14 }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Aggregate stats — 4 KPI cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 24,
      }}>
        <ProgressKpi label="Тестов всего" value={`${stats.total}`} />
        <ProgressKpi label="Пройдено хоть раз" value={`${stats.attempted}`} sublabel={`${Math.round(stats.attempted / Math.max(1, stats.total) * 100)}%`} />
        <ProgressKpi label="Сдано (≥70%)" value={`${stats.passed}`} sublabel={`${Math.round(stats.passed / Math.max(1, stats.total) * 100)}%`} accent="#059669" />
        <ProgressKpi label="Средний балл" value={`${stats.avgPercent}%`} accent={stats.avgPercent >= 70 ? '#059669' : stats.avgPercent >= 50 ? '#B45309' : '#9CA3AF'} />
      </div>

      {/* Suggestions — what to do next */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
            color: '#1A1A1A', margin: '0 0 12px', letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'baseline', gap: 8,
          }}>
            Рекомендуем пройти
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>
              {suggestions.length}
            </span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestions.map((s) => {
              const reason = s.attempts === 0
                ? 'Ещё не пробовали'
                : !s.passed
                ? `Текущий результат ${s.bestPercent}% — ниже 70%`
                : `Bank ${s.bankSize}, видели ${s.seenIndices.length} — ещё ${s.bankSize - s.seenIndices.length} новых`;
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  padding: '14px 16px',
                  background: '#F5F6F8',
                  borderRadius: 12,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
                    color: '#1A1A1A', flex: 1, minWidth: 200,
                  }}>{s.title}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px var(--space-2)',
                    borderRadius: 'var(--md-sys-shape-corner-full)',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem', fontWeight: 500,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}>
                    {TOPIC_LABELS_DASHBOARD[s.topic] ?? s.topic}
                  </span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{reason}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-topic breakdown */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 12px', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          По темам
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>
            {byTopic.length}
          </span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {byTopic.map(([topic, bucket]) => {
            const passPct = Math.round(bucket.passed / Math.max(1, bucket.total) * 100);
            return (
              <div key={topic} style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: '12px 16px',
                background: '#F5F6F8',
                borderRadius: 10,
              }}>
                <span style={{ fontWeight: 600, flex: 1, minWidth: 160, fontSize: 14 }}>
                  {TOPIC_LABELS_DASHBOARD[topic] ?? topic}
                </span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {bucket.passed}/{bucket.total} сдано
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
                  background: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 600,
                  color: passPct === 100 ? '#059669' : passPct >= 70 ? '#B45309' : '#9CA3AF',
                  whiteSpace: 'nowrap',
                }}>
                  {passPct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-quiz table */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 12px', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          Все тесты
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>
            {snapshots.length}
          </span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {snapshots.map((s) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              padding: '12px 16px',
              background: s.passed ? '#ECFDF5' : '#F5F6F8',
              borderRadius: 10,
            }}>
              <span style={{ fontWeight: 600, flex: 1, minWidth: 200, fontSize: 13.5 }}>
                {s.title}
              </span>
              {s.attempts > 0 ? (
                <>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 600,
                    color: s.passed ? '#059669' : '#B45309',
                    whiteSpace: 'nowrap',
                  }}>
                    {s.passed ? 'PASS' : 'FAIL'} {s.bestScore}/{Math.min(10, s.bankSize)}
                  </span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    Видели {s.seenIndices.length}/{s.bankSize}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>не пройден</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressKpi({ label, value, sublabel, accent }: { label: string; value: string; sublabel?: string; accent?: string }) {
  return (
    <div style={{
      padding: '16px 18px',
      background: '#F5F6F8',
      borderRadius: 14,
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: '#9CA3AF',
        marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 26, fontWeight: 700,
        color: accent ?? '#1A1A1A',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
      }}>{value}</div>
      {sublabel && (
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>{sublabel}</div>
      )}
    </div>
  );
}

// ============================================================================
// F2 — Drug Quick Calculator (Дозы по весу)
// ============================================================================

interface EmergencyDrug {
  id: string;
  name_ru: string;
  category: 'resuscitation' | 'metabolic' | 'sedation' | 'cardio';
  dose_per_kg: number;
  unit: string;
  formula_text: string;
  concentration?: string;
  route: string;
  max_total?: number;
  notes: string;
  reference: string;
}

const EMERGENCY_DRUGS: EmergencyDrug[] = [
  { id: 'epi-iv', name_ru: 'Эпинефрин (адреналин) IV/IO', category: 'resuscitation', dose_per_kg: 0.02, unit: 'мг/кг', formula_text: '0.01-0.03 мг/кг', concentration: '1:10000 (0.1 мг/мл)', route: 'IV / IO push', notes: 'NRP 8 ed. Повторять q3-5 минут до ЧСС ≥60.', reference: 'Aziz K et al. Pediatrics 2021;147:e2020038505E' },
  { id: 'epi-ett', name_ru: 'Эпинефрин эндотрахеально', category: 'resuscitation', dose_per_kg: 0.075, unit: 'мг/кг', formula_text: '0.05-0.1 мг/кг', concentration: '1:10000 (0.1 мг/мл)', route: 'ETT (только если IV не получен)', notes: 'Менее эффективен чем IV. Switch к IV ASAP.', reference: 'NRP 8 ed.' },
  { id: 'naloxone', name_ru: 'Налоксон', category: 'resuscitation', dose_per_kg: 0.1, unit: 'мг/кг', formula_text: '0.1 мг/кг', concentration: '0.4 мг/мл', route: 'IV / IM / SC / ETT', notes: 'НЕ рутинно в реанимации (NRP 2010+). Только при confirmed maternal opioid use в delivery.', reference: 'AAP NRP 8 ed.' },
  { id: 'atropine', name_ru: 'Атропин', category: 'sedation', dose_per_kg: 0.02, unit: 'мг/кг', formula_text: '0.02 мг/кг (min 0.1 мг)', concentration: '0.1 мг/мл', route: 'IV / IM', max_total: 0.5, notes: 'Премедикация интубации (анти-vagal). Не для рутинной brady — treat hypoxia first.', reference: 'AAP COFN' },
  { id: 'glucose-bolus', name_ru: 'D10 болюс при гипогликемии', category: 'metabolic', dose_per_kg: 2, unit: 'мл/кг', formula_text: '2 мл/кг D10W (200 мг/кг dextrose)', concentration: 'D10W', route: 'IV slow push', notes: 'BG <2.6 ммоль/л symptomatic. Continuous GIR 6-8 мг/кг/мин после bolus.', reference: 'PES 2015 / BAPM 2017' },
  { id: 'nacl-bolus', name_ru: 'NaCl 0.9% болюс (гиповолемия)', category: 'cardio', dose_per_kg: 10, unit: 'мл/кг', formula_text: '10 мл/кг за 5-10 минут', concentration: '0.9%', route: 'IV / IO', notes: 'Гиповолемия / шок. Repeat × 1 PRN. Если 30 мл/кг + persistent — inotropes.', reference: 'NRP 8 ed.' },
  { id: 'ca-gluconate', name_ru: 'Кальций глюконат 10%', category: 'metabolic', dose_per_kg: 1, unit: 'мл/кг', formula_text: '1-2 мл/кг slow IV (over 5-10 мин)', concentration: '10%', route: 'IV slow', notes: 'Hypocalcemia при ionized Ca²⁺ <0.9. Slow push! Rapid → bradycardia/arrhythmia.', reference: 'AAP' },
  { id: 'mg-sulfate', name_ru: 'Магнезия сульфат', category: 'metabolic', dose_per_kg: 25, unit: 'мг/кг', formula_text: '25-50 мг/кг IV slow (≥10 мин)', concentration: '50% (500 мг/мл)', route: 'IV slow', notes: 'Hypomagnesemia. Mg <1.5 мг/дл refractory hypocalcemia. Watch hypotension.', reference: 'AAP' },
  { id: 'phenobarb-load', name_ru: 'Фенобарбитал loading (судороги)', category: 'sedation', dose_per_kg: 20, unit: 'мг/кг', formula_text: '20 мг/кг IV slow (over 10-20 мин)', concentration: '60 мг/мл', route: 'IV slow', notes: 'Neonatal seizures first-line. Repeat 10 мг/кг до total 40 мг/кг. Watch resp. depression.', reference: 'Sharpe C et al. Pediatrics 2020;145:e20193182' },
  { id: 'morphine-bolus', name_ru: 'Морфин болюс (intubation/pain)', category: 'sedation', dose_per_kg: 0.05, unit: 'мг/кг', formula_text: '0.05-0.1 мг/кг IV slow', concentration: '1 мг/мл (diluted)', route: 'IV slow', notes: 'Premedication intubation OR severe pain. Watch apnea + hypotension. Have naloxone ready.', reference: 'AAP CFN 2016' },
  { id: 'fentanyl-bolus', name_ru: 'Фентанил болюс', category: 'sedation', dose_per_kg: 1.5, unit: 'мкг/кг', formula_text: '1-2 мкг/кг IV slow', concentration: '50 мкг/мл', route: 'IV slow', notes: 'Premed intubation. Less hypotension vs morphine. Risk chest wall rigidity (push slow).', reference: 'AAP CFN' },
  { id: 'midazolam', name_ru: 'Мидазолам continuous', category: 'sedation', dose_per_kg: 0.05, unit: 'мг/кг/час', formula_text: '0.05-0.5 мг/кг/час IV', concentration: '1 мг/мл', route: 'IV continuous', notes: 'Sedation на ИВЛ. Watch hypotension. Withdrawal при rapid taper.', reference: 'AAP CFN' },
  { id: 'ino', name_ru: 'iNO (PPHN)', category: 'cardio', dose_per_kg: 0, unit: 'ppm', formula_text: '20 ppm стартово (NOT weight-based)', concentration: 'gas', route: 'inhaled', notes: 'PPHN с OI >15. Wean by 5 ppm каждые 4 часа. Monitor metHb, NO₂.', reference: 'AHA 2019 PPHN' },
  { id: 'caffeine-load', name_ru: 'Кофеин loading', category: 'cardio', dose_per_kg: 20, unit: 'мг/кг', formula_text: '20 мг/кг loading IV/PO over 30 мин', concentration: '20 мг/мл', route: 'IV / PO', notes: 'Универсально preterm <32 нед. Maintenance 5-10 мг/кг q24h.', reference: 'CAP trial NEJM 2007;357:1893' },
  { id: 'surfactant-curo', name_ru: 'Сурфактант (Curosurf)', category: 'cardio', dose_per_kg: 200, unit: 'мг/кг', formula_text: '200 мг/кг (2.5 мл/кг) первая доза', concentration: '80 мг/мл', route: 'ETT / LISA', notes: 'RDS preterm. Repeat 100 мг/кг q12h до 3 доз PRN.', reference: 'Sweet European Consensus 2022' },
  { id: 'amp-iv', name_ru: 'Ампициллин IV (EOS empiric)', category: 'cardio', dose_per_kg: 50, unit: 'мг/кг', formula_text: '50 мг/кг IV q8-12h', concentration: '100 мг/мл', route: 'IV', notes: 'EOS coverage GBS, E.coli, Listeria. q12h первые 7 days, q8h далее.', reference: 'AAP COFN 2017' },
  { id: 'gent-iv', name_ru: 'Гентамицин IV (EOS empiric)', category: 'cardio', dose_per_kg: 4, unit: 'мг/кг', formula_text: '4-5 мг/кг IV q24h (q36h <30 нед)', concentration: '10 мг/мл', route: 'IV', notes: 'EOS coverage с амп. Monitor renal + ototoxicity. Trough <2 мг/л.', reference: 'AAP COFN' },
  { id: 'vanco-iv', name_ru: 'Ванкомицин IV (LOS empiric)', category: 'cardio', dose_per_kg: 15, unit: 'мг/кг', formula_text: '15 мг/кг IV q12h slow', concentration: '5 мг/мл', route: 'IV slow (60 мин)', notes: 'LOS coverage CoNS, MRSA. Trough 10-15 мг/л. Risk red-man syndrome.', reference: 'AAP COFN' },
  { id: 'cefepime-iv', name_ru: 'Цефепим IV (LOS broad)', category: 'cardio', dose_per_kg: 50, unit: 'мг/кг', formula_text: '50 мг/кг IV q12h', concentration: '100 мг/мл', route: 'IV', notes: 'LOS gram-negative coverage. Альтернатива гентамицину при resistance.', reference: 'AAP COFN' },
  { id: 'meropenem-iv', name_ru: 'Меропенем IV', category: 'cardio', dose_per_kg: 20, unit: 'мг/кг', formula_text: '20 мг/кг IV q12h (40 для meningitis)', concentration: '50 мг/мл', route: 'IV', notes: 'Severe sepsis, MDR. Reserved для escalation.', reference: 'AAP COFN' },
  { id: 'fluconazole', name_ru: 'Флуконазол (candida prophylaxis)', category: 'cardio', dose_per_kg: 3, unit: 'мг/кг', formula_text: '3-6 мг/кг IV/PO q72h × 6 нед', concentration: '2 мг/мл', route: 'IV / PO', notes: 'Candida prophylaxis ELBW <1000 г. Treatment 12 мг/кг q24h.', reference: 'AAP COFN 2014' },
  { id: 'acyclovir', name_ru: 'Ацикловир (HSV)', category: 'cardio', dose_per_kg: 20, unit: 'мг/кг', formula_text: '20 мг/кг IV q8h × 14-21 days', concentration: '7 мг/мл', route: 'IV slow (1 hr)', notes: 'HSV neonatal — empirically pending PCR при clinical suspicion.', reference: 'AAP Red Book' },
  { id: 'pgE1', name_ru: 'Простагландин E1 (PGE1)', category: 'cardio', dose_per_kg: 0.05, unit: 'мкг/кг/мин', formula_text: 'Старт 0.05 мкг/кг/мин IV, titrate 0.01-0.4', concentration: '0.5 мг/мл, dilute', route: 'IV continuous', notes: 'Duct-dependent CHD. Watch apnea (intubate готов), fever, jitters.', reference: 'AHA 2019 Pediatric Cardiac' },
  { id: 'sildenafil', name_ru: 'Силденафил (PPHN)', category: 'cardio', dose_per_kg: 1, unit: 'мг/кг', formula_text: '0.5-2 мг/кг q6h PO/NG', concentration: '10 мг/мл oral susp', route: 'PO / NG', notes: 'PPHN adjuvant к iNO. Monitor systemic BP — hypotension risk.', reference: 'Cochrane 2017' },
  { id: 'milrinone', name_ru: 'Милринон (cardiac inotrope)', category: 'cardio', dose_per_kg: 0.5, unit: 'мкг/кг/мин', formula_text: '0.25-0.75 мкг/кг/мин (no loading neonate)', concentration: '200 мкг/мл', route: 'IV continuous', notes: 'PDE-3 inhibitor. Inotrope + PVR vasodilator. PPHN с RV dysfunction.', reference: 'AHA 2019' },
  { id: 'dopamine', name_ru: 'Допамин', category: 'cardio', dose_per_kg: 5, unit: 'мкг/кг/мин', formula_text: '5-15 мкг/кг/мин IV continuous', concentration: '1.6 мг/мл (40 мг в D5W 250)', route: 'IV continuous (CVL)', notes: 'First-line inotrope cold shock. Higher doses — vasoconstrictor.', reference: 'AAP CFN' },
  { id: 'norepi', name_ru: 'Норэпинефрин (warm shock)', category: 'cardio', dose_per_kg: 0.05, unit: 'мкг/кг/мин', formula_text: '0.05-0.5 мкг/кг/мин IV continuous', concentration: '8 мкг/мл (4 мг + D5W 500)', route: 'IV continuous (CVL)', notes: 'Vasodilatory shock. Selective vasoconstrictor — raises SVR.', reference: 'AAP CFN' },
  { id: 'vasopressin', name_ru: 'Вазопрессин (catecholamine-resistant)', category: 'cardio', dose_per_kg: 0.0005, unit: 'U/кг/мин', formula_text: '0.0003-0.002 U/кг/мин IV continuous', concentration: '20 U/мл, dilute', route: 'IV continuous (CVL)', notes: 'Catecholamine-resistant warm shock. V1 selective без ↑ PVR.', reference: 'PALS 2020' },
  { id: 'hydrocort', name_ru: 'Гидрокортизон (refractory shock)', category: 'cardio', dose_per_kg: 1, unit: 'мг/кг', formula_text: '1 мг/кг IV q6-8h', concentration: '50 мг/мл', route: 'IV', notes: 'Catecholamine-resistant shock. Adrenal insufficiency. Taper 5-7 дней.', reference: 'PALS 2020' },
  { id: 'levetiracetam', name_ru: 'Леветирацетам (seizures)', category: 'sedation', dose_per_kg: 30, unit: 'мг/кг', formula_text: '20-40 мг/кг IV loading, затем 20 мг/кг q12h', concentration: '100 мг/мл', route: 'IV / PO', notes: 'Emerging 1st-line у neonates. Better safety vs phenobarb (NeoLEV2).', reference: 'Sharpe C et al. Pediatrics 2020;145' },
];

const DRUG_CATEGORY_LABELS: Record<EmergencyDrug['category'], string> = {
  resuscitation: 'Реанимация',
  metabolic: 'Метаболизм',
  sedation: 'Аналгезия / седация',
  cardio: 'Кардио / респираторное',
};

function DrugDoseCalculator() {
  const [weightStr, setWeightStr] = useState<string>('3.0');
  const [filterCategory, setFilterCategory] = useState<EmergencyDrug['category'] | 'all'>('all');

  const weight = useMemo(() => {
    const n = parseFloat(weightStr.replace(',', '.'));
    return isFinite(n) && n > 0 && n <= 10 ? n : null;
  }, [weightStr]);

  const visibleDrugs = useMemo(() => {
    if (filterCategory === 'all') return EMERGENCY_DRUGS;
    return EMERGENCY_DRUGS.filter((d) => d.category === filterCategory);
  }, [filterCategory]);

  const grouped = useMemo(() => {
    const map = new Map<EmergencyDrug['category'], EmergencyDrug[]>();
    for (const d of visibleDrugs) {
      const arr = map.get(d.category) ?? [];
      arr.push(d);
      map.set(d.category, arr);
    }
    return Array.from(map.entries());
  }, [visibleDrugs]);

  return (
    <div style={{ width: '100%' }}>
      {/* Disclaimer */}
      <div style={{
        padding: '12px 14px',
        background: '#FEF3C7',
        border: '1px solid #FDE68A',
        borderRadius: 10,
        marginBottom: 16,
        fontSize: 12.5,
        color: '#78350F',
        lineHeight: 1.5,
      }}>
        <strong>⚠ Только справочный инструмент.</strong> Расчёты по формуле doses × weight.
        Перед применением проверьте индивидуально по протоколу учреждения и LCP/PALS дозам.
        Не заменяет клиническое решение.
      </div>

      {/* Weight input */}
      <div style={{
        padding: '16px 18px',
        background: '#F5F6F8',
        borderRadius: 14,
        marginBottom: 16,
      }}>
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: '#9CA3AF',
          marginBottom: 8,
        }}>
          Вес ребёнка (кг)
        </label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0.4"
          max="10"
          value={weightStr}
          onChange={(e) => setWeightStr(e.target.value)}
          aria-label="Вес ребёнка в килограммах"
          style={{
            width: '100%',
            padding: '12px 14px',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 24, fontWeight: 700,
            color: '#1A1A1A',
            outline: 'none',
          }}
        />
        {weight === null && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626' }}>
            Введите вес 0.4 — 10.0 кг
          </div>
        )}
      </div>

      {/* Category filter */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        marginBottom: 16,
      }}>
        {(['all', 'resuscitation', 'metabolic', 'sedation', 'cardio'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilterCategory(c)}
            aria-pressed={filterCategory === c}
            style={{
              padding: '6px 12px',
              background: filterCategory === c ? '#1A1A1A' : '#FFFFFF',
              color: filterCategory === c ? '#FFFFFF' : '#1A1A1A',
              border: 'none',
              borderRadius: 'var(--md-sys-shape-corner-full)',
              boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            {c === 'all' ? 'Все' : DRUG_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Drug rows grouped */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {grouped.map(([cat, drugs]) => (
          <div key={cat}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 700,
              color: '#1A1A1A',
              margin: '0 0 12px',
              letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              {DRUG_CATEGORY_LABELS[cat]}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>
                {drugs.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {drugs.map((d) => {
                const calculated = weight !== null && d.dose_per_kg > 0 ? (d.dose_per_kg * weight) : null;
                const capped = d.max_total !== undefined && calculated !== null && calculated > d.max_total ? d.max_total : calculated;
                const calcText = capped !== null
                  ? `${capped.toFixed(d.unit.includes('мкг') ? 0 : 2)} ${d.unit.replace('/кг', '')}`
                  : (d.dose_per_kg === 0 ? d.formula_text : '—');
                return (
                  <div key={d.id} style={{
                    padding: '14px 16px',
                    background: '#F5F6F8',
                    borderRadius: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 14, fontWeight: 600,
                        color: '#1A1A1A',
                        flex: 1, minWidth: 200,
                      }}>{d.name_ru}</span>
                      {capped !== null && (
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 18, fontWeight: 700,
                          color: '#2563EB',
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                        }}>
                          {calcText}
                          {d.max_total !== undefined && calculated !== null && calculated > d.max_total && (
                            <span style={{ fontSize: 11, color: '#B45309', marginLeft: 6 }}>
                              (max)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 12, color: '#6B7280' }}>
                      {d.formula_text} · {d.route}
                      {d.concentration && <> · {d.concentration}</>}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>
                      {d.notes}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// F3 — Favorites system
// ============================================================================

interface FavoriteEntry {
  id: string;
  type: 'drug' | 'guideline' | 'article' | 'case' | 'mistake' | 'checklist' | 'video' | 'atlas';
  title: string;
  added: number;
}

const TYPE_LABELS: Record<FavoriteEntry['type'], string> = {
  drug: 'Препарат',
  guideline: 'Протокол',
  article: 'Статья',
  case: 'Кейс',
  mistake: 'Ошибка',
  checklist: 'Чек-лист',
  video: 'Видео',
  atlas: 'Атлас',
};

function loadFavorites(): FavoriteEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('bordik-neonatal-favorites');
    if (!raw) return [];
    return JSON.parse(raw) as FavoriteEntry[];
  } catch {
    return [];
  }
}

function saveFavorites(favs: FavoriteEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('bordik-neonatal-favorites', JSON.stringify(favs));
    // Notify any other component listening for changes
    window.dispatchEvent(new CustomEvent('bordik-favs-changed'));
  } catch { /* ignore */ }
}

function FavoritesView() {
  const [favs, setFavs] = useState<FavoriteEntry[]>(() => loadFavorites());

  useEffect(() => {
    const handler = () => setFavs(loadFavorites());
    if (typeof window === 'undefined') return;
    window.addEventListener('bordik-favs-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('bordik-favs-changed', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<FavoriteEntry['type'], FavoriteEntry[]>();
    for (const f of favs) {
      const arr = map.get(f.type) ?? [];
      arr.push(f);
      map.set(f.type, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [favs]);

  const handleRemove = (id: string) => {
    const next = favs.filter((f) => f.id !== id);
    setFavs(next);
    saveFavorites(next);
  };
  const handleClearAll = () => {
    setFavs([]);
    saveFavorites([]);
  };

  if (favs.length === 0) {
    return (
      <div style={{
        padding: '32px 20px',
        background: '#F5F6F8',
        borderRadius: 14,
        textAlign: 'center',
        color: '#6B7280',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17, fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: 8,
        }}>
          Пока пусто
        </div>
        <p style={{ margin: '0 auto', maxWidth: 460, fontSize: 13.5, lineHeight: 1.55 }}>
          Нажмите на иконку звезды у любой карточки (статьи, кейса, ошибки),
          чтобы добавить её в избранное. Здесь будут собраны все ваши закладки
          для быстрого доступа.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{favs.length}</strong> избранных
        {' · '}
        <button
          type="button"
          onClick={handleClearAll}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#DC2626', fontSize: 13, padding: 0, textDecoration: 'underline',
          }}
        >
          Очистить всё
        </button>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {grouped.map(([type, items]) => (
          <div key={type}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17, fontWeight: 700,
              color: '#1A1A1A',
              margin: '0 0 12px',
              letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              {TYPE_LABELS[type]}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>
                {items.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((f) => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  background: '#F5F6F8',
                  borderRadius: 10,
                }}>
                  <span style={{ flex: 1, fontSize: 13.5, color: '#1A1A1A', fontWeight: 500 }}>
                    {f.title}
                  </span>
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {new Date(f.added).toLocaleDateString('ru-RU')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(f.id)}
                    aria-label={`Удалить из избранного: ${f.title}`}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9CA3AF', fontSize: 18, padding: '4px 8px',
                      display: 'inline-flex', alignItems: 'center',
                      borderRadius: 6,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Reusable star button — toggles favorite state. Used inside cards. */
function FavoriteStarButton({ id, type, title }: { id: string; type: FavoriteEntry['type']; title: string }) {
  const [isFav, setIsFav] = useState<boolean>(() => {
    const favs = loadFavorites();
    return favs.some((f) => f.id === id);
  });

  useEffect(() => {
    const handler = () => {
      const favs = loadFavorites();
      setIsFav(favs.some((f) => f.id === id));
    };
    if (typeof window === 'undefined') return;
    window.addEventListener('bordik-favs-changed', handler);
    return () => window.removeEventListener('bordik-favs-changed', handler);
  }, [id]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const favs = loadFavorites();
    if (favs.some((f) => f.id === id)) {
      saveFavorites(favs.filter((f) => f.id !== id));
      setIsFav(false);
    } else {
      saveFavorites([...favs, { id, type, title, added: Date.now() }]);
      setIsFav(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFav ? `Убрать из избранного: ${title}` : `Добавить в избранное: ${title}`}
      aria-pressed={isFav}
      style={{
        flexShrink: 0,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        display: 'inline-flex', alignItems: 'center',
        color: isFav ? '#F59E0B' : '#9CA3AF',
        transition: 'color 150ms',
      }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" focusable="false">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}


// ============================================================================
// G1 — Global Search across all banks
// ============================================================================

interface GlobalSearchHit {
  id: string;
  title: string;
  snippet: string;
  type: 'drug' | 'guideline' | 'article' | 'case' | 'mistake' | 'checklist' | 'video' | 'atlas' | 'lactmed' | 'nurse';
  jumpTab: Tab;
}

const HIT_TYPE_LABELS: Record<GlobalSearchHit['type'], string> = {
  drug: 'Препарат',
  guideline: 'Протокол',
  article: 'Статья',
  case: 'Кейс',
  mistake: 'Ошибка',
  checklist: 'Чек-лист',
  video: 'Видео',
  atlas: 'Атлас',
  lactmed: 'LactMed',
  nurse: 'Процедура',
};

const HIT_TYPE_COLORS: Record<GlobalSearchHit['type'], string> = {
  drug: '#2563EB',
  guideline: '#7C3AED',
  article: '#0891B2',
  case: '#DC2626',
  mistake: '#B45309',
  checklist: '#059669',
  video: '#DB2777',
  atlas: '#65A30D',
  lactmed: '#0D9488',
  nurse: '#7C2D12',
};

interface GlobalSearchProps {
  drugs: Array<{ id: string; name_ru: string; name_en: string; indications?: string; fullText: string }>;
  guidelines: Array<{ id: string; title_ru: string; title_en: string; content: string }>;
  articles: Array<{ id: string; title_ru: string; title_en: string; summary: string; content: string }>;
  cases: Array<{ id: string; title_ru: string; title_en: string; vignette: string }>;
  mistakes: Array<{ id: string; title_ru: string; title_en: string; mistake: string }>;
  checklists: Array<{ id: string; title_ru: string; title_en: string; indications: string[] }>;
  videos: Array<{ id: string; title_ru: string; title_en: string; description: string }>;
  atlas: Array<{ id: string; title_ru: string; title_en: string; description: string }>;
  lactmed: Array<{ id: string; name_ru: string; name_en: string; summary: string }>;
  nurse: Array<{ id: string; title_ru: string; title_en: string; category: string }>;
  onJumpToTab: (t: Tab) => void;
}

function GlobalSearchView({
  drugs, guidelines, articles, cases, mistakes, checklists, videos, atlas, lactmed, nurse,
  onJumpToTab,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [enabledTypes, setEnabledTypes] = useState<Set<GlobalSearchHit['type']>>(
    new Set(['drug', 'guideline', 'article', 'case', 'mistake', 'checklist', 'video', 'atlas', 'lactmed', 'nurse']),
  );

  const hits: GlobalSearchHit[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: GlobalSearchHit[] = [];

    const trySnippet = (haystack: string, fallback: string): string => {
      const idx = haystack.toLowerCase().indexOf(q);
      if (idx === -1) return fallback.slice(0, 140);
      const start = Math.max(0, idx - 40);
      const end = Math.min(haystack.length, idx + q.length + 80);
      const snip = haystack.slice(start, end);
      return (start > 0 ? '…' : '') + snip + (end < haystack.length ? '…' : '');
    };

    if (enabledTypes.has('drug')) {
      for (const d of drugs) {
        const text = `${d.name_ru} ${d.name_en} ${d.indications ?? ''} ${d.fullText}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `drug-${d.id}`, title: d.name_ru, snippet: trySnippet(d.fullText || d.indications || '', d.indications ?? ''), type: 'drug', jumpTab: 'drugs' });
        }
      }
    }
    if (enabledTypes.has('guideline')) {
      for (const g of guidelines) {
        const text = `${g.title_ru} ${g.title_en} ${g.content}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `gd-${g.id}`, title: g.title_ru, snippet: trySnippet(g.content, g.content.slice(0, 140)), type: 'guideline', jumpTab: 'guidelines' });
        }
      }
    }
    if (enabledTypes.has('article')) {
      for (const a of articles) {
        const text = `${a.title_ru} ${a.title_en} ${a.summary} ${a.content}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `art-${a.id}`, title: a.title_ru, snippet: trySnippet(a.content, a.summary), type: 'article', jumpTab: 'articles' });
        }
      }
    }
    if (enabledTypes.has('case')) {
      for (const c of cases) {
        const text = `${c.title_ru} ${c.title_en} ${c.vignette}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `cs-${c.id}`, title: c.title_ru, snippet: trySnippet(c.vignette, c.vignette.slice(0, 140)), type: 'case', jumpTab: 'cases' });
        }
      }
    }
    if (enabledTypes.has('mistake')) {
      for (const m of mistakes) {
        const text = `${m.title_ru} ${m.title_en} ${m.mistake}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `mt-${m.id}`, title: m.title_ru, snippet: trySnippet(m.mistake, m.mistake.slice(0, 140)), type: 'mistake', jumpTab: 'mistakes' });
        }
      }
    }
    if (enabledTypes.has('checklist')) {
      for (const ch of checklists) {
        const text = `${ch.title_ru} ${ch.title_en} ${ch.indications.join(' ')}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `ck-${ch.id}`, title: ch.title_ru, snippet: ch.indications[0] ?? '', type: 'checklist', jumpTab: 'checklists' });
        }
      }
    }
    if (enabledTypes.has('video')) {
      for (const v of videos) {
        const text = `${v.title_ru} ${v.title_en} ${v.description}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `vd-${v.id}`, title: v.title_ru, snippet: trySnippet(v.description, v.description.slice(0, 140)), type: 'video', jumpTab: 'videos' });
        }
      }
    }
    if (enabledTypes.has('atlas')) {
      for (const a of atlas) {
        const text = `${a.title_ru} ${a.title_en} ${a.description}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `at-${a.id}`, title: a.title_ru, snippet: trySnippet(a.description, a.description.slice(0, 140)), type: 'atlas', jumpTab: 'atlas' });
        }
      }
    }
    if (enabledTypes.has('lactmed')) {
      for (const l of lactmed) {
        const text = `${l.name_ru} ${l.name_en} ${l.summary}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `lm-${l.id}`, title: l.name_ru, snippet: trySnippet(l.summary, l.summary.slice(0, 140)), type: 'lactmed', jumpTab: 'lactmed' });
        }
      }
    }
    if (enabledTypes.has('nurse')) {
      for (const n of nurse) {
        const text = `${n.title_ru} ${n.title_en} ${n.category}`.toLowerCase();
        if (text.includes(q)) {
          out.push({ id: `nu-${n.id}`, title: n.title_ru, snippet: n.category, type: 'nurse', jumpTab: 'nurse' });
        }
      }
    }

    return out.slice(0, 100);
  }, [query, enabledTypes, drugs, guidelines, articles, cases, mistakes, checklists, videos, atlas, lactmed, nurse]);

  const grouped = useMemo(() => {
    const map = new Map<GlobalSearchHit['type'], GlobalSearchHit[]>();
    for (const h of hits) {
      const arr = map.get(h.type) ?? [];
      arr.push(h);
      map.set(h.type, arr);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [hits]);

  const toggleType = (t: GlobalSearchHit['type']) => {
    setEnabledTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const totalCorpus = drugs.length + guidelines.length + articles.length + cases.length + mistakes.length + checklists.length + videos.length + atlas.length + lactmed.length + nurse.length;

  return (
    <div style={{ width: '100%' }}>
      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px',
        background: '#F5F6F8',
        borderRadius: 12,
        marginBottom: 12,
      }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
          stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder='Поиск по всем разделам: "сурфактант", "BPD", "гипогликемия"...'
          aria-label="Глобальный поиск по разделу неонатологии"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'inherit', fontSize: 15, color: '#1A1A1A',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Очистить поиск"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', fontSize: 18, padding: '4px 8px',
            }}
          >×</button>
        )}
      </div>

      {/* Type filter chips */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        marginBottom: 16,
      }}>
        {(['drug', 'guideline', 'article', 'case', 'mistake', 'checklist', 'video', 'atlas', 'lactmed', 'nurse'] as const).map((t) => {
          const enabled = enabledTypes.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              aria-pressed={enabled}
              style={{
                padding: '6px 12px',
                background: enabled ? HIT_TYPE_COLORS[t] : '#FFFFFF',
                color: enabled ? '#FFFFFF' : '#1A1A1A',
                border: 'none',
                borderRadius: 'var(--md-sys-shape-corner-full)',
                boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}
            >
              {HIT_TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {query.trim().length < 2 && (
        <div style={{
          padding: '32px 20px', background: '#F5F6F8', borderRadius: 14,
          textAlign: 'center', color: '#6B7280',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 6 }}>
            Глобальный поиск
          </div>
          <p style={{ margin: '0 auto', maxWidth: 460, fontSize: 13.5, lineHeight: 1.55 }}>
            Введите запрос (≥2 символов) для поиска в {totalCorpus} клинических и обучающих
            документах. Можно фильтровать по типу через chips сверху.
          </p>
        </div>
      )}

      {/* No results */}
      {query.trim().length >= 2 && hits.length === 0 && (
        <div style={{
          padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
          textAlign: 'center', color: '#6B7280', fontSize: 14,
        }}>
          Ничего не найдено по запросу «{query}».
        </div>
      )}

      {/* Results count + groups */}
      {hits.length > 0 && (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Найдено: <strong style={{ color: '#1A1A1A' }}>{hits.length}</strong> результатов
            {hits.length === 100 && ' (показаны первые 100)'}
            {' · '}
            <span style={{ color: '#9CA3AF' }}>
              из корпуса {totalCorpus} документов
            </span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {grouped.map(([type, items]) => (
              <div key={type}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17, fontWeight: 700,
                  color: '#1A1A1A',
                  margin: '0 0 12px',
                  letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'baseline', gap: 8,
                }}>
                  {HIT_TYPE_LABELS[type]}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>
                    {items.length}
                  </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => onJumpToTab(h.jumpTab)}
                      aria-label={`Перейти к разделу ${HIT_TYPE_LABELS[type]}: ${h.title}`}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                        padding: '12px 14px',
                        background: '#F5F6F8',
                        border: 'none',
                        borderRadius: 10,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{h.title}</span>
                      {h.snippet && (
                        <span style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{h.snippet}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// G2 — Personal Notes (markdown editor + localStorage)
// ============================================================================

interface PersonalNote {
  id: string;
  title: string;
  body: string;
  created: number;
  updated: number;
  tags: string[];
}

function loadNotes(): PersonalNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('bordik-neonatal-notes');
    if (!raw) return [];
    return JSON.parse(raw) as PersonalNote[];
  } catch { return []; }
}

function saveNotes(notes: PersonalNote[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('bordik-neonatal-notes', JSON.stringify(notes)); } catch { /* ignore */ }
}

function PersonalNotesView() {
  const [notes, setNotes] = useState<PersonalNote[]>(() => loadNotes());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingBody, setEditingBody] = useState('');

  const activeNote = notes.find((n) => n.id === activeId);

  useEffect(() => {
    if (activeNote) {
      setEditingTitle(activeNote.title);
      setEditingBody(activeNote.body);
    }
  }, [activeId, activeNote]);

  const createNew = () => {
    const id = `note-${Date.now()}`;
    const note: PersonalNote = {
      id,
      title: 'Новая заметка',
      body: '',
      created: Date.now(),
      updated: Date.now(),
      tags: [],
    };
    const next = [note, ...notes];
    setNotes(next);
    saveNotes(next);
    setActiveId(id);
    setEditingTitle(note.title);
    setEditingBody(note.body);
  };

  const saveCurrent = () => {
    if (!activeNote) return;
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? { ...n, title: editingTitle, body: editingBody, updated: Date.now() }
        : n,
    );
    setNotes(updated);
    saveNotes(updated);
  };

  const deleteCurrent = () => {
    if (!activeNote) return;
    const filtered = notes.filter((n) => n.id !== activeNote.id);
    setNotes(filtered);
    saveNotes(filtered);
    setActiveId(null);
  };

  // Auto-save on body/title change with debounce
  useEffect(() => {
    if (!activeNote) return;
    const t = setTimeout(() => saveCurrent(), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTitle, editingBody]);

  if (notes.length === 0 && !activeId) {
    return (
      <div style={{
        padding: '32px 20px',
        background: '#F5F6F8',
        borderRadius: 14,
        textAlign: 'center',
        color: '#6B7280',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17, fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: 8,
        }}>
          Пока нет заметок
        </div>
        <p style={{ margin: '0 auto 16px', maxWidth: 460, fontSize: 13.5, lineHeight: 1.55 }}>
          Создайте заметку для записи клинических наблюдений, ссылок,
          кастомных подсказок. Заметки хранятся локально в браузере.
        </p>
        <button
          type="button"
          onClick={createNew}
          style={{
            padding: '10px 20px',
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Создать первую заметку
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, marginBottom: 14,
      }}>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Всего заметок: <strong style={{ color: '#1A1A1A' }}>{notes.length}</strong>
          {' · '}
          <span style={{ color: '#9CA3AF' }}>
            хранятся локально в браузере, синхронизация скоро
          </span>
        </p>
        <button
          type="button"
          onClick={createNew}
          style={{
            padding: '8px 14px',
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--md-sys-shape-corner-full)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}
        >
          + Новая заметка
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 14,
        minHeight: 400,
      }}>
        {/* Notes list */}
        <div style={{
          background: '#F5F6F8',
          borderRadius: 12,
          padding: 8,
          maxHeight: 600,
          overflowY: 'auto',
        }}>
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setActiveId(n.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 12px',
                background: n.id === activeId ? '#FFFFFF' : 'transparent',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 2,
                fontFamily: 'inherit',
              }}
            >
              <div style={{
                fontSize: 13, fontWeight: 600, color: '#1A1A1A',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {n.title || '(без названия)'}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                {new Date(n.updated).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </div>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div style={{
          background: '#F5F6F8',
          borderRadius: 12,
          padding: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {activeNote ? (
            <>
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                aria-label="Заголовок заметки"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: 'var(--font-display)',
                  fontSize: 18, fontWeight: 700,
                  color: '#1A1A1A',
                  outline: 'none',
                }}
              />
              <textarea
                value={editingBody}
                onChange={(e) => setEditingBody(e.target.value)}
                aria-label="Содержимое заметки"
                placeholder="Введите содержимое заметки. Поддерживается plain text + Markdown..."
                style={{
                  width: '100%',
                  minHeight: 400,
                  padding: '12px 14px',
                  background: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: 'var(--font-body)',
                  fontSize: 14, lineHeight: 1.55,
                  color: '#1F2937',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                  {editingBody.length} символов · автосохранение
                </span>
                <button
                  type="button"
                  onClick={deleteCurrent}
                  aria-label="Удалить заметку"
                  style={{
                    padding: '6px 12px',
                    background: '#FEF2F2',
                    color: '#991B1B',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  Удалить
                </button>
              </div>
            </>
          ) : (
            <div style={{
              padding: '40px 20px', textAlign: 'center', color: '#9CA3AF',
              fontSize: 13.5,
            }}>
              Выберите заметку из списка или создайте новую.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
