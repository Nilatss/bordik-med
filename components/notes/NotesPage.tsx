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

import { useState, useEffect } from 'react';

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

  // Auto-save on body/title change with debounce
  useEffect(() => {
    if (!activeNote) return;
    const t = setTimeout(() => saveCurrent(), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingTitle, editingBody]);

  return (
    <div style={{ width: '100%', maxWidth: 'var(--content-max)', margin: '0 auto' }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.02em', marginBottom: 4, marginTop: 0,
        }}>
          Мои заметки
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280',
          margin: 0, lineHeight: 1.5,
        }}>
          Личные заметки — клинические наблюдения, ссылки, кастомные подсказки.
          Хранятся локально в браузере.
        </p>
      </div>

      {notes.length === 0 && !activeId ? (
        <div style={{
          padding: '40px 20px',
          background: '#F5F6F8',
          borderRadius: 14,
          textAlign: 'center',
          color: '#6B7280',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 17, fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: 8,
          }}>
            Пока нет заметок
          </div>
          <p style={{ margin: '0 auto 18px', maxWidth: 460, fontSize: 13.5, lineHeight: 1.55 }}>
            Создайте заметку для записи клинических наблюдений, ссылок,
            кастомных подсказок.
          </p>
          <button
            type="button"
            onClick={createNew}
            style={{
              padding: '10px 20px',
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Создать первую заметку
          </button>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 10, marginBottom: 14, flexWrap: 'wrap',
          }}>
            <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
              Всего заметок: <strong style={{ color: '#1A1A1A' }}>{notes.length}</strong>
              {' · '}
              <span style={{ color: '#9CA3AF' }}>
                хранятся локально в браузере, синхронизация скоро
              </span>
            </p>
            <button
              type="button"
              onClick={createNew}
              style={{
                padding: '8px 14px',
                background: '#1A1A1A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: 12, fontWeight: 600,
              }}
            >
              + Новая заметка
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: 14,
            minHeight: 400,
          }}>
            {/* Notes list */}
            <div style={{
              background: '#F5F6F8',
              borderRadius: 12,
              padding: 8,
              maxHeight: 600,
              overflowY: 'auto',
            }}>
              {notes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => setActiveId(n.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 12px',
                    background: n.id === activeId ? '#FFFFFF' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: 2,
                    fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: '#1A1A1A',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {n.title || '(без названия)'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                    {new Date(n.updated).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                </button>
              ))}
            </div>

            {/* Editor */}
            <div style={{
              background: '#F5F6F8',
              borderRadius: 12,
              padding: 16,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {activeNote ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    aria-label="Заголовок заметки"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      fontFamily: 'var(--font-display)',
                      fontSize: 18, fontWeight: 700,
                      color: '#1A1A1A',
                      outline: 'none',
                    }}
                  />
                  <textarea
                    value={editingBody}
                    onChange={(e) => setEditingBody(e.target.value)}
                    aria-label="Содержимое заметки"
                    placeholder="Введите содержимое заметки. Поддерживается plain text + Markdown..."
                    style={{
                      width: '100%',
                      minHeight: 400,
                      padding: '12px 14px',
                      background: '#FFFFFF',
                      border: 'none',
                      borderRadius: 8,
                      fontFamily: 'var(--font-body)',
                      fontSize: 14, lineHeight: 1.55,
                      color: '#1F2937',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                      {editingBody.length} символов · автосохранение
                    </span>
                    <button
                      type="button"
                      onClick={deleteCurrent}
                      aria-label="Удалить заметку"
                      style={{
                        padding: '6px 12px',
                        background: '#F5F6F8',
                        color: '#374151',
                        border: 'none',
                        borderRadius: 999,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: 12, fontWeight: 600,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
                    >
                      Удалить
                    </button>
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '40px 20px', textAlign: 'center', color: '#9CA3AF',
                  fontSize: 13.5,
                }}>
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
