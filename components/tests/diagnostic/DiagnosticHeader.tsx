/**
 * DiagnosticHeader — back-button + title block для DiagnosticTest.
 *
 * P1-CR-3 step 3/6 — extracted from DiagnosticTest.tsx.
 */
export function DiagnosticHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-[18px]">
      <button
        onClick={onClose}
        aria-label="Закрыть"
        className="w-9 h-9 rounded-[10px] bg-[#F5F6F8] hover:bg-[#E8E9ED] text-[#1A1A1A] border-none cursor-pointer inline-flex items-center justify-center transition-colors duration-150"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
      <div className="flex-1">
        <p className="m-0 font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em]">
          Диагностика
        </p>
        <h2 className="mt-0.5 mb-0 mx-0 font-[var(--font-display)] text-[22px] font-bold text-[#1A1A1A] tracking-[-0.02em] leading-[1.2]">
          Адаптивный тест уровня знаний
        </h2>
      </div>
    </div>
  );
}
