/**
 * Regression test for `loadNotes` (components/notes/NotesPage.tsx).
 *
 * Bug: `loadNotes()` only guarded against a JSON.parse failure — it never
 * validated the parsed value's *shape*. If `localStorage['bordik-neonatal-notes']`
 * holds valid JSON that isn't an array (stale/foreign-format value under
 * the shared key, a corrupted write, `{}`, `null`, a lone object...),
 * `loadNotes()` returned it as-is. The page then crashes on the very
 * first render: `notes.find(...)` and `[...notes].sort(...)` both assume
 * an array and throw a TypeError on anything else.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

const store = new Map<string, string>();
vi.stubGlobal('window', {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
  },
});

import { loadNotes } from '@/components/notes/NotesPage';

const KEY = 'bordik-neonatal-notes';

describe('loadNotes', () => {
  beforeEach(() => store.clear());
  afterAll(() => vi.unstubAllGlobals());

  it('returns [] when nothing is stored', () => {
    expect(loadNotes()).toEqual([]);
  });

  it('returns the stored array of notes', () => {
    const notes = [{ id: '1', title: 't', body: 'b', created: 1, updated: 2, tags: [] }];
    store.set(KEY, JSON.stringify(notes));
    expect(loadNotes()).toEqual(notes);
  });

  it('returns [] instead of crashing when the stored value is a plain object', () => {
    store.set(KEY, JSON.stringify({}));
    expect(loadNotes()).toEqual([]);
  });

  it('returns [] instead of crashing when the stored value is null', () => {
    store.set(KEY, JSON.stringify(null));
    expect(loadNotes()).toEqual([]);
  });

  it('returns [] instead of crashing when the stored value is a foreign-format single object', () => {
    store.set(KEY, JSON.stringify({ legacyNote: 'from an older schema' }));
    expect(loadNotes()).toEqual([]);
  });

  it('returns [] on malformed JSON', () => {
    store.set(KEY, '{not valid json');
    expect(loadNotes()).toEqual([]);
  });

  it('the shape-guard is what keeps downstream array ops from throwing', () => {
    store.set(KEY, JSON.stringify({}));
    const notes = loadNotes();
    // Mirrors the exact operations NotesPage runs on mount/render.
    expect(() => notes.find((n) => n.id === 'x')).not.toThrow();
    expect(() => [...notes].sort((a, b) => b.updated - a.updated)).not.toThrow();
  });
});
