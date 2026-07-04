'use client';

import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';

// useLayoutEffect на сервере выдаёт warning — используем useEffect-fallback.
// На клиенте useLayoutEffect синхронен с paint → нет flash на desktop.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
// framer-motion removed in 2026-04-28 perf pass — replaced with pure
// CSS transitions in app/globals.css (.sidebar-overlay, .sidebar-drawer,
// .feedback-modal-overlay, .feedback-modal-card). Saves ~80 kB raw / 30
// kB gz from the home critical path bundle.
import { useAppStore } from '@/lib/store';
import { useT, useLang } from '@/lib/i18n';
// `searchCourses` references the full 230 KB modules array from
// lib/curriculum.ts. Importing it eagerly forces Sidebar (which mounts
// on every route) to drag the curriculum data into the home bundle.
// Instead we dynamically import on first non-empty query — UX cost is
// a ~50-200 ms one-time chunk download on the user's first search.
import type { SearchableCourse } from '@/lib/curriculum';
// CATALOG_TOOLS (172 kB) is dynamically imported below — lazy until the
// user actually starts searching while on the Tools view.
import type { CatalogTool } from '@/lib/tools-catalog';
import { safeLazyImport } from '@/lib/safe-lazy-import';
import nextDynamic from 'next/dynamic';
import Highlight from '@/components/ui/Highlight';

// UserMenu pulls @supabase (~50 kB gz). Lazy-loading it stops Sidebar
// (which is eager on every route) from dragging Supabase into the
// initial home bundle. The visual placeholder during chunk download
// is just the existing avatar circle from the static SVG below.
const UserMenu = nextDynamic(() => import('./UserMenu'), { ssr: false });

type NavItem = 'home' | 'learning' | 'tests' | 'tools' | 'icd10' | 'drugs' | 'neonatal' | 'stats' | 'notes' | 'profile';

// Highlight вынесен в `components/ui/Highlight.tsx` — единый паттерн
// для всех мест поиска (sidebar, Cmd+K, фильтры, /icd10).
// Если нужна подсветка в новом месте — используем тот же компонент.

interface NavDef {
  id: NavItem;
  label: string;
  keywords: string[];
  icon: React.ReactNode;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const t = useT();
  const lang = useLang();
  // Audit P-1: atomic selectors. Pre-fix `useAppStore()` без селектора
  // подписывал Sidebar на ВЕСЬ store — useStudyTimer тикает 1×/сек,
  // что триггерило re-render всего 1064-LOC компонента ежесекундно
  // на любой странице. Per-field selectors дёргают Sidebar только
  // когда изменился реально нужный slice.
  const activeSection = useAppStore((s) => s.activeSection);
  const showProfile = useAppStore((s) => s.showProfile);
  const showLearning = useAppStore((s) => s.showLearning);
  const showTools = useAppStore((s) => s.showTools);
  const showStats = useAppStore((s) => s.showStats);
  const showTests = useAppStore((s) => s.showTests);
  const showIcd10 = useAppStore((s) => s.showIcd10);
  const showDrugs = useAppStore((s) => s.showDrugs);
  const showNeonatal = useAppStore((s) => s.showNeonatal);
  const showNotes = useAppStore((s) => s.showNotes);
  const goHome = useAppStore((s) => s.goHome);
  const setShowLearning = useAppStore((s) => s.setShowLearning);
  const setShowTools = useAppStore((s) => s.setShowTools);
  const setShowStats = useAppStore((s) => s.setShowStats);
  const setShowTests = useAppStore((s) => s.setShowTests);
  const setShowIcd10 = useAppStore((s) => s.setShowIcd10);
  const setShowDrugs = useAppStore((s) => s.setShowDrugs);
  const setShowNeonatal = useAppStore((s) => s.setShowNeonatal);
  const setShowNotes = useAppStore((s) => s.setShowNotes);
  const neonatalActiveTab = useAppStore((s) => s.neonatalActiveTab);
  const setNeonatalActiveTab = useAppStore((s) => s.setNeonatalActiveTab);
  const toggleProfile = useAppStore((s) => s.toggleProfile);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const openCourse = useAppStore((s) => s.openCourse);
  const setActiveSection = useAppStore((s) => s.setActiveSection);
  const openTool = useAppStore((s) => s.openTool);

