'use client';

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { SectionId } from './curriculum-types';
// Use the build-time precomputed module → course IDs map instead of
// importing the full module objects. This keeps lib/store.ts (eager
// in every consumer) from dragging the 230 KB curriculum.ts module
// data into the home bundle.
import { MODULE_COURSE_IDS } from './curriculum-stats';
import {
  type TestLevel, type TestAttempt, type ModuleTestAttempt, type TestQuestion,
  gradeTest, gradeModuleTest, MAX_TEST_LEVELS,
} from './quiz';

export interface AppState {
  activeSection: SectionId | null;
  activeModuleId: number | null;
  currentCourseId: string | null;
  sidebarOpen: boolean;
  openModules: number[];
  completedCourses: string[];
  /** Courses the user has actively started (clicked «Начать обучение»). Lets us
   *  show an intro/CTA screen on first open and skip it on subsequent visits. */
  startedCourses: string[];
  /** Per-course list of lesson topic (tab) ids the user has opened. */
  readTopics: Record<string, string[]>;
  studyTime: Record<string, number>;
  userName: string;
  difficultyFilter: 'all' | 'basic' | 'intermediate' | 'advanced';
  userEmail: string;
  userStatus: string;    // school, university, working, etc.
  userCountry: string;
  userSpecialty: string; // направление (например, врач, студент, медсестра)
  userLanguage: string;  // язык обучения
  userGoal: string;      // цель обучения (USMLE, резидентура, CME)
  showLearning: boolean;
  showProfile: boolean;
  showTools: boolean;
  showStats: boolean;
  showTests: boolean;
  /** Справочник МКБ-10. Параллельно живёт SSG-страница /icd10 для SEO,
   *  но при переходе из сайдбара открываем embedded-вью внутри shell-а. */
  showIcd10: boolean;
  /** Drug Interaction Checker. Параллельно живёт SSG /drugs для SEO. */
  showDrugs: boolean;
  /** Neonatal Handbook — справочник доз для новорождённых (NICU). */
  showNeonatal: boolean;
  /** Personal Notes — top-level раздел (extracted from neonatology). */
  showNotes: boolean;
  /** Active tab inside NeonatalHandbook — controlled from Sidebar
   *  expanded submenu. Persists в localStorage через persist-middleware.
   *  Tabs cases/mistakes/checklists/videos/atlas covers Table 3.Д
   *  educational materials per neonatology audit. */
  neonatalActiveTab: 'drugs' | 'calculators' | 'guidelines' | 'resuscitation' | 'articles' | 'lactmed' | 'quizzes' | 'nurse' | 'labs' | 'growth' | 'bilirubin' | 'cases' | 'mistakes' | 'checklists' | 'videos' | 'atlas' | 'drugcalc';
  activeToolId: string | null;

  /** Tools page persistent state — filters, scroll, favourites */
  toolsQuery: string;
  toolsCategories: string[];
  toolsSubcategories: string[];
  toolsCountries: string[];
  toolsOnlyAvailable: boolean;
  toolsScrollIndex: number;   // Virtuoso startIndex used on re-mount
  toolsScrollOffset: number;  // px offset within that row
  toolsFavourites: string[];  // list of tool ids
  toolsFavouritesUpdatedAt: number; // ms epoch of last favourites change (cross-device LWW sync)
  /** Per-tool open count — used by stats page to surface kind breakdown */
  toolUsage: Record<string, number>;
  /** Recent tool IDs in MRU order (most recently used first), capped to 10.
   *  Powers the "Недавние" widget на /tools. Persisted в localStorage,
   *  чтобы пользователь возвращался к привычным инструментам мгновенно
   *  через дежурство / разные устройства одной сессии. */
  recentToolIds: string[];
  /** Patient context — sticky widget на /neonatology для anti-repetition
   *  workflow. Клиницист один раз вводит weight/GA/postnatal day, и они
   *  auto-fill в калькуляторы которые их требуют (Apgar, Bili-2022, Fluid,
   *  GIR, Fenton, Resuscitation doses, Surfactant). Persisted сессионно
   *  через localStorage — сохраняется между переключениями вкладок и
   *  cold reload'ом за дежурство. Очищается через explicit «Сбросить
   *  контекст» (или auto-clear через 24ч TTL — см. patientContextSetAt). */
  patientContext: {
    /** Вес ребёнка, граммы (NICU стандарт). 0 = не задано. */
    weightG: number;
    /** Гестационный возраст при рождении, недели. 0 = не задано. Range 22-44. */
    gaWeeks: number;
    /** Постнатальный день (день жизни). 0 = день рождения. */
    postnatalDay: number;
  };
  /** Timestamp последнего изменения patientContext (epoch ms). Используется
   *  для TTL: контекст auto-clears через 24h неактивности, чтобы данные
   *  предыдущего пациента не утекали на следующего. 0 = ещё не задано. */
  patientContextSetAt: number;

