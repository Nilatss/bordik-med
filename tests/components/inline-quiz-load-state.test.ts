/**
 * Regression tests for `loadState` in components/course/InlineQuiz.tsx.
 *
 * Bug: `JSON.parse(raw) as SavedState` was an unchecked cast. If the stored
 * blob had `lastAt` but no `answers` (e.g. a partially-written entry or
 * future schema change), `loadState` returned `{ lastAt: n, answers: undefined }`.
 * The caller initialised `useState` with `.answers` → `undefined`, and three
 * subsequent `Object.keys(answers)` calls on lines 340/395/408 threw:
 *   TypeError: Cannot convert undefined or null to object
 *
 * Fix: validate `parsed.answers` is a non-null, non-array plain object;
 * fall back to `{}` when the guard fails.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

const store = new Map<string, string>();
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
});

// Import after globals are stubbed so the SSR guard (`typeof window === 'undefined'`)
// passes correctly inside the module.
import { loadState } from '@/components/course/InlineQuiz';

const KEY = (id: string) => `bordik:selfcheck:${id}`;
const VALID_LAST_AT = Date.now() - 1000; // 1 second ago — within the 24h cooldown

describe('loadState', () => {
  beforeEach(() => store.clear());
  afterAll(() => vi.unstubAllGlobals());

  it('returns empty answers when localStorage has no entry', () => {
    const s = loadState('course-1');
    expect(s.answers).toEqual({});
    expect(s.lastAt).toBe(0);
  });

  it('returns empty answers when stored blob has valid lastAt but missing answers field', () => {
    // This is the crash scenario: `answers` is absent → was returning undefined.
    store.set(KEY('course-1'), JSON.stringify({ lastAt: VALID_LAST_AT }));
    const s = loadState('course-1');
    expect(s.answers).toEqual({});
    expect(s.lastAt).toBe(VALID_LAST_AT);
  });

  it('returns empty answers when stored answers is null', () => {
    store.set(KEY('course-1'), JSON.stringify({ lastAt: VALID_LAST_AT, answers: null }));
    const s = loadState('course-1');
    expect(s.answers).toEqual({});
  });

  it('returns empty answers when stored answers is an array (type mismatch)', () => {
    store.set(KEY('course-1'), JSON.stringify({ lastAt: VALID_LAST_AT, answers: [1, 2, 3] }));
    const s = loadState('course-1');
    expect(s.answers).toEqual({});
  });

  it('returns empty answers when stored answers is a string', () => {
    store.set(KEY('course-1'), JSON.stringify({ lastAt: VALID_LAST_AT, answers: 'corrupt' }));
    const s = loadState('course-1');
    expect(s.answers).toEqual({});
  });

  it('preserves valid answers from a well-formed blob', () => {
    const answers = { 1: 'A', 2: 'C', 3: 'B' };
    store.set(KEY('course-1'), JSON.stringify({ lastAt: VALID_LAST_AT, answers }));
    const s = loadState('course-1');
    expect(s.answers).toEqual(answers);
    expect(s.lastAt).toBe(VALID_LAST_AT);
  });

  it('resets when lastAt is expired (> 24h ago)', () => {
    const old = Date.now() - 25 * 60 * 60 * 1000;
    store.set(KEY('course-1'), JSON.stringify({ lastAt: old, answers: { 1: 'A' } }));
    const s = loadState('course-1');
    expect(s.lastAt).toBe(0);
    expect(s.answers).toEqual({});
  });

  it('resets when lastAt is 0', () => {
    store.set(KEY('course-1'), JSON.stringify({ lastAt: 0, answers: { 1: 'A' } }));
    const s = loadState('course-1');
    expect(s.lastAt).toBe(0);
    expect(s.answers).toEqual({});
  });

  it('returns empty state for completely malformed JSON', () => {
    store.set(KEY('course-1'), 'not json {{{{');
    const s = loadState('course-1');
    expect(s.answers).toEqual({});
    expect(s.lastAt).toBe(0);
  });
});
