'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SectionId } from './curriculum';

interface AppState {
  activeSection: SectionId | null;
  activeModuleId: number | null;
  currentCourseId: string | null;
  sidebarOpen: boolean;
  openModules: number[];
  completedCourses: string[];
  /** Study time in seconds per courseId */
  studyTime: Record<string, number>;
  showProfile: boolean;

  openCourse: (id: string) => void;
  closeCourse: () => void;
  openModule: (id: number) => void;
  closeModule: () => void;
  markCompleted: (id: string) => void;
  unmarkCompleted: (id: string) => void;
  setActiveSection: (id: SectionId | null) => void;
  goHome: () => void;
  toggleModule: (id: number) => void;
  toggleSidebar: () => void;
  toggleProfile: () => void;
  addStudyTime: (courseId: string, seconds: number) => void;
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
      showProfile: false,

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

      unmarkCompleted: (id) => {
        set({ completedCourses: get().completedCourses.filter((c) => c !== id) });
      },

      setActiveSection: (id) => set({ activeSection: id, activeModuleId: null, currentCourseId: null }),

      goHome: () => set({ activeSection: null, activeModuleId: null, currentCourseId: null, showProfile: false }),

      toggleModule: (id) => {
        const { openModules } = get();
        set({
          openModules: openModules.includes(id)
            ? openModules.filter((m) => m !== id)
            : [...openModules, id],
        });
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      toggleProfile: () => set((s) => ({ showProfile: !s.showProfile })),

      addStudyTime: (courseId, seconds) => {
        const { studyTime } = get();
        set({ studyTime: { ...studyTime, [courseId]: (studyTime[courseId] || 0) + seconds } });
      },
    }),
    {
      name: 'ironmed-progress',
      partialize: (state) => ({
        completedCourses: state.completedCourses,
        openModules: state.openModules,
        studyTime: state.studyTime,
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