  /** Последний результат адаптивного диагностического теста.
   *  Сохраняется при завершении теста, доступ через TestsPage —
   *  пользователь может вернуться и пересмотреть рекомендации. */
  lastDiagnosticResult: {
    profession: string;
    professionRationale: string;
    level: 'basic' | 'intermediate' | 'advanced';
    strengths: string[];
    weaknesses: string[];
    recommendedModuleIds: number[];
    studyPlan: string;
    correct: number;
    total: number;
    completedAt: string; // ISO 8601
  } | null;
  setToolsQuery: (q: string) => void;
  setToolsCategories: (c: string[]) => void;
  setToolsSubcategories: (s: string[]) => void;
  setToolsCountries: (c: string[]) => void;
  setToolsOnlyAvailable: (b: boolean) => void;
  setToolsScroll: (index: number, offset: number) => void;
  toggleFavouriteTool: (id: string) => void;

  /** Test attempts keyed by "{courseId}-{testLevel}" */
  testAttempts: Record<string, TestAttempt[]>;
  /** Highest test level passed per course (0 = none, 1-5) */
  courseTestProgress: Record<string, number>;
  /** Module final test attempts keyed by moduleId */
  moduleTestAttempts: Record<number, ModuleTestAttempt[]>;
  /** Module IDs that passed the final test */
  completedModules: number[];

  openCourse: (id: string) => void;
  closeCourse: () => void;
  openModule: (id: number) => void;
  closeModule: () => void;
  markCompleted: (id: string) => void;
  startCourse: (id: string) => void;
  markTopicRead: (courseId: string, topicId: string) => void;
  setActiveSection: (id: SectionId | null) => void;
  goHome: () => void;
  toggleModule: (id: number) => void;
  toggleSidebar: () => void;
  setUserName: (name: string) => void;
  setDifficultyFilter: (f: 'all' | 'basic' | 'intermediate' | 'advanced') => void;
  setUserProfile: (data: Partial<{ userName: string; userEmail: string; userStatus: string; userCountry: string; userSpecialty: string; userLanguage: string; userGoal: string }>) => void;
  setShowLearning: (show: boolean) => void;
  setShowTools: (show: boolean) => void;
  setShowStats: (show: boolean) => void;
  setShowTests: (show: boolean) => void;
  setShowIcd10: (show: boolean) => void;
  setShowDrugs: (show: boolean) => void;
  setShowNeonatal: (show: boolean) => void;
  setShowNotes: (show: boolean) => void;
  /** Switch active tab inside NeonatalHandbook. Used by Sidebar expandable
   *  submenu — clicking sub-item also calls setShowNeonatal(true). */
  setNeonatalActiveTab: (tab: AppState['neonatalActiveTab']) => void;
  setLastDiagnosticResult: (r: AppState['lastDiagnosticResult']) => void;

  /** Update patient context partial (any of weight/GA/day). Always bumps
   *  `patientContextSetAt` to now. Use `clearPatientContext()` to reset
   *  всё вместе (e.g. при смене пациента). */
  setPatientContext: (ctx: Partial<AppState['patientContext']>) => void;
  /** Reset patient context to defaults (all zero) — кнопка «Сбросить»
   *  в widget'е + auto-call по TTL >24h. */
  clearPatientContext: () => void;
  toggleProfile: () => void;
  addStudyTime: (courseId: string, seconds: number) => void;
  openTool: (id: string) => void;
  closeTool: () => void;

