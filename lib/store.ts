'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SectionId } from './curriculum';
import { getModuleById } from './curriculum';
import {
  type TestLevel, type TestAttempt, type ModuleTestAttempt, type TestQuestion,
  gradeTest, gradeModuleTest, MAX_TEST_LEVELS,
} from './quiz';

interface AppState {
  activeSection: SectionId | null;
  activeModuleId: number | null;
  currentCourseId: string | null;
  sidebarOpen: boolean;
  openModules: number[];
  completedCourses: string[];
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeSection: null,
      activeModuleId: null,
      currentCourseId: null,
      sidebarOpen: true,
      openModules: [],
      completedCourses: [],
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

      setToolsQuery: (q) => set({ toolsQuery: q }),
      setToolsCategories: (c) => set({ toolsCategories: c }),
      setToolsSubcategories: (s) => set({ toolsSubcategories: s }),
      setToolsCountries: (c) => set({ toolsCountries: c }),
      setToolsOnlyAvailable: (b) => set({ toolsOnlyAvailable: b }),
      setToolsScroll: (index, offset) => set({ toolsScrollIndex: index, toolsScrollOffset: offset }),
      toggleFavouriteTool: (id) => {
        const favs = get().toolsFavourites;
        const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
        set({ toolsFavourites: next });
      },

      openCourse: (id) => set({ currentCourseId: id, showProfile: false }),
      closeCourse: () => set({ currentCourseId: null }),

      openModule: (id) => set({ activeModuleId: id, currentCourseId: null }),
      closeModule: () => set({ activeModuleId: null }),

      markCompleted: (id) => {
        const { completedCourses } = get();
        if (!completedCourses.includes(id)) {
          set({ completedCourses: [...completedCourses, id] });
        }
      },

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

      setActiveSection: (id) => set({ activeSection: id, activeModuleId: null, currentCourseId: null }),

      goHome: () => set({ activeSection: null, activeModuleId: null, currentCourseId: null, showProfile: false, showLearning: false, showTools: false, showStats: false, showTests: false, activeToolId: null }),

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

      setShowLearning: (show) => set({ showLearning: show, showProfile: false, showTools: false, showStats: false, showTests: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowTools: (show) => set({ showTools: show, showProfile: false, showLearning: false, showStats: false, showTests: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowStats: (show) => set({ showStats: show, showProfile: false, showLearning: false, showTools: false, showTests: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      setShowTests: (show) => set({ showTests: show, showProfile: false, showLearning: false, showTools: false, showStats: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      toggleProfile: () => set({ showProfile: true, showLearning: false, showTools: false, showStats: false, showTests: false, activeSection: null, activeModuleId: null, currentCourseId: null, activeToolId: null }),

      openTool: (id) => set({ activeToolId: id }),
      closeTool: () => set({ activeToolId: null }),

      addStudyTime: (courseId, seconds) => {
        const { studyTime } = get();
        set({ studyTime: { ...studyTime, [courseId]: (studyTime[courseId] || 0) + seconds } });
      },
    }),
    {
      name: 'ironmed-progress',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Remove old quiz state, initialize new test state
          delete persistedState.quizAttempts;
          delete persistedState.quizBestScores;
          persistedState.testAttempts = {};
          persistedState.courseTestProgress = {};
          persistedState.moduleTestAttempts = {};
          persistedState.completedModules = [];
        }
        return persistedState as AppState;
      },
      partialize: (state) => ({
        userName: state.userName,
        userEmail: state.userEmail,
        userStatus: state.userStatus,
        userCountry: state.userCountry,
        userSpecialty: state.userSpecialty,
        userLanguage: state.userLanguage,
        userGoal: state.userGoal,
        completedCourses: state.completedCourses,
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
      }),
    }
  )
);

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
  const mod = getModuleById(moduleId);
  if (!mod) return false;
  return mod.courses.every((c) => (state.courseTestProgress[c.id] || 0) >= MAX_TEST_LEVELS);
}
