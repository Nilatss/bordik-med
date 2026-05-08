'use client';
/**
 * P1-CR-3 (ProfilePage split, step 3/4) — inline editable display name.
 *
 * Click → focuses input, Enter / blur commits, Escape отменяет.
 * Edit mode: серый pill input. View mode: button с edit-icon на hover.
 *
 * onSave вызывается только если значение изменилось и не пустое после
 * trim — защита от случайных commit'ов с пустотой.
 */
import { useState, useRef, useEffect } from 'react';

interface EditableNameProps {
  value: string;
  onSave: (v: string) => void;
}

export function EditableName({ value, onSave }: EditableNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [isEditing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setIsEditing(false); }
        }}
        style={{
          fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
          color: '#1A1A1A',
          background: '#DFE2E8',
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          marginBottom: 6,
          textAlign: 'center',
          outline: 'none',
          minWidth: 180,
          maxWidth: '80%',
        }}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setIsEditing(true); }}
      style={{
        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
        color: '#1A1A1A', marginBottom: 6,
        background: 'transparent', border: 'none', padding: '2px 8px',
        borderRadius: 6, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#EEF0F3'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {value}
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    </button>
  );
}
