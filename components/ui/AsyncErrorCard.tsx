'use client';

/**
 * AsyncErrorCard — the visible fallback for `useAsyncInit` failures.
 *
 * Rendered when an async initialiser (Cache Storage, IndexedDB, Supabase
 * auth, a JSON fetch) rejects. Instead of a permanently-blank screen the
 * clinician gets an explanation + a retry button. Tuned for the offline /
 * constrained environments where these APIs fail (private mode on shared
 * hospital PCs, low-RAM Android in the field).
 *
 * Bordik visual system: white card, subtle dual-shadow, mono section
 * label, slate primary button.
 */
import React from 'react';
import { useT } from '@/lib/i18n';

export function AsyncErrorCard({
  title,
  description,
  onRetry,
  compact = false,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
  /** Tighter padding for inline use inside a tab/section. */
  compact?: boolean;
}): React.JSX.Element {
  const t = useT();
  // Defaults come from the dict so the card follows the active locale;
  // callers may still pass an explicit (already-translated) title/description.
  const resolvedTitle = title ?? t('asyncError.title');
  const resolvedDescription = description ?? t('asyncError.description');
  return (
    <div
      role="alert"
      className={`bg-white border border-[#E5E7EB] rounded-[14px] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_6px_rgba(16,24,40,0.04)] text-center ${
        compact ? 'py-8 px-5' : 'py-14 px-6'
      }`}
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-3.5">
        <svg
          width={24} height={24} viewBox="0 0 24 24" fill="none"
          stroke="#B91C1C" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1={12} y1={9} x2={12} y2={13} />
          <line x1={12} y1={17} x2={12.01} y2={17} />
        </svg>
      </div>
      <div className="font-[var(--font-display)] text-[16px] font-bold text-[#1A1A1A] mb-1.5 tracking-[-0.01em]">
        {resolvedTitle}
      </div>
      <p className="mx-auto mb-5 max-w-[420px] text-[13px] leading-[1.55] text-[#6B7280]">
        {resolvedDescription}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 py-2.5 px-5 bg-[#0F172A] hover:bg-[#1E293B] text-white border-0 rounded-full cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-colors"
      >
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
        {t('asyncError.retry')}
      </button>
    </div>
  );
}
