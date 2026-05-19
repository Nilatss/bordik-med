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
 */

import { useState, useEffect, useRef } from 'react';

interface PersonalNote {
  id: string;
  title: string;
  body: string;
  created: number;
  updated: number;
  tags: string[];
}

function loadNotes(): PersonalNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('bordik-neonatal-notes');
    if (!raw) return [];
    return JSON.parse(raw) as PersonalNote[];
  } catch { return []; }
}

function saveNotes(notes: PersonalNote[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem('bordik-neonatal-notes', JSON.stringify(notes)); } catch { /* ignore */ }
}

export default function NotesPage() {
  const [notes, setNotes] = useState<PersonalNote[]>(() => loadNotes());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingBody, setEditingBody] = useState('');

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
  // Pre-fix scenario:
  //   1. User types in note A.
  //   2. Within 500 ms debounce window, clicks note B.
  //   3. The debounce-save effect's cleanup runs → clearTimeout cancels
  //      save A.
  //   4. The activeId/activeNote effect re-seeds editingTitle/Body from B.
  //   5. Edits to A are silently lost — localStorage still has the old
  //      version, no diff history.
  // Cleanup writes the staged buffer for the OUTGOING note (captured via
  // closure at effect mount) directly to localStorage. We can't safely
  // call setState during cleanup (the next render is already mounting),
  // but localStorage is fine and a future loadNotes() picks it up.
  // editingTitle/Body are read via refs because they reflect the LATEST
  // values at cleanup time, not the values when this effect first ran.
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

  return (
    <div className="w-full max-w-[var(--content-max)] mx-auto">
      <div className="mb-[22px]">
        <h1 className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] tracking-[-0.02em] mb-1 mt-0">
          Мои заметки
        </h1>
        <p className="font-[var(--font-body)] text-sm text-[#6B7280] m-0 leading-[1.5]">
          Личные заметки — клинические наблюдения, ссылки, кастомные подсказки.
          Хранятся локально в браузере.
        </p>
      </div>

      {notes.length === 0 && !activeId ? (
        <div className="py-10 px-5 bg-[#F5F6F8] rounded-[14px] text-center text-[#6B7280]">
          <div className="font-[var(--font-display)] text-[17px] font-bold text-[#1A1A1A] mb-2">
            Пока нет заметок
          </div>
          <p className="mx-auto mb-[18px] max-w-[460px] text-[13.5px] leading-[1.55]">
            Создайте заметку для записи клинических наблюдений, ссылок,
            кастомных подсказок.
          </p>
          <button
            type="button"
            onClick={createNew}
            className="py-2.5 px-5 bg-[#1A1A1A] text-white border-none rounded-full cursor-pointer font-[var(--font-body)] text-[13px] font-semibold"
          >
            Создать первую заметку
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2.5 mb-[14px] flex-wrap">
            <p className="text-[13px] text-[#6B7280] m-0">
              Всего заметок: <strong className="text-[#1A1A1A]">{notes.length}</strong>
              {' · '}
              <span className="text-[#9CA3AF]">
                хранятся локально в браузере, синхронизация скоро
              </span>
            </p>
            <button
              type="button"
              onClick={createNew}
              className="py-2 px-3.5 bg-[#1A1A1A] text-white border-none rounded-full cursor-pointer font-[var(--font-body)] text-xs font-semibold"
            >
              + Новая заметка
            </button>
          </div>

          <div className="grid grid-cols-[260px_1fr] gap-[14px] min-h-[400px]">
            {/* Notes list */}
            <div className="bg-[#F5F6F8] rounded-[12px] p-2 max-h-[600px] overflow-y-auto">
              {notes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setActiveId(n.id)}
                  className={`block w-full py-2.5 px-3 border-none rounded-lg cursor-pointer text-left mb-0.5 font-[inherit] ${n.id === activeId ? 'bg-white' : 'bg-transparent'}`}
                >
                  <div className="text-[13px] font-semibold text-[#1A1A1A] overflow-hidden text-ellipsis whitespace-nowrap">
                    {n.title || '(без названия)'}
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-0.5">
                    {new Date(n.updated).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                </button>
              ))}
            </div>

            {/* Editor */}
            <div className="bg-[#F5F6F8] rounded-[12px] p-4 flex flex-col gap-2.5">
              {activeNote ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    aria-label="Заголовок заметки"
                    className="w-full py-2.5 px-3 bg-white border-none rounded-lg font-[var(--font-display)] text-lg font-bold text-[#1A1A1A] outline-none"
                  />
                  <textarea
                    value={editingBody}
                    onChange={(e) => setEditingBody(e.target.value)}
                    aria-label="Содержимое заметки"
                    placeholder="Введите содержимое заметки. Поддерживается plain text + Markdown..."
                    className="w-full min-h-[400px] py-3 px-[14px] bg-white border-none rounded-lg font-[var(--font-body)] text-sm leading-[1.55] text-[#1F2937] resize-y outline-none"
                  />
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[11px] text-[#9CA3AF]">
                      {editingBody.length} символов · автосохранение
                    </span>
                    <button
                      type="button"
                      onClick={deleteCurrent}
                      aria-label="Удалить заметку"
                      className="py-1.5 px-3 bg-[#F5F6F8] hover:bg-[#EFF1F4] text-[#374151] border-none rounded-full cursor-pointer font-[var(--font-body)] text-xs font-semibold transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10 px-5 text-center text-[#9CA3AF] text-[13.5px]">
                  Выберите заметку из списка или создайте новую.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
