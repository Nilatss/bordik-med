'use client';

/**
 * Full client-side logout. Cleans every layer that could leak the
 * previous user's data on a shared device:
 *
 *   1. Supabase session (revokes refresh token globally)
 *   2. Zustand persist (localStorage key)
 *   3. localStorage + sessionStorage (catch-all)
 *   4. IndexedDB (Serwist offline DB, supabase realtime, mediapipe model cache)
 *   5. Cache Storage (PWA runtime caches)
 *   6. Service Worker registrations (so the next page load gets a fresh SW)
 *   7. Force navigation to '/' to discard in-memory state
 *
 * Call from UserMenu.signOut, ProfilePage.deleteAccount, and any other
 * "leave" surface. Idempotent — safe to call multiple times.
 *
 * Order matters: signOut MUST go first so the network request still has
 * the auth cookie. Cache cleanup goes last so a failed earlier step does
 * not strand cached data with a still-logged-in token.
 */

import { getSupabaseBrowserClient } from './supabase/client';

const ZUSTAND_PERSIST_KEYS = [
  'ironmed-progress',
  'bordik-progress',
  'bordik-sync-queue-v1',
  'castar-biometric-lock',
];

// P1-UX-1 — Safari/iOS doesn't implement IDBFactory.databases() (returns
// []); we still need to wipe IDBs we know about. Maintain this list as
// the app evolves.
const KNOWN_IDB_NAMES = [
  'localforage',
  'firebaseLocalStorageDb',
  'serwist-precache-v1',
  'serwist-runtime-v1',
  'castar-biometric',
  'ironmed-offline-queue',
  'bordik-offline-queue',
];

async function deleteDb(name: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(name);
    // Resolve in all 3 cases — failure to delete one DB shouldn't block
    // the rest of the logout flow.
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}

export async function fullLogout(): Promise<void> {
  // 1. Revoke session globally (kills all sessions on all devices).
  // P1-UX-3 — when offline, signOut fails silently and the server
  // refresh-token outlives the local wipe. Register a Background Sync
  // tag so the SW can retry the global signOut once we're back online.
  try {
    const sb = getSupabaseBrowserClient();
    if (sb) {
      await sb.auth.signOut({ scope: 'global' });
    }
  } catch (err) {
    console.warn('[fullLogout] supabase signOut failed (likely offline)', err);
    try {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const reg = await navigator.serviceWorker.ready;
        const sync = (reg as ServiceWorkerRegistration & {
          sync?: { register: (tag: string) => Promise<void> };
        }).sync;
        await sync?.register('logout-retry');
      }
    } catch {/* SyncManager unsupported (Safari) — best effort only */}
  }

  // 2. Drop our explicit Zustand persist keys + 3. clear all storage.
  try {
    for (const k of ZUSTAND_PERSIST_KEYS) {
      try { localStorage.removeItem(k); } catch {/* */}
    }
    localStorage.clear();
    sessionStorage.clear();
  } catch (err) {
    console.warn('[fullLogout] storage clear failed', err);
  }

  // 4. Wipe IndexedDB. P1-UX-1: Safari/iOS doesn't implement
  // databases() — fall back to KNOWN_IDB_NAMES so we still nuke the
  // ones we created.
  try {
    let names: string[] = [];
    if ('databases' in indexedDB) {
      try {
        const dbs = await indexedDB.databases();
        names = dbs.map((d) => d.name).filter((n): n is string => Boolean(n));
      } catch { names = []; }
    }
    if (names.length === 0) {
      names = KNOWN_IDB_NAMES;
    }
    await Promise.all(names.map((n) => deleteDb(n)));
  } catch (err) {
    console.warn('[fullLogout] indexedDB wipe failed', err);
  }

  // 5. Cache Storage (PWA runtime caches managed by Serwist).
  try {
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    }
  } catch (err) {
    console.warn('[fullLogout] cache clear failed', err);
  }

  // 6. Unregister service worker registrations. P1-UX-2: wait for
  // controllerchange so in-flight fetches the SW could reply to are
  // flushed before we navigate away. 2s safety timeout caps the wait.
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      if (navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          const safetyTimer = setTimeout(resolve, 2000);
          const onChange = () => {
            clearTimeout(safetyTimer);
            resolve();
          };
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            onChange,
            { once: true },
          );
        });
      }
    }
  } catch (err) {
    console.warn('[fullLogout] SW unregister failed', err);
  }

  // 7. Force a full navigation. `replace` so back-button can't go back to
  // the logged-in state.
  try {
    location.replace('/');
  } catch {
    location.href = '/';
  }
}
