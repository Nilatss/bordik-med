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
        <div className="relative">
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
            className={`w-full h-[38px] ${showError ? 'pl-3.5 pr-9' : 'px-3.5'} py-2 border-none rounded-lg font-[var(--font-body)] text-[13px] font-medium outline-none text-left transition-[background,color,padding] duration-[180ms] ${
              showError
                ? 'bg-[#FDF3F3] text-[#9F4848]'
                : focused
                  ? 'bg-[#DFE2E8] text-[#1A1A1A]'
                  : 'bg-[#E8EAEF] text-[#1A1A1A]'
            }`}
          />
          {showError && (
            <span
              aria-hidden
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-[18px] h-[18px] text-[#C97878] pointer-events-none"
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
        className={`w-full h-[38px] py-2 pr-3 pl-3.5 bg-[#EEF0F3] hover:bg-[#E8EAEF] border-none rounded-lg cursor-pointer flex items-center gap-2 font-[var(--font-body)] text-[13px] font-medium text-left transition-colors duration-150 ${value ? 'text-[#1A1A1A]' : 'text-[#9CA3AF]'}`}
      >
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {value || t('profile.chooseEmail')}
        </span>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      </button>
    </Row>
  );
}
