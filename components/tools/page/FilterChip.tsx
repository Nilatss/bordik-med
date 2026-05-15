/**
 * FilterChip — selected-filter pill with X-remove button.
 * Used in the active-filters strip beneath the search bar.
 *
 * P1-CR-3 step 5/6 — extracted from ToolsPage.tsx.
 */
import { useT } from '@/lib/i18n';

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const t = useT();
  return (
    <span className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-[5px] bg-[#EEF2FF] text-[#1E3A8A] border-none rounded-full font-[var(--font-body)] text-[12px] font-medium">
      {label}
      <button
        onClick={onRemove}
        className="bg-transparent hover:bg-[#C7D2FE] border-none p-0 cursor-pointer inline-flex items-center justify-center text-[#4F46E5] w-4 h-4 rounded-full transition-colors duration-150"
        aria-label={t('tools.remove')}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/>
        </svg>
      </button>
    </span>
  );
}
