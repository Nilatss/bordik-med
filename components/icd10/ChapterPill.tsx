/**
 * P1-CR-3 (Icd10Lookup split, step 2/6) — chapter filter pill button.
 *
 * Обычный F5F6F8 чип с count-бейджем; активный — синий 2563EB.
 * Hover state через inline onMouseEnter (не CSS), консистентно с
 * остальным проектом до P1-CR-4 (inline-styles → Tailwind migration).
 */
interface ChapterPillProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

export function ChapterPill({ label, count, active, onClick }: ChapterPillProps) {
  // P1-CR-4: migrated from inline style to Tailwind. Hover via `hover:` modifier.
  const stateClass = active
    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-[0_1px_2px_rgba(37,99,235,0.18)] hover:bg-[#1D4ED8]'
    : 'bg-[#F5F6F8] text-[#374151] border-transparent hover:bg-[#EFF1F4]';
  const countColor = active ? 'text-white/[0.78]' : 'text-[#9CA3AF]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-2 py-[7px] px-3 ${stateClass} border rounded-full cursor-pointer font-[var(--font-body)] text-[12px] font-semibold whitespace-nowrap transition-[background,color,border-color] duration-[180ms]`}
    >
      <span>{label}</span>
      <span className={`font-mono text-[10px] font-bold tracking-[0.02em] ${countColor}`}>
        {count}
      </span>
    </button>
  );
}
