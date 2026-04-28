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

export async function fullLogout(): Promise<void> {
  // 1. Revoke session globally (kills all sessions on all devices for this user).
  try {
    const sb = getSupabaseBrowserClient();
    if (sb) {
      await sb.auth.signOut({ scope: 'global' });
    }
  } catch (err) {
    console.warn('[fullLogout] supabase signOut failed', err);
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

  // 4. Wipe IndexedDB. databases() is supported in modern Chromium/Firefox/Safari.
  try {
    if ('databases' in indexedDB) {
      const dbs: { name?: string }[] = await indexedDB.databases();
      await Promise.all(
        dbs.map((d) => d.name
          ? new Promise<void>((resolve) => {
              const req = indexedDB.deleteDatabase(d.name!);
              req.onsuccess = () => resolve();
              req.onerror = () => resolve();
              req.onblocked = () => resolve();    // proceed even if blocked
            })
          : Promise.resolve(),
        ),
      );
    }
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

  // 6. Unregister service worker registrations - next visit gets a fresh
  // SW, no chance of cached auth-coupled responses leaking.
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
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
