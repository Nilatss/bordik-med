/**
 * Persistent storage helpers for InlineQuiz (self-check) answers.
 *
 * localStorage can throw in two real scenarios:
 *   1. QuotaExceededError when the browser storage quota is full.
 *   2. SecurityError when localStorage is blocked by browser policy
 *      (common in Firefox strict-privacy mode and sandboxed iframes).
 *
 * All write / delete helpers swallow these errors rather than propagating
 * them out of the React event handler — losing one quiz answer is far
 * better than crashing the whole quiz component.
 */

export interface SavedState {
  lastAt: number;
  answers: Record<number, string>;
}

/** 24-hour cooldown before a new attempt is allowed. */
export const INLINE_QUIZ_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function storageKey(courseId: string): string {
  return `bordik:selfcheck:${courseId}`;
}

export function loadInlineQuizState(courseId: string): SavedState {
  if (typeof window === 'undefined') return { lastAt: 0, answers: {} };
  try {
    const raw = localStorage.getItem(storageKey(courseId));
    if (!raw) return { lastAt: 0, answers: {} };
    const parsed = JSON.parse(raw) as SavedState;
    if (!parsed.lastAt || Date.now() - parsed.lastAt > INLINE_QUIZ_COOLDOWN_MS) {
      return { lastAt: 0, answers: {} };
    }
    return parsed;
  } catch {
    return { lastAt: 0, answers: {} };
  }
}

export function saveInlineQuizState(courseId: string, state: SavedState): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(storageKey(courseId), JSON.stringify(state)); } catch { /* quota / blocked */ }
}

export function clearInlineQuizState(courseId: string): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(storageKey(courseId)); } catch { /* storage blocked */ }
}