  // Auto-expand Neonatology submenu when user is on /neonatology view.
  // User can collapse manually via caret toggle. Persisted via local state
  // (resets on reload) — sidebar is ephemeral context, not deep persistence.
  const [neonatalExpanded, setNeonatalExpanded] = useState(false);
  useEffect(() => {
    if (showNeonatal) setNeonatalExpanded(true);
  }, [showNeonatal]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  // Sidebar opens on desktop by default, stays closed on mobile.
  // P2-PERF — useLayoutEffect (вместо useEffect): запускается ДО paint,
  // поэтому desktop-юзер не видит flash «sidebar появляется через 10-20мс
  // после первого render». На SSR fallback на useEffect через
  // useIsoLayoutEffect-обёртку.
  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    if (mq.matches) {
      useAppStore.setState({ sidebarOpen: true });
    }
    // Keep sidebar in sync when viewport crosses the breakpoint (resize / rotate).
    const onChange = (e: MediaQueryListEvent) => {
      useAppStore.setState({ sidebarOpen: e.matches });
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
     
  }, []);

  const activeNav: NavItem = showProfile
    ? 'profile'
    : showStats
      ? 'stats'
      : showTests
        ? 'tests'
        : showTools
          ? 'tools'
          : showIcd10
            ? 'icd10'
            : showDrugs
              ? 'drugs'
              : showNeonatal
                ? 'neonatal'
                : showNotes
                  ? 'notes'
                  : (activeSection || showLearning)
                    ? 'learning'
                    : 'home';

  const handleNav = (item: NavItem) => {
    if (item === 'home') goHome();
    else if (item === 'profile') toggleProfile();
    else if (item === 'learning') setShowLearning(true);
    else if (item === 'tests') setShowTests(true);
    else if (item === 'tools') setShowTools(true);
    else if (item === 'icd10') setShowIcd10(true);
    else if (item === 'drugs') setShowDrugs(true);
    else if (item === 'neonatal') setShowNeonatal(true);
    else if (item === 'stats') setShowStats(true);
    else if (item === 'notes') setShowNotes(true);
    // Auto-close drawer on mobile so the user actually sees the destination.
    // Profile is a modal panel that overlays the sidebar - closing the
    // sidebar there would hide the modal too, so we leave it alone.
    if (item !== 'profile' && typeof window !== 'undefined' &&
        window.matchMedia('(max-width: 768px)').matches) {
      useAppStore.setState({ sidebarOpen: false });
    }
  };

  /* Prefetch the heavy chunks on hover/focus so they're already cached
   * by the time the user actually clicks. Each lazy route lives in its
   * own webpack chunk; calling the import() now forces the browser to
   * fetch+parse it in the background. Idempotent — repeat hovers are
   * cheap. */
  const prefetched = useState(() => new Set<NavItem>())[0];
  const prefetch = (item: NavItem) => {
    if (prefetched.has(item)) return;
    prefetched.add(item);
    switch (item) {
      case 'tools':    void import('@/components/tools/ToolsPage'); break;
      case 'tests':    void import('@/components/tests/TestsPage'); break;
      case 'stats':    void import('@/components/stats/StatisticsPage'); break;
      case 'profile':  void import('@/components/profile/ProfilePage'); break;
      case 'icd10':    void import('@/components/classifications/ClassificationsHub'); break;
      case 'drugs':    void import('@/components/drugs/DrugChecker'); break;
      case 'neonatal': void import('@/components/neonatal/NeonatalHandbook'); break;
      case 'notes':    void import('@/components/notes/NotesPage'); break;
      case 'learning': /* no chunk — sections render in app/page.tsx */ break;
      case 'home':     /* eager */ break;
    }
  };

