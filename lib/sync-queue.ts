'use client';

/**
 * Tiny offline-first queue for `/api/sync` payloads.
 *
 * Why not Dexie / IndexedDB right now: the queue carries a single
 * collapsed payload (latest delta, idempotent on the server), so a
 * primitive localStorage cell is enough. Swapping for Dexie/RxDB later
 * is a one-file change - the public API (enqueue/flush/clear) stays.
 *
 * Background Sync API is used when supported (Chrome/Edge/Samsung).
 * iOS Safari falls back to the `online` event listener wired in the
 * client hook. Either path eventually drains the queue.
 */

const KEY = 'bordik-sync-queue-v1';

export type SyncPayload = unknown;

interface QueueEntry {
  ts: number;
  payload: SyncPayload;
}

function readQueue(): QueueEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueueEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueueEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {
    /* quota - silently drop oldest */
    try {
      localStorage.setItem(KEY, JSON.stringify(q.slice(-10)));
    } catch {/* give up */}
  }
}

/** Enqueue a payload. Collapses with the previous entry (server is
 *  idempotent on full state, so we only need the LATEST). */
export function enqueueSync(payload: SyncPayload): void {
  const q = readQueue();
  q.length = 0;                         // collapse - keep only latest
  q.push({ ts: Date.now(), payload });
  writeQueue(q);
}

export function hasPendingSync(): boolean {
  return readQueue().length > 0;
}

/** Try to drain the queue. Calls fetcher per entry; on success removes it. */
export async function flushSyncQueue(
  fetcher: (payload: SyncPayload) => Promise<boolean>,
): Promise<{ sent: number; failed: number }> {
  const q = readQueue();
  if (q.length === 0) return { sent: 0, failed: 0 };
  let sent = 0;
  let failed = 0;
  const remaining: QueueEntry[] = [];
  for (const entry of q) {
    try {
      const ok = await fetcher(entry.payload);
      if (ok) sent++;
      else { failed++; remaining.push(entry); }
    } catch {
      failed++;
      remaining.push(entry);
    }
  }
  writeQueue(remaining);
  return { sent, failed };
}

/** Register a one-shot Background Sync. No-op on browsers without support
 *  (iOS Safari, Firefox); the `online` listener in the hook covers them. */
export async function requestBackgroundSync(tag = 'sync-progress'): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const swReg = reg as ServiceWorkerRegistration & {
      sync?: { register: (tag: string) => Promise<void> };
    };
    if (swReg.sync) {
      await swReg.sync.register(tag);
      return true;
    }
  } catch {/* fallback to manual */}
  return false;
}
