/**
 * P1-CR-3 (ProfilePage split, step 2/4) — labelled row container.
 *
 * Layout helper для profile-info рядов: icon + label слева,
 * содержимое (input / dropdown / link) справа.
 *
 * Использует встроенный ICONS-словарь — простые inline SVGs (mail,
 * book, globe, briefcase, language, target). Если icon-key неизвестен,
 * рендерит пустой span (graceful degradation, не throw).
 */
import type { ReactNode } from 'react';

const ICONS: Record<string, ReactNode> = {
  mail: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  book: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  ),
  globe: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 010 20 15.3 15.3 0 010-20z" />
    </svg>
  ),
  briefcase: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  ),
  language: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l6 6" />
      <path d="M4 14l6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="M22 22l-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  ),
  target: (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
};

interface RowProps {
  icon: string;
  label: string;
  children: ReactNode;
}

export function Row({ icon, label, children }: RowProps) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 min-h-[54px] bg-white rounded-[10px]">
      <span className="text-[#888] flex shrink-0">{ICONS[icon]}</span>
      <span className="font-[var(--font-body)] text-[11px] text-[#888] shrink-0 min-w-[100px]">
        {label}
      </span>
      <div className="flex-1 min-w-0 flex justify-end">
        <div className="w-full max-w-[240px]">
          {children}
        </div>
      </div>
    </div>
  );
}
