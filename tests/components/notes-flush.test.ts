/**
 * Regression test for `flushOutgoingNote` (lib/notes-flush.ts), used by
 * NotesPage's "flush in-flight edits before switching notes" effect.
 *
 * Bug: the cleanup effect wrote the flushed edit to localStorage but never
 * updated the in-memory `notes` React state. Switching notes within the
 * 500ms autosave debounce silently lost the edit: the next note's own
 * autosave fired from stale `notes` and overwrote localStorage, discarding
 * what was just flushed. This test locks in the pure list-transform the
 * fix relies on — the component wiring change (`setNotes(flushed)`) isn't
 * independently testable without a jsdom/RTL harness the repo doesn't have.
 */
import { describe, it, expect } from 'vitest';
import { flushOutgoingNote, type PersonalNote } from '@/lib/notes-flush';

function note(overrides: Partial<PersonalNote> = {}): PersonalNote {
  return {
    id: 'note-a',
    title: 'Original title',
    body: 'Original body',
    created: 1000,
    updated: 1000,
    tags: [],
    ...overrides,
  };
}

describe('flushOutgoingNote', () => {
  it('returns the list with the outgoing note replaced by the staged edit', () => {
    const list = [note(), note({ id: 'note-b', title: 'B', body: 'b-body' })];
    const out = flushOutgoingNote(list, 'note-a', 'Edited title', 'Edited body', 2000);
    expect(out).not.toBeNull();
    expect(out?.find((n) => n.id === 'note-a')).toEqual({
      id: 'note-a',
      title: 'Edited title',
      body: 'Edited body',
      created: 1000,
      updated: 2000,
      tags: [],
    });
    // Other notes are untouched (and same reference, so React state
    // updates elsewhere don't unnecessarily churn unrelated note objects).
    expect(out?.find((n) => n.id === 'note-b')).toBe(list[1]);
  });

  it('returns null when there is no outgoing note (nothing to flush)', () => {
    const list = [note()];
    expect(flushOutgoingNote(list, null, 'x', 'y', 2000)).toBeNull();
  });

  it('returns null when the outgoing note id is not found', () => {
    const list = [note()];
    expect(flushOutgoingNote(list, 'missing-id', 'x', 'y', 2000)).toBeNull();
  });

  it('returns null when the staged title/body match the stored note (no edit made)', () => {
    const list = [note()];
    const out = flushOutgoingNote(list, 'note-a', 'Original title', 'Original body', 2000);
    expect(out).toBeNull();
  });

  it('detects a title-only change', () => {
    const list = [note()];
    const out = flushOutgoingNote(list, 'note-a', 'New title', 'Original body', 2000);
    expect(out?.find((n) => n.id === 'note-a')?.title).toBe('New title');
  });
});
