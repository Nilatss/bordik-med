/**
 * Tests for InlineQuiz's localStorage persistence (components/course/InlineQuiz.tsx).
 *
 * Two bugs being fixed, both in the self-check quiz's storage helpers:
 *   1. `saveState` called `localStorage.setItem` unguarded from the
 *      answer-click handler — private-mode Safari, a sandboxed iframe, or a
 *      full quota throws synchronously inside the onClick and crashes the
 *      quiz (the same bug class already fixed for TestPanel's lockout
 *      helpers, but InlineQuiz had the identical unguarded pattern).
 *   2. `loadState` returned the parsed JSON as-is with no shape check.
 *      `answers` seeds `useState` directly and downstream code does
 *      `Object.keys(answers)`, so a malformed/foreign stored value (e.g.
 *      `answers` missing or not an object) throws a TypeError on render.
 *
 * The module guards on `typeof window` and uses localStorage, so we stub
 * both before exercising it — same pattern as tests/components/sync-queue.test.ts.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

const store = new Map<string, string>();
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
});

import { loadState, saveState } from '@/components/course/InlineQuiz';

const COURSE_ID = 'test-course';
const KEY = `bordik:selfcheck:${COURSE_ID}`;

describe('InlineQuiz storage', () => {
  beforeEach(() => store.clear());
  afterAll(() => vi.unstubAllGlobals());

  it('round-trips a valid saved state', () => {
    saveState(COURSE_ID, { lastAt: Date.now(), answers: { 1: 'A' } });
    const loaded = loadState(COURSE_ID);
    expect(loaded.answers).toEqual({ 1: 'A' });
  });

  it('returns default state when nothing is saved', () => {
    expect(loadState(COURSE_ID)).toEqual({ lastAt: 0, answers: {} });
  });

  it('does not throw when localStorage.setItem throws (private mode / quota)', () => {
    store.set('__throw__', '1'); // sentinel, unused — just proves store isn't touched
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: () => { throw new Error('QuotaExceededError'); },
      removeItem: (k: string) => { store.delete(k); },
    });
    expect(() => saveState(COURSE_ID, { lastAt: Date.now(), answers: { 1: 'A' } })).not.toThrow();
    // restore the working stub for subsequent tests
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    });
  });

  it('does not throw when localStorage.getItem throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('SecurityError'); },
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    });
    expect(() => loadState(COURSE_ID)).not.toThrow();
    expect(loadState(COURSE_ID)).toEqual({ lastAt: 0, answers: {} });
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    });
  });

  it('falls back to empty answers when the stored `answers` field is missing/malformed', () => {
    store.set(KEY, JSON.stringify({ lastAt: Date.now() })); // no `answers` field at all
    expect(() => loadState(COURSE_ID)).not.toThrow();
    expect(loadState(COURSE_ID).answers).toEqual({});
  });

  it('falls back to empty answers when `answers` is the wrong type', () => {
    store.set(KEY, JSON.stringify({ lastAt: Date.now(), answers: 'not-an-object' }));
    expect(loadState(COURSE_ID).answers).toEqual({});
  });

  it('resets to defaults once the 24h cooldown has elapsed', () => {
    const dayAndAHalfAgo = Date.now() - 36 * 60 * 60 * 1000;
    store.set(KEY, JSON.stringify({ lastAt: dayAndAHalfAgo, answers: { 1: 'A' } }));
    expect(loadState(COURSE_ID)).toEqual({ lastAt: 0, answers: {} });
  });
});
