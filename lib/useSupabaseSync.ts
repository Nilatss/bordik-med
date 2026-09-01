'use client';

import { useEffect, useRef } from 'react';
import { shallow as shallowEqual } from 'zustand/shallow';
import { useAppStore, type AppState } from './store';
import { getSupabaseBrowserClient } from './supabase/client';
import {
  enqueueSync,
  flushSyncQueue,
  hasPendingSync,
  requestBackgroundSync,
  type SyncPayload,
} from './sync-queue';
import { mergeFavouritesLWW } from './favourites-lww';

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
    if (!sb) return; // Backend not configured — local-only mode.

    const pull = async () => {
      const session = await getSessionSafe(sb.auth);
      if (!session) return;
      // Authenticated → allow pushes from here on, even if the pull below
      // fails. The server merge is additive (grow-only), so pushing local
      // state after a failed pull can't destroy server progress. Gating on a
      // SUCCESSFUL pull meant a single failed GET on a flaky network silently
      // dropped the whole session's progress — it never even reached the
      // enqueue path (stage-3 bug audit).
      pulled.current = true;
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

        // Merge tool settings (favourites only — filter UI is per-device).
        // LWW by favourites_updated_at so a delete on another device wins
        // instead of being re-added by a union.
        const tool = data.toolSettings;
        const fav = mergeFavouritesLWW(
          state.toolsFavourites,
          state.toolsFavouritesUpdatedAt ?? 0,
          tool?.favourites,
          tool?.favourites_updated_at,
        );
        const toolsFavourites = fav.favourites;

        // Merge profile
        const profile = data.profile;
        const profileUpdates = mergeProfileFromServer(state, profile);

        useAppStore.setState({
          completedCourses: Array.from(completed),
          startedCourses: Array.from(started),
          courseTestProgress,
          studyTime,
          toolsFavourites,
          toolsFavouritesUpdatedAt: fav.updatedAt,
          ...profileUpdates,
        });
      } catch {
        // network / parse error — keep local-only mode (pushes still allowed)
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
    // Bail when backend isn't configured.
    if (!getSupabaseBrowserClient()) return;
    // Subscribe to the specific subset of store fields that we sync.
    // unsubscribe on unmount.
    const queuePush = () => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(async () => {
        if (!pulled.current) return; // never push before initial pull
        const s = useAppStore.getState();
        const payload = {
          completedCourses: s.completedCourses,
          startedCourses: s.startedCourses,
          courseTestProgress: s.courseTestProgress,
          completedModules: s.completedModules,
          studyTime: s.studyTime,
          toolsFavourites: s.toolsFavourites,
          toolsFavouritesUpdatedAt: s.toolsFavouritesUpdatedAt,
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
        };
        try {
          const r = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!r.ok) throw new Error(`sync-${r.status}`);
        } catch {
          // Network down OR server transient. Persist the latest payload
          // so it survives a tab close, and ask the SW (or the `online`
          // listener fallback) to flush when connectivity returns.
          enqueueSync(payload);
          requestBackgroundSync().catch(() => {});
        }
      }, 1500);
    };

    // Audit B-11: selector + shallow equality. Pre-fix `subscribe(listener)`
    // fired on EVERY store mutation including `useStudyTimer` ticks (1×/s)
    // and ephemeral UI flags (sidebarOpen, scroll position). Each callback
    // did `JSON.stringify` on 6 fields (one — completedCourses — can be a
    // 200+ element array) just to diff: ~12 KB of throwaway string work
    // per tick on an active session.
    // Post-fix: zustand subscribeWithSelector calls the listener ONLY when
    // the selector output changes. Shallow equality compares slice refs
    // per-field — O(1) per field — and skips re-fires for unrelated state.
    const unsub = useAppStore.subscribe(
      (state) => ({
        c: state.completedCourses,
        s: state.startedCourses,
        ctp: state.courseTestProgress,
        st: state.studyTime,
        tf: state.toolsFavourites,
        un: state.userName,
      }),
      () => queuePush(),
      { equalityFn: shallowEqual },
    );
    return () => {
      unsub();
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  // ─── 3. Drain queued payloads when connectivity returns ─────────
  // Background Sync API handles this for Chromium browsers; we run the
  // same logic on a vanilla `online` event so iOS Safari and Firefox
  // (which don't expose Background Sync) still recover queued writes.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const flush = async (payload: SyncPayload): Promise<boolean> => {
      try {
        const r = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return r.ok;
      } catch {
        return false;
      }
    };
    const tryFlush = () => {
      if (!navigator.onLine || !hasPendingSync()) return;
      flushSyncQueue(flush).catch(() => {});
    };
    // Initial flush at mount handles the "tab reopened after offline use" case
    tryFlush();
    window.addEventListener('online', tryFlush);

    // The Service Worker fires Background Sync; it can't read our queue
    // (localStorage isn't accessible from SW context) so it asks any live
    // client to flush. We listen and trigger the same drain.
    const onSwMessage = (e: MessageEvent) => {
      if (e.data?.type === 'SYNC_PROGRESS_FLUSH') tryFlush();
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    }
    return () => {
      window.removeEventListener('online', tryFlush);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
      }
    };
  }, []);
}

