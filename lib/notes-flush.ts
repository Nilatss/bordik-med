/**
 * Pure helper for NotesPage's "flush in-flight edits on note switch" logic
 * (components/notes/NotesPage.tsx). Extracted so the list-transform can be
 * unit-tested without a jsdom/React render harness.
 */

export interface PersonalNote {
  id: string;
  title: string;
  body: string;
  created: number;
  updated: number;
  tags: string[];
}

/**
 * Returns `list` with the outgoing note's title/body replaced by the
 * staged (in-progress, not-yet-debounced) edit, or `null` if there is
 * nothing to flush (no outgoing note, note not found, or unchanged).
 */
export function flushOutgoingNote(
  list: PersonalNote[],
  outgoingId: string | null,
  stagedTitle: string,
  stagedBody: string,
  now: number,
): PersonalNote[] | null {
  if (!outgoingId) return null;
  const target = list.find((n) => n.id === outgoingId);
  if (!target) return null;
  if (target.title === stagedTitle && target.body === stagedBody) return null;
  return list.map((n) =>
    n.id === outgoingId ? { ...n, title: stagedTitle, body: stagedBody, updated: now } : n,
  );
}
