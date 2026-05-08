'use client';
/**
 * P1-CR-3 (ProfilePage split, step 4/4) — email input row с валидацией.
 *
 * Edit-flow аналогичен EditableName, но с валидацией email-формата
 * (isValidEmail из @/lib/i18n) и error-state (red icon + красный bg).
 *
 * Принимает `t`-функцию из i18n (а не из useT()) — даёт caller'у
 * контроль над namespace + не требует нового provider context'а в файле.
 *
 * View-mode — button с placeholder text если value пусто
 * (`profile.chooseEmail`), edit-icon на hover.
 */
import { useState, useRef, useEffect } from 'react';
import { isValidEmail } from '@/lib/i18n';
import { Row } from './Row';

interface EmailRowProps {
  value: string;
  onSave: (v: string) => void;
  t: (k: string) => string;
}

export function EmailRow({ value, onSave, t }: EmailRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [isEditing]);

  const isValid = draft === '' || isValidEmail(draft);
  const showError = touched && !isValid;

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === '' || isValidEmail(trimmed)) {
      if (trimmed !== value) onSave(trimmed);
      setIsEditing(false);
      setTouched(false);
    } else {
      setTouched(true);
    }
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
    setTouched(false);
  };

  if (isEditing) {
    return (
      <Row icon="mail" label={t('profile.email')}>
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            type="email"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setTouched(true); }}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); commit(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') cancel();
            }}
            placeholder="name@example.com"
            aria-invalid={showError || undefined}
            title={showError ? t('profile.invalidEmail') : undefined}
            style={{
              width: '100%',
              height: 38,
              padding: showError ? '8px 36px 8px 14px' : '8px 14px',
              background: showError ? '#FDF3F3' : (focused ? '#DFE2E8' : '#E8EAEF'),
              border: 'none',
              borderRadius: 8,
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
              color: showError ? '#9F4848' : '#1A1A1A',
              outline: 'none',
              textAlign: 'left',
              transition: 'background 180ms, color 180ms, padding 180ms',
            }}
          />
          {showError && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18, height: 18,
                color: '#C97878',
                pointerEvents: 'none',
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
          )}
        </div>
      </Row>
    );
  }

  return (
    <Row icon="mail" label={t('profile.email')}>
      <button
        onClick={() => { setDraft(value); setIsEditing(true); }}
        style={{
          width: '100%',
          height: 38,
          padding: '8px 12px 8px 14px',
          background: '#EEF0F3',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
          color: value ? '#1A1A1A' : '#9CA3AF',
          textAlign: 'left',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#E8EAEF'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#EEF0F3'; }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || t('profile.chooseEmail')}
        </span>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </button>
    </Row>
  );
}
