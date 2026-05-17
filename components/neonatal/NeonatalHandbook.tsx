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
import PatientContextBar from '@/components/neonatal/PatientContextBar';
import { ArrowRight } from '@/components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { FilterDropdown } from '@/components/tools/page/FilterDropdown';
import EmojiOrFlag from '@/components/ui/EmojiOrFlag';
import { PrintCardButton } from '@/components/ui/PrintCardButton';
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
  /** Optional list of specific videos. If provided, card opens picker modal instead of going straight to url. */
  videos?: { title: string; url: string; duration_min?: number }[];
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

type Tab ='drugs' | 'guidelines' | 'calculators' | 'labs' | 'articles' | 'resuscitation' | 'lactmed' | 'quizzes' | 'nurse' | 'growth' | 'bilirubin' | 'cases' | 'mistakes' | 'checklists' | 'videos' | 'atlas' | 'drugcalc';

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

  // Per-section favorites filter — toggle chip in each view shows only
  // favorited items. Subscribes to bordik-favs-changed so star toggles
  // anywhere keep favsSet in sync. Replaces the centralized "Избранное"
  // tab — favorites now live within their own section.
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [favsSet, setFavsSet] = useState<Set<string>>(() =>
    typeof window === 'undefined' ? new Set() : new Set(loadFavorites().map((f) => f.id))
  );
  useEffect(() => {
    const handler = () => setFavsSet(new Set(loadFavorites().map((f) => f.id)));
    if (typeof window === 'undefined') return;
    window.addEventListener('bordik-favs-changed', handler);
    return () => window.removeEventListener('bordik-favs-changed', handler);
  }, []);
  // Reset filter when switching tabs so user always starts fresh.
  useEffect(() => { setShowFavOnly(false); }, [tab]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [drugsR, guidelinesR, calcR, labsR, articlesR, lactR, nurseR, casesR, mistakesR, checklistsR, videosR, atlasR] = await Promise.all([
          fetch('/neonatal-monographs.json?v=2.9.0', { cache: 'force-cache' }),
          fetch('/neonatal-guidelines.json?v=1.9.0', { cache: 'force-cache' }),
          fetch('/neonatal-calculators.json?v=1.1.0', { cache: 'force-cache' }),
          fetch('/neonatal-lab-norms.json?v=1.1.0', { cache: 'force-cache' }),
          fetch('/neonatal-articles.json?v=2.2.0', { cache: 'force-cache' }),
          fetch('/neonatal-lactmed.json?v=1.1.0', { cache: 'force-cache' }),
          fetch('/neonatal-nurse-procedures.json?v=1.3.0', { cache: 'force-cache' }),
          fetch('/neonatal-clinical-cases.json?v=1.5.0', { cache: 'force-cache' }),
          fetch('/neonatal-common-mistakes.json?v=1.4.0', { cache: 'force-cache' }),
          fetch('/neonatal-procedure-checklists.json?v=1.3.0', { cache: 'force-cache' }),
          fetch('/neonatal-procedure-videos.json?v=1.5.0', { cache: 'force-cache' }),
          fetch('/neonatal-atlas.json?v=1.4.0', { cache: 'force-cache' }),
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
    let result = bank.drugs;
    if (query) {
      result = result.filter((d) =>
        d.name_en.toLowerCase().includes(query)
        || d.name_ru.toLowerCase().includes(query)
        || d.brand.toLowerCase().includes(query)
        || d.fullText.toLowerCase().includes(query)
      );
    }
    if (showFavOnly) result = result.filter((d) => favsSet.has(`drug:${d.id}`));
    return result;
  }, [bank, q, showFavOnly, favsSet]);

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
      // Favorites filter
      if (showFavOnly && !favsSet.has(`guideline:${g.id}`)) return false;
      return true;
    });
  }, [guidelines, q, selectedRegions, showFavOnly, favsSet]);

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
          // Favorites filter
          if (showFavOnly && !favsSet.has(`calc:${c.id}`)) return false;
          return true;
        }),
      }))
      .filter((g) => g.calculators.length > 0);
  }, [calculators, q, selectedCountries, showFavOnly, favsSet]);

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
    let result = articles.articles;
    if (query) {
      result = result.filter((a) =>
        a.title_ru.toLowerCase().includes(query)
        || a.title_en.toLowerCase().includes(query)
        || a.summary.toLowerCase().includes(query)
        || a.content.toLowerCase().includes(query)
        || a.topic.toLowerCase().includes(query)
      );
    }
    if (showFavOnly) result = result.filter((a) => favsSet.has(`article:${a.id}`));
    return result;
  }, [articles, q, showFavOnly, favsSet]);

  const filteredLactmed = useMemo(() => {
    if (!lactmed) return [];
    const query = q.trim().toLowerCase();
    let result = lactmed.drugs;
    if (query) {
      result = result.filter((d) =>
        d.name_ru.toLowerCase().includes(query)
        || d.name_en.toLowerCase().includes(query)
        || d.summary.toLowerCase().includes(query)
        || d.details.toLowerCase().includes(query)
      );
    }
    if (showFavOnly) result = result.filter((d) => favsSet.has(`lactmed:${d.id}`));
    return result;
  }, [lactmed, q, showFavOnly, favsSet]);

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
      <main className="p-6 max-w-[980px] mx-auto">
        <div className="p-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
          Не удалось загрузить справочник: {error}.
        </div>
      </main>
    );
  }

  if (!bank) {
    return (
      <main className="p-6 max-w-[980px] mx-auto">
        <div className="py-2">
          <div className="lc-shimmer h-8 w-[280px] rounded-lg mb-4" />
          <div className="lc-shimmer h-4 w-[70%] rounded-md mb-6" />
          <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
          <div className="lc-shimmer h-16 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="p-0 font-[var(--font-body,system-ui)] text-[var(--md-sys-color-on-surface,#1A1A1A)]">
      {/* Patient context bar — sticky widget с базовыми параметрами
          ребёнка (weight/GA/postnatal day) которые auto-fill в калькуляторы.
          Скрыт во время exam-таба (quiz active) и на information-only вкладках
          (cases/mistakes/articles/atlas) где контекст не используется. */}
      {!(tab === 'quizzes' && quizActive) && !['articles', 'cases', 'mistakes', 'videos', 'atlas', 'lactmed'].includes(tab) && (
        <PatientContextBar />
      )}

      {/* Page header removed (PR #50, fix G3) — each tab has its own H1
          via SECTION_META and breadcrumb-style title. The repeated
          «Неонатология — справочник доз» banner was redundant and ate
          vertical space. Fired by user feedback. */}

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
        className="bordik-search flex items-center gap-2.5 px-4 py-2.5 bg-[#F5F6F8] rounded-xl max-w-[480px] mb-[18px]"
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
          className="flex-1 bg-transparent border-0 outline-none font-[inherit] text-sm text-[#1A1A1A]"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="Очистить поле поиска"
            className="bg-transparent border-0 cursor-pointer text-[#9CA3AF] text-base p-0"
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
          // Personal / progress tabs (PR #45 — F1, F2, F3 + PR #47 cleanup)
          drugcalc: { label: 'Дозы по весу', count: null },
        };
        const meta = SECTION_META[tab];
        return (
          <div
            role="navigation"
            aria-label="Текущий раздел"
            className="flex items-baseline gap-2 pb-3.5 mb-[18px] border-b border-[#E5E7EB]"
          >
            <h2
              aria-current="page"
              className="font-[var(--font-display)] text-[22px] font-bold tracking-[-0.02em] text-[#1A1A1A] m-0"
            >
              {meta.label}
            </h2>
            {meta.count !== null && (
              <span
                aria-label={`всего ${meta.count}`}
                className="font-[var(--font-mono)] text-sm font-bold text-[#9CA3AF]"
              >
                {meta.count}
              </span>
            )}
          </div>
        );
      })()}

      {tab === 'drugs' ? (
        <>
          <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
            Показано: <strong className="text-[#1A1A1A]">{filteredDrugs.length}</strong> из {bank.drugs.length}
          </p>
          <div className="flex items-center flex-wrap gap-2.5 mb-4">
            <FavoritesToggleChip
              active={showFavOnly}
              onToggle={() => setShowFavOnly(!showFavOnly)}
              count={bank.drugs.filter((d) => favsSet.has(`drug:${d.id}`)).length}
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-2"
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
              <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'guidelines' ? (
        <>
          <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
            Показано: <strong className="text-[#1A1A1A]">{filteredGuidelines.length}</strong> из {guidelines?.guidelines.length ?? 0}
            {' · '}
            <span className="text-[#9CA3AF]">
              сгруппированы по разделам
            </span>
          </p>

          {/* Region filter — позволяет показать только протоколы РФ /
              США / Европы / Узбекистана / Международные. Mirror UI
              калькуляторов; теги region берутся из guideline.regions[]
              auto-derived from references. */}
          <div className="flex items-center flex-wrap gap-2.5 mb-4">
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
            <FavoritesToggleChip
              active={showFavOnly}
              onToggle={() => setShowFavOnly(!showFavOnly)}
              count={(guidelines?.guidelines ?? []).filter((g) => favsSet.has(`guideline:${g.id}`)).length}
            />
            {selectedRegions.length > 0 && (
              <span className="text-xs text-[#9CA3AF]">
                фильтр: {selectedRegions.join(', ')}
              </span>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {groupedGuidelines.map((group) => (
              <div key={group.meta.id}>
                <h3 className="font-[var(--font-display)] text-base font-bold text-[#1F2937] mt-0 mb-3 tracking-[-0.01em] flex items-baseline gap-2">
                  <span>{group.meta.title_ru}</span>
                  <span className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] text-[#9CA3AF]">
                    {group.items.length}
                  </span>
                </h3>
                <div className="flex flex-col gap-2">
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
              <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'calculators' ? (
        <>
          <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
            Показано: <strong className="text-[#1A1A1A]">{filteredCalcCount}</strong> из {totalCalculators} калькуляторов
            {' · '}
            <span className="text-[#9CA3AF]">
              нажмите на карточку чтобы открыть калькулятор
            </span>
          </p>

          {/* Filter row: country dropdown (same pattern как у ToolsPage) +
              Apgar Timer launcher на одной строке. */}
          <div className="flex items-center flex-wrap gap-2.5 mb-4">
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
            <FavoritesToggleChip
              active={showFavOnly}
              onToggle={() => setShowFavOnly(!showFavOnly)}
              count={(calculators?.groups ?? []).reduce(
                (s, g) => s + g.calculators.filter((c) => favsSet.has(`calc:${c.id}`)).length,
                0
              )}
            />
            <button
              type="button"
              onClick={() => setApgarTimerOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#0F172A] text-white border-0 rounded-[10px] cursor-pointer text-[13px] font-semibold font-[inherit]"
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
            className="flex flex-col gap-6"
          >
            {filteredCalculators.map((group) => (
              <div key={group.id}>
                {/* Section header — visually 1:1 с RenderedRow.kind="category"
                    из ToolsPage: display-font 17/700, маленький mono count
                    справа цвета #9CA3AF. */}
                <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-[18px] tracking-[-0.01em] flex items-baseline gap-2">
                  {group.title_ru}
                  <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
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
              <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'labs' ? (
        <>
          <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
            Показано: <strong className="text-[#1A1A1A]">{filteredLabsCount}</strong> из {totalLabs} показателей
            {' · '}
            <span className="text-[#9CA3AF]">
              normal ranges: term + preterm columns
            </span>
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {filteredLabs.map((group) => (
              <div key={group.id}>
                <h3 className="font-[var(--font-display)] text-base font-bold text-[#1F2937] mt-0 mb-2.5 tracking-[-0.01em]">
                  {group.title_ru}
                </h3>
                <div className="bg-[#F5F6F8] rounded-[10px] overflow-hidden">
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
                  <table className="w-full border-collapse text-[13.5px] table-fixed">
                    <colgroup>
                      <col className="w-[35%]" />
                      <col className="w-[23%]" />
                      <col className="w-[27%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-[#E5E7EB]">
                        <th className="px-[18px] py-3 text-left font-semibold text-[#374151]">Показатель</th>
                        <th className="px-[18px] py-3 text-left font-semibold text-[#374151]">Term</th>
                        <th className="px-[18px] py-3 text-left font-semibold text-[#374151]">Preterm</th>
                        <th className="px-[18px] py-3 text-left font-semibold text-[#374151]">Ед.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.values.map((v, i) => (
                        <tr key={i} className="border-t border-[#E5E7EB]">
                          <td className="px-[18px] py-3.5 text-[#1A1A1A] font-medium break-words align-top">
                            {v.name_ru}
                            {v.notes && (
                              <div className="text-xs text-[#6B7280] mt-1 leading-[1.45]">
                                {v.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-[18px] py-3.5 text-[#1A1A1A] break-words align-top">{v.term}</td>
                          <td className="px-[18px] py-3.5 text-[#1A1A1A] break-words align-top">{v.preterm}</td>
                          <td className="px-[18px] py-3.5 text-[#6B7280] font-[var(--font-mono,monospace)] text-xs break-words align-top">{v.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {filteredLabsCount === 0 && (
              <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : tab === 'articles' ? (
        <>
          <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
            Показано: <strong className="text-[#1A1A1A]">{filteredArticles.length}</strong> из {articles?.articles.length ?? 0} статей
            {' · '}
            <span className="text-[#9CA3AF]">
              кликните чтобы открыть полный текст
            </span>
          </p>
          <div className="flex items-center flex-wrap gap-2.5 mb-4">
            <FavoritesToggleChip
              active={showFavOnly}
              onToggle={() => setShowFavOnly(!showFavOnly)}
              count={(articles?.articles ?? []).filter((a) => favsSet.has(`article:${a.id}`)).length}
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-2"
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
              <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
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
          <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
            Показано: <strong className="text-[#1A1A1A]">{filteredLactmed.length}</strong> из {lactmed?.drugs.length ?? 0} препаратов
            {' · '}
            <span className="text-[#9CA3AF]">
              совместимость с грудным вскармливанием (LactMed NCBI)
            </span>
          </p>
          <div className="flex items-center flex-wrap gap-2.5 mb-4">
            <FavoritesToggleChip
              active={showFavOnly}
              onToggle={() => setShowFavOnly(!showFavOnly)}
              count={(lactmed?.drugs ?? []).filter((d) => favsSet.has(`lactmed:${d.id}`)).length}
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {groupedLactmed.map((group) => (
              <div key={group.meta.id}>
                <h3 className="font-[var(--font-display)] text-base font-bold text-[#1F2937] mt-0 mb-3 tracking-[-0.01em] flex items-baseline gap-2">
                  <span>{group.meta.title_ru}</span>
                  <span className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] text-[#9CA3AF]">
                    {group.items.length}
                  </span>
                </h3>
                <div className="flex flex-col gap-2">
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
              <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
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
          <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
            Показано: <strong className="text-[#1A1A1A]">{filteredNurse.length}</strong> из {nurse?.procedures.length ?? 0} процедур
            {' · '}
            <span className="text-[#9CA3AF]">
              bedside reference для медсестёр и фельдшеров
            </span>
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-2"
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
              <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
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
      ) : tab === 'drugcalc' ? (
        <DrugDoseCalculator />
      ) : null}

      {/* Source / disclaimer panel — теперь tab-specific (G4 fix).
          На табах где нет одной канонической ссылки (calculators / guidelines /
          articles / lactmed и т.д.) панель скрыта; там ссылки находятся
          внутри каждой карточки. */}
      {(tab === 'drugs' || tab === 'growth' || tab === 'bilirubin') && (
      <section
        aria-labelledby="neonatal-provenance"
        className="mt-8 px-[22px] py-5 bg-[#F5F6F8] border-0 rounded-[14px] text-[13px] text-[#4B5563] leading-[1.55]"
      >
        <h3 id="neonatal-provenance" className="mt-0 mb-3.5 font-[var(--font-display)] text-[15px] font-bold text-[#1A1A1A] tracking-[-0.01em]">
          Источник и обновление
        </h3>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-[18px] gap-y-2.5">
          {tab === 'drugs' && (
            <>
              <dt className="text-[#9CA3AF] text-xs">Препараты + протоколы</dt>
              <dd className="m-0 text-[#1A1A1A]">
                {bank.source} — {bank.drugs.length} препаратов NICU + 13 практических протоколов.
                <span className="text-[#6B7280] block mt-0.5 text-xs">
                  Авторы: {bank.authors.join('; ')}
                </span>
              </dd>
            </>
          )}

          {tab === 'growth' && (
            <>
              <dt className="text-[#9CA3AF] text-xs">Графики роста</dt>
              <dd className="m-0 text-[#1A1A1A]">
                Fenton TR, Kim JH. BMC Pediatrics 2013;13:59 — кривые для недоношенных 22–50 нед PMA.
                <span className="text-[#6B7280] block mt-0.5 text-xs">
                  Лицензия: CC-BY 2.0 (open access)
                </span>
              </dd>
            </>
          )}

          {tab === 'bilirubin' && (
            <>
              <dt className="text-[#9CA3AF] text-xs">Билирубин</dt>
              <dd className="m-0 text-[#1A1A1A]">
                AAP 2022 — Kemper AR, Newman TB, Slaughter JL, et al. Pediatrics 2022;150(3):e2022058859. Пороги фототерапии и обменного переливания.
                <span className="text-[#6B7280] block mt-0.5 text-xs">
                  Лицензия: AAP Clinical Practice Guideline (открыт для клинического использования)
                </span>
              </dd>
            </>
          )}
        </dl>

        <p role="note" className="mt-[18px] mb-0 pt-4 border-t border-[#E5E7EB] text-xs text-[#6B7280] leading-[1.55]">
          <strong className="text-[#1A1A1A]">Не заменяет клиническое решение.</strong>{' '}
          {tab === 'drugs' && (
            <>Дозы у новорождённых критически зависят от гестационного возраста, дней жизни, веса,
            функции почек и печени. Решение по конкретному пациенту принимает
            врач/клин-фармаколог/неонатолог.</>
          )}
          {tab === 'growth' && (
            <>Графики роста — для пограничных случаев сверяйтесь с официальными
            LMS-таблицами производителя стандарта.</>
          )}
          {tab === 'bilirubin' && (
            <>Для GA &lt; 35 нед, при острой энцефалопатии или пограничных значениях TSB
            сверяйтесь с локальными протоколами и руководством AAP 2022 в полном виде.</>
          )}
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
  const cardId = `drug-card-${drug.id}`;
  const labelText = drug.name_en !== drug.name_ru
    ? `${drug.name_ru} (${drug.name_en})`
    : drug.name_ru;

  return (
    <div
      id={cardId}
      className={`bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out relative ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
        {isOpen && (
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`Препарат — ${drug.name_ru}`}
          />
        )}
        <FavoriteStarButton id={`drug:${drug.id}`} type="drug" title={drug.name_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть ${labelText}` : `Развернуть ${labelText}`}
        className="w-full flex items-center gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          <span className="block font-[var(--font-display)] text-[15px] font-semibold text-[#1A1A1A] leading-[1.35] tracking-[-0.01em]">
            <Highlight text={drug.name_ru} query={query} />
            {drug.name_en !== drug.name_ru && (
              <span className="font-normal text-[#6B7280] ml-1.5">
                (<Highlight text={drug.name_en} query={query} />)
              </span>
            )}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`text-[#6B7280] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="border-t border-[#E5E7EB] bg-white px-5 text-[13.5px] leading-[1.55] text-[#374151]">
              {/* Print-only title — appears at the top of the printed PDF
                  to provide context (the toggle button containing the drug
                  name is hidden in @media print). */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {drug.name_ru}
                {drug.name_en !== drug.name_ru && (
                  <span className="font-normal text-[#6B7280] ml-2 text-[15px]">
                    ({drug.name_en})
                  </span>
                )}
              </h2>
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
    <ul className="m-0 pl-[18px] list-disc flex flex-col gap-1.5">
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
    <div className={`neo-detail-row py-3.5 ${isLast ? '' : 'border-b border-[#F0F1F5]'}`}>
      <div
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase pt-px ${
          isWarning ? 'text-[#B45309]' : 'text-[#9CA3AF]'
        }`}
      >
        {isWarning && (
          <svg
            aria-hidden="true" focusable="false"
            width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4}
            strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}
        {label}
      </div>
      <div className="text-[#374151] text-[13.5px] leading-[1.55]">
        {children}
      </div>
    </div>
  );
}

type Block =
  | { kind: 'step'; text: string }
  | { kind: 'h1'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'formula'; text: string }
  | { kind: 'table'; headers: string[]; rows: string[][] }
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
  const rawLines = raw.split('\n');
  const lines = rawLines.map((l) => l.replace(/\u0000/g, '').replace(/[ \t]+$/g, ''));
  const blocks: Block[] = [];
  const bulletRe = /^\s*(?:[-•*·]|\d+[.)]|[a-z][.)])\s+/i;
  const stepRe = /^STEP\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|\d+)\b/i;
  const tableLineRe = /^\s*\|.*\|\s*$/;
  const tableSepRe = /^\s*\|[\s|:-]+\|\s*$/;
  const splitRow = (l: string): string[] =>
    l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (!line.trim()) { i++; continue; }

    // Markdown headings (#, ##, ###, ####+).
    const hMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (hMatch && hMatch[1] && hMatch[2]) {
      const level = hMatch[1].length;
      const text = hMatch[2].trim();
      if (level === 1) blocks.push({ kind: 'h1', text });
      else if (level === 2) blocks.push({ kind: 'h2', text });
      else blocks.push({ kind: 'h3', text });
      i++;
      continue;
    }

    // Markdown table — header row + separator + body rows.
    if (
      tableLineRe.test(line)
      && i + 1 < lines.length
      && tableSepRe.test(lines[i + 1] ?? '')
    ) {
      const headers = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (
        i < lines.length
        && tableLineRe.test(lines[i] ?? '')
        && !tableSepRe.test(lines[i] ?? '')
      ) {
        rows.push(splitRow(lines[i] ?? ''));
        i++;
      }
      blocks.push({ kind: 'table', headers, rows });
      continue;
    }

    if (stepRe.test(line)) {
      blocks.push({ kind: 'step', text: sanitizePdfText(line) });
      i++;
      continue;
    }

    // Collect paragraph chunk until blank/heading/table/step boundary.
    const chunk: string[] = [];
    while (i < lines.length) {
      const cur = lines[i] ?? '';
      if (!cur.trim()) break;
      if (/^#{1,6}\s+/.test(cur)) break;
      if (tableLineRe.test(cur)) break;
      if (stepRe.test(cur)) break;
      chunk.push(sanitizePdfText(cur));
      i++;
    }
    if (chunk.length === 0) { i++; continue; }

    const allBullet = chunk.every((l) => bulletRe.test(l));
    if (allBullet && chunk.length >= 1) {
      blocks.push({ kind: 'list', items: chunk.map((l) => l.replace(bulletRe, '').trim()) });
      continue;
    }

    if (chunk.every(isFormulaLine)) {
      blocks.push({ kind: 'formula', text: chunk.join('\n') });
      continue;
    }

    const joined = chunk.join(' ').replace(/\s+/g, ' ').trim();
    const isLegacyHeading =
      chunk.length === 1 &&
      joined.length <= 80 &&
      (joined === joined.toUpperCase() || /:$/.test(joined)) &&
      !isFormulaLine(joined);
    if (isLegacyHeading) {
      blocks.push({ kind: 'heading', text: joined.replace(/:$/, '') });
      continue;
    }

    blocks.push({ kind: 'para', text: joined });
  }
  return blocks;
}

/** Render inline markdown — currently just **bold**. */
function renderInlineMd(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, idx) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={idx} className="font-semibold text-[#111827]">{p.slice(2, -2)}</strong>;
    }
    return <span key={idx}>{p}</span>;
  });
}

function GuidelineContent({ content }: { content: string }) {
  const blocks = parseGuidelineContent(content);
  return (
    <div className="text-[13px] leading-[1.6] text-[#374151]">
      {blocks.map((b, i) => {
        const firstClass = i === 0 ? 'mt-0' : '';
        if (b.kind === 'step') {
          return (
            <div
              key={i}
              className={`${i === 0 ? 'mt-0' : 'mt-[18px]'} mb-2.5 px-2.5 py-1.5 bg-[#F3F4F6] border-l-[3px] border-l-[#6B7280] rounded font-[var(--font-mono,ui-monospace)] text-[11px] font-bold text-[#111827] tracking-[0.06em] uppercase`}
            >
              {b.text}
            </div>
          );
        }
        if (b.kind === 'h1') {
          return (
            <h2
              key={i}
              className={`${i === 0 ? 'mt-0' : 'mt-[22px]'} mb-2.5 font-[var(--font-display)] text-lg font-bold text-[#0F172A] tracking-[-0.015em] leading-[1.3]`}
            >
              {renderInlineMd(b.text)}
            </h2>
          );
        }
        if (b.kind === 'h2') {
          return (
            <h3
              key={i}
              className={`${i === 0 ? 'mt-0' : 'mt-[18px]'} mb-2 font-[var(--font-display)] text-[15px] font-bold text-[#111827] tracking-[-0.01em] leading-[1.35]`}
            >
              {renderInlineMd(b.text)}
            </h3>
          );
        }
        if (b.kind === 'h3') {
          return (
            <h4
              key={i}
              className={`${i === 0 ? 'mt-0' : 'mt-3.5'} mb-1.5 font-[var(--font-display)] text-[13.5px] font-bold text-[#1F2937] tracking-[-0.005em] leading-[1.4]`}
            >
              {renderInlineMd(b.text)}
            </h4>
          );
        }
        if (b.kind === 'heading') {
          return (
            <div
              key={i}
              className={`${i === 0 ? 'mt-0' : 'mt-3.5'} mb-1.5 font-[var(--font-display)] text-[13px] font-bold text-[#111827] tracking-[-0.005em]`}
            >
              {b.text}
            </div>
          );
        }
        if (b.kind === 'list') {
          return (
            <ul key={i} className="mt-0 mb-3 pl-5 text-[13px] leading-[1.6] text-[#374151] list-disc">
              {b.items.map((it, j) => (
                <li key={j} className="mb-1">{renderInlineMd(it)}</li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'table') {
          return (
            <div
              key={i}
              className="mt-0 mb-3.5 overflow-x-auto rounded-[10px] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)]"
            >
              <table className="w-full border-collapse text-[12.5px] leading-[1.5]">
                <thead>
                  <tr>
                    {b.headers.map((h, j) => (
                      <th
                        key={j}
                        className="px-3 py-2.5 text-left font-[var(--font-body)] font-bold text-[#111827] border-b border-[#E5E7EB] whitespace-nowrap"
                      >
                        {renderInlineMd(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? '' : 'border-t border-[#F0F1F5]'}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2.5 text-[#374151] align-top">
                          {renderInlineMd(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.kind === 'formula') {
          return (
            <pre
              key={i}
              className="mt-0 mb-3 px-3 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg font-[var(--font-mono,ui-monospace)] text-xs leading-[1.7] text-[#1F2937] whitespace-pre-wrap break-words"
            >
              {b.text}
            </pre>
          );
        }
        return (
          <p key={i} className={`${firstClass} mb-2.5 text-[13px] leading-[1.6] text-[#374151]`}>
            {renderInlineMd(b.text)}
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
  const cardId = `guideline-card-${guideline.id}`;
  return (
    <div
      id={cardId}
      className={`bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out relative ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
        {isOpen && (
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`Протокол — ${guideline.title_ru}`}
          />
        )}
        <FavoriteStarButton id={`guideline:${guideline.id}`} type="guideline" title={guideline.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть протокол: ${guideline.title_ru}` : `Развернуть протокол: ${guideline.title_ru}`}
        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.35]">
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
                      className="inline-flex items-center gap-1 px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap"
                    >
                      <EmojiOrFlag emoji={flagMap[r] ?? '🏳️'} size={12} />
                      {r}
                    </span>
                  ))}
                  {extra > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-semibold text-[#6B7280]">
                      +{extra}
                    </span>
                  )}
                </>
              );
            })()}
          </span>
          {guideline.title_en !== guideline.title_ru && (
            <span className="block mt-[3px] text-xs text-[#6B7280]">
              <Highlight text={guideline.title_en} query={query} />
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 mt-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="pt-[18px] px-5 pb-5 bg-white border-t border-[#E5E7EB]">
              {/* Print-only title — provides context in PDF since toggle button is hidden. */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {guideline.title_ru}
              </h2>
              <GuidelineContent content={guideline.content} />
              {guideline.references.length > 0 && (
                <div className="mt-[18px] pt-3.5 border-t border-[#E5E7EB]">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-2">
                    References
                  </div>
                  <ol className="m-0 pl-5 text-xs text-[#6B7280] leading-[1.55] list-decimal">
                    {guideline.references.map((ref, i) => (
                      <li key={i} className="mb-1">{ref}</li>
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
    <div className="relative">
      {/* Favorite star — absolute pos, sibling of button (avoids nested-button HTML invalid) */}
      <div className="absolute top-3 right-3 z-[2]">
        <FavoriteStarButton id={`calc:${calc.id}`} type="calc" title={calc.title_ru} />
      </div>
      <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      aria-label={`Открыть калькулятор: ${calc.title_ru}. Категория: ${subcategoryLabel}.${calc.audit_id ? ` Audit ID: ${calc.audit_id}.` : ''} Источник: ${calc.source}`}
      className="bg-[#F5F6F8] hover:bg-[#F0F2F5] rounded-[var(--md-sys-shape-corner-extra-large)] border-0 p-[var(--space-5)] text-left cursor-pointer relative overflow-hidden min-h-[160px] flex w-full flex-col justify-between transition-[background-color] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [content-visibility:auto] [contain-intrinsic-size:160px_220px]"
    >
      <div className="mb-[var(--space-3)] relative z-[1] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-1 min-w-0 flex-wrap">
          {/* Single short pill (mirrors ToolCard subcategory chip).
              audit_id (e.g. "A1", "A24/A25") is the natural short label;
              full group title is already shown in the section heading above. */}
          {calc.audit_id && (
            <span className="inline-flex items-center gap-[var(--space-1)] px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)]">
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
                    className="inline-flex items-center gap-1 px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap"
                  >
                    <EmojiOrFlag emoji={c.flag} size={12} />
                    {c.name}
                  </span>
                ))}
                {extra > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-semibold text-[#6B7280]">
                    +{extra}
                  </span>
                )}
              </>
            );
          })()}
        </div>
      </div>

      <div className="relative z-[1] flex-1">
        <h3 className="font-[var(--font-display)] text-[length:var(--text-base)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-1)] leading-[1.25]">
          {calc.title_ru}
        </h3>
        <p className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.4] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
          {calc.source}
        </p>
      </div>

      <div className="flex items-center gap-[var(--space-1)] mt-[var(--space-3)] relative z-[1]">
        <span className="font-[var(--font-body)] text-[length:var(--text-xs)] font-medium text-[color:var(--md-sys-color-on-surface)]">
          Открыть калькулятор
        </span>
        <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />
      </div>
    </button>
    </div>
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
  const cardId = `article-card-${article.id}`;
  return (
    <div
      id={cardId}
      className={`bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out relative ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      {/* Favorite star — absolutely positioned, sibling of toggle button (avoids nested-button HTML invalid).
          Top-right above chevron. Click stopPropagation в самом StarButton. */}
      <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
        {isOpen && (
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`Статья — ${article.title_ru}`}
          />
        )}
        <FavoriteStarButton id={`article:${article.id}`} type="article" title={article.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть статью: ${article.title_ru}` : `Развернуть статью: ${article.title_ru}. Тема: ${article.topic}`}
        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          {/* Collapsed header матчит GuidelineCard: только title + topic pill.
              Сводка (article.summary) перенесена внутрь раскрытой панели как
              лид-абзац — мирror «подробнее» pattern из протоколов. */}
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.35]">
              <Highlight text={article.title_ru} query={query} />
            </span>
            <span className="inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] uppercase tracking-[0.04em] whitespace-nowrap">
              {article.topic}
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 mt-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="pt-[18px] px-5 pb-5 bg-white border-t border-[#E5E7EB]">
              {/* Print-only title — provides context in PDF since toggle button is hidden. */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {article.title_ru}
              </h2>
              {/* Лид: краткая сводка статьи (бывший collapsed-summary).
                  Mirrors протокольный intro — visually distinct paragraph
                  выше основного содержимого. */}
              {article.summary && (
                <p className="mt-0 mb-4 pb-3.5 border-b border-[#F0F1F5] text-sm leading-[1.55] text-[#4B5563] font-normal">
                  <Highlight text={article.summary} query={query} />
                </p>
              )}
              <ArticleContent content={article.content} />
              {article.related_calculators.length > 0 && (
                <div className="mt-[18px] pt-3.5 border-t border-[#E5E7EB]">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-2">
                    Связанные калькуляторы
                  </div>
                  <ul className="m-0 p-0 list-none flex flex-wrap gap-1.5">
                    {article.related_calculators.map((calcId) => (
                      <li key={calcId}>
                        <a
                          href={`/tools/${calcId}`}
                          className="inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[#4338CA] uppercase tracking-[0.04em] whitespace-nowrap no-underline"
                        >
                          {calcId}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {article.references.length > 0 && (
                <div className="mt-[18px] pt-3.5 border-t border-[#E5E7EB]">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-2">
                    References
                  </div>
                  <ol className="m-0 pl-5 text-xs text-[#6B7280] leading-[1.55] list-decimal">
                    {article.references.map((ref, i) => (
                      <li key={i} className="mb-1">{ref}</li>
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
    <div className="text-[13.5px] leading-[1.65] text-[#1F2937]">
      {blocks.map((block, idx) => {
        if (block.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-[var(--font-display)] text-base font-bold text-[#111827] mt-5 mb-2 tracking-[-0.01em]">
              {block.slice(3)}
            </h3>
          );
        }
        if (block.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-[var(--font-display)] text-sm font-bold text-[#1F2937] mt-4 mb-1.5 tracking-[-0.005em]">
              {block.slice(4)}
            </h4>
          );
        }
        if (block.startsWith('- ') || block.startsWith('* ')) {
          const items = block.split('\n').map((l) => l.replace(/^[-*]\s+/, ''));
          return (
            <ul key={idx} className="my-1.5 pl-[22px]">
              {items.map((it, i) => (
                <li key={i} className="mb-[3px]">
                  <FormattedText text={it} />
                </li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(block)) {
          const items = block.split('\n').map((l) => l.replace(/^\d+\.\s+/, ''));
          return (
            <ol key={idx} className="my-1.5 pl-[22px]">
              {items.map((it, i) => (
                <li key={i} className="mb-[3px]">
                  <FormattedText text={it} />
                </li>
              ))}
            </ol>
          );
        }
        if (block.startsWith('| ')) {
          const rows = block.split('\n').filter((l) => l.startsWith('|'));
          if (rows.length < 2) {
            return <p key={idx} className="my-2"><FormattedText text={block} /></p>;
          }
          const headerCells = rows[0]?.split('|').map((c) => c.trim()).filter(Boolean) ?? [];
          const bodyRows = rows.slice(2).map((r) => r.split('|').map((c) => c.trim()).filter(Boolean));
          return (
            <div key={idx} className="overflow-x-auto my-3 rounded-lg border border-[#E5E7EB]">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="bg-[#F3F4F6]">
                    {headerCells.map((h, i) => (
                      <th key={i} className="px-2.5 py-2 text-left font-semibold text-[#374151] border-b border-[#E5E7EB]">
                        <FormattedText text={h} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr key={ri} className={ri > 0 ? 'border-t border-[#F3F4F6]' : ''}>
                      {row.map((c, ci) => (
                        <td key={ci} className="px-2.5 py-1.5 text-[#1F2937]">
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
          <p key={idx} className="my-2">
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
        if (p.type === 'bold') return <strong key={i} className="font-semibold text-[#111827]">{p.value}</strong>;
        if (p.type === 'code') return (
          <code key={i} className="font-[var(--font-mono)] text-[0.9em] bg-[#F3F4F6] px-1 py-[1px] rounded-[3px] text-[#7C2D12]">{p.value}</code>
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
  const cardId = `lact-card-${drug.id}`;

  return (
    <div
      id={cardId}
      className={`bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out relative ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
        {isOpen && (
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`LactMed — ${drug.name_ru}`}
          />
        )}
        <FavoriteStarButton id={`lactmed:${drug.id}`} type="lactmed" title={drug.name_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть LactMed: ${drug.name_ru}` : `Развернуть LactMed: ${drug.name_ru}. Совместимость с грудным вскармливанием: ${colors.label}.`}
        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.35]">
              <Highlight text={drug.name_ru} query={query} />
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-body)] text-[11px] font-semibold text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
              {colors.label}
            </span>
          </span>
          <span className="block text-xs text-[#6B7280] leading-[1.5]">
            <Highlight text={drug.summary} query={query} />
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 mt-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="pt-[18px] px-5 pb-5 bg-white border-t border-[#E5E7EB] text-[13.5px] leading-[1.6] text-[#1F2937]">
              {/* Print-only title — provides context in PDF since toggle button is hidden. */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {drug.name_ru} <span className="font-normal text-[#6B7280] ml-2 text-[15px]">— LactMed ({colors.label})</span>
              </h2>
              {/* Лид-абзац (summary) — то же что было в свернутой карточке. */}
              {drug.summary && (
                <p className="mt-0 mb-4 pb-3.5 border-b border-[#F0F1F5] text-sm leading-[1.55] text-[#4B5563]">
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

              {/* Footer: link button — design-system pill (white BG + soft
                  shadow + mono uppercase, matching all other pills). */}
              <div className="mt-4 flex items-center flex-wrap gap-3">
                <DesignSystemLinkButton
                  href={drug.lactmed_url}
                  ariaLabel={`Открыть статью LactMed (NCBI) по препарату ${drug.name_ru}`}
                  label="Открыть на LactMed"
                />
                <span className="text-[11px] text-[#9CA3AF] leading-[1.4] flex-1 min-w-[200px]">
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
  const cardId = `nurse-card-${procedure.id}`;
  return (
    <div
      id={cardId}
      className={`relative bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      {isOpen && (
        <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`Процедура — ${procedure.title_ru}`}
          />
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen
          ? `Свернуть процедуру: ${procedure.title_ru}`
          : `Развернуть процедуру: ${procedure.title_ru}. Категория: ${procedure.category}. Длительность около ${procedure.duration_min} минут.`
        }
        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent border-0 cursor-pointer text-left font-[inherit]"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.35]">
              {procedure.title_ru}
            </span>
            <span className="inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] uppercase tracking-[0.04em] whitespace-nowrap">
              {procedure.category}
            </span>
            <span className="text-[11px] font-medium text-[#6B7280] font-[var(--font-mono)]">
              ~{procedure.duration_min} мин
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 mt-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="pt-3.5 px-5 pb-[18px] bg-white border-t border-[#E5E7EB] text-[13.5px] leading-[1.55] text-[#1F2937]">
              {/* Print-only title — provides context in PDF since toggle button is hidden. */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {procedure.title_ru} <span className="font-normal text-[#6B7280] ml-2 text-[15px]">— Процедура ({procedure.category}, ~{procedure.duration_min} мин)</span>
              </h2>
              {procedure.steps.map((step, idx) => (
                <div key={idx} className="mb-3.5">
                  <div className="text-[13px] font-bold text-[#1F2937] mb-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-[22px] h-[22px] bg-[#2563EB] text-white rounded-full text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    {step.title}
                  </div>
                  <ul className="m-0 pl-8 text-[12.5px] leading-[1.55] text-[#374151]">
                    {step.items.map((it, i) => (
                      <li key={i} className="mb-[3px]">{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {procedure.warnings.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-[#F0F1F5]">
                  <div className="inline-flex items-center gap-1.5 font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#B45309] mb-1.5">
                    <svg
                      aria-hidden="true" focusable="false"
                      width={11} height={11} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2.4}
                      strokeLinecap="round" strokeLinejoin="round"
                      className="shrink-0"
                    >
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Предупреждения
                  </div>
                  <ul className="m-0 pl-[18px] text-[12.5px] text-[#374151] leading-[1.55]">
                    {procedure.warnings.map((w, i) => (
                      <li key={i} className="mb-[3px]">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {procedure.references.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-[#E5E7EB]">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-1.5">
                    References
                  </div>
                  <ol className="m-0 pl-[18px] text-xs text-[#6B7280] leading-[1.55]">
                    {procedure.references.map((r, i) => (
                      <li key={i} className="mb-[3px]">{r}</li>
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
      className="px-5 py-6 bg-[#F5F6F8] rounded-[14px] border border-dashed border-[#D1D5DB] text-center"
    >
      <div className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mb-1.5 tracking-[-0.01em]">
        {m.title}
      </div>
      <p className="mx-auto mt-0 mb-3 max-w-[520px] text-[13.5px] leading-[1.55] text-[#6B7280]">
        {m.subtitle}
      </p>
      <span className="inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-semibold text-[#9CA3AF] uppercase tracking-[0.06em]">
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
  const { showFavOnly, setShowFavOnly, favsSet } = useFavoritesFilter();
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    let result = bank.cases;
    if (q) {
      result = result.filter((c) =>
        c.title_ru.toLowerCase().includes(q)
        || c.title_en.toLowerCase().includes(q)
        || c.vignette.toLowerCase().includes(q)
        || c.topic.toLowerCase().includes(q)
      );
    }
    if (showFavOnly) result = result.filter((c) => favsSet.has(`case:${c.id}`));
    return result;
  }, [bank, query, showFavOnly, favsSet]);
  const favCount = useMemo(
    () => bank ? bank.cases.filter((c) => favsSet.has(`case:${c.id}`)).length : 0,
    [bank, favsSet]
  );

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
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-40 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
        Показано: <strong className="text-[#1A1A1A]">{filtered.length}</strong> из {bank.cases.length} кейсов
        {' · '}
        <span className="text-[#9CA3AF]">сгруппированы по системе</span>
      </p>

      <div className="flex items-center flex-wrap gap-2.5 mb-4">
        <FavoritesToggleChip
          active={showFavOnly}
          onToggle={() => setShowFavOnly(!showFavOnly)}
          count={favCount}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-[18px] tracking-[-0.01em] flex items-baseline gap-2">
              {label}
              <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
                {items.length}
              </span>
            </h3>
            <div className="flex flex-col gap-2">
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
          <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
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
  const cardId = `case-card-${c.id}`;
  const levelLabel = c.level === 'basic' ? 'Базовый' : c.level === 'advanced' ? 'Продвинутый' : 'Средний';
  return (
    <div
      id={cardId}
      className={`bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out relative ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
        {isOpen && (
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`Кейс — ${c.title_ru}`}
          />
        )}
        <FavoriteStarButton id={`case:${c.id}`} type="case" title={c.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть кейс: ${c.title_ru}` : `Развернуть кейс: ${c.title_ru}. Уровень: ${levelLabel}.`}
        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.35]">
              <Highlight text={c.title_ru} query={query} />
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-body)] text-[11px] font-semibold text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
              {levelLabel}
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 mt-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="pt-[18px] px-5 pb-5 bg-white border-t border-[#E5E7EB] text-[13.5px] leading-[1.6] text-[#1F2937]">
              {/* Print-only title — provides context in PDF since toggle button is hidden. */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {c.title_ru} <span className="font-normal text-[#6B7280] ml-2 text-[15px]">— Кейс ({levelLabel})</span>
              </h2>
              {/* Виньетка — первый блок (контекст случая) */}
              <p className="mt-0 mb-4 pb-3.5 border-b border-[#F0F1F5] text-sm leading-[1.6] text-[#374151] italic">
                <Highlight text={c.vignette} query={query} />
              </p>

              <CaseSection label="Ключевые находки" items={c.presenting_features} />
              <CaseSection label="Дифференциальный диагноз" items={c.differential} />
              <CaseSection label="Тактика" items={c.management} ordered />
              <CaseSection label="Pearls (запомнить)" items={c.pearls} tone="pearl" />

              {c.references.length > 0 && (
                <div className="mt-[18px] pt-3.5 border-t border-[#E5E7EB]">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-2">
                    References
                  </div>
                  <ol className="m-0 pl-5 text-xs text-[#6B7280] leading-[1.55] list-decimal">
                    {c.references.map((ref, i) => (
                      <li key={i} className="mb-1">{ref}</li>
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
    <div className="mb-3.5">
      <div
        className={`inline-flex items-center gap-1.5 font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase mb-1.5 ${
          tone === 'pearl' ? 'text-[#B45309]' : 'text-[#9CA3AF]'
        }`}
      >
        {tone === 'pearl' && (
          <svg
            aria-hidden="true" focusable="false"
            width={11} height={11} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4}
            strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        {label}
      </div>
      <ListTag className="m-0 pl-[22px] flex flex-col gap-1 text-[13px] leading-[1.55] text-[#374151]">
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
  const { showFavOnly, setShowFavOnly, favsSet } = useFavoritesFilter();
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    let result = bank.mistakes;
    if (q) {
      result = result.filter((m) =>
        m.title_ru.toLowerCase().includes(q)
        || m.title_en.toLowerCase().includes(q)
        || m.mistake.toLowerCase().includes(q)
        || m.correct_approach.toLowerCase().includes(q)
        || m.category.toLowerCase().includes(q)
      );
    }
    if (showFavOnly) result = result.filter((m) => favsSet.has(`mistake:${m.id}`));
    return result;
  }, [bank, query, showFavOnly, favsSet]);
  const favCount = useMemo(
    () => bank ? bank.mistakes.filter((m) => favsSet.has(`mistake:${m.id}`)).length : 0,
    [bank, favsSet]
  );

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
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-40 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
        Показано: <strong className="text-[#1A1A1A]">{filtered.length}</strong> из {bank.mistakes.length} ошибок
        {' · '}
        <span className="text-[#9CA3AF]">сгруппированы по системе</span>
      </p>

      <div className="flex items-center flex-wrap gap-2.5 mb-4">
        <FavoritesToggleChip
          active={showFavOnly}
          onToggle={() => setShowFavOnly(!showFavOnly)}
          count={favCount}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-[18px] tracking-[-0.01em] flex items-baseline gap-2">
              {label}
              <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
                {items.length}
              </span>
            </h3>
            <div className="flex flex-col gap-2">
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
          <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
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
  const cardId = `mistake-card-${m.id}`;
  const sevLabel = m.severity === 'high' ? 'Высокая'
    : m.severity === 'medium' ? 'Средняя'
    : 'Низкая';
  return (
    <div
      id={cardId}
      className={`bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out relative ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
        {isOpen && (
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`Ошибка — ${m.title_ru}`}
          />
        )}
        <FavoriteStarButton id={`mistake:${m.id}`} type="mistake" title={m.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть: ${m.title_ru}` : `Развернуть: ${m.title_ru}. Тяжесть последствий: ${sevLabel}.`}
        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.35]">
              <Highlight text={m.title_ru} query={query} />
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-body)] text-[11px] font-semibold text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
              {sevLabel}
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 mt-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="pt-[18px] px-5 pb-5 bg-white border-t border-[#E5E7EB] text-[13.5px] leading-[1.6] text-[#1F2937]">
              {/* Print-only title — provides context in PDF since toggle button is hidden. */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {m.title_ru} <span className="font-normal text-[#6B7280] ml-2 text-[15px]">— Типичная ошибка (тяжесть: {sevLabel})</span>
              </h2>
              <MistakeBlock label="Что часто делают неправильно" text={m.mistake} />
              <MistakeBlock label="Почему ошибка типична" text={m.why_it_happens} />
              <MistakeBlock label="Как должно быть" text={m.correct_approach} tone="ok" />
              <MistakeBlock label="Последствия ошибки" text={m.consequence} tone="warning" />

              {m.references.length > 0 && (
                <div className="mt-[18px] pt-3.5 border-t border-[#E5E7EB]">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-2">
                    References
                  </div>
                  <ol className="m-0 pl-5 text-xs text-[#6B7280] leading-[1.55] list-decimal">
                    {m.references.map((ref, i) => (
                      <li key={i} className="mb-1">{ref}</li>
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
 *   tone parameter retained for backwards compatibility but no longer
 *   produces colored accents — per user feedback the block matches the
 *   neutral design system used elsewhere (no green/amber tints).
 */
function MistakeBlock({
  label, text,
}: {
  label: string;
  text: string;
  /** tone is kept in props for back-compat at call sites but visually unused. */
  tone?: 'ok' | 'warning';
}) {
  return (
    <div className="mb-3.5">
      <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-1.5">
        {label}
      </div>
      <p className="m-0 text-[13.5px] leading-[1.55] text-[#374151]">
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
  feeding: 'Питание / лактация',
  monitoring: 'Осмотр и мониторинг',
};

function ChecklistsView({
  bank, query, openId, setOpenId,
}: {
  bank: ProcedureChecklistsBank | null;
  query: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const { showFavOnly, setShowFavOnly, favsSet } = useFavoritesFilter();
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    let result = bank.checklists;
    if (q) {
      result = result.filter((c) =>
        c.title_ru.toLowerCase().includes(q)
        || c.title_en.toLowerCase().includes(q)
        || c.indications.some((i) => i.toLowerCase().includes(q))
        || c.category.toLowerCase().includes(q)
      );
    }
    if (showFavOnly) result = result.filter((c) => favsSet.has(`checklist:${c.id}`));
    return result;
  }, [bank, query, showFavOnly, favsSet]);
  const favCount = useMemo(
    () => bank ? bank.checklists.filter((c) => favsSet.has(`checklist:${c.id}`)).length : 0,
    [bank, favsSet]
  );

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
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-40 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
        Показано: <strong className="text-[#1A1A1A]">{filtered.length}</strong> из {bank.checklists.length} чек-листов
        {' · '}
        <span className="text-[#9CA3AF]">прогресс сохраняется на устройстве</span>
      </p>
      <div className="flex items-center flex-wrap gap-2.5 mb-4">
        <FavoritesToggleChip
          active={showFavOnly}
          onToggle={() => setShowFavOnly(!showFavOnly)}
          count={favCount}
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-[18px] tracking-[-0.01em] flex items-baseline gap-2">
              {label}
              <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
                {items.length}
              </span>
            </h3>
            <div className="flex flex-col gap-2">
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
          <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
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
  const cardId = `checklist-card-${c.id}`;
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
    <div
      id={cardId}
      className={`bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out relative ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
        {isOpen && (
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`Чек-лист — ${c.title_ru}`}
          />
        )}
        <FavoriteStarButton id={`checklist:${c.id}`} type="checklist" title={c.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть чек-лист: ${c.title_ru}` : `Развернуть чек-лист: ${c.title_ru}. Длительность ~${c.estimated_minutes} минут.`}
        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.35]">
              <Highlight text={c.title_ru} query={query} />
            </span>
            <span className="inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
              ~{c.estimated_minutes} мин
            </span>
            {percent > 0 && (
              <span className={`inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-semibold whitespace-nowrap ${
                percent === 100 ? 'text-[#059669]' : 'text-[#2563EB]'
              }`}>
                {doneItems}/{totalItems} · {percent}%
              </span>
            )}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 mt-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="pt-[18px] px-5 pb-5 bg-white border-t border-[#E5E7EB] text-[13.5px] leading-[1.55] text-[#1F2937]">
              {/* Print-only title — provides context in PDF since toggle button is hidden. */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {c.title_ru} <span className="font-normal text-[#6B7280] ml-2 text-[15px]">— Чек-лист (~{c.estimated_minutes} мин)</span>
              </h2>
              {/* Audience + indications */}
              <div className="mb-4 pb-3.5 border-b border-[#F0F1F5]">
                <div className="text-xs text-[#6B7280] mb-1.5">
                  <strong className="text-[#1A1A1A]">Аудитория:</strong> {c.audience}
                </div>
                {c.indications.length > 0 && (
                  <div className="text-xs text-[#6B7280]">
                    <strong className="text-[#1A1A1A]">Показания:</strong>
                    <ul className="mt-1 mb-0 ml-[18px] p-0">
                      {c.indications.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sections с интерактивными checkbox */}
              {c.sections.map((sec, si) => (
                <div key={si} className="mb-[18px]">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-2">
                    {sec.title}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {sec.items.map((it, ii) => {
                      const key = `${si}:${ii}`;
                      const checked = !!progress[key];
                      return (
                        <label
                          key={ii}
                          className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-[background-color] duration-150 text-[13.5px] ${
                            checked
                              ? 'bg-[#ECFDF5] text-[#065F46] line-through opacity-75'
                              : 'bg-[#F9FAFB] text-[#1F2937] opacity-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleItem(key)}
                            className="shrink-0 mt-[3px] w-4 h-4 cursor-pointer [accent-color:#059669]"
                          />
                          <span className="leading-[1.5]">{it}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Reset button + references */}
              <div className="mt-3.5 pt-3.5 border-t border-[#E5E7EB] flex items-center flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetAll}
                  aria-label="Сбросить прогресс чек-листа"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] border-0 font-[var(--font-body)] text-[12.5px] font-semibold text-[#1A1A1A] cursor-pointer whitespace-nowrap"
                >
                  Сбросить прогресс
                </button>
                <span className="text-[11px] text-[#9CA3AF] flex-1">
                  Прогресс сохраняется локально в браузере. Не заменяет
                  институциональный чек-лист.
                </span>
              </div>

              {c.references.length > 0 && (
                <div className="mt-[18px] pt-3.5 border-t border-[#E5E7EB]">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-2">
                    References
                  </div>
                  <ol className="m-0 pl-5 text-xs text-[#6B7280] leading-[1.55] list-decimal">
                    {c.references.map((ref, i) => (
                      <li key={i} className="mb-1">{ref}</li>
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
  aap: 'AAP',
  aha: 'AHA',
  cdc: 'CDC',
  aao: 'AAO',
  stanford: 'Stanford',
  efcni: 'EFCNI',
  chop: 'CHOP',
  audiology: 'AAA · Audiology',
  nidcap: 'NIDCAP',
};

function VideosView({
  bank, query,
}: {
  bank: ProcedureVideosBank | null;
  query: string;
}) {
  const { showFavOnly, setShowFavOnly, favsSet } = useFavoritesFilter();
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    let result = bank.videos;
    if (q) {
      result = result.filter((v) =>
        v.title_ru.toLowerCase().includes(q)
        || v.title_en.toLowerCase().includes(q)
        || v.description.toLowerCase().includes(q)
        || v.tags.some((t) => t.toLowerCase().includes(q))
        || v.source.toLowerCase().includes(q)
      );
    }
    if (showFavOnly) result = result.filter((v) => favsSet.has(`video:${v.id}`));
    return result;
  }, [bank, query, showFavOnly, favsSet]);
  const favCount = useMemo(
    () => bank ? bank.videos.filter((v) => favsSet.has(`video:${v.id}`)).length : 0,
    [bank, favsSet]
  );

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
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-40 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
        Показано: <strong className="text-[#1A1A1A]">{filtered.length}</strong> из {bank.videos.length} видео
        {' · '}
        <span className="text-[#9CA3AF]">линки на authoritative источники (AAP, WHO, NEJM, EFCNI и др.)</span>
      </p>
      <div className="flex items-center flex-wrap gap-2.5 mb-4">
        <FavoritesToggleChip
          active={showFavOnly}
          onToggle={() => setShowFavOnly(!showFavOnly)}
          count={favCount}
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-[18px] tracking-[-0.01em] flex items-baseline gap-2">
              {label}
              <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
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
          <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
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
  // Multi-video: if videos[] array provided, prefer it; fall back to single url.
  const videoList: { title: string; url: string; duration_min?: number }[] | null =
    Array.isArray(v.videos) && v.videos.length > 0 ? v.videos : null;
  const [pickerOpen, setPickerOpen] = useState(false);
  const handleClick = (e: React.MouseEvent) => {
    if (videoList) {
      e.preventDefault();
      setPickerOpen(true);
    }
    // single-url: native link behavior
  };
  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-[2]">
        <FavoriteStarButton id={`video:${v.id}`} type="video" title={v.title_ru} />
      </div>
    <a
      href={videoList ? '#' : v.url}
      target={videoList ? undefined : '_blank'}
      rel={videoList ? undefined : 'noopener noreferrer'}
      onClick={handleClick}
      aria-label={videoList
        ? `Открыть список видео: ${v.title_ru} (${videoList.length} ${videoList.length === 1 ? 'видео' : 'видео'})`
        : `Открыть видео: ${v.title_ru}. Источник: ${v.source}. Длительность ~${v.duration_min} минут.`}
      className="flex flex-col bg-[#F5F6F8] hover:bg-[#F0F2F5] rounded-[var(--md-sys-shape-corner-extra-large)] p-[var(--space-5)] no-underline text-[color:inherit] min-h-[180px] transition-[background-color] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] [content-visibility:auto] [contain-intrinsic-size:180px_240px]"
    >
      <div className="flex flex-wrap gap-1 mb-[var(--space-3)]">
        <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-body)] text-[11px] font-medium text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
          ~{v.duration_min} мин
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-body)] text-[11px] font-medium text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
          {sourceLabel}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="font-[var(--font-display)] text-[length:var(--text-base)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-1)] leading-[1.25]">
          {v.title_ru}
        </h3>
        <p className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.4] [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden m-0">
          {v.description}
        </p>
      </div>
      <div className="mt-[var(--space-3)] flex items-center justify-between gap-2">
        <span className="font-[var(--font-body)] text-[length:var(--text-xs)] font-medium text-[color:var(--md-sys-color-on-surface)] overflow-hidden text-ellipsis whitespace-nowrap">
          {v.source}
        </span>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" focusable="false"
          className="shrink-0 text-[color:var(--md-sys-color-on-surface)]">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
    </a>
    {videoList && pickerOpen && (
      <VideoPickerModal
        title={v.title_ru}
        videos={videoList}
        onClose={() => setPickerOpen(false)}
      />
    )}
    </div>
  );
}

function VideoPickerModal({
  title, videos, onClose,
}: {
  title: string;
  videos: { title: string; url: string; duration_min?: number }[];
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Выбор видео: ${title}`}
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-[480px] w-full max-h-[80vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="m-0 font-[var(--font-display)] text-lg font-bold text-[#111827] leading-[1.3]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="shrink-0 bg-transparent border-0 cursor-pointer p-1 text-[#6B7280]"
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true" focusable="false">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {videos.map((video, idx) => (
            <a
              key={idx}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-3.5 py-3 bg-[#F5F6F8] hover:bg-[#EFF1F4] rounded-xl no-underline text-[color:inherit] transition-[background-color] duration-150"
            >
              <span className="flex-1 font-[var(--font-body)] text-sm font-medium text-[#111827] leading-[1.4]">
                {video.title}
              </span>
              {video.duration_min && (
                <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
                  ~{video.duration_min} мин
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
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
  const { showFavOnly, setShowFavOnly, favsSet } = useFavoritesFilter();
  const filtered = useMemo(() => {
    if (!bank) return [];
    const q = query.trim().toLowerCase();
    let result = bank.atlas;
    if (q) {
      result = result.filter((a) =>
        a.title_ru.toLowerCase().includes(q)
        || a.title_en.toLowerCase().includes(q)
        || a.description.toLowerCase().includes(q)
        || a.key_findings.some((k) => k.toLowerCase().includes(q))
        || a.source.toLowerCase().includes(q)
      );
    }
    if (showFavOnly) result = result.filter((a) => favsSet.has(`atlas:${a.id}`));
    return result;
  }, [bank, query, showFavOnly, favsSet]);
  const favCount = useMemo(
    () => bank ? bank.atlas.filter((a) => favsSet.has(`atlas:${a.id}`)).length : 0,
    [bank, favsSet]
  );

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
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-40 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-[13px] text-[#6B7280] mt-0 mb-3.5">
        Показано: <strong className="text-[#1A1A1A]">{filtered.length}</strong> из {bank.atlas.length} атласов
        {' · '}
        <span className="text-[#9CA3AF]">линки на authoritative источники (Radiopaedia, NEJM, AAP)</span>
      </p>
      <div className="flex items-center flex-wrap gap-2.5 mb-4">
        <FavoritesToggleChip
          active={showFavOnly}
          onToggle={() => setShowFavOnly(!showFavOnly)}
          count={favCount}
        />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-6"
      >
        {grouped.map(([label, items]) => (
          <div key={label}>
            <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-[18px] tracking-[-0.01em] flex items-baseline gap-2">
              {label}
              <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
                {items.length}
              </span>
            </h3>
            <div className="flex flex-col gap-2">
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
          <div className="px-4 py-8 bg-[#F5F6F8] rounded-xl text-center text-[#6B7280] text-sm">
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
  const cardId = `atlas-card-${a.id}`;
  const sourceLabel = ATLAS_SOURCE_TYPE_LABELS[a.source_type] ?? a.source_type;
  return (
    <div
      id={cardId}
      className={`bg-[#F5F6F8] rounded-[14px] overflow-hidden transition-[border-color] duration-150 ease-out relative ${
        isOpen ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <div className="absolute top-3 right-[50px] z-[2] flex items-center gap-1.5 print-hide">
        {isOpen && (
          <PrintCardButton
            targetId={cardId}
            pdfTitle={`Атлас — ${a.title_ru}`}
          />
        )}
        <FavoriteStarButton id={`atlas:${a.id}`} type="atlas" title={a.title_ru} />
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? `Свернуть атлас: ${a.title_ru}` : `Развернуть атлас: ${a.title_ru}. Источник: ${a.source}.`}
        className="w-full flex items-start gap-3.5 px-[18px] py-3.5 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span aria-hidden="true" className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-[var(--font-display)] text-[15px] font-semibold text-[#111827] tracking-[-0.01em] leading-[1.35]">
              <Highlight text={a.title_ru} query={query} />
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-body)] text-[11px] font-medium text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap">
              {sourceLabel}
            </span>
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-[#9CA3AF] transition-transform duration-200 mt-1 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="pt-[18px] px-5 pb-5 bg-white border-t border-[#E5E7EB] text-[13.5px] leading-[1.6] text-[#1F2937]">
              {/* Print-only title — provides context in PDF since toggle button is hidden. */}
              <h2 className="hidden print:block font-[var(--font-display)] text-[20px] font-bold text-[#1A1A1A] tracking-[-0.01em] mb-3 pb-3 border-b border-[#E5E7EB]">
                {a.title_ru} <span className="font-normal text-[#6B7280] ml-2 text-[15px]">— Атлас ({sourceLabel})</span>
              </h2>
              <p className="mt-0 mb-4 pb-3.5 border-b border-[#F0F1F5] text-sm leading-[1.55] text-[#4B5563]">
                <Highlight text={a.description} query={query} />
              </p>

              {a.key_findings.length > 0 && (
                <div className="mb-4">
                  <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-1.5">
                    Ключевые находки
                  </div>
                  <ul className="m-0 pl-[22px] text-[13px] leading-[1.55] text-[#374151] flex flex-col gap-1">
                    {a.key_findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex items-center flex-wrap gap-3">
                <DesignSystemLinkButton
                  href={a.url}
                  ariaLabel={`Открыть атлас: ${a.title_ru} на ${a.source}`}
                  label={`Открыть на ${a.source}`}
                />
                <span className="text-[11px] text-[#9CA3AF] flex-1 leading-[1.4] min-w-[200px]">
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

/** Neonatal quiz progress dashboard — exported for reuse in /stats page (audit H2). */
export function ProgressDashboard({ bank: _bank, quizzesBank: _quizzesBank }: { bank: unknown; quizzesBank: unknown }) {
  void _bank; void _quizzesBank;
  const [quizzes, setQuizzes] = useState<{ id: string; title_ru: string; topic: string; level: string; questions: unknown[] }[] | null>(null);
  const [progress, setProgress] = useState<Record<string, { selected: Record<number, number>; submitted: boolean; score: number; playOrder?: number[]; seenIndices?: number[] }>>({});

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/neonatal-quizzes.json?v=1.4.0', { cache: 'force-cache' });
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
        <div className="lc-shimmer h-[120px] w-full rounded-[14px] mb-3" />
        <div className="lc-shimmer h-[200px] w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Aggregate stats — 4 KPI cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-6">
        <ProgressKpi label="Тестов всего" value={`${stats.total}`} />
        <ProgressKpi label="Пройдено хоть раз" value={`${stats.attempted}`} sublabel={`${Math.round(stats.attempted / Math.max(1, stats.total) * 100)}%`} />
        <ProgressKpi label="Сдано (≥70%)" value={`${stats.passed}`} sublabel={`${Math.round(stats.passed / Math.max(1, stats.total) * 100)}%`} accent="#059669" />
        <ProgressKpi label="Средний балл" value={`${stats.avgPercent}%`} accent={stats.avgPercent >= 70 ? '#059669' : stats.avgPercent >= 50 ? '#B45309' : '#9CA3AF'} />
      </div>

      {/* Suggestions — what to do next */}
      {suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-3 tracking-[-0.01em] flex items-baseline gap-2">
            Рекомендуем пройти
            <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
              {suggestions.length}
            </span>
          </h3>
          <div className="flex flex-col gap-2">
            {suggestions.map((s) => {
              const reason = s.attempts === 0
                ? 'Ещё не пробовали'
                : !s.passed
                ? `Текущий результат ${s.bestPercent}% — ниже 70%`
                : `Bank ${s.bankSize}, видели ${s.seenIndices.length} — ещё ${s.bankSize - s.seenIndices.length} новых`;
              return (
                <div key={s.id} className="flex items-center gap-3 flex-wrap px-4 py-3.5 bg-[#F5F6F8] rounded-xl">
                  <span className="font-[var(--font-display)] text-sm font-semibold text-[#1A1A1A] flex-1 min-w-[200px]">{s.title}</span>
                  <span className="inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] uppercase tracking-[0.04em] whitespace-nowrap">
                    {TOPIC_LABELS_DASHBOARD[s.topic] ?? s.topic}
                  </span>
                  <span className="text-xs text-[#6B7280]">{reason}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-topic breakdown */}
      <div className="mb-6">
        <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-3 tracking-[-0.01em] flex items-baseline gap-2">
          По темам
          <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
            {byTopic.length}
          </span>
        </h3>
        <div className="flex flex-col gap-1.5">
          {byTopic.map(([topic, bucket]) => {
            const passPct = Math.round(bucket.passed / Math.max(1, bucket.total) * 100);
            return (
              <div key={topic} className="flex items-center gap-3 flex-wrap px-4 py-3 bg-[#F5F6F8] rounded-[10px]">
                <span className="font-semibold flex-1 min-w-[160px] text-sm">
                  {TOPIC_LABELS_DASHBOARD[topic] ?? topic}
                </span>
                <span className="text-xs text-[#6B7280]">
                  {bucket.passed}/{bucket.total} сдано
                </span>
                <span className={`inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-semibold whitespace-nowrap ${
                  passPct === 100 ? 'text-[#059669]' : passPct >= 70 ? 'text-[#B45309]' : 'text-[#9CA3AF]'
                }`}>
                  {passPct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-quiz table */}
      <div>
        <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-3 tracking-[-0.01em] flex items-baseline gap-2">
          Все тесты
          <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
            {snapshots.length}
          </span>
        </h3>
        <div className="flex flex-col gap-1.5">
          {snapshots.map((s) => (
            <div key={s.id} className={`flex items-center gap-3 flex-wrap px-4 py-3 rounded-[10px] ${
              s.passed ? 'bg-[#ECFDF5]' : 'bg-[#F5F6F8]'
            }`}>
              <span className="font-semibold flex-1 min-w-[200px] text-[13.5px]">
                {s.title}
              </span>
              {s.attempts > 0 ? (
                <>
                  <span className={`inline-flex items-center px-[var(--space-2)] py-1 rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-semibold whitespace-nowrap ${
                    s.passed ? 'text-[#059669]' : 'text-[#B45309]'
                  }`}>
                    {s.passed ? 'PASS' : 'FAIL'} {s.bestScore}/{Math.min(10, s.bankSize)}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">
                    Видели {s.seenIndices.length}/{s.bankSize}
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#9CA3AF]">не пройден</span>
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
    <div className="px-[18px] py-4 bg-[#F5F6F8] rounded-[14px]">
      <div className="font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-1">{label}</div>
      <div
        className="font-[var(--font-display)] text-[26px] font-bold text-[var(--kpi-color,#1A1A1A)] tracking-[-0.02em] leading-[1.1]"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic KPI accent color via CSS-var
        style={accent ? { ['--kpi-color' as string]: accent } : undefined}
      >{value}</div>
      {sublabel && (
        <div className="text-[11px] text-[#6B7280] mt-1">{sublabel}</div>
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
    <div className="w-full">
      {/* Disclaimer */}
      <div className="px-3.5 py-3 bg-[#FEF3C7] border border-[#FDE68A] rounded-[10px] mb-4 text-[12.5px] text-[#78350F] leading-[1.5]">
        <strong>⚠ Только справочный инструмент.</strong> Расчёты по формуле doses × weight.
        Перед применением проверьте индивидуально по протоколу учреждения и LCP/PALS дозам.
        Не заменяет клиническое решение.
      </div>

      {/* Weight input */}
      <div className="px-[18px] py-4 bg-[#F5F6F8] rounded-[14px] mb-4">
        <label className="block font-[var(--font-mono)] text-[11px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF] mb-2">
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
          className="w-full px-3.5 py-3 bg-white border border-[#E5E7EB] rounded-[10px] font-[var(--font-mono)] text-2xl font-bold text-[#1A1A1A] outline-none"
        />
        {weight === null && (
          <div className="mt-2 text-xs text-[#DC2626]">
            Введите вес 0.4 — 10.0 кг
          </div>
        )}
      </div>

      {/* Category filter — design-system pills (mirrors ToolsPage favorites
          + sidebar groups: dark-on-active, body-font, sentence-case, no CAPS). */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'resuscitation', 'metabolic', 'sedation', 'cardio'] as const).map((c) => {
          const isActive = filterCategory === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCategory(c)}
              aria-pressed={isActive}
              className={`px-3 py-[7px] border-0 rounded-full cursor-pointer font-[var(--font-body)] text-xs font-semibold whitespace-nowrap transition-[background-color,color] duration-[180ms] ${
                isActive
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#374151]'
              }`}
            >
              {c === 'all' ? 'Все' : DRUG_CATEGORY_LABELS[c]}
            </button>
          );
        })}
      </div>

      {/* Drug rows grouped */}
      <div className="flex flex-col gap-6">
        {grouped.map(([cat, drugs]) => (
          <div key={cat}>
            <h3 className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mt-0 mb-3 tracking-[-0.01em] flex items-baseline gap-2">
              {DRUG_CATEGORY_LABELS[cat]}
              <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF]">
                {drugs.length}
              </span>
            </h3>
            <div className="flex flex-col gap-1.5">
              {drugs.map((d) => {
                const calculated = weight !== null && d.dose_per_kg > 0 ? (d.dose_per_kg * weight) : null;
                const capped = d.max_total !== undefined && calculated !== null && calculated > d.max_total ? d.max_total : calculated;
                const calcText = capped !== null
                  ? `${capped.toFixed(d.unit.includes('мкг') ? 0 : 2)} ${d.unit.replace('/кг', '')}`
                  : (d.dose_per_kg === 0 ? d.formula_text : '—');
                return (
                  <div key={d.id} className="px-4 py-3.5 bg-[#F5F6F8] rounded-xl">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-[var(--font-display)] text-sm font-semibold text-[#1A1A1A] flex-1 min-w-[200px]">{d.name_ru}</span>
                      {capped !== null && (
                        <span className="font-[var(--font-mono)] text-lg font-bold text-[#2563EB] tracking-[-0.01em] whitespace-nowrap">
                          {calcText}
                          {d.max_total !== undefined && calculated !== null && calculated > d.max_total && (
                            <span className="text-[11px] text-[#B45309] ml-1.5">
                              (max)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 text-xs text-[#6B7280]">
                      {d.formula_text} · {d.route}
                      {d.concentration && <> · {d.concentration}</>}
                    </div>
                    <div className="mt-1 text-[11px] text-[#9CA3AF] leading-[1.4]">
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
  type: 'drug' | 'guideline' | 'article' | 'case' | 'mistake' | 'checklist' | 'video' | 'atlas' | 'lactmed' | 'calc';
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
  lactmed: 'LactMed',
  calc: 'Калькулятор',
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

/** Reusable external-link button — design-system pill (white BG + soft shadow
 *  + mono uppercase). Used in Atlas + LactMed expanded panels. */
function DesignSystemLinkButton({
  href, label, ariaLabel,
}: {
  href: string;
  label: string;
  ariaLabel: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#374151] font-[var(--font-body)] text-xs font-semibold no-underline whitespace-nowrap transition-[background-color] duration-[180ms]"
    >
      {label}
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" focusable="false">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}

/** Hook — subscribes to favorites changes; returns togglable filter state + favsSet. */
function useFavoritesFilter() {
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [favsSet, setFavsSet] = useState<Set<string>>(() =>
    typeof window === 'undefined' ? new Set() : new Set(loadFavorites().map((f) => f.id))
  );
  useEffect(() => {
    const handler = () => setFavsSet(new Set(loadFavorites().map((f) => f.id)));
    if (typeof window === 'undefined') return;
    window.addEventListener('bordik-favs-changed', handler);
    return () => window.removeEventListener('bordik-favs-changed', handler);
  }, []);
  return { showFavOnly, setShowFavOnly, favsSet };
}

/** Reusable toggle chip — mirror of ToolsPage filter pill (dark on active,
 *  body font, sentence case). Replaces previous mono-uppercase variant per
 *  user feedback — "возьми его из инструментов". */
function FavoritesToggleChip({
  active, onToggle, count,
}: {
  active: boolean;
  onToggle: () => void;
  count: number;
}) {
  const disabled = count === 0 && !active;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      aria-label={active ? 'Показать все' : `Показать только избранные (${count})`}
      title={disabled ? 'Сначала добавьте элементы в избранное' : undefined}
      className={`inline-flex items-center gap-1.5 px-3 py-[7px] border-0 rounded-full font-[var(--font-body)] text-xs font-semibold transition-[background-color,color] duration-[180ms] ${
        active
          ? 'bg-[#1A1A1A] text-white cursor-pointer'
          : disabled
            ? 'bg-[#F5F6F8] text-[#B0B3BA] cursor-not-allowed'
            : 'bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#374151] cursor-pointer'
      }`}
    >
      <svg width={12} height={12} viewBox="0 0 24 24"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" focusable="false">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      Избранные{count > 0 ? ` · ${count}` : ''}
    </button>
  );
}

/** Reusable star button on cards — mirror of ToolsPage CardFavButton.
 *  26x26 rounded-square, white BG default, amber on active. */
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
      className={`shrink-0 w-[26px] h-[26px] rounded-lg relative inline-flex items-center justify-center cursor-pointer transition-[background-color,color,box-shadow,border-color] duration-[160ms] border ${
        isFav
          ? 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] border-[#FDE68A] shadow-none'
          : 'bg-white hover:bg-[#F5F6F8] text-[#9CA3AF] border-transparent shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)]'
      }`}
    >
      <svg width={13} height={13} viewBox="0 0 24 24"
        fill={isFav ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={isFav ? 0 : 1.9}
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" focusable="false">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}