  const navItems: Record<NavItem, NavDef> = {
    home: {
      id: 'home',
      label: t('nav.home'),
      keywords: ['главная', 'home', 'старт', 'dashboard'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    learning: {
      id: 'learning',
      label: t('nav.learning'),
      keywords: ['обучение', 'курсы', 'модули', 'learning', 'courses', 'уроки'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
    },
    tests: {
      id: 'tests',
      label: t('nav.tests'),
      keywords: ['тесты', 'тест', 'экзамен', 'tests', 'exam', 'quiz', 'проверка'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
          <polyline points="9,14 11,16 15,12" />
        </svg>
      ),
    },
    tools: {
      id: 'tools',
      label: t('nav.tools'),
      keywords: ['инструменты', 'калькулятор', 'tools', 'calculator', 'бми', 'bmi'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    icd10: {
      id: 'icd10',
      label: 'Классификации',
      keywords: ['классификации', 'classifications', 'мкб', 'мкб-10', 'мкб-11', 'icd', 'icd10', 'icd-10', 'icd-11', 'icd-10-cm', 'icd-10-pcs', 'icd-10-ca', 'icd-10-gm', 'icd-10-am', 'диагноз', 'код', 'справочник', 'classification', 'международная классификация'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      ),
    },
    drugs: {
      id: 'drugs',
      label: 'Взаимодействия',
      keywords: ['взаимодействия', 'лекарства', 'препараты', 'drug', 'interaction', 'interactions', 'фарма', 'фармакология', 'совместимость', 'варфарин', 'амиодарон', 'клопидогрел'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.5 20.5L20 11a4.95 4.95 0 00-7-7L3.5 13.5a4.95 4.95 0 007 7z" />
          <path d="M8.5 8.5l7 7" />
        </svg>
      ),
    },
    neonatal: {
      id: 'neonatal',
      label: 'Неонатология',
      keywords: ['неонатология', 'неонатальный', 'неонатал', 'новорождённые', 'новорожденные', 'нику', 'nicu', 'neonatal', 'newborn', 'infant', 'preterm', 'недоношенные', 'педиатр'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h.01" />
          <path d="M15 12h.01" />
          <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
          <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
        </svg>
      ),
    },
    stats: {
      id: 'stats',
      label: t('nav.stats'),
      keywords: ['статистика', 'stats', 'statistics', 'прогресс', 'активность', 'активити', 'analytics'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    notes: {
      id: 'notes',
      label: 'Мои заметки',
      keywords: ['заметки', 'мои', 'notes', 'note', 'личное', 'персональное', 'notebook'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    profile: {
      id: 'profile',
      label: t('nav.profile'),
      keywords: ['профиль', 'настройки', 'profile', 'settings', 'аккаунт'],
      icon: (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 10-16 0" />
        </svg>
      ),
    },
  };

  const groups: NavGroup[] = [
    { id: 'main',     title: t('nav.group.main'),     items: ['home', 'profile'] },
    { id: 'study',    title: t('nav.group.study'),    items: ['learning', 'tests', 'stats'] },
    { id: 'services', title: t('nav.group.services'), items: ['tools', 'icd10', 'drugs', 'neonatal'] },
    { id: 'personal', title: 'Личное',                items: ['notes'] },
  ];

  // Neonatology submenu — sub-sections appear under "Неонатология" in the
  // sidebar when expanded. Clicking a sub-item sets showNeonatal=true +
  // selects the corresponding tab via store.neonatalActiveTab. The
  // NeonatalHandbook reads this store value and renders the matched view.
  //
  // Items grouped по логике использования (4 группы × 2-3 пункта):
  //   1. Справочники   — быстрый lookup таблиц
  //   2. Расчёты       — интерактивные калькуляторы и графики
  //   3. Протоколы     — клинические алгоритмы и процедуры
  //   4. Обучение      — статьи, тесты, кейсы, чек-листы, видео, атлас, ошибки
  // Educational extension реализует Таблицу 3.Д из аудита (Д1-Д6).
  type NeonatalSubTab = 'drugs' | 'calculators' | 'guidelines' | 'resuscitation' | 'articles' | 'lactmed' | 'quizzes' | 'nurse' | 'labs' | 'growth' | 'bilirubin' | 'cases' | 'mistakes' | 'checklists' | 'videos' | 'atlas' | 'drugcalc';
  const neonatalGroups: { title: string; items: { id: NeonatalSubTab; label: string }[] }[] = [
    {
      title: 'Справочники',
      items: [
        { id: 'drugs',    label: 'Препараты' },
        { id: 'lactmed',  label: 'ГВ / LactMed' },
        { id: 'labs',     label: 'Лаб. нормы' },
        { id: 'atlas',    label: 'Атласы' },
      ],
    },
    {
      title: 'Расчёты и шкалы',
      items: [
        { id: 'calculators', label: 'Калькуляторы' },
        { id: 'drugcalc',    label: 'Дозы по весу' },
        { id: 'growth',      label: 'Графики роста' },
        { id: 'bilirubin',   label: 'Билирубин' },
      ],
    },
    {
      title: 'Протоколы и процедуры',
      items: [
        { id: 'guidelines',    label: 'Протоколы' },
        { id: 'resuscitation', label: 'Реанимация (4 региона)' },
        { id: 'nurse',         label: 'Процедуры медсестры' },
        { id: 'checklists',    label: 'Чек-листы процедур' },
        { id: 'videos',        label: 'Видео процедур' },
      ],
    },
    {
      title: 'Обучение',
      items: [
        { id: 'articles', label: 'Статьи' },
        { id: 'cases',    label: 'Клинические случаи' },
        { id: 'mistakes', label: 'Типичные ошибки' },
        { id: 'quizzes',  label: 'Тесты' },
      ],
    },
  ];

  const handleNeonatalSubClick = (subTab: NeonatalSubTab) => {
    setShowNeonatal(true);
    setNeonatalActiveTab(subTab);
    // Auto-close drawer on mobile so user sees destination
    if (typeof window !== 'undefined' &&
        window.matchMedia('(max-width: 768px)').matches) {
      useAppStore.setState({ sidebarOpen: false });
    }
  };

  // Filter by search
  const q = searchQuery.trim().toLowerCase();
  const visibleGroups = useMemo(() => {
    if (!q) return groups;
    // Word-prefix match: разбиваем label/keyword по пробелам и дефисам
    // и проверяем, что хотя бы одно слово начинается с query. Раньше
    // использовался .includes(q) — для 'ка' он ловил подстроки в
    // 'аккаунт', 'проверка', 'статистика', 'фармакология' и т.д.,
    // поэтому в сайдбаре висели ВСЕ nav-разделы.
    const wordPrefixMatch = (text: string): boolean => {
      const t = text.toLowerCase();
      if (t.startsWith(q)) return true;
      // Слова разделяются пробелами, дефисами и слэшами — учитываем все три,
      // чтобы 'classifications' и 'мкб-10' матчились по 'мкб', 'icd' и т.п.
      return t.split(/[\s\-/]+/).some((w) => w.startsWith(q));
    };
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((id) =>
          wordPrefixMatch(navItems[id].label) ||
          navItems[id].keywords.some((k) => wordPrefixMatch(k))
        ),
      }))
      .filter((g) => g.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- navItems is built from the constant `NAV_GROUPS` + t() translator; its identity depends transitively on `lang` which IS in deps. wordPrefixMatch is defined inside the memo and re-created per render but only ever called within this same useMemo execution.
  }, [q, lang]);

  // Course search results — async-loaded curriculum module on first
  // non-empty query. State holds the latest result; first input has a
  // ~50-200 ms download delay, subsequent inputs are instant.
  const UNLOCKED_SECTIONS = ['fundamentals'];
  const searchModuleRef = useRef<{
    searchCourses: (q: string, limit?: number, preferSection?: string) => SearchableCourse[];
  } | null>(null);
  const [courseResults, setCourseResults] = useState<{
    available: SearchableCourse[];
    locked: SearchableCourse[];
  }>({ available: [], locked: [] });

  useEffect(() => {
    if (!q || q.length < 2) {
      setCourseResults({ available: [], locked: [] });
      return;
    }
    let cancelled = false;
    (async () => {
      if (!searchModuleRef.current) {
        // Dynamic import — first call costs a chunk fetch, after that
        // the function reference is cached on the ref.
        const mod = await safeLazyImport(() => import('@/lib/curriculum'));
        if (cancelled) return;
        if (!mod) { setCourseResults({ available: [], locked: [] }); return; }
        searchModuleRef.current = { searchCourses: mod.searchCourses };
      }
      if (cancelled) return;
      const all = searchModuleRef.current.searchCourses(q, 30, activeSection ?? undefined);
      const available = all.filter((r) => UNLOCKED_SECTIONS.includes(r.module.sectionId));
      const locked = all.filter((r) => !UNLOCKED_SECTIONS.includes(r.module.sectionId));
      if (!cancelled) setCourseResults({ available, locked });
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchModuleRef is a ref (intentionally stable); UNLOCKED_SECTIONS is a module-level constant.
  }, [q, activeSection]);

  // Tools search — context-aware: only fires when user is on the Tools view.
  // CATALOG_TOOLS is lazy-imported the first time someone actually searches,
  // so the 172-kB tool catalog doesn't sit in the home-page bundle.
  const [toolCatalog, setToolCatalog] = useState<CatalogTool[] | null>(null);
  useEffect(() => {
    if (!q || q.length < 2 || !showTools || toolCatalog) return;
    let cancelled = false;
    safeLazyImport(() => import('@/lib/tools-catalog')).then((m) => {
      if (!cancelled && m) setToolCatalog(m.CATALOG_TOOLS);
    });
    return () => { cancelled = true; };
  }, [q, showTools, toolCatalog]);

  const toolResults = useMemo<CatalogTool[]>(() => {
    if (!q || q.length < 2 || !showTools || !toolCatalog) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored: { item: CatalogTool; score: number }[] = [];
    for (const t of toolCatalog) {
      const hay = `${t.title} ${t.description} ${t.category} ${t.subcategory}`.toLowerCase();
      let score = 0;
      for (const tok of tokens) {
        if (!hay.includes(tok)) { score = -1; break; }
        if (t.title.toLowerCase().startsWith(tok)) score += 6;
        if (t.title.toLowerCase().includes(tok)) score += 3;
        score += 1;
      }
      if (score > 0) {
        if (t.available) score += 2; // available tools first
        scored.push({ item: t, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 12).map((s) => s.item);
  }, [q, showTools, toolCatalog]);

  const totalCourseResults = courseResults.available.length + courseResults.locked.length;

  const handleCoursePick = (courseId: string, sectionId: string) => {
    // Set section first (for breadcrumbs), then open course. openCourse
    // already clears all other top-level view flags so we don't need to.
    setActiveSection(sectionId as never);
    openCourse(courseId);
    setSearchQuery('');
    // Auto-close drawer on mobile so the user actually sees the destination
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      useAppStore.setState({ sidebarOpen: false });
    }
  };

  const handleToolPick = (toolId: string) => {
    // openTool already flips into Tools view + clears other flags.
    openTool(toolId);
    setSearchQuery('');
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      useAppStore.setState({ sidebarOpen: false });
    }
  };

  const isSearching = q.length > 0;
  const hasResults = visibleGroups.length > 0 || totalCourseResults > 0 || toolResults.length > 0;

  return (
    <>
      {/* Mobile overlay — dimming backdrop behind the drawer.
          Pure CSS opacity transition (was framer-motion). The wrapper is
          always rendered; `pointer-events: none` plus `opacity: 0` keeps
          it from intercepting clicks when the drawer is closed. */}
      <div
        className="sidebar-overlay md:hidden"
        data-open={sidebarOpen ? 'true' : 'false'}
        onClick={toggleSidebar}
        aria-hidden={!sidebarOpen}
      />

      <aside
        className="app-sidebar-aside sidebar-drawer fixed md:sticky top-0 z-50 w-[280px] h-[100dvh] bg-[#F0F1F5] flex flex-col shrink-0"
        data-open={sidebarOpen ? 'true' : 'false'}
      >
        {/* Logo — WebP first (55 kB), PNG fallback (53 kB) for any
            browsers that somehow can't handle WebP in 2026. */}
        <div className="pt-5 px-6 pb-0">
          <picture>
            <source srcSet="/logo-bordik.webp" type="image/webp" />
            <img
              src="/logo-bordik.png"
              alt="Bordik"
              className="h-7 w-auto block"
            />
          </picture>
        </div>

        {/* Date + welcome */}
        <div className="pt-6 px-6 pb-4">
          <p className="font-[var(--font-body)] text-sm font-medium text-[#6B7280] mb-2">
            {new Date().toLocaleDateString(
              { ru: 'ru-RU', en: 'en-GB', uz: 'uz-UZ' }[lang] || 'ru-RU',
              { day: 'numeric', month: 'long', year: 'numeric' }
            )}
          </p>
          <p className="font-[var(--font-display)] text-2xl font-bold text-[#1A1A1A] leading-[1.15] tracking-[-0.02em] whitespace-pre-line">
            {t('sidebar.welcome')}
          </p>
        </div>

        {/* Search - matches nav item size */}
        <div className="pt-0 px-3 pb-3">
          <div className={`flex items-center gap-[14px] py-2.5 px-4 rounded-[12px] transition-colors duration-150 ${searchFocus ? 'bg-[#E8E9ED]' : 'bg-[#E2E4EA]'}`}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
              stroke={searchFocus ? '#555' : '#8B8F96'} strokeWidth={1.8}
              strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0 transition-[stroke] duration-150">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder={t('nav.search')}
              className="flex-1 min-w-0 border-none outline-none bg-transparent font-[var(--font-body)] text-[14.5px] text-[#1A1A1A]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-transparent border-none p-0 cursor-pointer text-[#8B8F96] flex items-center shrink-0"
                aria-label="Clear"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation - grouped + course search results */}
        <nav className="pt-0 px-3 pb-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          {isSearching && !hasResults ? (
            <div className="py-5 px-4 font-[var(--font-body)] text-[13px] text-[#9CA3AF] text-center">
              {t('nav.nothingFound')}
            </div>
          ) : (
            <>
              {/* Nav groups */}
              {visibleGroups.map((group, gi) => (
                <div key={group.id} className={gi < visibleGroups.length - 1 ? 'mb-3' : 'mb-2.5'}>
                  <p className="pt-1.5 px-4 pb-1.5 font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
                    {group.title}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((id) => {
                      const item = navItems[id];
                      const isActive = activeNav === id;
                      const isNeonatal = id === 'neonatal';
                      return (
                        <div key={id}>
                          <button
                            onClick={() => {
                              if (isNeonatal) {
                                // Neonatology — first click sets view + expands; further clicks toggle expand
                                setShowNeonatal(true);
                                setNeonatalExpanded((prev) => !prev || !isActive);
                                if (typeof window !== 'undefined' &&
                                    window.matchMedia('(max-width: 768px)').matches) {
                                  useAppStore.setState({ sidebarOpen: false });
                                }
                                return;
                              }
                              handleNav(id);
                            }}
                            onFocus={() => prefetch(id)}
                            onMouseEnter={() => prefetch(id)}
                            className={`w-full flex items-center gap-[14px] py-[11px] px-4 rounded-[12px] border-none cursor-pointer transition-colors duration-150 ${
                              isActive ? 'bg-[#E2E4EA]' : 'bg-transparent hover:bg-[#E8E9ED]'
                            }`}
                          >
                            <span className={`flex ${isActive ? 'text-[#1A1A1A]' : 'text-[#999]'}`}>
                              {item.icon}
                            </span>
                            <span className={`flex-1 font-[var(--font-body)] text-[14.5px] text-left ${
                              isActive ? 'font-semibold text-[#1A1A1A]' : 'font-normal text-[#777]'
                            }`}>
                              {item.label}
                            </span>
                            {isNeonatal && (
                              <span
                                aria-hidden="true"
                                className={`flex transition-transform duration-200 ${
                                  isActive ? 'text-[#1A1A1A]' : 'text-[#999]'
                                } ${neonatalExpanded ? 'rotate-180' : ''}`}
                              >
                                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                                  stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </span>
                            )}
                          </button>

                          {/* Neonatology expandable submenu — grouped into 4
                              logical sections с маленькими uppercase header'ами
                              (mono, gray-9CA3AF) над каждой группой. */}
                          {isNeonatal && neonatalExpanded && (
                            <div
                              role="menu"
                              aria-label="Разделы неонатологии"
                              className="flex flex-col gap-2 pl-[22px] pt-1.5 pb-1.5 ml-4 border-l-2 border-[#DCDFE5]"
                            >
                              {neonatalGroups.map((group, gIdx) => (
                                <div
                                  key={group.title}
                                  role="group"
                                  aria-label={group.title}
                                  className="flex flex-col gap-px"
                                >
                                  <div className={`${gIdx === 0 ? 'pt-0.5 px-3 pb-1' : 'pt-1.5 px-3 pb-1'} font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]`}>
                                    {group.title}
                                  </div>
                                  {group.items.map((sub) => {
                                    const subActive = isActive && neonatalActiveTab === sub.id;
                                    return (
                                      <button
                                        key={sub.id}
                                        role="menuitem"
                                        onClick={() => handleNeonatalSubClick(sub.id)}
                                        className={`flex items-center py-[7px] px-3 border-none rounded-lg cursor-pointer font-[var(--font-body)] text-[13px] text-left transition-colors duration-150 ${
                                          subActive
                                            ? 'bg-[#E2E4EA] text-[#1A1A1A] font-semibold'
                                            : 'bg-transparent hover:bg-[#E8E9ED] text-[#666] font-normal'
                                        }`}
                                      >
                                        {sub.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Tool results — only when user is on the Tools page */}
              {isSearching && toolResults.length > 0 && (
                <div className="mt-1">
                  <p className="pt-1.5 px-4 pb-1.5 font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] flex items-center gap-1.5">
                    <span>{t('nav.group.tools')}</span>
                    <span className="py-px px-1.5 rounded-full bg-[#E2E4EA] text-[#6B7280] text-[9px] font-bold">
                      {toolResults.length}
                    </span>
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {toolResults.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => tool.available && handleToolPick(tool.id)}
                        disabled={!tool.available}
                        className={`w-full flex flex-col items-start gap-0.5 py-[9px] px-3.5 rounded-[10px] bg-transparent hover:bg-[#E8E9ED] border-none text-left transition-colors duration-150 ${
                          tool.available ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-[0.55]'
                        }`}
                      >
                        <span className="font-[var(--font-body)] text-[13px] font-medium text-[#1A1A1A] overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                          <Highlight text={tool.title} query={q} />
                        </span>
                        <span className="font-[var(--font-body)] text-[11px] text-[#9CA3AF] overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                          <Highlight text={tool.subcategory} query={q} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Course results - available */}
              {isSearching && courseResults.available.length > 0 && (
                <div className="mt-1">
                  <p className="pt-1.5 px-4 pb-1.5 font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] flex items-center gap-1.5">
                    <span>{t('nav.group.coursesAvailable')}</span>
                    <span className="py-px px-1.5 rounded-full bg-[#E2E4EA] text-[#6B7280] text-[9px] font-bold">
                      {courseResults.available.length}
                    </span>
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {courseResults.available.map(({ course, module, section }) => (
                      <button
                        key={course.id}
                        onClick={() => handleCoursePick(course.id, module.sectionId)}
                        className="w-full flex flex-col items-start gap-0.5 py-[9px] px-3.5 rounded-[10px] bg-transparent hover:bg-[#E8E9ED] border-none cursor-pointer text-left transition-colors duration-150"
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#6B7280] py-px px-[5px] rounded bg-[#E2E4EA] shrink-0">
                            {course.id}
                          </span>
                          <span className="font-[var(--font-body)] text-[13px] font-medium text-[#1A1A1A] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                            <Highlight text={course.title} query={q} />
                          </span>
                        </div>
                        <span className="font-[var(--font-body)] text-[11px] text-[#9CA3AF] pl-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                          <Highlight text={section?.title || module.title} query={q} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Course results - coming soon (locked) */}
              {isSearching && courseResults.locked.length > 0 && (
                <div className="mt-1">
                  <p className={`pt-2.5 px-4 pb-1.5 font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] flex items-center gap-1.5 ${
                    courseResults.available.length > 0 ? 'border-t border-[#E2E4EA] mt-1.5' : 'mt-0'
                  }`}>
                    <span>{t('nav.group.coursesSoon')}</span>
                    <span className="py-px px-1.5 rounded-full bg-[#1A1A1A] text-white text-[9px] font-bold">
                      {courseResults.locked.length}
                    </span>
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {courseResults.locked.map(({ course, module, section }) => (
                      <div
                        key={course.id}
                        className="w-full flex flex-col items-start gap-0.5 py-[9px] px-3.5 rounded-[10px] bg-transparent cursor-not-allowed text-left opacity-70"
                        title={t('sidebar.courseSoonTooltip')}
                      >
                        <div className="flex items-center gap-1.5 w-full">
                          <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] py-px px-[5px] rounded bg-[#ECEEF2] shrink-0 inline-flex items-center gap-[3px]">
                            <svg width={8} height={8} viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                            {course.id}
                          </span>
                          <span className="font-[var(--font-body)] text-[13px] font-medium text-[#6B7280] overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                            <Highlight text={course.title} query={q} />
                          </span>
                        </div>
                        <span className="font-[var(--font-body)] text-[11px] text-[#9CA3AF] pl-0.5 overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                          <Highlight text={section?.title || module.title} query={q} />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </nav>
        {/* Feedback / suggestion box - sits above the user menu in the
            previously empty bottom space. Opens a modal where the user
            can send a short message; submission opens a mailto: with the
            text prefilled so we get the email in our inbox. */}
        <FeedbackBlock t={t} />
        {/* App version - small muted text centered under the feedback section. */}
        <p className="mt-0 mb-2 mx-0 font-[var(--font-mono)] text-[10px] font-medium text-[#9CA3AF] tracking-[0.04em] text-center">
          {t('sidebar.version', { version: '0.1.0' })}
        </p>
        {/* User menu — login state at the bottom of the sidebar */}
        <UserMenu />
      </aside>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Feedback block — sits at the bottom of the sidebar between the nav
   and the UserMenu. Click → modal with textarea + file attachments →
   POST /api/feedback → server forwards to Telegram via Bot API.
   File limits enforced both client-side (UX) and server-side (safety):
   5 files, 5 MB each.
   ────────────────────────────────────────────────────────────────── */
const FEEDBACK_MAX_FILES      = 5;
const FEEDBACK_MAX_FILE_BYTES = 5 * 1024 * 1024;

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FeedbackBlock({ t }: { t: (k: string, vars?: Record<string, string | number>) => string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setError(null);
    const next = [...files];
    for (let i = 0; i < incoming.length; i++) {
      const f = incoming.item(i);
      if (!f) continue;
      if (f.size > FEEDBACK_MAX_FILE_BYTES) {
        setError(t('sidebar.feedback.errFileTooLarge', { name: f.name }));
        continue;
      }
      if (next.length >= FEEDBACK_MAX_FILES) {
        setError(t('sidebar.feedback.errTooManyFiles'));
        break;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const reset = () => {
    setOpen(false);
    setText('');
    setFiles([]);
    setSent(false);
    setSending(false);
    setError(null);
  };

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('text', body);
      for (const f of files) fd.append('file', f, f.name);
      const r = await fetch('/api/feedback', { method: 'POST', body: fd });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || !json.ok) {
        const code = (json && json.error) || `http-${r.status}`;
        if (code === 'feedback-not-configured') {
          setError(t('sidebar.feedback.errNotConfigured'));
        } else if (code === 'too-many-files') {
          setError(t('sidebar.feedback.errTooManyFiles'));
        } else if (code === 'file-too-large') {
          setError(t('sidebar.feedback.errFileTooLarge', { name: json.name ?? '' }));
        } else {
          setError(t('sidebar.feedback.errSendFailed'));
        }
        setSending(false);
        return;
      }
      setSent(true);
      setTimeout(reset, 1500);
    } catch {
      setError(t('sidebar.feedback.errNetwork'));
      setSending(false);
    }
  };

  return (
    <>
      {/* Same visual language as nav items: section header + flat
          transparent button with hover grey, neutral icon. */}
      <div className="pt-1 px-3 pb-3 mt-1">
        <p className="pt-1.5 px-4 pb-1.5 font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] m-0">
          {t('sidebar.feedback.section')}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('sidebar.feedback.title')}
          className="w-full flex items-center gap-[14px] py-[11px] px-4 rounded-[12px] bg-transparent hover:bg-[#E8E9ED] border-none cursor-pointer transition-colors duration-150 text-left"
        >
          <span className="flex text-[#999] shrink-0">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </span>
          <span className="font-[var(--font-body)] text-[14.5px] font-normal text-[#777]">
            {t('sidebar.feedback.title')}
          </span>
        </button>
      </div>

      {open && (
        <div
          className="feedback-modal-overlay fixed inset-0 z-[9999] bg-[rgba(15,23,42,0.45)] backdrop-blur-[2px] flex items-center justify-center p-5"
          onClick={() => !sending && setOpen(false)}
        >
          <div
            className="feedback-modal-card w-full max-w-[460px] bg-white rounded-[16px] pt-6 px-6 pb-5 shadow-[0_24px_48px_rgba(15,23,42,0.24)]"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-[10px] bg-[#F5F6F8] text-[#6B7280] inline-flex items-center justify-center shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </span>
                <h3 className="m-0 font-[var(--font-display)] text-lg font-bold text-[#1A1A1A] tracking-[-0.01em]">
                  {t('sidebar.feedback.modalTitle')}
                </h3>
              </div>
              <p className="mt-0 mb-[14px] mx-0 font-[var(--font-body)] text-[13px] text-[#6B7280] leading-[1.5]">
                {t('sidebar.feedback.modalDescription')}
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('sidebar.feedback.placeholder')}
                disabled={sending}
                rows={5}
                className="w-full resize-y min-h-[120px] py-3 px-3.5 rounded-[12px] border-none bg-[#F5F6F8] focus:bg-white font-[var(--font-body)] text-[13.5px] text-[#1A1A1A] leading-[1.5] outline-none shadow-[inset_0_0_0_1px_transparent] focus:shadow-[inset_0_0_0_1px_#1A1A1A] transition-[box-shadow,background] duration-150"
              />

              {/* Hidden file input + visible "Прикрепить" trigger.
                  Multiple selection allowed. Limited client-side to keep
                  the UI honest about what server will accept. */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.txt,.log,.json,.csv"
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending || files.length >= FEEDBACK_MAX_FILES}
                  className={`inline-flex items-center gap-1.5 py-[7px] px-3 rounded-[10px] bg-[#F5F6F8] hover:bg-[#E8E9ED] border-none font-[var(--font-body)] text-xs font-semibold transition-colors duration-150 ${
                    files.length >= FEEDBACK_MAX_FILES ? 'text-[#9CA3AF] cursor-not-allowed' : 'text-[#1A1A1A] cursor-pointer'
                  } disabled:cursor-not-allowed`}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                  {t('sidebar.feedback.attach')}
                </button>
                <span className="font-[var(--font-mono)] text-[10.5px] text-[#9CA3AF]">
                  {t('sidebar.feedback.attachHint', {
                    count: files.length,
                    max: FEEDBACK_MAX_FILES,
                  })}
                </span>
              </div>

              {/* File chips */}
              {files.length > 0 && (
                <ul className="mt-2.5 mb-0 mx-0 p-0 list-none flex flex-col gap-1.5">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center gap-2.5 py-2 px-2.5 bg-[#F5F6F8] rounded-lg">
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                        stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        className="shrink-0">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-[var(--font-body)] text-[12.5px] text-[#1A1A1A]">
                        {f.name}
                      </span>
                      <span className="font-[var(--font-mono)] text-[10.5px] text-[#9CA3AF] shrink-0">
                        {formatBytes(f.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        disabled={sending}
                        aria-label={t('sidebar.feedback.removeFile')}
                        className={`p-1 rounded-md bg-transparent hover:bg-[#E8E9ED] border-none text-[#6B7280] hover:text-[#1A1A1A] inline-flex items-center justify-center shrink-0 transition-colors duration-150 ${
                          sending ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Error message */}
              {error && (
                <p className="mt-2.5 mb-0 mx-0 py-2 px-2.5 bg-[#FEF2F2] border border-[#FECACA] rounded-lg font-[var(--font-body)] text-xs text-[#991B1B] leading-[1.5]">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 mt-[14px]">
                <button
                  type="button"
                  onClick={() => !sending && reset()}
                  disabled={sending}
                  className={`py-[9px] px-4 rounded-[10px] bg-transparent border-none text-[#6B7280] font-[var(--font-body)] text-[13px] font-semibold ${
                    sending ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {t('sidebar.feedback.cancel')}
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={sending || !text.trim()}
                  className={`py-[9px] px-[18px] rounded-[10px] border-none font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms] min-w-[110px] ${
                    sent
                      ? 'bg-[#10B981] text-white cursor-pointer'
                      : !text.trim()
                        ? 'bg-[#E2E4EA] text-[#9CA3AF] cursor-not-allowed'
                        : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white cursor-pointer'
                  }`}
                >
                  {sent ? t('sidebar.feedback.sent') : sending ? t('sidebar.feedback.sending') : t('sidebar.feedback.send')}
                </button>
              </div>
          </div>
        </div>
      )}
    </>
  );
}