// Default store values for profile fields. A fresh-install device has these
// values before any user interaction. The pull-side merge must treat them as
// "not set by the user" and allow the server value to overwrite them —
// otherwise a user who set their name on device A would never see it on a
// freshly installed device B, because `!state.userName` evaluates to false
// when the default `'Студент'` is present.
const DEFAULT_USER_NAME = 'Студент';
const DEFAULT_LANGUAGE = 'Русский';

type SupabaseAuthLike = {
  getSession: () => Promise<{ data: { session: unknown } }>;
};

/**
 * getSession() can reject — e.g. AuthRetryableFetchError when it triggers a
 * token refresh over a flaky/offline network. It used to be awaited outside
 * any try/catch, and the caller invokes `pull()` bare (no `.catch()`), so a
 * rejection became an unhandled promise rejection on effectively every
 * authenticated page load or tab focus.
 */
export async function getSessionSafe(auth: SupabaseAuthLike): Promise<unknown> {
  try {
    const { data: { session } } = await auth.getSession();
    return session ?? null;
  } catch {
    return null;
  }
}

export interface ServerProfile {
  display_name?: string | null;
  email?: string | null;
  country?: string | null;
  specialty?: string | null;
  language?: string | null;
  goal?: string | null;
  status?: string | null;
}

/**
 * Merge a server-side profile row into local store fields.
 *
 * Rule: server value wins when local is empty OR still at the factory default.
 * This is the pull-side counterpart to the push's "local is source of truth"
 * strategy: on an existing device the user has already personalised their
 * profile (different from default), so we don't overwrite their choices;
 * on a fresh device the defaults signal "nothing set yet" and we adopt the
 * server value instead.
 *
 * Exported for unit testing; not intended as a public API.
 */
export function mergeProfileFromServer(
  state: Pick<AppState, 'userName' | 'userEmail' | 'userCountry' | 'userSpecialty' | 'userLanguage' | 'userGoal' | 'userStatus'>,
  profile: ServerProfile | null | undefined,
): Partial<AppState> {
  if (!profile) return {};
  const updates: Partial<AppState> = {};

  if (profile.display_name && (state.userName === '' || state.userName === DEFAULT_USER_NAME))
    updates.userName = profile.display_name;
  if (profile.email && !state.userEmail)
    updates.userEmail = profile.email;
  if (profile.country && !state.userCountry)
    updates.userCountry = profile.country;
  if (profile.specialty && !state.userSpecialty)
    updates.userSpecialty = profile.specialty;
  if (profile.language && (state.userLanguage === '' || state.userLanguage === DEFAULT_LANGUAGE))
    updates.userLanguage = profile.language;
  if (profile.goal && !state.userGoal)
    updates.userGoal = profile.goal;
  if (profile.status && !state.userStatus)
    updates.userStatus = profile.status;

  return updates;
}
