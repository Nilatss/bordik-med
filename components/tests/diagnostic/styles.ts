/**
 * Shared styles for the diagnostic test components.
 *
 * P1-CR-3 step 4/6 — extracted from DiagnosticTest.tsx.
 * P1-CR-4 batch 3 — migrated inline-style objects → Tailwind class strings.
 *
 * `fadeProps` остаётся CSS object для framer-motion (нужен MotionStyle).
 * Все остальные — Tailwind class strings, потребители передают их в className=.
 */

export const fadeProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] as const },
};

export const panelClass =
  'bg-white border border-[#F0F1F5] rounded-[18px] p-[clamp(20px,4vw,28px)]';

export const loadingTextClass =
  'mt-3 font-[var(--font-body)] text-[13px] text-[#6B7280] text-center';

export const primaryBtnClass =
  'py-2.5 px-5 rounded-[10px] bg-[#2563EB] hover:bg-[#1E40AF] text-white border-none cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms]';

export const secondaryBtnClass =
  'py-2.5 px-4 rounded-[10px] bg-transparent text-[#6B7280] border-none cursor-pointer font-[var(--font-body)] text-[13px] font-semibold';

export const pillClass =
  'inline-flex items-center py-1 px-2.5 rounded-full bg-white text-[#1A1A1A] font-[var(--font-mono)] text-[10px] font-bold tracking-[0.06em] uppercase border border-[#E5E7EB]';
