'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from './store';
import { getSupabaseBrowserClient } from './supabase/client';

/**
 * Cross-device sync between the local Zustand store and Supabase.
 *
 * Strategy:
 *   1. On sign-in (or refresh while signed-in) → pull server state once,
 *      merge into local store. Server is authoritative for the union of
 *      completed / started courses + tool favourites; collisions resolve
 *      to «whichever side has the higher progress / more items».
 *   2. While signed-in, observe specific store fields. When they change,
 *      debounce 1.5 s and POST a delta to /api/sync. The endpoint is
 *      idempotent so dropped network requests just retry on next change.
 *
 * Failure mode: if the user is signed-out or the request fails, we
 * never touch the local store — Bordik works offline-first regardless.
 */
export default function useSupabaseSync() {
  const pulled = useRef(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── 1. Initial pull on mount (and on auth state change) ────────
  useEffect(() => {
    let cancelled = false;
    const sb = getSupabaseBrowserClient();

    const pull = async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return;
      try {
        const res = await fetch('/api/sync', { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const state = useAppStore.getState();
        const completed = new Set<string>(state.completedCourses);
        const started   = new Set<string>(state.startedCourses);
        const courseTestProgress: Record<string, number> = { ...state.courseTestProgress };
        const studyTime: Record<string, number> = { ...state.studyTime };

        // Merge course progress rows
        for (const row of data.courseProgress ?? []) {
          if (row.completed_at) completed.add(row.course_id);
          if (row.started_at) started.add(row.course_id);
          const prev = courseTestProgress[row.course_id] ?? 0;
          courseTestProgress[row.course_id] = Math.max(prev, row.highest_test_level ?? 0);
        }

        // Merge study time
        for (const row of data.studyTime ?? []) {
          const prev = studyTime[row.course_id] ?? 0;
          studyTime[row.course_id] = Math.max(prev, row.seconds ?? 0);
        }

        // Merge tool settings (favourites only — filter UI is per-device)
        const tool = data.toolSettings;
        const toolsFavourites: string[] = tool?.favourites
          ? Array.from(new Set([...state.toolsFavourites, ...tool.favourites]))
          : state.toolsFavourites;

        // Merge profile
        const profile = data.profile;
        const profileUpdates: Partial<typeof state> = {};
        if (profile) {
          if (profile.display_name && !state.userName) profileUpdates.userName = profile.display_name;
          if (profile.email && !state.userEmail) profileUpdates.userEmail = profile.email;
          if (profile.country && !state.userCountry) profileUpdates.userCountry = profile.country;
          if (profile.specialty && !state.userSpecialty) profileUpdates.userSpecialty = profile.specialty;
          if (profile.language && !state.userLanguage) profileUpdates.userLanguage = profile.language;
          if (profile.goal && !state.userGoal) profileUpdates.userGoal = profile.goal;
          if (profile.status && !state.userStatus) profileUpdates.userStatus = profile.status;
        }

        useAppStore.setState({
          completedCourses: Array.from(completed),
          startedCourses: Array.from(started),
          courseTestProgress,
          studyTime,
          toolsFavourites,
          ...profileUpdates,
        });
        pulled.current = true;
      } catch {
        // network / parse error — keep local-only mode
      }
    };

    pull();

    // Re-pull when user signs in (on a different tab, etc.)
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') pull();
      if (event === 'SIGNED_OUT') pulled.current = false;
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  // ─── 2. Push debounced ──────────────────────────────────────────
  useEffect(() => {
    // Subscribe to the specific subset of store fields that we sync.
    // unsubscribe on unmount.
    const queuePush = () => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(async () => {
        if (!pulled.current) return; // never push before initial pull
        const s = useAppStore.getState();
        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              completedCourses: s.completedCourses,
              startedCourses: s.startedCourses,
              courseTestProgress: s.courseTestProgress,
              completedModules: s.completedModules,
              studyTime: s.studyTime,
              toolsFavourites: s.toolsFavourites,
              toolsSettings: {
                query: s.toolsQuery,
                categories: s.toolsCategories,
                subcategories: s.toolsSubcategories,
                countries: s.toolsCountries,
                onlyAvailable: s.toolsOnlyAvailable,
              },
              profile: {
                displayName: s.userName,
                status: s.userStatus,
                country: s.userCountry,
                specialty: s.userSpecialty,
                language: s.userLanguage,
                goal: s.userGoal,
              },
            }),
          });
        } catch {
          // silent — local store is already updated, will retry next change
        }
      }, 1500);
    };

    // Watch only the fields we sync; ignore noisy ones (scroll position).
    let prev = JSON.stringify({
      c: useAppStore.getState().completedCourses,
      s: useAppStore.getState().startedCourses,
      ctp: useAppStore.getState().courseTestProgress,
      st: useAppStore.getState().studyTime,
      tf: useAppStore.getState().toolsFavourites,
      un: useAppStore.getState().userName,
    });
    const unsub = useAppStore.subscribe((state) => {
      const next = JSON.stringify({
        c: state.completedCourses,
        s: state.startedCourses,
        ctp: state.courseTestProgress,
        st: state.studyTime,
        tf: state.toolsFavourites,
        un: state.userName,
      });
      if (next !== prev) {
        prev = next;
        queuePush();
      }
    });
    return () => {
      unsub();
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);
}
