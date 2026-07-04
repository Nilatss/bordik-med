'use client';

/**
 * NotesPage — top-level personal notes section.
 *
 * Was previously inside `/neonatology` (audit G2 / personal notes), but
 * extracted to a top-level entry per user feedback ("вынеси как отдельный
 * раздел мои заметки, он не должен быть привязан к неонатологии").
 *
 * Storage: localStorage ("bordik-neonatal-notes" key kept for backward
 * compatibility with existing user data).
 *
 * Visual: matches Bordik design system used in NeonatalHandbook + Profile
 * pages — section header pill, white cards with subtle shadow, mono
 * meta labels, F5F6F8 neutral surface backgrounds.
 */

import { useState, useEffect, useMemo, useRef } from 'react';

interface PersonalNote {
  id: string;
  title: string;
  body: string;
  created: number;
  updated: number;
  tags: string[];
}

// Exported for unit testing; not intended as a public API.
export function loadNotes(): PersonalNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('bordik-neonatal-notes');
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // A parse that succeeds but isn't an array (stale/foreign-format value
    // under this shared-key, corrupted write, `{}`, `null`...) would crash
    // the page below on the very first render — `notes.find(...)` and
    // `[...notes].sort(...)` both assume an array.
    return Array.isArray(parsed) ? (parsed as PersonalNote[]) : [];
  } catch { return []; }
}

function saveNotes(notes: PersonalNote[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('bordik-neonatal-notes', JSON.stringify(notes)); } catch { /* ignore */ }
}

/** Format updated-at timestamp into a human-friendly relative label. */
function formatRelative(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const day = 24 * 60 * 60 * 1000;
  if (diff < 60 * 1000) return 'только что';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} мин назад`;
  if (diff < day) return `${Math.floor(diff / 3600000)} ч назад`;
  if (diff < 2 * day) return 'вчера';
  if (diff < 7 * day) return `${Math.floor(diff / day)} дн назад`;
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

/** Strip markdown / leading whitespace and trim to 80 chars for the list preview. */
function previewSnippet(body: string): string {
  const cleaned = body
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[*_`>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 80 ? `${cleaned.slice(0, 80)}…` : cleaned;
}

