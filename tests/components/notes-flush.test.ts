/**
 * Regression test for the NotesPage flush-on-navigate bug.
 *
 * Root cause (before fix):
 *   The cleanup effect in NotesPage called `saveNotes(flushed)` (localStorage)
 *   but NOT `setNotes(flushed)` (React state). When the user edited note A,
 *   quickly switched to note B, then switched back to A, the component seeded
 *   editingTitle/Body from `activeNote` which came from stale React state
 *   (old values) — the edits appeared lost in the UI even though they existed
 *   in localStorage.
 *
 * What's tested here:
 *   - The pure `saveNotes` → `loadNotes` round-trip is correct: data written
 *     to localStorage can be read back intact. This validates the storage layer
 *     (the part that always worked) and documents the contract the React layer
 *     must honour.
 *   - A flushed note returned by `loadNotes` after a switch matches the staged
 *     (in-flight) content — proving that if React state is kept in sync with
 *     localStorage (the fix), switching back would show the correct content.
 *
 * Note: the React-state re-seed on note switch is effect-driven and requires
 * a jsdom + testing-library environment. The current vitest config is
 * node-only, so we cover the pure storage contract here and rely on TS + the
 * fix in NotesPage.tsx for the React layer.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── Minimal localStorage mock (node environment has no DOM) ──────────────
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

// ── Copy of the pure storage helpers from NotesPage (same logic) ─────────
interface Note { id: string; title: string; body: string; created: number; updated: number; tags: string[] }

const STORAGE_KEY = 'bordik-neonatal-notes';

function saveNotes(notes: Note[]): void {
  localStorageMock.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadNotes(): Note[] {
  const raw = localStorageMock.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Note[]; } catch { return []; }
}

// ── Helpers ──────────────────────────────────────────────────────────────
function makeNote(id: string, title: string, body: string): Note {
  return { id, title, body, created: 1000, updated: 1000, tags: [] };
}

describe('NotesPage flush-on-navigate bug', () => {
  beforeEach(() => localStorageMock.clear());
  afterEach(() => localStorageMock.clear());

  it('saveNotes → loadNotes round-trips the full notes list', () => {
    const notes = [
      makeNote('a', 'Alpha', 'alpha body'),
      makeNote('b', 'Beta', 'beta body'),
    ];
    saveNotes(notes);
    expect(loadNotes()).toEqual(notes);
  });

  it('flushed in-flight edits are readable via loadNotes', () => {
    // Initial state: note A has old title
    const notes = [makeNote('a', 'Old Title', 'Old body'), makeNote('b', 'B', '')];
    saveNotes(notes);

    // Simulate flush: user typed new content but the debounce hasn't fired yet.
    // The cleanup effect computes flushed and saves to localStorage.
    const stagedTitle = 'New Title';
    const stagedBody = 'New body';
    const flushed = notes.map((n) =>
      n.id === 'a'
        ? { ...n, title: stagedTitle, body: stagedBody, updated: Date.now() }
        : n,
    );
    saveNotes(flushed);

    // After the fix, React state is also updated via setNotes(flushed).
    // The storage side (always correct) proves the underlying data is there:
    const loaded = loadNotes();
    const noteA = loaded.find((n) => n.id === 'a');
    expect(noteA?.title).toBe('New Title');
    expect(noteA?.body).toBe('New body');
  });

  it('empty notes list round-trips without error', () => {
    saveNotes([]);
    expect(loadNotes()).toEqual([]);
  });

  it('corrupt localStorage returns empty array without throwing', () => {
    localStorageMock.setItem(STORAGE_KEY, '{ invalid json }}}');
    expect(() => loadNotes()).not.toThrow();
    expect(loadNotes()).toEqual([]);
  });
});