  submitTest: (
    courseId: string,
    testLevel: TestLevel,
    answers: number[],
    questions: TestQuestion[],
    violations?: number,
  ) => { score: number; total: number; passed: boolean };

  submitModuleTest: (
    moduleId: number,
    answers: number[],
    questions: TestQuestion[],
    timeUsedMs: number,
    violations?: number,
  ) => { score: number; total: number; passed: boolean };

  /** Record an aborted course test — user clicked Прервать.
   *  Treated as a failed attempt with a shorter (12h) cooldown. */
  abortTest: (
    courseId: string,
    testLevel: TestLevel,
    answers: (number | null)[],
    violations?: number,
  ) => void;

  /** Same for module final test. */
  abortModuleTest: (
    moduleId: number,
    answers: (number | null)[],
    timeUsedMs: number,
    violations?: number,
  ) => void;
}

// P2-PERF-NEW-4 — DECIDED NOT TO FIX (закрыто 2026-05-09).
// Audit предлагал заменить sync persist hydration на onRehydrateStorage
// async hook + defer до post-paint, чтобы выиграть 50-200 ms «hydration
// delay». НО:
//   1. Зустранд persist по умолчанию использует sync localStorage read —
//      это feature, а не bug. Render видит persisted state СРАЗУ, без
//      flash-of-default-state.
//   2. Async hydration уже однажды поломала Bordik: SSR рендерил initial
//      state ('home'-stub), client-mount после async rehydrate переключал
//      на SectionCards — content swap давал +1990 ms LCP `render-delay`
//      на Lighthouse home-route. Fix: stable SSR tree (см.
//      components/home/HomeApp.tsx:616-628) — переход на async снова
//      вернул бы регрессию.
//   3. Cyrillic content даёт worse FOUC: theme/language/profile-name
//      flicker заметен глазу. 5-200 ms hydration < визуального FOUC.
// Sync persist остаётся by design. См. также P2-PERF-NEW-13 в этом же
// файле — другой пример «WONTFIX из-за конфликта с другим guard'ом».
// Доку: docs/performance-audit-2026-05.md (P2-PERF-NEW-4 row).
// Audit B-11: wrap persist with `subscribeWithSelector` so consumers
// (useSupabaseSync) can use `useAppStore.subscribe(selector, listener,
// { equalityFn })` instead of the bare `subscribe(listener)` which
// fires on EVERY state mutation (useStudyTimer ticks 1×/sec).
export const useAppStore = create<AppState>()(
  subscribeWithSelector(
  persist(
    (set, get) => ({
      activeSection: null,
      activeModuleId: null,
      currentCourseId: null,
      // Default closed so mobile first-paint doesn't flash the drawer over
       // content. Sidebar.tsx opens it on mount if viewport is ≥ 768 px.
      sidebarOpen: false,
      openModules: [],
      completedCourses: [],
      startedCourses: [],
      readTopics: {},
      studyTime: {},
      userName: 'Студент',
      difficultyFilter: 'all',
      userEmail: '',
      userStatus: '',
      userCountry: '',
      userSpecialty: '',
      userLanguage: 'Русский',
      userGoal: '',
      showLearning: false,
      showProfile: false,
      showTools: false,
      showStats: false,
      showTests: false,
      showIcd10: false,
      showDrugs: false,
      showNeonatal: false,
      showNotes: false,
      neonatalActiveTab: 'drugs',
      activeToolId: null,

      testAttempts: {},
      courseTestProgress: {},
      moduleTestAttempts: {},
      completedModules: [],

      // ── Tools page persistent state ──
      toolsQuery: '',
      toolsCategories: [],
      toolsSubcategories: [],
      toolsCountries: [],
      toolsOnlyAvailable: false,
      toolsScrollIndex: 0,
      toolsScrollOffset: 0,
      toolsFavourites: [],
      toolsFavouritesUpdatedAt: 0,
      toolUsage: {},
      recentToolIds: [],
      patientContext: { weightG: 0, gaWeeks: 0, postnatalDay: 0 },
      patientContextSetAt: 0,
      lastDiagnosticResult: null,

      setToolsQuery: (q) => set({ toolsQuery: q }),
      setToolsCategories: (c) => set({ toolsCategories: c }),
      setToolsSubcategories: (s) => set({ toolsSubcategories: s }),
      setToolsCountries: (c) => set({ toolsCountries: c }),
      setToolsOnlyAvailable: (b) => set({ toolsOnlyAvailable: b }),
      setToolsScroll: (index, offset) => set({ toolsScrollIndex: index, toolsScrollOffset: offset }),
      toggleFavouriteTool: (id) => {
        const favs = get().toolsFavourites;
        const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
        set({ toolsFavourites: next, toolsFavouritesUpdatedAt: Date.now() });
      },

      // Switch to a course view — also clears other top-level view flags so
       // the navigation works regardless of where the user clicked from
       // (e.g. from the global sidebar search while on Tools / Tests / Stats).
      openCourse: (id) => set({
        currentCourseId: id,
        showProfile: false, showTools: false, showStats: false,
        showTests: false, showLearning: false, activeToolId: null,
      }),
      closeCourse: () => set({ currentCourseId: null }),

      openModule: (id) => set({
        activeModuleId: id, currentCourseId: null,
        showProfile: false, showTools: false, showStats: false,
        showTests: false, showLearning: false, activeToolId: null,
      }),
      closeModule: () => set({ activeModuleId: null }),

      markCompleted: (id) => {
        const { completedCourses } = get();
        if (!completedCourses.includes(id)) {
          set({ completedCourses: [...completedCourses, id] });
        }
      },
      startCourse: (id) => {
        const { startedCourses } = get();
        if (!startedCourses.includes(id)) {
          set({ startedCourses: [...startedCourses, id] });
        }
      },
      markTopicRead: (courseId, topicId) =>
        set((s) => {
          const cur = s.readTopics[courseId] ?? [];
          if (cur.includes(topicId)) return s;
          return { readTopics: { ...s.readTopics, [courseId]: [...cur, topicId] } };
        }),

      submitTest: (courseId, testLevel, answers, questions, violations = 0) => {
        const { score, total, passed } = gradeTest(questions, answers);
        const attempt: TestAttempt = {
          courseId, testLevel, answers, score, total, passed,
          timestamp: Date.now(), violations,
        };

        const key = `${courseId}-${testLevel}`;
        const { testAttempts, courseTestProgress, completedCourses } = get();
        const prev = testAttempts[key] || [];
        const currentProgress = courseTestProgress[courseId] || 0;

        const updates: Partial<AppState> = {
          testAttempts: { ...testAttempts, [key]: [...prev, attempt] },
        };

        if (passed && testLevel > currentProgress) {
          updates.courseTestProgress = { ...courseTestProgress, [courseId]: testLevel };
        }

        // Course completed when level 5 passed
        if (passed && testLevel === MAX_TEST_LEVELS && !completedCourses.includes(courseId)) {
          updates.completedCourses = [...completedCourses, courseId];
        }

        set(updates);
        return { score, total, passed };
      },

      submitModuleTest: (moduleId, answers, questions, timeUsedMs, violations = 0) => {
        const { score, total, passed } = gradeModuleTest(questions, answers);
        const attempt: ModuleTestAttempt = {
          moduleId, answers, score, total, passed,
          timestamp: Date.now(), timeUsedMs, violations,
        };

        const { moduleTestAttempts, completedModules } = get();
        const prev = moduleTestAttempts[moduleId] || [];

        const updates: Partial<AppState> = {
          moduleTestAttempts: { ...moduleTestAttempts, [moduleId]: [...prev, attempt] },
        };

        if (passed && !completedModules.includes(moduleId)) {
          updates.completedModules = [...completedModules, moduleId];
        }

        set(updates);
        return { score, total, passed };
      },

      abortTest: (courseId, testLevel, answers, violations = 0) => {
        const sanitizedAnswers = answers.map((a) => (a == null ? -1 : a));
        const attempt: TestAttempt = {
          courseId, testLevel,
          answers: sanitizedAnswers,
          score: 0,
          total: sanitizedAnswers.length,
          passed: false,
          timestamp: Date.now(),
          violations,
          aborted: true,
        };
        const key = `${courseId}-${testLevel}`;
        const { testAttempts } = get();
        const prev = testAttempts[key] || [];
        set({ testAttempts: { ...testAttempts, [key]: [...prev, attempt] } });
      },

      abortModuleTest: (moduleId, answers, timeUsedMs, violations = 0) => {
        const sanitizedAnswers = answers.map((a) => (a == null ? -1 : a));
        const attempt: ModuleTestAttempt = {
          moduleId,
          answers: sanitizedAnswers,
          score: 0,
          total: sanitizedAnswers.length,
          passed: false,
          timestamp: Date.now(),
          timeUsedMs,
          violations,
          aborted: true,
        };
        const { moduleTestAttempts } = get();
        const prev = moduleTestAttempts[moduleId] || [];
        set({ moduleTestAttempts: { ...moduleTestAttempts, [moduleId]: [...prev, attempt] } });
      },

      setActiveSection: (id) => set({ activeSection: id, activeModuleId: null, currentCourseId: null }),

      goHome: () => set({ activeSection: null, activeModuleId: null, currentCourseId: null, showProfile: false, showLearning: false, showTools: false, showStats: false, showTests: false, showIcd10: false, showDrugs: false, showNeonatal: false, showNotes: false, activeToolId: null }),

      toggleModule: (id) => {
        const { openModules } = get();
        set({
          openModules: openModules.includes(id)
            ? openModules.filter((m) => m !== id)
            : [...openModules, id],
        });
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      setUserName: (name) => set({ userName: name }),

      setDifficultyFilter: (f) => set({ difficultyFilter: f }),

      setUserProfile: (data) => set((s) => ({ ...s, ...data })),

      setShowLearning: (show) => set({ showLearning: show, showProfile: false, showTools: false, showStats: false, showTests: false, showIcd10: false, showDrugs: false, showNeonatal: false, showNotes: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowTools: (show) => set({ showTools: show, showProfile: false, showLearning: false, showStats: false, showTests: false, showIcd10: false, showDrugs: false, showNeonatal: false, showNotes: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowStats: (show) => set({ showStats: show, showProfile: false, showLearning: false, showTools: false, showTests: false, showIcd10: false, showDrugs: false, showNeonatal: false, showNotes: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowTests: (show) => set({ showTests: show, showProfile: false, showLearning: false, showTools: false, showStats: false, showIcd10: false, showDrugs: false, showNeonatal: false, showNotes: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowIcd10: (show) => set({ showIcd10: show, showProfile: false, showLearning: false, showTools: false, showStats: false, showTests: false, showDrugs: false, showNeonatal: false, showNotes: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowDrugs: (show) => set({ showDrugs: show, showProfile: false, showLearning: false, showTools: false, showStats: false, showTests: false, showIcd10: false, showNeonatal: false, showNotes: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowNeonatal: (show) => set({ showNeonatal: show, showProfile: false, showLearning: false, showTools: false, showStats: false, showTests: false, showIcd10: false, showDrugs: false, showNotes: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),
      setNeonatalActiveTab: (tab) => set({ neonatalActiveTab: tab }),
      setShowNotes: (show) => set({ showNotes: show, showProfile: false, showLearning: false, showTools: false, showStats: false, showTests: false, showIcd10: false, showDrugs: false, showNeonatal: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setLastDiagnosticResult: (r) => set({ lastDiagnosticResult: r }),

      setPatientContext: (partial) => {
        const cur = get().patientContext;
        // Sanitize input: numeric coerce, clamp to ranges valid in neonatology.
        const next = {
          weightG: clampNum(partial.weightG ?? cur.weightG, 0, 10_000),
          gaWeeks: clampNum(partial.gaWeeks ?? cur.gaWeeks, 0, 44),
          postnatalDay: clampNum(partial.postnatalDay ?? cur.postnatalDay, 0, 365),
        };
        set({ patientContext: next, patientContextSetAt: Date.now() });
      },
      clearPatientContext: () => set({
        patientContext: { weightG: 0, gaWeeks: 0, postnatalDay: 0 },
        patientContextSetAt: 0,
      }),

      toggleProfile: () => set({ showProfile: true, showLearning: false, showTools: false, showStats: false, showTests: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      // Open a specific tool — flip into appropriate view + clear other
      // top-level flags. If user is currently on Neonatology page (showNeonatal=true),
      // KEEP that flag and don't override to showTools — so Back from ToolView
      // returns to Neonatology Calculators tab instead of /tools list.
      openTool: (id) => {
        const { toolUsage, recentToolIds, showNeonatal } = get();
        // MRU обновление: убираем id из текущей позиции, ставим в начало,
        // обрезаем до 10 элементов. Это даёт ленту «последние 5–10 инструментов»
        // под виджет на странице /tools без отдельного timestamp-словаря.
        const nextRecent = [id, ...recentToolIds.filter((x) => x !== id)].slice(0, 10);
        // P0-A8 «время до результата»: запоминаем момент открытия инструмента
        // в window.* (не в store, чтобы не триггерить лишние ре-рендеры).
        // ToolView читает этот timestamp при первом успешном compute и шлёт
        // в Sentry метрику tool_time_to_result.
        if (typeof window !== 'undefined') {
          (window as unknown as { __bordikToolOpenedAt?: { id: string; t: number } }).__bordikToolOpenedAt = {
            id,
            t: performance.now(),
          };
        }
        // If opened from Neonatology — keep showNeonatal=true so close brings
        // user back. Otherwise standard tools-flow.
        if (showNeonatal) {
          set({
            activeToolId: id,
            // showNeonatal stays true; HomeApp view-decider treats
            // (activeToolId && showNeonatal) as 'tool' precedence.
            showProfile: false, showStats: false, showTests: false, showLearning: false,
            activeSection: null, activeModuleId: null, currentCourseId: null,
            toolUsage: { ...toolUsage, [id]: (toolUsage[id] ?? 0) + 1 },
            recentToolIds: nextRecent,
          });
        } else {
          set({
            activeToolId: id,
            showTools: true,
            showProfile: false, showStats: false, showTests: false, showLearning: false,
            activeSection: null, activeModuleId: null, currentCourseId: null,
            toolUsage: { ...toolUsage, [id]: (toolUsage[id] ?? 0) + 1 },
            recentToolIds: nextRecent,
          });
        }
      },
      // closeTool — clears activeToolId only. View-decider falls back to
      // remaining flag (showNeonatal stays true if entered from there;
      // showTools stays true if entered from /tools).
      closeTool: () => set({ activeToolId: null }),

      addStudyTime: (courseId, seconds) => {
        const { studyTime } = get();
        set({ studyTime: { ...studyTime, [courseId]: (studyTime[courseId] || 0) + seconds } });
      },
    }),
    {
      name: 'bordik-progress',
      version: 5,
      // Hardened migrate: tolerant of corrupt or attacker-tampered
      // localStorage. We never trust persisted JSON blindly - every
      // top-level key is type-guarded, anything failing the guard is
      // silently dropped (better empty than booby-trapped). Bumped to
      // v3 to also re-run guards on already-migrated v2 stores.
      //
      // Body extracted to the top-level exported `migratePersistedState`
      // so it can be unit-tested directly (regression guard for the
      // `lastDiagnosticResult` carry-through, audit2 #139).
      migrate: migratePersistedState,
      partialize: (state) => ({
        userName: state.userName,
        userEmail: state.userEmail,
        userStatus: state.userStatus,
        userCountry: state.userCountry,
        userSpecialty: state.userSpecialty,
        userLanguage: state.userLanguage,
        userGoal: state.userGoal,
        completedCourses: state.completedCourses,
        startedCourses: state.startedCourses,
        readTopics: state.readTopics,
        completedModules: state.completedModules,
        openModules: state.openModules,
        studyTime: state.studyTime,
        testAttempts: state.testAttempts,
        courseTestProgress: state.courseTestProgress,
        moduleTestAttempts: state.moduleTestAttempts,
        // Tools page — remember user's chosen filters and favourites across sessions.
        // Scroll position (toolsScrollIndex/Offset) NOT persisted: browsers already
        // restore scroll on reload, and persisting it would surprise on cold start.
        toolsQuery: state.toolsQuery,
        toolsCategories: state.toolsCategories,
        toolsSubcategories: state.toolsSubcategories,
        toolsCountries: state.toolsCountries,
        toolsOnlyAvailable: state.toolsOnlyAvailable,
        toolsFavourites: state.toolsFavourites,
        toolsFavouritesUpdatedAt: state.toolsFavouritesUpdatedAt,
        toolUsage: state.toolUsage,
        recentToolIds: state.recentToolIds,
        // Patient context — persists weight/GA/postnatal day for the current
        // dejour. Two TTL guards work together (audit B-13):
        //   1. Hydrate-side TTL rejects rows older than 24h on load
        //      (see `partialize`/`merge` in this file).
        //   2. Runtime TTL in `PatientContextBar` polls every minute
        //      while the bar is mounted and calls clearPatientContext()
        //      once setAt + 24h is past — covers long dejours with the
        //      tab kept open.
        patientContext: state.patientContext,
        patientContextSetAt: state.patientContextSetAt,
        lastDiagnosticResult: state.lastDiagnosticResult,
      }),
    }
  ),
  )
);

/** Clamp a number to [min, max]; non-finite → min. Used by patient context
 *  setters to prevent garbage-input from corrupting localStorage state. */
function clampNum(v: unknown, min: number, max: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/**
 * Hardened migration for the persisted `bordik-progress` store.
 *
 * Tolerant of corrupt or attacker-tampered localStorage: we never trust
 * persisted JSON blindly — every top-level key is type-guarded and anything
 * failing the guard is silently dropped (better empty than booby-trapped).
 *
 * Exported (rather than inlined into the `persist` config) purely so it can
 * be unit-tested directly — the inline version was untested and silently
 * dropped `lastDiagnosticResult` on every version bump until audit2 #139.
 * Behaviour is identical to the previous inline closure.
 */
export function migratePersistedState(persistedState: unknown, version: number): AppState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (persistedState ?? {}) as Record<string, any>;

  // v1 → v2 schema shift
  if (version < 2) {
    delete raw.quizAttempts;
    delete raw.quizBestScores;
    raw.testAttempts = {};
    raw.courseTestProgress = {};
    raw.moduleTestAttempts = {};
    raw.completedModules = [];
  }

  // v2 → v3: re-validate every key. No structural change, just
  // typing the trash out.
  const isStr = (v: unknown): v is string => typeof v === 'string';
  const isStrArr = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every(isStr);
  const isNumArr = (v: unknown): v is number[] =>
    Array.isArray(v) && v.every((x) => typeof x === 'number' && Number.isFinite(x));
  const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

  // Drop keys that don't match expected shape. Every defaulting
  // value here matches AppState's initial state, so the store
  // remains usable even if the entire persisted blob was junk.
  const safe: Record<string, unknown> = {};
  if (isStr(raw.userName))       safe.userName = raw.userName.slice(0, 200);
  if (isStr(raw.userEmail))      safe.userEmail = raw.userEmail.slice(0, 320);
  if (isStr(raw.userStatus))     safe.userStatus = raw.userStatus.slice(0, 50);
  if (isStr(raw.userCountry))    safe.userCountry = raw.userCountry.slice(0, 80);
  if (isStr(raw.userSpecialty))  safe.userSpecialty = raw.userSpecialty.slice(0, 120);
  if (isStr(raw.userLanguage))   safe.userLanguage = raw.userLanguage.slice(0, 10);
  if (isStr(raw.userGoal))       safe.userGoal = raw.userGoal.slice(0, 200);
  if (isStrArr(raw.completedCourses)) safe.completedCourses = raw.completedCourses;
  if (isStrArr(raw.startedCourses))   safe.startedCourses = raw.startedCourses;
  if (isObj(raw.readTopics)) {
    // Validate each value is string[] — isObj() alone only checks the container.
    // A corrupt value like {courseId: 42} causes new Set(42) to throw in CoursePage.
    const validatedReadTopics: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(raw.readTopics)) {
      if (isStrArr(v)) validatedReadTopics[k] = v;
    }
    safe.readTopics = validatedReadTopics;
  }
  if (isNumArr(raw.completedModules)) safe.completedModules = raw.completedModules;
  if (isNumArr(raw.openModules))      safe.openModules = raw.openModules;
  if (isObj(raw.studyTime)) {
    // Validate each value is a finite number — isObj() alone passes through strings
    // and NaNs, which corrupt getTotalStudyTime() and break study time display.
    const validatedStudyTime: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw.studyTime)) {
      if (typeof v === 'number' && Number.isFinite(v)) validatedStudyTime[k] = v;
    }
    safe.studyTime = validatedStudyTime;
  }
  if (isObj(raw.testAttempts))        safe.testAttempts = raw.testAttempts;
  if (isObj(raw.courseTestProgress))  safe.courseTestProgress = raw.courseTestProgress;
  if (isObj(raw.moduleTestAttempts))  safe.moduleTestAttempts = raw.moduleTestAttempts;
  if (isStr(raw.toolsQuery))          safe.toolsQuery = raw.toolsQuery.slice(0, 200);
  if (isStrArr(raw.toolsCategories))  safe.toolsCategories = raw.toolsCategories;
  if (isStrArr(raw.toolsSubcategories)) safe.toolsSubcategories = raw.toolsSubcategories;
  if (isStrArr(raw.toolsCountries))   safe.toolsCountries = raw.toolsCountries;
  if (typeof raw.toolsOnlyAvailable === 'boolean') safe.toolsOnlyAvailable = raw.toolsOnlyAvailable;
  if (isStrArr(raw.toolsFavourites))  safe.toolsFavourites = raw.toolsFavourites;
  // Favourites LWW timestamp: keep if present, else default to now so an
  // existing device's local favourites win the first sync (never silently
  // replaced by an older server set during rollout of this feature).
  safe.toolsFavouritesUpdatedAt =
    typeof raw.toolsFavouritesUpdatedAt === 'number' && Number.isFinite(raw.toolsFavouritesUpdatedAt)
      ? raw.toolsFavouritesUpdatedAt
      : Date.now();
  if (isObj(raw.toolUsage))           safe.toolUsage = raw.toolUsage;
  if (isStrArr(raw.recentToolIds))    safe.recentToolIds = raw.recentToolIds.slice(0, 10);

  // Patient context — defensive hydrate. Clamp every field; reject if
  // older than 24h (sessions don't carry over between dejours).
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  if (isObj(raw.patientContext) && typeof raw.patientContextSetAt === 'number') {
    const age = Date.now() - raw.patientContextSetAt;
    if (age >= 0 && age < TWENTY_FOUR_HOURS) {
      const pc = raw.patientContext as Record<string, unknown>;
      safe.patientContext = {
        weightG: clampNum(pc.weightG, 0, 10_000),
        gaWeeks: clampNum(pc.gaWeeks, 0, 44),
        postnatalDay: clampNum(pc.postnatalDay, 0, 365),
      };
      safe.patientContextSetAt = raw.patientContextSetAt;
    }
  }

  // Diagnostic result — persisted in partialize, so it MUST be carried
  // through migrate too. Without this it was silently dropped on every
  // version bump (and re-persisted as null), wiping the user's saved
  // 30-question diagnostic and forcing a retake.
  if (isObj(raw.lastDiagnosticResult)) safe.lastDiagnosticResult = raw.lastDiagnosticResult;

  return safe as unknown as AppState;
}

/** Format seconds to human-readable string */
export function formatStudyTime(seconds: number): string {
  if (seconds < 60) return `${seconds} сек`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} мин`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hours} ч ${remainMins} мин` : `${hours} ч`;
}

/** Get total study time across all courses */
export function getTotalStudyTime(studyTime: Record<string, number>): number {
  return Object.values(studyTime).reduce((sum, s) => sum + s, 0);
}

/* ═══ Helper selectors ═══ */

/** Get highest passed test level for a course (0 = none) */
export function getHighestPassedLevel(state: AppState, courseId: string): number {
  return state.courseTestProgress[courseId] || 0;
}

/** Check if module final test is unlocked (all courses have level 5 passed) */
export function isModuleTestUnlocked(state: AppState, moduleId: number): boolean {
  const courseIds = MODULE_COURSE_IDS[moduleId];
  if (!courseIds || courseIds.length === 0) return false;
  return courseIds.every((cid) => (state.courseTestProgress[cid] || 0) >= MAX_TEST_LEVELS);
}