function wordCount(body: string): number {
  const trimmed = body.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<PersonalNote[]>(() => loadNotes());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingBody, setEditingBody] = useState('');
  const [query, setQuery] = useState('');

  const activeNote = notes.find((n) => n.id === activeId);

  // Audit B-4: silent data-loss fix. Mirror the editing state into refs
  // so the cleanup effect on activeId change can flush the buffer
  // independent of the debounce timer. Without this, switching to
  // another note before the 500 ms debounce fires drops the in-flight
  // edits — the cleanup `clearTimeout()` cancels the save, then the
  // following effect re-seeds editingTitle/Body from the new note.
  const editingTitleRef = useRef(editingTitle);
  const editingBodyRef = useRef(editingBody);
  const activeIdRef = useRef<string | null>(activeId);
  const notesRef = useRef(notes);
  editingTitleRef.current = editingTitle;
  editingBodyRef.current = editingBody;
  activeIdRef.current = activeId;
  notesRef.current = notes;

  useEffect(() => {
    if (activeNote) {
      setEditingTitle(activeNote.title);
      setEditingBody(activeNote.body);
    }
  }, [activeId, activeNote]);

  const createNew = () => {
    const id = `note-${Date.now()}`;
    const note: PersonalNote = {
      id,
      title: 'Новая заметка',
      body: '',
      created: Date.now(),
      updated: Date.now(),
      tags: [],
    };
    const next = [note, ...notes];
    setNotes(next);
    saveNotes(next);
    setActiveId(id);
    setEditingTitle(note.title);
    setEditingBody(note.body);
  };

  const saveCurrent = () => {
    if (!activeNote) return;
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? { ...n, title: editingTitle, body: editingBody, updated: Date.now() }
        : n,
    );
    setNotes(updated);
    saveNotes(updated);
  };

  const deleteCurrent = () => {
    if (!activeNote) return;
    const filtered = notes.filter((n) => n.id !== activeNote.id);
    setNotes(filtered);
    saveNotes(filtered);
    setActiveId(null);
  };

  // Audit B-4: auto-save on body/title change with debounce.
  // saveCurrent intentionally omitted from deps — it closes over the
  // latest editingTitle/Body via render; the debounce captures the
  // values at fire time. Stable identity not required here.
  useEffect(() => {
    if (!activeNote) return;
    const t = setTimeout(() => saveCurrent(), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce
  }, [editingTitle, editingBody]);

  // Audit B-4: flush in-flight edits before switching to another note.
  useEffect(() => {
    const outgoingId = activeId;
    return () => {
      if (!outgoingId) return;
      const stagedTitle = editingTitleRef.current;
      const stagedBody = editingBodyRef.current;
      const list = notesRef.current;
      const target = list.find((n) => n.id === outgoingId);
      if (!target) return;
      if (target.title === stagedTitle && target.body === stagedBody) return;
      const flushed = list.map((n) =>
        n.id === outgoingId
          ? { ...n, title: stagedTitle, body: stagedBody, updated: Date.now() }
          : n,
      );
      saveNotes(flushed);
    };
  }, [activeId]);

  // Filtered + sorted notes for the list. Sort by updated desc so the
  // most recently touched note is always at the top.
  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...notes].sort((a, b) => b.updated - a.updated);
    if (!q) return sorted;
    return sorted.filter((n) =>
      n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    );
  }, [notes, query]);

  return (
    // Page wrapper matches NeonatalHandbook's grid — 980 px max centered,
    // no narrower `--content-max` (720 px) column. The surrounding `<main>`
    // already has `.app-main-inner` padding 20×24 px, so we just need the
    // outer max + horizontal centring here. Header text + subtitle inherit
    // the full width and wrap naturally; the editor card below gets a
    // comfortable ~680 px to itself once the 288 px list takes its column.
    <div className="w-full max-w-[980px] mx-auto">
      {/* ───── Header — section pill + title + subtitle ─────────────── */}
      <div className="mb-[22px]">
        <p className="font-[var(--font-mono)] text-[10.5px] font-bold tracking-[0.08em] uppercase text-[#9CA3AF] mt-0 mb-2">
          Личное
        </p>
        <h1 className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-1.5 mt-0">
          Мои заметки
        </h1>
        <p className="font-[var(--font-body)] text-sm text-[#6B7280] m-0 leading-[1.5] max-w-[640px]">
          Личные заметки — клинические наблюдения, ссылки, кастомные подсказки.
          Хранятся локально в браузере; синхронизация между устройствами скоро.
        </p>
      </div>

      {notes.length === 0 && !activeId ? (
        // ─────────────────────── EMPTY STATE ──────────────────────────
        <div className="bg-[#F5F6F8] rounded-[14px] py-14 px-6 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] flex items-center justify-center mb-4">
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
              stroke="#1A1A1A" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1={9} y1={13} x2={15} y2={13} />
              <line x1={9} y1={17} x2={13} y2={17} />
            </svg>
          </div>
          <div className="font-[var(--font-display)] text-lg font-bold text-[#1A1A1A] mb-1.5">
            Пока нет заметок
          </div>
          <p className="mx-auto mb-5 max-w-[440px] text-[13.5px] leading-[1.55] text-[#6B7280]">
            Создайте заметку для записи клинических наблюдений, ссылок и
            кастомных подсказок — что-то, к чему хочется вернуться.
          </p>
          <button
            type="button"
            onClick={createNew}
            className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#0F172A] hover:bg-[#1E293B] text-white border-0 rounded-full cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-colors"
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1={12} y1={5} x2={12} y2={19} />
              <line x1={5} y1={12} x2={19} y2={12} />
            </svg>
            Создать первую заметку
          </button>
        </div>
      ) : (
        <>
          {/* ─── Toolbar — count + search + new ─────────────────────── */}
          <div className="flex items-center justify-between gap-3 mb-[14px] flex-wrap">
            <p className="text-[13px] text-[#6B7280] m-0">
              Всего заметок: <strong className="text-[#1A1A1A] font-semibold">{notes.length}</strong>
              {query.trim() && (
                <>
                  {' · '}
                  <span className="text-[#9CA3AF]">
                    найдено: <strong className="text-[#1A1A1A] font-semibold">{filteredNotes.length}</strong>
                  </span>
                </>
              )}
              {!query.trim() && (
                <>
                  {' · '}
                  <span className="text-[#9CA3AF]">
                    хранятся локально в браузере
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={createNew}
              className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white border-0 rounded-full cursor-pointer font-[var(--font-body)] text-xs font-semibold transition-colors shrink-0"
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1={12} y1={5} x2={12} y2={19} />
                <line x1={5} y1={12} x2={19} y2={12} />
              </svg>
              Новая заметка
            </button>
          </div>

          {/* ─── Main split: list + editor ─────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-[288px_1fr] gap-[14px] min-h-[460px]">
            {/* ─── Notes list with search ─────────────────────────── */}
            <div className="bg-white border border-[#E5E7EB] rounded-[14px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_6px_rgba(16,24,40,0.04)] flex flex-col overflow-hidden">
              {/* Search input — sticky top of list */}
              <div className="p-2.5 border-b border-[#F0F1F5] bg-white">
                <div className="relative">
                  <svg
                    width={13} height={13} viewBox="0 0 24 24" fill="none"
                    stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <circle cx={11} cy={11} r={8} />
                    <line x1={21} y1={21} x2={16.65} y2={16.65} />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск по заметкам"
                    aria-label="Поиск по заметкам"
                    className="w-full pl-8 pr-3 py-2 bg-[#F5F6F8] border-0 rounded-[8px] outline-none font-[var(--font-body)] text-[12.5px] text-[#1A1A1A] placeholder:text-[#9CA3AF]"
                  />
                </div>
              </div>

              {/* Note cards */}
              <div className="flex-1 overflow-y-auto p-1.5">
                {filteredNotes.length === 0 ? (
                  <div className="py-8 px-3 text-center text-[12.5px] text-[#9CA3AF] leading-[1.5]">
                    {query.trim() ? 'Заметок по запросу не найдено.' : 'Список пуст.'}
                  </div>
                ) : (
                  filteredNotes.map((n) => {
                    const isActive = n.id === activeId;
                    const snippet = previewSnippet(n.body);
                    const title = n.title.trim() || '(без названия)';
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setActiveId(n.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`block w-full text-left py-2.5 px-3 mb-0.5 border-0 cursor-pointer rounded-[10px] font-[inherit] transition-[background-color] duration-150 ${
                          isActive
                            ? 'bg-[#F0F1F5]'
                            : 'bg-transparent hover:bg-[#F8F9FB]'
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <span
                            className={`text-[13px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-1 ${
                              isActive ? 'text-[#0F172A]' : 'text-[#1A1A1A]'
                            }`}
                          >
                            {title}
                          </span>
                          <span className="font-[var(--font-mono)] text-[10px] text-[#9CA3AF] tracking-[0.02em] shrink-0">
                            {formatRelative(n.updated)}
                          </span>
                        </div>
                        {snippet && (
                          <div className="text-[11.5px] text-[#6B7280] leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                            {snippet}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ─── Editor panel ──────────────────────────────────── */}
            <div className="bg-white border border-[#E5E7EB] rounded-[14px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_6px_rgba(16,24,40,0.04)] flex flex-col overflow-hidden">
              {activeNote ? (
                <>
                  {/* Header row — meta + delete */}
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[#F0F1F5]">
                    <span className="font-[var(--font-mono)] text-[10.5px] font-bold tracking-[0.06em] uppercase text-[#9CA3AF]">
                      Заметка · обновлено {formatRelative(activeNote.updated)}
                    </span>
                    <button
                      type="button"
                      onClick={deleteCurrent}
                      aria-label="Удалить заметку"
                      className="inline-flex items-center gap-1.5 py-1.5 px-2.5 bg-transparent hover:bg-[#FEF2F2] text-[#6B7280] hover:text-[#B91C1C] border-0 rounded-full cursor-pointer font-[var(--font-body)] text-[11.5px] font-semibold transition-colors"
                    >
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                        <line x1={10} y1={11} x2={10} y2={17} />
                        <line x1={14} y1={11} x2={14} y2={17} />
                      </svg>
                      Удалить
                    </button>
                  </div>

                  {/* Title input + body textarea */}
                  <div className="flex flex-col gap-2 p-4">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      aria-label="Заголовок заметки"
                      placeholder="Заголовок"
                      className="w-full py-2 px-3 bg-[#F5F6F8] border-0 rounded-[10px] font-[var(--font-display)] text-[19px] font-bold text-[#1A1A1A] tracking-[-0.015em] outline-none placeholder:text-[#9CA3AF] placeholder:font-medium"
                    />
                    <textarea
                      value={editingBody}
                      onChange={(e) => setEditingBody(e.target.value)}
                      aria-label="Содержимое заметки"
                      placeholder="Введите содержимое заметки. Поддерживается plain text + Markdown (#, ##, **жирный**, списки)..."
                      className="w-full min-h-[420px] py-3 px-[14px] bg-[#F5F6F8] border-0 rounded-[10px] font-[var(--font-body)] text-[14px] leading-[1.6] text-[#1F2937] resize-y outline-none placeholder:text-[#9CA3AF]"
                    />
                  </div>

                  {/* Footer — char count + autosave indicator */}
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-[#F0F1F5] bg-[#FAFBFC]">
                    <span className="font-[var(--font-mono)] text-[10.5px] text-[#9CA3AF] tracking-[0.02em]">
                      {wordCount(editingBody)} слов · {editingBody.length} символов
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-[var(--font-mono)] text-[10.5px] text-[#10B981] tracking-[0.02em] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
                      Автосохранение
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#F5F6F8] flex items-center justify-center mb-3.5">
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
                      stroke="#9CA3AF" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="font-[var(--font-display)] text-[15px] font-bold text-[#1A1A1A] mb-1">
                    Выберите заметку
                  </div>
                  <p className="text-[12.5px] text-[#6B7280] leading-[1.5] max-w-[280px] m-0">
                    Кликните по заметке в списке слева или создайте новую кнопкой «+ Новая заметка».
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
